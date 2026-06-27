"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Leaf, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { apiFetch } from "@/lib/api";

// ─── Data ────────────────────────────────────────────────────────────────────

const TRAVELER_TYPES = [
    { value: "solo", label: "Solo", icon: "person" },
    { value: "couple", label: "En couple", icon: "favorite" },
    { value: "family", label: "Famille", icon: "family_restroom" },
    { value: "group", label: "Groupe d'amis", icon: "groups" },
    { value: "digital_nomad", label: "Nomade digital", icon: "laptop" },
    { value: "slow_traveler", label: "Slow traveler", icon: "self_improvement" },
    { value: "explorer", label: "Explorateur", icon: "explore" },
    { value: "adventure", label: "Aventurier", icon: "terrain" },
];

const MOTIVATIONS = [
    { value: "cultural_discovery", label: "Découverte culturelle", icon: "museum" },
    { value: "nature", label: "Nature", icon: "forest" },
    { value: "adventure", label: "Aventure", icon: "hiking" },
    { value: "outdoor_sport", label: "Sport outdoor", icon: "sports" },
    { value: "relaxation", label: "Détente", icon: "spa" },
    { value: "local_immersion", label: "Immersion locale", icon: "people" },
    { value: "gastronomy", label: "Gastronomie", icon: "restaurant" },
    { value: "photography", label: "Photographie", icon: "photo_camera" },
];

const SUSTAINABILITY_VALUES = [
    { value: "support_local_economy", label: "Soutenir l'économie locale" },
    { value: "protect_biodiversity", label: "Protéger la biodiversité" },
    { value: "reduce_carbon", label: "Réduire mon empreinte carbone" },
    { value: "responsible_tourism", label: "Tourisme responsable" },
    { value: "respect_cultures", label: "Respect des cultures" },
    { value: "local_consumption", label: "Consommation locale" },
    { value: "avoid_mass_tourism", label: "Éviter le tourisme de masse" },
];

const INTERESTS = [
    "Randonnée", "Spéléologie", "Vélo", "Kayak", "Gastronomie",
    "Artisanat", "Photographie", "Observation faune", "Culture", "Patrimoine",
];

const LANDSCAPES = [
    { value: "mountain", label: "Montagne", icon: "terrain" },
    { value: "desert", label: "Désert", icon: "sunny" },
    { value: "sea", label: "Mer", icon: "beach_access" },
    { value: "forest", label: "Forêt", icon: "forest" },
    { value: "lake", label: "Lac", icon: "water" },
    { value: "village", label: "Village", icon: "holiday_village" },
    { value: "archaeology", label: "Archéologie", icon: "account_balance" },
    { value: "oasis", label: "Oasis", icon: "local_florist" },
];

const TRAVEL_STYLES = [
    { value: "adventure", label: "Aventure" },
    { value: "cultural", label: "Culturel" },
    { value: "nature", label: "Nature" },
    { value: "sport", label: "Sport" },
    { value: "slow_tourism", label: "Slow tourism" },
    { value: "eco_tourism", label: "Éco-tourisme" },
    { value: "wellness", label: "Bien-être" },
    { value: "photography", label: "Photo & Art" },
];

const GOALS = [
    { value: "reduce_carbon", label: "Réduire mon impact carbone" },
    { value: "support_local_projects", label: "Soutenir des projets locaux" },
    { value: "preserve_biodiversity", label: "Préserver la biodiversité" },
    { value: "avoid_mass_tourism", label: "Voyager hors tourisme de masse" },
    { value: "support_local_crafts", label: "Soutenir l'artisanat local" },
    { value: "promote_local_culture", label: "Promouvoir la culture locale" },
];

// ─── Step components ──────────────────────────────────────────────────────────

function StepBasicInfo({ data, setData }: any) {
    function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const MAX = 400;
            const scale = Math.min(1, MAX / Math.max(img.width, img.height));
            const canvas = document.createElement('canvas');
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
            setData({ ...data, photo: canvas.toDataURL('image/jpeg', 0.7) });
            URL.revokeObjectURL(url);
        };
        img.src = url;
    }

    return (
        <div className="space-y-5">
            {/* Photo de profil */}
            <div className="flex flex-col items-center gap-3">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-primary/20 overflow-hidden flex items-center justify-center">
                        {data.photo ? (
                            <img src={data.photo} alt="Photo de profil" className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-slate-300 text-4xl">person</span>
                        )}
                    </div>
                    <label
                        htmlFor="photo-upload"
                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-900 text-base">photo_camera</span>
                    </label>
                    <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                    />
                </div>
                <p className="text-xs text-slate-400 font-medium">Photo de profil (optionnel)</p>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Nom complet *</label>
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
                    <input
                        className="w-full pl-11 pr-4 py-3.5 bg-surface-container border-none rounded-xl focus:ring-2 focus:ring-primary text-slate-900 placeholder:text-slate-400 font-medium"
                        value={data.full_name}
                        onChange={(e) => setData({ ...data, full_name: e.target.value })}
                        placeholder="Jean Dupont"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Bio (optionnel)</label>
                <textarea
                    className="w-full px-4 py-3.5 bg-surface-container border-none rounded-xl focus:ring-2 focus:ring-primary text-slate-900 placeholder:text-slate-400 font-medium resize-none"
                    value={data.bio}
                    onChange={(e) => setData({ ...data, bio: e.target.value })}
                    placeholder="Passionné(e) de voyages durables et de nature…"
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
                            <option value="BE">Belgique</option>
                            <option value="CH">Suisse</option>
                            <option value="CA">Canada</option>
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
                            <option value="de">Allemand</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MultiChipSelect({
    options, selected, onToggle, max,
}: {
    options: { value: string; label: string; icon?: string }[];
    selected: string[];
    onToggle: (v: string) => void;
    max?: number;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
                const active = selected.includes(opt.value);
                const disabled = !active && max !== undefined && selected.length >= max;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        disabled={disabled}
                        onClick={() => onToggle(opt.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border-2
              ${active
                                ? "bg-primary border-primary text-slate-900"
                                : "border-slate-200 text-slate-600 hover:border-primary/50 bg-white"
                            }
              ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                        {opt.icon && (
                            <span className="material-symbols-outlined text-base">{opt.icon}</span>
                        )}
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}

function StepTravelerType({ data, setData }: any) {
    const toggle = (v: string) => {
        const s = data.traveler_types.includes(v)
            ? data.traveler_types.filter((x: string) => x !== v)
            : [...data.traveler_types, v];
        setData({ ...data, traveler_types: s });
    };
    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-500 font-medium">Sélectionnez un ou plusieurs profils qui vous correspondent.</p>
            <MultiChipSelect options={TRAVELER_TYPES} selected={data.traveler_types} onToggle={toggle} />
        </div>
    );
}

function StepMotivations({ data, setData }: any) {
    const toggleMot = (v: string) => {
        const s = data.motivations.includes(v)
            ? data.motivations.filter((x: string) => x !== v)
            : [...data.motivations, v];
        setData({ ...data, motivations: s });
    };
    const toggleVal = (v: string) => {
        const s = data.sustainability_values.includes(v)
            ? data.sustainability_values.filter((x: string) => x !== v)
            : [...data.sustainability_values, v];
        setData({ ...data, sustainability_values: s });
    };
    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm font-bold text-slate-700 mb-3">Motivations de voyage</p>
                <MultiChipSelect options={MOTIVATIONS} selected={data.motivations} onToggle={toggleMot} />
            </div>
            <div>
                <p className="text-sm font-bold text-slate-700 mb-3">Valeurs durables</p>
                <MultiChipSelect
                    options={SUSTAINABILITY_VALUES}
                    selected={data.sustainability_values}
                    onToggle={toggleVal}
                />
            </div>
        </div>
    );
}

function StepInterests({ data, setData }: any) {
    const LEVELS = ["beginner", "intermediate", "advanced"];
    const LEVEL_LABELS: Record<string, string> = {
        beginner: "Débutant",
        intermediate: "Intermédiaire",
        advanced: "Avancé",
    };

    const toggleInterest = (name: string) => {
        const exists = data.interests.find((i: any) => i.name === name);
        if (exists) {
            setData({ ...data, interests: data.interests.filter((i: any) => i.name !== name) });
        } else {
            setData({ ...data, interests: [...data.interests, { name, level: "beginner" }] });
        }
    };

    const setLevel = (name: string, level: string) => {
        setData({
            ...data,
            interests: data.interests.map((i: any) => i.name === name ? { ...i, level } : i),
        });
    };

    const toggleLandscape = (v: string) => {
        const s = data.landscapes.includes(v)
            ? data.landscapes.filter((x: string) => x !== v)
            : [...data.landscapes, v];
        setData({ ...data, landscapes: s });
    };

    const toggleStyle = (v: string) => {
        const s = data.travel_styles.includes(v)
            ? data.travel_styles.filter((x: string) => x !== v)
            : [...data.travel_styles, v];
        setData({ ...data, travel_styles: s });
    };

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm font-bold text-slate-700 mb-3">Activités & intérêts</p>
                <div className="flex flex-wrap gap-2">
                    {INTERESTS.map((name) => {
                        const item = data.interests.find((i: any) => i.name === name);
                        const active = !!item;
                        return (
                            <div key={name} className="flex flex-col items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => toggleInterest(name)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all
                    ${active ? "bg-primary border-primary text-slate-900" : "border-slate-200 text-slate-600 hover:border-primary/50 bg-white"}`}
                                >
                                    {name}
                                </button>
                                {active && (
                                    <select
                                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700 bg-white"
                                        value={item.level}
                                        onChange={(e) => setLevel(name, e.target.value)}
                                    >
                                        {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
                                    </select>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div>
                <p className="text-sm font-bold text-slate-700 mb-3">Paysages préférés</p>
                <MultiChipSelect options={LANDSCAPES} selected={data.landscapes} onToggle={toggleLandscape} />
            </div>

            <div>
                <p className="text-sm font-bold text-slate-700 mb-3">Style de voyage</p>
                <MultiChipSelect options={TRAVEL_STYLES} selected={data.travel_styles} onToggle={toggleStyle} />
            </div>
        </div>
    );
}

function StepGoals({ data, setData }: any) {
    const toggle = (v: string) => {
        const s = data.sustainability_goals.includes(v)
            ? data.sustainability_goals.filter((x: string) => x !== v)
            : [...data.sustainability_goals, v];
        setData({ ...data, sustainability_goals: s });
    };
    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-500 font-medium">
                Quels sont vos objectifs durables en tant que voyageur ?
            </p>
            <div className="grid grid-cols-1 gap-3">
                {GOALS.map((g) => {
                    const active = data.sustainability_goals.includes(g.value);
                    return (
                        <button
                            key={g.value}
                            type="button"
                            onClick={() => toggle(g.value)}
                            className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold border-2 transition-all text-left
                ${active
                                    ? "bg-primary/10 border-primary text-slate-900"
                                    : "border-slate-100 text-slate-600 hover:border-primary/30 bg-white"
                                }`}
                        >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                ${active ? "border-primary bg-primary" : "border-slate-300"}`}
                            >
                                {active && <Check className="w-3 h-3 text-slate-900" />}
                            </div>
                            {g.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Main Onboarding Page ──────────────────────────────────────────────────────

const STEPS = [
    { id: 1, title: "Votre identité", subtitle: "Dites-nous qui vous êtes" },
    { id: 2, title: "Type de voyageur", subtitle: "Comment voyagez-vous ?" },
    { id: 3, title: "Motivations & Valeurs", subtitle: "Ce qui vous anime" },
    { id: 4, title: "Intérêts & Paysages", subtitle: "Vos préférences" },
    { id: 5, title: "Objectifs durables", subtitle: "Votre engagement" },
];

export default function OnboardingPage() {
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
        traveler_types: [] as string[],
        motivations: [] as string[],
        sustainability_values: [] as string[],
        interests: [] as { name: string; level: string }[],
        landscapes: [] as string[],
        travel_styles: [] as string[],
        sustainability_goals: [] as string[],
    });

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const user = localStorage.getItem("user");
        if (!token || !user) router.push("/auth/login");
    }, [router]);

    const getToken = () => localStorage.getItem("access_token") || "";

    const canProceed = () => {
        if (step === 1) return !!data.full_name.trim() && !!data.country && !!data.language;
        if (step === 2) return data.traveler_types.length > 0;
        if (step === 3) return data.motivations.length > 0;
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
                await apiFetch("/eco-traveler/profile", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${getToken()}` },
                    body: JSON.stringify({
                        full_name: data.full_name,
                        bio: data.bio || undefined,
                        country: data.country,
                        language: data.language,
                        photo: data.photo || undefined,
                    }),
                });
            } else if (step === 2) {
                await apiFetch("/eco-traveler/traveler-types", {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${getToken()}` },
                    body: JSON.stringify({ traveler_types: data.traveler_types }),
                });
            } else if (step === 3) {
                await apiFetch("/eco-traveler/motivations", {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${getToken()}` },
                    body: JSON.stringify({
                        motivations: data.motivations,
                        sustainability_values: data.sustainability_values,
                    }),
                });
            } else if (step === 4) {
                await apiFetch("/eco-traveler/interests", {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${getToken()}` },
                    body: JSON.stringify({
                        interests: data.interests,
                        landscapes: data.landscapes,
                        travel_styles: data.travel_styles,
                    }),
                });
            } else if (step === 5) {
                await apiFetch("/eco-traveler/goals", {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${getToken()}` },
                    body: JSON.stringify({ sustainability_goals: data.sustainability_goals }),
                });

                // Mark onboarded
                await apiFetch("/eco-traveler/onboarded", {
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
            {/* Header */}
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

            {/* Progress bar */}
            <div className="h-1.5 bg-slate-100">
                <div
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Content */}
            <main className="flex-1 flex items-start justify-center px-4 py-10">
                <div className="w-full max-w-2xl">
                    {/* Step indicators */}
                    <div className="flex justify-center gap-2 mb-10">
                        {STEPS.map((s) => (
                            <div
                                key={s.id}
                                className={`h-2 rounded-full transition-all duration-300 ${s.id === step
                                        ? "w-8 bg-primary"
                                        : s.id < step
                                            ? "w-4 bg-primary/40"
                                            : "w-4 bg-slate-200"
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                        {/* Card header */}
                        <div className="p-8 pb-0">
                            <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full mb-4">
                                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                    {STEPS[step - 1].subtitle}
                                </span>
                            </div>
                            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">
                                {STEPS[step - 1].title}
                            </h1>
                        </div>

                        {/* Card body */}
                        <div className="p-8 pt-6 max-h-[60vh] overflow-y-auto">
                            {step === 1 && <StepBasicInfo data={data} setData={setData} />}
                            {step === 2 && <StepTravelerType data={data} setData={setData} />}
                            {step === 3 && <StepMotivations data={data} setData={setData} />}
                            {step === 4 && <StepInterests data={data} setData={setData} />}
                            {step === 5 && <StepGoals data={data} setData={setData} />}

                            {error && (
                                <p className="text-sm font-semibold text-red-600 mt-4">{error}</p>
                            )}
                        </div>

                        {/* Card footer */}
                        <div className="p-8 pt-4 border-t border-slate-50 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setStep((s) => Math.max(1, s - 1))}
                                disabled={step === 1}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" /> Retour
                            </button>

                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={loading}
                                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-primary text-slate-900 font-extrabold text-sm shadow-lg shadow-primary/30 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60"
                            >
                                {loading ? "Chargement..." : step === STEPS.length ? "Terminer & Passer le test" : "Continuer"}
                                {!loading && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Skip */}
                    {step > 2 && (
                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={() => router.push("/dashboard")}
                                className="text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
                            >
                                Passer cette étape →
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}