"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Leaf, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { apiFetch } from "@/lib/api";

// ─── Data ─────────────────────────────────────────────────────────────────────

const GUIDE_TYPES = [
  { value: "local", label: "Guide local", icon: "location_on", desc: "Connaissance approfondie d'une région spécifique" },
  { value: "professionnel", label: "Guide professionnel", icon: "badge", desc: "Certification officielle et expérience diversifiée" },
];

const SPECIALTIES = [
  { value: "randonnee", label: "Randonnée", icon: "hiking" },
  { value: "ornithologie", label: "Ornithologie", icon: "flutter_dash" },
  { value: "photographie", label: "Photographie", icon: "photo_camera" },
  { value: "culture", label: "Culture & Patrimoine", icon: "museum" },
  { value: "gastronomie", label: "Gastronomie", icon: "restaurant" },
  { value: "kayak", label: "Kayak & Sports nautiques", icon: "kayaking" },
  { value: "speleologie", label: "Spéléologie", icon: "explore" },
  { value: "vtt", label: "VTT & Cyclisme", icon: "directions_bike" },
  { value: "safari", label: "Safari photo", icon: "camera_alt" },
  { value: "astronomie", label: "Astronomie", icon: "nights_stay" },
];

const LANGUAGES = [
  { value: "fr", label: "Français" },
  { value: "ar", label: "Arabe" },
  { value: "en", label: "Anglais" },
  { value: "es", label: "Espagnol" },
  { value: "de", label: "Allemand" },
  { value: "it", label: "Italien" },
];

const LANDSCAPES = [
  { value: "mountain", label: "Montagne", icon: "terrain" },
  { value: "desert", label: "Désert", icon: "sunny" },
  { value: "sea", label: "Mer & Côte", icon: "beach_access" },
  { value: "forest", label: "Forêt", icon: "forest" },
  { value: "oasis", label: "Oasis", icon: "local_florist" },
  { value: "village", label: "Villages", icon: "holiday_village" },
  { value: "archaeology", label: "Sites archéologiques", icon: "account_balance" },
  { value: "lake", label: "Lacs & Zones humides", icon: "water" },
];

const CERTIFICATIONS = [
  "Guide certifié Éco-Voyage",
  "Premiers secours (PSC1)",
  "Guide de montagne agréé",
  "Formation éco-tourisme",
  "Brevet de guide touristique",
  "Certification environnement",
];

// ─── Helper components ─────────────────────────────────────────────────────────

function PhotoUpload({ photo, onChange }: { photo: string; onChange: (v: string) => void }) {
  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 400;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      onChange(canvas.toDataURL("image/jpeg", 0.7));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-primary/20 overflow-hidden flex items-center justify-center">
          {photo ? (
            <img src={photo} alt="Photo de profil" className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-slate-300 text-4xl">person</span>
          )}
        </div>
        <label
          htmlFor="guide-photo-upload"
          className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-slate-900 text-base">photo_camera</span>
        </label>
        <input id="guide-photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
      </div>
      <p className="text-xs text-slate-400 font-medium">Photo de profil (optionnel)</p>
    </div>
  );
}

function MultiChipSelect({
  options, selected, onToggle,
}: {
  options: { value: string; label: string; icon?: string }[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border-2
              ${active ? "bg-primary border-primary text-slate-900" : "border-slate-200 text-slate-600 hover:border-primary/50 bg-white"}`}
          >
            {opt.icon && <span className="material-symbols-outlined text-base">{opt.icon}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function StepIdentity({ data, setData }: any) {
  return (
    <div className="space-y-5">
      <PhotoUpload photo={data.photo} onChange={(v) => setData({ ...data, photo: v })} />

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-slate-700 ml-1">Nom complet *</label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
          <input
            className="w-full pl-11 pr-4 py-3.5 bg-surface-container border-none rounded-xl focus:ring-2 focus:ring-primary text-slate-900 placeholder:text-slate-400 font-medium"
            value={data.full_name}
            onChange={(e) => setData({ ...data, full_name: e.target.value })}
            placeholder="Ahmed Ben Ali"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-slate-700 ml-1">Bio (optionnel)</label>
        <textarea
          className="w-full px-4 py-3.5 bg-surface-container border-none rounded-xl focus:ring-2 focus:ring-primary text-slate-900 placeholder:text-slate-400 font-medium resize-none"
          value={data.bio}
          onChange={(e) => setData({ ...data, bio: e.target.value })}
          placeholder="Guide passionné par l'écotourisme et la nature tunisienne…"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 ml-1">Pays *</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">public</span>
            <select
              className="w-full pl-11 pr-4 py-3.5 bg-surface-container border-none rounded-xl focus:ring-2 focus:ring-primary text-slate-900 font-medium appearance-none"
              value={data.country}
              onChange={(e) => setData({ ...data, country: e.target.value })}
            >
              <option value="">Sélectionner</option>
              <option value="TN">Tunisie</option>
              <option value="MA">Maroc</option>
              <option value="DZ">Algérie</option>
              <option value="FR">France</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 ml-1">Langue *</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">translate</span>
            <select
              className="w-full pl-11 pr-4 py-3.5 bg-surface-container border-none rounded-xl focus:ring-2 focus:ring-primary text-slate-900 font-medium appearance-none"
              value={data.language}
              onChange={(e) => setData({ ...data, language: e.target.value })}
            >
              <option value="">Sélectionner</option>
              <option value="fr">Français</option>
              <option value="ar">Arabe</option>
              <option value="en">Anglais</option>
              <option value="es">Espagnol</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-slate-700 ml-1">Zone d'activité *</label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">location_on</span>
          <input
            className="w-full pl-11 pr-4 py-3.5 bg-surface-container border-none rounded-xl focus:ring-2 focus:ring-primary text-slate-900 placeholder:text-slate-400 font-medium"
            value={data.zone}
            onChange={(e) => setData({ ...data, zone: e.target.value })}
            placeholder="Ex: Sahara, Djerba, Aïn Draham…"
          />
        </div>
      </div>
    </div>
  );
}

function StepGuideType({ data, setData }: any) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 font-medium">Quel type de guide êtes-vous ?</p>
      <div className="grid grid-cols-1 gap-4">
        {GUIDE_TYPES.map((t) => {
          const active = data.guide_type === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setData({ ...data, guide_type: t.value })}
              className={`flex items-start gap-4 px-5 py-5 rounded-2xl border-2 transition-all text-left
                ${active ? "bg-primary/10 border-primary" : "border-slate-100 hover:border-primary/30 bg-white"}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                ${active ? "bg-primary text-slate-900" : "bg-slate-100 text-slate-500"}`}>
                <span className="material-symbols-outlined text-2xl">{t.icon}</span>
              </div>
              <div>
                <p className="font-extrabold text-slate-900 mb-0.5">{t.label}</p>
                <p className="text-sm text-slate-500">{t.desc}</p>
              </div>
              {active && (
                <div className="ml-auto flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-slate-900" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepSpecialties({ data, setData }: any) {
  const toggleSpec = (v: string) => {
    const s = data.specialties.includes(v)
      ? data.specialties.filter((x: string) => x !== v)
      : [...data.specialties, v];
    setData({ ...data, specialties: s });
  };
  const toggleLang = (v: string) => {
    const s = data.languages_spoken.includes(v)
      ? data.languages_spoken.filter((x: string) => x !== v)
      : [...data.languages_spoken, v];
    setData({ ...data, languages_spoken: s });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold text-slate-700 mb-3">Spécialités</p>
        <MultiChipSelect options={SPECIALTIES} selected={data.specialties} onToggle={toggleSpec} />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-700 mb-3">Langues parlées</p>
        <MultiChipSelect options={LANGUAGES} selected={data.languages_spoken} onToggle={toggleLang} />
      </div>
    </div>
  );
}

function StepExperience({ data, setData }: any) {
  const toggleLandscape = (v: string) => {
    const s = data.landscapes.includes(v)
      ? data.landscapes.filter((x: string) => x !== v)
      : [...data.landscapes, v];
    setData({ ...data, landscapes: s });
  };
  const toggleCert = (v: string) => {
    const s = data.certifications.includes(v)
      ? data.certifications.filter((x: string) => x !== v)
      : [...data.certifications, v];
    setData({ ...data, certifications: s });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 ml-1">Années d'expérience</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={30}
            value={data.years_experience}
            onChange={(e) => setData({ ...data, years_experience: parseInt(e.target.value) })}
            className="flex-1 accent-primary"
          />
          <span className="text-2xl font-extrabold text-primary w-16 text-center">
            {data.years_experience} an{data.years_experience > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div>
        <p className="text-sm font-bold text-slate-700 mb-3">Terrains de prédilection</p>
        <MultiChipSelect options={LANDSCAPES} selected={data.landscapes} onToggle={toggleLandscape} />
      </div>

      <div>
        <p className="text-sm font-bold text-slate-700 mb-3">Certifications & formations</p>
        <div className="grid grid-cols-1 gap-2">
          {CERTIFICATIONS.map((cert) => {
            const active = data.certifications.includes(cert);
            return (
              <button
                key={cert}
                type="button"
                onClick={() => toggleCert(cert)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-bold text-left transition-all
                  ${active ? "bg-primary/10 border-primary text-slate-900" : "border-slate-100 text-slate-600 hover:border-primary/30 bg-white"}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${active ? "border-primary bg-primary" : "border-slate-300"}`}>
                  {active && <Check className="w-3 h-3 text-slate-900" />}
                </div>
                {cert}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, title: "Votre identité", subtitle: "Présentez-vous" },
  { id: 2, title: "Type de guide", subtitle: "Votre profil" },
  { id: 3, title: "Spécialités & Langues", subtitle: "Vos compétences" },
  { id: 4, title: "Expérience & Terrain", subtitle: "Votre parcours" },
];

export default function GuideOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [data, setData] = useState({
    full_name: "",
    bio: "",
    country: "",
    language: "",
    photo: "",
    zone: "",
    guide_type: "",
    specialties: [] as string[],
    languages_spoken: [] as string[],
    years_experience: 0,
    landscapes: [] as string[],
    certifications: [] as string[],
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const user = localStorage.getItem("user");
    if (!token || !user) router.push("/auth/login");
  }, [router]);

  const getToken = () => localStorage.getItem("access_token") || "";

  const canProceed = () => {
    if (step === 1) return !!data.full_name.trim() && !!data.country && !!data.language && !!data.zone.trim();
    if (step === 2) return !!data.guide_type;
    if (step === 3) return data.specialties.length > 0 && data.languages_spoken.length > 0;
    return true;
  };

  const handleNext = async () => {
    setError("");
    if (!canProceed()) {
      setError("Veuillez compléter les champs obligatoires.");
      return;
    }

    try {
      setLoading(true);

      if (step === 1) {
        await apiFetch("/guide/profile", {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({
            full_name: data.full_name,
            bio: data.bio || undefined,
            country: data.country,
            language: data.language,
            photo: data.photo || undefined,
            zone: data.zone,
          }),
        });
      } else if (step === 2) {
        await apiFetch("/guide/profile", {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({
            full_name: data.full_name,
            guide_type: data.guide_type,
            bio: data.bio || undefined,
            country: data.country,
            language: data.language,
            photo: data.photo || undefined,
            zone: data.zone,
          }),
        });
      } else if (step === 3) {
        await apiFetch("/guide/specialties", {
          method: "PATCH",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({
            specialties: data.specialties,
            languages_spoken: data.languages_spoken,
          }),
        });
      } else if (step === 4) {
        await apiFetch("/guide/experience", {
          method: "PATCH",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({
            years_experience: data.years_experience,
            landscapes: data.landscapes,
            certifications: data.certifications,
          }),
        });

        await apiFetch("/guide/onboarded", {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
        });

        router.push("/dashboard");
        return;
      }

      setStep((s) => s + 1);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="text-primary w-7 h-7" />
            <span className="text-lg font-extrabold tracking-tight">Éco-Voyage</span>
          </div>
          <span className="text-sm font-semibold text-slate-500">
            Étape {step} sur {STEPS.length}
          </span>
        </div>
      </header>

      <div className="h-1.5 bg-slate-100">
        <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          <div className="flex justify-center gap-2 mb-10">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s.id === step ? "w-8 bg-primary" : s.id < step ? "w-4 bg-primary/40" : "w-4 bg-slate-200"
                }`}
              />
            ))}
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 pb-0">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full mb-4">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  {STEPS[step - 1].subtitle}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-1">{STEPS[step - 1].title}</h1>
            </div>

            <div className="p-8">
              {step === 1 && <StepIdentity data={data} setData={setData} />}
              {step === 2 && <StepGuideType data={data} setData={setData} />}
              {step === 3 && <StepSpecialties data={data} setData={setData} />}
              {step === 4 && <StepExperience data={data} setData={setData} />}

              {error && (
                <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>
              )}
            </div>

            <div className="px-8 pb-8 flex items-center justify-between gap-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:border-slate-300 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={loading || !canProceed()}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-slate-900 rounded-xl font-extrabold shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60 disabled:translate-y-0"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                ) : step === STEPS.length ? (
                  <>
                    <Check className="w-4 h-4" />
                    Terminer
                  </>
                ) : (
                  <>
                    Continuer
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
