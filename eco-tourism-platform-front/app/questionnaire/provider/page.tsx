"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, ChevronRight, ChevronLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Answer = {
  id: string;
  answer_text: string;
  score: number;
  answer_order: number;
};

type Question = {
  id: string;
  question_text: string;
  question_order: number;
  category: { name: string };
  answers: Answer[];
};

type Questionnaire = {
  id: string;
  name: string;
  description: string;
  questions: Question[];
};

type ScoreResult = {
  score_percentage: number;
  environmental_score: number;
  social_score: number;
  economic_score: number;
  profile: string;
  message: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  environmental: "text-green-600 bg-green-100",
  social: "text-blue-600 bg-blue-100",
  economic: "text-orange-600 bg-orange-100",
};

const CATEGORY_LABELS: Record<string, string> = {
  environmental: "Environnemental",
  social: "Social",
  economic: "Économique",
};

function getScoreProfile(score: number): string {
  if (score >= 80) return "Prestataire Ambassadeur";
  if (score >= 60) return "Prestataire Engagé";
  if (score >= 40) return "Prestataire Sensible";
  return "Prestataire en Développement";
}

function ScoreCard({ result }: { result: ScoreResult }) {
  const router = useRouter();
  const score = result.score_percentage;

  const getColor = (s: number) =>
    s >= 80 ? "text-green-600" : s >= 60 ? "text-emerald-600" : s >= 40 ? "text-orange-500" : "text-red-500";

  const getBarColor = (s: number) =>
    s >= 80 ? "bg-green-500" : s >= 60 ? "bg-emerald-500" : s >= 40 ? "bg-orange-400" : "bg-red-400";

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-8">
        <div className="w-44 h-44 rounded-full border-8 border-emerald-200 flex flex-col items-center justify-center bg-white shadow-xl">
          <span className={`text-5xl font-black ${getColor(score)}`}>{score}%</span>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Score éco</span>
        </div>
        <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
          <Leaf className="w-6 h-6 text-white" />
        </div>
      </div>

      <h2 className="text-2xl font-extrabold text-slate-900 mb-1">{result.profile}</h2>
      <p className="text-slate-500 max-w-md mb-8 font-medium">{result.message || "Votre profil de durabilité a été évalué."}</p>

      <div className="w-full max-w-md space-y-4 mb-8">
        {[
          { label: "Environnemental", value: result.environmental_score, color: "bg-green-500" },
          { label: "Social", value: result.social_score, color: "bg-blue-500" },
          { label: "Économique", value: result.economic_score, color: "bg-orange-400" },
        ].map((sub) => (
          <div key={sub.label}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-bold text-slate-700">{sub.label}</span>
              <span className="text-sm font-bold text-slate-900">{sub.value}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${sub.color} rounded-full transition-all duration-1000`}
                style={{ width: `${sub.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="w-full max-w-md p-5 bg-emerald-50 rounded-2xl border border-emerald-200 mb-8 text-left">
        <p className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2">
          <Leaf size={14} className="text-emerald-600" /> Ce score influence votre classement :
        </p>
        <ul className="text-sm text-emerald-700 space-y-1 font-medium">
          <li>• Visibilité dans les résultats de recherche</li>
          <li>• Badge et niveau affiché sur votre profil public</li>
          <li>• Pondération avec réservations (30%) et avis (20%)</li>
        </ul>
      </div>

      <button onClick={() => router.push("/dashboard/provider")}
        className="w-full max-w-md py-4 bg-emerald-500 text-white font-extrabold rounded-2xl shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
        <Leaf size={18} /> Mon tableau de bord
      </button>
    </div>
  );
}

export default function ProviderQuestionnairePage() {
  const router = useRouter();
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);

  useEffect(() => {
    async function init() {
      const token = localStorage.getItem("access_token");
      const user = JSON.parse(localStorage.getItem("user") ?? "{}");
      if (!token || user.role !== "provider") { router.push("/auth/login"); return; }

      let attempt: any = null;
      try {
        attempt = await apiFetch<any>("/questionnaire/my-attempt", {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}

      let q: Questionnaire | null = null;
      try {
        q = await apiFetch<Questionnaire>("/questionnaire/active?type=provider");
        q.questions.sort((a, b) => a.question_order - b.question_order);
        q.questions.forEach((question) => question.answers.sort((a, b) => a.answer_order - b.answer_order));
      } catch {
        router.push("/dashboard/provider");
        return;
      }

      if (attempt?.score_percentage !== null && attempt?.score_percentage !== undefined) {
        setResult({
          score_percentage: attempt.score_percentage,
          environmental_score: attempt.environmental_score ?? 0,
          social_score: attempt.social_score ?? 0,
          economic_score: attempt.economic_score ?? 0,
          profile: getScoreProfile(attempt.score_percentage),
          message: "",
        });
      }
      if (q) setQuestionnaire(q);
      setLoading(false);
    }
    init();
  }, [router]);

  const getToken = () => localStorage.getItem("access_token") || "";

  const handleAnswer = (questionId: string, answerId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerId }));
    setTimeout(() => {
      if (currentQuestion < (questionnaire?.questions.length ?? 1) - 1) {
        setCurrentQuestion((c) => c + 1);
      }
    }, 400);
  };

  const handleSubmit = async () => {
    if (!questionnaire) return;
    setSubmitting(true);
    try {
      const answers = Object.entries(selectedAnswers).map(([question_id, answer_id]) => ({
        question_id,
        answer_id,
      }));

      const res = await apiFetch<ScoreResult>("/questionnaire/submit", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          questionnaire_id: questionnaire.id,
          target_type: "provider",
          answers,
        }),
      });

      setResult(res);
    } catch (err: any) {
      alert(err.message || "Erreur lors de la soumission.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-slate-500 font-medium">Chargement du questionnaire…</p>
        </div>
      </div>
    );
  }

  if (!questionnaire) return null;

  const totalQuestions = questionnaire.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progress = (answeredCount / totalQuestions) * 100;
  const currentQ = questionnaire.questions[currentQuestion];
  const allAnswered = answeredCount === totalQuestions;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="text-emerald-500 w-7 h-7" />
            <span className="text-lg font-extrabold tracking-tight">Questionnaire de durabilité</span>
          </div>
          {!result && (
            <span className="text-sm font-semibold text-slate-500">{answeredCount}/{totalQuestions} réponses</span>
          )}
        </div>
      </header>

      {!result && (
        <div className="h-1.5 bg-slate-100">
          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      )}

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          {result ? (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12">
              <ScoreCard result={result} />
            </div>
          ) : (
            <>
              {currentQuestion === 0 && answeredCount === 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6">
                  <p className="text-sm font-medium text-emerald-800 leading-relaxed">
                    <strong>🌿 Évaluez votre impact</strong> en répondant honnêtement aux questions suivantes sur vos pratiques professionnelles.
                    Votre score influencera votre visibilité sur la plateforme.
                  </p>
                </div>
              )}

              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-6">
                <div className="p-6 border-b border-slate-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
                      {currentQuestion + 1}
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[currentQ.category?.name ?? "environmental"] ?? "text-emerald-600 bg-emerald-100"}`}>
                      {CATEGORY_LABELS[currentQ.category?.name ?? ""] ?? currentQ.category?.name ?? "Général"}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 leading-snug">{currentQ.question_text}</p>
                </div>

                <div className="p-4 space-y-3">
                  {currentQ.answers.map((answer, idx) => {
                    const selected = selectedAnswers[currentQ.id] === answer.id;
                    const letters = ["A", "B", "C", "D"];
                    return (
                      <button key={answer.id} type="button" onClick={() => handleAnswer(currentQ.id, answer.id)}
                        className={`w-full flex items-start gap-4 px-5 py-4 rounded-2xl text-left font-semibold text-sm transition-all border-2
                          ${selected ? "bg-emerald-50 border-emerald-400 text-slate-900" : "border-slate-100 text-slate-700 hover:border-emerald-200 hover:bg-slate-50"}`}>
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0 mt-0.5
                          ${selected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"}`}>
                          {letters[idx]}
                        </span>
                        <span className="leading-relaxed">{answer.answer_text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <button type="button" disabled={currentQuestion === 0}
                  onClick={() => setCurrentQuestion((c) => c - 1)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:border-slate-300 disabled:opacity-30 transition-all">
                  <ChevronLeft className="w-4 h-4" /> Précédent
                </button>

                <div className="flex gap-1.5">
                  {questionnaire.questions.map((q, i) => {
                    const answered = !!selectedAnswers[q.id];
                    const isCurrent = i === currentQuestion;
                    return (
                      <button key={i} onClick={() => setCurrentQuestion(i)}
                        className={`h-2 rounded-full transition-all ${isCurrent ? "w-6 bg-emerald-500" : answered ? "w-3 bg-emerald-300" : "w-3 bg-slate-200"}`} />
                    );
                  })}
                </div>

                {currentQuestion < totalQuestions - 1 ? (
                  <button type="button" onClick={() => setCurrentQuestion((c) => c + 1)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 text-white font-extrabold text-sm shadow-lg hover:-translate-y-0.5 transition-all">
                    Suivant <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={!allAnswered || submitting}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-extrabold text-sm shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">
                    {submitting ? "Calcul..." : <><Leaf size={16} /> Voir mon score</>}
                  </button>
                )}
              </div>

              {!allAnswered && currentQuestion === totalQuestions - 1 && (
                <p className="text-center text-xs text-slate-400 font-medium mt-4">
                  {totalQuestions - answeredCount} question(s) sans réponse — revenez en arrière pour compléter.
                </p>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
