"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { logoutUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import GuidedOfferWizard from "@/components/GuidedOfferWizard";
import CircuitBuilderWizard from "@/components/CircuitBuilderWizard";
import ImageUploader from "@/components/ImageUploader";
import CertificationUploader from "@/components/CertificationUploader";
import Modal from "@/components/ui/Modal";

const MapPicker = dynamic(
  () => import("@/components/map/MapPicker"),
  { ssr: false, loading: () => <div className="h-[268px] rounded-2xl bg-slate-100 animate-pulse" /> }
);

type Role = "eco_traveler" | "guide" | "provider";

type Badge = {
  label: string;
  obtained_at: string;
};

type Participant = {
  id: string;
  full_name: string;
  email?: string;
};

type OfferItem = {
  id: string;
  name: string;
  description: string | null;
  item_type: string | null;
  details_json: Record<string, any> | null;
  status: string;
  prices: { id: string; label: string; price: number; currency: string; is_default: boolean }[];
};

type Offer = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  duration: string | null;
  offer_type: string | null;
  location_type?: string;
  status: string;
  rejection_reason: string | null;
  venue_id?: string | null;
  created_at: string;
  items?: OfferItem[];
};

type Venue = {
  id: string;
  name: string;
  venue_type: string[] | null;
  description: string | null;
  region: string | null;
  address: string | null;
  photo: string | null;
  photos: string[] | null;
  lat: number | null;
  lng: number | null;
  opening_hours: string | null;
  facebook: string | null;
  instagram: string | null;
  status: string;
  rejection_reason: string | null;
  services: string[] | null;
  eco_labels: string[] | null;
  website: string | null;
  phone: string | null;
};

type Publication = {
  id: string;
  type: "place" | "experience";
  title: string;
  description: string | null;
  images: string[] | null;
  latitude: number | null;
  longitude: number | null;
  place_name: string | null;
  region: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
};

type Booking = {
  id: string;
  offer?: { title: string };
  traveler?: { full_name: string; photo?: string | null };
  participants?: Participant[];
  total_price: number;
  status: string;
  confirmation_mode?: string;
  special_requests?: string;
  created_at: string;
};

type Notification = {
  id: string;
  title: string;
  body: string;
  is_read: boolean;
  link?: string;
  created_at: string;
};

type SearchResult = {
  user_id: string;
  full_name: string;
  photo: string | null;
  zone?: string | null;
  organization?: string | null;
  guide_type?: string | null;
  sustainability_score?: number | null;
  _type?: string;
};

type AnyProfile = {
  full_name: string;
  bio?: string | null;
  photo?: string | null;
  country?: string | null;
  language?: string | null;
  profile_completion: number;
  is_onboarded: boolean;
  sustainability_score: number | null;
  score_questionnaire: number | null;
  score_reservations: number;
  score_feedbacks: number;
  badges: Badge[];
  score_partages?: number;
  feedback_given?: number;
  plans_shared?: number;
  reservations_made?: number;
  guide_type?: string | null;
  zone?: string | null;
  specialties?: string[] | null;
  languages_spoken?: string[] | null;
  years_experience?: number | null;
  status?: string;
  certifications?: string[];
  feedback_received?: number;
  reservations_handled?: number;
  organization?: string | null;
  position?: string | null;
  phone?: string | null;
  total_reservations?: number;
  venues?: Venue[];
};

type DashConv = {
  id: string;
  other_user: { full_name: string | null; photo: string | null };
  last_message: { content: string; is_mine: boolean } | null;
  unread_count: number;
};

const GUIDE_OFFER_TYPES = [
  { value: "eco_tour", label: "Éco-Tour", icon: "hiking" },
  { value: "activity", label: "Activité", icon: "sports" },
  { value: "workshop", label: "Atelier", icon: "school" },
  { value: "event", label: "Événement", icon: "event" },
  { value: "transfer", label: "Transfert", icon: "directions_car" },
  { value: "guide_service", label: "Service guide", icon: "tour" },
  { value: "equipment_rental", label: "Location équipement", icon: "kayaking" },
];

const PROJ_OFFER_TYPES = [
  { value: "accommodation", label: "Hébergement" },
  { value: "activity", label: "Activité" },
  { value: "restaurant", label: "Restaurant" },
  { value: "transport", label: "Transport" },
  { value: "workshop", label: "Atelier" },
  { value: "event", label: "Événement" },
  { value: "craft", label: "Artisanat" },
  { value: "sejour", label: "Séjour" },
];

const VENUE_TYPES = [
  { value: "accommodation", label: "Hébergement", icon: "hotel", description: "Hôtel, éco-lodge, gîte" },
  { value: "camping", label: "Camping", icon: "camping", description: "Camping, espace tente" },
  { value: "restaurant", label: "Restaurant", icon: "restaurant", description: "Restaurant, café, food truck" },
  { value: "activity_center", label: "Centre d'activités", icon: "sports", description: "Sports, loisirs, plein air" },
  { value: "artisan", label: "Artisanat", icon: "brush", description: "Artisanat local, artisan" },
  { value: "farm", label: "Ferme écologique", icon: "eco", description: "Agrotourisme, ferme" },
  { value: "transport", label: "Transport", icon: "directions_car", description: "Transport, transfert, location" },
  { value: "event_space", label: "Espace événementiel", icon: "celebration", description: "Événements, séminaires" },
  { value: "tourism_association", label: "Association tourisme", icon: "groups", description: "Association, guide local" },
  { value: "eco_park", label: "Parc écologique", icon: "eco", description: "Parc naturel, réserve" },
];

const ECO_PRACTICES = [
  "Panneaux solaires", "Eau recyclée", "Zéro plastique", "Produits locaux",
  "Compostage", "Éco-certification", "Véhicules électriques", "Éclairage LED",
];

const VENUE_SERVICES = [
  { value: "hebergement", label: "Hébergement", icon: "hotel" },
  { value: "restauration", label: "Restauration", icon: "restaurant" },
  { value: "transport", label: "Transport", icon: "directions_car" },
  { value: "activite", label: "Activités", icon: "hiking" },
  { value: "guide", label: "Guide", icon: "person" },
  { value: "atelier", label: "Ateliers", icon: "brush" },
  { value: "location_materiel", label: "Location matériel", icon: "backpack" },
  { value: "spa_bien_etre", label: "Spa & Bien-être", icon: "spa" },
];

const BADGE_CONFIGS: Record<Role, { label: string; icon: string; description: string }[]> = {
  eco_traveler: [
    { label: "Explorateur Durable", icon: "explore", description: "Onboarding complété" },
    { label: "Ambassadeur", icon: "stars", description: "Score ≥ 80%" },
    { label: "Contributeur Communautaire", icon: "groups", description: "3 plans partagés" },
    { label: "Protecteur de la Nature", icon: "eco", description: "10 réservations durables" },
  ],
  guide: [
    { label: "Guide Éco-Certifié", icon: "verified", description: "Onboarding complété" },
    { label: "Guide Ambassadeur Éco-Voyage", icon: "stars", description: "Score ≥ 80%" },
    { label: "Guide Expert", icon: "psychology", description: "10 réservations gérées" },
    { label: "Formateur Durable", icon: "school", description: "5 évaluations reçues" },
  ],
  provider: [
    { label: "Propriétaire Éco-Certifié", icon: "verified", description: "Onboarding complété" },
    { label: "Ambassadeur Éco-Voyage", icon: "stars", description: "Score ≥ 80%" },
    { label: "Projet d'Excellence", icon: "domain_verification", description: "10 réservations gérées" },
    { label: "Champion Durable", icon: "eco", description: "5 évaluations reçues" },
  ],
};

function getScoreLabel(score: number | null, role: Role): string {
  if (score === null) return "—";
  const labels: Record<Role, string[]> = {
    eco_traveler: ["Ambassadeur durable", "Écovoyageur engagé", "Voyageur sensible", "Voyageur classique"],
    guide: ["Guide Ambassadeur", "Guide Expert", "Guide Engagé", "Guide en Développement"],
    provider: ["Propriétaire Ambassadeur", "Propriétaire Engagé", "Propriétaire Sensible", "Propriétaire en Développement"],
  };
  const l = labels[role];
  if (score >= 80) return l[0];
  if (score >= 60) return l[1];
  if (score >= 40) return l[2];
  return l[3];
}

function getScoreColor(score: number | null): string {
  if (score === null) return "text-slate-400";
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-primary";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

function getBarColor(score: number | null): string {
  if (score === null) return "bg-slate-300";
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-primary";
  if (score >= 40) return "bg-orange-400";
  return "bg-red-400";
}

function StatusBadge({ status, reason }: { status: string; reason?: string | null }) {
  if (status === "approved" || status === "active") {
    return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">Publié</span>;
  }
  if (status === "rejected") {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-600">Refusé</span>
        {reason && <p className="text-[10px] font-medium text-red-500 max-w-[160px] text-right leading-tight">{reason}</p>}
      </div>
    );
  }
  if (status === "draft") {
    return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">Brouillon</span>;
  }
  return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">En attente</span>;
}

function ScoreBreakdown({ profile, role }: { profile: AnyProfile; role: Role }) {
  const components = role === "eco_traveler"
    ? [
        { label: "Questionnaire", weight: "20%", value: profile.score_questionnaire, color: "bg-green-500" },
        { label: "Réservations", weight: "40%", value: profile.score_reservations, color: "bg-blue-500" },
        { label: "Feedbacks", weight: "20%", value: profile.score_feedbacks, color: "bg-orange-400" },
        { label: "Partages", weight: "20%", value: profile.score_partages ?? 0, color: "bg-purple-400" },
      ]
    : [
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

function VenueTypeIcon({ types }: { types: string[] | null }) {
  const found = VENUE_TYPES.find((t) => t.value === types?.[0]);
  return <span className="material-symbols-outlined text-2xl text-primary">{found?.icon ?? "domain"}</span>;
}

function DeleteConfirmModal({ onClose, onConfirm, title, message }: {
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="modal-content bg-white rounded-3xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <span className="material-symbols-outlined text-5xl text-red-400 mb-3">delete</span>
          <h3 className="text-lg font-extrabold text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-500 font-medium mb-6">{message}</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm">Annuler</button>
            <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors text-sm">Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddPublicationModal({ onClose, onSuccess, token, publication }: {
  onClose: () => void;
  onSuccess: (p: Publication) => void;
  token: string;
  publication?: Publication;
}) {
  const isEditing = !!publication;
  const [step, setStep] = useState<"place" | "experience" | null>(publication?.type ?? null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [form, setForm] = useState({
    title: publication?.title ?? "",
    description: publication?.description ?? "",
    place_name: publication?.place_name ?? "",
    region: publication?.region ?? "",
    lat: publication?.latitude ?? null as number | null,
    lng: publication?.longitude ?? null as number | null,
  });

  const inputClass = (hasErr: boolean) =>
    `w-full px-4 py-3 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 transition-all ${hasErr ? "bg-red-50 border border-red-400 focus:ring-red-300" : "bg-slate-50 border border-transparent focus:ring-primary"}`;

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title.trim()) { setTitleError("Le titre est obligatoire."); return; }
    setSubmitError("");
    setLoading(true);
    try {
      const url = isEditing ? `/publications/${publication.id}` : "/publications";
      const method = isEditing ? "PATCH" : "POST";
      const updated = await apiFetch<Publication>(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          type: step,
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          place_name: form.place_name.trim() || undefined,
          region: form.region.trim() || undefined,
          latitude: form.lat ?? undefined,
          longitude: form.lng ?? undefined,
        }),
      });
      onSuccess(updated);
    } catch (err: any) {
      setSubmitError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="modal-content bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-extrabold text-slate-900">
            {isEditing ? "Modifier la publication" : step === null ? "Que voulez-vous partager ?" : step === "place" ? "Partager un lieu" : "Partager une expérience"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>

        {step === null && (
          <div className="p-6 grid grid-cols-2 gap-4">
            <button onClick={() => setStep("place")} className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-slate-200 hover:border-primary hover:bg-primary/5 transition-all">
              <span className="material-symbols-outlined text-3xl text-primary">location_on</span>
              <span className="font-extrabold text-slate-800">Un lieu</span>
              <span className="text-xs text-slate-400 text-center">Recommandez un endroit sur la carte</span>
            </button>
            <button onClick={() => setStep("experience")} className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-slate-200 hover:border-primary hover:bg-primary/5 transition-all">
              <span className="material-symbols-outlined text-3xl text-primary">hiking</span>
              <span className="font-extrabold text-slate-800">Une expérience</span>
              <span className="text-xs text-slate-400 text-center">Partagez une aventure vécue</span>
            </button>
          </div>
        )}

        {step !== null && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Titre *</label>
              <input className={inputClass(!!titleError)} value={form.title}
                onChange={(e) => { setForm({ ...form, title: e.target.value }); setTitleError(""); }}
                placeholder={step === "place" ? "Oasis de Chebika, Djerba la Douce..." : "Trek dans le Jbel Chambi..."} />
              {titleError && <p className="text-xs font-semibold text-red-500">{titleError}</p>}
            </div>

            {step === "place" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-primary">location_on</span>
                    Cliquez sur la carte pour placer le lieu
                  </label>
                  <div className="overflow-hidden rounded-xl">
                    <MapPicker lat={form.lat ?? 36.8065} lng={form.lng ?? 10.1815} onPick={(lat, lng, address, region) => setForm({ ...form, lat: Number(lat), lng: Number(lng) })} />
                   </div>
                   {form.lat != null && <p className="text-xs text-slate-400 font-medium">📍 {Number(form.lat).toFixed(5)}, {Number(form.lng ?? 0).toFixed(5)}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Nom du lieu</label>
                    <input className={inputClass(false)} value={form.place_name} onChange={(e) => setForm({ ...form, place_name: e.target.value })} placeholder="Oasis de Chebika" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Région</label>
                    <input className={inputClass(false)} value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Tozeur, Nabeul..." />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Description</label>
              <textarea className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 font-medium resize-none"
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={step === "place" ? "Pourquoi recommandez-vous ce lieu ?" : "Décrivez votre expérience..."} rows={3} />
            </div>

            {submitError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <span className="material-symbols-outlined text-base text-red-500">error</span>
                <p className="text-sm font-semibold text-red-600">{submitError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => { if (isEditing) onClose(); else setStep(null); }} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">{isEditing ? "Annuler" : "Retour"}</button>
              <button type="submit" disabled={loading} className="flex-1 py-3 bg-primary text-slate-900 font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                {loading ? "Enregistrement..." : isEditing ? "Enregistrer" : "Publier"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function GuideOfferModal({ onClose, onSuccess, token }: {
  onClose: () => void;
  onSuccess: (o: Offer) => void;
  token: string;
}) {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; price?: string }>({});
  const [form, setForm] = useState({ title: "", offer_type: "", description: "", price: "", duration: "", region: "", location_type: "fixed" });

  const inputClass = (hasErr: boolean) =>
    `w-full px-4 py-3 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 transition-all ${hasErr ? "bg-red-50 border border-red-400 focus:ring-red-300" : "bg-slate-50 border border-transparent focus:ring-primary"}`;

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errors: { title?: string; price?: string } = {};
    if (!form.title.trim()) errors.title = "Le titre est obligatoire.";
    else if (form.title.trim().length < 3) errors.title = "Le titre doit contenir au moins 3 caractères.";
    if (form.price && isNaN(Number(form.price))) errors.price = "Le prix doit être un nombre.";
    if (form.price && Number(form.price) < 0) errors.price = "Le prix ne peut pas être négatif.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setSubmitError("");
    setLoading(true);
    try {
      const created = await apiFetch<Offer>("/offers", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: form.title.trim(),
          offer_type: form.offer_type || undefined,
          description: form.description.trim() || undefined,
          price: form.price ? Number(form.price) : undefined,
          duration: form.duration.trim() || undefined,
          region: form.region.trim() || undefined,
          location_type: form.location_type,
        }),
      });
      onSuccess(created);
    } catch (err: any) {
      setSubmitError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="modal-content bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-extrabold text-slate-900">Ajouter une offre</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Titre de l'offre *</label>
            <input className={inputClass(!!fieldErrors.title)} value={form.title}
              onChange={(e) => { setForm({ ...form, title: e.target.value }); setFieldErrors((fe) => ({ ...fe, title: undefined })); }}
              placeholder="Randonnée dans le Jbel Zaghouan..." />
            {fieldErrors.title && <p className="text-xs font-semibold text-red-500">{fieldErrors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Type d'offre</label>
            <div className="grid grid-cols-2 gap-2">
              {GUIDE_OFFER_TYPES.map((t) => {
                const active = form.offer_type === t.value;
                return (
                  <button key={t.value} type="button"
                    onClick={() => setForm({ ...form, offer_type: active ? "" : t.value })}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${active ? "bg-primary/10 border-primary text-slate-900" : "border-slate-200 text-slate-600 hover:border-primary/30"}`}>
                    <span className="material-symbols-outlined text-base">{t.icon}</span>
                    {t.label}
                    {active && <span className="material-symbols-outlined text-base ml-auto text-primary">check</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Type de localisation</label>
            <div className="flex gap-2">
              <button type="button"
                onClick={() => setForm({ ...form, location_type: "fixed" })}
                className={`flex-1 px-3 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${form.location_type === "fixed" ? "bg-primary/10 border-primary text-slate-900" : "border-slate-200 text-slate-600 hover:border-primary/30"}`}>
                <span className="block">📍 Fixe</span>
                <span className="block text-[10px] font-normal mt-0.5">Lieu précis (adresse GPS)</span>
              </button>
              <button type="button"
                onClick={() => setForm({ ...form, location_type: "mobile" })}
                className={`flex-1 px-3 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${form.location_type === "mobile" ? "bg-primary/10 border-primary text-slate-900" : "border-slate-200 text-slate-600 hover:border-primary/30"}`}>
                <span className="block">🚐 Mobile</span>
                <span className="block text-[10px] font-normal mt-0.5">Se déplace chez le voyageur</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Description</label>
            <textarea className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 font-medium resize-none"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Décrivez votre offre..." rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Prix (TND)</label>
              <input type="number" min="0" step="0.5" className={inputClass(!!fieldErrors.price)} value={form.price}
                onChange={(e) => { setForm({ ...form, price: e.target.value }); setFieldErrors((fe) => ({ ...fe, price: undefined })); }} placeholder="50" />
              {fieldErrors.price && <p className="text-xs font-semibold text-red-500">{fieldErrors.price}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Durée de l&apos;activité</label>
              <input className={inputClass(false)} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="2h, ½ journée, 1 journée..." />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Région / Emplacement</label>
            <input className={inputClass(false)} value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Tunis, Djerba, Sfax..." />
          </div>

          {submitError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <span className="material-symbols-outlined text-base text-red-500">error</span>
              <p className="text-sm font-semibold text-red-600">{submitError}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-primary text-slate-900 font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60">
            {loading ? "Publication en cours..." : "Publier l'offre"}
          </button>
        </form>
      </div>
    </div>
  );
}

function VenueOfferModal({ onClose, onSuccess, token, projects }: {
  onClose: () => void;
  onSuccess: (o: Offer) => void;
  token: string;
  projects: Venue[];
}) {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; price?: string }>({});
  const [form, setForm] = useState({ title: "", offer_type: "", venue_id: "", description: "", price: "", duration: "", region: "", location_type: "fixed" });

  const inputClass = (hasErr: boolean) =>
    `w-full px-4 py-3 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 transition-all ${hasErr ? "bg-red-50 border border-red-400 focus:ring-red-300" : "bg-slate-50 border border-transparent focus:ring-primary"}`;

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errors: { title?: string; price?: string } = {};
    if (!form.title.trim()) errors.title = "Le titre est obligatoire.";
    else if (form.title.trim().length < 3) errors.title = "Le titre doit contenir au moins 3 caractères.";
    if (form.price && (isNaN(Number(form.price)) || Number(form.price) < 0)) errors.price = "Le prix doit être un nombre positif.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setSubmitError("");
    setLoading(true);
    try {
      const created = await apiFetch<Offer>("/offers", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: form.title.trim(),
          offer_type: form.offer_type || undefined,
          venue_id: form.venue_id || undefined,
          description: form.description.trim() || undefined,
          price: form.price ? Number(form.price) : undefined,
          duration: form.duration.trim() || undefined,
          region: form.region.trim() || undefined,
          location_type: form.location_type,
        }),
      });
      onSuccess(created);
    } catch (err: any) {
      setSubmitError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="modal-content bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-extrabold text-slate-900">Ajouter une offre</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Titre de l'offre *</label>
            <input className={inputClass(!!fieldErrors.title)} value={form.title}
              onChange={(e) => { setForm({ ...form, title: e.target.value }); setFieldErrors((fe) => ({ ...fe, title: undefined })); }}
              placeholder="Week-end éco-lodge, Circuit des oasis..." />
            {fieldErrors.title && <p className="text-xs font-semibold text-red-500">{fieldErrors.title}</p>}
          </div>

          {(() => {
            const activeProjects = projects.filter((p) => p.status === "active");
            return (
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Établissement associé</label>
                {activeProjects.length === 0 ? (
                  <p className="text-xs font-medium text-amber-600 bg-amber-50 px-4 py-3 rounded-xl">
                    Aucun établissement validé. Vos projets doivent être approuvés par l'admin avant de pouvoir y lier une offre.
                  </p>
                ) : (
                  <select className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 font-medium"
                    value={form.venue_id} onChange={(e) => setForm({ ...form, venue_id: e.target.value })}>
                    <option value="">— Aucun établissement spécifique —</option>
                    {activeProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                )}
              </div>
            );
          })()}

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Type d'offre</label>
            <div className="flex flex-wrap gap-2">
              {PROJ_OFFER_TYPES.map((t) => {
                const active = form.offer_type === t.value;
                return (
                  <button key={t.value} type="button"
                    onClick={() => setForm({ ...form, offer_type: active ? "" : t.value })}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${active ? "bg-primary/10 border-primary text-slate-900" : "border-slate-200 text-slate-500 hover:border-primary/30"}`}>
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Type de localisation</label>
            <div className="flex gap-2">
              <button type="button"
                onClick={() => setForm({ ...form, location_type: "fixed" })}
                className={`flex-1 px-3 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${form.location_type === "fixed" ? "bg-primary/10 border-primary text-slate-900" : "border-slate-200 text-slate-600 hover:border-primary/30"}`}>
                <span className="block">📍 Fixe</span>
                <span className="block text-[10px] font-normal mt-0.5">Lieu précis (adresse GPS)</span>
              </button>
              <button type="button"
                onClick={() => setForm({ ...form, location_type: "mobile" })}
                className={`flex-1 px-3 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${form.location_type === "mobile" ? "bg-primary/10 border-primary text-slate-900" : "border-slate-200 text-slate-600 hover:border-primary/30"}`}>
                <span className="block">🚐 Mobile</span>
                <span className="block text-[10px] font-normal mt-0.5">Se déplace chez le voyageur</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Description</label>
            <textarea className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 font-medium resize-none"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Décrivez votre offre éco-touristique..." rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Prix (TND)</label>
              <input type="number" min="0" step="0.01" className={inputClass(!!fieldErrors.price)} value={form.price}
                onChange={(e) => { setForm({ ...form, price: e.target.value }); setFieldErrors((fe) => ({ ...fe, price: undefined })); }} placeholder="150" />
              {fieldErrors.price && <p className="text-xs font-semibold text-red-500">{fieldErrors.price}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Durée de l&apos;activité</label>
              <input className={inputClass(false)} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="2 jours, 1 semaine..." />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Région / Emplacement</label>
            <input className={inputClass(false)} value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Tunis, Djerba, Sfax..." />
          </div>

          {submitError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <span className="material-symbols-outlined text-base text-red-500">error</span>
              <p className="text-sm font-semibold text-red-600">{submitError}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-primary text-slate-900 font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60">
            {loading ? "Création en cours..." : "Publier l'offre"}
          </button>
        </form>
      </div>
    </div>
  );
}

const PHONE_RE = /^(\+216|00216)?[2-9]\d{7}$|^\+?[0-9\s\-().]{7,20}$/;
const URL_RE = /^https?:\/\/.+\..+/;

async function uploadImage(file: File, token: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!res.ok) throw new Error("Upload échoué");
  return ((await res.json()) as { url: string }).url;
}

function EditVenueModal({ onClose, onSuccess, token, project }: {
  onClose: () => void;
  onSuccess: (p: Venue) => void;
  token: string;
  project: Venue;
}) {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({
    name: project.name ?? "",
    venue_types: (project.venue_type ?? []) as string[],
    description: project.description ?? "",
    region: project.region ?? "",
    address: project.address ?? "",
    website: project.website ?? "",
    phone: project.phone ?? "",
    opening_hours: project.opening_hours ?? "",
    facebook: project.facebook ?? "",
    instagram: project.instagram ?? "",
    services: (project.services ?? []) as string[],
    eco_labels: (project.eco_labels ?? []) as string[],
  });
  const [mapLat, setMapLat] = useState<number | null>(project.lat ?? null);
  const [mapLng, setMapLng] = useState<number | null>(project.lng ?? null);

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) { setSubmitError("Le nom est obligatoire."); return; }
    setSubmitError("");
    setLoading(true);
    try {
      const updated = await apiFetch<Venue>(`/providers/venues/${project.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name.trim(),
          project_type: form.venue_types.length ? form.venue_types : undefined,
          description: form.description.trim() || undefined,
          region: form.region.trim() || undefined,
          address: form.address.trim() || undefined,
          website: form.website.trim() || undefined,
          phone: form.phone.trim() || undefined,
          opening_hours: form.opening_hours.trim() || undefined,
          facebook: form.facebook.trim() || undefined,
          instagram: form.instagram.trim() || undefined,
          lat: mapLat ?? undefined,
          lng: mapLng ?? undefined,
          services: form.services.length ? form.services : undefined,
          eco_labels: form.eco_labels.length ? form.eco_labels : undefined,
        }),
      });
      onSuccess(updated);
    } catch (err: any) {
      setSubmitError(err.message || "Erreur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="modal-content bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-extrabold text-slate-900">Modifier le projet</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"><span className="material-symbols-outlined text-slate-500">close</span></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Nom *</label>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Type d'établissement</label>
            <div className="grid grid-cols-2 gap-2">
              {VENUE_TYPES.map((t) => {
                const active = form.venue_types.includes(t.value);
                return (
                  <button key={t.value} type="button" onClick={() => {
                    setForm((f) => ({ ...f, venue_types: active ? f.venue_types.filter((v) => v !== t.value) : [...f.venue_types, t.value] }));
                  }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${active ? "bg-primary/10 border-primary text-slate-900" : "border-slate-200 text-slate-600 hover:border-primary/30"}`}>
                    <span className="material-symbols-outlined text-base">{t.icon}</span>{t.label}
                    {active && <span className="material-symbols-outlined text-base ml-auto text-primary">check</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Services proposés</label>
            <div className="grid grid-cols-2 gap-2">
              {VENUE_SERVICES.map((s) => {
                const active = form.services.includes(s.value);
                return (
                  <button key={s.value} type="button" onClick={() => {
                    setForm((f) => ({ ...f, services: active ? f.services.filter((v) => v !== s.value) : [...f.services, s.value] }));
                  }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${active ? "bg-primary/10 border-primary text-slate-900" : "border-slate-200 text-slate-600 hover:border-primary/30"}`}>
                    <span className="material-symbols-outlined text-base">{s.icon}</span>{s.label}
                    {active && <span className="material-symbols-outlined text-base ml-auto text-primary">check</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Description</label>
            <textarea className={`${inputClass} resize-none`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Région</label>
              <input className={inputClass} value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Téléphone</label>
              <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Adresse</label>
            <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Site web</label>
            <input className={inputClass} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Localisation</label>
            <MapPicker lat={mapLat ?? 36.8065} lng={mapLng ?? 10.1815} onPick={(la: number, ln: number, address: string, region: string) => { setMapLat(la); setMapLng(ln); setForm((f) => ({ ...f, address: address ?? f.address, region: region ?? f.region })); }} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Pratiques éco-responsables</label>
            <div className="flex flex-wrap gap-2">
              {ECO_PRACTICES.map((p) => {
                const active = form.eco_labels.includes(p);
                return (
                  <button key={p} type="button" onClick={() => {
                    setForm((f) => ({ ...f, eco_labels: active ? f.eco_labels.filter((v) => v !== p) : [...f.eco_labels, p] }));
                  }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${active ? "bg-green-50 border-green-400 text-green-700" : "border-slate-200 text-slate-500 hover:border-green-300"}`}>
                    {active && <span className="material-symbols-outlined text-sm">check</span>}{p}
                  </button>
                );
              })}
            </div>
          </div>
          {submitError && <p className="text-sm text-red-500 font-semibold">{submitError}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-base">check</span>}
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddVenueModal({ onClose, onSuccess, token }: {
  onClose: () => void;
  onSuccess: (p: Venue) => void;
  token: string;
}) {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string; website?: string; region?: string }>({});
  const [form, setForm] = useState({
    name: "", venue_types: [] as string[], description: "", region: "", address: "",
    website: "", phone: "", eco_labels: [] as string[], services: [] as string[],
    opening_hours: "", facebook: "", instagram: "",
  });
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [coverIdx, setCoverIdx] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLng, setMapLng] = useState<number | null>(null);

  const toggle = (key: "venue_types" | "eco_labels" | "services", v: string) =>
    setForm((f) => ({ ...f, [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v] }));

  function addImages(files: FileList | null) {
    if (!files) return;
    setImages((prev) => [...prev, ...Array.from(files).map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setCoverIdx((c) => (c >= idx && c > 0 ? c - 1 : c));
  }

  function validate() {
    const errors: { name?: string; phone?: string; website?: string; region?: string } = {};
    if (!form.name.trim()) errors.name = "Le nom de l'établissement est obligatoire.";
    else if (form.name.trim().length < 2) errors.name = "Le nom doit contenir au moins 2 caractères.";
    if (form.phone && !PHONE_RE.test(form.phone.replace(/\s/g, ""))) errors.phone = "Numéro de téléphone invalide.";
    if (form.website && !URL_RE.test(form.website)) errors.website = "L'URL doit commencer par http:// ou https://";
    if (form.region && form.region.trim().length === 1) errors.region = "La région doit contenir au moins 2 caractères.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError("");
    setLoading(true);
    try {
      const uploaded = await Promise.all(images.map((img) => uploadImage(img.file, token)));
      const ordered = uploaded.length ? [uploaded[coverIdx], ...uploaded.filter((_, i) => i !== coverIdx)] : [];
      const created = await apiFetch<Venue>("/providers/venues", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name.trim(),
          project_type: form.venue_types.length ? form.venue_types : undefined,
          description: form.description.trim() || undefined,
          region: form.region.trim() || undefined,
          address: form.address.trim() || undefined,
          website: form.website.trim() || undefined,
          phone: form.phone.trim() || undefined,
          eco_labels: form.eco_labels.length ? form.eco_labels : undefined,
          services: form.services.length ? form.services : undefined,
          opening_hours: form.opening_hours.trim() || undefined,
          facebook: form.facebook.trim() || undefined,
          instagram: form.instagram.trim() || undefined,
          lat: mapLat ?? undefined,
          lng: mapLng ?? undefined,
          photos: ordered.length ? ordered : undefined,
        }),
      });
      onSuccess(created);
    } catch (err: any) {
      setSubmitError(err.message || "Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  const fc = (hasErr: boolean) =>
    `w-full px-4 py-3 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 transition-all ${hasErr ? "bg-red-50 border border-red-400 focus:ring-red-300" : "bg-slate-50 border border-transparent focus:ring-primary"}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="modal-content bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-extrabold text-slate-900">Ajouter un établissement</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Photos de l'établissement</label>
            <label htmlFor="proj-images" className="flex flex-col items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all bg-slate-50/70">
              <span className="material-symbols-outlined text-slate-300 text-3xl">add_photo_alternate</span>
              <p className="text-xs font-semibold text-slate-400">Cliquez pour ajouter des photos</p>
              <input id="proj-images" type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addImages(e.target.files); e.target.value = ""; }} />
            </label>
            {images.length > 0 && (
              <>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {images.map((img, i) => (
                    <div key={i} onClick={() => setCoverIdx(i)}
                      className={`relative group aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${i === coverIdx ? "border-primary shadow-md" : "border-transparent hover:border-slate-300"}`}>
                      <img src={img.preview} alt="" className="w-full h-full object-cover" />
                      {i === coverIdx && <div className="absolute top-1 left-1 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-md leading-none">Cover</div>}
                      <button type="button" onClick={(e) => { e.stopPropagation(); URL.revokeObjectURL(img.preview); removeImage(i); }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Cliquez sur une photo pour la définir comme cover.</p>
              </>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Nom du projet *</label>
            <input value={form.name} onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setFieldErrors((fe) => ({ ...fe, name: undefined })); }}
              placeholder="Éco-Lodge Sahara, Restaurant Terroir..." className={fc(!!fieldErrors.name)} />
            {fieldErrors.name && <p className="text-xs font-semibold text-red-500">{fieldErrors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Type d'établissement <span className="ml-1.5 text-xs font-normal text-slate-400">(plusieurs choix possibles)</span></label>
            <div className="grid grid-cols-2 gap-2">
              {VENUE_TYPES.map((t) => {
                const active = form.venue_types.includes(t.value);
                return (
                  <button key={t.value} type="button" onClick={() => toggle("venue_types", t.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${active ? "bg-primary/10 border-primary text-slate-900" : "border-slate-200 text-slate-600 hover:border-primary/30"}`}>
                    <span className="material-symbols-outlined text-base">{t.icon}</span>{t.label}
                    {active && <span className="material-symbols-outlined text-base ml-auto text-primary">check</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Décrivez votre établissement éco-touristique..."
              className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 font-medium resize-none" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Région</label>
            <input value={form.region} onChange={(e) => { setForm((f) => ({ ...f, region: e.target.value })); setFieldErrors((fe) => ({ ...fe, region: undefined })); }}
              placeholder="Tataouine, Djerba..." className={fc(!!fieldErrors.region)} />
            {fieldErrors.region && <p className="text-xs font-semibold text-red-500">{fieldErrors.region}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Téléphone</label>
              <input type="tel" value={form.phone} onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value })); setFieldErrors((fe) => ({ ...fe, phone: undefined })); }}
                placeholder="+216 XX XXX XXX" className={fc(!!fieldErrors.phone)} />
              {fieldErrors.phone && <p className="text-xs font-semibold text-red-500">{fieldErrors.phone}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Site web</label>
              <input value={form.website} onChange={(e) => { setForm((f) => ({ ...f, website: e.target.value })); setFieldErrors((fe) => ({ ...fe, website: undefined })); }}
                placeholder="https://mon-projet.tn" className={fc(!!fieldErrors.website)} />
              {fieldErrors.website && <p className="text-xs font-semibold text-red-500">{fieldErrors.website}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Services proposés <span className="ml-1.5 text-xs font-normal text-slate-400">(plusieurs choix possibles)</span></label>
            <div className="grid grid-cols-2 gap-2">
              {VENUE_SERVICES.map((s) => {
                const active = form.services.includes(s.value);
                return (
                  <button key={s.value} type="button" onClick={() => toggle("services", s.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${active ? "bg-primary/10 border-primary text-slate-900" : "border-slate-200 text-slate-600 hover:border-primary/30"}`}>
                    <span className="material-symbols-outlined text-base">{s.icon}</span>{s.label}
                    {active && <span className="material-symbols-outlined text-base ml-auto text-primary">check</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700">Localisation</label>
              <button type="button" onClick={() => setShowMap((v) => !v)} className="text-xs font-bold text-primary hover:underline">
                {showMap ? "Masquer la carte" : "Choisir sur la carte"}
              </button>
            </div>
            <input readOnly value={form.address} placeholder="Auto-rempli par la carte..."
              className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl text-slate-500 font-medium cursor-default" />
            {showMap && (
              <div className="overflow-hidden rounded-xl">
                <MapPicker lat={mapLat} lng={mapLng} onPick={(lat, lng, address, region) => {
                  setMapLat(lat); setMapLng(lng);
                  setForm((f) => ({ ...f, address: address ?? "", region: region ?? f.region }));
                }} />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Horaires d'ouverture</label>
            <input value={form.opening_hours} onChange={(e) => setForm((f) => ({ ...f, opening_hours: e.target.value }))}
              placeholder="Lun-Sam 9h-19h"
              className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 font-medium" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Facebook</label>
              <input value={form.facebook} onChange={(e) => setForm((f) => ({ ...f, facebook: e.target.value }))} placeholder="https://facebook.com/..."
                className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 font-medium" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Instagram</label>
              <input value={form.instagram} onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))} placeholder="https://instagram.com/..."
                className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 font-medium" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Pratiques éco-responsables</label>
            <div className="flex flex-wrap gap-2">
              {ECO_PRACTICES.map((p) => {
                const active = form.eco_labels.includes(p);
                return (
                  <button key={p} type="button" onClick={() => toggle("eco_labels", p)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${active ? "bg-green-50 border-green-400 text-green-700" : "border-slate-200 text-slate-500 hover:border-green-300"}`}>
                    {active && <span className="material-symbols-outlined text-sm">check</span>}{p}
                  </button>
                );
              })}
            </div>
          </div>

          {submitError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <span className="material-symbols-outlined text-base text-red-500">error</span>
              <p className="text-sm font-semibold text-red-600">{submitError}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-primary text-slate-900 font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60">
            {loading ? "Création en cours..." : "Créer le projet"}
          </button>
        </form>
      </div>
    </div>
  );
}

function MyReservationsTab() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newParticipants, setNewParticipants] = useState<{ full_name: string }[]>([]);

  const fetchBookings = () => {
    apiFetch<Booking[]>("/reservations/mine")
      .then(setBookings)
      .catch((err) => console.error("Erreur chargement réservations", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Annuler cette réservation ?")) return;
    try {
      await apiFetch(`/reservations/${id}/cancel`, { method: "PATCH" });
      fetchBookings();
    } catch (err: any) { alert(err.message); }
  };

  const handleAddParticipants = async (id: string) => {
    const valid = newParticipants.filter((p) => p.full_name.trim());
    if (!valid.length) return;
    try {
      await apiFetch(`/reservations/${id}/participants`, {
        method: "PATCH",
        body: JSON.stringify({ participants: valid }),
      });
      setAddingTo(null);
      setNewParticipants([]);
      fetchBookings();
    } catch (err: any) { alert(err.message); }
  };

  if (loading) return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />;

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
        <p className="text-slate-500 mb-4">Aucune réservation</p>
        <button onClick={() => router.push("/destinations")} className="text-primary underline text-sm">Découvrir des offres</button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <div key={b.id} className="bg-white rounded-2xl border border-slate-100 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-slate-800">{b.offer?.title}</h4>
              <p className="text-xs text-slate-400">{b.participants?.length ?? 0} participant(s)</p>
              <span className={`text-[10px] inline-block mt-1 px-2 py-0.5 rounded-full ${b.confirmation_mode === "automatic" ? "bg-emerald-50 text-primary" : "bg-amber-50 text-amber-600"}`}>
                {b.confirmation_mode === "automatic" ? "Confirmation instantanée" : "Confirmation manuelle"}
              </span>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${b.status === "confirmed" ? "bg-emerald-50 text-primary" : b.status === "cancelled" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
              {b.status === "confirmed" ? "Confirmée" : b.status === "cancelled" ? "Annulée" : "En attente"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-3">
            <span className="font-bold text-primary">{Number(b.total_price).toLocaleString()} TND</span>
            <div className="flex gap-2">
              {addingTo === b.id ? (
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="Nom participant"
                    value={newParticipants.map((p) => p.full_name).join(", ")}
                    onChange={(e) => setNewParticipants(e.target.value.split(",").map((s) => ({ full_name: s.trim() })).filter((p) => p.full_name))}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-xs w-40" />
                  <button onClick={() => handleAddParticipants(b.id)} className="text-xs text-white bg-primary rounded-lg px-2 py-1">OK</button>
                  <button onClick={() => { setAddingTo(null); setNewParticipants([]); }} className="text-xs text-slate-400">Annuler</button>
                </div>
              ) : (
                b.status !== "cancelled" && (
                  <>
                    <button onClick={() => { setAddingTo(b.id); setNewParticipants([{ full_name: "" }]); }} className="text-xs text-primary border border-emerald-200 rounded-lg px-3 py-1.5 hover:bg-emerald-50">
                      + Participants
                    </button>
                    <button onClick={() => handleCancel(b.id)} className="text-xs text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50">
                      Annuler
                    </button>
                  </>
                )
              )}
                  </div>
                </div>
              </div>
            ))}
    </div>
  );
}

function IncomingReservationsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Booking[]>("/reservations/incoming")
      .then(setBookings)
      .catch((err) => console.error("Erreur chargement réservations entrantes", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />;

  if (bookings.length === 0) {
    return <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center"><p className="text-slate-500">Aucune réservation reçue</p></div>;
  }

  const handleConfirm = async (id: string) => {
    try { await apiFetch(`/reservations/${id}/confirm`, { method: "PATCH" }); setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "confirmed" } : b)); } catch (err) { console.error("Erreur confirmation réservation", err); }
  };

  const handleCancel = async (id: string) => {
    try { await apiFetch(`/reservations/${id}/cancel`, { method: "PATCH" }); setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "cancelled" } : b)); setConfirmDeleteId(null); } catch (err) { console.error("Erreur annulation réservation", err); }
  };

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <div key={b.id} className="bg-white rounded-2xl border border-slate-100 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-slate-800">{b.offer?.title}</h4>
              <p className="text-xs text-slate-400">
                {b.traveler?.full_name || "Voyageur"} · {b.participants?.length ?? 1} participant(s)
              </p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${b.status === "confirmed" ? "bg-emerald-50 text-primary" : b.status === "cancelled" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
              {b.status === "confirmed" ? "Confirmée" : b.status === "cancelled" ? "Annulée" : "En attente"}
            </span>
          </div>
          {b.special_requests && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 mb-2">{b.special_requests}</p>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-primary">{Number(b.total_price).toLocaleString()} TND</span>
            <div className="flex gap-2">
              {b.status === "pending" && (
                <>
                  <button onClick={() => handleConfirm(b.id)} className="text-xs text-white bg-primary rounded-lg px-3 py-1.5 hover:bg-emerald-600">Accepter</button>
                  <button onClick={() => setConfirmDeleteId(b.id)} className="text-xs text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50">Refuser</button>
                </>
              )}
              {b.status === "confirmed" && (
                <span className="text-xs text-primary font-medium">✔ Réservation confirmée</span>
              )}
              {b.status === "cancelled" && (
                <span className="text-xs text-red-400 font-medium">✖ Réservation annulée</span>
              )}
            </div>
          </div>

          {confirmDeleteId === b.id && (
            <DeleteConfirmModal
              title="Refuser la réservation"
              message="Êtes-vous sûr de vouloir refuser cette réservation ?"
              onClose={() => setConfirmDeleteId(null)}
              onConfirm={() => handleCancel(b.id)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function ActividadesSection({ offerId, items, token }: { offerId: string; items: OfferItem[]; token: string }) {
  const [itemList, setItemList] = useState<OfferItem[]>(items);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState("");
  const [priceLabel, setPriceLabel] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);

  const activeItems = itemList.filter((i) => i.status === "active");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Le nom est requis"); return; }
    if (!price) { setError("Le prix est requis"); return; }
    setError(null);
    try {
      const created = await apiFetch<any>(`/offers/${offerId}/items`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), description: desc.trim() || undefined, item_type: type || undefined }),
      });
      if (price) {
        await apiFetch(`/offers/items/${created.id}/prices`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ label: priceLabel.trim() || "Plein tarif", price: Number(price), is_default: true }),
        });
      }
      const updated = await apiFetch<any>(`/offers/${offerId}`);
      setItemList(updated.items ?? []);
      setName(""); setDesc(""); setType(""); setPriceLabel(""); setPrice("");
      setAdding(false);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="my-2">
      {activeItems.length > 0 && (
        <div className="space-y-1 mb-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activités ({activeItems.length})</p>
          {activeItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5">
              <div>
                <span className="text-sm font-medium text-slate-700">{item.name}</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {item.details_json?.room_sub_type && <span className="text-[9px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded-full">{item.details_json.room_sub_type}</span>}
                  {item.details_json?.bed_count != null && <span className="text-[9px] text-blue-600 bg-blue-50 px-1 py-0.5 rounded-full">🛏 {item.details_json.bed_count}</span>}
                  {item.details_json?.tent_capacity != null && <span className="text-[9px] text-green-600 bg-green-50 px-1 py-0.5 rounded-full">⛺ {item.details_json.tent_capacity}p</span>}
                  {item.prices?.[0] && <span className="text-xs text-primary ml-1">{Number(item.prices[0].price).toLocaleString()} TND</span>}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded-full">{item.item_type ?? "activité"}</span>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <form onSubmit={handleAdd} className="bg-slate-50 rounded-xl p-3 space-y-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de l'activité *" className="text-slate-800 w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optionnelle)" className="text-slate-800 w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          <div className="grid grid-cols-2 gap-2">
            <select value={type} onChange={(e) => setType(e.target.value)} className="text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
              <option value="">Type</option>
              <optgroup label="Outdoor">
                <option value="activity">Activité outdoor</option>
                <option value="kayak">Kayak</option>
                <option value="paddle">Paddle</option>
                <option value="trekking">Trekking</option>
                <option value="vtt">VTT</option>
                <option value="escalade">Escalade</option>
                <option value="tyrolienne">Tyrolienne</option>
                <option value="speleologie">Spéléologie</option>
                <option value="randonnee">Randonnée</option>
                <option value="equitation">Équitation</option>
              </optgroup>
              <optgroup label="Nature">
                <option value="observation">Observation oiseaux</option>
                <option value="astronomie">Astronomie</option>
                <option value="photographie">Photographie</option>
              </optgroup>
              <optgroup label="Culture & Bien-être">
                <option value="yoga">Yoga</option>
                <option value="meditation">Méditation</option>
                <option value="poterie">Poterie</option>
                <option value="tissage">Tissage</option>
                <option value="cuisine">Cuisine locale</option>
                <option value="musique">Musique traditionnelle</option>
                <option value="calligraphie">Calligraphie</option>
              </optgroup>
              <optgroup label="Services">
                <option value="accommodation">Hébergement</option>
                <option value="meal">Repas</option>
                <option value="transport">Transport</option>
                <option value="workshop">Atelier</option>
              </optgroup>
              <option value="other">Autre</option>
            </select>
            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Prix *" className="text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          </div>
          {type === "other" && (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de l'activité *" className="text-slate-800 w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          )}
          <input value={priceLabel} onChange={(e) => setPriceLabel(e.target.value)} placeholder="Libellé du prix (ex: Plein tarif)" className="text-slate-800 w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => { setAdding(false); setError(null); }} className="flex-1 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-500 hover:bg-slate-100">Annuler</button>
            <button type="submit" className="flex-1 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-emerald-600">Ajouter</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs font-medium text-primary hover:text-emerald-700">
          <span className="material-symbols-outlined text-sm">add</span> Ajouter une activité
        </button>
      )}
    </div>
  );
}

function CreateCircuitModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [region, setRegion] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Le titre est requis"); return; }
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      await apiFetch("/circuits", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          region: region.trim() || undefined,
          base_price: basePrice ? Number(basePrice) : undefined,
          duration_days: durationDays ? Number(durationDays) : undefined,
          images: images.length > 0 ? images : undefined,
        }),
      });
      onCreated();
      onClose();
    } catch (e: any) {
      setError(e.message || "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="modal-content bg-white rounded-2xl shadow-lg mx-4 w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Nouveau circuit</h3>
        {error && <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre du circuit *" className="text-slate-800 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={3} className="text-slate-800 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none" />
          <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Région" className="text-slate-800 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="Prix de base" className="text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
            <input type="number" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} placeholder="Jours" className="text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          </div>
          <ImageUploader images={images} onChange={setImages} maxImages={5} label="Images du circuit" />
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">Annuler</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting && <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BookCircuitModal({ onClose, circuit }: { onClose: () => void; circuit: any }) {
  const router = useRouter();
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="modal-content bg-white rounded-3xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <span className="material-symbols-outlined text-5xl text-primary mb-3">route</span>
          <h3 className="text-lg font-extrabold text-slate-900 mb-2">{circuit.title}</h3>
          <p className="text-sm text-slate-500 font-medium mb-1">{circuit.description}</p>
          <p className="text-lg font-extrabold text-primary mb-6">{Number(circuit.base_price ?? circuit.price ?? 0).toLocaleString()} TND</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm">Annuler</button>
            <button onClick={() => { router.push(`/circuits/${circuit.id}`); }} className="flex-1 py-2.5 bg-primary text-slate-900 font-bold rounded-xl hover:-translate-y-0.5 transition-all text-sm shadow-lg shadow-emerald-500/20">
              Réserver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TripPlansList() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { setLoading(false); return; }
    apiFetch<any[]>("/trip-plans/mine", { headers: { Authorization: `Bearer ${token}` } })
      .then(setPlans)
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />;

  if (plans.length === 0) {
    return <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center"><p className="text-slate-500">Aucun trip plan pour le moment</p></div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {plans.map((p: any) => (
        <div key={p.id} className="bg-white rounded-2xl border border-slate-100 p-4">
          <h4 className="font-semibold text-slate-800 mb-1">{p.title}</h4>
          {p.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{p.description}</p>}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">{p.items?.length ?? 0} élément{(p.items?.length ?? 0) > 1 ? "s" : ""}</span>
            <button onClick={() => router.push(`/trip-plans/${p.id}`)}
              className="text-xs text-primary border border-emerald-200 rounded-lg px-3 py-1.5 hover:bg-emerald-50">
              Voir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function EcoTravelerOffersSection({ router }: { router: any }) {
  const [offers, setOffers] = useState<any[]>([]);
  const [reservedIds, setReservedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "available" | "reserved">("all");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    Promise.all([
      apiFetch<any[]>("/offers").catch(() => []),
      token ? apiFetch<any[]>("/reservations/mine", { headers: { Authorization: `Bearer ${token}` } }).catch(() => []) : Promise.resolve([]),
    ]).then(([allOffers, bookings]) => {
      setOffers(allOffers);
      const activeBookings = bookings.filter((b: any) => b.status !== "cancelled" && b.status !== "rejected");
      const ids = new Set(activeBookings.map((b: any) => b.offer?.id).filter(Boolean));
      setReservedIds(ids);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = filter === "available"
    ? offers.filter((o) => !reservedIds.has(o.id))
    : filter === "reserved"
    ? offers.filter((o) => reservedIds.has(o.id))
    : offers;

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Offres</h3>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-300">
            <option value="all">Toutes</option>
            <option value="available">Disponibles</option>
            <option value="reserved">Réservées</option>
          </select>
          <button onClick={() => router.push("/offers")} className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl text-sm hover:bg-primary/20 transition-colors">
            Voir tout
          </button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">storefront</span>
          <p className="font-bold text-slate-500">
            {filter === "reserved" ? "Aucune offre réservée" : "Aucune offre disponible"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filtered.map((offer) => {
            const isReserved = reservedIds.has(offer.id);
            return (
              <div key={offer.id} className="bg-white rounded-2xl border border-primary/5 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/offers/${offer.id}`)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-lg">storefront</span>
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 leading-tight">{offer.title}</p>
                    {offer.offer_type && <p className="text-xs font-bold text-primary mt-0.5">{offer.offer_type}</p>}
                  </div>
                  {isReserved && <span className="ml-auto text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Réservé</span>}
                </div>
                {offer.description && <p className="text-sm text-slate-500 font-medium line-clamp-2">{offer.description}</p>}
                <div className="flex items-center gap-3 mt-auto pt-2 border-t border-slate-100">
                  {offer.region && <span className="text-xs text-slate-400">{offer.region}</span>}
                  <div className="ml-auto flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); router.push(`/offers/${offer.id}`); }} className="px-3 py-1 bg-primary/10 text-primary font-bold rounded-lg text-xs hover:bg-primary/20">Détails</button>
                    {isReserved ? (
                      <button onClick={(e) => { e.stopPropagation(); router.push("/dashboard/reservations"); }} className="px-3 py-1 bg-blue-50 text-blue-600 font-bold rounded-lg text-xs hover:bg-blue-100">Gérer</button>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); router.push(`/reservations/new?offerId=${offer.id}`); }} className="px-3 py-1 bg-primary text-white font-bold rounded-lg text-xs hover:bg-emerald-600">Réserver</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CircuitsTab({ role, router, token }: { role: string; router: any; token: string }) {
  const [circuits, setCircuits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [bookCircuit, setBookCircuit] = useState<any | null>(null);
  const isProvider = role === "guide" || role === "provider";

  const loadCircuits = useCallback(() => {
    setLoading(true);
    if (isProvider && token) {
      apiFetch<any[]>("/circuits/mine", { headers: { Authorization: `Bearer ${token}` } })
        .then(setCircuits)
        .catch(() => setCircuits([]))
        .finally(() => setLoading(false));
    } else {
      apiFetch<any[]>("/circuits")
        .then(setCircuits)
        .catch(() => setCircuits([]))
        .finally(() => setLoading(false));
    }
  }, [isProvider, token]);

  useEffect(() => { loadCircuits(); }, [loadCircuits]);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce circuit ?")) return;
    try {
      await apiFetch(`/circuits/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setCircuits((prev) => prev.filter((c) => c.id !== id));
    } catch { alert("Erreur lors de la suppression"); }
  };

  if (loading) return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />;

  return (
    <div>
      {isProvider && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-400">{circuits.length} circuit{circuits.length > 1 ? "s" : ""}</p>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-emerald-600">
            <span className="material-symbols-outlined text-base">add</span> Créer un circuit
          </button>
        </div>
      )}

      {!isProvider && (
        <p className="text-sm text-slate-400 mb-4">Circuits éco-responsables disponibles</p>
      )}

      {circuits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
          <p className="text-slate-500">{isProvider ? "Vous n'avez pas encore créé de circuit" : "Aucun circuit disponible"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {circuits.map((c: any) => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-100 p-4">
              <h4 className="font-semibold text-slate-800 mb-1">{c.title}</h4>
              <p className="text-xs text-slate-400 mb-3 line-clamp-2">{c.description}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 flex-wrap">
                {c.status && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    c.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                    c.status === "pending" ? "bg-amber-100 text-amber-700" :
                    c.status === "draft" ? "bg-slate-100 text-slate-500" :
                    c.status === "rejected" ? "bg-red-100 text-red-600" :
                    "bg-slate-100 text-slate-400"
                  }`}>
                    {c.status === "approved" ? "✅ Approuvé" :
                     c.status === "pending" ? "⏳ En attente" :
                     c.status === "draft" ? "📝 Brouillon" :
                     c.status === "rejected" ? "❌ Rejeté" :
                     c.status}
                  </span>
                )}
                {c.difficulty_level && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${c.difficulty_level === "easy" ? "bg-emerald-100 text-emerald-700" : c.difficulty_level === "moderate" ? "bg-amber-100 text-amber-700" : c.difficulty_level === "hard" ? "bg-red-100 text-red-700" : "bg-slate-800 text-white"}`}>
                    {c.difficulty_level === "easy" ? "🟢 Facile" : c.difficulty_level === "moderate" ? "🟡 Modéré" : c.difficulty_level === "hard" ? "🔴 Difficile" : "⚫ Expert"}
                  </span>
                )}
                <span className="font-bold text-primary">{Number(c.base_price ?? c.price ?? 0).toLocaleString()} TND</span>
              </div>
              <div className="flex gap-2">
                  <button onClick={() => router.push(`/circuits/${c.id}`)} className="text-xs text-primary border border-emerald-200 rounded-lg px-3 py-1.5 hover:bg-emerald-50">Détails</button>
                  {role === "eco_traveler" && c.status === "approved" && (
                    <button onClick={() => setBookCircuit(c)} className="text-xs text-white bg-primary rounded-lg px-3 py-1.5 hover:bg-emerald-600">Réserver</button>
                  )}
                  {isProvider && (
                    <>
                      <button onClick={() => router.push(`/circuits/${c.id}`)} className="text-xs text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50">Modifier</button>
                      <button onClick={() => handleDelete(c.id)} className="text-xs text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50">Supprimer</button>
                    </>
                  )}
                </div>
              </div>
          ))}
        </div>
      )}

      {showCreate && <CircuitBuilderWizard token={token} onClose={() => setShowCreate(false)} onSuccess={loadCircuits} />}
      {bookCircuit && <BookCircuitModal onClose={() => setBookCircuit(null)} circuit={bookCircuit} />}
    </div>
  );
}

function NotificationsTab() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Notification[]>("/notifications")
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    try { await apiFetch(`/notifications/${id}/read`, { method: "PATCH" }); setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n)); } catch {}
  };
  const markAllRead = async () => {
    try { await apiFetch("/notifications/read-all", { method: "PATCH" }); setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true }))); } catch {}
  };

  if (loading) return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />;

  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-400">{unread} non lue{unread > 1 ? "s" : ""}</p>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-xs text-primary hover:text-emerald-700 font-medium">Tout marquer comme lu</button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center"><p className="text-slate-500">Aucune notification</p></div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className={`bg-white rounded-xl border p-4 ${n.is_read ? "border-slate-100" : "border-emerald-200"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm ${n.is_read ? "text-slate-600" : "text-slate-800 font-semibold"}`}>{n.title}</h4>
                    {!n.is_read && <span className="w-2 h-2 bg-emerald-400 rounded-full shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                    {n.link && <button onClick={() => { if (n.link) window.location.href = n.link; }} className="text-[10px] text-primary hover:underline">Voir détails</button>}
                  </div>
                </div>
                {!n.is_read && (
                  <button onClick={() => markRead(n.id)} className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary" title="Marquer comme lu">
                    <span className="material-symbols-outlined text-base">done</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ParametresTab({ router, handleLogout }: { router: any; handleLogout: () => void }) {
  const rolePaths: Record<Role, string> = {
    eco_traveler: "/profile/ecovoyageur",
    guide: "/profile/guide",
    provider: "/profile/provider",
  };

  const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const userRole = raw ? (JSON.parse(raw) as { role: string }).role as Role : "eco_traveler";
  const profilePath = rolePaths[userRole] || "/profile/ecovoyageur";

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Paramètres</h3>
        <div className="space-y-2">
          <button onClick={() => router.push(profilePath)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-slate-50 transition-colors text-left">
            <span className="material-symbols-outlined text-primary">person</span>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Mon Profil</p>
              <p className="text-xs text-slate-400">Modifier vos informations personnelles</p>
            </div>
          </button>
          <button onClick={() => router.push("/messagerie")}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-slate-50 transition-colors text-left">
            <span className="material-symbols-outlined text-primary">chat</span>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Messagerie</p>
              <p className="text-xs text-slate-400">Vos conversations</p>
            </div>
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-red-50 transition-colors text-left">
            <span className="material-symbols-outlined text-red-500">logout</span>
            <div>
              <p className="font-semibold text-red-600 text-sm">Déconnexion</p>
              <p className="text-xs text-slate-400">Se déconnecter de votre compte</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [profile, setProfile] = useState<AnyProfile | null>(null);
  const [activeItem, setActiveItem] = useState(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash) return decodeURIComponent(hash);
    }
    return "Tableau de bord";
  });
  const [showScoreDetail, setShowScoreDetail] = useState(false);
  const [token, setToken] = useState("");
  const [publications, setPublications] = useState<Publication[]>([]);
  const [showAddPublication, setShowAddPublication] = useState(false);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [showAddVenue, setShowAddVenue] = useState(false);
  const [editingVenue, setEditingVenue] = useState<any>(null);
  const [dashConvos, setDashConvos] = useState<DashConv[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [offerTypeFilter, setOfferTypeFilter] = useState("");

  useEffect(() => {
    async function init() {
      const storedUser = localStorage.getItem("user");
      const tkn = localStorage.getItem("access_token");
      if (!storedUser || !tkn) { router.push("/auth/login"); return; }

      try {
        const parsedUser = JSON.parse(storedUser) as { role: string };
        if (parsedUser.role === "admin") { router.push("/admin"); return; }
        const userRole = parsedUser.role as Role;
        if (!["eco_traveler", "guide", "provider"].includes(userRole)) {
          router.push("/auth/login"); return;
        }
        setRole(userRole);
        setToken(tkn);
        apiFetch<DashConv[]>("/messages/conversations", { headers: { Authorization: `Bearer ${tkn}` } })
          .then(setDashConvos).catch(() => {});

        const apiPath = userRole === "eco_traveler" ? "/eco-traveler/profile"
          : userRole === "guide" ? "/guide/profile"
          : "/providers/profile";
        const onboardingPath = userRole === "eco_traveler" ? "/onboarding/eco-traveler"
          : userRole === "guide" ? "/onboarding/guide"
          : "/onboarding/provider";

        try {
          const p = await apiFetch<AnyProfile>(apiPath, { headers: { Authorization: `Bearer ${tkn}` } });
          setProfile(p);
          if (!p?.is_onboarded) { router.push(onboardingPath); return; }
        } catch {
          router.push(onboardingPath); return;
        }

        if (userRole === "eco_traveler") {
          try {
            const pubs = await apiFetch<Publication[]>("/publications/mine", { headers: { Authorization: `Bearer ${tkn}` } });
            setPublications(pubs);
          } catch {}
        } else {
          try {
            const myOffers = await apiFetch<Offer[]>("/offers/mine", { headers: { Authorization: `Bearer ${tkn}` } });
            setOffers(myOffers);
          } catch {}
        }
      } catch {
        router.push("/auth/login");
      }
    }
    init();
  }, [router]);

  // Sync active tab to URL hash for refresh persistence
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash !== activeItem) {
        window.location.hash = encodeURIComponent(activeItem);
      }
    }
  }, [activeItem]);

  // Listen for hash changes (back/forward)
  useEffect(() => {
    function onHashChange() {
      const hash = window.location.hash.replace("#", "");
      if (hash) setActiveItem(decodeURIComponent(hash));
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  useEffect(() => {
    if (!token) return;
    apiFetch<number>("/notifications/unread", { headers: { Authorization: `Bearer ${token}` } })
      .then((count) => setUnreadCount(count ?? 0))
      .catch(() => {});
  }, [token]);

  async function handleLogout() {
    try { if (token) await logoutUser(token); } catch {}
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  }

  async function handleDeletePublication(id: string) {
    if (!confirm("Supprimer cette publication ?")) return;
    try {
      await apiFetch(`/publications/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setPublications((prev) => prev.filter((p) => p.id !== id));
    } catch { alert("Erreur lors de la suppression."); }
  }

  async function handleDeleteOffer(id: string) {
    if (!confirm("Supprimer cette offre ?")) return;
    try {
      await apiFetch(`/offers/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setOffers((prev) => prev.filter((o) => o.id !== id));
    } catch { alert("Erreur lors de la suppression."); }
  }

  const [offerActionMenu, setOfferActionMenu] = useState<string | null>(null);
  const [linkedCircuitsModal, setLinkedCircuitsModal] = useState<{ offerId: string; circuits: any[] } | null>(null);

  async function handleArchiveOffer(id: string) {
    if (!confirm('Archiver cette offre ? Elle ne sera plus visible publiquement.')) return;
    try {
      await apiFetch(`/offers/${id}/archive`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      setOffers((prev) => prev.map((o) => o.id === id ? { ...o, status: 'archived' } : o));
      setOfferActionMenu(null);
    } catch (e: any) { alert(e.message || "Erreur lors de l'archivage."); }
  }

  async function handleDeactivateOffer(id: string) {
    if (!confirm('Désactiver cette offre ? Elle sera masquée temporairement.')) return;
    try {
      await apiFetch(`/offers/${id}/deactivate`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      setOffers((prev) => prev.map((o) => o.id === id ? { ...o, status: 'inactive' } : o));
      setOfferActionMenu(null);
    } catch (e: any) { alert(e.message || "Erreur lors de la désactivation."); }
  }

  async function handlePublishOffer(id: string) {
    try {
      await apiFetch(`/offers/${id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: 'approved' }) });
      setOffers((prev) => prev.map((o) => o.id === id ? { ...o, status: 'approved' } : o));
      setOfferActionMenu(null);
    } catch (e: any) { alert(e.message || "Erreur lors de la publication."); }
  }

  async function handleViewLinkedCircuits(id: string) {
    try {
      const circuits = await apiFetch<any[]>(`/offers/${id}/linked-circuits`, { headers: { Authorization: `Bearer ${token}` } });
      setLinkedCircuitsModal({ offerId: id, circuits });
      setOfferActionMenu(null);
    } catch (e: any) { alert(e.message || "Erreur lors de la récupération."); }
  }

  async function handleDeleteVenue(venueId: string) {
    if (!confirm("Supprimer cet établissement ?")) return;
    try {
      await apiFetch(`/providers/venues/${venueId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setProfile((prev) => prev ? { ...prev, venues: prev.venues?.filter((p) => p.id !== venueId) } : prev);
    } catch { alert("Erreur lors de la suppression."); }
  }

  const navItems = role === "eco_traveler"
    ? [
        { label: "Tableau de bord", icon: "dashboard" },
        { label: "Offres", icon: "storefront" },
        { label: "Mes Publications", icon: "public" },
        { label: "Trip Plans", icon: "map" },
        { label: "Réservations", icon: "event_available" },
        { label: "Circuits", icon: "route" },
        { label: "Notifications", icon: "notifications" },
        { label: "Paramètres", icon: "settings" },
      ]
    : role === "guide"
    ? [
        { label: "Tableau de bord", icon: "dashboard" },
        { label: "Mes Prestations", icon: "badge" },
        { label: "Certifications", icon: "school" },
        { label: "Réservations", icon: "event_available" },
        { label: "Circuits", icon: "route" },
        { label: "Notifications", icon: "notifications" },
        { label: "Paramètres", icon: "settings" },
      ]
    : [
        { label: "Tableau de bord", icon: "dashboard" },
        { label: "Mes Établissements", icon: "domain" },
        { label: "Mes Offres", icon: "sell" },
        { label: "Certifications", icon: "school" },
        { label: "Réservations", icon: "event_available" },
        { label: "Circuits", icon: "route" },
        { label: "Notifications", icon: "notifications" },
        { label: "Paramètres", icon: "settings" },
      ];

  const score = profile?.sustainability_score ?? null;
  const scoreWidth = score !== null ? `${score}%` : "0%";
  const badgeConfig = role ? BADGE_CONFIGS[role] : [];
  const obtainedBadgeLabels = new Set((profile?.badges ?? []).map((b) => b.label));
  const profilePath = role === "eco_traveler" ? "/profile/ecovoyageur"
    : role === "guide" ? "/profile/guide"
    : "/profile/provider";
  const questionnairePath = role === "eco_traveler" ? "/questionnaire/eco-traveler"
    : role === "guide" ? "/questionnaire/guide"
    : "/questionnaire/provider";
  const searchPlaceholder = role === "eco_traveler" ? "Rechercher un guide, un projet éco..."
    : role === "guide" ? "Rechercher un projet éco-touristique..."
    : "Rechercher un guide certifié...";

  const [searchQ, setSearchQ] = useState("");
  const [searchRes, setSearchRes] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch<any[]>("/notifications", { headers: { Authorization: `Bearer ${token}` } })
      .then((notifs) => setUnreadNotifCount(notifs.filter((n: any) => !n.is_read).length))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!searchQ.trim() || !token) { setSearchRes([]); return; }
    const t = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const enc = encodeURIComponent(searchQ);
        if (role === "eco_traveler") {
          const [guides, owners] = await Promise.all([
            apiFetch<SearchResult[]>(`/guide/public/search?q=${enc}`).catch(() => []),
            apiFetch<SearchResult[]>(`/providers/profiles/public/search?q=${enc}`).catch(() => []),
          ]);
          setSearchRes([...guides.map((g) => ({ ...g, _type: "guide" })), ...owners.map((o) => ({ ...o, _type: "provider" }))]);
        } else if (role === "guide") {
          const owners = await apiFetch<SearchResult[]>(`/providers/profiles/public/search?q=${enc}`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => []);
          setSearchRes(owners.map((o) => ({ ...o, _type: "provider" })));
        } else {
          const guides = await apiFetch<SearchResult[]>(`/guide/public/search?q=${enc}`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => []);
          setSearchRes(guides.map((g) => ({ ...g, _type: "guide" })));
        }
      } finally { setSearchLoading(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [searchQ, token, role]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const [sidebarHovered, setSidebarHovered] = useState(false);

  if (!role || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">

        <button onClick={() => setSidebarOpen(true)}
          className="xl:hidden fixed top-4 left-4 z-50 bg-white border border-slate-200 rounded-xl p-2 shadow-lg hover:bg-slate-50 transition-colors">
          <span className="material-symbols-outlined">menu</span>
        </button>

        {sidebarOpen && (
          <div className="xl:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Mobile drawer */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 xl:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xl">eco</span>
                </div>
                <span className="text-lg font-extrabold tracking-tight">Éco-Voyage</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <span className="material-symbols-outlined text-slate-400">close</span>
              </button>
            </div>
            <nav className="flex-1 space-y-0.5">
              {navItems.map((item) => (
                <button key={item.label} onClick={() => { setActiveItem(item.label); setSidebarOpen(false); if (item.label === "Mes Prestations") router.push("/dashboard/guide-offerings"); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                    activeItem === item.label
                      ? "bg-emerald-50 text-emerald-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}>
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.label === "Notifications" && unreadNotifCount > 0 && (
                    <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {unreadNotifCount > 99 ? "99+" : unreadNotifCount}
                    </span>
                  )}
                </button>
              ))}
              <button onClick={() => { router.push("/messagerie"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-sm">
                <span className="material-symbols-outlined text-[20px]">chat</span>
                <span className="flex-1 text-left">Messagerie</span>
                {dashConvos.reduce((s, c) => s + c.unread_count, 0) > 0 && (
                  <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                    {dashConvos.reduce((s, c) => s + c.unread_count, 0)}
                  </span>
                )}
              </button>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-sm">
                <span className="material-symbols-outlined text-[20px]">logout</span>
                <span>Déconnexion</span>
              </button>
            </nav>
            <div className="mt-auto pt-4 border-t border-slate-100">
              <button onClick={() => router.push(profilePath)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all">
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                  {profile.photo
                    ? <img src={profile.photo} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center bg-emerald-100"><span className="material-symbols-outlined text-emerald-600 text-sm">person</span></div>
                  }
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{profile.full_name || "Mon profil"}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{role === "provider" ? "Propriétaire" : role === "guide" ? "Guide" : "Voyageur"}</p>
                </div>
              </button>
            </div>
          </div>
        </aside>

        {/* Tablet collapsed sidebar (768px-1280px) — icons only, hover expands */}
        <aside
          className="hidden xl:flex fixed inset-y-0 left-0 z-30 flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out"
          style={{ width: sidebarHovered ? 288 : 80 }}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
        >
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-center gap-2.5 mb-6 shrink-0 h-10">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white text-xl">eco</span>
              </div>
              <span className={`text-lg font-extrabold tracking-tight whitespace-nowrap transition-opacity duration-300 ${sidebarHovered ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                Éco-Voyage
              </span>
            </div>
            <nav className="flex-1 space-y-0.5">
              {navItems.map((item) => (
                <button key={item.label} onClick={() => { setActiveItem(item.label); if (item.label === "Mes Prestations") router.push("/dashboard/guide-offerings"); }}
                  title={!sidebarHovered ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                    activeItem === item.label
                      ? "bg-emerald-50 text-emerald-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}>
                  <span className="material-symbols-outlined text-[20px] flex-shrink-0">{item.icon}</span>
                  <span className={`whitespace-nowrap transition-opacity duration-300 ${sidebarHovered ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                    {item.label}
                  </span>
                  {item.label === "Notifications" && unreadNotifCount > 0 && (
                    <span className={`bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center flex-shrink-0 ${!sidebarHovered ? "absolute top-1 right-1 min-w-[16px] h-[16px] text-[8px]" : ""}`}>
                      {unreadNotifCount > 99 ? "99+" : unreadNotifCount}
                    </span>
                  )}
                </button>
              ))}
              <button onClick={() => router.push("/messagerie")}
                title={!sidebarHovered ? "Messagerie" : undefined}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-sm relative">
                <span className="material-symbols-outlined text-[20px] flex-shrink-0">chat</span>
                <span className={`whitespace-nowrap transition-opacity duration-300 ${sidebarHovered ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                  Messagerie
                </span>
                {dashConvos.reduce((s, c) => s + c.unread_count, 0) > 0 && (
                  <span className={`bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 ${!sidebarHovered ? "absolute top-1 right-1 min-w-[16px] h-[16px] text-[8px]" : ""}`}>
                    {dashConvos.reduce((s, c) => s + c.unread_count, 0)}
                  </span>
                )}
              </button>
              <button onClick={handleLogout}
                title={!sidebarHovered ? "Déconnexion" : undefined}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-sm">
                <span className="material-symbols-outlined text-[20px] flex-shrink-0">logout</span>
                <span className={`whitespace-nowrap transition-opacity duration-300 ${sidebarHovered ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                  Déconnexion
                </span>
              </button>
            </nav>
            <div className={`mt-auto pt-4 border-t border-slate-100 transition-opacity duration-300 ${sidebarHovered ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}>
              <button onClick={() => router.push(profilePath)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all">
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                  {profile.photo
                    ? <img src={profile.photo} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center bg-emerald-100"><span className="material-symbols-outlined text-emerald-600 text-sm">person</span></div>
                  }
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{profile.full_name || "Mon profil"}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{role === "provider" ? "Propriétaire" : role === "guide" ? "Guide" : "Voyageur"}</p>
                </div>
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 xl:ml-20 transition-all duration-300">

          <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4 shrink-0 xl:hidden w-10" />
            <div className="flex items-center gap-3 shrink-0">
              <h2 className="text-base lg:text-lg font-bold text-slate-800 whitespace-nowrap">
                Bonjour, {profile.full_name || (role === "guide" ? "Guide" : role === "provider" ? "Propriétaire" : "Voyageur")}
              </h2>
              <div className="hidden md:flex items-center gap-1.5 bg-slate-100 rounded-full px-3 py-1">
                <span className="material-symbols-outlined text-emerald-500 text-sm">
                  {role === "provider" ? "domain_verification" : "verified_user"}
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  {score !== null ? getScoreLabel(score, role) : "Évaluation en attente"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-1 justify-end">
              <div className="relative w-full max-w-sm hidden sm:block" ref={searchRef}>
                <input className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-300 transition-shadow"
                  placeholder={searchPlaceholder} value={searchQ}
                  onChange={(e) => { setSearchQ(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)} />
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
                {searchQ && (
                  <button onClick={() => { setSearchQ(""); setSearchRes([]); }}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                )}

                {searchOpen && searchQ.trim() && (
                  <div className="absolute top-12 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden max-h-80 overflow-y-auto">
                    {searchLoading && (
                      <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400 font-medium">
                        <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" /> Recherche...
                      </div>
                    )}
                    {!searchLoading && searchRes.length === 0 && (
                      <p className="px-4 py-3 text-sm text-slate-400 italic">Aucun résultat pour "{searchQ}"</p>
                    )}
                    {!searchLoading && searchRes.map((r: any) => (
                      <button key={r.user_id}
                        onClick={() => { router.push(`/profile/${r._type === "guide" ? "guide" : "project-owner"}/${r.user_id}`); setSearchOpen(false); setSearchQ(""); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                          {r.photo
                            ? <img src={r.photo} alt={r.full_name} className="w-full h-full object-cover" />
                            : <span className="material-symbols-outlined text-slate-400 text-base">{r._type === "guide" ? "person" : "business"}</span>
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-800 text-sm truncate">{r.full_name}</p>
                          <p className="text-xs text-slate-400 font-medium truncate">
                            {r._type === "guide" ? `Guide${r.zone ? ` · ${r.zone}` : ""}` : `Propriétaire${r.organization ? ` · ${r.organization}` : ""}`}
                          </p>
                        </div>
                        {r.sustainability_score !== null && r.sustainability_score !== undefined && (
                          <span className="shrink-0 text-[10px] font-black text-primary ml-auto">{r.sustainability_score}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => router.push("/notifications")}
                className="relative size-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 transition-colors shrink-0">
                <span className="material-symbols-outlined text-xl">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              <button onClick={() => router.push(profilePath)}
                className="size-9 rounded-full bg-slate-200 overflow-hidden shrink-0 hover:opacity-80 transition-opacity border-2 border-transparent hover:border-emerald-300" title="Voir mon profil">
                {profile.photo ? (
                  <img src={profile.photo} alt="Photo de profil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/20">
                    <span className="material-symbols-outlined text-primary text-xl">person</span>
                  </div>
                )}
              </button>
            </div>
          </header>

          <div className="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[1800px]">

            {activeItem === "Tableau de bord" && (
              <>
                {score === null && (
                  <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-emerald-600">quiz</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">
                          {role === "eco_traveler" ? "Passez votre test de durabilité" : "Passez votre évaluation de durabilité"}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {role === "eco_traveler"
                            ? "Obtenez votre score initial et des recommandations personnalisées."
                            : "Obtenez votre score et valorisez votre profil auprès des voyageurs."}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => router.push(questionnairePath)}
                      className="px-5 py-2 bg-emerald-500 text-white font-bold rounded-xl text-sm hover:bg-emerald-600 transition-all whitespace-nowrap">
                      Commencer
                    </button>
                  </div>
                )}

                <div className={`grid grid-cols-1 sm:grid-cols-2 ${role === "eco_traveler" ? "xl:grid-cols-5" : "xl:grid-cols-4"} gap-4 lg:gap-5 mb-8`}>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Score de durabilité</p>
                        <h3 className={`text-2xl lg:text-3xl font-extrabold mt-1 ${getScoreColor(score)}`}>
                          {score !== null ? score : "—"}
                          {score !== null && <span className="text-slate-400 text-base font-normal">/100</span>}
                        </h3>
                      </div>
                      <div className="bg-emerald-50 p-2 rounded-lg text-emerald-500">
                        <span className="material-symbols-outlined text-xl">analytics</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${getBarColor(score)} rounded-full transition-all duration-1000`} style={{ width: scoreWidth }} />
                    </div>
                    <p className="text-[11px] font-bold mt-2" style={{ color: score !== null ? (score >= 60 ? "#22c55e" : "#f97316") : "#94a3b8" }}>
                      {score !== null ? getScoreLabel(score, role) : "Questionnaire non complété"}
                    </p>
                    {showScoreDetail && <ScoreBreakdown profile={profile} role={role} />}
                  </div>

                  {role === "eco_traveler" && (
                    <>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col self-start">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Expériences</p>
                            <h3 className="text-2xl font-extrabold mt-1">{publications.filter((p) => p.type === "experience").length}</h3>
                          </div>
                          <div className="bg-teal-50 p-2 rounded-lg text-teal-500"><span className="material-symbols-outlined text-xl">hiking</span></div>
                        </div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col self-start">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Lieux</p>
                            <h3 className="text-2xl font-extrabold mt-1">{publications.filter((p) => p.type === "place").length}</h3>
                          </div>
                          <div className="bg-blue-50 p-2 rounded-lg text-blue-500"><span className="material-symbols-outlined text-xl">location_on</span></div>
                        </div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col self-start">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Réservations</p>
                            <h3 className="text-2xl font-extrabold mt-1">{profile.reservations_made ?? 0}</h3>
                          </div>
                          <div className="bg-green-50 p-2 rounded-lg text-green-500"><span className="material-symbols-outlined text-xl">task_alt</span></div>
                        </div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col self-start">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Plans</p>
                            <h3 className="text-2xl font-extrabold mt-1">{profile.plans_shared ?? 0}</h3>
                          </div>
                          <div className="bg-purple-50 p-2 rounded-lg text-purple-500"><span className="material-symbols-outlined text-xl">map</span></div>
                        </div>
                      </div>
                    </>
                  )}

                  {role === "guide" && (
                    <>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col self-start">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Offres</p>
                            <h3 className="text-2xl font-extrabold mt-1">{offers.length}</h3>
                          </div>
                          <div className="bg-teal-50 p-2 rounded-lg text-teal-500"><span className="material-symbols-outlined text-xl">sell</span></div>
                        </div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col self-start">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Réservations</p>
                            <h3 className="text-2xl font-extrabold mt-1">{profile.reservations_handled ?? 0}</h3>
                          </div>
                          <div className="bg-blue-50 p-2 rounded-lg text-blue-500"><span className="material-symbols-outlined text-xl">event_available</span></div>
                        </div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col self-start">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Avis</p>
                            <h3 className="text-2xl font-extrabold mt-1">{profile.feedback_received ?? 0}</h3>
                          </div>
                          <div className="bg-green-50 p-2 rounded-lg text-green-500"><span className="material-symbols-outlined text-xl">star</span></div>
                        </div>
                      </div>
                    </>
                  )}

                  {role === "provider" && (
                    <>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col self-start">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Établissements actifs</p>
                            <h3 className="text-2xl font-extrabold mt-1">{profile.venues?.length ?? 0}</h3>
                          </div>
                          <div className="bg-blue-50 p-2 rounded-lg text-blue-500"><span className="material-symbols-outlined text-xl">domain</span></div>
                        </div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col self-start">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Offres</p>
                            <h3 className="text-2xl font-extrabold mt-1">{offers.length}</h3>
                          </div>
                          <div className="bg-teal-50 p-2 rounded-lg text-teal-500"><span className="material-symbols-outlined text-xl">sell</span></div>
                        </div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col self-start">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Réservations</p>
                            <h3 className="text-2xl font-extrabold mt-1">{profile.total_reservations ?? 0}</h3>
                          </div>
                          <div className="bg-green-50 p-2 rounded-lg text-green-500"><span className="material-symbols-outlined text-xl">event_available</span></div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                  <div className="lg:col-span-8 xl:col-span-9">
                    {role === "eco_traveler" && (
                      <>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold">Mes Plans de Voyage</h3>
                          <button onClick={() => router.push("/trip-plans")} className="text-primary font-bold text-sm hover:underline">Voir tout</button>
                        </div>
                        <TripPlansList />
                      </>
                    )}

                    {role === "guide" && (
                      <>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg lg:text-xl font-bold">Mes Spécialités & Circuits</h3>
                          <a className="text-primary font-bold text-sm hover:underline" href="#">Voir tout</a>
                        </div>
                        <div className="space-y-4">
                          <div className="bg-white rounded-2xl p-5 border border-primary/5">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Zone d'activité</p>
                                <p className="text-lg font-bold text-slate-900">{profile.zone ?? "Non renseignée"}</p>
                                <p className="text-sm text-slate-500 mt-1">
                                  {profile.guide_type === "local" ? "Guide Local" : profile.guide_type === "professionnel" ? "Guide Professionnel" : "—"}
                                  {profile.years_experience != null ? ` • ${profile.years_experience} an${profile.years_experience > 1 ? "s" : ""} d'expérience` : ""}
                                </p>
                              </div>
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${profile.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                {profile.status === "active" ? "Actif" : "En attente"}
                              </span>
                            </div>
                          </div>

                          {(profile.specialties?.length ?? 0) > 0 && (
                            <div className="bg-white rounded-2xl p-5 border border-primary/5">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Spécialités</p>
                              <div className="flex flex-wrap gap-2">
                                {profile.specialties!.map((s) => (
                                  <span key={s} className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-full">{s}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {(profile.certifications?.length ?? 0) > 0 && (
                            <div className="bg-white rounded-2xl p-5 border border-primary/5">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Certifications</p>
                              <div className="space-y-2">
                                {profile.certifications!.map((cert: any, i: number) => (
                                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <span className="material-symbols-outlined text-primary text-xl">verified</span>
                                    <span className="text-sm font-bold text-slate-800">{typeof cert === "string" ? cert : cert.label}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {(profile.languages_spoken?.length ?? 0) > 0 && (
                            <div className="bg-white rounded-2xl p-5 border border-primary/5">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Langues parlées</p>
                              <div className="flex flex-wrap gap-2">
                                {profile.languages_spoken!.map((l) => (
                                  <span key={l} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-full uppercase">{l}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {role === "provider" && (
                      <>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold">Mes Projets</h3>
                          <button onClick={() => setShowAddVenue(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-slate-900 rounded-xl font-extrabold text-sm shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all">
                            <span className="material-symbols-outlined text-base">add</span>Ajouter
                          </button>
                        </div>

                        {(profile.venues?.length ?? 0) === 0 ? (
                          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center">
                            <span className="material-symbols-outlined text-slate-300 text-5xl mb-3">domain</span>
                            <p className="text-slate-800 font-extrabold text-lg mb-2">Aucun établissement pour l'instant</p>
                            <p className="text-slate-400 font-medium text-sm mb-5">Ajoutez votre premier établissement éco-touristique.</p>
                            <button onClick={() => setShowAddVenue(true)}
                              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-slate-900 rounded-xl font-extrabold text-sm shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all">
                              <span className="material-symbols-outlined text-base">add</span>Créer mon premier établissement
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {profile.venues!.map((project) => (
                              <div key={project.id} className="bg-white rounded-2xl border border-primary/5 p-5 flex gap-5">
                                <div className="w-20 h-20 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden">
                                  {project.photo
                                    ? <img src={project.photo} alt={project.name} className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center"><VenueTypeIcon types={project.venue_type} /></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <h4 className="font-extrabold text-slate-900 text-base leading-tight">{project.name}</h4>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${project.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                        {project.status === "active" ? "Actif" : "En attente"}
                                      </span>
                                      <button onClick={() => setEditingVenue(project)}
                                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors" title="Modifier">
                                        <span className="material-symbols-outlined text-base">edit</span>
                                      </button>
                                      <button onClick={() => handleDeleteVenue(project.id)}
                                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Supprimer">
                                        <span className="material-symbols-outlined text-base">close</span>
                                      </button>
                                    </div>
                                  </div>
                                  {project.venue_type?.length ? (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {project.venue_type.map((pt) => (
                                        <span key={pt} className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                          {VENUE_TYPES.find((t) => t.value === pt)?.label ?? pt}
                                        </span>
                                      ))}
                                    </div>
                                  ) : null}
                                  {project.description && <p className="text-sm text-slate-500 font-medium line-clamp-1 mb-2">{project.description}</p>}
                                  <div className="flex flex-wrap gap-3">
                                    {project.region && (
                                      <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                                        <span className="material-symbols-outlined text-sm">location_on</span>{project.region}
                                      </span>
                                    )}
                                    {project.website && (
                                      <a href={project.website} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                                        <span className="material-symbols-outlined text-sm">language</span>
                                        {project.website.replace(/^https?:\/\//, "")}
                                      </a>
                                    )}
                                  </div>
                                  {(project.eco_labels?.length ?? 0) > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                      {project.eco_labels!.slice(0, 3).map((label) => (
                                        <span key={label} className="text-xs font-bold px-2 py-0.5 bg-green-50 text-green-700 rounded-full">{label}</span>
                                      ))}
                                      {project.eco_labels!.length > 3 && (
                                        <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">+{project.eco_labels!.length - 3}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="lg:col-span-4 xl:col-span-3">
                    <h3 className="text-base font-bold mb-4 text-slate-800">Mes Badges</h3>
                    <div className="bg-white rounded-2xl p-5 border border-slate-200">
                      <div className="grid grid-cols-2 gap-3">
                        {badgeConfig.map((config) => {
                          const obtained = obtainedBadgeLabels.has(config.label);
                          const obtainedData = profile.badges.find((b) => b.label === config.label);
                          return (
                            <div key={config.label}
                              title={obtained && obtainedData ? `Obtenu le ${new Date(obtainedData.obtained_at).toLocaleDateString("fr-FR")}` : config.description}
                              className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${obtained ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-dashed border-slate-200"}`}>
                              <div className="size-12 flex items-center justify-center mb-1.5">
                                <span className={`material-symbols-outlined text-3xl transition-all ${obtained ? "text-emerald-500" : "text-slate-300"}`}
                                  style={obtained ? { fontVariationSettings: '"FILL" 1' } : {}}>
                                  {config.icon}
                                </span>
                              </div>
                              <p className={`text-[11px] font-bold ${obtained ? "text-slate-700" : "text-slate-300"}`}>{config.label}</p>
                              <p className={`text-[9px] font-bold uppercase mt-0.5 ${obtained ? "text-emerald-500" : "text-slate-300"}`}>
                                {obtained ? "Débloqué" : "Verrouillé"}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                        {role === "eco_traveler" && (
                          <>
                            <div><p className="text-lg font-extrabold text-slate-800">{profile.feedback_given ?? 0}</p><p className="text-[10px] text-slate-400 font-bold uppercase">Feedbacks</p></div>
                            <div><p className="text-lg font-extrabold text-slate-800">{publications.filter((p) => p.type === "experience").length}</p><p className="text-[10px] text-slate-400 font-bold uppercase">Expériences</p></div>
                            <div><p className="text-lg font-extrabold text-slate-800">{profile.reservations_made ?? 0}</p><p className="text-[10px] text-slate-400 font-bold uppercase">Réservations</p></div>
                          </>
                        )}
                        {role === "guide" && (
                          <>
                            <div><p className="text-lg font-extrabold text-slate-800">{profile.feedback_received ?? 0}</p><p className="text-[10px] text-slate-400 font-bold uppercase">Avis</p></div>
                            <div><p className="text-lg font-extrabold text-slate-800">{profile.years_experience ?? 0}</p><p className="text-[10px] text-slate-400 font-bold uppercase">Années</p></div>
                            <div><p className="text-lg font-extrabold text-slate-800">{profile.reservations_handled ?? 0}</p><p className="text-[10px] text-slate-400 font-bold uppercase">Circuits</p></div>
                          </>
                        )}
                        {role === "provider" && (
                          <>
                            <div><p className="text-lg font-extrabold text-slate-800">{profile.feedback_received ?? 0}</p><p className="text-[10px] text-slate-400 font-bold uppercase">Avis</p></div>
                            <div><p className="text-lg font-extrabold text-slate-800">{profile.venues?.length ?? 0}</p><p className="text-[10px] text-slate-400 font-bold uppercase">Projets</p></div>
                            <div><p className="text-lg font-extrabold text-slate-800">{profile.total_reservations ?? 0}</p><p className="text-[10px] text-slate-400 font-bold uppercase">Réserv.</p></div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {role === "eco_traveler" && activeItem === "Mes Publications" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Mes Publications</h3>
                  <button onClick={() => setShowAddPublication(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-slate-900 font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all text-sm">
                    <span className="material-symbols-outlined text-base">add</span>Partager
                  </button>
                </div>

                {publications.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">public</span>
                    <p className="font-bold text-slate-500">Aucune publication</p>
                    <p className="text-sm text-slate-400 mt-1">Partagez un lieu ou une expérience éco-touristique.</p>
                    <button onClick={() => setShowAddPublication(true)} className="mt-4 px-5 py-2.5 bg-primary/10 text-primary font-bold rounded-xl text-sm hover:bg-primary/20 transition-colors">
                      Créer une publication
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                    {publications.map((pub) => (
                      <div key={pub.id} className="bg-white rounded-2xl border border-primary/5 p-5 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                              {pub.type === "place" ? <span className="material-symbols-outlined text-primary text-lg">location_on</span> : <span className="material-symbols-outlined text-primary text-lg">hiking</span>}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900 leading-tight">{pub.title}</p>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pub.type === "place" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                                {pub.type === "place" ? "Lieu" : "Expérience"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 flex-shrink-0">
                            <StatusBadge status={pub.status} reason={pub.rejection_reason} />
                            <button onClick={() => setEditingPublication(pub)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors" title="Modifier">
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button onClick={() => handleDeletePublication(pub.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                              <span className="material-symbols-outlined text-base">close</span>
                            </button>
                          </div>
                        </div>
                        {pub.description && <p className="text-sm text-slate-500 font-medium line-clamp-2">{pub.description}</p>}
                        {pub.type === "place" && pub.latitude && pub.longitude && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            {pub.place_name ?? `${Number(pub.latitude).toFixed(4)}, ${Number(pub.longitude).toFixed(4)}`}
                            {pub.region && <span className="text-slate-300">• {pub.region}</span>}
                          </div>
                        )}
                        <p className="text-xs text-slate-400 font-medium mt-auto">
                          {new Date(pub.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {role === "guide" && activeItem === "Mes Prestations" && (
              <div>
                <button onClick={() => router.push("/dashboard/guide-offerings")}
                  className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  Gérer mes prestations de guide
                </button>
              </div>
            )}

            {role === "provider" && activeItem === "Mes Offres" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Mes Offres</h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={offerTypeFilter}
                      onChange={(e) => setOfferTypeFilter(e.target.value)}
                      className="border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    >
                      <option value="">Tous les types</option>
                      {PROJ_OFFER_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <button onClick={() => setShowAddOffer(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary text-slate-900 font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all text-sm">
                      <span className="material-symbols-outlined text-base">add</span>Ajouter une offre
                    </button>
                  </div>
                </div>

                {offers.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">sell</span>
                    <p className="font-bold text-slate-500">Aucune offre publiée</p>
                    <p className="text-sm text-slate-400 mt-1">Créez votre première offre pour la rendre visible sur votre profil.</p>
                    <button onClick={() => setShowAddOffer(true)} className="mt-4 px-5 py-2.5 bg-primary/10 text-primary font-bold rounded-xl text-sm hover:bg-primary/20 transition-colors">
                      Créer une offre
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                    {offers
                      .filter((offer) => !offerTypeFilter || offer.offer_type === offerTypeFilter)
                      .sort((a, b) => {
                        const order = ["pending", "draft", "active", "approved", "rejected"];
                        return order.indexOf(a.status) - order.indexOf(b.status);
                      })
                      .map((offer) => {
                      const offerTypes = PROJ_OFFER_TYPES;
                      const typeLabel = offerTypes.find((t) => t.value === offer.offer_type)?.label;
                      return (
                        <div key={offer.id} className={`bg-white rounded-2xl border-2 p-5 flex flex-col gap-3 transition-all hover:shadow-md ${
                          offer.status === "active" || offer.status === "approved" ? "border-emerald-100" :
                          offer.status === "rejected" ? "border-red-100" : "border-amber-100"
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-primary text-lg">sell</span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-extrabold text-slate-900 leading-tight truncate">{offer.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {typeLabel && <p className="text-xs font-bold text-primary">{typeLabel}</p>}
                                  <StatusBadge status={offer.status} reason={offer.rejection_reason} />
                                </div>
                              </div>
                            </div>
                            <div className="relative flex items-center gap-1 flex-shrink-0">
                              <button onClick={() => setEditingOffer(offer)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors" title="Modifier">
                                <span className="material-symbols-outlined text-base">edit</span>
                              </button>
                              <button onClick={() => router.push(`/offers/${offer.id}`)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors" title="Voir">
                                <span className="material-symbols-outlined text-base">visibility</span>
                              </button>
                              <button onClick={() => setOfferActionMenu(offerActionMenu === offer.id ? null : offer.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors" title="Plus d'actions">
                                <span className="material-symbols-outlined text-base">more_vert</span>
                              </button>
                              {offerActionMenu === offer.id && (
                                <div className="absolute top-full right-0 mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl py-1 min-w-[200px]" onClick={() => setOfferActionMenu(null)}>
                                  {offer.status === 'draft' && (
                                    <button onClick={async () => { await handlePublishOffer(offer.id); setOfferActionMenu(null); }} className="w-full text-left px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 flex items-center gap-2">
                                      <span className="material-symbols-outlined text-sm">check_circle</span> Publier
                                    </button>
                                  )}
                                  <button onClick={() => { setEditingOffer(offer); setOfferActionMenu(null); }} className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">edit</span> Modifier
                                  </button>
                                  <button onClick={() => handleArchiveOffer(offer.id)} className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">archive</span> Archiver
                                  </button>
                                  <button onClick={() => handleDeactivateOffer(offer.id)} className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">pause</span> Désactiver
                                  </button>
                                  <button onClick={() => handleViewLinkedCircuits(offer.id)} className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">link</span> Circuits liés
                                  </button>
                                  <div className="border-t border-slate-100 my-1" />
                                  <button onClick={() => handleDeleteOffer(offer.id)} className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">close</span> Supprimer
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          {offer.description && <p className="text-sm text-slate-500 font-medium line-clamp-2">{offer.description}</p>}

                          <div className="my-2">
                            {offer.items && offer.items.length > 0 ? (
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Éléments ({offer.items.filter((i: any) => i.status === "active").length})</p>
                                {offer.items.filter((i: any) => i.status === "active").map((item: any) => (
                                  <div key={item.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5">
                                    <div>
                                      <span className="text-sm font-medium text-slate-700">{item.name}</span>
                                      <div className="flex flex-wrap gap-1 mt-0.5">
                                        {item.details_json?.room_sub_type && <span className="text-[9px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded-full">{item.details_json.room_sub_type}</span>}
                                        {item.details_json?.bed_count != null && <span className="text-[9px] text-blue-600 bg-blue-50 px-1 py-0.5 rounded-full">🛏 {item.details_json.bed_count}</span>}
                                        {item.details_json?.tent_capacity != null && <span className="text-[9px] text-green-600 bg-green-50 px-1 py-0.5 rounded-full">⛺ {item.details_json.tent_capacity}p</span>}
                                        {item.prices?.[0] && <span className="text-xs text-primary ml-1">{Number(item.prices[0].price).toLocaleString()} TND</span>}
                                      </div>
                                    </div>
                                    <span className="text-[10px] text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded-full">{item.item_type ?? "activité"}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400">Aucun élément</p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-auto pt-2 border-t border-slate-100">
                            {offer.price !== null ? (
                              <span className="text-sm font-extrabold text-slate-800">{offer.price} TND</span>
                            ) : offer.items && offer.items.length > 0 ? (
                              <span className="text-sm font-extrabold text-slate-800">
                                {offer.items
                                  .filter((i: any) => i.status === "active")
                                  .reduce((sum: number, i: any) => {
                                    const p = i.prices?.find((pp: any) => pp.is_default) ?? i.prices?.[0];
                                    return sum + (p ? Number(p.price) : 0);
                                  }, 0)
                                  .toLocaleString()} TND
                              </span>
                            ) : null}
                            {offer.duration && (
                              <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                                <span className="material-symbols-outlined text-sm">schedule</span>{offer.duration}
                              </span>
                            )}
                            {offer.location_type && (
                              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                {offer.location_type === "fixed" ? "📍" : "🚐"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {role === "provider" && activeItem === "Mes Établissements" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Mes Projets</h3>
                  <button onClick={() => setShowAddVenue(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-slate-900 font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all text-sm">
                    <span className="material-symbols-outlined text-base">add</span>Ajouter un établissement
                  </button>
                </div>

                {(profile.venues?.length ?? 0) === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-slate-300 text-5xl mb-3">domain</span>
                    <p className="font-bold text-slate-500">Aucun établissement</p>
                    <button onClick={() => setShowAddVenue(true)} className="mt-4 px-5 py-2.5 bg-primary/10 text-primary font-bold rounded-xl text-sm hover:bg-primary/20 transition-colors">
                      Créer mon premier établissement
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                    {profile.venues!.map((project) => (
                      <div key={project.id} className="bg-white rounded-2xl border border-primary/5 p-5 flex gap-5">
                        <div className="w-20 h-20 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden">
                          {project.photo
                            ? <img src={project.photo} alt={project.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><VenueTypeIcon types={project.venue_type} /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-extrabold text-slate-900 text-base leading-tight">{project.name}</h4>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <StatusBadge status={project.status} reason={project.rejection_reason} />
                              <button onClick={() => handleDeleteVenue(project.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                                <span className="material-symbols-outlined text-base">close</span>
                              </button>
                            </div>
                          </div>
                          {project.description && <p className="text-sm text-slate-500 font-medium line-clamp-2">{project.description}</p>}
                          {project.region && (
                            <span className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-2">
                              <span className="material-symbols-outlined text-sm">location_on</span>{project.region}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {role === "eco_traveler" && activeItem === "Offres" && (
              <EcoTravelerOffersSection router={router} />
            )}

            {activeItem === "Réservations" && (
              <div>
                <h3 className="text-xl font-bold mb-6">Réservations</h3>
                {role === "eco_traveler" ? (
                  <MyReservationsTab />
                ) : (
                  <IncomingReservationsTab />
                )}
              </div>
            )}

            {activeItem === "Trip Plans" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Trip Plans</h3>
                  <button onClick={() => router.push("/trip-plans/new")}
                    className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-emerald-600 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">add</span> Nouveau Trip Plan
                  </button>
                </div>
                <TripPlansList />
              </div>
            )}

            {activeItem === "Circuits" && (
              <CircuitsTab role={role} router={router} token={token} />
            )}

            {(role === "provider" || role === "guide") && activeItem === "Certifications" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <CertificationUploader token={token} />
              </div>
            )}

            {activeItem === "Notifications" && (
              <NotificationsTab />
            )}

            {activeItem === "Paramètres" && (
              <ParametresTab router={router} handleLogout={handleLogout} />
            )}

          </div>
        </main>
      </div>

      {role === "eco_traveler" && showAddPublication && (
        <AddPublicationModal token={token} onClose={() => setShowAddPublication(false)}
          onSuccess={(p) => { setPublications((prev) => [p, ...prev]); setShowAddPublication(false); }} />
      )}
      {role === "eco_traveler" && editingPublication && (
        <AddPublicationModal token={token} publication={editingPublication} onClose={() => setEditingPublication(null)}
          onSuccess={(p) => { setPublications((prev) => prev.map((pr) => pr.id === p.id ? p : pr)); setEditingPublication(null); }} />
      )}
      {role === "provider" && showAddOffer && profile && (
        <GuidedOfferWizard token={token} userRole="provider" userProjectId={profile.venues?.[0]?.id} userVenueType={profile.venues?.[0]?.venue_type?.[0]} userVenues={profile.venues} onClose={() => setShowAddOffer(false)}
          onSuccess={(o) => { setOffers((prev) => [o, ...prev]); setShowAddOffer(false); }} />
      )}
      {role === "provider" && showAddVenue && (
        <AddVenueModal token={token} onClose={() => setShowAddVenue(false)}
          onSuccess={(p) => { setProfile((prev) => prev ? { ...prev, venues: [...(prev.venues ?? []), p] } : prev); setShowAddVenue(false); }} />
      )}
      {editingVenue && (
        <EditVenueModal token={token} project={editingVenue} onClose={() => setEditingVenue(null)}
          onSuccess={(p) => { setProfile((prev) => prev ? { ...prev, venues: prev.venues?.map((pr) => pr.id === p.id ? p : pr) } : prev); setEditingVenue(null); }} />
      )}
      {editingOffer && (
        <GuidedOfferWizard token={token} userRole={role} userProjectId={profile.venues?.[0]?.id} userVenueType={profile.venues?.[0]?.venue_type?.[0]} userVenues={profile.venues} onClose={() => setEditingOffer(null)}
          onSuccess={(o) => { setOffers((prev) => prev.map((of) => of.id === o.id ? o : of)); setEditingOffer(null); }} editOffer={editingOffer} />
      )}
      {linkedCircuitsModal && (
        <Modal open={!!linkedCircuitsModal} onClose={() => setLinkedCircuitsModal(null)}>
          <div className="p-6">
            <h3 className="text-lg font-extrabold text-slate-900 mb-4">Circuits liés à cette offre</h3>
            {linkedCircuitsModal.circuits.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun circuit n'utilise cette offre.</p>
            ) : (
              <ul className="space-y-2">
                {linkedCircuitsModal.circuits.map((c: any) => (
                  <li key={c.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{c.title}</p>
                      <p className="text-xs text-slate-500">{c.region} · {c.duration_days} jour{c.duration_days > 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={() => router.push(`/circuits/${c.id}`)} className="text-xs font-bold text-primary hover:text-emerald-700">
                      Voir
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setLinkedCircuitsModal(null)} className="mt-4 w-full py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 text-sm">
              Fermer
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
