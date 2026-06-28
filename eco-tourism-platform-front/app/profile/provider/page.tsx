"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Plus, Edit3, ShieldCheck, MapPin, Calendar, Phone, Building2, Globe, Leaf, ArrowLeft,
  LayoutGrid, Tag, Info, Sparkles, Users, Mail, MessageCircle,
  ArrowRight, Send, X, Clock, ChevronLeft, ChevronRight, Check, Search, UserPlus,
  MoreVertical, UserX, ShieldBan, Flag,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import MessagerieWidget from "@/components/MessagerieWidget";
import PubInteractions from "@/components/PubInteractions";
import { PROVIDER_SCHEMA, SUBTYPE_FIELDS, getCategoryByValue } from "@/lib/provider-schema";
import type { FieldConfig } from "@/lib/provider-schema";
import {
  OFFER_DETAIL_FIELDS, getCapacityLimit,
  AVAILABILITY_TYPES, CONFIRMATION_TYPES, CANCELLATION_POLICIES, SAISONS,
  type CrossValidationRule,
} from "@/lib/offer-schema";

const MapPicker = dynamic(
  () => import("@/components/map/MapPicker"),
  { ssr: false, loading: () => <div className="h-[268px] rounded-2xl bg-slate-100 animate-pulse" /> }
);
const MapView = dynamic(() => import("@/components/map/MapView"),
  { ssr: false, loading: () => <div className="h-[200px] rounded-xl bg-slate-100 animate-pulse" /> }
);

function LocationMap({ lat, lng, address }: { lat: number | null; lng: number | null; address: string }) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    lat && lng ? { lat: Number(lat), lng: Number(lng) } : null
  );
  const [geocoding, setGeocoding] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (coords) return;
    if (!address.trim()) return;
    setGeocoding(true);
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&accept-language=fr`)
      .then((r) => r.json())
      .then((data) => {
        if (data.length) setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        else setFailed(true);
      })
      .catch(() => setFailed(true))
      .finally(() => setGeocoding(false));
  }, [address, coords]);

  if (geocoding) return <div className="h-[200px] rounded-xl bg-slate-100 animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold">Chargement de la carte…</div>;
  if (failed || !coords) return null;
  return (
    <div>
      <MapView lat={coords.lat} lng={coords.lng} />
      <a
        href={`https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=14/${coords.lat}/${coords.lng}`}
        target="_blank" rel="noopener noreferrer"
        className="mt-1.5 flex justify-end text-[10px] font-black text-primary uppercase tracking-wider hover:underline"
      >
        Ouvrir dans la carte ↗
      </a>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ProviderProfile = {
  user_id: string; full_name: string; bio: string | null;
  organization: string | null; position: string | null; photo: string | null;
  cover_photo: string | null;
  country: string | null; phone: string | null; language: string | null;
  languages_spoken: string[] | null;
  sustainability_score: number | null; total_reservations: number;
  feedback_received: number;
  provider_type: string | null;
  activity_types: string[] | null;
  secondary_activity_types: string[] | null;
  website: string | null;
  region: string | null;
  address: string | null;
  lat: number | null; lng: number | null;
  years_experience: number | null;
  history: string | null;
  eco_labels: string[] | null;
  certifications: string[] | null;
  photos: string[] | null;
  status: string;
  personal_bio: string | null;
  personal_certifications: Array<{ name: string; document_url?: string }> | null;
};

type OrganizationProfile = {
  id: string;
  name: string;
  logo: string | null;
  provider_type: string | null;
  bio: string | null;
  history: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  region: string | null;
  address: string | null;
  zone: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  photos: string[] | null;
  videos: string[] | null;
  eco_labels: string[] | null;
  certifications: Array<{ name: string; document_url?: string }> | null;
  sustainability_score: number | null;
  status: string;
};

type Offer = {
  id: string; title: string; description: string | null;
  price: number | null; duration: string | null;
  offer_type: string | null; project_id: string | null;
  status: string; created_at: string;
  region: string | null; inclusions: string | null;
  meeting_point: string | null;
  meeting_lat: number | null; meeting_lng: number | null;
  min_group_size: number | null; max_group_size: number | null;
  min_age: number | null;
  cancellation_policy: string | null;
  sustainability_score: number | null;
  images?: string[] | null; cover_image?: string | null;
};

type Activity = {
  id: string; title: string; description: string | null;
  category: string; level: "primary" | "secondary";
  region: string | null; address: string | null;
  photo: string | null; photos: string[] | null;
  status: string; created_at: string;
  lat: number | null; lng: number | null;
  sustainability_score: number | null;
  website: string | null; phone: string | null;
};

type OrgActivity = {
  id: string;
  provider_id: string;
  organization_id: string;
  level: "primary" | "secondary";
  category: string;
  subtypes: string[] | null;
  years_experience: number | null;
  fields: Record<string, Record<string, any>>;
  photos: Record<string, string[]>;
  certifications: Array<{ name: string; document_url?: string }>;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const OFFER_TYPES = [
  { value: "sejour",       label: "Séjour",       icon: "hotel",      gradient: "from-blue-500 to-cyan-400" },
  { value: "circuit",      label: "Circuit",      icon: "route",      gradient: "from-violet-500 to-purple-400" },
  { value: "activite",     label: "Activité",     icon: "hiking",     gradient: "from-orange-500 to-amber-400" },
  { value: "restauration", label: "Restauration", icon: "restaurant", gradient: "from-red-500 to-rose-400" },
  { value: "hebergement",  label: "Hébergement",  icon: "cabin",      gradient: "from-emerald-500 to-green-400" },
  { value: "autre",        label: "Autre",        icon: "category",   gradient: "from-slate-400 to-slate-500" },
];

const COUNTRY_LABELS: Record<string, string> = {
  TN: "Tunisie", MA: "Maroc", DZ: "Algérie", FR: "France", OTHER: "Autre",
};

const PROVIDER_TYPES = [
  { value: "lodge",       label: "Éco-Lodge",          icon: "cabin" },
  { value: "hotel",       label: "Hôtel Vert",          icon: "hotel" },
  { value: "restaurant",  label: "Restaurant Bio",      icon: "restaurant" },
  { value: "ferme",       label: "Ferme Agro-tourisme", icon: "agriculture" },
  { value: "agence",      label: "Agence de Voyage",    icon: "travel_explore" },
  { value: "transport",   label: "Transport Éco",       icon: "electric_car" },
  { value: "bienetre",    label: "Bien-être & Spa",     icon: "spa" },
  { value: "artisanat",   label: "Artisanat local",     icon: "handshake" },
  { value: "autre",       label: "Autre",               icon: "category" },
];

const PROVIDER_ACTIVITY_TYPES = [
  { value: "hebergement",  label: "Hébergement",             icon: "cabin",          gradient: "from-emerald-500 to-teal-400" },
  { value: "restauration", label: "Restauration Bio",        icon: "restaurant",     gradient: "from-orange-500 to-amber-400" },
  { value: "randonnee",    label: "Randonnée & Trekking",    icon: "hiking",         gradient: "from-green-600 to-emerald-400" },
  { value: "plongee",      label: "Plongée & Sports naut.",  icon: "scuba_diving",   gradient: "from-blue-500 to-cyan-400" },
  { value: "agriculture",  label: "Agro-tourisme",           icon: "agriculture",    gradient: "from-lime-500 to-green-400" },
  { value: "artisanat",    label: "Artisanat local",         icon: "handshake",      gradient: "from-amber-500 to-yellow-400" },
  { value: "transport",    label: "Transport éco",           icon: "electric_car",   gradient: "from-sky-500 to-blue-400" },
  { value: "bienetre",     label: "Bien-être & Spa",         icon: "spa",            gradient: "from-purple-500 to-violet-400" },
  { value: "culture",      label: "Tourisme culturel",       icon: "museum",         gradient: "from-rose-500 to-pink-400" },
  { value: "aventure",     label: "Aventure & Nature",       icon: "terrain",        gradient: "from-teal-500 to-cyan-400" },
  { value: "formation",    label: "Formation & Éducation",   icon: "school",         gradient: "from-indigo-500 to-blue-400" },
  { value: "autre",        label: "Autre",                   icon: "category",       gradient: "from-slate-400 to-slate-500" },
];

const CATEGORY_GRADIENT_MAP: Record<string, string> = {
  eco_tour:    "from-green-600 to-emerald-400",
  hebergement: "from-emerald-500 to-teal-400",
  activite:    "from-orange-500 to-amber-400",
  restauration:"from-red-500 to-rose-400",
  culture:     "from-rose-500 to-pink-400",
  bien_etre:   "from-purple-500 to-violet-400",
  artisanat:   "from-amber-500 to-yellow-400",
  agriculture: "from-lime-500 to-green-400",
  transport:   "from-sky-500 to-blue-400",
  equipement:  "from-indigo-500 to-blue-400",
};

function findProviderTypeMeta(value: string) {
  for (const cat of PROVIDER_SCHEMA) {
    const st = cat.subtypes.find((s) => s.value === value);
    if (st) return { label: st.label, categoryLabel: cat.label, categoryIcon: cat.icon, categoryValue: cat.value, gradient: CATEGORY_GRADIENT_MAP[cat.value] ?? "from-slate-400 to-slate-500" };
  }
  const cat = PROVIDER_SCHEMA.find((c) => c.value === value);
  if (cat) return { label: cat.label, categoryLabel: cat.label, categoryIcon: cat.icon, categoryValue: cat.value, gradient: CATEGORY_GRADIENT_MAP[cat.value] ?? "from-slate-400 to-slate-500" };
  const act = PROVIDER_ACTIVITY_TYPES.find((t) => t.value === value);
  if (act) return { label: act.label, categoryLabel: act.label, categoryIcon: act.icon, categoryValue: value, gradient: act.gradient };
  return { label: value, categoryLabel: value, categoryIcon: "eco", categoryValue: value, gradient: "from-slate-400 to-slate-500" };
}

// ─── Offer sustainability questionnaire ───────────────────────────────────────

const OFFER_SUSTAINABILITY_STEPS = [
  {
    category: "Impact Écologique", emoji: "🌿",
    description: "Empreinte environnementale de l'activité proposée",
    questions: [
      { id: "oq1", text: "L'activité se déroule-t-elle dans un milieu naturel préservé ?", options: [{ label: "Oui, site protégé", value: 10 }, { label: "Partiellement", value: 5 }, { label: "Non", value: 0 }] },
      { id: "oq2", text: "Des mesures réduisent-elles l'empreinte carbone (transport, matériel éco…) ?", options: [{ label: "Oui", value: 10 }, { label: "Partiellement", value: 5 }, { label: "Non", value: 0 }] },
      { id: "oq3", text: "Les déchets générés par l'activité sont-ils gérés de manière responsable ?", options: [{ label: "Aucun déchet / gestion complète", value: 10 }, { label: "Gestion partielle", value: 5 }, { label: "Non géré", value: 0 }] },
    ],
  },
  {
    category: "Valorisation Locale", emoji: "🤝",
    description: "Intégration des ressources et acteurs locaux dans l'offre",
    questions: [
      { id: "oq4", text: "Faites-vous appel à des guides, artisans ou intervenants locaux ?", options: [{ label: "Oui, systématiquement", value: 10 }, { label: "Parfois", value: 5 }, { label: "Non", value: 0 }] },
      { id: "oq5", text: "Valorisez-vous le patrimoine culturel ou naturel local dans votre offre ?", options: [{ label: "Oui", value: 8 }, { label: "Partiellement", value: 4 }, { label: "Non", value: 0 }] },
      { id: "oq6", text: "Les achats liés à l'offre (matériel, nourriture) sont-ils effectués localement ?", options: [{ label: "Oui, majoritairement", value: 7 }, { label: "Partiellement", value: 3 }, { label: "Non", value: 0 }] },
    ],
  },
  {
    category: "Sensibilisation", emoji: "📚",
    description: "Actions d'éducation et de sensibilisation auprès des participants",
    questions: [
      { id: "oq7", text: "Sensibilisez-vous les participants à l'environnement et à la biodiversité ?", options: [{ label: "Oui, activement", value: 10 }, { label: "Partiellement", value: 5 }, { label: "Non", value: 0 }] },
      { id: "oq8", text: "Fournissez-vous des conseils sur les bonnes pratiques éco-responsables ?", options: [{ label: "Oui", value: 10 }, { label: "Non", value: 0 }] },
    ],
  },
  {
    category: "Accessibilité", emoji: "♿",
    description: "Ouverture de l'offre à tous les publics",
    questions: [
      { id: "oq9", text: "Votre offre est-elle accessible aux personnes à mobilité réduite ?", options: [{ label: "Oui", value: 8 }, { label: "Partiellement", value: 4 }, { label: "Non", value: 0 }] },
      { id: "oq10", text: "Proposez-vous des tarifs adaptés (familles, étudiants, groupes…) ?", options: [{ label: "Oui", value: 7 }, { label: "Non", value: 0 }] },
    ],
  },
  {
    category: "Pratiques Responsables", emoji: "🏅",
    description: "Engagement et encadrement éthique de l'activité",
    questions: [
      { id: "oq11", text: "Limitez-vous la taille des groupes pour protéger l'environnement ?", options: [{ label: "Oui", value: 5 }, { label: "Non", value: 0 }] },
      { id: "oq12", text: "Avez-vous une politique d'annulation éco-responsable ?", options: [{ label: "Oui", value: 5 }, { label: "Non", value: 0 }] },
    ],
  },
];

function getOfferSustainabilityLevel(score: number) {
  if (score >= 86) return { label: "Offre Ambassadrice Éco Voyage", color: "text-primary",      bg: "bg-primary/10",   emoji: "⭐" };
  if (score >= 71) return { label: "Offre Éco-Responsable",         color: "text-emerald-600", bg: "bg-emerald-50",   emoji: "🌿" };
  if (score >= 51) return { label: "Offre Engagée",                 color: "text-teal-600",    bg: "bg-teal-50",      emoji: "🤝" };
  if (score >= 31) return { label: "Offre Sensibilisée",            color: "text-blue-600",    bg: "bg-blue-50",      emoji: "💡" };
  return              { label: "Offre Conventionnelle",              color: "text-slate-500",   bg: "bg-slate-100",    emoji: "📋" };
}

function getActivitySustainabilityLevel(score: number) {
  if (score >= 86) return { label: "Activité Ambassadrice", color: "text-primary",      bg: "bg-primary/10",   emoji: "⭐" };
  if (score >= 71) return { label: "Activité Éco-Responsable", color: "text-emerald-600", bg: "bg-emerald-50", emoji: "🌿" };
  if (score >= 51) return { label: "Activité Engagée",       color: "text-teal-600",    bg: "bg-teal-50",      emoji: "🤝" };
  if (score >= 31) return { label: "Activité Sensibilisée",  color: "text-blue-600",    bg: "bg-blue-50",      emoji: "💡" };
  return              { label: "Activité Conventionnelle",    color: "text-slate-500",   bg: "bg-slate-100",    emoji: "📋" };
}

const ACTIVITY_SUSTAINABILITY_STEPS = [
  {
    category: "Impact Écologique", emoji: "🌿",
    description: "Empreinte environnementale de l'activité",
    questions: [
      { id: "aq1", text: "L'activité se déroule-t-elle dans un milieu naturel préservé ?", options: [{ label: "Oui, site protégé", value: 10 }, { label: "Partiellement", value: 5 }, { label: "Non", value: 0 }] },
      { id: "aq2", text: "Des mesures réduisent-elles l'empreinte carbone ?", options: [{ label: "Oui", value: 10 }, { label: "Partiellement", value: 5 }, { label: "Non", value: 0 }] },
      { id: "aq3", text: "Les déchets générés sont-ils gérés de manière responsable ?", options: [{ label: "Oui, complètement", value: 10 }, { label: "Partiellement", value: 5 }, { label: "Non", value: 0 }] },
    ],
  },
  {
    category: "Valorisation Locale", emoji: "🤝",
    description: "Intégration des ressources et acteurs locaux",
    questions: [
      { id: "aq4", text: "Faites-vous appel à des artisans ou intervenants locaux ?", options: [{ label: "Oui, systématiquement", value: 10 }, { label: "Parfois", value: 5 }, { label: "Non", value: 0 }] },
      { id: "aq5", text: "Valorisez-vous le patrimoine culturel local ?", options: [{ label: "Oui", value: 8 }, { label: "Partiellement", value: 4 }, { label: "Non", value: 0 }] },
    ],
  },
  {
    category: "Sensibilisation", emoji: "📚",
    description: "Actions d'éducation et de sensibilisation",
    questions: [
      { id: "aq6", text: "Sensibilisez-vous les participants à l'environnement ?", options: [{ label: "Oui, activement", value: 10 }, { label: "Partiellement", value: 5 }, { label: "Non", value: 0 }] },
      { id: "aq7", text: "Fournissez-vous des conseils sur les bonnes pratiques ?", options: [{ label: "Oui", value: 10 }, { label: "Non", value: 0 }] },
    ],
  },
  {
    category: "Accessibilité & Pratiques", emoji: "🏅",
    description: "Ouverture et encadrement responsable",
    questions: [
      { id: "aq8", text: "L'activité est-elle accessible aux personnes à mobilité réduite ?", options: [{ label: "Oui", value: 8 }, { label: "Partiellement", value: 4 }, { label: "Non", value: 0 }] },
      { id: "aq9", text: "Avez-vous une politique d'annulation éco-responsable ?", options: [{ label: "Oui", value: 7 }, { label: "Non", value: 0 }] },
    ],
  },
];

type Tab = "tout" | "offres" | "activites" | "reseau" | "apropos";

// ─── Botanical SVG Cover ──────────────────────────────────────────────────────

function BotanicalCover() {
  return (
    <div className="relative h-48 md:h-64 lg:h-72 w-full bg-gradient-to-br from-emerald-100 via-teal-50 to-slate-100 overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full opacity-25"
        viewBox="0 0 1200 300"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <g stroke="#2d6a4f" strokeWidth="1.5" fill="none">
          <path d="M1050,10 Q1150,60 1100,130 Q1050,200 980,160 Q1050,120 1050,10Z" />
          <path d="M1050,10 Q1000,90 980,160" />
          <path d="M1100,20 Q1180,80 1140,150 Q1100,200 1050,170 Q1110,130 1100,20Z" />
          <path d="M1100,20 Q1080,100 1050,170" />
          <path d="M950,40 Q1010,80 990,130 Q960,150 940,120 Q970,100 950,40Z" />
          <path d="M950,40 Q945,90 940,120" />
          <path d="M1200,0 Q1120,80 1000,120 Q900,150 850,200" strokeWidth="1" opacity="0.6" />
          <path d="M1200,50 Q1130,110 1060,140 Q990,170 960,220" strokeWidth="1" opacity="0.5" />
          <path d="M0,200 Q80,160 120,100 Q160,40 200,80" strokeWidth="1" opacity="0.4" />
          <path d="M0,240 Q60,210 100,170 Q140,130 180,150" strokeWidth="1" opacity="0.3" />
          <path d="M1080,200 Q1160,240 1150,290 Q1100,300 1050,270 Q1090,250 1080,200Z" />
          <path d="M1080,200 Q1060,250 1050,270" />
          <path d="M800,30 Q860,60 840,110 Q810,130 790,100 Q820,80 800,30Z" opacity="0.5" />
          <path d="M800,30 Q795,75 790,100" opacity="0.5" />
        </g>
        <path d="M0,260 Q300,230 600,250 Q900,270 1200,240" stroke="#2d6a4f" strokeWidth="1" fill="none" opacity="0.15" />
      </svg>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProviderProfilePage() {
  const router = useRouter();

  const [profile,        setProfile]        = useState<ProviderProfile | null>(null);
  const [org,            setOrg]            = useState<OrganizationProfile | null>(null);
  const [offers,         setOffers]         = useState<Offer[]>([]);
  const [activities,     setActivities]     = useState<Activity[]>([]);
  const [orgActivities,  setOrgActivities]  = useState<OrgActivity[]>([]);
  const [activityFilter, setActivityFilter] = useState<string | null>(null);
  const [token,     setToken]     = useState("");
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("tout");

  // ── OrgActivity detail modal ──────────────────────────────────────────────
  const [viewOrgActivity, setViewOrgActivity] = useState<OrgActivity | null>(null);
  const [orgActSliderIdx,  setOrgActSliderIdx]  = useState(0);

  // ── Activity modal (create) ──────────────────────────────────────────────
  const [actModalOpen,   setActModalOpen]   = useState(false);
  const [actForm,        setActForm]        = useState({ title: "", category: "", level: "primary" as "primary"|"secondary", description: "", region: "", address: "", website: "", phone: "" });
  const [actFormError,   setActFormError]   = useState("");
  const [actPublishing,  setActPublishing]  = useState(false);
  const [actImages,      setActImages]      = useState<{ file: File; preview: string }[]>([]);
  const [actCoverIdx,    setActCoverIdx]    = useState(0);

  // ── Activity detail/edit modal ───────────────────────────────────────────
  const [actDetailOpen,  setActDetailOpen]  = useState(false);
  const [actDetailMode,  setActDetailMode]  = useState<"view"|"edit">("view");
  const [viewActivity,   setViewActivity]   = useState<Activity | null>(null);
  const [actEditForm,    setActEditForm]    = useState({ title: "", category: "", level: "primary" as "primary"|"secondary", description: "", region: "", address: "", website: "", phone: "" });
  const [actEditError,   setActEditError]   = useState("");
  const [actEditSaving,  setActEditSaving]  = useState(false);
  const [actDeleting,    setActDeleting]    = useState(false);
  const [actEditImages,  setActEditImages]  = useState<{ src: string; file?: File }[]>([]);
  const [actEditCoverIdx,setActEditCoverIdx]= useState(0);

  // ── Activity type detail / edit modal (profile-level) ───────────────────
  const [actTypeOpen,          setActTypeOpen]          = useState(false);
  const [actTypeMode,          setActTypeMode]          = useState<"view" | "edit">("view");
  const [actTypeCurrent,       setActTypeCurrent]       = useState<{ value: string; level: "primary" | "secondary" } | null>(null);
  const [actTypeEditCategory,  setActTypeEditCategory]  = useState("");
  const [actTypeEditSubtype,   setActTypeEditSubtype]   = useState("");
  const [actTypeEditDynFields, setActTypeEditDynFields] = useState<Record<string, any>>({});
  const [actTypeSaving,        setActTypeSaving]        = useState(false);
  const [actTypeSaveError,     setActTypeSaveError]     = useState("");

  // ── Activity sustainability questionnaire ────────────────────────────────
  const [aqOpen,     setAqOpen]     = useState(false);
  const [aqActId,    setAqActId]    = useState("");
  const [aqStep,     setAqStep]     = useState(0);
  const [aqAnswers,  setAqAnswers]  = useState<Record<string, number>>({});
  const [aqSaving,   setAqSaving]   = useState(false);

  type NetUser = { user_id: string; full_name: string; photo: string | null; _type: string; sub?: string | null };
  const [following,  setFollowing]  = useState<NetUser[]>([]);
  const [followers,  setFollowers]  = useState<NetUser[]>([]);
  const [netSearch,  setNetSearch]  = useState("");
  const [netResults, setNetResults] = useState<NetUser[]>([]);
  const [netLoading, setNetLoading] = useState(false);
  const [netMenuId,        setNetMenuId]        = useState<string | null>(null);
  const [netReport,        setNetReport]        = useState<{ id: string; name: string } | null>(null);
  const [netReportReason,  setNetReportReason]  = useState("");
  const [netReportSending, setNetReportSending] = useState(false);
  const NET_REPORT_REASONS = ["Contenu inapproprié", "Faux profil", "Harcèlement ou spam", "Informations trompeuses", "Autre"];

  // ── Publish offer modal ──────────────────────────────────────────────────
  const [modalOpen,       setModalOpen]       = useState(false);
  const [form,            setForm]            = useState({ title: "", offer_type: "", description: "", price: "", duration: "", region: "", inclusions: "", meeting_point: "", min_group_size: "", max_group_size: "", min_age: "", cancellation_policy: "" });
  const [titleError,      setTitleError]      = useState("");
  const [publishing,      setPublishing]      = useState(false);
  const [publishError,    setPublishError]    = useState("");
  const [publishImages,   setPublishImages]   = useState<{ file: File; preview: string }[]>([]);
  const [publishCoverIdx, setPublishCoverIdx] = useState(0);
  const [showPublishMap,  setShowPublishMap]  = useState(false);
  const [publishMapLat,   setPublishMapLat]   = useState<number | null>(null);
  const [publishMapLng,   setPublishMapLng]   = useState<number | null>(null);
  // ── Offer enriched fields ────────────────────────────────────────────────
  const [offerActivity,      setOfferActivity]      = useState<OrgActivity | null>(null);
  const [offerSubtypes,      setOfferSubtypes]      = useState<string[]>([]);
  const [offerMode,          setOfferMode]          = useState<"single" | "variant" | "package">("single");
  const [subtypeDetails,     setSubtypeDetails]     = useState<Record<string, Record<string, any>>>({});
  const [constraintError,    setConstraintError]    = useState("");
  const [availabilityMode,   setAvailabilityMode]   = useState("always");
  const [availabilityStart,  setAvailabilityStart]  = useState("");
  const [availabilityEnd,    setAvailabilityEnd]    = useState("");
  const [availableWeekdays,  setAvailableWeekdays]  = useState<number[]>([]);
  const [specificDates,      setSpecificDates]      = useState<string[]>([]);
  const [newSpecificDate,    setNewSpecificDate]    = useState("");
  const [offerConfirmMode,   setOfferConfirmMode]   = useState("24h");
  const [offerDeadlineHours, setOfferDeadlineHours] = useState("24");
  const [offerDepositPct,    setOfferDepositPct]    = useState("30");
  // ── Bloc 1 extra ────────────────────────────────────────────────────────
  const [offerDescCourte,    setOfferDescCourte]    = useState("");
  const [offerLangue,        setOfferLangue]        = useState("");
  // ── Bloc 3 time fields ──────────────────────────────────────────────────
  const [availHeureDebut,    setAvailHeureDebut]    = useState("");
  const [availHeureFin,      setAvailHeureFin]      = useState("");
  const [availDelaiReponse,  setAvailDelaiReponse]  = useState("24h");
  const [availMessageAccueil,setAvailMessageAccueil]= useState("");
  const [availSaisons,       setAvailSaisons]       = useState<string[]>([]);
  // ── Bloc 4 pricing ──────────────────────────────────────────────────────
  const [prixGroupe,         setPrixGroupe]         = useState("");
  const [nbPersonnesGroupe,  setNbPersonnesGroupe]  = useState("");
  const [prixEnfant,         setPrixEnfant]         = useState("");
  const [ageMaxEnfant,       setAgeMaxEnfant]       = useState("");
  const [suppPrivatisation,  setSuppPrivatisation]  = useState("");
  const [acompteRequis,      setAcompteRequis]      = useState(false);
  const [typeAcompte,        setTypeAcompte]        = useState("pourcentage");
  const [valeurAcompte,      setValeurAcompte]      = useState("");
  // ── Bloc 6 annulation ───────────────────────────────────────────────────
  const [cancellationPolicy, setCancellationPolicy] = useState("moderate");
  const [cancellationDesc,   setCancellationDesc]   = useState("");
  // ── Tarif par sous-type (variant) ────────────────────────────────────────
  const [subtypePrices,      setSubtypePrices]      = useState<Record<string, string>>({});
  // ── Multi-unités par sous-type (hébergement) ─────────────────────────────
  // subtypeNbUnites[st]    = nb d'unités de ce sous-type
  // subtypeUnitDetails[st] = [{...champs unité 0}, {... unité 1}, ...]
  // activeSubtypeTab[st]   = onglet actif pour ce sous-type
  const [subtypeNbUnites,    setSubtypeNbUnites]    = useState<Record<string, number>>({});
  const [subtypeUnitDetails, setSubtypeUnitDetails] = useState<Record<string, Array<Record<string, any>>>>({});
  const [activeSubtypeTab,   setActiveSubtypeTab]   = useState<Record<string, number>>({});
  // ── Gardés pour compat (single subtype path) ──────────────────────────────
  const [offerNbUnites,      setOfferNbUnites]      = useState(1);
  const [unitDetailsArray,   setUnitDetailsArray]   = useState<Array<Record<string, any>>>([{}]);
  const [activeUnitTab,      setActiveUnitTab]      = useState(0);
  // ── Config par sous-type (disponibilité + tarification — hébergement) ────
  const [subtypeFormConfig,  setSubtypeFormConfig]  = useState<Record<string, Record<string, any>>>({});
  // ── Photos par entité (sous-type ou unité) ───────────────────────────────
  const [entityImages,   setEntityImages]   = useState<Record<string, Array<{file: File; preview: string}>>>({});
  const [entityCoverIdx, setEntityCoverIdx] = useState<Record<string, number>>({});

  // ── Offer detail / edit modal ────────────────────────────────────────────
  const [editModalOpen,  setEditModalOpen]  = useState(false);
  const [editMode,       setEditMode]       = useState(false);
  const [viewOffer,      setViewOffer]      = useState<Offer | null>(null);
  const [sliderIdx,      setSliderIdx]      = useState(0);
  const [touchStartX,    setTouchStartX]    = useState<number | null>(null);
  const [editOfferId,    setEditOfferId]    = useState("");
  const [editForm,       setEditForm]       = useState({ title: "", offer_type: "", description: "", price: "", duration: "", status: "", region: "", inclusions: "", meeting_point: "", min_group_size: "", max_group_size: "", min_age: "", cancellation_policy: "" });
  const [editTitleError, setEditTitleError] = useState("");
  const [editSaving,     setEditSaving]     = useState(false);
  const [editError,      setEditError]      = useState("");
  const [offerDeleting,  setOfferDeleting]  = useState(false);
  const [editImages,     setEditImages]     = useState<{ src: string; file?: File }[]>([]);
  const [editCoverIdx,   setEditCoverIdx]   = useState(0);
  const [showEditMap,    setShowEditMap]    = useState(false);
  const [editMapLat,     setEditMapLat]     = useState<number | null>(null);
  const [editMapLng,     setEditMapLng]     = useState<number | null>(null);

  // ── Offer sustainability questionnaire ───────────────────────────────────
  const [oqOpen,    setOqOpen]    = useState(false);
  const [oqOfferId, setOqOfferId] = useState("");
  const [oqStep,    setOqStep]    = useState(0);
  const [oqAnswers, setOqAnswers] = useState<Record<string, number>>({});
  const [oqSaving,  setOqSaving]  = useState(false);

  // ── Edit profile modal ────────────────────────────────────────────────────
  const [editProfileOpen,   setEditProfileOpen]   = useState(false);
  const [editProfileForm,   setEditProfileForm]   = useState({ full_name: "", bio: "", country: "", language: "", organization: "", position: "", phone: "", provider_type: "", region: "", website: "", years_experience: "" });
  const [editProfileActivities,    setEditProfileActivities]    = useState<string[]>([]);
  const [editProfileSecActivities, setEditProfileSecActivities] = useState<string[]>([]);
  const [editProfilePhoto,  setEditProfilePhoto]  = useState<{ file?: File; preview: string } | null>(null);
  const [editProfileCover,  setEditProfileCover]  = useState<{ file?: File; preview: string } | null>(null);
  const [editProfileSaving, setEditProfileSaving] = useState(false);
  const [editProfileError,  setEditProfileError]  = useState("");

  useEffect(() => {
    async function init() {
      const tkn = localStorage.getItem("access_token");
      if (!tkn) { router.push("/auth/login"); return; }
      setToken(tkn);
      try {
        const [p, myOffers, myActivities, myOrg, myOrgActivities] = await Promise.all([
          apiFetch<ProviderProfile>("/providers/me", { headers: { Authorization: `Bearer ${tkn}` } }),
          apiFetch<Offer[]>("/offers/mine", { headers: { Authorization: `Bearer ${tkn}` } }).catch(() => [] as Offer[]),
          apiFetch<Activity[]>("/provider-activities/mine", { headers: { Authorization: `Bearer ${tkn}` } }).catch(() => [] as Activity[]),
          apiFetch<OrganizationProfile>("/organizations/me", { headers: { Authorization: `Bearer ${tkn}` } }).catch(() => null),
          apiFetch<OrgActivity[]>("/provider-activities/mine", { headers: { Authorization: `Bearer ${tkn}` } }).catch(() => [] as OrgActivity[]),
        ]);
        setProfile(p);
        setOrg(myOrg);
        setOrgActivities(myOrgActivities);
        const offersWithCover = myOffers.map((o) => {
          const validImages = o.images?.filter((url) => url.startsWith("http")) ?? null;
          return {
            ...o,
            images:      validImages?.length ? validImages : null,
            cover_image: o.cover_image ?? validImages?.[0] ?? null,
          };
        });
        setOffers(offersWithCover);
        setActivities(myActivities);
        Promise.all([
          apiFetch<NetUser[]>("/follows/following/profiles", { headers: { Authorization: `Bearer ${tkn}` } }).catch(() => []),
          apiFetch<NetUser[]>("/follows/followers/profiles", { headers: { Authorization: `Bearer ${tkn}` } }).catch(() => []),
        ]).then(([fwing, fwers]) => {
          setFollowing(fwing); setFollowers(fwers);
        });
      } catch {
        router.push("/dashboard/provider");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  // Network search
  useEffect(() => {
    if (!netSearch.trim() || !token) { setNetResults([]); return; }
    const t = setTimeout(() => {
      setNetLoading(true);
      apiFetch<any[]>(`/guide/public/search?q=${encodeURIComponent(netSearch)}`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => setNetResults(r.map((g) => ({ user_id: g.user_id, full_name: g.full_name, photo: g.photo, _type: "guide", sub: g.zone ?? null }))))
        .catch(() => setNetResults([]))
        .finally(() => setNetLoading(false));
    }, 350);
    return () => clearTimeout(t);
  }, [netSearch, token]);

  async function handleNetUnfollow(userId: string) {
    try {
      await apiFetch(`/follows/${userId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setFollowing((prev) => prev.filter((f) => f.user_id !== userId));
    } catch {}
    setNetMenuId(null);
  }

  async function handleNetBlock(userId: string, isFollowing: boolean) {
    try {
      if (isFollowing) await apiFetch(`/follows/${userId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      await apiFetch(`/eco-traveler/block/${userId}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      setFollowing((prev) => prev.filter((f) => f.user_id !== userId));
      setFollowers((prev) => prev.filter((f) => f.user_id !== userId));
    } catch {}
    setNetMenuId(null);
  }

  async function handleNetReport() {
    if (!netReport || !netReportReason) return;
    setNetReportSending(true);
    try {
      await apiFetch(`/eco-traveler/report/${netReport.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: netReportReason }),
      });
      setNetReport(null); setNetReportReason("");
    } catch {}
    setNetReportSending(false);
  }

  async function uploadImage(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!res.ok) throw new Error("Upload échoué");
    const data = await res.json();
    return data.url as string;
  }

  // ── Publish modal ──────────────────────────────────────────────────────────

  function openModal() {
    setModalOpen(true);
  }

  function closeModal() {
    setPublishImages((prev) => { prev.forEach((img) => URL.revokeObjectURL(img.preview)); return []; });
    setPublishCoverIdx(0);
    setModalOpen(false);
    setTitleError(""); setPublishError("");
    setOfferActivity(null); setOfferSubtypes([]); setOfferMode("single");
    setSubtypeDetails({}); setConstraintError("");
    setAvailabilityMode("specific"); setAvailabilityStart(""); setAvailabilityEnd("");
    setAvailableWeekdays([]); setSpecificDates([]); setNewSpecificDate("");
    setAvailHeureDebut(""); setAvailHeureFin("");
    setAvailDelaiReponse("24h"); setAvailMessageAccueil(""); setAvailSaisons([]);
    setOfferConfirmMode("24h"); setOfferDeadlineHours("24"); setOfferDepositPct("30");
    setOfferDescCourte(""); setOfferLangue("");
    setPrixGroupe(""); setNbPersonnesGroupe(""); setPrixEnfant(""); setAgeMaxEnfant("");
    setSuppPrivatisation(""); setAcompteRequis(false); setTypeAcompte("pourcentage"); setValeurAcompte("");
    setCancellationPolicy("moderate"); setCancellationDesc("");
    setOfferNbUnites(1); setUnitDetailsArray([{}]); setActiveUnitTab(0); setSubtypePrices({});
    setSubtypeNbUnites({}); setSubtypeUnitDetails({}); setActiveSubtypeTab({});
    setSubtypeFormConfig({});
    setEntityImages((prev) => { Object.values(prev).flat().forEach((img) => URL.revokeObjectURL(img.preview)); return {}; });
    setEntityCoverIdx({});
  }

  async function handlePublish(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title.trim()) { setTitleError("Le titre est obligatoire."); return; }
    setPublishError(""); setPublishing(true);
    try {
      const isHebergementOffer = offerActivity?.category === 'hebergement';
      const combinedDetails: Record<string, any> = {};

      if (isHebergementOffer && offerSubtypes.length > 0) {
        // Unités par sous-type
        combinedDetails.subtypes_units = Object.fromEntries(
          offerSubtypes.map((st) => [st, subtypeUnitDetails[st] ?? [{}]])
        );
        // Disponibilité + tarification par sous-type
        if (Object.keys(subtypeFormConfig).length > 0) combinedDetails.subtypes_config = subtypeFormConfig;
        // Prix par sous-type en mode variant
        if (Object.keys(subtypePrices).length > 0) combinedDetails.subtypes_pricing = subtypePrices;
      } else {
        // Autres catégories : champs groupés
        Object.values(subtypeDetails).forEach((d) => Object.assign(combinedDetails, d));
      }
      if (availabilityMode === "weekly")   combinedDetails.available_weekdays = availableWeekdays;
      if (availabilityMode === "specific") combinedDetails.specific_dates = specificDates;
      if (availabilityMode === "season")   combinedDetails.available_saisons = availSaisons;
      if (availHeureDebut) combinedDetails.heure_debut = availHeureDebut;
      if (availHeureFin)   combinedDetails.heure_fin   = availHeureFin;
      if (availabilityMode === "on_demand") {
        combinedDetails.delai_reponse    = availDelaiReponse;
        combinedDetails.message_accueil  = availMessageAccueil;
      }

      const created = await apiFetch<Offer>("/offers", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          organization_id:             org?.id                                   || undefined,
          activity_id:                 offerActivity?.id                         || undefined,
          offer_subtypes:              offerSubtypes.length > 0 ? offerSubtypes  : undefined,
          offer_subtype:               offerSubtypes[0]                          || undefined,
          offer_mode:                  offerSubtypes.length > 1 ? offerMode      : "single",
          availability_mode:           availabilityMode,
          availability_start:          availabilityMode === "period" ? availabilityStart : undefined,
          availability_end:            availabilityMode === "period" ? availabilityEnd   : undefined,
          confirmation_mode:           offerConfirmMode,
          confirmation_deadline_hours: ["24h","48h"].includes(offerConfirmMode) ? Number(offerDeadlineHours) : undefined,
          deposit_percentage:          offerConfirmMode === "deposit" ? Number(offerDepositPct) : undefined,
          details: Object.keys(combinedDetails).length > 0 ? combinedDetails : undefined,
          title:               form.title.trim(),
          offer_type:          form.offer_type || offerActivity?.category  || undefined,
          description:         offerDescCourte.trim() || form.description.trim() || undefined,
          langue_offre:        offerLangue || undefined,
          price:               form.price  ? Number(form.price)  : undefined,
          subtypes_pricing:    Object.keys(subtypePrices).length > 0
            ? Object.fromEntries(Object.entries(subtypePrices).map(([k, v]) => [k, Number(v)]))
            : undefined,
          prix_par_groupe:     prixGroupe  ? Number(prixGroupe)  : undefined,
          nb_personnes_groupe: nbPersonnesGroupe ? Number(nbPersonnesGroupe) : undefined,
          prix_enfant:         prixEnfant  ? Number(prixEnfant)  : undefined,
          age_max_enfant:      ageMaxEnfant? Number(ageMaxEnfant): undefined,
          supplement_privatisation: suppPrivatisation ? Number(suppPrivatisation) : undefined,
          acompte_requis:      acompteRequis || undefined,
          type_acompte:        acompteRequis ? typeAcompte   : undefined,
          valeur_acompte:      acompteRequis ? Number(valeurAcompte) : undefined,
          duration:            form.duration.trim()      || undefined,
          region:              form.region.trim()        || undefined,
          inclusions:          form.inclusions.trim()    || undefined,
          meeting_point:       form.meeting_point.trim() || undefined,
          meeting_lat:         publishMapLat              ?? undefined,
          meeting_lng:         publishMapLng              ?? undefined,
          min_group_size:      form.min_group_size ? Number(form.min_group_size) : undefined,
          max_group_size:      form.max_group_size ? Number(form.max_group_size) : undefined,
          min_age:             form.min_age        ? Number(form.min_age)        : undefined,
          cancellation_policy: cancellationPolicy !== "custom"
            ? cancellationPolicy
            : (cancellationDesc.trim() || undefined),
        }),
      });

      let finalOffer: Offer = created;

      try {
        let mainImages: string[] = [];
        const detailsPhotos: Record<string, string[]> = {};

        if (offerSubtypes.length === 0 && publishImages.length > 0) {
          // Pas de sous-type → photos générales
          const urls = await Promise.all(publishImages.map((img) => uploadImage(img.file)));
          const cover = urls[publishCoverIdx] ?? urls[0];
          mainImages = [cover, ...urls.filter((u) => u !== cover)];
        } else {
          // Photos par sous-type ou par unité
          for (const [key, imgs] of Object.entries(entityImages)) {
            if (!imgs.length) continue;
            const urls = await Promise.all(imgs.map((img) => uploadImage(img.file)));
            const coverI = entityCoverIdx[key] ?? 0;
            const cover = urls[coverI] ?? urls[0];
            const ordered = [cover, ...urls.filter((u) => u !== cover)];
            detailsPhotos[key] = ordered;
            // Les photos du premier sous-type / unité 0 deviennent les images principales
            if (!mainImages.length) mainImages = ordered;
          }
        }

        if (mainImages.length > 0) {
          const patchBody: Record<string, any> = { images: mainImages };
          if (Object.keys(detailsPhotos).length > 0) patchBody.details_photos = detailsPhotos;
          await apiFetch<Offer>(`/offers/${created.id}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(patchBody),
          });
          finalOffer = { ...finalOffer, images: mainImages, cover_image: mainImages[0] };
        }
      } catch { /* offer saved without images */ }

      setOffers((prev) => [finalOffer, ...prev]);
      closeModal();
      setOqOfferId(finalOffer.id); setOqStep(0); setOqAnswers({}); setOqOpen(true);
    } catch (err: any) {
      setPublishError(err.message || "Erreur lors de la publication.");
    } finally {
      setPublishing(false);
    }
  }

  // ── Offer detail / edit modal ──────────────────────────────────────────────

  function openEditModal(offer: Offer) {
    setViewOffer(offer);
    setEditOfferId(offer.id);
    setEditForm({
      title:               offer.title,
      offer_type:          offer.offer_type          ?? "",
      description:         offer.description         ?? "",
      price:               offer.price !== null ? String(offer.price) : "",
      duration:            offer.duration            ?? "",
      status:              offer.status,
      region:              offer.region              ?? "",
      inclusions:          offer.inclusions          ?? "",
      meeting_point:       offer.meeting_point       ?? "",
      min_group_size:      offer.min_group_size !== null ? String(offer.min_group_size) : "",
      max_group_size:      offer.max_group_size !== null ? String(offer.max_group_size) : "",
      min_age:             offer.min_age       !== null ? String(offer.min_age)       : "",
      cancellation_policy: offer.cancellation_policy ?? "",
    });
    setEditTitleError(""); setEditError("");
    setEditMode(false);
    setSliderIdx(0);
    setEditModalOpen(true);
  }

  function closeEditModal() {
    setEditModalOpen(false);
    setEditMode(false);
    setViewOffer(null);
    setEditTitleError(""); setEditError("");
    setShowEditMap(false); setEditMapLat(null); setEditMapLng(null);
  }

  async function handleDeleteOffer() {
    if (!viewOffer) return;
    if (!confirm(`Supprimer l'offre "${viewOffer.title}" ? Cette action est irréversible.`)) return;
    setOfferDeleting(true);
    try {
      await apiFetch(`/offers/${viewOffer.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffers((prev) => prev.filter((o) => o.id !== viewOffer.id));
      closeEditModal();
    } catch {
      alert("Erreur lors de la suppression.");
    } finally {
      setOfferDeleting(false);
    }
  }

  async function handleSaveOffer(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editForm.title.trim()) { setEditTitleError("Le titre est obligatoire."); return; }
    setEditError(""); setEditSaving(true);
    try {
      const updated = await apiFetch<Offer>(`/offers/${editOfferId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title:               editForm.title.trim(),
          offer_type:          editForm.offer_type          || undefined,
          description:         editForm.description.trim()  || undefined,
          price:               editForm.price ? Number(editForm.price) : undefined,
          duration:            editForm.duration.trim()      || undefined,
          region:              editForm.region.trim()        || undefined,
          inclusions:          editForm.inclusions.trim()    || undefined,
          meeting_point:       editForm.meeting_point.trim() || undefined,
          min_group_size:      editForm.min_group_size ? Number(editForm.min_group_size) : undefined,
          max_group_size:      editForm.max_group_size ? Number(editForm.max_group_size) : undefined,
          min_age:             editForm.min_age        ? Number(editForm.min_age)        : undefined,
          cancellation_policy: editForm.cancellation_policy.trim() || undefined,
          status:              editForm.status,
        }),
      });
      const finalImageSrcs = (await Promise.all(
        editImages.map(async (img) => {
          if (img.file) {
            try { return await uploadImage(img.file); } catch { return null; }
          }
          return img.src.startsWith("http") ? img.src : null;
        })
      )).filter((url): url is string => url !== null);
      const coverSrc = finalImageSrcs[editCoverIdx] ?? finalImageSrcs[0] ?? null;
      const orderedImages = coverSrc
        ? [coverSrc, ...finalImageSrcs.filter((_, i) => i !== (finalImageSrcs.indexOf(coverSrc)))]
        : finalImageSrcs;
      const newCover = orderedImages[0] ?? null;
      await apiFetch<Offer>(`/offers/${editOfferId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ images: orderedImages.length ? orderedImages : [] }),
      }).catch(() => {});
      const finalUpdated: Offer = {
        ...updated,
        images:      finalImageSrcs.length ? finalImageSrcs : null,
        cover_image: newCover,
      };
      setOffers((prev) => prev.map((o) => (o.id === editOfferId ? finalUpdated : o)));
      setViewOffer(finalUpdated);
      setEditMode(false);
    } catch (err: any) {
      setEditError(err.message || "Erreur lors de la sauvegarde.");
    } finally {
      setEditSaving(false);
    }
  }

  // ── Offer sustainability questionnaire handlers ────────────────────────────

  async function submitOfferQuestionnaire() {
    const score = Object.values(oqAnswers).reduce((s, v) => s + v, 0);
    setOqSaving(true);
    try {
      const updated = await apiFetch<Offer>(`/offers/${oqOfferId}/sustainability`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ score }),
      });
      setOffers((prev) => prev.map((o) => o.id === oqOfferId ? { ...o, sustainability_score: updated.sustainability_score } : o));
      if (viewOffer?.id === oqOfferId) setViewOffer((v) => v ? { ...v, sustainability_score: updated.sustainability_score } : v);
    } catch {}
    finally {
      setOqSaving(false);
    }
  }

  // ── Activity CRUD handlers ────────────────────────────────────────────────

  function openActModal() {
    setActForm({ title: "", category: "", level: "primary", description: "", region: "", address: "", website: "", phone: "" });
    setActFormError(""); setActImages([]); setActCoverIdx(0);
    setActModalOpen(true);
  }

  async function handleCreateActivity(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!actForm.title.trim()) { setActFormError("Le titre est obligatoire."); return; }
    if (!actForm.category)     { setActFormError("Choisissez un type d'activité."); return; }
    setActFormError(""); setActPublishing(true);
    try {
      const created = await apiFetch<Activity>("/provider-activities", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title:       actForm.title.trim(),
          category:    actForm.category,
          level:       actForm.level,
          description: actForm.description.trim() || undefined,
          region:      actForm.region.trim()       || undefined,
          address:     actForm.address.trim()      || undefined,
          website:     actForm.website.trim()      || undefined,
          phone:       actForm.phone.trim()        || undefined,
        }),
      });
      let finalActivity: Activity = created;
      if (actImages.length > 0) {
        try {
          const urls = await Promise.all(actImages.map((img) => uploadImage(img.file)));
          const cover = urls[actCoverIdx] ?? urls[0];
          await apiFetch<Activity>(`/provider-activities/${created.id}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ photos: urls, photo: cover }),
          });
          finalActivity = { ...finalActivity, photos: urls, photo: cover };
        } catch {}
      }
      setActivities((prev) => [finalActivity, ...prev]);
      setActImages((prev) => { prev.forEach((i) => URL.revokeObjectURL(i.preview)); return []; });
      setActModalOpen(false);
      setAqActId(finalActivity.id); setAqStep(0); setAqAnswers({}); setAqOpen(true);
    } catch (err: any) {
      setActFormError(err.message || "Erreur lors de la création.");
    } finally {
      setActPublishing(false);
    }
  }

  function openActivityDetail(activity: Activity) {
    setViewActivity(activity);
    setActEditForm({ title: activity.title, category: activity.category, level: activity.level, description: activity.description ?? "", region: activity.region ?? "", address: activity.address ?? "", website: activity.website ?? "", phone: activity.phone ?? "" });
    setActEditError(""); setActDetailMode("view");
    const imgs = (activity.photos?.length ? activity.photos : activity.photo ? [activity.photo] : []).filter((s) => s.startsWith("http"));
    setActEditImages(imgs.map((src) => ({ src })));
    setActEditCoverIdx(0);
    setActDetailOpen(true);
  }

  async function handleDeleteActivity() {
    if (!viewActivity) return;
    if (!confirm(`Supprimer l'activité "${viewActivity.title}" ? Cette action est irréversible.`)) return;
    setActDeleting(true);
    try {
      await apiFetch(`/provider-activities/${viewActivity.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setActivities((prev) => prev.filter((a) => a.id !== viewActivity.id));
      setActDetailOpen(false);
    } catch { alert("Erreur lors de la suppression."); }
    finally { setActDeleting(false); }
  }

  async function handleSaveActivity(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!actEditForm.title.trim()) { setActEditError("Le titre est obligatoire."); return; }
    setActEditError(""); setActEditSaving(true);
    try {
      const updated = await apiFetch<Activity>(`/provider-activities/${viewActivity!.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title:       actEditForm.title.trim(),
          category:    actEditForm.category    || undefined,
          level:       actEditForm.level,
          description: actEditForm.description.trim() || undefined,
          region:      actEditForm.region.trim()       || undefined,
          address:     actEditForm.address.trim()      || undefined,
          website:     actEditForm.website.trim()      || undefined,
          phone:       actEditForm.phone.trim()        || undefined,
        }),
      });
      const finalImgSrcs = (await Promise.all(
        actEditImages.map(async (img) => {
          if (img.file) { try { return await uploadImage(img.file); } catch { return null; } }
          return img.src.startsWith("http") ? img.src : null;
        })
      )).filter((u): u is string => u !== null);
      const cover = finalImgSrcs[actEditCoverIdx] ?? finalImgSrcs[0] ?? null;
      if (finalImgSrcs.length) {
        await apiFetch(`/provider-activities/${viewActivity!.id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ photos: finalImgSrcs, photo: cover }),
        }).catch(() => {});
      }
      const finalAct: Activity = { ...updated, photos: finalImgSrcs.length ? finalImgSrcs : null, photo: cover };
      setActivities((prev) => prev.map((a) => a.id === viewActivity!.id ? finalAct : a));
      setViewActivity(finalAct);
      setActDetailMode("view");
    } catch (err: any) {
      setActEditError(err.message || "Erreur lors de la sauvegarde.");
    } finally {
      setActEditSaving(false);
    }
  }

  async function submitActivityQuestionnaire() {
    const score = Object.values(aqAnswers).reduce((s, v) => s + v, 0);
    setAqSaving(true);
    try {
      const updated = await apiFetch<Activity>(`/provider-activities/${aqActId}/sustainability`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ score }),
      });
      setActivities((prev) => prev.map((a) => a.id === aqActId ? { ...a, sustainability_score: updated.sustainability_score } : a));
      if (viewActivity?.id === aqActId) setViewActivity((v) => v ? { ...v, sustainability_score: updated.sustainability_score } : v);
    } catch {}
    finally { setAqSaving(false); }
  }

  // ── Activity type detail / edit modal handlers ────────────────────────────

  function openActTypeModal(value: string, level: "primary" | "secondary") {
    const meta = findProviderTypeMeta(value);
    setActTypeCurrent({ value, level });
    setActTypeEditCategory(meta.categoryValue);
    setActTypeEditSubtype(value);
    setActTypeEditDynFields({});
    setActTypeSaveError("");
    setActTypeMode("view");
    setActTypeOpen(true);
  }

  async function saveActivityType() {
    if (!profile || !actTypeCurrent) return;
    setActTypeSaving(true);
    setActTypeSaveError("");
    try {
      const newValue = actTypeEditSubtype || actTypeEditCategory;
      let body: Record<string, any> = {};
      if (actTypeCurrent.level === "primary") {
        body = { activity_types: [newValue] };
      } else {
        const orig = actTypeCurrent.value;
        const updated = (profile.secondary_activity_types ?? []).map((v) => v === orig ? newValue : v);
        body = { secondary_activity_types: updated };
      }
      const updated = await apiFetch<ProviderProfile>("/providers/me", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setProfile(updated);
      setActTypeOpen(false);
    } catch (e: any) {
      setActTypeSaveError(e.message ?? "Erreur lors de la sauvegarde.");
    } finally {
      setActTypeSaving(false);
    }
  }

  // ── Edit profile modal ─────────────────────────────────────────────────────

  function openEditProfile() {
    if (!profile) return;
    setEditProfileForm({
      full_name:        profile.full_name        ?? "",
      bio:              profile.bio              ?? "",
      country:          profile.country          ?? "",
      language:         profile.language         ?? "",
      organization:     profile.organization     ?? "",
      position:         profile.position         ?? "",
      phone:            profile.phone            ?? "",
      provider_type:    profile.provider_type    ?? "",
      region:           profile.region           ?? "",
      website:          profile.website          ?? "",
      years_experience: profile.years_experience !== null ? String(profile.years_experience) : "",
    });
    setEditProfileActivities(profile.activity_types           ?? []);
    setEditProfileSecActivities(profile.secondary_activity_types ?? []);
    setEditProfilePhoto(profile.photo       ? { preview: profile.photo }       : null);
    setEditProfileCover(profile.cover_photo ? { preview: profile.cover_photo } : null);
    setEditProfileError("");
    setEditProfileOpen(true);
  }

  function closeEditProfile() {
    setEditProfileOpen(false);
    setEditProfileError("");
  }

  async function handleSaveProfile(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editProfileForm.full_name.trim()) {
      setEditProfileError("Le nom complet est obligatoire.");
      return;
    }
    setEditProfileError(""); setEditProfileSaving(true);
    try {
      let photoUrl: string | undefined = profile?.photo ?? undefined;
      let coverUrl: string | undefined = profile?.cover_photo ?? undefined;

      if (editProfilePhoto?.file) photoUrl = await uploadImage(editProfilePhoto.file);
      else if (editProfilePhoto === null) photoUrl = undefined;

      if (editProfileCover?.file) coverUrl = await uploadImage(editProfileCover.file);
      else if (editProfileCover === null) coverUrl = undefined;

      const updated = await apiFetch<ProviderProfile>("/providers/me", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          full_name:                 editProfileForm.full_name.trim(),
          bio:                       editProfileForm.bio.trim()          || undefined,
          country:                   editProfileForm.country             || undefined,
          language:                  editProfileForm.language            || undefined,
          photo:                     photoUrl,
          cover_photo:               coverUrl,
          organization:              editProfileForm.organization.trim() || undefined,
          position:                  editProfileForm.position.trim()     || undefined,
          phone:                     editProfileForm.phone.trim()        || undefined,
          provider_type:             editProfileForm.provider_type       || undefined,
          region:                    editProfileForm.region.trim()       || undefined,
          website:                   editProfileForm.website.trim()      || undefined,
          years_experience:          editProfileForm.years_experience ? Number(editProfileForm.years_experience) : undefined,
          activity_types:            editProfileActivities.length ? editProfileActivities : undefined,
          secondary_activity_types:  editProfileSecActivities.length ? editProfileSecActivities : undefined,
        }),
      });
      setProfile((prev) => prev ? { ...prev, ...updated } : prev);
      setEditProfileOpen(false);
    } catch (err: any) {
      setEditProfileError(err.message || "Erreur lors de la sauvegarde.");
    } finally {
      setEditProfileSaving(false);
    }
  }

  // ─── Loading / empty states ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!profile) return null;

  // ── Helpers ────────────────────────────────────────────────────────────────

  // Org logo > provider photo > placeholder
  const AvatarImg = ({ cls = "" }: { cls?: string }) => {
    const src = org?.logo ?? profile.photo;
    return src ? (
      <img src={src} alt="" className={`w-full h-full object-cover ${cls}`} />
    ) : (
      <span className="material-symbols-outlined text-primary text-5xl">store</span>
    );
  };

  function openDoc(url: string) {
    if (url.startsWith("data:")) {
      const w = window.open("", "_blank");
      if (w) w.document.write(`<html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${url}" style="max-width:100%;max-height:100vh;object-fit:contain"/></body></html>`);
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  function socialHref(platform: string, value: string): string {
    if (value.startsWith("http")) return value;
    const handle = value.startsWith("@") ? value.slice(1) : value;
    if (platform === "instagram") return `https://www.instagram.com/${handle}`;
    if (platform === "facebook") return `https://www.facebook.com/${handle}`;
    if (platform === "tiktok") return `https://www.tiktok.com/@${handle}`;
    return value;
  }

  const scoreLabel = (score: number | null) => {
    if (score === null) return "Prestataire";
    if (score >= 80) return "Éco-Leader";
    if (score >= 60) return "Prestataire Engagé";
    if (score >= 40) return "Prestataire Sensible";
    return "Prestataire en Développement";
  };

  const roleLabel =
    profile.organization ??
    profile.position ??
    scoreLabel(profile.sustainability_score);

  // ── Activity card (style projet) ──────────────────────────────────────────
  const ActivityCard = ({ value, level }: { value: string; level: "primary" | "secondary" }) => {
    const meta = findProviderTypeMeta(value);
    const isPrimary = level === "primary";

    return (
      <div className="bg-white rounded-3xl border border-slate-100/90 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
        {/* Cover gradient */}
        <div className="relative h-48 w-full overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient}`} />
          <div className="absolute inset-0 flex items-center justify-center select-none opacity-20">
            <span className="material-symbols-outlined" style={{ fontSize: 80 }}>{meta.categoryIcon}</span>
          </div>
          {/* Level badge */}
          <div className={`absolute top-3 left-3 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-xl shadow-md border ${isPrimary ? "bg-primary text-white border-white/20" : "bg-white/95 text-orange-500 border-orange-100"}`}>
            {isPrimary ? "Principale" : "Secondaire"}
          </div>
          {/* Category badge */}
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-xl">
            <span className="material-symbols-outlined align-middle" style={{ fontSize: 13 }}>{meta.categoryIcon}</span> {meta.categoryLabel}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-extrabold text-slate-800 tracking-tight mb-1 leading-tight">{meta.label}</h3>
          {profile?.bio && (
            <p className="text-slate-500 text-sm leading-relaxed mb-3 line-clamp-2">{profile.bio}</p>
          )}
          {profile?.region && (
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-3">
              <MapPin size={12} /><span>{profile.region}</span>
            </div>
          )}
          {profile?.sustainability_score !== null && profile?.sustainability_score !== undefined ? (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Durabilité</span>
                <span className="text-[10px] font-black text-primary">{profile.sustainability_score}/100</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${profile.sustainability_score}%` }} />
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-primary/40 rounded-xl py-1.5 px-3 mb-3 text-center text-[11px] font-bold text-primary/70">
              🌿 Évaluer la durabilité
            </div>
          )}
          <div className="flex items-center justify-between border-t border-slate-50 pt-3">
            <p className="text-[11px] font-bold text-slate-400">
              {isPrimary ? "Activité principale" : "Activité secondaire"}
            </p>
            <button
              onClick={() => openActTypeModal(value, level)}
              className="text-primary hover:text-primary/80 font-extrabold text-xs inline-flex items-center gap-1 hover:translate-x-1 transition-transform duration-200"
            >
              <span>Voir les détails</span>
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <PubInteractions
          pubId={`activity-${value}-${profile?.user_id ?? ""}`}
          token={token}
          viewerId={profile?.user_id ?? ""}
          shareUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/profile/provider/${profile?.user_id}`}
          pubTitle={meta.label}
          itemApiBase="/interactions/activity"
          commentApiBase="/interactions"
        />
      </div>
    );
  };

  // ── Launch activity CTA ────────────────────────────────────────────────────
  const LaunchActivityCard = () => (
    <div
      onClick={() => setEditProfileOpen(true)}
      className="bg-white rounded-3xl border-2 border-dashed border-slate-200 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center p-10 text-center min-h-[200px]"
    >
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 hover:scale-110 transition-transform">
        <Plus size={22} className="text-primary" strokeWidth={2.5} />
      </div>
      <p className="font-extrabold text-slate-700 text-base mb-1">Ajouter une activité ?</p>
      <p className="text-slate-400 text-sm leading-relaxed mb-4">Gérez vos activités principale et secondaires dans votre profil.</p>
      <span className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-600 hover:bg-slate-50 bg-white">
        Nouvelle activité
      </span>
    </div>
  );

  // ── Offer card ─────────────────────────────────────────────────────────────
  const OfferCard = ({ offer }: { offer: Offer }) => {
    const typeData    = OFFER_TYPES.find((t) => t.value === offer.offer_type) ?? OFFER_TYPES[OFFER_TYPES.length - 1];
    const statusLabel = offer.status === "approved" ? "Offre Active" : offer.status === "pending" ? "En attente" : "Refusée";
    const statusClass = offer.status === "approved" ? "bg-primary text-white border-white/20" : offer.status === "pending" ? "bg-amber-500 text-white border-white/20" : "bg-red-500 text-white border-white/20";

    return (
      <div className="bg-white rounded-3xl border border-slate-100/90 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-2/5 relative min-h-[200px] bg-slate-50 flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-100">
            {offer.cover_image ? (
              <img src={offer.cover_image} alt={offer.title} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <>
                <div className={`absolute inset-0 bg-gradient-to-br ${typeData.gradient} opacity-90`} />
                <span className="material-symbols-outlined text-white/40 relative z-10" style={{ fontSize: 100 }}>{typeData.icon}</span>
              </>
            )}
            <div className={`absolute top-3 left-3 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-xl shadow border ${statusClass}`}>
              {statusLabel}
            </div>
            {offer.price !== null && (
              <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-xl shadow border border-slate-100 text-right">
                <span className="text-primary font-extrabold text-lg tracking-tight">{offer.price} DT</span>
                {offer.duration && <span className="text-slate-400 text-[10px] font-bold block leading-none">/{offer.duration}j</span>}
              </div>
            )}
          </div>

          <div className="lg:w-3/5 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-lg md:text-xl font-extrabold text-slate-800 tracking-tight leading-tight">{offer.title}</h3>
                {offer.price !== null && (
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-xl font-extrabold text-primary tracking-tight">
                      {offer.price} DT<span className="text-slate-400 font-bold text-xs">/{offer.duration ? `${offer.duration}j` : "pers"}</span>
                    </p>
                  </div>
                )}
              </div>
              {offer.description && (
                <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-3">{offer.description}</p>
              )}
              <div className="flex flex-wrap gap-2.5 mb-5">
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100/60 rounded-xl px-3 py-1 text-[11px] font-extrabold tracking-wider flex items-center gap-1 uppercase">
                  <Sparkles size={11} className="text-emerald-500 shrink-0" />{typeData.label}
                </span>
              </div>
            </div>
            {offer.sustainability_score !== null ? (
              <div className="mt-3 mb-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Durabilité</span>
                  <span className="text-[10px] font-black text-primary">{offer.sustainability_score}/100</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${offer.sustainability_score}%` }} />
                </div>
                <span className={`mt-1 inline-block text-[10px] font-bold ${getOfferSustainabilityLevel(offer.sustainability_score).color}`}>
                  {getOfferSustainabilityLevel(offer.sustainability_score).emoji} {getOfferSustainabilityLevel(offer.sustainability_score).label}
                </span>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setOqOfferId(offer.id); setOqStep(0); setOqAnswers({}); setOqOpen(true); }}
                className="mt-3 w-full border border-dashed border-primary/40 text-primary text-[11px] font-bold py-1.5 rounded-xl hover:bg-primary/5 transition-colors"
              >
                🌿 Évaluer la durabilité
              </button>
            )}
            <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-3">
              <p className="text-[11px] font-bold text-slate-400">
                {new Date(offer.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <button
                onClick={() => openEditModal(offer)}
                className="text-primary hover:text-primary/80 font-extrabold text-xs inline-flex items-center gap-1 hover:translate-x-1 transition-transform duration-200"
              >
                <span>Voir les détails</span>
                <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
        {offer.status === "approved" && (
          <PubInteractions
            pubId={offer.id}
            token={token}
            viewerId={profile?.user_id ?? ""}
            shareUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/profile/provider/${profile?.user_id}?offer=${offer.id}`}
            pubTitle={offer.title}
            itemApiBase="/interactions/offer"
            commentApiBase="/interactions"
          />
        )}
      </div>
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
    {/* ══ ACTIVITY CREATE MODAL ════════════════════════════════════════════ */}
    {actModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
          <button onClick={() => setActModalOpen(false)} className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"><X size={16} /></button>
          <div className="px-8 pt-8 pb-5 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center"><span className="material-symbols-outlined text-primary text-xl">category</span></div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Nouvelle activité</h3>
                <p className="text-slate-400 text-xs mt-0.5">Présentez votre activité éco-touristique</p>
              </div>
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            <form id="act-create-form" onSubmit={handleCreateActivity} className="px-8 py-6 space-y-5">
              <div>
                <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Titre *</label>
                <input type="text" placeholder="Ex : Randonnée en forêt de Mogods"
                  value={actForm.title} onChange={(e) => { setActForm((f) => ({ ...f, title: e.target.value })); setActFormError(""); }}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 transition-all ${actFormError && !actForm.title ? "bg-red-50 border border-red-300 focus:ring-red-200" : "bg-slate-50 border border-slate-200 focus:ring-primary focus:bg-white"}`}
                />
              </div>
              <div>
                <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Type d'activité *</label>
                <div className="grid grid-cols-3 gap-2">
                  {PROVIDER_ACTIVITY_TYPES.map((t) => {
                    const active = actForm.category === t.value;
                    return (
                      <button key={t.value} type="button"
                        onClick={() => { setActForm((f) => ({ ...f, category: active ? "" : t.value })); setActFormError(""); }}
                        className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border-2 text-center transition-all cursor-pointer ${active ? "bg-primary/10 border-primary text-slate-900 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-500 hover:border-primary/40 hover:bg-white"}`}>
                        <span className={`material-symbols-outlined text-xl ${active ? "text-primary" : "text-slate-400"}`}>{t.icon}</span>
                        <span className="text-[10px] font-extrabold leading-tight">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Niveau</label>
                <div className="grid grid-cols-2 gap-3">
                  {([["primary", "Principale", "Activité phare de votre offre"], ["secondary", "Secondaire", "Activité complémentaire"]] as const).map(([val, lbl, desc]) => (
                    <button key={val} type="button" onClick={() => setActForm((f) => ({ ...f, level: val }))}
                      className={`py-3 px-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${actForm.level === val ? "bg-primary/10 border-primary" : "bg-slate-50 border-slate-200 hover:border-primary/40"}`}>
                      <p className={`text-xs font-extrabold ${actForm.level === val ? "text-primary" : "text-slate-700"}`}>{lbl}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Description</label>
                <textarea rows={4} placeholder="Décrivez votre activité éco-touristique…"
                  value={actForm.description} onChange={(e) => setActForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white resize-none placeholder:text-slate-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Région</label>
                  <input type="text" placeholder="Sousse, Djerba…"
                    value={actForm.region} onChange={(e) => setActForm((f) => ({ ...f, region: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Téléphone</label>
                  <input type="tel" placeholder="+216 12 345 678"
                    value={actForm.phone} onChange={(e) => setActForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white placeholder:text-slate-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Photos</label>
                <label htmlFor="act-create-images" className="flex flex-col items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all bg-slate-50/70">
                  <span className="material-symbols-outlined text-slate-300 text-3xl">add_photo_alternate</span>
                  <p className="text-xs font-semibold text-slate-400">Ajouter des photos</p>
                  <input id="act-create-images" type="file" accept="image/*" multiple className="hidden"
                    onChange={(e) => { const files = Array.from(e.target.files ?? []); setActImages((prev) => [...prev, ...files.map((f) => ({ file: f, preview: URL.createObjectURL(f) }))]); e.target.value = ""; }}
                  />
                </label>
                {actImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {actImages.map((img, i) => (
                      <div key={i} onClick={() => setActCoverIdx(i)} className={`relative group aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${i === actCoverIdx ? "border-primary shadow-md" : "border-transparent hover:border-slate-300"}`}>
                        <img src={img.preview} alt="" className="w-full h-full object-cover" />
                        {i === actCoverIdx && <div className="absolute top-1 left-1 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">Cover</div>}
                        <button type="button" onClick={(e) => { e.stopPropagation(); URL.revokeObjectURL(img.preview); setActImages((prev) => prev.filter((_, idx) => idx !== i)); setActCoverIdx((c) => c >= i && c > 0 ? c - 1 : c); }} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {actFormError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <span className="material-symbols-outlined text-red-500 text-base">error</span>
                  <p className="text-sm font-semibold text-red-600">{actFormError}</p>
                </div>
              )}
            </form>
          </div>
          <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={() => setActModalOpen(false)} className="px-5 py-2.5 border border-slate-200 text-slate-600 bg-white rounded-2xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer">Annuler</button>
            <button type="submit" form="act-create-form" disabled={actPublishing} className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-extrabold rounded-2xl text-xs shadow-sm transition-all active:scale-95 disabled:opacity-60 cursor-pointer">
              {actPublishing ? <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Création…</> : <><Send size={14} />Créer l'activité</>}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ══ ORG ACTIVITY DETAIL MODAL ════════════════════════════════════════ */}
    {viewOrgActivity && (() => {
      const act = viewOrgActivity;
      const meta = findProviderTypeMeta(act.category);
      const cat = getCategoryByValue(act.category);
      const isPrimary = act.level === "primary";
      const sliderImgs = Object.values(act.photos ?? {}).flat().filter(Boolean);
      const safeIdx = Math.min(orgActSliderIdx, Math.max(sliderImgs.length - 1, 0));
      const fields = (act.fields ?? {}) as Record<string, any>;

      function renderFieldValue(field: FieldConfig, val: any) {
        const isDocUrl = field.type === "url" || (typeof val === "string" && (val.startsWith("http") || val.startsWith("data:")));
        if (isDocUrl && typeof val === "string" && val.trim()) {
          return (
            <button onClick={() => openDoc(val)}
              className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20 inline-flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>open_in_new</span> Voir
            </button>
          );
        }
        if (typeof val === "boolean") return <span className="text-xs font-semibold text-slate-700">{val ? "Oui" : "Non"}</span>;
        if (Array.isArray(val)) return <span className="text-xs font-semibold text-slate-700">{val.join(", ")}</span>;
        return <span className="text-xs font-semibold text-slate-700">{String(val)}</span>;
      }

      // Build subtype blocks — each subtype has its own photos + sections
      const subtypeValues = act.subtypes ?? [];
      const knownFieldKeys = new Set<string>();
      const subtypeBlocks = subtypeValues.map((sv) => {
        const config = SUBTYPE_FIELDS[sv];
        if (!config) return null;
        const subtypePhotos = (act.photos ?? {})[sv]?.filter(Boolean) ?? [];
        const sections = config.sections.map((sec) => {
          const visibleFields = sec.fields.filter((f) => {
            if (fields[f.key] == null || fields[f.key] === "") return false;
            if (f.dependsOn && fields[f.dependsOn.field] !== f.dependsOn.value) return false;
            knownFieldKeys.add(f.key);
            return true;
          });
          return { ...sec, visibleFields };
        }).filter((s) => s.visibleFields.length > 0);
        if (!sections.length && !subtypePhotos.length) return null;
        return { sv, config, subtypePhotos, sections };
      }).filter(Boolean);

      // Orphan fields (not covered by any subtype config)
      const orphanFields = Object.entries(fields).filter(([k]) => !knownFieldKeys.has(k));

      return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={() => setViewOrgActivity(null)}>
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

            {/* Cover */}
            <div className="relative h-52 w-full overflow-hidden shrink-0">
              <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient}`} />
              {sliderImgs[0]
                ? <img src={sliderImgs[0]} alt={meta.label} className="absolute inset-0 w-full h-full object-cover" />
                : <div className="absolute inset-0 flex items-center justify-center opacity-20 select-none">
                    <span className="material-symbols-outlined" style={{ fontSize: 100 }}>{meta.categoryIcon}</span>
                  </div>
              }
              <button onClick={() => setViewOrgActivity(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60">
                <X size={16} />
              </button>
              <div className={`absolute top-3 left-3 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-xl shadow border ${isPrimary ? "bg-primary text-white border-white/20" : "bg-white/95 text-orange-500 border-orange-100"}`}>
                {isPrimary ? "Principale" : "Secondaire"}
              </div>
              <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-xl">
                <span className="material-symbols-outlined align-middle" style={{ fontSize: 13 }}>{meta.categoryIcon}</span> {meta.categoryLabel}
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-6">

              {/* Header */}
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">{meta.label}</h2>
                {act.years_experience != null && (
                  <p className="text-slate-400 text-sm mt-1">{act.years_experience} an{act.years_experience > 1 ? "s" : ""} d'expérience</p>
                )}
              </div>

              {/* Bloc par sous-type */}
              {subtypeBlocks.map((block) => {
                if (!block) return null;
                const stLabel = cat?.subtypes.find((s) => s.value === block.sv)?.label ?? block.config.label;
                return (
                  <div key={block.sv} className="rounded-2xl border border-slate-100 overflow-hidden">
                    {/* Subtype header */}
                    <div className="bg-primary/5 border-b border-primary/10 px-4 py-2.5 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>{meta.categoryIcon}</span>
                      <span className="text-sm font-extrabold text-primary">{stLabel}</span>
                    </div>

                    {/* Photos de ce sous-type */}
                    {block.subtypePhotos.length > 0 && (
                      <div className="p-4 border-b border-slate-50">
                        <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2">Photos</p>
                        <div className="grid grid-cols-3 gap-2">
                          {block.subtypePhotos.map((url, i) => (
                            <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100 cursor-pointer group" onClick={() => openDoc(url)}>
                              <img src={url} alt={stLabel} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sections de champs */}
                    {block.sections.map((sec) => (
                      <div key={sec.section} className="p-4 border-b border-slate-50 last:border-0">
                        <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-3">{sec.section}</p>
                        <div className="space-y-2.5">
                          {sec.visibleFields.map((field) => {
                            const val = fields[field.key];
                            return (
                              <div key={field.key} className="flex items-start gap-3">
                                <span className="text-[11px] font-bold text-slate-500 min-w-[120px] leading-tight mt-0.5 flex-shrink-0">{field.label}</span>
                                <div className="flex-1">{renderFieldValue(field, val)}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* Champs orphelins (pas dans SUBTYPE_FIELDS) */}
              {orphanFields.length > 0 && (
                <div className="rounded-2xl border border-slate-100 overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5">
                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Autres informations</p>
                  </div>
                  <div className="p-4 space-y-2.5">
                    {orphanFields.map(([key, val]) => {
                      const isUrl = typeof val === "string" && (val.startsWith("http") || val.startsWith("data:"));
                      return (
                        <div key={key} className="flex items-start gap-3">
                          <span className="text-[11px] font-bold text-slate-500 min-w-[120px] leading-tight mt-0.5 flex-shrink-0">{key.replace(/_/g, " ")}</span>
                          <div className="flex-1">
                            {isUrl ? (
                              <button onClick={() => openDoc(val)}
                                className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20 inline-flex items-center gap-1">
                                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>open_in_new</span> Voir
                              </button>
                            ) : (
                              <span className="text-xs font-semibold text-slate-700">
                                {Array.isArray(val) ? val.join(", ") : typeof val === "boolean" ? (val ? "Oui" : "Non") : String(val)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Galerie complète (si pas de sous-types connus) */}
              {subtypeBlocks.length === 0 && sliderImgs.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2">Photos ({sliderImgs.length})</p>
                  <div className="grid grid-cols-3 gap-2">
                    {sliderImgs.map((url, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100 cursor-pointer group" onClick={() => openDoc(url)}>
                        <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications de l'activité */}
              {act.certifications?.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2">Certifications</p>
                  <div className="space-y-2">
                    {act.certifications.map((cert, ci) => (
                      <div key={ci} className="flex items-center gap-3 bg-primary/5 border border-primary/10 rounded-xl px-4 py-2.5">
                        <span className="material-symbols-outlined text-primary shrink-0" style={{ fontSize: 16 }}>verified</span>
                        <span className="text-sm font-bold text-slate-700 flex-1 min-w-0">{cert.name}</span>
                        {cert.document_url && (
                          <button onClick={() => openDoc(cert.document_url!)}
                            className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20 shrink-0 inline-flex items-center gap-1">
                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>open_in_new</span> Voir
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    })()}

    {/* ══ ACTIVITY DETAIL / EDIT MODAL ═════════════════════════════════════ */}
    {actDetailOpen && viewActivity && (() => {
      const td = PROVIDER_ACTIVITY_TYPES.find((t) => t.value === viewActivity.category) ?? { label: viewActivity.category, icon: "category", gradient: "from-slate-400 to-slate-500" };
      const coverImg = actDetailMode === "edit"
        ? (actEditImages[actEditCoverIdx]?.src ?? null)
        : (viewActivity.photo ?? viewActivity.photos?.[0] ?? null);
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <button onClick={() => { setActDetailOpen(false); setActDetailMode("view"); }} className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"><X size={16} /></button>

            {/* Cover */}
            <div className="relative h-52 w-full overflow-hidden shrink-0">
              {coverImg ? <img src={coverImg} alt={viewActivity.title} className="w-full h-full object-cover" />
                : <><div className={`absolute inset-0 bg-gradient-to-br ${td.gradient} opacity-90`} /><span className="material-symbols-outlined text-white/25 absolute inset-0 flex items-center justify-center" style={{ fontSize: 110 }}>{td.icon}</span></>}
              <div className={`absolute top-3 left-3 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-xl shadow border ${viewActivity.level === "primary" ? "bg-primary text-white border-white/20" : "bg-white/95 text-slate-700 border-slate-100"}`}>
                {viewActivity.level === "primary" ? "Principale" : "Secondaire"}
              </div>
            </div>

            {actDetailMode === "view" ? (
              <>
                <div className="overflow-y-auto flex-1 px-8 py-6 space-y-5">
                  <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight pr-8">{viewActivity.title}</h2>
                  <div className="flex flex-wrap gap-2.5">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl px-3 py-1.5 text-[11px] font-extrabold tracking-wider flex items-center gap-1.5 uppercase">
                      <span className="material-symbols-outlined text-sm leading-none">{td.icon}</span>{td.label}
                    </span>
                  </div>
                  {viewActivity.description && <div><p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Description</p><p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{viewActivity.description}</p></div>}
                  {viewActivity.region && <div className="flex items-center gap-2 text-sm text-slate-600 font-semibold"><MapPin size={14} className="text-primary" />{viewActivity.region}</div>}
                  {viewActivity.phone && <div className="flex items-center gap-2 text-sm text-slate-600 font-semibold"><Phone size={14} className="text-amber-500" /><a href={`tel:${viewActivity.phone}`} className="hover:text-primary">{viewActivity.phone}</a></div>}
                  {viewActivity.website && <div className="flex items-center gap-2 text-sm font-semibold"><Globe size={14} className="text-teal-500" /><a href={viewActivity.website} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">{viewActivity.website}</a></div>}
                  <p className="text-[11px] font-bold text-slate-400">Créée le {new Date(viewActivity.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-3 shrink-0">
                  <button onClick={() => { setActDetailOpen(false); setActDetailMode("view"); }} className="px-5 py-2.5 border border-slate-200 text-slate-600 bg-white rounded-2xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer">Fermer</button>
                  <button onClick={() => setActDetailMode("edit")} className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-extrabold rounded-2xl text-xs shadow-sm transition-all active:scale-95 cursor-pointer"><Edit3 size={14} />Gérer</button>
                </div>
              </>
            ) : (
              <>
                <div className="px-8 pt-6 pb-4 border-b border-slate-100 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center"><Edit3 size={16} className="text-primary" /></div>
                    <div><h3 className="text-lg font-extrabold text-slate-800">Modifier l'activité</h3><p className="text-xs text-slate-400 line-clamp-1">{viewActivity.title}</p></div>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1">
                  <form onSubmit={handleSaveActivity} className="px-8 py-6 space-y-4">
                    <div>
                      <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Titre *</label>
                      <input type="text" value={actEditForm.title} onChange={(e) => setActEditForm((f) => ({ ...f, title: e.target.value }))}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 ${actEditError && !actEditForm.title ? "bg-red-50 border border-red-300 focus:ring-red-200" : "bg-slate-50 border border-slate-200 focus:ring-primary focus:bg-white"}`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Type d'activité</label>
                      <div className="grid grid-cols-3 gap-2">
                        {PROVIDER_ACTIVITY_TYPES.map((t) => {
                          const active = actEditForm.category === t.value;
                          return (
                            <button key={t.value} type="button" onClick={() => setActEditForm((f) => ({ ...f, category: active ? "" : t.value }))}
                              className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl border-2 text-center transition-all cursor-pointer ${active ? "bg-primary/10 border-primary text-slate-900 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-500 hover:border-primary/40 hover:bg-white"}`}>
                              <span className={`material-symbols-outlined text-lg ${active ? "text-primary" : "text-slate-400"}`}>{t.icon}</span>
                              <span className="text-[9px] font-extrabold leading-tight">{t.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {([["primary", "Principale"], ["secondary", "Secondaire"]] as const).map(([val, lbl]) => (
                        <button key={val} type="button" onClick={() => setActEditForm((f) => ({ ...f, level: val }))}
                          className={`py-2.5 px-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${actEditForm.level === val ? "bg-primary/10 border-primary" : "bg-slate-50 border-slate-200 hover:border-primary/40"}`}>
                          <p className={`text-xs font-extrabold ${actEditForm.level === val ? "text-primary" : "text-slate-700"}`}>{lbl}</p>
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Description</label>
                      <textarea rows={3} value={actEditForm.description} onChange={(e) => setActEditForm((f) => ({ ...f, description: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Région</label>
                        <input type="text" value={actEditForm.region} onChange={(e) => setActEditForm((f) => ({ ...f, region: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Téléphone</label>
                        <input type="tel" value={actEditForm.phone} onChange={(e) => setActEditForm((f) => ({ ...f, phone: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Photos</label>
                      {actEditImages.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {actEditImages.map((img, i) => (
                            <div key={i} onClick={() => setActEditCoverIdx(i)} className={`relative group aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${i === actEditCoverIdx ? "border-primary shadow-md" : "border-transparent hover:border-slate-300"}`}>
                              <img src={img.src} alt="" className="w-full h-full object-cover" />
                              {i === actEditCoverIdx && <div className="absolute top-1 left-1 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">Cover</div>}
                              <button type="button" onClick={(e) => { e.stopPropagation(); setActEditImages((prev) => prev.filter((_, idx) => idx !== i)); setActEditCoverIdx((c) => c >= i && c > 0 ? c - 1 : c); }} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                      <label htmlFor="act-edit-images" className="flex flex-col items-center justify-center gap-1.5 w-full h-16 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all bg-slate-50/70">
                        <span className="material-symbols-outlined text-slate-300 text-xl">add_photo_alternate</span>
                        <p className="text-xs font-semibold text-slate-400">Ajouter des photos</p>
                        <input id="act-edit-images" type="file" accept="image/*" multiple className="hidden" onChange={(e) => { const files = Array.from(e.target.files ?? []); if (!files.length) return; setActEditImages((prev) => [...prev, ...files.map((f) => ({ src: URL.createObjectURL(f), file: f }))]); e.target.value = ""; }} />
                      </label>
                    </div>
                    {actEditError && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl"><span className="material-symbols-outlined text-red-500 text-base">error</span><p className="text-sm font-semibold text-red-600">{actEditError}</p></div>}
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setActDetailMode("view")} className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 text-slate-600 bg-white rounded-2xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"><ChevronLeft size={14} />Retour</button>
                        <button type="button" onClick={handleDeleteActivity} disabled={actDeleting} className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-red-500 hover:bg-red-50 font-bold text-xs transition-colors disabled:opacity-50"><span className="material-symbols-outlined text-base">delete</span>{actDeleting ? "Suppression…" : "Supprimer"}</button>
                      </div>
                      <button type="submit" disabled={actEditSaving} className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-extrabold rounded-2xl text-xs shadow-sm transition-all active:scale-95 disabled:opacity-60 cursor-pointer">
                        {actEditSaving ? <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Sauvegarde…</> : <><Send size={14} />Enregistrer</>}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      );
    })()}

    {/* ══ ACTIVITY SUSTAINABILITY QUESTIONNAIRE ════════════════════════════ */}
    {aqOpen && (() => {
      const aqScore = Object.values(aqAnswers).reduce((s, v) => s + v, 0);
      const aqCurrentStep = ACTIVITY_SUSTAINABILITY_STEPS[aqStep];
      const aqStepAnswered = aqCurrentStep ? aqCurrentStep.questions.every((q) => q.id in aqAnswers) : false;
      return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-7 pt-7 pb-5 border-b border-slate-100 shrink-0">
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">Évaluation de durabilité — Activité</p>
              <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                {aqStep < ACTIVITY_SUSTAINABILITY_STEPS.length ? <>{ACTIVITY_SUSTAINABILITY_STEPS[aqStep].emoji} {ACTIVITY_SUSTAINABILITY_STEPS[aqStep].category}</> : "🎯 Résultat"}
              </h2>
              {aqStep < ACTIVITY_SUSTAINABILITY_STEPS.length && <p className="text-sm text-slate-500 mt-1">{ACTIVITY_SUSTAINABILITY_STEPS[aqStep].description}</p>}
              <div className="flex gap-1.5 mt-4">
                {ACTIVITY_SUSTAINABILITY_STEPS.map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < aqStep ? "bg-primary" : i === aqStep ? "bg-primary/60" : "bg-slate-100"}`} />
                ))}
              </div>
              <p className="text-[10px] font-bold text-slate-400 mt-1.5">{aqStep < ACTIVITY_SUSTAINABILITY_STEPS.length ? `Étape ${aqStep + 1} / ${ACTIVITY_SUSTAINABILITY_STEPS.length}` : "Toutes les étapes complétées"}</p>
            </div>
            <div className="overflow-y-auto flex-1 px-7 py-5">
              {aqStep < ACTIVITY_SUSTAINABILITY_STEPS.length ? (
                <div className="space-y-5">
                  {ACTIVITY_SUSTAINABILITY_STEPS[aqStep].questions.map((q) => (
                    <div key={q.id}>
                      <p className="text-sm font-bold text-slate-700 mb-2">{q.text}</p>
                      <div className="space-y-2">
                        {q.options.map((opt) => (
                          <button key={opt.label} onClick={() => setAqAnswers((a) => ({ ...a, [q.id]: opt.value }))}
                            className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${aqAnswers[q.id] === opt.value ? "border-primary bg-primary/10 text-primary" : "border-slate-200 text-slate-600 hover:border-primary/40"}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3 pt-2">
                    {aqStep > 0 && <button onClick={() => setAqStep((s) => s - 1)} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"><ChevronLeft size={16} />Précédent</button>}
                    <button onClick={() => { if (aqStep === ACTIVITY_SUSTAINABILITY_STEPS.length - 1) { setAqStep((s) => s + 1); submitActivityQuestionnaire(); } else { setAqStep((s) => s + 1); } }} disabled={!aqStepAnswered}
                      className={`flex-1 py-3 font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all ${aqStepAnswered ? "bg-primary text-slate-900 hover:bg-primary/90" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
                      {aqStep === ACTIVITY_SUSTAINABILITY_STEPS.length - 1 ? "Voir mon score" : "Suivant"}<ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  {(() => {
                    const level = getActivitySustainabilityLevel(aqScore);
                    return (
                      <>
                        <div className="relative w-32 h-32 mx-auto mb-5">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                            <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 50}`} strokeDashoffset={`${2 * Math.PI * 50 * (1 - aqScore / 100)}`} className="text-primary transition-all duration-1000" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-black text-slate-900">{aqScore}</span><span className="text-xs font-bold text-slate-400">/100</span></div>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${level.bg} mb-3`}>
                          <span className="text-base">{level.emoji}</span>
                          <span className={`font-extrabold text-sm ${level.color}`}>{level.label}</span>
                        </div>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">{aqScore >= 71 ? "Excellente activité éco-responsable !" : aqScore >= 51 ? "Votre activité est sur la bonne voie !" : "Identifiez les axes d'amélioration."}</p>
                        <button onClick={() => setAqOpen(false)} disabled={aqSaving} className="w-full py-3 bg-primary text-slate-900 font-extrabold rounded-xl hover:bg-primary/90 transition-colors">{aqSaving ? "Enregistrement…" : "Fermer"}</button>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    })()}

    {netReport && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0"><Flag size={16} className="text-red-500" /></div>
            <div><p className="font-extrabold text-slate-800 text-sm">Signaler {netReport.name}</p><p className="text-xs text-slate-400">Choisissez un motif</p></div>
          </div>
          <div className="space-y-2 mb-5">
            {NET_REPORT_REASONS.map((r) => (
              <button key={r} onClick={() => setNetReportReason(r)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${netReportReason === r ? "bg-red-50 border-red-300 text-red-700" : "border-slate-100 text-slate-600 hover:bg-slate-50"}`}>
                {r}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setNetReport(null); setNetReportReason(""); }} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Annuler</button>
            <button onClick={handleNetReport} disabled={!netReportReason || netReportSending} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-50">{netReportSending ? "Envoi…" : "Signaler"}</button>
          </div>
        </div>
      </div>
    )}
    <div className="min-h-screen bg-slate-50/70 pb-20" onClick={() => setNetMenuId(null)}>

      {/* ══ TOP NAV ══════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard/provider")}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all"
          >
            <ArrowLeft size={16} />
            Retour
          </button>
          <div className="flex items-center gap-2 text-slate-900">
            <Leaf className="text-primary w-6 h-6" />
            <span className="text-base font-extrabold tracking-tight">Éco-Voyage</span>
          </div>
        </div>
      </div>

      {/* ══ EDIT PROFILE MODAL ═══════════════════════════════════════════════ */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
            <button onClick={closeEditProfile}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
              <X size={16} />
            </button>

            <div className="px-8 pt-8 pb-5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Edit3 size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Modifier le profil</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Mettez à jour vos informations personnelles</p>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              <form id="edit-profile-form" onSubmit={handleSaveProfile} className="px-8 py-6 space-y-5">

                {/* Cover photo */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Photo de couverture</label>
                  <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-100 via-teal-50 to-slate-100 border-2 border-dashed border-slate-200 group">
                    {editProfileCover ? (
                      <img src={editProfileCover.preview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-slate-300 text-3xl">add_photo_alternate</span>
                        <p className="text-xs font-semibold text-slate-400">Ajouter une photo de couverture</p>
                      </div>
                    )}
                    <label htmlFor="cover-upload"
                      className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all cursor-pointer">
                      <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 text-3xl transition-opacity">edit</span>
                    </label>
                    <input id="cover-upload" type="file" accept="image/*" className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (editProfileCover?.file) URL.revokeObjectURL(editProfileCover.preview);
                        setEditProfileCover({ file, preview: URL.createObjectURL(file) });
                        e.target.value = "";
                      }}
                    />
                    {editProfileCover && (
                      <button type="button"
                        onClick={() => { if (editProfileCover.file) URL.revokeObjectURL(editProfileCover.preview); setEditProfileCover(null); }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors z-10">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Profile photo */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Photo de profil</label>
                  <div className="flex items-center gap-4">
                    <div className="relative group shrink-0">
                      <div className="w-20 h-20 rounded-full border-2 border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center">
                        {editProfilePhoto
                          ? <img src={editProfilePhoto.preview} alt="" className="w-full h-full object-cover" />
                          : <span className="material-symbols-outlined text-slate-300 text-4xl">person</span>
                        }
                      </div>
                      <label htmlFor="photo-upload"
                        className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all cursor-pointer">
                        <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 text-xl transition-opacity">edit</span>
                      </label>
                      <input id="photo-upload" type="file" accept="image/*" className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (editProfilePhoto?.file) URL.revokeObjectURL(editProfilePhoto.preview);
                          setEditProfilePhoto({ file, preview: URL.createObjectURL(file) });
                          e.target.value = "";
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="photo-upload" className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors">
                        <span className="material-symbols-outlined text-base">upload</span>Changer la photo
                      </label>
                      {editProfilePhoto && (
                        <button type="button"
                          onClick={() => { if (editProfilePhoto.file) URL.revokeObjectURL(editProfilePhoto.preview); setEditProfilePhoto(null); }}
                          className="block text-xs font-semibold text-red-400 hover:text-red-600 transition-colors">
                          Supprimer la photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Full name */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Nom complet *</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
                    <input type="text" placeholder="Ahmed Ben Ali"
                      value={editProfileForm.full_name}
                      onChange={(e) => setEditProfileForm((f) => ({ ...f, full_name: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Présentation <span className="normal-case font-medium text-slate-300">(optionnel)</span></label>
                  <textarea rows={3} placeholder="Prestataire spécialisé dans l'écotourisme en Tunisie…"
                    value={editProfileForm.bio}
                    onChange={(e) => setEditProfileForm((f) => ({ ...f, bio: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white resize-none placeholder:text-slate-400"
                  />
                </div>

                {/* Country + Language */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Pays</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">public</span>
                      <select value={editProfileForm.country}
                        onChange={(e) => setEditProfileForm((f) => ({ ...f, country: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white appearance-none">
                        <option value="">Sélectionner</option>
                        <option value="TN">Tunisie</option>
                        <option value="MA">Maroc</option>
                        <option value="DZ">Algérie</option>
                        <option value="FR">France</option>
                        <option value="OTHER">Autre</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Langue</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">translate</span>
                      <select value={editProfileForm.language}
                        onChange={(e) => setEditProfileForm((f) => ({ ...f, language: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white appearance-none">
                        <option value="">Sélectionner</option>
                        <option value="fr">Français</option>
                        <option value="ar">Arabe</option>
                        <option value="en">Anglais</option>
                        <option value="es">Espagnol</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Organisation */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Entreprise / Structure <span className="normal-case font-medium text-slate-300">(optionnel)</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">business</span>
                    <input type="text" placeholder="Éco-Voyage, Éco-Lodge Djerba…"
                      value={editProfileForm.organization}
                      onChange={(e) => setEditProfileForm((f) => ({ ...f, organization: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                    />
                  </div>
                </div>

                {/* Position */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Poste <span className="normal-case font-medium text-slate-300">(optionnel)</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">work</span>
                    <input type="text" placeholder="Directeur(trice), Gérant(e), Responsable…"
                      value={editProfileForm.position}
                      onChange={(e) => setEditProfileForm((f) => ({ ...f, position: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Téléphone <span className="normal-case font-medium text-slate-300">(optionnel)</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">phone</span>
                    <input type="tel" placeholder="+216 12 345 678"
                      value={editProfileForm.phone}
                      onChange={(e) => setEditProfileForm((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                    />
                  </div>
                </div>

                {/* Provider type */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Type de prestataire <span className="normal-case font-medium text-slate-300">(optionnel)</span></label>
                  <div className="grid grid-cols-3 gap-2">
                    {PROVIDER_TYPES.map((t) => {
                      const active = editProfileForm.provider_type === t.value;
                      return (
                        <button key={t.value} type="button"
                          onClick={() => setEditProfileForm((f) => ({ ...f, provider_type: active ? "" : t.value }))}
                          className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border-2 text-center transition-all cursor-pointer ${active ? "bg-primary/10 border-primary text-slate-900 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-500 hover:border-primary/40 hover:bg-white"}`}>
                          <span className={`material-symbols-outlined text-xl ${active ? "text-primary" : "text-slate-400"}`}>{t.icon}</span>
                          <span className="text-[10px] font-extrabold leading-tight">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Region + Website */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Région <span className="normal-case font-medium text-slate-300">(optionnel)</span></label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">location_on</span>
                      <input type="text" placeholder="Tunis, Sfax, Djerba…"
                        value={editProfileForm.region}
                        onChange={(e) => setEditProfileForm((f) => ({ ...f, region: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Années d'exp. <span className="normal-case font-medium text-slate-300">(optionnel)</span></label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">workspace_premium</span>
                      <input type="number" min="0" max="50" placeholder="Ex : 5"
                        value={editProfileForm.years_experience}
                        onChange={(e) => setEditProfileForm((f) => ({ ...f, years_experience: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Site web <span className="normal-case font-medium text-slate-300">(optionnel)</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">public</span>
                    <input type="url" placeholder="https://mon-ecolodge.tn"
                      value={editProfileForm.website}
                      onChange={(e) => setEditProfileForm((f) => ({ ...f, website: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                    />
                  </div>
                </div>

                {/* Primary activities */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Activités principales <span className="normal-case font-medium text-slate-300">(optionnel)</span></label>
                  <div className="grid grid-cols-3 gap-2">
                    {PROVIDER_ACTIVITY_TYPES.map((t) => {
                      const active = editProfileActivities.includes(t.value);
                      return (
                        <button key={t.value} type="button"
                          onClick={() => setEditProfileActivities((prev) =>
                            active ? prev.filter((v) => v !== t.value) : [...prev, t.value]
                          )}
                          className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border-2 text-center transition-all cursor-pointer ${active ? "bg-primary/10 border-primary text-slate-900 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-500 hover:border-primary/40 hover:bg-white"}`}>
                          <span className={`material-symbols-outlined text-xl ${active ? "text-primary" : "text-slate-400"}`}>{t.icon}</span>
                          <span className="text-[10px] font-extrabold leading-tight">{t.label}</span>
                          {active && <span className="text-[9px] text-primary font-black">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Secondary activities */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Activités secondaires <span className="normal-case font-medium text-slate-300">(optionnel)</span></label>
                  <div className="grid grid-cols-3 gap-2">
                    {PROVIDER_ACTIVITY_TYPES.map((t) => {
                      const active = editProfileSecActivities.includes(t.value);
                      return (
                        <button key={t.value} type="button"
                          onClick={() => setEditProfileSecActivities((prev) =>
                            active ? prev.filter((v) => v !== t.value) : [...prev, t.value]
                          )}
                          className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border-2 text-center transition-all cursor-pointer ${active ? "bg-slate-700/10 border-slate-500 text-slate-800 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-400 hover:bg-white"}`}>
                          <span className={`material-symbols-outlined text-xl ${active ? "text-slate-600" : "text-slate-400"}`}>{t.icon}</span>
                          <span className="text-[10px] font-extrabold leading-tight">{t.label}</span>
                          {active && <span className="text-[9px] text-slate-600 font-black">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {editProfileError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                    <span className="material-symbols-outlined text-red-500 text-base">error</span>
                    <p className="text-sm font-semibold text-red-600">{editProfileError}</p>
                  </div>
                )}
              </form>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-3 shrink-0">
              <button type="button" onClick={closeEditProfile}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 bg-white rounded-2xl text-xs font-bold hover:bg-slate-50 transition-colors">
                Annuler
              </button>
              <button type="submit" form="edit-profile-form" disabled={editProfileSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-extrabold rounded-2xl text-xs shadow-sm hover:shadow transition-all active:scale-95 disabled:opacity-60">
                {editProfileSaving
                  ? <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Enregistrement…</>
                  : <><Check size={14} />Enregistrer</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ PUBLISH OFFER MODAL ══════════════════════════════════════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <button onClick={closeModal}
              className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors">
              <X size={16} />
            </button>
            <div className="px-8 pt-8 pb-5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Sparkles size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Publier une offre éco</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Proposez une expérience éco-touristique à la communauté</p>
                </div>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              <form id="publish-offer-form" onSubmit={handlePublish} className="px-8 py-6 space-y-5">

                {/* ── SECTION : ACTIVITÉ ─────────────────────────────────── */}
                {orgActivities.length > 0 && (
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Lier à une activité</label>
                    <div className="grid grid-cols-2 gap-2">
                      {orgActivities.map((act) => {
                        const selected = offerActivity?.id === act.id;
                        const meta = findProviderTypeMeta(act.category);
                        return (
                          <button key={act.id} type="button"
                            onClick={() => {
                              const resetUnits = () => {
                                setEntityImages((prev) => { Object.values(prev).flat().forEach((img) => URL.revokeObjectURL(img.preview)); return {}; });
                                setEntityCoverIdx({});
                                setOfferNbUnites(1); setUnitDetailsArray([{}]); setActiveUnitTab(0);
                                setSubtypeNbUnites({}); setSubtypeUnitDetails({}); setActiveSubtypeTab({});
                              };
                              if (selected) {
                                setOfferActivity(null); setOfferSubtypes([]); setOfferMode("single"); setConstraintError("");
                                resetUnits();
                              } else {
                                setOfferActivity(act); setOfferSubtypes([]); setOfferMode("single"); setConstraintError("");
                                resetUnits();
                              }
                            }}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all text-xs font-bold ${selected ? "border-primary bg-primary/10 text-slate-900" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-primary/30 hover:bg-white"}`}>
                            <span className={`material-symbols-outlined text-base ${selected ? "text-primary" : "text-slate-400"}`}>{meta.categoryIcon}</span>
                            <span className="truncate">{meta.label}</span>
                            {selected && <Check size={12} className="ml-auto text-primary shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── SECTION : SOUS-TYPES ───────────────────────────────── */}
                {offerActivity && offerActivity.subtypes && offerActivity.subtypes.length > 0 && (
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Sous-type d'offre</label>
                    <div className="flex flex-wrap gap-2">
                      {offerActivity.subtypes.map((st) => {
                        const active = offerSubtypes.includes(st);
                        return (
                          <button key={st} type="button"
                            onClick={() => {
                              if (active) {
                                // Désélection — nettoyer les photos de ce sous-type
                                setEntityImages((prev) => {
                                  const imgs = prev[st] ?? [];
                                  imgs.forEach((img) => URL.revokeObjectURL(img.preview));
                                  const next = { ...prev };
                                  delete next[st];
                                  return next;
                                });
                                setEntityCoverIdx((prev) => { const next = { ...prev }; delete next[st]; return next; });
                              }
                              setOfferSubtypes((prev) => {
                                const next = active ? prev.filter((s) => s !== st) : [...prev, st];
                                if (next.length > 1) setOfferMode("variant");
                                else setOfferMode("single");
                                return next;
                              });
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${active ? "bg-primary text-white border-primary" : "bg-slate-100 border-slate-200 text-slate-600 hover:border-primary/40"}`}>
                            {st}
                          </button>
                        );
                      })}
                    </div>
                    {offerSubtypes.length > 1 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {[
                          { value: "variant", label: "Variante", desc: "Le voyageur choisit son sous-type" },
                          { value: "package", label: "Package",  desc: "Tous les sous-types inclus" },
                        ].map((m) => (
                          <button key={m.value} type="button" onClick={() => setOfferMode(m.value as "variant" | "package")}
                            className={`flex flex-col items-start px-3 py-2.5 rounded-xl border-2 text-xs transition-all ${offerMode === m.value ? "border-primary bg-primary/10 text-slate-900" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-primary/30"}`}>
                            <span className="font-extrabold">{m.label}</span>
                            <span className="text-[10px] font-medium text-slate-400 mt-0.5">{m.desc}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Nb d'unités : maintenant intégré dans chaque carte de sous-type */}

                {/* ── BLOC 1 : INFORMATIONS DE BASE ──────────────────── */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Titre de l'offre *</label>
                  <input type="text" placeholder="Ex : Séjour éco en forêt de Mogods"
                    value={form.title}
                    onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); setTitleError(""); }}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 transition-all placeholder:font-normal ${titleError ? "bg-red-50 border border-red-300 focus:ring-red-200" : "bg-slate-50 border border-slate-200 focus:ring-primary focus:bg-white"}`}
                  />
                  {titleError && <p className="text-xs font-semibold text-red-500 mt-1">{titleError}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">
                    Description courte * <span className="normal-case font-medium text-slate-300">({offerDescCourte.length}/160)</span>
                  </label>
                  <textarea rows={2} placeholder="Accroche courte visible dans les résultats de recherche…"
                    value={offerDescCourte} maxLength={160}
                    onChange={(e) => setOfferDescCourte(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white resize-none placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Description détaillée</label>
                  <textarea rows={4} placeholder="Décrivez le concept écologique, les activités durables et l'expérience proposée…"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white resize-none placeholder:text-slate-400"
                  />
                </div>
                {offerActivity && (() => {
                  const flat = Object.values(offerActivity.fields ?? {}).reduce<Record<string, any>>((a, s) => ({ ...a, ...s }), {});
                  const langs: string[] = flat.langues_guides ?? flat.langues ?? flat.langues_accueil ?? [];
                  if (!langs.length) return null;
                  return (
                    <div>
                      <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Langue de l'offre *</label>
                      <select value={offerLangue} onChange={(e) => setOfferLangue(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white">
                        <option value="">— Sélectionner —</option>
                        {langs.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  );
                })()}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Région / Emplacement</label>
                  <input type="text" placeholder="Tunis, Djerba, Sfax…"
                    value={form.region}
                    onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Localisation</label>
                    <button type="button" onClick={() => setShowPublishMap((v) => !v)}
                      className="flex items-center gap-1 text-[10px] font-extrabold text-primary hover:text-primary/80 transition-colors">
                      <MapPin size={12} />
                      {showPublishMap ? "Masquer la carte" : "Choisir sur la carte"}
                    </button>
                  </div>
                  <input type="text" placeholder="Ex : Place de la Kasbah, Tunis"
                    value={form.meeting_point}
                    onChange={(e) => setForm((f) => ({ ...f, meeting_point: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white placeholder:text-slate-400 mb-2"
                  />
                  {showPublishMap && (
                    <MapPicker
                      lat={publishMapLat} lng={publishMapLng}
                      onPick={(lat, lng, address) => {
                        setPublishMapLat(lat); setPublishMapLng(lng);
                        setForm((f) => ({ ...f, meeting_point: address }));
                      }}
                    />
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Inclusions</label>
                  <textarea rows={3} placeholder={"Ex :\n• Transport inclus\n• Repas traditionnels\n• Guide bilingue"}
                    value={form.inclusions}
                    onChange={(e) => setForm((f) => ({ ...f, inclusions: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white resize-none placeholder:text-slate-400"
                  />
                </div>
                {/* Max. pers. + Âge min. — masqués pour hébergement (capacité par unité dans l'onglet) */}
                {offerActivity?.category !== 'hebergement' && <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Max. pers.</label>
                    <input type="number" min="1" placeholder="20"
                      value={form.max_group_size}
                      onChange={(e) => {
                        const v = e.target.value;
                        setForm((f) => ({ ...f, max_group_size: v }));
                        if (offerActivity && v) {
                          const flat = Object.values(offerActivity.fields ?? {}).reduce<Record<string, any>>((acc, sec) => ({ ...acc, ...sec }), {});
                          const maxCap = getCapacityLimit(flat);
                          if (maxCap !== null && Number(v) > maxCap) {
                            setConstraintError(`Capacité dépassée — votre activité déclare max ${maxCap} pers. Modifiez votre profil si cela a changé.`);
                          } else {
                            setConstraintError("");
                          }
                        } else {
                          setConstraintError("");
                        }
                      }}
                      className={`w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:bg-white font-mono ${constraintError ? "bg-red-50 border border-red-300 focus:ring-red-200" : "bg-slate-50 border border-slate-200 focus:ring-primary"}`}
                    />
                    {constraintError && <p className="text-xs font-semibold text-red-500 mt-1">{constraintError}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Âge min. <span className="normal-case font-medium text-slate-300">(facultatif)</span></label>
                    <input type="number" min="0" placeholder="12"
                      value={form.min_age}
                      onChange={(e) => setForm((f) => ({ ...f, min_age: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-mono"
                    />
                  </div>
                </div>}
                {/* Photos générales — uniquement si provider sans activités ET aucun sous-type */}
                {offerSubtypes.length === 0 && orgActivities.length === 0 && <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Photos de l'offre</label>
                  <label htmlFor="publish-images-input"
                    className="flex flex-col items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all bg-slate-50/70">
                    <span className="material-symbols-outlined text-slate-300 text-3xl">add_photo_alternate</span>
                    <p className="text-xs font-semibold text-slate-400">Cliquez pour ajouter des photos</p>
                    <input id="publish-images-input" type="file" accept="image/*" multiple className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        const newImgs = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
                        setPublishImages((prev) => [...prev, ...newImgs]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {publishImages.length > 0 && (
                    <>
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {publishImages.map((img, i) => {
                          const isCover = i === publishCoverIdx;
                          return (
                            <div key={i} onClick={() => setPublishCoverIdx(i)}
                              className={`relative group aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${isCover ? "border-primary shadow-md" : "border-transparent hover:border-slate-300"}`}>
                              <img src={img.preview} alt="" className="w-full h-full object-cover" />
                              {isCover && (
                                <div className="absolute top-1 left-1 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-md leading-none">Cover</div>
                              )}
                              <button type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  URL.revokeObjectURL(img.preview);
                                  setPublishImages((prev) => prev.filter((_, idx) => idx !== i));
                                  setPublishCoverIdx((c) => (c >= i && c > 0 ? c - 1 : c));
                                }}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <X size={10} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mt-2">Cliquez sur une photo pour la définir comme image principale (cover).</p>
                    </>
                  )}
                </div>}
                {/* Type d'offre — uniquement si le provider n'a aucune activité (fallback) */}
                {orgActivities.length === 0 && (
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Type d'offre</label>
                    <div className="grid grid-cols-3 gap-2">
                      {OFFER_TYPES.map((t) => {
                        const active = form.offer_type === t.value;
                        return (
                          <button key={t.value} type="button"
                            onClick={() => setForm((f) => ({ ...f, offer_type: active ? "" : t.value }))}
                            className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border-2 text-center transition-all cursor-pointer ${active ? "bg-primary/10 border-primary text-slate-900 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-500 hover:border-primary/40 hover:bg-white"}`}>
                            <span className={`material-symbols-outlined text-xl ${active ? "text-primary" : "text-slate-400"}`}>{t.icon}</span>
                            <span className="text-[10px] font-extrabold">{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Tarif/Durée génériques — masqués pour hébergement (prix par unité + nuits_min dans les détails) */}
                {offerActivity?.category !== 'hebergement' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Tarif (TND)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] font-bold">DT</span>
                        <input type="number" min="0" step="1" placeholder="Ex : 350"
                          value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-mono placeholder:text-slate-400 placeholder:font-sans"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Durée (jours)</label>
                      <div className="relative">
                        <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="number" min="1" step="1" placeholder="Ex : 3"
                          value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-mono placeholder:text-slate-400 placeholder:font-sans"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {/* ── SECTION : DÉTAILS SPÉCIFIQUES PAR SOUS-TYPE ─────── */}
                {offerSubtypes.length > 0 && (() => {
                  const isMultiUnit = offerNbUnites > 1 && offerActivity?.category === 'hebergement';

                  // ── Résout les options dynamiques depuis les champs d'onboarding ──
                  const flatOnboarding = Object.values(offerActivity?.fields ?? {})
                    .reduce<Record<string, any>>((acc, sec) => ({ ...acc, ...sec }), {});

                  const resolveOptions = (field: { options?: string[]; dynamicOptions?: string }): string[] => {
                    if (!field.dynamicOptions || !offerActivity) return field.options ?? [];
                    const key = field.dynamicOptions.replace('onboarding.', '');
                    const val = flatOnboarding[key];
                    if (Array.isArray(val)) return val as string[];
                    if (typeof val === 'string') return [val];
                    return field.options ?? [];
                  };

                  // ── Vérifie une règle de cross-validation ──
                  const checkRule = (rule: CrossValidationRule, getData: (k: string) => any): string | null => {
                    const fieldVal = getData(rule.field);
                    if (fieldVal === undefined || fieldVal === null || fieldVal === '' || (Array.isArray(fieldVal) && fieldVal.length === 0)) return null;
                    const onbVal = flatOnboarding[rule.onboardingKey];
                    if (onbVal === undefined || onbVal === null) return null;
                    let hasError = false;
                    switch (rule.rule) {
                      case 'lte': hasError = Number(fieldVal) > Number(onbVal); break;
                      case 'gte': hasError = Number(fieldVal) < Number(onbVal); break;
                      case 'in': {
                        const opts = Array.isArray(onbVal) ? onbVal : [onbVal];
                        hasError = Boolean(fieldVal) && !opts.includes(fieldVal);
                        break;
                      }
                      case 'subset': {
                        const opts = Array.isArray(onbVal) ? onbVal : [onbVal];
                        hasError = Array.isArray(fieldVal) && fieldVal.some((v: string) => !opts.includes(v));
                        break;
                      }
                      case 'requiredIfFalse': hasError = !onbVal && fieldVal === true; break;
                      case 'requiredIfTrue':  hasError = Boolean(onbVal) && !fieldVal; break;
                    }
                    return hasError ? rule.message.replace('{value}', String(onbVal)) : null;
                  };

                  // ── Rendu des champs (data source abstrait) ──
                  const renderFields = (
                    st: string,
                    getData: (key: string) => any,
                    setData: (key: string, val: any) => void,
                  ) => {
                    const config = OFFER_DETAIL_FIELDS[st];
                    if (!config) return null;
                    return config.sections.map((section) => {
                      // Cas 2 — Section conditionnelle selon l'onboarding
                      if (section.conditionalOn?.onboardingKey) {
                        const onbVal = flatOnboarding[section.conditionalOn.onboardingKey];
                        if (onbVal !== section.conditionalOn.value) return null;
                      }

                      // Validations inline de la section (Cas 4)
                      const sectionErrors = (section.validations ?? [])
                        .map((rule) => checkRule(rule, getData))
                        .filter(Boolean) as string[];

                      return (
                        <div key={section.label} className="mb-4 last:mb-0">
                          <p className="text-xs font-bold text-slate-500 mb-2">{section.label}</p>

                          {/* Cas 4 — Alertes cross-validation */}
                          {sectionErrors.map((msg, i) => (
                            <div key={i} className="flex items-start gap-2 px-3 py-2 mb-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-700">
                              <span className="shrink-0 mt-0.5">⚠</span>{msg}
                            </div>
                          ))}

                          <div className="space-y-2.5">
                            {section.fields.map((field) => {
                              // Cas champ conditionnel (champ.conditionalOn.field)
                              if (field.conditionalOn?.field) {
                                const condVal = getData(field.conditionalOn.field);
                                if (field.conditionalOn.value !== undefined && condVal !== field.conditionalOn.value) return null;
                                if (field.conditionalOn.notValue !== undefined && condVal === field.conditionalOn.notValue) return null;
                              }

                              // Cas 1 — Résolution des options dynamiques
                              const opts = resolveOptions(field);

                              return (
                                <div key={field.key}>
                                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1 block">
                                    {field.label}{field.required && ' *'}
                                  </label>

                                  {field.type === "boolean" ? (
                                    <button type="button"
                                      onClick={() => setData(field.key, !getData(field.key))}
                                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${getData(field.key) ? "border-primary bg-primary/10 text-primary" : "border-slate-200 bg-white text-slate-500 hover:border-primary/30"}`}>
                                      <div className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center transition-all ${getData(field.key) ? "border-primary bg-primary" : "border-slate-300"}`}>
                                        {getData(field.key) && <Check size={9} className="text-white" />}
                                      </div>
                                      Oui
                                    </button>

                                  ) : field.type === "textarea" ? (
                                    <textarea rows={2} placeholder={field.placeholder}
                                      value={(getData(field.key) as string) ?? ""}
                                      onChange={(e) => setData(field.key, e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder:text-slate-400" />

                                  ) : field.type === "select" ? (
                                    <select value={(getData(field.key) as string) ?? ""}
                                      onChange={(e) => setData(field.key, e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                      <option value="">— Sélectionner —</option>
                                      {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                                    </select>

                                  ) : field.type === "multiselect" ? (
                                    opts.length > 0 ? (
                                      <div className="flex flex-wrap gap-1.5">
                                        {opts.map((o) => {
                                          const sel = ((getData(field.key) as string[]) ?? []).includes(o);
                                          return (
                                            <button key={o} type="button"
                                              onClick={() => {
                                                const cur = (getData(field.key) as string[]) ?? [];
                                                setData(field.key, sel ? cur.filter((x) => x !== o) : [...cur, o]);
                                              }}
                                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${sel ? "bg-primary text-white border-primary" : "bg-white border-slate-200 text-slate-600 hover:border-primary/40"}`}>
                                              {o}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <p className="text-[10px] text-slate-400 italic">Options disponibles après sélection d'une activité avec ce champ déclaré.</p>
                                    )

                                  ) : field.type === "time" ? (
                                    <input type="time" value={(getData(field.key) as string) ?? ""}
                                      onChange={(e) => setData(field.key, e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />

                                  ) : field.type === "file" ? (
                                    <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400 font-medium">
                                      <span className="material-symbols-outlined text-base text-slate-300">upload_file</span>
                                      <span>Upload disponible après publication — envoyez par message</span>
                                    </div>

                                  ) : field.type === "repeater" ? (
                                    // Cas 3 — Repeater (programme jour par jour, etc.)
                                    <div className="space-y-2">
                                      {((getData(field.key) as any[]) ?? []).map((row: any, idx: number) => (
                                        <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-extrabold text-primary/70 uppercase">
                                              {field.label} {idx + 1}
                                            </span>
                                            <button type="button"
                                              onClick={() => {
                                                const rows = [...((getData(field.key) as any[]) ?? [])];
                                                rows.splice(idx, 1);
                                                setData(field.key, rows);
                                              }}
                                              className="w-5 h-5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-colors">
                                              <X size={9} />
                                            </button>
                                          </div>
                                          {field.subfields?.map((sf) => (
                                            <div key={sf.key}>
                                              <label className="text-[9px] font-black tracking-widest text-slate-400 uppercase mb-0.5 block">{sf.label}</label>
                                              {sf.type === 'textarea' ? (
                                                <textarea rows={2} placeholder={sf.placeholder}
                                                  value={(row[sf.key] as string) ?? ""}
                                                  onChange={(e) => {
                                                    const rows = [...((getData(field.key) as any[]) ?? [])];
                                                    rows[idx] = { ...rows[idx], [sf.key]: e.target.value };
                                                    setData(field.key, rows);
                                                  }}
                                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                                              ) : (
                                                <input type="text" placeholder={sf.placeholder}
                                                  value={(row[sf.key] as string) ?? ""}
                                                  onChange={(e) => {
                                                    const rows = [...((getData(field.key) as any[]) ?? [])];
                                                    rows[idx] = { ...rows[idx], [sf.key]: e.target.value };
                                                    setData(field.key, rows);
                                                  }}
                                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ))}
                                      <button type="button"
                                        onClick={() => {
                                          const rows = [...((getData(field.key) as any[]) ?? [])];
                                          setData(field.key, [...rows, {}]);
                                        }}
                                        className="w-full py-2 rounded-xl border-2 border-dashed border-slate-200 text-[10px] font-extrabold text-slate-400 hover:border-primary/40 hover:text-primary transition-all">
                                        + Ajouter {field.label}
                                      </button>
                                    </div>

                                  ) : (
                                    <input type={field.type === "number" ? "number" : "text"} placeholder={field.placeholder}
                                      value={(getData(field.key) as string) ?? ""}
                                      onChange={(e) => setData(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-slate-400" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    });
                  };

                  // ── Upload photos par entité (sous-type ou unité) ──
                  const renderPhotoSection = (entityKey: string, label: string) => {
                    const imgs = entityImages[entityKey] ?? [];
                    const coverI = entityCoverIdx[entityKey] ?? 0;
                    const inputId = `entity-photos-${entityKey.replace(/[^a-z0-9]/gi, '-')}`;
                    return (
                      <div className="mb-4 pb-4 border-b border-slate-200 last:border-0">
                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">
                          📷 {label}
                        </label>
                        <label htmlFor={inputId}
                          className="flex flex-col items-center justify-center gap-1.5 w-full h-20 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all bg-slate-50/70">
                          <span className="material-symbols-outlined text-slate-300 text-2xl">add_photo_alternate</span>
                          <p className="text-[10px] font-semibold text-slate-400">Cliquez pour ajouter des photos</p>
                          <input id={inputId} type="file" accept="image/*" multiple className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files ?? []);
                              const newImgs = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
                              setEntityImages((prev) => ({ ...prev, [entityKey]: [...(prev[entityKey] ?? []), ...newImgs] }));
                              e.target.value = "";
                            }}
                          />
                        </label>
                        {imgs.length > 0 && (
                          <>
                            <div className="mt-2 grid grid-cols-4 gap-1.5">
                              {imgs.map((img, i) => {
                                const isCover = i === coverI;
                                return (
                                  <div key={i} onClick={() => setEntityCoverIdx((prev) => ({ ...prev, [entityKey]: i }))}
                                    className={`relative group aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${isCover ? "border-primary shadow-md" : "border-transparent hover:border-slate-300"}`}>
                                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                                    {isCover && <div className="absolute top-1 left-1 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-md leading-none">Cover</div>}
                                    <button type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        URL.revokeObjectURL(img.preview);
                                        setEntityImages((prev) => {
                                          const cur = prev[entityKey] ?? [];
                                          const next = cur.filter((_, idx) => idx !== i);
                                          return { ...prev, [entityKey]: next };
                                        });
                                        setEntityCoverIdx((prev) => {
                                          const cur = prev[entityKey] ?? 0;
                                          return { ...prev, [entityKey]: cur >= i && cur > 0 ? cur - 1 : cur };
                                        });
                                      }}
                                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <X size={10} />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                            <p className="text-[9px] text-slate-400 font-medium mt-1">Cliquez sur une photo pour la définir comme image principale.</p>
                          </>
                        )}
                      </div>
                    );
                  };

                  // ── Helpers pour nb_unites par sous-type ──
                  const getNbUnites = (st: string) => subtypeNbUnites[st] ?? 1;
                  const getUnitData = (st: string) => subtypeUnitDetails[st] ?? [{}];
                  const getActiveTab = (st: string) => activeSubtypeTab[st] ?? 0;

                  const setNbUnites = (st: string, n: number) =>
                    setSubtypeNbUnites((prev) => ({ ...prev, [st]: n }));
                  const setUnitData = (st: string, arr: Array<Record<string, any>>) =>
                    setSubtypeUnitDetails((prev) => ({ ...prev, [st]: arr }));
                  const setActiveTab = (st: string, i: number) =>
                    setActiveSubtypeTab((prev) => ({ ...prev, [st]: i }));

                  const isHebergement = offerActivity?.category === 'hebergement';

                  // ── Getter/setter config par sous-type (dispo + tarif) ──
                  const getStCfg = (st: string): Record<string, any> => subtypeFormConfig[st] ?? {};
                  const setStCfg = (st: string, field: string, val: any) =>
                    setSubtypeFormConfig((prev) => ({ ...prev, [st]: { ...(prev[st] ?? {}), [field]: val } }));

                  // ── Disponibilité par sous-type ──
                  const renderSubtypeAvailBloc = (st: string) => {
                    const cfg = getStCfg(st);
                    const mode = (cfg.availMode as string) ?? 'specific';
                    const weekdays: number[] = (cfg.availWeekdays as number[]) ?? [];
                    const specificDates: string[] = (cfg.specificDates as string[]) ?? [];
                    const saisons: string[] = (cfg.saisons as string[]) ?? [];
                    return (
                      <div className="mb-4 pb-4 border-b border-slate-200">
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Disponibilité</p>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {AVAILABILITY_TYPES.map((m) => (
                            <button key={m.value} type="button" onClick={() => setStCfg(st, 'availMode', m.value)}
                              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border-2 text-[10px] font-bold transition-all ${mode === m.value ? 'border-primary bg-primary/10 text-slate-900' : 'border-slate-200 bg-white text-slate-500 hover:border-primary/30'}`}>
                              <span className={`material-symbols-outlined text-sm ${mode === m.value ? 'text-primary' : 'text-slate-400'}`}>{m.icon}</span>
                              {m.label}
                            </button>
                          ))}
                        </div>
                        {mode === 'specific' && (
                          <div className="space-y-1.5">
                            <div className="flex gap-2">
                              <input type="date" value={(cfg.newSpecificDate as string) ?? ''} onChange={(e) => setStCfg(st, 'newSpecificDate', e.target.value)}
                                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                              <button type="button" onClick={() => {
                                const d = (cfg.newSpecificDate as string) ?? '';
                                if (d && !specificDates.includes(d)) { setStCfg(st, 'specificDates', [...specificDates, d].sort()); setStCfg(st, 'newSpecificDate', ''); }
                              }} className="px-3 py-2 bg-primary text-white rounded-xl text-xs font-extrabold hover:bg-primary/90">Ajouter</button>
                            </div>
                            {specificDates.length > 0 && <div className="flex flex-wrap gap-1">{specificDates.map((d) => <span key={d} className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold border border-primary/20">{d}<button type="button" onClick={() => setStCfg(st, 'specificDates', specificDates.filter((x) => x !== d))}><X size={8} /></button></span>)}</div>}
                          </div>
                        )}
                        {mode === 'weekly' && (
                          <div className="space-y-1.5">
                            <div className="flex gap-1">{['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map((day, i) => <button key={i} type="button" onClick={() => setStCfg(st, 'availWeekdays', weekdays.includes(i) ? weekdays.filter((d) => d !== i) : [...weekdays, i])} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black border-2 transition-all ${weekdays.includes(i) ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-500'}`}>{day}</button>)}</div>
                            <div className="grid grid-cols-2 gap-2">
                              <div><label className="text-[9px] font-black text-slate-400 uppercase mb-0.5 block">Début</label><input type="date" value={(cfg.availStart as string) ?? ''} onChange={(e) => setStCfg(st, 'availStart', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                              <div><label className="text-[9px] font-black text-slate-400 uppercase mb-0.5 block">Fin</label><input type="date" value={(cfg.availEnd as string) ?? ''} onChange={(e) => setStCfg(st, 'availEnd', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                            </div>
                          </div>
                        )}
                        {mode === 'period' && (
                          <div className="grid grid-cols-2 gap-2">
                            <div><label className="text-[9px] font-black text-slate-400 uppercase mb-0.5 block">Début *</label><input type="date" value={(cfg.availStart as string) ?? ''} onChange={(e) => setStCfg(st, 'availStart', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                            <div><label className="text-[9px] font-black text-slate-400 uppercase mb-0.5 block">Fin *</label><input type="date" value={(cfg.availEnd as string) ?? ''} onChange={(e) => setStCfg(st, 'availEnd', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                          </div>
                        )}
                        {mode === 'on_demand' && (
                          <div className="space-y-1.5">
                            <div className="flex gap-2">{['24h','48h','72h'].map((d) => <button key={d} type="button" onClick={() => setStCfg(st, 'delaiReponse', d)} className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border-2 transition-all ${(cfg.delaiReponse ?? '24h') === d ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 bg-white text-slate-500'}`}>{d}</button>)}</div>
                          </div>
                        )}
                        {mode === 'season' && (
                          <div className="flex gap-1.5">{SAISONS.map((s) => <button key={s} type="button" onClick={() => setStCfg(st, 'saisons', saisons.includes(s) ? saisons.filter((x) => x !== s) : [...saisons, s])} className={`flex-1 py-1.5 rounded-xl text-[9px] font-black border-2 transition-all ${saisons.includes(s) ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-500'}`}>{s}</button>)}</div>
                        )}
                        {mode !== 'on_demand' && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div><label className="text-[9px] font-black text-slate-400 uppercase mb-0.5 block">Heure début</label><input type="time" value={(cfg.heureDebut as string) ?? ''} onChange={(e) => setStCfg(st, 'heureDebut', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                            <div><label className="text-[9px] font-black text-slate-400 uppercase mb-0.5 block">Heure fin</label><input type="time" value={(cfg.heureFin as string) ?? ''} onChange={(e) => setStCfg(st, 'heureFin', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                          </div>
                        )}
                      </div>
                    );
                  };

                  // ── Tarification par sous-type (hébergement) ──
                  const renderSubtypePricingBloc = (st: string) => {
                    const cfg = getStCfg(st);
                    return (
                      <div className="mb-4 pb-4 border-b border-slate-200 space-y-2.5">
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Tarification</p>
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase mb-0.5 block">Prix groupe <span className="normal-case font-medium text-slate-300">(optionnel)</span></label>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">DT</span><input type="number" min="0" placeholder="1200" value={(cfg.prixGroupe as string) ?? ''} onChange={(e) => setStCfg(st, 'prixGroupe', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono" /></div>
                            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">pers.</span><input type="number" min="1" placeholder="10" value={(cfg.nbPersonnesGroupe as string) ?? ''} onChange={(e) => setStCfg(st, 'nbPersonnesGroupe', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono" /></div>
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase mb-0.5 block">Prix enfant <span className="normal-case font-medium text-slate-300">(optionnel)</span></label>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">DT</span><input type="number" min="0" placeholder="150" value={(cfg.prixEnfant as string) ?? ''} onChange={(e) => setStCfg(st, 'prixEnfant', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono" /></div>
                            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">≤ âge</span><input type="number" min="0" max="18" placeholder="12" value={(cfg.ageMaxEnfant as string) ?? ''} onChange={(e) => setStCfg(st, 'ageMaxEnfant', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono" /></div>
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase mb-0.5 block">Supplément privatisation <span className="normal-case font-medium text-slate-300">(optionnel)</span></label>
                          <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">DT</span><input type="number" min="0" placeholder="500" value={(cfg.suppPrivatisation as string) ?? ''} onChange={(e) => setStCfg(st, 'suppPrivatisation', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono" /></div>
                        </div>
                      </div>
                    );
                  };

                  // ── Contrôle nb_unites inline dans la carte ──
                  const renderNbUnitesControl = (st: string) => {
                    const nb = getNbUnites(st);
                    return (
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
                        <div>
                          <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Nb d'unités</p>
                          <p className="text-[9px] text-slate-400 font-medium mt-0.5">Chambres / suites / tentes disponibles à la vente</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button"
                            onClick={() => {
                              if (nb <= 1) return;
                              const removedKey = `${st}_unit_${nb - 1}`;
                              setEntityImages((prev) => {
                                const imgs = prev[removedKey] ?? [];
                                imgs.forEach((img) => URL.revokeObjectURL(img.preview));
                                const next = { ...prev }; delete next[removedKey]; return next;
                              });
                              setEntityCoverIdx((prev) => { const next = { ...prev }; delete next[removedKey]; return next; });
                              setUnitData(st, getUnitData(st).slice(0, -1));
                              if (getActiveTab(st) >= nb - 1) setActiveTab(st, nb - 2);
                              setNbUnites(st, nb - 1);
                            }}
                            className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-black flex items-center justify-center text-sm transition-colors">−</button>
                          <span className="text-base font-extrabold text-slate-800 w-6 text-center">{nb}</span>
                          <button type="button"
                            onClick={() => { setUnitData(st, [...getUnitData(st), {}]); setNbUnites(st, nb + 1); }}
                            className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-black flex items-center justify-center text-sm transition-colors">+</button>
                        </div>
                      </div>
                    );
                  };

                  // ── Onglets unités pour un sous-type ──
                  const renderUnitTabs = (st: string) => {
                    const nb = getNbUnites(st);
                    const unitArr = getUnitData(st);
                    const activeI = getActiveTab(st);
                    const config = OFFER_DETAIL_FIELDS[st];
                    const nameKey = config?.sections[0]?.fields.find((f) => f.key.startsWith('nom_'))?.key ?? '';

                    return (
                      <>
                        {/* Tabs */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {Array.from({ length: nb }, (_, i) => {
                            const unitName = (unitArr[i]?.[nameKey] as string) || null;
                            return (
                              <button key={i} type="button" onClick={() => setActiveTab(st, i)}
                                className={`px-3 py-1.5 rounded-full text-xs font-extrabold border-2 transition-all ${activeI === i ? 'bg-primary text-white border-primary' : 'bg-white border-slate-200 text-slate-500 hover:border-primary/30'}`}>
                                {unitName || `${st.replace(/_/g, ' ')} ${i + 1}`}
                              </button>
                            );
                          })}
                        </div>
                        {/* ── Disponibilité par unité ── */}
                        <div className="mb-3 pb-3 border-b border-slate-200">
                          <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Disponibilité de cette unité</p>
                          {(() => {
                            const uArr = getUnitData(st);
                            const uI = getActiveTab(st);
                            const getU = (f: string) => uArr[uI]?.[f];
                            const setU = (f: string, v: any) => { const a = [...uArr]; a[uI] = { ...(a[uI] ?? {}), [f]: v }; setUnitData(st, a); };
                            const uMode = (getU('availMode') as string) ?? 'specific';
                            const uWeekdays: number[] = (getU('availWeekdays') as number[]) ?? [];
                            const uDates: string[] = (getU('specificDates') as string[]) ?? [];
                            const uSaisons: string[] = (getU('saisons') as string[]) ?? [];
                            return (
                              <>
                                <div className="grid grid-cols-2 gap-1.5 mb-2">
                                  {AVAILABILITY_TYPES.map((m) => (
                                    <button key={m.value} type="button" onClick={() => setU('availMode', m.value)}
                                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border-2 text-[10px] font-bold transition-all ${uMode === m.value ? 'border-primary bg-primary/10 text-slate-900' : 'border-slate-200 bg-white text-slate-500 hover:border-primary/30'}`}>
                                      <span className={`material-symbols-outlined text-sm ${uMode === m.value ? 'text-primary' : 'text-slate-400'}`}>{m.icon}</span>{m.label}
                                    </button>
                                  ))}
                                </div>
                                {uMode === 'specific' && (
                                  <div className="space-y-1.5">
                                    <div className="flex gap-2">
                                      <input type="date" value={(getU('newSpecificDate') as string) ?? ''} onChange={(e) => setU('newSpecificDate', e.target.value)}
                                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                      <button type="button" onClick={() => {
                                        const d = (getU('newSpecificDate') as string) ?? '';
                                        if (d && !uDates.includes(d)) { setU('specificDates', [...uDates, d].sort()); setU('newSpecificDate', ''); }
                                      }} className="px-3 py-2 bg-primary text-white rounded-xl text-xs font-extrabold">Ajouter</button>
                                    </div>
                                    {uDates.length > 0 && <div className="flex flex-wrap gap-1">{uDates.map((d) => <span key={d} className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold border border-primary/20">{d}<button type="button" onClick={() => setU('specificDates', uDates.filter((x) => x !== d))}><X size={8} /></button></span>)}</div>}
                                  </div>
                                )}
                                {uMode === 'weekly' && (
                                  <div className="space-y-1.5">
                                    <div className="flex gap-1">{['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map((day, i) => <button key={i} type="button" onClick={() => setU('availWeekdays', uWeekdays.includes(i) ? uWeekdays.filter((d) => d !== i) : [...uWeekdays, i])} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black border-2 transition-all ${uWeekdays.includes(i) ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-500'}`}>{day}</button>)}</div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div><label className="text-[9px] font-black text-slate-400 uppercase mb-0.5 block">Début</label><input type="date" value={(getU('availStart') as string) ?? ''} onChange={(e) => setU('availStart', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                                      <div><label className="text-[9px] font-black text-slate-400 uppercase mb-0.5 block">Fin</label><input type="date" value={(getU('availEnd') as string) ?? ''} onChange={(e) => setU('availEnd', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                                    </div>
                                  </div>
                                )}
                                {uMode === 'period' && (
                                  <div className="grid grid-cols-2 gap-2">
                                    <div><label className="text-[9px] font-black text-slate-400 uppercase mb-0.5 block">Début *</label><input type="date" value={(getU('availStart') as string) ?? ''} onChange={(e) => setU('availStart', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                                    <div><label className="text-[9px] font-black text-slate-400 uppercase mb-0.5 block">Fin *</label><input type="date" value={(getU('availEnd') as string) ?? ''} onChange={(e) => setU('availEnd', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                                  </div>
                                )}
                                {uMode === 'on_demand' && (
                                  <div className="flex gap-2">{['24h','48h','72h'].map((d) => <button key={d} type="button" onClick={() => setU('delaiReponse', d)} className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border-2 transition-all ${(getU('delaiReponse') ?? '24h') === d ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 bg-white text-slate-500'}`}>{d}</button>)}</div>
                                )}
                                {uMode === 'season' && (
                                  <div className="flex gap-1.5">{SAISONS.map((s) => <button key={s} type="button" onClick={() => setU('saisons', uSaisons.includes(s) ? uSaisons.filter((x) => x !== s) : [...uSaisons, s])} className={`flex-1 py-1.5 rounded-xl text-[9px] font-black border-2 transition-all ${uSaisons.includes(s) ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-500'}`}>{s}</button>)}</div>
                                )}
                                {uMode !== 'on_demand' && (
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div><label className="text-[9px] font-black text-slate-400 uppercase mb-0.5 block">Heure début</label><input type="time" value={(getU('heureDebut') as string) ?? ''} onChange={(e) => setU('heureDebut', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                                    <div><label className="text-[9px] font-black text-slate-400 uppercase mb-0.5 block">Heure fin</label><input type="time" value={(getU('heureFin') as string) ?? ''} onChange={(e) => setU('heureFin', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>

                        {/* ── Champs par unité : prix, max pers, acompte ── */}
                        <div className="mb-3 pb-3 border-b border-slate-200 space-y-3">
                          {/* Prix / nuit */}
                          <div>
                            <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1 block">
                              Prix / nuit (TND)
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] font-bold">DT</span>
                              <input type="number" min="0" placeholder="Ex : 380"
                                value={(unitArr[activeI]?.prix_unite as string) ?? ""}
                                onChange={(e) => {
                                  const arr = [...unitArr]; arr[activeI] = { ...(arr[activeI] ?? {}), prix_unite: e.target.value }; setUnitData(st, arr);
                                }}
                                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono" />
                            </div>
                          </div>
                          {/* Max. pers. par unité */}
                          <div>
                            <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1 block">
                              Max. personnes pour cette unité
                            </label>
                            <input type="number" min="1" placeholder="Ex : 2"
                              value={(unitArr[activeI]?.max_pers_unite as string) ?? ""}
                              onChange={(e) => {
                                const arr = [...unitArr]; arr[activeI] = { ...(arr[activeI] ?? {}), max_pers_unite: e.target.value }; setUnitData(st, arr);
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono" />
                          </div>
                          {/* Acompte par unité */}
                          <div>
                            <button type="button"
                              onClick={() => {
                                const arr = [...unitArr];
                                arr[activeI] = { ...(arr[activeI] ?? {}), acompte_requis: !(arr[activeI]?.acompte_requis ?? false) };
                                setUnitData(st, arr);
                              }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${unitArr[activeI]?.acompte_requis ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 bg-white text-slate-500 hover:border-primary/30'}`}>
                              <div className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center transition-all ${unitArr[activeI]?.acompte_requis ? 'border-primary bg-primary' : 'border-slate-300'}`}>
                                {unitArr[activeI]?.acompte_requis && <Check size={9} className="text-white" />}
                              </div>
                              Acompte requis pour cette unité
                            </button>
                            {unitArr[activeI]?.acompte_requis && (
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <select
                                  value={(unitArr[activeI]?.type_acompte as string) ?? 'pourcentage'}
                                  onChange={(e) => { const arr = [...unitArr]; arr[activeI] = { ...(arr[activeI] ?? {}), type_acompte: e.target.value }; setUnitData(st, arr); }}
                                  className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                  <option value="pourcentage">% du prix</option>
                                  <option value="fixe">Montant fixe (DT)</option>
                                </select>
                                <div className="relative">
                                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">{(unitArr[activeI]?.type_acompte ?? 'pourcentage') === 'pourcentage' ? '%' : 'DT'}</span>
                                  <input type="number" min="1" placeholder="30"
                                    value={(unitArr[activeI]?.valeur_acompte as string) ?? ""}
                                    onChange={(e) => { const arr = [...unitArr]; arr[activeI] = { ...(arr[activeI] ?? {}), valeur_acompte: e.target.value }; setUnitData(st, arr); }}
                                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Photos + champs de l'unité active */}
                        {renderPhotoSection(`${st}_unit_${activeI}`, `Photos — ${(unitArr[activeI]?.[nameKey] as string) || `Unité ${activeI + 1}`}`)}
                        {renderFields(
                          st,
                          (key) => unitArr[activeI]?.[key],
                          (key, val) => { const arr = [...unitArr]; arr[activeI] = { ...(arr[activeI] ?? {}), [key]: val }; setUnitData(st, arr); },
                        )}
                      </>
                    );
                  };

                  return (
                    <div className="space-y-4">
                      <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block">Détails spécifiques</label>

                      {offerSubtypes.map((st) => (
                        <div key={st} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                          {/* Libellé sous-type en multi-sélection */}
                          {offerSubtypes.length > 1 && (
                            <p className="text-[10px] font-black tracking-widest text-primary/70 uppercase mb-3">{st}</p>
                          )}

                          {/* Contrôle nb_unites + onglets — hébergement seulement */}
                          {isHebergement ? (
                            <>
                              {/* Dispo + Tarif au niveau sous-type seulement si 1 seule unité */}
                              {getNbUnites(st) === 1 && renderSubtypeAvailBloc(st)}
                              {renderSubtypePricingBloc(st)}
                              {renderNbUnitesControl(st)}
                              {getNbUnites(st) > 1
                                ? renderUnitTabs(st)
                                : (
                                  <>
                                    {renderPhotoSection(st, 'Photos de l\'offre')}
                                    {renderFields(
                                      st,
                                      (key) => (getUnitData(st)[0] ?? {})[key],
                                      (key, val) => { const arr = [...getUnitData(st)]; arr[0] = { ...(arr[0] ?? {}), [key]: val }; setUnitData(st, arr); },
                                    )}
                                  </>
                                )
                              }
                            </>
                          ) : (
                            /* Non-hébergement : champs directs */
                            <>
                              {renderPhotoSection(st, offerSubtypes.length > 1 ? `Photos — ${st}` : 'Photos de l\'offre')}
                              {renderFields(
                                st,
                                (key) => subtypeDetails[st]?.[key],
                                (key, val) => setSubtypeDetails((prev) => ({ ...prev, [st]: { ...(prev[st] ?? {}), [key]: val } })),
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* ── BLOC 3 : DISPONIBILITÉ — global pour non-hébergement seulement ── */}
                {offerActivity?.category !== 'hebergement' && <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Disponibilité</label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {AVAILABILITY_TYPES.map((m) => (
                      <button key={m.value} type="button" onClick={() => setAvailabilityMode(m.value)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${availabilityMode === m.value ? "border-primary bg-primary/10 text-slate-900" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-primary/30"}`}>
                        <span className={`material-symbols-outlined text-base ${availabilityMode === m.value ? "text-primary" : "text-slate-400"}`}>{m.icon}</span>
                        {m.label}
                      </button>
                    ))}
                  </div>
                  {availabilityMode === "specific" && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input type="date" value={newSpecificDate} onChange={(e) => setNewSpecificDate(e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                        <button type="button"
                          onClick={() => { if (newSpecificDate && !specificDates.includes(newSpecificDate)) { setSpecificDates((prev) => [...prev, newSpecificDate].sort()); setNewSpecificDate(""); } }}
                          className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-extrabold hover:bg-primary/90 transition-colors">
                          Ajouter
                        </button>
                      </div>
                      {specificDates.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {specificDates.map((d) => (
                            <span key={d} className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20">
                              {d}
                              <button type="button" onClick={() => setSpecificDates((prev) => prev.filter((x) => x !== d))}><X size={10} /></button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {availabilityMode === "weekly" && (
                    <div className="space-y-2">
                      <div className="flex gap-1.5">
                        {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map((day, i) => (
                          <button key={i} type="button"
                            onClick={() => setAvailableWeekdays((prev) => prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i])}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-black border-2 transition-all ${availableWeekdays.includes(i) ? "border-primary bg-primary text-white" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-primary/30"}`}>
                            {day}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1 block">Début période</label>
                          <input type="date" value={availabilityStart} onChange={(e) => setAvailabilityStart(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1 block">Fin période</label>
                          <input type="date" value={availabilityEnd} onChange={(e) => setAvailabilityEnd(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                      </div>
                    </div>
                  )}
                  {availabilityMode === "period" && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1 block">Date début *</label>
                          <input type="date" value={availabilityStart} onChange={(e) => setAvailabilityStart(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1 block">Date fin *</label>
                          <input type="date" value={availabilityEnd} onChange={(e) => setAvailabilityEnd(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1 block">Jours disponibles</label>
                        <div className="flex gap-1.5">
                          {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map((day, i) => (
                            <button key={i} type="button"
                              onClick={() => setAvailableWeekdays((prev) => prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i])}
                              className={`flex-1 py-2 rounded-xl text-[10px] font-black border-2 transition-all ${availableWeekdays.includes(i) ? "border-primary bg-primary text-white" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-primary/30"}`}>
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {availabilityMode === "on_demand" && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1 block">Délai de réponse *</label>
                        <div className="flex gap-2">
                          {["24h","48h","72h"].map((d) => (
                            <button key={d} type="button" onClick={() => setAvailDelaiReponse(d)}
                              className={`px-4 py-2 rounded-xl text-xs font-extrabold border-2 transition-all ${availDelaiReponse === d ? "border-primary bg-primary/10 text-primary" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-primary/30"}`}>
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1 block">Message d'accueil</label>
                        <textarea rows={2} value={availMessageAccueil} onChange={(e) => setAvailMessageAccueil(e.target.value)}
                          placeholder="Ex : Contactez-moi pour vérifier la disponibilité…"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder:text-slate-400" />
                      </div>
                    </div>
                  )}
                  {availabilityMode === "season" && (
                    <div>
                      <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Saisons *</label>
                      <div className="flex gap-2">
                        {SAISONS.map((s) => (
                          <button key={s} type="button"
                            onClick={() => setAvailSaisons((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-black border-2 transition-all ${availSaisons.includes(s) ? "border-primary bg-primary text-white" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-primary/30"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {availabilityMode !== "on_demand" && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1 block">Heure début</label>
                        <input type="time" value={availHeureDebut} onChange={(e) => setAvailHeureDebut(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1 block">Heure fin</label>
                        <input type="time" value={availHeureFin} onChange={(e) => setAvailHeureFin(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                    </div>
                  )}
                </div>}

                {/* ── BLOC 4 : TARIFICATION — global pour non-hébergement seulement ── */}
                {offerActivity?.category !== 'hebergement' && <div className="space-y-3">
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block">Tarification</label>

                  {/* Prix par sous-type en mode VARIANT */}
                  {offerMode === "variant" && offerSubtypes.length > 1 && (
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-3">
                      <p className="text-[10px] font-black tracking-widest text-primary uppercase">Prix par variante — Le voyageur choisit</p>
                      {offerSubtypes.map((st) => (
                        <div key={st}>
                          <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1 block">
                            {st} (TND)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] font-bold">DT</span>
                            <input type="number" min="0" step="1" placeholder="Ex : 250"
                              value={subtypePrices[st] ?? ""}
                              onChange={(e) => setSubtypePrices((prev) => ({ ...prev, [st]: e.target.value }))}
                              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1 block">
                      {offerMode === "variant" && offerSubtypes.length > 1
                        ? "Prix de référence général (optionnel)"
                        : "Prix par personne * (TND)"}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] font-bold">DT</span>
                      <input type="number" min="0" step="1" placeholder="350" value={form.price}
                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1 block">Prix groupe <span className="normal-case font-medium text-slate-300">(optionnel)</span></label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] font-bold">DT</span>
                        <input type="number" min="0" placeholder="1200" value={prixGroupe} onChange={(e) => setPrixGroupe(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono" />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">pers.</span>
                        <input type="number" min="1" placeholder="10" value={nbPersonnesGroupe} onChange={(e) => setNbPersonnesGroupe(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1 block">Prix enfant <span className="normal-case font-medium text-slate-300">(optionnel)</span></label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] font-bold">DT</span>
                        <input type="number" min="0" placeholder="150" value={prixEnfant} onChange={(e) => setPrixEnfant(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono" />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">≤ âge</span>
                        <input type="number" min="0" max="18" placeholder="12" value={ageMaxEnfant} onChange={(e) => setAgeMaxEnfant(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1 block">Supplément privatisation <span className="normal-case font-medium text-slate-300">(optionnel)</span></label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] font-bold">DT</span>
                      <input type="number" min="0" placeholder="500" value={suppPrivatisation} onChange={(e) => setSuppPrivatisation(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono" />
                    </div>
                  </div>
                  <div>
                    <button type="button" onClick={() => setAcompteRequis((v) => !v)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${acompteRequis ? "border-primary bg-primary/10 text-primary" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-primary/30"}`}>
                      <div className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center transition-all ${acompteRequis ? "border-primary bg-primary" : "border-slate-300"}`}>
                        {acompteRequis && <Check size={9} className="text-white" />}
                      </div>
                      Acompte requis
                    </button>
                    {acompteRequis && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <select value={typeAcompte} onChange={(e) => setTypeAcompte(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                          <option value="pourcentage">% du prix</option>
                          <option value="fixe">Montant fixe (DT)</option>
                        </select>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">{typeAcompte === "pourcentage" ? "%" : "DT"}</span>
                          <input type="number" min="1" placeholder={typeAcompte === "pourcentage" ? "30" : "100"} value={valeurAcompte} onChange={(e) => setValeurAcompte(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>}

                {/* ── BLOC 5 : CONFIRMATION ──────────────────────────────── */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Mode de confirmation</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CONFIRMATION_TYPES.slice(0, 3).map((m) => (
                      <button key={m.value} type="button" onClick={() => setOfferConfirmMode(m.value)}
                        className={`flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border-2 text-center transition-all ${offerConfirmMode === m.value ? "border-primary bg-primary/10 text-slate-900 shadow-sm" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-primary/30 hover:bg-white"}`}>
                        <span className={`material-symbols-outlined text-xl ${offerConfirmMode === m.value ? "text-primary" : "text-slate-400"}`}>{m.icon}</span>
                        <span className="text-[10px] font-extrabold">{m.label}</span>
                        <span className="text-[9px] font-medium text-slate-400">{m.desc}</span>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {CONFIRMATION_TYPES.slice(3).map((m) => (
                      <button key={m.value} type="button" onClick={() => setOfferConfirmMode(m.value)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${offerConfirmMode === m.value ? "border-primary bg-primary/10 text-slate-900" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-primary/30"}`}>
                        <span className={`material-symbols-outlined text-base ${offerConfirmMode === m.value ? "text-primary" : "text-slate-400"}`}>{m.icon}</span>
                        <div>
                          <p className="font-extrabold">{m.label}</p>
                          <p className="text-[9px] font-medium text-slate-400">{m.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  {offerConfirmMode === "deposit" && (
                    <div className="mt-3">
                      <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1 block">Acompte requis (%)</label>
                      <input type="number" min="1" max="100" value={offerDepositPct} onChange={(e) => setOfferDepositPct(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono" />
                    </div>
                  )}
                </div>

                {/* ── BLOC 6 : ANNULATION ────────────────────────────────── */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Politique d'annulation *</label>
                  <div className="space-y-1.5">
                    {CANCELLATION_POLICIES.map((p) => (
                      <button key={p.value} type="button" onClick={() => setCancellationPolicy(p.value)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${cancellationPolicy === p.value ? "border-primary bg-primary/10" : "border-slate-200 bg-slate-50 hover:border-primary/30"}`}>
                        <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${cancellationPolicy === p.value ? "border-primary" : "border-slate-300"}`}>
                          {cancellationPolicy === p.value && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </div>
                        <div>
                          <p className={`text-xs font-extrabold ${cancellationPolicy === p.value ? "text-slate-900" : "text-slate-600"}`}>{p.label}</p>
                          <p className="text-[10px] font-medium text-slate-400">{p.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  {cancellationPolicy === "custom" && (
                    <textarea rows={2} value={cancellationDesc} onChange={(e) => setCancellationDesc(e.target.value)}
                      placeholder="Décrivez votre politique d'annulation personnalisée…"
                      className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder:text-slate-400" />
                  )}
                </div>

                {publishError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                    <span className="material-symbols-outlined text-red-500 text-base">error</span>
                    <p className="text-sm font-semibold text-red-600">{publishError}</p>
                  </div>
                )}
              </form>
            </div>
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-3 shrink-0">
              <button type="button" onClick={closeModal}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 bg-white rounded-2xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer">
                Annuler
              </button>
              <button type="submit" form="publish-offer-form" disabled={publishing}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-extrabold rounded-2xl text-xs shadow-sm hover:shadow transition-all active:scale-95 disabled:opacity-60 cursor-pointer">
                {publishing
                  ? <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Publication…</>
                  : <><Send size={14} />Publier l'offre</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ OFFER DETAIL / EDIT MODAL ════════════════════════════════════════ */}
      {editModalOpen && viewOffer && (() => {
        const sliderImgs = viewOffer.images?.length
          ? viewOffer.images
          : viewOffer.cover_image ? [viewOffer.cover_image] : [];
        const td = OFFER_TYPES.find((t) => t.value === viewOffer.offer_type) ?? OFFER_TYPES[OFFER_TYPES.length - 1];
        const safeIdx = Math.min(sliderIdx, Math.max(sliderImgs.length - 1, 0));

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">

              <button onClick={closeEditModal}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors">
                <X size={16} />
              </button>

              {!editMode ? (
                /* ── VIEW MODE ───────────────────────────────────────────── */
                <>
                  <div
                    className="relative h-56 w-full overflow-hidden shrink-0 select-none"
                    onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
                    onTouchEnd={(e) => {
                      if (touchStartX === null || sliderImgs.length <= 1) return;
                      const diff = touchStartX - e.changedTouches[0].clientX;
                      if (Math.abs(diff) > 40) {
                        setSliderIdx((i) => diff > 0
                          ? Math.min(i + 1, sliderImgs.length - 1)
                          : Math.max(i - 1, 0));
                      }
                      setTouchStartX(null);
                    }}
                  >
                    {sliderImgs.length > 0 ? (
                      <div
                        className="flex h-full transition-transform duration-300 ease-out"
                        style={{ transform: `translateX(-${(safeIdx / sliderImgs.length) * 100}%)`, width: `${sliderImgs.length * 100}%` }}
                      >
                        {sliderImgs.map((src, i) => (
                          <div key={i} className="h-full" style={{ width: `${100 / sliderImgs.length}%` }}>
                            <img src={src} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className={`absolute inset-0 bg-gradient-to-br ${td.gradient} opacity-90`} />
                        <span className="material-symbols-outlined text-white/25 absolute inset-0 flex items-center justify-center" style={{ fontSize: 110 }}>{td.icon}</span>
                      </>
                    )}

                    {sliderImgs.length > 1 && (
                      <>
                        <button type="button"
                          onClick={() => setSliderIdx((i) => Math.max(i - 1, 0))}
                          disabled={safeIdx === 0}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all disabled:opacity-30">
                          <ChevronLeft size={18} />
                        </button>
                        <button type="button"
                          onClick={() => setSliderIdx((i) => Math.min(i + 1, sliderImgs.length - 1))}
                          disabled={safeIdx === sliderImgs.length - 1}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all disabled:opacity-30">
                          <ChevronRight size={18} />
                        </button>
                      </>
                    )}

                    {sliderImgs.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {sliderImgs.map((_, i) => (
                          <button key={i} type="button" onClick={() => setSliderIdx(i)}
                            className={`h-1.5 rounded-full transition-all duration-200 ${i === safeIdx ? "w-5 bg-white" : "w-1.5 bg-white/50"}`}
                          />
                        ))}
                      </div>
                    )}

                    {sliderImgs.length > 1 && (
                      <div className="absolute top-3 left-3 bg-black/40 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                        {safeIdx + 1} / {sliderImgs.length}
                      </div>
                    )}
                  </div>

                  <div className="overflow-y-auto flex-1 px-8 py-6 space-y-5">
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight pr-8">{viewOffer.title}</h2>

                    <div className="flex flex-wrap gap-2.5">
                      {viewOffer.offer_type && (() => {
                        const t = OFFER_TYPES.find((x) => x.value === viewOffer.offer_type);
                        return t ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl px-3 py-1.5 text-[11px] font-extrabold tracking-wider flex items-center gap-1.5 uppercase">
                            <span className="material-symbols-outlined text-sm leading-none">{t.icon}</span>{t.label}
                          </span>
                        ) : null;
                      })()}
                      {viewOffer.price !== null && (
                        <span className="bg-primary/10 text-primary border border-primary/20 rounded-xl px-3 py-1.5 text-[11px] font-extrabold tracking-wider flex items-center gap-1.5">
                          <span className="font-extrabold">{viewOffer.price} DT</span>
                          {viewOffer.duration && <span className="text-slate-400 font-bold">/ {viewOffer.duration}j</span>}
                        </span>
                      )}
                      {viewOffer.duration && viewOffer.price === null && (
                        <span className="bg-slate-50 text-slate-500 border border-slate-200 rounded-xl px-3 py-1.5 text-[11px] font-extrabold tracking-wider flex items-center gap-1.5">
                          <Clock size={12} />{viewOffer.duration} jours
                        </span>
                      )}
                    </div>

                    {viewOffer.description && (
                      <div>
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Description</p>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{viewOffer.description}</p>
                      </div>
                    )}

                    {viewOffer.inclusions && (
                      <div className="bg-emerald-50/60 border border-emerald-100/70 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-emerald-600 text-base leading-none">check_circle</span>
                          <p className="text-[10px] font-black tracking-widest text-emerald-700 uppercase">Inclusions</p>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{viewOffer.inclusions}</p>
                      </div>
                    )}

                    {viewOffer.meeting_point && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-slate-500 text-base leading-none">location_on</span>
                          <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Localisation</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">{viewOffer.meeting_point}</p>
                        <LocationMap
                          lat={viewOffer.meeting_lat ?? null}
                          lng={viewOffer.meeting_lng ?? null}
                          address={viewOffer.meeting_point}
                        />
                      </div>
                    )}

                    {(viewOffer.min_group_size !== null || viewOffer.max_group_size !== null || viewOffer.min_age !== null) && (
                      <div className="grid grid-cols-2 gap-3">
                        {(viewOffer.min_group_size !== null || viewOffer.max_group_size !== null) && (
                          <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                            <span className="material-symbols-outlined text-slate-500 text-xl mt-0.5">group</span>
                            <div>
                              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Groupe</p>
                              <p className="text-sm font-semibold text-slate-700 mt-0.5">
                                {viewOffer.min_group_size ?? 1} – {viewOffer.max_group_size ?? "∞"} pers.
                              </p>
                            </div>
                          </div>
                        )}
                        {viewOffer.min_age !== null && (
                          <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                            <span className="material-symbols-outlined text-slate-500 text-xl mt-0.5">person</span>
                            <div>
                              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Âge minimum</p>
                              <p className="text-sm font-semibold text-slate-700 mt-0.5">{viewOffer.min_age} ans</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {viewOffer.cancellation_policy && (
                      <div className="flex items-start gap-3 p-4 bg-amber-50/60 border border-amber-100/70 rounded-2xl">
                        <span className="material-symbols-outlined text-amber-500 text-xl mt-0.5">policy</span>
                        <div>
                          <p className="text-[10px] font-black tracking-widest text-amber-700 uppercase mb-1">Politique d'annulation</p>
                          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{viewOffer.cancellation_policy}</p>
                        </div>
                      </div>
                    )}

                    <p className="text-[11px] font-bold text-slate-400">
                      Publiée le {new Date(viewOffer.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>

                  <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-3 shrink-0">
                    <button type="button" onClick={closeEditModal}
                      className="px-5 py-2.5 border border-slate-200 text-slate-600 bg-white rounded-2xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer">
                      Fermer
                    </button>
                    <button type="button" onClick={() => {
                      if (!viewOffer) return;
                      setEditForm({
                        title:               viewOffer.title,
                        offer_type:          viewOffer.offer_type          ?? "",
                        description:         viewOffer.description         ?? "",
                        price:               viewOffer.price !== null ? String(viewOffer.price) : "",
                        duration:            viewOffer.duration            ?? "",
                        status:              viewOffer.status,
                        region:              viewOffer.region              ?? "",
                        inclusions:          viewOffer.inclusions          ?? "",
                        meeting_point:       viewOffer.meeting_point       ?? "",
                        min_group_size:      viewOffer.min_group_size !== null ? String(viewOffer.min_group_size) : "",
                        max_group_size:      viewOffer.max_group_size !== null ? String(viewOffer.max_group_size) : "",
                        min_age:             viewOffer.min_age       !== null ? String(viewOffer.min_age)       : "",
                        cancellation_policy: viewOffer.cancellation_policy ?? "",
                      });
                      setEditTitleError(""); setEditError("");
                      const imgs = (viewOffer.images?.length
                        ? viewOffer.images
                        : viewOffer.cover_image ? [viewOffer.cover_image] : []
                      ).filter((src) => src.startsWith("http"));
                      setEditImages(imgs.map((src) => ({ src })));
                      setEditCoverIdx(0);
                      setEditMode(true);
                    }}
                      className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-extrabold rounded-2xl text-xs shadow-sm transition-all active:scale-95 cursor-pointer">
                      <Edit3 size={14} />Gérer
                    </button>
                  </div>
                </>
              ) : (
                /* ── EDIT MODE ───────────────────────────────────────────── */
                <>
                  <div className="px-8 pt-8 pb-5 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Edit3 size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Gérer l'offre</h3>
                        <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{editForm.title}</p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-y-auto flex-1">
                    <form onSubmit={handleSaveOffer} className="px-8 py-6 space-y-5">
                      <div>
                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Titre de l'offre *</label>
                        <input type="text" placeholder="Ex : Séjour éco en forêt de Mogods"
                          value={editForm.title}
                          onChange={(e) => { setEditForm((f) => ({ ...f, title: e.target.value })); setEditTitleError(""); }}
                          className={`w-full px-4 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 transition-all placeholder:font-normal ${editTitleError ? "bg-red-50 border border-red-300 focus:ring-red-200" : "bg-slate-50 border border-slate-200 focus:ring-primary focus:bg-white"}`}
                        />
                        {editTitleError && <p className="text-xs font-semibold text-red-500 mt-1">{editTitleError}</p>}
                      </div>
                      <div>
                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Description détaillée</label>
                        <textarea rows={4} placeholder="Décrivez le concept écologique, les activités durables…"
                          value={editForm.description}
                          onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white resize-none placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Région / Emplacement</label>
                        <input type="text" placeholder="Tunis, Djerba, Sfax…"
                          value={editForm.region}
                          onChange={(e) => setEditForm((f) => ({ ...f, region: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Localisation</label>
                          <button type="button" onClick={() => setShowEditMap((v) => !v)}
                            className="flex items-center gap-1 text-[10px] font-extrabold text-primary hover:text-primary/80 transition-colors">
                            <MapPin size={12} />
                            {showEditMap ? "Masquer la carte" : "Choisir sur la carte"}
                          </button>
                        </div>
                        <input type="text" placeholder="Ex : Place de la Kasbah, Tunis"
                          value={editForm.meeting_point}
                          onChange={(e) => setEditForm((f) => ({ ...f, meeting_point: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white placeholder:text-slate-400 mb-2"
                        />
                        {showEditMap && (
                          <MapPicker
                            lat={editMapLat} lng={editMapLng}
                            onPick={(lat, lng, address) => {
                              setEditMapLat(lat); setEditMapLng(lng);
                              setEditForm((f) => ({ ...f, meeting_point: address }));
                            }}
                          />
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Inclusions</label>
                        <textarea rows={3} placeholder={"Ex :\n• Transport inclus\n• Repas traditionnels\n• Guide bilingue"}
                          value={editForm.inclusions}
                          onChange={(e) => setEditForm((f) => ({ ...f, inclusions: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white resize-none placeholder:text-slate-400"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Max. pers.</label>
                          <input type="number" min="1" placeholder="20"
                            value={editForm.max_group_size}
                            onChange={(e) => setEditForm((f) => ({ ...f, max_group_size: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Âge min. <span className="normal-case font-medium text-slate-300">(facultatif)</span></label>
                          <input type="number" min="0" placeholder="12"
                            value={editForm.min_age}
                            onChange={(e) => setEditForm((f) => ({ ...f, min_age: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Politique d'annulation</label>
                        <textarea rows={2} placeholder="Ex : Remboursement intégral si annulation 48h avant."
                          value={editForm.cancellation_policy}
                          onChange={(e) => setEditForm((f) => ({ ...f, cancellation_policy: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white resize-none placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Photos de l'offre</label>
                        {editImages.length > 0 && (
                          <div className="grid grid-cols-4 gap-2 mb-3">
                            {editImages.map((img, i) => {
                              const isCover = i === editCoverIdx;
                              return (
                                <div key={i} onClick={() => setEditCoverIdx(i)}
                                  className={`relative group aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${isCover ? "border-primary shadow-md" : "border-transparent hover:border-slate-300"}`}>
                                  <img src={img.src} alt="" className="w-full h-full object-cover" />
                                  {isCover && (
                                    <div className="absolute top-1 left-1 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-md leading-none">Cover</div>
                                  )}
                                  <button type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditImages((prev) => prev.filter((_, idx) => idx !== i));
                                      setEditCoverIdx((c) => (c >= i && c > 0 ? c - 1 : c));
                                    }}
                                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X size={10} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <label htmlFor="edit-images-input"
                          className="flex flex-col items-center justify-center gap-2 w-full h-20 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all bg-slate-50/70">
                          <span className="material-symbols-outlined text-slate-300 text-2xl">add_photo_alternate</span>
                          <p className="text-xs font-semibold text-slate-400">Ajouter des photos</p>
                          <input id="edit-images-input" type="file" accept="image/*" multiple className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files ?? []);
                              if (!files.length) return;
                              const newImgs = files.map((f) => ({ src: URL.createObjectURL(f), file: f }));
                              setEditImages((prev) => [...prev, ...newImgs]);
                              e.target.value = "";
                            }}
                          />
                        </label>
                        {editImages.length > 0 && (
                          <p className="text-[10px] text-slate-400 font-medium mt-2">Cliquez sur une photo pour la définir comme image principale.</p>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Type d'offre</label>
                        <div className="grid grid-cols-3 gap-2">
                          {OFFER_TYPES.map((t) => {
                            const active = editForm.offer_type === t.value;
                            return (
                              <button key={t.value} type="button"
                                onClick={() => setEditForm((f) => ({ ...f, offer_type: active ? "" : t.value }))}
                                className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border-2 text-center transition-all cursor-pointer ${active ? "bg-primary/10 border-primary text-slate-900 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-500 hover:border-primary/40 hover:bg-white"}`}>
                                <span className={`material-symbols-outlined text-xl ${active ? "text-primary" : "text-slate-400"}`}>{t.icon}</span>
                                <span className="text-[10px] font-extrabold">{t.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Tarif (TND)</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] font-bold">DT</span>
                            <input type="number" min="0" step="0.01" placeholder="Ex : 350"
                              value={editForm.price} onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-mono placeholder:text-slate-400 placeholder:font-sans"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Durée (jours)</label>
                          <div className="relative">
                            <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="number" min="1" step="1" placeholder="Ex : 3"
                              value={editForm.duration} onChange={(e) => setEditForm((f) => ({ ...f, duration: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-mono placeholder:text-slate-400 placeholder:font-sans"
                            />
                          </div>
                        </div>
                      </div>
                      {editError && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                          <span className="material-symbols-outlined text-red-500 text-base">error</span>
                          <p className="text-sm font-semibold text-red-600">{editError}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setEditMode(false)}
                            className="flex items-center gap-1.5 px-5 py-2.5 border border-slate-200 text-slate-600 bg-white rounded-2xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer">
                            <ChevronLeft size={14} />Retour
                          </button>
                          <button type="button" onClick={handleDeleteOffer} disabled={offerDeleting}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-red-500 hover:bg-red-50 font-bold text-xs transition-colors disabled:opacity-50">
                            <span className="material-symbols-outlined text-base">delete</span>
                            {offerDeleting ? "Suppression…" : "Supprimer"}
                          </button>
                        </div>
                        <button type="submit" disabled={editSaving}
                          className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-extrabold rounded-2xl text-xs shadow-sm transition-all active:scale-95 disabled:opacity-60 cursor-pointer">
                          {editSaving
                            ? <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Sauvegarde…</>
                            : <><Send size={14} />Enregistrer</>
                          }
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6">

        {/* ══ PROFILE HEADER CARD ═══════════════════════════════════════════ */}
        <div className="relative w-full overflow-hidden bg-white shadow-sm rounded-3xl border border-slate-100/80 mb-6">
          {profile.cover_photo
            ? <div className="relative h-48 md:h-64 lg:h-72 w-full overflow-hidden"><img src={profile.cover_photo} alt="" className="w-full h-full object-cover" /></div>
            : <BotanicalCover />
          }
          <div className="relative px-5 pb-5 pt-3 md:pt-0">
            <div className="flex items-end justify-between gap-4 -mt-14 md:-mt-16">
              {/* Avatar + score badge */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-md" />
                  <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-lg flex items-center justify-center">
                    <AvatarImg />
                  </div>
                </div>
                <div className="bg-primary text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md uppercase tracking-wider border border-white">
                  <span className="material-symbols-outlined text-yellow-300" style={{ fontSize: 10 }}>star</span>
                  {scoreLabel(profile.sustainability_score)}
                </div>
              </div>

              {/* Name + buttons row */}
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-1">
                <div className="min-w-0">
                  <div className="flex items-start gap-2">
                    <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-800 leading-tight break-words">
                      {profile.organization || profile.full_name || "Prestataire"}
                    </h1>
                    <ShieldCheck size={18} className="text-emerald-500 fill-emerald-100 shrink-0 mt-1 hidden sm:block" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-primary font-semibold text-xs">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                    <span>Prestataire</span>
                  </div>
                </div>

                {/* Buttons always side-by-side */}
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={openModal}
                    className="bg-primary hover:bg-primary/90 active:scale-95 text-white font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 hover:shadow-lg transition-all shadow-sm text-sm whitespace-nowrap">
                    <Plus size={16} strokeWidth={2.5} /><span>Publier une offre</span>
                  </button>
                  <button onClick={openEditProfile}
                    className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 hover:shadow-sm active:scale-95 transition-all text-sm whitespace-nowrap">
                    <Edit3 size={15} /><span>Modifier</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ DASHBOARD COLUMNS ════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── LEFT SIDEBAR ──────────────────────────────────────────────── */}
          <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100/80 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-primary">
                  <Info size={18} strokeWidth={2.5} />
                </div>
                <h2 className="text-base font-extrabold text-slate-800">Informations</h2>
              </div>
              <div className="space-y-4">
                {/* Bio / Description */}
                {profile.bio && (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-emerald-50 text-emerald-500 shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>description</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Description</p>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed line-clamp-3">{profile.bio}</p>
                    </div>
                  </div>
                )}
                {/* Type */}
                {profile.provider_type && (() => {
                  const pt = PROVIDER_TYPES.find((t) => t.value === profile.provider_type);
                  return pt ? (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{pt.icon}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Type</p>
                        <p className="text-sm font-semibold text-slate-700 mt-0.5">{pt.label}</p>
                      </div>
                    </div>
                  ) : null;
                })()}
                {/* Localisation — données org en priorité, fallback profil */}
                {(org?.address || org?.zone || org?.region || org?.country || profile.region || profile.country) && (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-50 text-slate-400 shrink-0"><MapPin size={16} /></div>
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Localisation</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">
                        {[
                          org?.zone,
                          org?.region ?? profile.region,
                          (org?.country ?? profile.country) ? (COUNTRY_LABELS[org?.country ?? profile.country ?? ""] ?? (org?.country ?? profile.country)) : null,
                        ].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                )}
                {/* Site web */}
                {profile.website && (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-50 text-slate-400 shrink-0"><Globe size={16} /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Site web</p>
                      <a href={profile.website} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary hover:underline truncate block mt-0.5">{profile.website.replace(/^https?:\/\//, "")}</a>
                    </div>
                  </div>
                )}
                {/* Membre depuis */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-50 text-slate-400 shrink-0"><Calendar size={16} /></div>
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Membre depuis</p>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">
                      {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
                {/* Données org — contact & réseaux */}
                {org && (org.phone || org.whatsapp || org.email || org.website || org.instagram || org.facebook || org.tiktok) && (
                  <div className="pt-3 border-t border-slate-50 space-y-3">
                    {(org.website || org.email) && (
                      <div className="space-y-2">
                        {org.website && (
                          <a href={org.website.startsWith("http") ? org.website : `https://${org.website}`} target="_blank" rel="noreferrer"
                            className="flex items-center gap-2.5 text-xs font-semibold text-primary hover:underline">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Globe size={13} className="text-primary" />
                            </div>
                            <span className="truncate">{org.website.replace(/^https?:\/\//, "")}</span>
                          </a>
                        )}
                        {org.email && (
                          <a href={`mailto:${org.email}`}
                            className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 hover:text-primary">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <Mail size={13} className="text-slate-500" />
                            </div>
                            <span className="truncate">{org.email}</span>
                          </a>
                        )}
                      </div>
                    )}
                    {(org.phone || org.whatsapp) && (
                      <div className="space-y-2">
                        {org.phone && (
                          <a href={`tel:${org.phone}`}
                            className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 hover:text-primary">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <Phone size={13} className="text-slate-500" />
                            </div>
                            <span>{org.phone}</span>
                          </a>
                        )}
                        {org.whatsapp && (
                          <a href={`https://wa.me/${org.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                            className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 hover:text-primary">
                            <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                              <MessageCircle size={13} className="text-green-500" />
                            </div>
                            <span>{org.whatsapp}</span>
                          </a>
                        )}
                      </div>
                    )}
                    {(org.instagram || org.facebook || org.tiktok) && (
                      <div className="flex gap-2 flex-wrap">
                        {org.instagram && (
                          <a href={socialHref("instagram", org.instagram)} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 bg-pink-50 text-pink-600 hover:bg-pink-100 text-[11px] font-black px-3 py-1.5 rounded-xl transition-colors">
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>photo_camera</span>
                            Instagram
                          </a>
                        )}
                        {org.facebook && (
                          <a href={socialHref("facebook", org.facebook)} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 text-[11px] font-black px-3 py-1.5 rounded-xl transition-colors">
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>group</span>
                            Facebook
                          </a>
                        )}
                        {org.tiktok && (
                          <a href={socialHref("tiktok", org.tiktok)} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-black px-3 py-1.5 rounded-xl transition-colors">
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>music_note</span>
                            TikTok
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* Messagerie */}
            <MessagerieWidget token={token} />

            {/* Followers */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="font-extrabold text-base text-slate-800">Followers</span>
                {followers.length > 0 && <span className="bg-primary/10 text-primary text-xs font-black px-2 py-0.5 rounded-full">{followers.length}</span>}
              </div>
              {followers.length > 0 ? (
                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                  {followers.slice(0, 5).map((f) => {
                    const path = f._type === "eco_traveler" ? `/profile/ecovoyageur/${f.user_id}` : f._type === "guide" ? `/profile/guide/${f.user_id}` : `/profile/project-owner/${f.user_id}`;
                    return (
                      <button key={f.user_id} onClick={() => router.push(path)}
                        className="w-10 h-10 rounded-xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center hover:scale-105 transition-transform"
                        title={f.full_name}>
                        {f.photo ? <img src={f.photo} alt={f.full_name} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-slate-400 text-lg">person</span>}
                      </button>
                    );
                  })}
                  {followers.length > 5 && <div className="w-10 h-10 rounded-xl bg-emerald-50 text-primary text-[11px] font-black border border-emerald-100/60 shadow-sm flex items-center justify-center">+{followers.length - 5}</div>}
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-medium">Aucun follower pour l'instant.</p>
              )}
            </div>

          </div>

          {/* ── RIGHT COLUMN ──────────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-wrap gap-1 border border-slate-200/50">
              {[
                { key: "tout",      label: "Tout",       Icon: LayoutGrid },
                { key: "offres",    label: "Offres",     Icon: Tag },
                { key: "activites", label: "Activités",  Icon: Sparkles },
                { key: "reseau",    label: "Réseau",     Icon: Users },
                { key: "apropos",   label: "À propos",   Icon: Info },
              ].map(({ key, label, Icon }) => (
                <button key={key} onClick={() => setActiveTab(key as Tab)}
                  className={`flex-1 min-w-[60px] py-3 px-3 rounded-xl text-xs font-black tracking-tight flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"}`}>
                  <Icon size={14} strokeWidth={2.5} /><span>{label}</span>
                </button>
              ))}
            </div>

            {activeTab === "tout" && (() => {
              const allActivityTypes = [
                ...(profile.activity_types ?? []).map((v) => ({ value: v, level: "primary" as const })),
                ...(profile.secondary_activity_types ?? []).map((v) => ({ value: v, level: "secondary" as const })),
              ];
              return (
                <div className="space-y-6">
                  {/* Offers section — first, like project-owner */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                      <Tag size={12} className="text-primary" /><span>Offres Écotourisme Actives</span>
                    </h3>
                    {offers.length === 0 ? (
                      <div className="bg-white rounded-3xl border border-slate-100/90 shadow-sm p-12 text-center">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <span className="material-symbols-outlined text-primary text-3xl">sell</span>
                        </div>
                        <p className="text-slate-800 font-extrabold text-base mb-1">Aucune offre publiée</p>
                        <p className="text-slate-400 text-sm mb-5">Publiez votre première expérience éco-touristique.</p>
                        <button onClick={openModal} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary/90 shadow-sm">
                          <Plus size={16} /> Publier une offre
                        </button>
                      </div>
                    ) : (
                      offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)
                    )}
                  </div>

                  {/* Activities section */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Sparkles size={12} className="text-primary" />Activités Proposées</span>
                      {orgActivities.length > 0 && (
                        <button onClick={() => setActiveTab("activites")} className="text-primary text-[10px] font-black hover:underline flex items-center gap-1">Tout voir <ArrowRight size={10} /></button>
                      )}
                    </h3>
                    {orgActivities.length === 0 ? (
                      <LaunchActivityCard />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {orgActivities.slice(0, 4).map((act) => {
                          const meta = findProviderTypeMeta(act.category);
                          const cat = getCategoryByValue(act.category);
                          const isPrimary = act.level === "primary";
                          const firstPhoto = Object.values(act.photos ?? {}).flat().filter(Boolean)[0] ?? null;
                          const subtypeLabels = (act.subtypes ?? []).map((sv) => cat?.subtypes.find((s) => s.value === sv)?.label ?? sv);
                          return (
                            <div key={act.id} className="bg-white rounded-3xl border border-slate-100/90 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                              <div className="relative h-48 w-full overflow-hidden">
                                <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient}`} />
                                {firstPhoto ? <img src={firstPhoto} alt={meta.label} className="absolute inset-0 w-full h-full object-cover" />
                                  : <div className="absolute inset-0 flex items-center justify-center select-none opacity-20"><span className="material-symbols-outlined" style={{ fontSize: 80 }}>{meta.categoryIcon}</span></div>}
                                <div className={`absolute top-3 left-3 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-xl shadow-md border ${isPrimary ? "bg-primary text-white border-white/20" : "bg-white/95 text-orange-500 border-orange-100"}`}>
                                  {isPrimary ? "Principale" : "Secondaire"}
                                </div>
                                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-xl">
                                  <span className="material-symbols-outlined align-middle" style={{ fontSize: 13 }}>{meta.categoryIcon}</span> {meta.categoryLabel}
                                </div>
                              </div>
                              <div className="p-5">
                                <h3 className="text-lg font-extrabold text-slate-800 tracking-tight mb-1 leading-tight">{meta.label}</h3>
                                {act.years_experience != null && <p className="text-slate-500 text-sm mb-2">{act.years_experience} an{act.years_experience > 1 ? "s" : ""} d'expérience</p>}
                                {org?.region && <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-3"><MapPin size={12} /><span>{org.region}</span></div>}
                                {subtypeLabels.length > 0 && (
                                  <div className="mb-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 flex flex-wrap gap-1.5">
                                    {subtypeLabels.map((label) => <span key={label} className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full">{label}</span>)}
                                  </div>
                                )}
                                <div className="border border-dashed border-primary/40 rounded-xl py-1.5 px-3 mb-3 text-center text-[11px] font-bold text-primary/70">🌿 Évaluer la durabilité</div>
                                <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                                  <p className="text-[11px] font-bold text-slate-400">{isPrimary ? "Activité principale" : "Activité secondaire"}</p>
                                  <button onClick={() => { setViewOrgActivity(act); setOrgActSliderIdx(0); }}
                                    className="text-primary hover:text-primary/80 font-extrabold text-xs inline-flex items-center gap-1 hover:translate-x-1 transition-transform duration-200">
                                    <span>Voir les détails</span><ArrowRight size={14} strokeWidth={2.5} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {activeTab === "activites" && (() => {
              const primaryActs = orgActivities.filter((a) => a.level === "primary");
              const secondaryActs = orgActivities.filter((a) => a.level === "secondary");
              const filtered = activityFilter === "primary" ? primaryActs
                : activityFilter === "secondary" ? secondaryActs
                : orgActivities;

              return (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-800">Activités ({orgActivities.length})</h3>
                    <button onClick={() => setEditProfileOpen(true)} className="text-primary hover:text-primary/80 text-xs font-extrabold flex items-center gap-1">
                      <Plus size={14} />Gérer les activités
                    </button>
                  </div>

                  {orgActivities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: null,        label: "Toutes",                  count: orgActivities.length,   active: !activityFilter,                 cls: "bg-primary text-white border-primary" },
                        { key: "primary",   label: `Principales`,             count: primaryActs.length,     active: activityFilter === "primary",    cls: "bg-primary text-white border-primary" },
                        { key: "secondary", label: `Secondaires`,             count: secondaryActs.length,   active: activityFilter === "secondary",  cls: "bg-orange-500 text-white border-orange-500" },
                      ].filter((f) => f.count > 0 || f.key === null).map((f) => (
                        <button key={String(f.key)} onClick={() => setActivityFilter(f.active ? null : f.key)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-black border transition-all ${f.active ? f.cls : "bg-white text-slate-500 border-slate-200 hover:border-primary/40"}`}>
                          {f.label} ({f.count})
                        </button>
                      ))}
                    </div>
                  )}

                  {orgActivities.length === 0 ? (
                    <LaunchActivityCard />
                  ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-100/90 shadow-sm p-12 text-center">
                      <p className="text-slate-800 font-extrabold text-base">Aucune activité dans cette catégorie</p>
                      <button onClick={() => setActivityFilter(null)} className="mt-3 text-primary text-xs font-bold hover:underline">Voir toutes</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filtered.map((act) => {
                        const meta = findProviderTypeMeta(act.category);
                        const cat = getCategoryByValue(act.category);
                        const isPrimary = act.level === "primary";
                        const firstPhoto = Object.values(act.photos ?? {}).flat().filter(Boolean)[0] ?? null;
                        const subtypeLabels = (act.subtypes ?? []).map((sv) => cat?.subtypes.find((s) => s.value === sv)?.label ?? sv);
                        return (
                          <div key={act.id} className="bg-white rounded-3xl border border-slate-100/90 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                            <div className="relative h-48 w-full overflow-hidden">
                              <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient}`} />
                              {firstPhoto ? <img src={firstPhoto} alt={meta.label} className="absolute inset-0 w-full h-full object-cover" />
                                : <div className="absolute inset-0 flex items-center justify-center select-none opacity-20"><span className="material-symbols-outlined" style={{ fontSize: 80 }}>{meta.categoryIcon}</span></div>}
                              <div className={`absolute top-3 left-3 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-xl shadow-md border ${isPrimary ? "bg-primary text-white border-white/20" : "bg-white/95 text-orange-500 border-orange-100"}`}>
                                {isPrimary ? "Principale" : "Secondaire"}
                              </div>
                              <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-xl">
                                <span className="material-symbols-outlined align-middle" style={{ fontSize: 13 }}>{meta.categoryIcon}</span> {meta.categoryLabel}
                              </div>
                            </div>
                            <div className="p-5">
                              <h3 className="text-lg font-extrabold text-slate-800 tracking-tight mb-1 leading-tight">{meta.label}</h3>
                              {act.years_experience != null && <p className="text-slate-500 text-sm mb-2">{act.years_experience} an{act.years_experience > 1 ? "s" : ""} d'expérience</p>}
                              {org?.region && <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-3"><MapPin size={12} /><span>{org.region}</span></div>}
                              {subtypeLabels.length > 0 && (
                                <div className="mb-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 flex flex-wrap gap-1.5">
                                  {subtypeLabels.map((label) => <span key={label} className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full">{label}</span>)}
                                </div>
                              )}
                              <div className="border border-dashed border-primary/40 rounded-xl py-1.5 px-3 mb-3 text-center text-[11px] font-bold text-primary/70">🌿 Évaluer la durabilité</div>
                              <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                                <p className="text-[11px] font-bold text-slate-400">{isPrimary ? "Activité principale" : "Activité secondaire"}</p>
                                <button onClick={() => { setViewOrgActivity(act); setOrgActSliderIdx(0); }}
                                  className="text-primary hover:text-primary/80 font-extrabold text-xs inline-flex items-center gap-1 hover:translate-x-1 transition-transform duration-200">
                                  <span>Voir les détails</span><ArrowRight size={14} strokeWidth={2.5} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {activeTab === "offres" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-800">Offres disponibles ({offers.length})</h3>
                  <button onClick={openModal} className="text-primary hover:text-primary/80 text-xs font-extrabold flex items-center gap-1">+ Publier une offre</button>
                </div>
                {offers.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-100/90 shadow-sm p-12 text-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-primary text-3xl">sell</span>
                    </div>
                    <p className="text-slate-800 font-extrabold text-base">Aucune offre pour l'instant</p>
                    <p className="text-slate-400 text-sm mt-1">Publiez votre première expérience.</p>
                  </div>
                ) : (
                  offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)
                )}
              </div>
            )}

            {activeTab === "reseau" && (
              <div className="space-y-5">
                {/* Search */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2"><Search size={16} className="text-primary" />Rechercher un guide certifié</h3>
                  <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input type="text" value={netSearch} onChange={(e) => setNetSearch(e.target.value)} placeholder="Nom d'un guide…"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-colors" />
                    {netSearch && <button onClick={() => { setNetSearch(""); setNetResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={14} /></button>}
                  </div>
                  {netLoading && <div className="mt-3 flex items-center gap-2 text-xs text-slate-400"><div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />Recherche…</div>}
                  {!netLoading && netResults.length > 0 && (
                    <div className="mt-3 divide-y divide-slate-50">
                      {netResults.map((r) => (
                        <div key={r.user_id} className="flex items-center justify-between py-3 gap-3">
                          <button onClick={() => router.push(`/profile/guide/${r.user_id}`)} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 text-left">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">{r.photo ? <img src={r.photo} alt={r.full_name} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-slate-400">person</span>}</div>
                            <div className="min-w-0"><p className="font-extrabold text-slate-800 text-sm truncate">{r.full_name}</p>{r.sub && <p className="text-xs text-slate-400">{r.sub}</p>}</div>
                          </button>
                          <button onClick={() => router.push(`/profile/guide/${r.user_id}`)} className="shrink-0 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-bold rounded-xl hover:bg-primary hover:text-slate-900 transition-all">Voir</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {!netLoading && netSearch.trim() && netResults.length === 0 && <p className="mt-3 text-xs text-slate-400 italic">Aucun résultat pour "{netSearch}"</p>}
                </div>

                {/* Suivi(e)s */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
                    <UserPlus size={16} className="text-primary" />Suivi(e)s
                    {following.length > 0 && <span className="bg-primary/10 text-primary text-xs font-black px-2 py-0.5 rounded-full">{following.length}</span>}
                  </h3>
                  {following.length === 0 ? <p className="text-sm text-slate-400">Vous ne suivez personne encore.</p> : (
                    <div className="divide-y divide-slate-50" onClick={() => setNetMenuId(null)}>
                      {following.map((f) => (
                        <div key={f.user_id} className="flex items-center justify-between py-3 gap-2">
                          <button onClick={() => router.push(`/profile/guide/${f.user_id}`)} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 text-left">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">{f.photo ? <img src={f.photo} alt={f.full_name} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-slate-400">person</span>}</div>
                            <div className="min-w-0"><p className="font-extrabold text-slate-800 text-sm truncate">{f.full_name}</p>{f.sub && <p className="text-xs text-slate-400">{f.sub}</p>}</div>
                          </button>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button onClick={() => router.push(`/profile/guide/${f.user_id}`)} className="px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-bold rounded-xl hover:bg-primary hover:text-slate-900 transition-all">Voir</button>
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => setNetMenuId(netMenuId === `fw-${f.user_id}` ? null : `fw-${f.user_id}`)}
                                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                                <MoreVertical size={15} />
                              </button>
                              {netMenuId === `fw-${f.user_id}` && (
                                <div className="absolute right-0 top-9 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 overflow-hidden py-1">
                                  <button onClick={() => handleNetUnfollow(f.user_id)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                    <UserX size={14} className="text-slate-400" /> Se désabonner
                                  </button>
                                  <button onClick={() => handleNetBlock(f.user_id, true)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-50">
                                    <ShieldBan size={14} /> Bloquer
                                  </button>
                                  <div className="border-t border-slate-100 my-0.5" />
                                  <button onClick={() => { setNetReport({ id: f.user_id, name: f.full_name }); setNetMenuId(null); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                                    <Flag size={14} /> Signaler
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mes abonnés */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
                    <Users size={16} className="text-primary" />Mes abonnés
                    {followers.length > 0 && <span className="bg-primary/10 text-primary text-xs font-black px-2 py-0.5 rounded-full">{followers.length}</span>}
                  </h3>
                  {followers.length === 0 ? <p className="text-sm text-slate-400">Aucun abonné pour l'instant.</p> : (
                    <div className="divide-y divide-slate-50" onClick={() => setNetMenuId(null)}>
                      {followers.map((f) => {
                        const path = f._type === "eco_traveler" ? `/profile/ecovoyageur/${f.user_id}` : f._type === "guide" ? `/profile/guide/${f.user_id}` : `/profile/project-owner/${f.user_id}`;
                        const typeLabel = f._type === "eco_traveler" ? "Éco-Voyageur" : f._type === "guide" ? "Guide" : "Prestataire";
                        return (
                          <div key={f.user_id} className="flex items-center justify-between py-3 gap-2">
                            <button onClick={() => router.push(path)} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 text-left">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">{f.photo ? <img src={f.photo} alt={f.full_name} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-slate-400">person</span>}</div>
                              <div className="min-w-0">
                                <p className="font-extrabold text-slate-800 text-sm truncate">{f.full_name}</p>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{typeLabel}</span>
                              </div>
                            </button>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button onClick={() => router.push(path)} className="px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-bold rounded-xl hover:bg-primary hover:text-slate-900 transition-all">Voir</button>
                              <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => setNetMenuId(netMenuId === `ab-${f.user_id}` ? null : `ab-${f.user_id}`)}
                                  className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                                  <MoreVertical size={15} />
                                </button>
                                {netMenuId === `ab-${f.user_id}` && (
                                  <div className="absolute right-0 top-9 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 overflow-hidden py-1">
                                    <button onClick={async () => {
                                      try { await apiFetch(`/follows/follower/${f.user_id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); setFollowers((prev) => prev.filter((x) => x.user_id !== f.user_id)); } catch {}
                                      setNetMenuId(null);
                                    }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                      <UserX size={14} className="text-slate-400" /> Retirer
                                    </button>
                                    <button onClick={() => handleNetBlock(f.user_id, false)}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-50">
                                      <ShieldBan size={14} /> Bloquer
                                    </button>
                                    <div className="border-t border-slate-100 my-0.5" />
                                    <button onClick={() => { setNetReport({ id: f.user_id, name: f.full_name }); setNetMenuId(null); }}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                                      <Flag size={14} /> Signaler
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "apropos" && (
              <div className="space-y-5">

                {/* ── SECTION PRESTATAIRE ──────────────────────────────────── */}
                <div className="bg-white rounded-3xl border border-slate-100/80 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: 18 }}>person</span>
                    </div>
                    <p className="text-sm font-extrabold text-slate-800">Prestataire</p>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {/* Photo + nom + rôle */}
                    <div className="flex items-center gap-4 px-6 py-5">
                      <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border-2 border-primary/20 shadow-sm">
                        {profile.photo
                          ? <img src={profile.photo} alt="" className="w-full h-full object-cover" />
                          : <span className="material-symbols-outlined text-primary text-2xl">person</span>
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-extrabold text-slate-900 truncate">{profile.full_name || "—"}</p>
                        {profile.position && <p className="text-xs font-semibold text-slate-500 mt-0.5">{profile.position}</p>}
                      </div>
                    </div>
                    {/* Bio personnelle */}
                    {profile.personal_bio && (
                      <div className="px-6 py-4">
                        <p className="text-[10px] font-black text-primary/70 tracking-widest uppercase mb-2">À propos</p>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{profile.personal_bio}</p>
                      </div>
                    )}
                    {/* Expérience */}
                    {profile.years_experience !== null && (
                      <div className="flex items-center gap-4 px-6 py-4">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary" style={{ fontSize: 18 }}>workspace_premium</span>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-0.5">Expérience</p>
                          <p className="text-sm font-bold text-slate-800">{profile.years_experience} an{profile.years_experience > 1 ? "s" : ""}</p>
                        </div>
                      </div>
                    )}
                    {/* Langues */}
                    {(profile.languages_spoken?.length || profile.language) && (
                      <div className="flex items-start gap-4 px-6 py-4">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-primary" style={{ fontSize: 18 }}>translate</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2">Langues parlées</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(profile.languages_spoken?.length
                              ? profile.languages_spoken
                              : profile.language ? [profile.language] : []
                            ).map((l) => (
                              <span key={l} className="bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-1 rounded-full">
                                {{ fr: "Français", ar: "Arabe", en: "Anglais", es: "Espagnol", de: "Allemand", it: "Italien", ber: "Amazigh" }[l] ?? l}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Certifications personnelles */}
                    {profile.personal_certifications?.length ? (
                      <div className="px-6 py-4">
                        <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-3">Certifications personnelles</p>
                        <div className="space-y-2">
                          {profile.personal_certifications.map((cert, i) => (
                            <div key={i} className="flex items-center gap-3 bg-primary/5 border border-primary/10 rounded-xl px-3 py-2.5">
                              <span className="material-symbols-outlined text-primary shrink-0" style={{ fontSize: 16 }}>verified</span>
                              <span className="text-sm font-bold text-slate-700 flex-1 min-w-0 truncate">{cert.name}</span>
                              {cert.document_url && (
                                <button onClick={() => openDoc(cert.document_url!)}
                                  className="text-[10px] font-black text-primary hover:underline shrink-0 bg-primary/10 px-2 py-1 rounded-full">
                                  Voir
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {!profile.full_name && !profile.position && !profile.personal_bio && !profile.years_experience && !profile.language && !profile.languages_spoken?.length && !profile.personal_certifications?.length && (
                      <div className="px-6 py-6 text-center text-slate-400 text-xs font-medium">Aucune information renseignée.</div>
                    )}
                  </div>
                </div>

                {/* ── SECTION ORGANISATION ──────────────────────────────────── */}
                <div className="bg-white rounded-3xl border border-slate-100/80 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 size={16} className="text-primary" />
                    </div>
                    <p className="text-sm font-extrabold text-slate-800">Organisation</p>
                  </div>
                  {org ? (
                    <div className="divide-y divide-slate-50">
                      {/* Logo + nom + type */}
                      <div className="flex items-center gap-4 px-6 py-5">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border border-primary/15 shadow-sm">
                          {org.logo
                            ? <img src={org.logo} alt="" className="w-full h-full object-cover" />
                            : <span className="material-symbols-outlined text-primary text-2xl">store</span>
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-extrabold text-slate-900 truncate">{org.name}</p>
                          {org.provider_type && (() => {
                            const pt = PROVIDER_TYPES.find((t) => t.value === org.provider_type);
                            return pt ? (
                              <span className="inline-flex items-center gap-1 mt-1 bg-primary/10 text-primary text-[10px] font-black px-2.5 py-1 rounded-lg">
                                <span className="material-symbols-outlined" style={{ fontSize: 11 }}>{pt.icon}</span>{pt.label}
                              </span>
                            ) : null;
                          })()}
                        </div>
                      </div>
                      {/* Description */}
                      {org.bio && (
                        <div className="px-6 py-4">
                          <p className="text-[10px] font-black text-primary/70 tracking-widest uppercase mb-2">Description</p>
                          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{org.bio}</p>
                        </div>
                      )}
                      {/* Histoire */}
                      {org.history && (
                        <div className="px-6 py-4">
                          <p className="text-[10px] font-black text-primary/70 tracking-widest uppercase mb-2">Histoire & Origine</p>
                          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{org.history}</p>
                        </div>
                      )}
                      {/* Localisation */}
                      {(org.region || org.country || org.address || org.zone) && (
                        <div className="flex items-start gap-4 px-6 py-4">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <MapPin size={16} className="text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-0.5">Localisation</p>
                            <p className="text-sm font-bold text-slate-800">
                              {[org.address, org.zone, org.region, org.country].filter(Boolean).join(", ")}
                            </p>
                            {org.lat && org.lng && (
                              <div className="mt-3">
                                <LocationMap lat={org.lat} lng={org.lng} address={[org.address, org.zone, org.region].filter(Boolean).join(", ")} />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {/* Contact */}
                      {(org.phone || org.whatsapp || org.email) && (
                        <div className="px-6 py-4 space-y-2">
                          <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-3">Contact</p>
                          {[
                            org.phone    && { icon: "phone", href: `tel:${org.phone}`,                              label: org.phone },
                            org.whatsapp && { icon: "chat",  href: `https://wa.me/${org.whatsapp.replace(/\D/g,"")}`, label: org.whatsapp, ext: true },
                            org.email    && { icon: "email", href: `mailto:${org.email}`,                            label: org.email },
                          ].filter(Boolean).map((item: any, i) => (
                            <a key={i} href={item.href} {...(item.ext ? { target: "_blank", rel: "noreferrer" } : {})}
                              className="flex items-center gap-3 text-sm font-semibold text-primary hover:underline group">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>{item.icon}</span>
                              </div>
                              <span className="truncate">{item.label}</span>
                            </a>
                          ))}
                        </div>
                      )}
                      {/* Réseaux sociaux & site */}
                      {(org.website || org.instagram || org.facebook || org.tiktok) && (
                        <div className="px-6 py-4 space-y-2">
                          <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-3">Présence en ligne</p>
                          {[
                            org.website   && { icon: "language",     href: org.website,                            label: org.website },
                            org.instagram && { icon: "photo_camera", href: socialHref("instagram", org.instagram), label: org.instagram },
                            org.facebook  && { icon: "groups",       href: socialHref("facebook",  org.facebook),  label: org.facebook },
                            org.tiktok    && { icon: "videocam",     href: socialHref("tiktok",    org.tiktok),    label: org.tiktok },
                          ].filter(Boolean).map((item: any, i) => (
                            <a key={i} href={item.href} target="_blank" rel="noreferrer"
                              className="flex items-center gap-3 text-sm font-semibold text-primary hover:underline group">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>{item.icon}</span>
                              </div>
                              <span className="truncate">{item.label}</span>
                            </a>
                          ))}
                        </div>
                      )}
                      {/* Vidéos */}
                      {org.videos?.filter(Boolean).length ? (
                        <div className="px-6 py-4 space-y-2">
                          <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-3">Vidéos</p>
                          {org.videos!.filter(Boolean).map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer"
                              className="flex items-center gap-3 text-sm font-semibold text-primary hover:underline group">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>play_circle</span>
                              </div>
                              <span className="truncate">{url}</span>
                            </a>
                          ))}
                        </div>
                      ) : null}
                      {/* Photos de présentation */}
                      {org.photos?.filter(Boolean).length ? (
                        <div className="px-6 py-4">
                          <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-3">Photos</p>
                          <div className="grid grid-cols-3 gap-2">
                            {org.photos!.filter(Boolean).map((src, i) => (
                              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                                <img src={src} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {/* Certifications org */}
                      {org.certifications?.length ? (
                        <div className="px-6 py-4">
                          <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-3">Certifications</p>
                          <div className="space-y-2">
                            {org.certifications.map((cert, i) => (
                              <div key={i} className="flex items-center gap-3 bg-primary/5 border border-primary/10 rounded-xl px-3 py-2.5">
                                <span className="material-symbols-outlined text-primary shrink-0" style={{ fontSize: 16 }}>verified</span>
                                <span className="text-sm font-bold text-slate-700 flex-1 min-w-0 truncate">{cert.name}</span>
                                {cert.document_url && (
                                  <button onClick={() => openDoc(cert.document_url!)}
                                    className="text-[10px] font-black text-primary shrink-0 bg-primary/10 px-2 py-1 rounded-full hover:bg-primary/20 transition-colors">
                                    Voir
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="px-6 py-8 text-center">
                      <span className="material-symbols-outlined text-slate-200 text-4xl block mb-2">store</span>
                      <p className="text-slate-400 text-xs font-medium">Aucune organisation enregistrée.</p>
                    </div>
                  )}
                </div>

                {/* Activités proposées — même style que ActivityCard */}
                {orgActivities.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                        <Sparkles size={12} className="text-primary" />
                        <span>Activités proposées</span>
                      </h3>
                      <button onClick={() => setActiveTab("activites")}
                        className="text-primary text-[10px] font-black hover:underline flex items-center gap-1">
                        Voir toutes <ArrowRight size={10} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {orgActivities.map((act) => {
                        const meta = findProviderTypeMeta(act.category);
                        const cat = getCategoryByValue(act.category);
                        const isPrimary = act.level === "primary";
                        const allPhotos = Object.values(act.photos ?? {}).flat().filter(Boolean);
                        const firstPhoto = allPhotos[0] ?? null;
                        const subtypeLabels = (act.subtypes ?? []).map((sv) =>
                          cat?.subtypes.find((s) => s.value === sv)?.label ?? sv
                        );

                        return (
                          <div key={act.id} className="bg-white rounded-3xl border border-slate-100/90 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                            {/* Cover */}
                            <div className="relative h-48 w-full overflow-hidden">
                              <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient}`} />
                              {firstPhoto
                                ? <img src={firstPhoto} alt={meta.label} className="absolute inset-0 w-full h-full object-cover" />
                                : <div className="absolute inset-0 flex items-center justify-center select-none opacity-20">
                                    <span className="material-symbols-outlined" style={{ fontSize: 80 }}>{meta.categoryIcon}</span>
                                  </div>
                              }
                              {allPhotos.length > 1 && (
                                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/40 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                                  {allPhotos.length} photos
                                </div>
                              )}
                              <div className={`absolute top-3 left-3 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-xl shadow-md border ${isPrimary ? "bg-primary text-white border-white/20" : "bg-white/95 text-orange-500 border-orange-100"}`}>
                                {isPrimary ? "Principale" : "Secondaire"}
                              </div>
                              <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-xl">
                                <span className="material-symbols-outlined align-middle" style={{ fontSize: 13 }}>{meta.categoryIcon}</span> {meta.categoryLabel}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                              <h3 className="text-lg font-extrabold text-slate-800 tracking-tight mb-1 leading-tight">{meta.label}</h3>
                              {act.years_experience != null && (
                                <p className="text-slate-500 text-sm leading-relaxed mb-2">
                                  {act.years_experience} an{act.years_experience > 1 ? "s" : ""} d'expérience
                                </p>
                              )}
                              {org?.region && (
                                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-3">
                                  <MapPin size={12} /><span>{org.region}</span>
                                </div>
                              )}
                              {/* Subtypes + certifications info block */}
                              {(subtypeLabels.length > 0 || act.certifications?.length > 0) && (
                                <div className="mb-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 space-y-1.5">
                                  {subtypeLabels.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                      {subtypeLabels.map((label) => (
                                        <span key={label} className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full">{label}</span>
                                      ))}
                                    </div>
                                  )}
                                  {act.certifications?.length > 0 && (
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>verified</span>
                                      {act.certifications.length} certification{act.certifications.length > 1 ? "s" : ""}
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="border border-dashed border-primary/40 rounded-xl py-1.5 px-3 mb-3 text-center text-[11px] font-bold text-primary/70">
                                🌿 Évaluer la durabilité
                              </div>
                              <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                                <p className="text-[11px] font-bold text-slate-400">
                                  {isPrimary ? "Activité principale" : "Activité secondaire"}
                                </p>
                                <button
                                  onClick={() => { setViewOrgActivity(act); setOrgActSliderIdx(0); }}
                                  className="text-primary hover:text-primary/80 font-extrabold text-xs inline-flex items-center gap-1 hover:translate-x-1 transition-transform duration-200"
                                >
                                  <span>Voir les détails</span>
                                  <ArrowRight size={14} strokeWidth={2.5} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Activité stats */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100/80 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-4">Activité</p>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: offers.length,              label: "Offres",       icon: "sell",            color: "text-primary   bg-primary/10" },
                      { value: profile.total_reservations, label: "Réservations", icon: "event_available", color: "text-blue-500  bg-blue-50" },
                      { value: profile.feedback_received,  label: "Avis reçus",   icon: "star",            color: "text-amber-500 bg-amber-50" },
                    ].map((s) => (
                      <div key={s.label} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                          <span className="material-symbols-outlined text-base">{s.icon}</span>
                        </div>
                        <p className="text-2xl font-extrabold text-slate-800">{s.value}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score de durabilité */}
                {profile.sustainability_score !== null && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-100/80 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Score de durabilité</p>
                      <span className="text-xl font-extrabold text-primary">{profile.sustainability_score}<span className="text-sm text-slate-400 font-bold">/100</span></span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-700"
                        style={{ width: `${profile.sustainability_score}%` }} />
                    </div>
                    <p className="text-xs font-bold text-slate-500 mt-2">
                      {scoreLabel(profile.sustainability_score)}
                    </p>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      </div>
    </div>

    {/* ══ ACTIVITY TYPE DETAIL / EDIT MODAL ════════════════════════════════ */}
    {actTypeOpen && actTypeCurrent && (() => {
      const meta = findProviderTypeMeta(actTypeCurrent.value);
      const isPrimary = actTypeCurrent.level === "primary";
      const editCategoryData = getCategoryByValue(actTypeEditCategory);
      const editSubtypeSections = SUBTYPE_FIELDS[actTypeEditSubtype]?.sections ?? [];

      function DynFieldInline({ field, value, onChange }: { field: FieldConfig; value: any; onChange: (v: any) => void }) {
        if (field.type === "multiselect" && field.options) {
          const selected: string[] = value || [];
          return (
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{field.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {field.options.map((opt) => (
                  <button key={opt} type="button"
                    onClick={() => onChange(selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt])}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${selected.includes(opt) ? "bg-primary border-primary text-white" : "border-slate-200 text-slate-600 hover:border-primary/40"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          );
        }
        if (field.type === "boolean") return (
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-sm font-semibold text-slate-700">{field.label}</span>
            <button type="button" onClick={() => onChange(!value)} className={`w-11 h-6 rounded-full relative flex-shrink-0 transition-all ${value ? "bg-primary" : "bg-slate-200"}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? "left-5" : "left-0.5"}`} />
            </button>
          </div>
        );
        if (field.type === "textarea") return (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{field.label}</label>
            <textarea className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium resize-none focus:ring-2 focus:ring-primary" value={value || ""} onChange={(e) => onChange(e.target.value)} rows={3} placeholder="Décrivez…" />
          </div>
        );
        if (field.type === "select" && field.options) return (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{field.label}</label>
            <select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary" value={value || ""} onChange={(e) => onChange(e.target.value)}>
              <option value="">Sélectionner…</option>
              {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        );
        return (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{field.label}</label>
            <input type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary"
              value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={field.label} />
          </div>
        );
      }

      return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header gradient */}
            <div className={`relative h-32 bg-gradient-to-br ${meta.gradient} flex-shrink-0`}>
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <span className="material-symbols-outlined" style={{ fontSize: 64 }}>{meta.categoryIcon}</span>
              </div>
              <div className={`absolute top-4 left-4 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-xl ${isPrimary ? "bg-primary text-white" : "bg-white/90 text-orange-500"}`}>
                {isPrimary ? "Principale" : "Secondaire"}
              </div>
              <button onClick={() => setActTypeOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1">
              {/* Title bar */}
              <div className="px-7 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{meta.categoryIcon}</span> {meta.categoryLabel}
                  </p>
                  <h2 className="text-xl font-extrabold text-slate-800">{meta.label}</h2>
                  {profile?.region && <p className="flex items-center gap-1 text-slate-400 text-xs mt-1"><MapPin size={11} />{profile.region}</p>}
                </div>
                {actTypeMode === "view" && (
                  <button onClick={() => setActTypeMode("edit")} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary text-xs font-bold transition-all">
                    <Edit3 size={12} />Modifier
                  </button>
                )}
              </div>

              {actTypeMode === "view" ? (
                <div className="px-7 py-5 space-y-4">
                  {profile?.bio && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2">Description</p>
                      <p className="text-slate-600 text-sm leading-relaxed">{profile.bio}</p>
                    </div>
                  )}
                  {profile?.sustainability_score !== null && profile?.sustainability_score !== undefined && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Durabilité</p>
                        <span className="text-sm font-extrabold text-primary">{profile.sustainability_score}/100</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${profile.sustainability_score}%` }} />
                      </div>
                    </div>
                  )}
                  {SUBTYPE_FIELDS[actTypeCurrent.value]?.sections.map((sec, si) => (
                    <div key={si} className="rounded-2xl border border-slate-100 overflow-hidden">
                      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                        <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">{sec.section}</p>
                      </div>
                      <div className="px-4 py-3">
                        <p className="text-slate-400 text-xs">Aucune information renseignée — cliquez sur Modifier pour compléter.</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-7 py-5 space-y-5">
                  {/* Category selector */}
                  <div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Catégorie</p>
                    <div className="flex flex-wrap gap-2">
                      {PROVIDER_SCHEMA.map((cat) => (
                        <button key={cat.value} type="button"
                          onClick={() => { setActTypeEditCategory(cat.value); setActTypeEditSubtype(""); setActTypeEditDynFields({}); }}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-bold border-2 transition-all ${actTypeEditCategory === cat.value ? "bg-primary border-primary text-white" : "border-slate-200 text-slate-600 hover:border-primary/40"}`}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{cat.icon}</span> {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subtype selector */}
                  {editCategoryData && (
                    <div>
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                        Sous-type — <span className="material-symbols-outlined align-middle" style={{ fontSize: 15 }}>{editCategoryData.icon}</span> {editCategoryData.label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {editCategoryData.subtypes.map((st) => (
                          <button key={st.value} type="button"
                            onClick={() => { setActTypeEditSubtype(st.value); setActTypeEditDynFields({}); }}
                            className={`px-3.5 py-2 rounded-full text-sm font-bold border-2 transition-all ${actTypeEditSubtype === st.value ? "bg-primary border-primary text-white" : "border-slate-200 text-slate-600 hover:border-primary/40"}`}>
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic field sections */}
                  {editSubtypeSections.map((sec, si) => (
                    <div key={si} className="rounded-2xl border border-slate-100 overflow-hidden">
                      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                        <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">{sec.section}</p>
                      </div>
                      <div className="p-4 space-y-4">
                        {sec.fields
                          .filter((f) => !f.dependsOn || actTypeEditDynFields[f.dependsOn.field] === f.dependsOn.value)
                          .map((field) => (
                            <DynFieldInline key={field.key} field={field} value={actTypeEditDynFields[field.key]}
                              onChange={(v) => setActTypeEditDynFields((prev) => ({ ...prev, [field.key]: v }))} />
                          ))}
                      </div>
                    </div>
                  ))}

                  {actTypeSaveError && <p className="text-xs text-red-500 font-semibold">{actTypeSaveError}</p>}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-7 py-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
              {actTypeMode === "edit" ? (
                <>
                  <button onClick={() => setActTypeMode("view")} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm font-bold transition-colors">
                    <ArrowLeft size={14} />Retour
                  </button>
                  <button onClick={saveActivityType} disabled={actTypeSaving || !actTypeEditSubtype}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50 shadow-sm">
                    {actTypeSaving ? "Sauvegarde…" : <><Check size={14} />Enregistrer</>}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setActTypeOpen(false)} className="text-slate-500 hover:text-slate-700 text-sm font-bold">Fermer</button>
                  <button onClick={() => setActTypeMode("edit")} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary/90 shadow-sm">
                    <Edit3 size={14} />Modifier
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      );
    })()}

    {/* ══ OFFER SUSTAINABILITY QUESTIONNAIRE ═══════════════════════════════ */}
    {oqOpen && (() => {
      const oqScore = Object.values(oqAnswers).reduce((s, v) => s + v, 0);
      const oqCurrentStep = OFFER_SUSTAINABILITY_STEPS[oqStep];
      const oqStepAnswered = oqCurrentStep ? oqCurrentStep.questions.every((q) => q.id in oqAnswers) : false;
      return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-7 pt-7 pb-5 border-b border-slate-100 shrink-0">
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">Évaluation de durabilité — Offre</p>
              <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                {oqStep < OFFER_SUSTAINABILITY_STEPS.length ? <>{OFFER_SUSTAINABILITY_STEPS[oqStep].emoji} {OFFER_SUSTAINABILITY_STEPS[oqStep].category}</> : "🎯 Résultat"}
              </h2>
              {oqStep < OFFER_SUSTAINABILITY_STEPS.length && (
                <p className="text-sm text-slate-500 mt-1">{OFFER_SUSTAINABILITY_STEPS[oqStep].description}</p>
              )}
              <div className="flex gap-1.5 mt-4">
                {OFFER_SUSTAINABILITY_STEPS.map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < oqStep ? "bg-primary" : i === oqStep ? "bg-primary/60" : "bg-slate-100"}`} />
                ))}
              </div>
              <p className="text-[10px] font-bold text-slate-400 mt-1.5">
                {oqStep < OFFER_SUSTAINABILITY_STEPS.length ? `Étape ${oqStep + 1} / ${OFFER_SUSTAINABILITY_STEPS.length}` : "Toutes les étapes complétées"}
              </p>
            </div>

            <div className="overflow-y-auto flex-1 px-7 py-5">
              {oqStep < OFFER_SUSTAINABILITY_STEPS.length ? (
                <div className="space-y-5">
                  {OFFER_SUSTAINABILITY_STEPS[oqStep].questions.map((q) => (
                    <div key={q.id}>
                      <p className="text-sm font-bold text-slate-700 mb-2">{q.text}</p>
                      <div className="space-y-2">
                        {q.options.map((opt) => (
                          <button key={opt.label} onClick={() => setOqAnswers((a) => ({ ...a, [q.id]: opt.value }))}
                            className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${oqAnswers[q.id] === opt.value ? "border-primary bg-primary/10 text-primary" : "border-slate-200 text-slate-600 hover:border-primary/40"}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3 pt-2">
                    {oqStep > 0 && (
                      <button onClick={() => setOqStep((s) => s - 1)} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                        <ChevronLeft size={16} /> Précédent
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (oqStep === OFFER_SUSTAINABILITY_STEPS.length - 1) {
                          setOqStep((s) => s + 1);
                          submitOfferQuestionnaire();
                        } else {
                          setOqStep((s) => s + 1);
                        }
                      }}
                      disabled={!oqStepAnswered}
                      className={`flex-1 py-3 font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all ${oqStepAnswered ? "bg-primary text-slate-900 hover:bg-primary/90" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                    >
                      {oqStep === OFFER_SUSTAINABILITY_STEPS.length - 1 ? "Voir mon score" : "Suivant"}
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  {(() => {
                    const level = getOfferSustainabilityLevel(oqScore);
                    return (
                      <>
                        <div className="relative w-36 h-36 mx-auto mb-6">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                            <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 50}`}
                              strokeDashoffset={`${2 * Math.PI * 50 * (1 - oqScore / 100)}`}
                              className="text-primary transition-all duration-1000"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-slate-900">{oqScore}</span>
                            <span className="text-xs font-bold text-slate-400">/100</span>
                          </div>
                        </div>

                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${level.bg} mb-3`}>
                          <span className="text-base">{level.emoji}</span>
                          <span className={`font-extrabold text-sm ${level.color}`}>{level.label}</span>
                        </div>

                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                          {oqScore >= 71
                            ? "Excellente offre éco-responsable ! Vous montrez l'exemple."
                            : oqScore >= 51
                            ? "Votre offre est sur la bonne voie. Continuez vos efforts !"
                            : "Ce questionnaire vous aide à identifier les axes d'amélioration."}
                        </p>

                        <div className="space-y-2 mb-6 text-left">
                          {OFFER_SUSTAINABILITY_STEPS.map((step) => {
                            const catScore = step.questions.reduce((sum, q) => sum + (oqAnswers[q.id] ?? 0), 0);
                            const catMax   = step.questions.reduce((sum, q) => sum + Math.max(...q.options.map((o) => o.value)), 0);
                            return (
                              <div key={step.category} className="flex items-center gap-3">
                                <span className="text-base w-6 shrink-0">{step.emoji}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between mb-0.5">
                                    <span className="text-xs font-bold text-slate-600 truncate">{step.category}</span>
                                    <span className="text-xs font-black text-slate-700 shrink-0 ml-2">{catScore}/{catMax}</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: `${catMax > 0 ? (catScore / catMax) * 100 : 0}%` }} />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => setOqOpen(false)}
                          disabled={oqSaving}
                          className="w-full py-3 bg-primary text-slate-900 font-extrabold rounded-xl hover:bg-primary/90 transition-colors"
                        >
                          {oqSaving ? "Enregistrement…" : "Fermer"}
                        </button>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    })()}
    </>
  );
}
