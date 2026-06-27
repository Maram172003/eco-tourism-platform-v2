"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ChevronLeft, ChevronRight, Check, Leaf, AlertCircle, Info } from "lucide-react";
import { PROVIDER_SCHEMA } from "@/lib/provider-schema";
import {
  OFFER_DETAIL_FIELDS,
  OFFER_COMMON_FIELDS,
  getCapacityLimit,
  getLanguesLimit,
  getNiveauxLimit,
  type OfferField,
} from "@/lib/offer-schema";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OrgActivity {
  id: string;
  category: string;
  level: string;
  subtypes: string[];
  years_experience: number | null;
  fields: Record<string, any>;
  photos: Record<string, string[]>;
  certifications: any[];
  organization_id: string;
}

interface Organization {
  id: string;
  name: string;
  logo: string | null;
  region: string | null;
  zone: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
}

const PRICE_TYPES = [
  { value: "per_person", label: "Par personne" },
  { value: "per_group", label: "Par groupe" },
  { value: "per_night", label: "Par nuit" },
  { value: "per_unit", label: "Par unité" },
  { value: "on_request", label: "Sur devis" },
];

const CONFIRMATION_MODES = [
  { value: "instant", label: "✅ Confirmation instantanée", desc: "La réservation est confirmée automatiquement dès soumission." },
  { value: "manual", label: "⏳ Sur demande", desc: "Vous acceptez ou refusez dans le délai que vous définissez." },
  { value: "conditional", label: "💰 Avec acompte", desc: "Un pourcentage est payé en avance pour bloquer la place." },
];

const AVAILABILITY_MODES = [
  { value: "always", label: "♾ Toujours disponible", desc: "Pas de restriction de dates. Le voyageur propose une date." },
  { value: "period", label: "📅 Période fixe", desc: "Ex: disponible du 1er juin au 30 septembre." },
  { value: "weekly", label: "🔁 Jours récurrents", desc: "Ex: chaque samedi et dimanche." },
  { value: "specific", label: "📌 Dates spécifiques", desc: "Sélection manuelle de dates précises." },
];

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const STEPS = ["Activité", "Sous-types", "Infos commerciales", "Détails", "Calendrier & Confirmation"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCategoryMeta(categoryValue: string) {
  return PROVIDER_SCHEMA.find((c) => c.value === categoryValue);
}

function getSubtypeLabel(categoryValue: string, subtypeValue: string) {
  const cat = getCategoryMeta(categoryValue);
  return cat?.subtypes.find((s) => s.value === subtypeValue)?.label ?? subtypeValue;
}

// ─── Field renderer ───────────────────────────────────────────────────────────

function OfferFieldInput({
  field,
  value,
  onChange,
  error,
}: {
  field: OfferField;
  value: any;
  onChange: (v: any) => void;
  error?: string;
}) {
  const cls = "w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-sm " +
    (error ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-emerald-200");

  if (field.type === "boolean") {
    return (
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div
          onClick={() => onChange(!value)}
          className={`w-11 h-6 rounded-full flex items-center transition-colors ${value ? "bg-emerald-500" : "bg-slate-200"}`}
        >
          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${value ? "translate-x-5" : "translate-x-0"}`} />
        </div>
        <span className="text-sm text-slate-700">{field.label}</span>
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">{field.label}</label>
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={cls}>
          <option value="">— Sélectionner —</option>
          {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  if (field.type === "multiselect") {
    const arr: string[] = Array.isArray(value) ? value : [];
    return (
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">{field.label}</label>
        <div className="flex flex-wrap gap-2">
          {field.options?.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => onChange(arr.includes(o) ? arr.filter((x) => x !== o) : [...arr, o])}
              className={`px-3 py-1 rounded-full text-xs border transition-all ${
                arr.includes(o) ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">{field.label}</label>
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className={cls + " resize-none"}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">
        {field.label}{field.unit ? ` (${field.unit})` : ""}
      </label>
      <input
        type={field.type === "number" ? "number" : "text"}
        value={value ?? ""}
        onChange={(e) => onChange(field.type === "number" ? (e.target.value ? Number(e.target.value) : "") : e.target.value)}
        placeholder={field.placeholder}
        className={cls}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function NewOfferContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preActivityId = searchParams.get("activityId");

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState("");

  // Data fetched
  const [org, setOrg] = useState<Organization | null>(null);
  const [activities, setActivities] = useState<OrgActivity[]>([]);

  // Step 0
  const [selectedActivity, setSelectedActivity] = useState<OrgActivity | null>(null);

  // Step 1 — sous-types
  const [selectedSubtypes, setSelectedSubtypes] = useState<string[]>([]);
  const [offerMode, setOfferMode] = useState<"single" | "variant" | "package">("single");

  // Step 2 — infos commerciales
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceType, setPriceType] = useState("per_person");
  const [price, setPrice] = useState("");
  const [pricePerSubtype, setPricePerSubtype] = useState<Record<string, string>>({});
  const [duration, setDuration] = useState("");
  const [inclusions, setInclusions] = useState("");
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [capacity, setCapacity] = useState("");
  const [maxGroup, setMaxGroup] = useState("");
  const [minAge, setMinAge] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [capacityError, setCapacityError] = useState("");
  const [maxGroupError, setMaxGroupError] = useState("");

  // Step 3 — détails par sous-type
  const [subtypeDetails, setSubtypeDetails] = useState<Record<string, Record<string, any>>>({});
  const [commonDetails, setCommonDetails] = useState<Record<string, any>>({});

  // Step 4 — calendrier + confirmation
  const [availabilityMode, setAvailabilityMode] = useState("always");
  const [availabilityStart, setAvailabilityStart] = useState("");
  const [availabilityEnd, setAvailabilityEnd] = useState("");
  const [availableWeekdays, setAvailableWeekdays] = useState<number[]>([]);
  const [specificDates, setSpecificDates] = useState<string[]>([]);
  const [blockedDates, setBlockedDates] = useState("");
  const [timeSlotStart, setTimeSlotStart] = useState("");
  const [confirmationMode, setConfirmationMode] = useState("manual");
  const [confirmationDeadlineHours, setConfirmationDeadlineHours] = useState("48");
  const [depositPercentage, setDepositPercentage] = useState("0");

  // ── Init ──────────────────────────────────────────────────────────────────────

  useEffect(() => {
    async function init() {
      try {
        const [orgRes, actRes] = await Promise.all([
          apiFetch("/organizations/me"),
          apiFetch("/provider-activities/mine"),
        ]) as [Organization, OrgActivity[]];
        setOrg(orgRes);
        setActivities(actRes);

        if (preActivityId) {
          const found = actRes.find((a: OrgActivity) => a.id === preActivityId);
          if (found) {
            setSelectedActivity(found);
            prefillFromOrg(orgRes);
            setStep(1);
          }
        }
      } catch (e) {
        // non bloquant
      } finally {
        setInitLoading(false);
      }
    }
    init();
  }, [preActivityId]);

  function prefillFromOrg(o: Organization) {
    if (o?.region) setTitle((t) => t);
  }

  // ── Constraint validation ─────────────────────────────────────────────────────

  function validateCapacity(val: string) {
    if (!selectedActivity) return;
    const limit = getCapacityLimit(selectedActivity.fields);
    if (limit !== null && val && Number(val) > limit) {
      setCapacityError(`Max autorisé : ${limit} (déclaré dans votre profil)`);
    } else {
      setCapacityError("");
    }
  }

  function validateMaxGroup(val: string) {
    if (!selectedActivity) return;
    const limit = getCapacityLimit(selectedActivity.fields);
    if (limit !== null && val && Number(val) > limit) {
      setMaxGroupError(`Max autorisé : ${limit} (déclaré dans votre profil)`);
    } else {
      setMaxGroupError("");
    }
  }

  // ── Subtype detail helpers ────────────────────────────────────────────────────

  function setDetail(subtype: string, key: string, val: any) {
    setSubtypeDetails((prev) => ({
      ...prev,
      [subtype]: { ...(prev[subtype] ?? {}), [key]: val },
    }));
  }

  // ── Calendar helpers ──────────────────────────────────────────────────────────

  function toggleWeekday(idx: number) {
    setAvailableWeekdays((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]
    );
  }

  function addSpecificDate(date: string) {
    if (date && !specificDates.includes(date))
      setSpecificDates((prev) => [...prev, date].sort());
  }

  function removeSpecificDate(date: string) {
    setSpecificDates((prev) => prev.filter((d) => d !== date));
  }

  // ── Navigation guards ─────────────────────────────────────────────────────────

  function canNext(): boolean {
    if (step === 0) return selectedActivity !== null;
    if (step === 1) return selectedSubtypes.length > 0;
    if (step === 2) return !!title.trim() && !capacityError && !maxGroupError;
    if (step === 3) return true;
    return true;
  }

  // ── Submit ────────────────────────────────────────────────────────────────────

  async function submit() {
    if (!selectedActivity || !org) return;
    setLoading(true);
    setError("");
    try {
      const catMeta = getCategoryMeta(selectedActivity.category);
      const offerType = selectedActivity.category;

      const mergedDetails: Record<string, any> = { ...commonDetails };
      for (const sv of selectedSubtypes) {
        if (subtypeDetails[sv]) mergedDetails[sv] = subtypeDetails[sv];
      }
      if (availabilityMode === "weekly") mergedDetails.available_weekdays = availableWeekdays;
      if (availabilityMode === "specific") mergedDetails.specific_dates = specificDates;
      if (blockedDates.trim()) mergedDetails.blocked_dates = blockedDates.split(",").map((s) => s.trim()).filter(Boolean);
      if (timeSlotStart) mergedDetails.time_slot_start = timeSlotStart;
      if (offerMode === "variant") mergedDetails.prices = pricePerSubtype;

      const payload: Record<string, any> = {
        organization_id: org.id,
        activity_id: selectedActivity.id,
        offer_type: offerType,
        offer_subtype: selectedSubtypes[0] ?? null,
        offer_subtypes: selectedSubtypes,
        offer_mode: selectedSubtypes.length === 1 ? "single" : offerMode,
        title: title.trim(),
        description: description.trim() || null,
        price: offerMode !== "variant" && price ? Number(price) : null,
        price_type: priceType,
        duration: duration.trim() || null,
        inclusions: inclusions.trim() || null,
        cancellation_policy: cancellationPolicy.trim() || null,
        capacity: capacity ? Number(capacity) : null,
        max_group_size: maxGroup ? Number(maxGroup) : null,
        min_age: minAge ? Number(minAge) : null,
        region: org.region ?? null,
        meeting_point: org.address ?? null,
        meeting_lat: org.lat ?? null,
        meeting_lng: org.lng ?? null,
        availability_mode: availabilityMode,
        availability_start: availabilityMode === "period" ? availabilityStart || null : null,
        availability_end: availabilityMode === "period" ? availabilityEnd || null : null,
        confirmation_mode: confirmationMode,
        confirmation_deadline_hours: confirmationMode === "manual" ? Number(confirmationDeadlineHours) : null,
        deposit_percentage: confirmationMode === "conditional" ? Number(depositPercentage) : 0,
        images: images.filter(Boolean),
        details: mergedDetails,
      };

      await apiFetch("/offers", { method: "POST", body: JSON.stringify(payload) });
      router.push("/profile/provider");
    } catch (e: any) {
      setError(e.message ?? "Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  if (initLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const catMeta = selectedActivity ? getCategoryMeta(selectedActivity.category) : null;
  const capacityLimit = selectedActivity ? getCapacityLimit(selectedActivity.fields) : null;
  const languesLimit = selectedActivity ? getLanguesLimit(selectedActivity.fields) : [];
  const niveauxLimit = selectedActivity ? getNiveauxLimit(selectedActivity.fields) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : router.back()}
            className="text-slate-400 hover:text-slate-700"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Leaf size={18} className="text-emerald-500" /> Nouvelle offre
            </h1>
            <p className="text-xs text-slate-400">Étape {step + 1} sur {STEPS.length} — {STEPS[step]}</p>
          </div>
        </div>
        <div className="h-1 bg-slate-100">
          <div
            className="h-1 bg-emerald-500 transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-1 mb-8 overflow-x-auto pb-1">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-1 flex-shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                ${i < step ? "bg-emerald-500 text-white" : i === step ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400" : "bg-slate-100 text-slate-400"}`}>
                {i < step ? <Check size={12} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`w-5 h-0.5 ${i < step ? "bg-emerald-400" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        {/* ─── Étape 0 : Activité ─── */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1">Choisissez une activité</h2>
              <p className="text-sm text-slate-500">Sélectionnez une de vos activités déclarées, ou créez une offre libre.</p>
            </div>

            {activities.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
                <AlertCircle size={24} className="text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-amber-800">Aucune activité déclarée</p>
                <p className="text-xs text-amber-600 mt-1">Complétez votre profil d'abord pour lier vos offres à vos activités.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {activities.map((act) => {
                  const meta = getCategoryMeta(act.category);
                  const isPrimary = act.level === "primary";
                  const firstPhoto = Object.values(act.photos ?? {}).flat().filter(Boolean)[0] ?? null;
                  return (
                    <button
                      key={act.id}
                      onClick={() => setSelectedActivity(selectedActivity?.id === act.id ? null : act)}
                      className={`w-full text-left rounded-2xl border-2 overflow-hidden transition-all ${
                        selectedActivity?.id === act.id
                          ? "border-emerald-500 ring-2 ring-emerald-100"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 p-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-emerald-100 flex items-center justify-center">
                          {firstPhoto ? (
                            <img src={firstPhoto} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-emerald-500 text-2xl">{meta?.icon ?? "eco"}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPrimary ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                              {isPrimary ? "Principale" : "Secondaire"}
                            </span>
                            <span className="text-xs text-slate-500">{meta?.label ?? act.category}</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {act.subtypes?.map((sv) => getSubtypeLabel(act.category, sv)).join(" · ") || meta?.label}
                          </p>
                          {act.years_experience && (
                            <p className="text-xs text-slate-400">{act.years_experience} an{act.years_experience > 1 ? "s" : ""} d'expérience</p>
                          )}
                        </div>
                        {selectedActivity?.id === act.id && (
                          <Check size={18} className="text-emerald-500 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedActivity && capacityLimit !== null && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
                <Info size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  Capacité max déclarée pour cette activité : <strong>{capacityLimit} personnes</strong>. Vos offres ne pourront pas dépasser cette limite.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── Étape 1 : Sous-types ─── */}
        {step === 1 && selectedActivity && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1">Sous-type(s) de cette offre</h2>
              <p className="text-sm text-slate-500">
                Sélectionnez un ou plusieurs sous-types de <strong>{getCategoryMeta(selectedActivity.category)?.label}</strong>.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(selectedActivity.subtypes ?? []).map((sv) => {
                const label = getSubtypeLabel(selectedActivity.category, sv);
                const isSelected = selectedSubtypes.includes(sv);
                return (
                  <button
                    key={sv}
                    onClick={() =>
                      setSelectedSubtypes((prev) =>
                        prev.includes(sv) ? prev.filter((x) => x !== sv) : [...prev, sv]
                      )
                    }
                    className={`px-3 py-3 rounded-xl border-2 text-sm font-semibold text-left transition-all flex items-center gap-2 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {isSelected && <Check size={14} />}
                    {label}
                  </button>
                );
              })}
            </div>

            {selectedSubtypes.length > 1 && (
              <div>
                <p className="text-sm font-bold text-slate-700 mb-2">Mode de l'offre</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOfferMode("variant")}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${offerMode === "variant" ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}
                  >
                    <p className="text-sm font-bold text-slate-800">🔀 Variantes</p>
                    <p className="text-xs text-slate-500 mt-0.5">Le voyageur choisit un sous-type parmi ceux proposés.</p>
                  </button>
                  <button
                    onClick={() => setOfferMode("package")}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${offerMode === "package" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"}`}
                  >
                    <p className="text-sm font-bold text-slate-800">📦 Package</p>
                    <p className="text-xs text-slate-500 mt-0.5">Tous les sous-types sont inclus dans l'offre.</p>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Étape 2 : Infos commerciales ─── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1">Informations commerciales</h2>
              <p className="text-sm text-slate-500">Ces données sont propres à cette offre — titre, prix, inclusions.</p>
            </div>

            {/* Infos pré-remplies depuis l'org */}
            {org && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 space-y-1">
                <p className="text-xs font-bold text-emerald-700 mb-1">✅ Pré-rempli depuis votre organisation</p>
                {org.region && <p className="text-xs text-emerald-600">📍 Région : {org.region}</p>}
                {org.address && <p className="text-xs text-emerald-600">📌 Point de RDV : {org.address}</p>}
                {capacityLimit && <p className="text-xs text-emerald-600">👥 Capacité max : {capacityLimit} pers.</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Titre de l'offre *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Ex: ${getCategoryMeta(selectedActivity?.category ?? "")?.label ?? "Offre"} — ${org?.name ?? "Mon Organisation"}`}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez votre offre : ambiance, programme, points forts..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-sm resize-none"
              />
            </div>

            {/* Prix */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Type de tarification</label>
              <div className="grid grid-cols-3 gap-2">
                {PRICE_TYPES.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPriceType(p.value)}
                    className={`py-2 px-3 rounded-xl border-2 text-xs font-semibold transition-all ${priceType === p.value ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600"}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {offerMode === "variant" && selectedSubtypes.length > 1 ? (
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Prix par variante (TND)</label>
                {selectedSubtypes.map((sv) => (
                  <div key={sv} className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 w-32 truncate">{getSubtypeLabel(selectedActivity?.category ?? "", sv)}</span>
                    <input
                      type="number"
                      value={pricePerSubtype[sv] ?? ""}
                      onChange={(e) => setPricePerSubtype((prev) => ({ ...prev, [sv]: e.target.value }))}
                      placeholder="0 TND"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-sm"
                    />
                  </div>
                ))}
              </div>
            ) : priceType !== "on_request" ? (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Prix (TND)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ex: 150"
                  min={0}
                  step={0.5}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-sm"
                />
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Durée</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Ex: 2h, 1 journée, 3 jours"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Capacité{capacityLimit !== null ? ` (max ${capacityLimit})` : ""}
                </label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => { setCapacity(e.target.value); validateCapacity(e.target.value); }}
                  placeholder="Places"
                  min={1}
                  className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-sm ${capacityError ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-emerald-200"}`}
                />
                {capacityError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{capacityError}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Groupe max{capacityLimit !== null ? ` (max ${capacityLimit})` : ""}
                </label>
                <input
                  type="number"
                  value={maxGroup}
                  onChange={(e) => { setMaxGroup(e.target.value); validateMaxGroup(e.target.value); }}
                  placeholder="Ex: 15"
                  min={1}
                  className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-sm ${maxGroupError ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-emerald-200"}`}
                />
                {maxGroupError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{maxGroupError}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Âge minimum</label>
                <input
                  type="number"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                  placeholder="Ex: 12"
                  min={0}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Ce qui est inclus</label>
              <textarea
                value={inclusions}
                onChange={(e) => setInclusions(e.target.value)}
                placeholder="Ex: Guide, transport, repas, équipement..."
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Politique d'annulation</label>
              <textarea
                value={cancellationPolicy}
                onChange={(e) => setCancellationPolicy(e.target.value)}
                placeholder="Ex: Remboursement intégral jusqu'à 48h avant..."
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Photos (URLs, une par ligne)</label>
              <textarea
                value={images.join("\n")}
                onChange={(e) => setImages(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
                placeholder="https://..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-sm resize-none font-mono"
              />
            </div>
          </div>
        )}

        {/* ─── Étape 3 : Détails spécifiques par sous-type ─── */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1">Détails de l'offre</h2>
              <p className="text-sm text-slate-500">Renseignez les informations spécifiques à chaque sous-type.</p>
            </div>

            {selectedActivity && (
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 space-y-1">
                <p className="text-xs font-bold text-purple-700 mb-1">🔒 Contraintes depuis votre profil</p>
                {capacityLimit !== null && <p className="text-xs text-purple-600">👥 Capacité max : {capacityLimit} pers.</p>}
                {languesLimit.length > 0 && <p className="text-xs text-purple-600">🗣 Langues déclarées : {languesLimit.join(", ")}</p>}
                {niveauxLimit.length > 0 && <p className="text-xs text-purple-600">📊 Niveaux déclarés : {niveauxLimit.join(", ")}</p>}
              </div>
            )}

            {selectedSubtypes.map((sv) => {
              const config = OFFER_DETAIL_FIELDS[sv];
              const svLabel = getSubtypeLabel(selectedActivity?.category ?? "", sv);
              if (!config) return null;
              return (
                <div key={sv} className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="bg-slate-800 px-4 py-3">
                    <h3 className="text-sm font-bold text-white">{svLabel}</h3>
                  </div>
                  <div className="p-4 space-y-5">
                    {config.sections.map((section) => (
                      <div key={section.label}>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                          {section.icon} {section.label}
                        </p>
                        <div className="space-y-3">
                          {section.fields.map((field) => (
                            <OfferFieldInput
                              key={field.key}
                              field={field}
                              value={subtypeDetails[sv]?.[field.key]}
                              onChange={(v) => setDetail(sv, field.key, v)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Champs communs */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-3">
                <h3 className="text-sm font-bold text-slate-700">{OFFER_COMMON_FIELDS.icon} {OFFER_COMMON_FIELDS.label}</h3>
              </div>
              <div className="p-4 space-y-3">
                {OFFER_COMMON_FIELDS.fields.map((field) => (
                  <OfferFieldInput
                    key={field.key}
                    field={field}
                    value={commonDetails[field.key]}
                    onChange={(v) => setCommonDetails((prev) => ({ ...prev, [field.key]: v }))}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Étape 4 : Calendrier & Confirmation ─── */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1">Disponibilité & Confirmation</h2>
            </div>

            {/* Calendrier */}
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-700">Quand votre offre est-elle disponible ?</p>
              {AVAILABILITY_MODES.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setAvailabilityMode(m.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    availabilityMode === m.value ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-800">{m.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                </button>
              ))}

              {availabilityMode === "period" && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Date de début</label>
                    <input type="date" value={availabilityStart} onChange={(e) => setAvailabilityStart(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Date de fin</label>
                    <input type="date" value={availabilityEnd} onChange={(e) => setAvailabilityEnd(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-sm" />
                  </div>
                </div>
              )}

              {availabilityMode === "weekly" && (
                <div className="space-y-3 mt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Jours disponibles</label>
                    <div className="flex gap-2 flex-wrap">
                      {WEEKDAYS.map((d, i) => (
                        <button
                          key={i}
                          onClick={() => toggleWeekday(i)}
                          className={`w-10 h-10 rounded-full text-xs font-bold border-2 transition-all ${
                            availableWeekdays.includes(i) ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-slate-600 border-slate-200"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Créneau horaire (début)</label>
                    <input type="time" value={timeSlotStart} onChange={(e) => setTimeSlotStart(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-sm" />
                  </div>
                </div>
              )}

              {availabilityMode === "specific" && (
                <div className="space-y-3 mt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Ajouter une date</label>
                    <input type="date" onChange={(e) => { addSpecificDate(e.target.value); e.target.value = ""; }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-sm" />
                  </div>
                  {specificDates.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {specificDates.map((d) => (
                        <span key={d} className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                          {d}
                          <button onClick={() => removeSpecificDate(d)} className="ml-0.5 hover:text-red-500">✕</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {availabilityMode !== "always" && (
                <div className="mt-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Jours bloqués (exceptions, séparés par virgules)</label>
                  <input type="text" value={blockedDates} onChange={(e) => setBlockedDates(e.target.value)}
                    placeholder="Ex: 2026-08-15, 2026-08-20"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-sm" />
                </div>
              )}
            </div>

            {/* Confirmation */}
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-700">Mode de confirmation</p>
              {CONFIRMATION_MODES.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setConfirmationMode(m.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    confirmationMode === m.value ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-800">{m.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                </button>
              ))}

              {confirmationMode === "manual" && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Délai de réponse (heures)</label>
                  <input type="number" value={confirmationDeadlineHours} onChange={(e) => setConfirmationDeadlineHours(e.target.value)}
                    min={1} placeholder="48"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-sm" />
                </div>
              )}

              {confirmationMode === "conditional" && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Acompte : <span className="text-emerald-600 font-bold">{depositPercentage}%</span>
                  </label>
                  <input type="range" value={depositPercentage} onChange={(e) => setDepositPercentage(e.target.value)}
                    min={10} max={100} step={5} className="w-full accent-emerald-500" />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>10%</span><span>100% (paiement total)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Récapitulatif */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
              <h3 className="font-bold text-emerald-800 text-sm mb-3">Récapitulatif</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="font-medium">{getCategoryMeta(selectedActivity?.category ?? "")?.label}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Sous-types</span><span className="font-medium">{selectedSubtypes.map((sv) => getSubtypeLabel(selectedActivity?.category ?? "", sv)).join(", ")}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Titre</span><span className="font-medium line-clamp-1">{title}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Prix</span><span className="font-medium">{priceType === "on_request" ? "Sur devis" : price ? `${price} TND` : "—"}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Disponibilité</span><span className="font-medium">{AVAILABILITY_MODES.find((m) => m.value === availabilityMode)?.label}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Confirmation</span><span className="font-medium">{CONFIRMATION_MODES.find((m) => m.value === confirmationMode)?.label}</span></div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 flex items-center justify-center gap-2"
            >
              <ChevronLeft size={16} /> Précédent
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => canNext() && setStep(step + 1)}
              disabled={!canNext()}
              className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              Suivant <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={loading || !!capacityError || !!maxGroupError}
              className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? "Publication..." : "Publier l'offre"} <Check size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NewOfferPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>}>
      <NewOfferContent />
    </Suspense>
  );
}
