"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import { logoutUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

type User = { id: string; email: string; role: string; full_name: string };
type Badge = { label: string; obtained_at: string };

type GuideProfile = {
  user_id: string;
  full_name: string;
  guide_type: string | null;
  bio: string | null;
  country: string | null;
  language: string | null;
  photo: string | null;
  zone: string | null;
  specialties: string[] | null;
  languages_spoken: string[] | null;
  years_experience: number | null;
  status: string;
  sustainability_score: number | null;
  score_questionnaire: number | null;
  score_reservations: number;
  score_feedbacks: number;
  profile_completion: number;
  is_onboarded: boolean;
  skills_activities: string[];
  certifications: { label: string; proof: string; _id?: string }[];
  badges: Badge[];
  feedback_received: number;
  reservations_handled: number;
};

const BADGE_CONFIG = [
  { label: "Guide Éco-Certifié", icon: "verified", description: "Onboarding complété" },
  { label: "Guide Ambassadeur Éco-Voyage", icon: "stars", description: "Score ≥ 80%" },
  { label: "Guide Expert", icon: "psychology", description: "10 réservations gérées" },
  { label: "Formateur Durable", icon: "school", description: "5 évaluations reçues" },
];

function getScoreLabel(score: number | null) {
  if (score === null) return "—";
  if (score >= 80) return "Guide Ambassadeur";
  if (score >= 60) return "Guide Expert";
  if (score >= 40) return "Guide Engagé";
  return "Guide en Développement";
}

function getScoreColor(score: number | null) {
  if (score === null) return "text-slate-400";
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-primary";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

function getBarColor(score: number | null) {
  if (score === null) return "bg-slate-300";
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-primary";
  if (score >= 40) return "bg-orange-400";
  return "bg-red-400";
}

function ScoreBreakdown({ profile }: { profile: GuideProfile }) {
  const components = [
    { label: "Questionnaire", weight: "40%", value: profile.score_questionnaire, color: "bg-green-500" },
    { label: "Réservations", weight: "40%", value: profile.score_reservations, color: "bg-blue-500" },
    { label: "Feedbacks", weight: "20%", value: profile.score_feedbacks, color: "bg-orange-400" },
  ];

  return (
    <div className="mt-4 space-y-2.5">
      {components.map((c) => (
        <div key={c.label}>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600">{c.label}</span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{c.weight}</span>
            </div>
            <span className="text-xs font-extrabold text-slate-700">
              {c.value !== null && c.value !== undefined ? `${c.value}%` : "—"}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${c.color} rounded-full transition-all duration-700`} style={{ width: `${c.value ?? 0}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GuideDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<GuideProfile | null>(null);
  const [activeItem, setActiveItem] = useState("Tableau de bord");
  const [showScoreDetail, setShowScoreDetail] = useState(false);

  const navItems = [
    { label: "Tableau de bord", icon: "dashboard" },
    { label: "Mes Circuits", icon: "map" },
    { label: "Réservations", icon: "event_available" },
    { label: "Mes Avis", icon: "star" },
    { label: "Certifications", icon: "verified" },
    { label: "Paramètres", icon: "settings" },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");
    if (!storedUser || !token) { router.push("/auth/login"); return; }

    try {
      const parsedUser: User = JSON.parse(storedUser);
      if (parsedUser.role !== "guide") { router.push("/auth/login"); return; }
      setUser(parsedUser);

      apiFetch<GuideProfile>("/guide/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((p) => {
          setProfile(p);
          if (!p?.is_onboarded) router.push("/onboarding/guide");
        })
        .catch(() => router.push("/onboarding/guide"));
    } catch {
      router.push("/auth/login");
    }
  }, [router]);

  async function handleLogout() {
    const token = localStorage.getItem("access_token") || "";
    try { if (token) await logoutUser(token); } catch {}
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  }

  const score = profile?.sustainability_score ?? null;
  const scoreWidth = score !== null ? `${score}%` : "0%";
  const obtainedBadgeLabels = new Set((profile?.badges ?? []).map((b) => b.label));

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="flex min-h-screen">

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className="w-72 bg-white dark:bg-slate-900 border-r border-primary/10 flex flex-col fixed h-full">
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-10">
              <Leaf className="text-primary w-8 h-8" />
              <h1 className="text-xl font-extrabold tracking-tight">Éco-Voyage</h1>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setActiveItem(item.label)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeItem === item.label
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <span className="material-symbols-outlined">logout</span>
                <span>Déconnexion</span>
              </button>
            </nav>

            {profile && (
              <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profil complété</p>
                  <p className="text-xs font-extrabold text-primary">{profile.profile_completion}%</p>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${profile.profile_completion}%` }} />
                </div>
              </div>
            )}

            <button
              onClick={() => router.push("/questionnaire/guide")}
              className="mt-4 w-full bg-primary hover:bg-primary/90 text-slate-900 font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">quiz</span>
              {score === null ? "Passer l'évaluation" : "Voir mon score"}
            </button>
          </div>
        </aside>

        {/* ── Main ────────────────────────────────────────────────────────── */}
        <main className="flex-1 ml-72">

          <header className="h-24 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-primary/10 px-10 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-12 shrink-0">
              <h2 className="text-2xl font-bold whitespace-nowrap">
                Bonjour, {profile?.full_name || user?.full_name || "Guide"} 👋
              </h2>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-5 py-2 gap-2 whitespace-nowrap">
                <span className="material-symbols-outlined text-primary text-base">verified_user</span>
                <span className="text-sm font-semibold">
                  {score !== null ? getScoreLabel(score) : "Guide — Évaluation en attente"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 flex-1 justify-end">
              <div className="relative w-full max-w-md">
                <input
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/50"
                  placeholder="Rechercher un circuit, une zone…"
                />
                <span className="material-symbols-outlined absolute left-4 top-3 text-slate-400 text-xl">search</span>
              </div>
              <button className="size-11 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary transition-colors shrink-0">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-700 shrink-0" />
              <button onClick={() => router.push("/profile/guide")}
                className="size-11 rounded-full bg-slate-200 border-2 border-primary overflow-hidden shrink-0 hover:opacity-80 transition-opacity" title="Voir mon profil">
                {profile?.photo ? (
                  <img src={profile.photo} alt="Photo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/20">
                    <span className="material-symbols-outlined text-primary text-xl">person</span>
                  </div>
                )}
              </button>
            </div>
          </header>

          <div className="p-8">

            {/* Bannière questionnaire non complété */}
            {score === null && (
              <div className="mb-6 p-5 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl">quiz</span>
                  <div>
                    <p className="font-bold text-slate-800">Passez votre évaluation de guide éco-responsable</p>
                    <p className="text-sm text-slate-500 font-medium">Obtenez votre score et valorisez votre profil auprès des voyageurs.</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/questionnaire/guide")}
                  className="px-5 py-2.5 bg-primary text-slate-900 font-bold rounded-xl text-sm shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
                >
                  Commencer →
                </button>
              </div>
            )}

            {/* ── Stats Grid ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

              {/* Score durabilité */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/10 flex flex-col justify-between lg:col-span-2">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Score de durabilité</p>
                    <h3 className={`text-3xl font-extrabold mt-1 ${getScoreColor(score)}`}>
                      {score !== null ? score : "—"}
                      {score !== null && <span className="text-slate-400 text-lg font-normal">/100</span>}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/20 p-2 rounded-lg text-primary">
                      <span className="material-symbols-outlined">analytics</span>
                    </div>
                    <button
                      onClick={() => setShowScoreDetail((v) => !v)}
                      className="text-xs text-slate-400 hover:text-primary font-bold transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showScoreDetail ? "expand_less" : "expand_more"}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${getBarColor(score)} rounded-full transition-all duration-1000`} style={{ width: scoreWidth }} />
                </div>
                <p className="text-xs font-bold mt-2" style={{ color: score !== null ? (score >= 60 ? "#22c55e" : "#f97316") : "#94a3b8" }}>
                  {score !== null ? getScoreLabel(score) : "Évaluation non complétée"}
                </p>
                {showScoreDetail && profile && <ScoreBreakdown profile={profile} />}
              </div>

              {/* Réservations gérées */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/10 flex flex-col self-start">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Réservations gérées</p>
                    <h3 className="text-3xl font-extrabold mt-1">{profile?.reservations_handled ?? 0}</h3>
                  </div>
                  <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
                    <span className="material-symbols-outlined">event_available</span>
                  </div>
                </div>
              </div>

              {/* Avis reçus */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/10 flex flex-col self-start">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Avis reçus</p>
                    <h3 className="text-3xl font-extrabold mt-1">{profile?.feedback_received ?? 0}</h3>
                  </div>
                  <div className="bg-green-500/10 p-2 rounded-lg text-green-500">
                    <span className="material-symbols-outlined">star</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Circuits + Badges ─────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Circuits / Spécialités */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Mes Spécialités & Circuits</h3>
                  <a className="text-primary font-bold text-sm hover:underline" href="#">Voir tout</a>
                </div>
                <div className="space-y-4">
                  {/* Zone d'activité card */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-primary/5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Zone d'activité</p>
                        <p className="text-lg font-bold text-slate-900">{profile?.zone ?? "Non renseignée"}</p>
                        <p className="text-sm text-slate-500 mt-1">
                          {profile?.guide_type === "local" ? "Guide Local" : profile?.guide_type === "professionnel" ? "Guide Professionnel" : "—"}
                          {profile?.years_experience !== null && profile?.years_experience !== undefined
                            ? ` • ${profile.years_experience} an${profile.years_experience > 1 ? "s" : ""} d'expérience`
                            : ""}
                        </p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        profile?.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {profile?.status === "active" ? "Actif" : "En attente"}
                      </span>
                    </div>
                  </div>

                  {/* Spécialités */}
                  {(profile?.specialties?.length ?? 0) > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-primary/5">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Spécialités</p>
                      <div className="flex flex-wrap gap-2">
                        {profile!.specialties!.map((s) => (
                          <span key={s} className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {(profile?.certifications?.length ?? 0) > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-primary/5">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Certifications</p>
                      <div className="space-y-2">
                        {profile!.certifications.map((cert) => (
                          <div key={cert.label} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <span className="material-symbols-outlined text-primary text-xl">verified</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{cert.label}</span>
                            {cert.proof && (
                              <button type="button" onClick={() => {
                                if (cert.proof.startsWith("data:")) {
                                  const w = window.open(); w?.document.write(`<img src="${cert.proof}" style="max-width:100%">`);
                                } else { window.open(cert.proof, "_blank"); }
                              }} className="ml-auto text-xs text-primary font-bold flex items-center gap-1 hover:underline">
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                Justificatif
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Langues */}
                  {(profile?.languages_spoken?.length ?? 0) > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-primary/5">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Langues parlées</p>
                      <div className="flex flex-wrap gap-2">
                        {profile!.languages_spoken!.map((l) => (
                          <span key={l} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-full uppercase">
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div>
                <h3 className="text-xl font-bold mb-6">Mes Badges</h3>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-primary/10">
                  <div className="grid grid-cols-2 gap-4">
                    {BADGE_CONFIG.map((config) => {
                      const obtained = obtainedBadgeLabels.has(config.label);
                      const obtainedData = profile?.badges.find((b) => b.label === config.label);
                      return (
                        <div
                          key={config.label}
                          title={obtained && obtainedData
                            ? `Obtenu le ${new Date(obtainedData.obtained_at).toLocaleDateString("fr-FR")}`
                            : config.description}
                          className={`flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all
                            ${obtained
                              ? "bg-slate-50 dark:bg-slate-800 border-primary/20"
                              : "bg-slate-100/50 dark:bg-slate-800/50 border-dashed border-slate-200 dark:border-slate-700"
                            }`}
                        >
                          <div className="size-16 flex items-center justify-center mb-2">
                            <span
                              className={`material-symbols-outlined text-4xl transition-all ${obtained ? "text-primary" : "text-slate-300"}`}
                              style={obtained ? { fontVariationSettings: '"FILL" 1' } : {}}
                            >
                              {config.icon}
                            </span>
                          </div>
                          <p className={`text-xs font-bold ${obtained ? "text-slate-700" : "text-slate-300"}`}>{config.label}</p>
                          <p className={`text-[10px] font-bold uppercase mt-1 ${obtained ? "text-green-500" : "text-slate-300"}`}>
                            {obtained ? "Débloqué" : "Verrouillé"}
                          </p>
                          {!obtained && <p className="text-[9px] text-slate-300 mt-1 italic">{config.description}</p>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{profile?.feedback_received ?? 0}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Avis</p>
                    </div>
                    <div>
                      <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{profile?.years_experience ?? 0}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Années</p>
                    </div>
                    <div>
                      <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{profile?.reservations_handled ?? 0}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Circuits</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
