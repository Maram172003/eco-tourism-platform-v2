"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Plus, Edit3, ShieldCheck, MapPin, Calendar, Leaf, ArrowLeft,
  LayoutGrid, Tag, Users, Info, Sparkles, ArrowRight, Send, X, Search, UserPlus,
  Clock, ChevronLeft, ChevronRight, Check, Globe, Star, BookOpen,
  MoreVertical, UserX, ShieldBan, Flag,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import MessagerieWidget from "@/components/MessagerieWidget";
import PubInteractions from "@/components/PubInteractions";

const MapPicker = dynamic(() => import("@/components/map/MapPicker"),
  { ssr: false, loading: () => <div className="h-[268px] rounded-2xl bg-slate-100 animate-pulse" /> }
);
const MapView = dynamic(() => import("@/components/map/MapView"),
  { ssr: false, loading: () => <div className="h-[220px] rounded-xl bg-slate-100 animate-pulse" /> }
);

// ─── MeetingMap: shows map from coords or geocodes from address ───────────────

function MeetingMap({ lat, lng, address }: { lat: number | null; lng: number | null; address: string }) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    lat && lng ? { lat: Number(lat), lng: Number(lng) } : null
  );
  const [geocoding, setGeocoding] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (coords) return;
    if (!address) return;
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
  return <MapView lat={coords.lat} lng={coords.lng} />;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type GuideProfile = {
  user_id: string; full_name: string; bio: string | null;
  guide_type: string | null; photo: string | null; cover_photo: string | null;
  country: string | null; language: string | null; zone: string | null;
  specialties: string[] | null; languages_spoken: string[] | null;
  years_experience: number | null;
  sustainability_score: number | null;
  feedback_received: number; reservations_handled: number;
  skills_activities: string[]; skills_landscapes: string[]; certifications: string[];
  badges: { label: string; obtained_at: string }[];
};

type Offer = {
  id: string; title: string; description: string | null;
  price: number | null; duration: string | null;
  offer_type: string | null; status: string; created_at: string;
  region: string | null; inclusions: string | null; meeting_point: string | null;
  meeting_lat: number | null; meeting_lng: number | null;
  min_group_size: number | null; max_group_size: number | null;
  min_age: number | null; cancellation_policy: string | null;
  sustainability_score: number | null;
  images?: string[] | null; cover_image?: string | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const OFFER_TYPES = [
  { value: "eco_tour",  label: "Éco-Tour",  icon: "hiking",         gradient: "from-emerald-500 to-teal-400" },
  { value: "activity",  label: "Activité",  icon: "sports",         gradient: "from-orange-500 to-amber-400" },
  { value: "workshop",  label: "Atelier",   icon: "school",         gradient: "from-violet-500 to-purple-400" },
  { value: "transfer",  label: "Transfert", icon: "directions_car", gradient: "from-blue-500 to-cyan-400" },
];

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

const COUNTRY_LABELS: Record<string, string> = {
  TN: "Tunisie", MA: "Maroc", DZ: "Algérie", FR: "France", OTHER: "Autre",
};

const LANG_LABELS: Record<string, string> = {
  fr: "Français", ar: "Arabe", en: "Anglais", es: "Espagnol", de: "Allemand", it: "Italien",
};

const GUIDE_TYPE_LABELS: Record<string, string> = {
  local: "Guide Local", professionnel: "Guide Professionnel",
};

const SPECIALTIES_LIST = [
  { value: "randonnee",    label: "Randonnée" },
  { value: "ornithologie", label: "Ornithologie" },
  { value: "photographie", label: "Photographie" },
  { value: "culture",      label: "Culture & Patrimoine" },
  { value: "gastronomie",  label: "Gastronomie" },
  { value: "kayak",        label: "Kayak & Sports nautiques" },
  { value: "speleologie",  label: "Spéléologie" },
  { value: "vtt",          label: "VTT & Cyclisme" },
  { value: "safari",       label: "Safari photo" },
  { value: "astronomie",   label: "Astronomie" },
];

const LANDSCAPES_LIST = [
  { value: "mountain",    label: "Montagne" },
  { value: "desert",      label: "Désert" },
  { value: "sea",         label: "Mer & Côte" },
  { value: "forest",      label: "Forêt" },
  { value: "oasis",       label: "Oasis" },
  { value: "village",     label: "Villages" },
  { value: "archaeology", label: "Sites archéologiques" },
  { value: "lake",        label: "Lacs & Zones humides" },
];

const CERTIFICATIONS_LIST = [
  "Guide certifié Éco-Voyage",
  "Premiers secours (PSC1)",
  "Guide de montagne agréé",
  "Formation éco-tourisme",
  "Brevet de guide touristique",
  "Certification environnement",
];

const LANGUAGES_LIST = [
  { value: "fr", label: "Français" }, { value: "ar", label: "Arabe" },
  { value: "en", label: "Anglais" }, { value: "es", label: "Espagnol" },
  { value: "de", label: "Allemand" }, { value: "it", label: "Italien" },
];

type Tab = "tout" | "offres" | "reseau" | "apropos";

// ─── Botanical SVG Cover ──────────────────────────────────────────────────────

function BotanicalCover() {
  return (
    <div className="relative h-48 md:h-64 lg:h-72 w-full bg-gradient-to-br from-teal-100 via-emerald-50 to-slate-100 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 1200 300"
        xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
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

export default function GuideProfilePage() {
  const router = useRouter();

  const [profile,   setProfile]   = useState<GuideProfile | null>(null);
  const [offers,    setOffers]    = useState<Offer[]>([]);
  const [token,     setToken]     = useState("");
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("tout");
  type NetUser = { user_id: string; full_name: string; photo: string | null; _type: string; sub?: string | null };
  const [following,      setFollowing]      = useState<NetUser[]>([]);
  const [followers,      setFollowers]      = useState<NetUser[]>([]);
  const [netLoaded,      setNetLoaded]      = useState(false);
  const [netSearch,      setNetSearch]      = useState("");
  const [netResults,     setNetResults]     = useState<NetUser[]>([]);
  const [netLoading,     setNetLoading]     = useState(false);
  const [netMenuId,      setNetMenuId]      = useState<string | null>(null);
  const [netReport,      setNetReport]      = useState<{ id: string; name: string } | null>(null);
  const [netReportReason,setNetReportReason]= useState("");
  const [netReportSending,setNetReportSending]=useState(false);
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
  const [oqOpen,    setOqOpen]    = useState(false);
  const [oqOfferId, setOqOfferId] = useState("");
  const [oqStep,    setOqStep]    = useState(0);
  const [oqAnswers, setOqAnswers] = useState<Record<string, number>>({});
  const [oqSaving,  setOqSaving]  = useState(false);
  const [editCoverIdx,   setEditCoverIdx]   = useState(0);
  const [showEditMap,    setShowEditMap]    = useState(false);
  const [editMapLat,     setEditMapLat]     = useState<number | null>(null);
  const [editMapLng,     setEditMapLng]     = useState<number | null>(null);

  // ── Edit profile modal ───────────────────────────────────────────────────
  const [editProfileOpen,    setEditProfileOpen]    = useState(false);
  const [editProfileForm,    setEditProfileForm]    = useState({ full_name: "", bio: "", country: "", language: "", guide_type: "", zone: "", years_experience: "" });
  const [editProfilePhoto,   setEditProfilePhoto]   = useState<{ file?: File; preview: string } | null>(null);
  const [editProfileCover,   setEditProfileCover]   = useState<{ file?: File; preview: string } | null>(null);
  const [editSpecialties,    setEditSpecialties]    = useState<string[]>([]);
  const [editLangsSpoken,    setEditLangsSpoken]    = useState<string[]>([]);
  const [editLandscapes,     setEditLandscapes]     = useState<string[]>([]);
  const [editCertifications, setEditCertifications] = useState<string>("");
  const [editProfileSaving,  setEditProfileSaving]  = useState(false);
  const [editProfileError,   setEditProfileError]   = useState("");

  useEffect(() => {
    async function init() {
      const tkn = localStorage.getItem("access_token");
      if (!tkn) { router.push("/auth/login"); return; }
      setToken(tkn);
      try {
        const [p, myOffers] = await Promise.all([
          apiFetch<GuideProfile>("/guide/profile", { headers: { Authorization: `Bearer ${tkn}` } }),
          apiFetch<Offer[]>("/offers/mine", { headers: { Authorization: `Bearer ${tkn}` } }).catch(() => [] as Offer[]),
        ]);
        setProfile(p);
        const offersWithCover = myOffers.map((o) => {
          const validImages = o.images?.filter((url) => url.startsWith("http")) ?? null;
          return { ...o, images: validImages?.length ? validImages : null, cover_image: o.cover_image ?? validImages?.[0] ?? null };
        });
        setOffers(offersWithCover);
        // Load network in background
        Promise.all([
          apiFetch<NetUser[]>("/follows/following/profiles", { headers: { Authorization: `Bearer ${tkn}` } }).catch(() => []),
          apiFetch<NetUser[]>("/follows/followers/profiles", { headers: { Authorization: `Bearer ${tkn}` } }).catch(() => []),
        ]).then(([fwing, fwers]) => {
          setFollowing(fwing); setFollowers(fwers); setNetLoaded(true);
        });
      } catch {
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  // Network search — project-owners
  useEffect(() => {
    if (!netSearch.trim() || !token) { setNetResults([]); return; }
    const t = setTimeout(() => {
      setNetLoading(true);
      apiFetch<any[]>(`/project-owner/public/search?q=${encodeURIComponent(netSearch)}`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => setNetResults(r.map((o) => ({ user_id: o.user_id, full_name: o.full_name, photo: o.photo, _type: "project", sub: o.organization ?? null }))))
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
      method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd,
    });
    if (!res.ok) throw new Error("Upload échoué");
    const data = await res.json();
    return data.url as string;
  }

  // ── Score label ─────────────────────────────────────────────────────────
  const scoreLabel = (score: number | null) => {
    if (score === null) return "Guide";
    if (score >= 80) return "Guide Ambassadeur";
    if (score >= 60) return "Guide Expert";
    if (score >= 40) return "Guide Engagé";
    return "Guide en Formation";
  };

  // ── Publish modal ──────────────────────────────────────────────────────────

  function openModal() {
    setForm({ title: "", offer_type: "", description: "", price: "", duration: "", region: "", inclusions: "", meeting_point: "", min_group_size: "", max_group_size: "", min_age: "", cancellation_policy: "" });
    setTitleError(""); setPublishError("");
    setPublishImages([]); setPublishCoverIdx(0);
    setShowPublishMap(false); setPublishMapLat(null); setPublishMapLng(null);
    setModalOpen(true);
  }

  function closeModal() {
    setPublishImages((prev) => { prev.forEach((img) => URL.revokeObjectURL(img.preview)); return []; });
    setPublishCoverIdx(0);
    setModalOpen(false);
    setTitleError(""); setPublishError("");
  }

  async function handlePublish(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title.trim()) { setTitleError("Le titre est obligatoire."); return; }
    setPublishError(""); setPublishing(true);
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
          inclusions: form.inclusions.trim() || undefined,
          meeting_point: form.meeting_point.trim() || undefined,
          meeting_lat: publishMapLat ?? undefined,
          meeting_lng: publishMapLng ?? undefined,
          min_group_size: form.min_group_size ? Number(form.min_group_size) : undefined,
          max_group_size: form.max_group_size ? Number(form.max_group_size) : undefined,
          min_age: form.min_age ? Number(form.min_age) : undefined,
          cancellation_policy: form.cancellation_policy.trim() || undefined,
        }),
      });
      let finalOffer: Offer = created;
      if (publishImages.length > 0) {
        try {
          const urls = await Promise.all(publishImages.map((img) => uploadImage(img.file)));
          const cover = urls[publishCoverIdx] ?? urls[0];
          const ordered = [cover, ...urls.filter((u) => u !== cover)];
          await apiFetch<Offer>(`/offers/${created.id}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ images: ordered }),
          });
          finalOffer = { ...finalOffer, images: ordered, cover_image: cover };
        } catch { /* upload failed */ }
      }
      setOffers((prev) => [finalOffer, ...prev]);
      closeModal();
      setOqOfferId(finalOffer.id); setOqStep(0); setOqAnswers({}); setOqOpen(true);
    } catch (err: any) {
      setPublishError(err.message || "Erreur lors de la publication.");
    } finally {
      setPublishing(false);
    }
  }

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
    } catch {
      // silent — score shown, user closes manually
    } finally {
      setOqSaving(false);
    }
  }

  // ── Offer detail / edit modal ──────────────────────────────────────────────

  function openEditModal(offer: Offer) {
    setViewOffer(offer);
    setEditOfferId(offer.id);
    setEditForm({
      title: offer.title, offer_type: offer.offer_type ?? "", description: offer.description ?? "",
      price: offer.price !== null ? String(offer.price) : "", duration: offer.duration ?? "",
      status: offer.status, region: offer.region ?? "", inclusions: offer.inclusions ?? "", meeting_point: offer.meeting_point ?? "",
      min_group_size: offer.min_group_size !== null ? String(offer.min_group_size) : "",
      max_group_size: offer.max_group_size !== null ? String(offer.max_group_size) : "",
      min_age: offer.min_age !== null ? String(offer.min_age) : "",
      cancellation_policy: offer.cancellation_policy ?? "",
    });
    const imgs = (offer.images?.filter((s) => s.startsWith("http")) ?? []);
    setEditImages(imgs.map((src) => ({ src })));
    setEditCoverIdx(0);
    setEditTitleError(""); setEditError("");
    setEditMode(false); setSliderIdx(0);
    setShowEditMap(false);
    setEditMapLat(offer.meeting_lat ?? null);
    setEditMapLng(offer.meeting_lng ?? null);
    setEditModalOpen(true);
  }

  function closeEditModal() {
    setEditModalOpen(false); setEditMode(false); setViewOffer(null);
    setEditTitleError(""); setEditError("");
    setShowEditMap(false); setEditMapLat(null); setEditMapLng(null);
  }

  async function handleDeleteOffer() {
    if (!viewOffer) return;
    if (!confirm(`Supprimer l'offre "${viewOffer.title}" ? Cette action est irréversible.`)) return;
    setOfferDeleting(true);
    try {
      await apiFetch(`/offers/${viewOffer.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setOffers((prev) => prev.filter((o) => o.id !== viewOffer.id));
      closeEditModal();
    } catch { alert("Erreur lors de la suppression."); }
    finally { setOfferDeleting(false); }
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
          title: editForm.title.trim(), offer_type: editForm.offer_type || undefined,
          description: editForm.description.trim() || undefined,
          price: editForm.price ? Number(editForm.price) : undefined,
          duration: editForm.duration.trim() || undefined,
          region: editForm.region.trim() || undefined,
          inclusions: editForm.inclusions.trim() || undefined,
          meeting_point: editForm.meeting_point.trim() || undefined,
          meeting_lat: editMapLat ?? undefined,
          meeting_lng: editMapLng ?? undefined,
          min_group_size: editForm.min_group_size ? Number(editForm.min_group_size) : undefined,
          max_group_size: editForm.max_group_size ? Number(editForm.max_group_size) : undefined,
          min_age: editForm.min_age ? Number(editForm.min_age) : undefined,
          cancellation_policy: editForm.cancellation_policy.trim() || undefined,
          status: editForm.status,
        }),
      });
      const finalImageSrcs = (await Promise.all(
        editImages.map(async (img) => {
          if (img.file) { try { return await uploadImage(img.file); } catch { return null; } }
          return img.src.startsWith("http") ? img.src : null;
        })
      )).filter((url): url is string => url !== null);
      const coverSrc = finalImageSrcs[editCoverIdx] ?? finalImageSrcs[0] ?? null;
      const orderedImages = coverSrc
        ? [coverSrc, ...finalImageSrcs.filter((_, i) => i !== finalImageSrcs.indexOf(coverSrc))]
        : finalImageSrcs;
      await apiFetch<Offer>(`/offers/${editOfferId}`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ images: orderedImages.length ? orderedImages : [] }),
      }).catch(() => {});
      const finalUpdated: Offer = { ...updated, images: finalImageSrcs.length ? finalImageSrcs : null, cover_image: orderedImages[0] ?? null };
      setOffers((prev) => prev.map((o) => o.id === editOfferId ? finalUpdated : o));
      setViewOffer(finalUpdated);
      setEditMode(false);
    } catch (err: any) {
      setEditError(err.message || "Erreur lors de la sauvegarde.");
    } finally { setEditSaving(false); }
  }

  // ── Edit profile ─────────────────────────────────────────────────────────

  function openEditProfile() {
    if (!profile) return;
    setEditProfileForm({
      full_name:      profile.full_name    ?? "",
      bio:            profile.bio          ?? "",
      country:        profile.country      ?? "",
      language:       profile.language     ?? "",
      guide_type:     profile.guide_type   ?? "",
      zone:           profile.zone         ?? "",
      years_experience: profile.years_experience !== null ? String(profile.years_experience) : "",
    });
    setEditProfilePhoto(profile.photo       ? { preview: profile.photo }       : null);
    setEditProfileCover(profile.cover_photo ? { preview: profile.cover_photo } : null);
    setEditSpecialties(profile.skills_activities ?? profile.specialties ?? []);
    setEditLangsSpoken(profile.languages_spoken ?? []);
    setEditLandscapes(profile.skills_landscapes ?? []);
    setEditCertifications((profile.certifications ?? []).join("\n"));
    setEditProfileError("");
    setEditProfileOpen(true);
  }

  function closeEditProfile() { setEditProfileOpen(false); setEditProfileError(""); }

  async function handleSaveProfile(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editProfileForm.full_name.trim()) { setEditProfileError("Le nom complet est obligatoire."); return; }
    setEditProfileError(""); setEditProfileSaving(true);
    try {
      let photoUrl: string | undefined = profile?.photo ?? undefined;
      let coverUrl: string | undefined = profile?.cover_photo ?? undefined;
      if (editProfilePhoto?.file) photoUrl = await uploadImage(editProfilePhoto.file);
      else if (editProfilePhoto === null) photoUrl = undefined;
      if (editProfileCover?.file) coverUrl = await uploadImage(editProfileCover.file);
      else if (editProfileCover === null) coverUrl = undefined;

      const certs = editCertifications.split("\n").map((s) => s.trim()).filter(Boolean);

      const [updated] = await Promise.all([
        apiFetch<GuideProfile>("/guide/profile", {
          method: "POST", headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            full_name:   editProfileForm.full_name.trim(),
            bio:         editProfileForm.bio.trim()    || undefined,
            country:     editProfileForm.country       || undefined,
            language:    editProfileForm.language      || undefined,
            photo:       photoUrl,
            cover_photo: coverUrl,
            guide_type:  editProfileForm.guide_type   || undefined,
            zone:        editProfileForm.zone.trim()  || undefined,
          }),
        }),
        apiFetch("/guide/specialties", {
          method: "PATCH", headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ specialties: editSpecialties, languages_spoken: editLangsSpoken }),
        }).catch(() => {}),
        apiFetch("/guide/experience", {
          method: "PATCH", headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            years_experience: editProfileForm.years_experience ? Number(editProfileForm.years_experience) : 0,
            landscapes: editLandscapes,
            certifications: certs,
          }),
        }).catch(() => {}),
      ]);

      setProfile((prev) => prev ? {
        ...prev, ...updated,
        photo: photoUrl ?? null, cover_photo: coverUrl ?? null,
        skills_activities: editSpecialties,
        languages_spoken:  editLangsSpoken,
        skills_landscapes: editLandscapes,
        certifications:    certs,
        years_experience:  editProfileForm.years_experience ? Number(editProfileForm.years_experience) : null,
      } : prev);
      setEditProfileOpen(false);
    } catch (err: any) {
      setEditProfileError(err.message || "Erreur lors de la sauvegarde.");
    } finally { setEditProfileSaving(false); }
  }

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!profile) return null;

  const AvatarImg = () =>
    profile.photo ? (
      <img src={profile.photo} alt="" className="w-full h-full object-cover" />
    ) : (
      <span className="material-symbols-outlined text-primary text-5xl">person</span>
    );

  const roleLabel = profile.guide_type
    ? GUIDE_TYPE_LABELS[profile.guide_type] ?? profile.guide_type
    : scoreLabel(profile.sustainability_score);

  // ─── Offer card ─────────────────────────────────────────────────────────────
  const OfferCard = ({ offer }: { offer: Offer }) => {
    const typeData = OFFER_TYPES.find((t) => t.value === offer.offer_type) ?? OFFER_TYPES[0];
    const statusLabel = offer.status === "approved" ? "Active" : offer.status === "pending" ? "En attente" : "Refusée";
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
                {offer.duration && <span className="text-slate-400 text-[10px] font-bold block leading-none">/{offer.duration}</span>}
              </div>
            )}
          </div>
          <div className="lg:w-3/5 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-lg md:text-xl font-extrabold text-slate-800 tracking-tight leading-tight">{offer.title}</h3>
              </div>
              {offer.description && <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-3">{offer.description}</p>}
              <div className="flex flex-wrap gap-2.5 mb-4">
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100/60 rounded-xl px-3 py-1 text-[11px] font-extrabold tracking-wider flex items-center gap-1 uppercase">
                  <Sparkles size={11} className="text-emerald-500 shrink-0" />{typeData.label}
                </span>
              </div>
              {offer.sustainability_score !== null ? (
                <div className="mb-1">
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
                  className="w-full border border-dashed border-primary/40 text-primary text-[11px] font-bold py-1.5 rounded-xl hover:bg-primary/5 transition-colors mb-1"
                >
                  🌿 Évaluer la durabilité
                </button>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-3">
              <p className="text-[11px] font-bold text-slate-400">
                {new Date(offer.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <button onClick={() => openEditModal(offer)}
                className="text-primary hover:text-primary/80 font-extrabold text-xs inline-flex items-center gap-1 hover:translate-x-1 transition-transform duration-200">
                <span>Voir les détails</span><ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
        {offer.status === "approved" && (
          <PubInteractions
            pubId={offer.id}
            token={token}
            viewerId={profile?.user_id ?? ""}
            shareUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/profile/guide/${profile?.user_id}?offer=${offer.id}`}
            pubTitle={offer.title}
            itemApiBase="/interactions/offer"
            commentApiBase="/interactions"
          />
        )}
      </div>
    );
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
    {/* ══ MODAL SIGNALEMENT RÉSEAU ═══════════════════════════════════════════ */}
    {netReport && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <Flag size={16} className="text-red-500" />
            </div>
            <div>
              <p className="font-extrabold text-slate-800 text-sm">Signaler {netReport.name}</p>
              <p className="text-xs text-slate-400">Choisissez un motif</p>
            </div>
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
            <button onClick={() => { setNetReport(null); setNetReportReason(""); }}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Annuler</button>
            <button onClick={handleNetReport} disabled={!netReportReason || netReportSending}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-50">
              {netReportSending ? "Envoi…" : "Signaler"}
            </button>
          </div>
        </div>
      </div>
    )}
    <div className="min-h-screen bg-slate-50/70 pb-20" onClick={() => setNetMenuId(null)}>

      {/* ══ TOP NAV ══════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all">
            <ArrowLeft size={16} />Retour
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
                  <p className="text-slate-400 text-xs mt-0.5">Mettez à jour vos informations de guide</p>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              <form id="edit-profile-form" onSubmit={handleSaveProfile} className="px-8 py-6 space-y-5">

                {/* Cover */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Photo de couverture</label>
                  <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-100 via-emerald-50 to-slate-100 border-2 border-dashed border-slate-200 group">
                    {editProfileCover
                      ? <img src={editProfileCover.preview} alt="" className="w-full h-full object-cover" />
                      : <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-slate-300 text-3xl">add_photo_alternate</span>
                          <p className="text-xs font-semibold text-slate-400">Ajouter une photo de couverture</p>
                        </div>
                    }
                    <label htmlFor="cover-upload" className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all cursor-pointer">
                      <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 text-3xl transition-opacity">edit</span>
                    </label>
                    <input id="cover-upload" type="file" accept="image/*" className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]; if (!file) return;
                        if (editProfileCover?.file) URL.revokeObjectURL(editProfileCover.preview);
                        setEditProfileCover({ file, preview: URL.createObjectURL(file) });
                        e.target.value = "";
                      }}
                    />
                    {editProfileCover && (
                      <button type="button"
                        onClick={() => { if (editProfileCover.file) URL.revokeObjectURL(editProfileCover.preview); setEditProfileCover(null); }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center z-10">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Photo de profil */}
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
                      <label htmlFor="photo-upload" className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all cursor-pointer">
                        <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 text-xl transition-opacity">edit</span>
                      </label>
                      <input id="photo-upload" type="file" accept="image/*" className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]; if (!file) return;
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

                {/* Nom */}
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
                  <textarea rows={3} placeholder="Guide spécialisé en écotourisme dans le sud tunisien…"
                    value={editProfileForm.bio}
                    onChange={(e) => setEditProfileForm((f) => ({ ...f, bio: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white resize-none placeholder:text-slate-400"
                  />
                </div>

                {/* Pays + Langue */}
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
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Langue principale</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">translate</span>
                      <select value={editProfileForm.language}
                        onChange={(e) => setEditProfileForm((f) => ({ ...f, language: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white appearance-none">
                        <option value="">Sélectionner</option>
                        {LANGUAGES_LIST.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Type de guide + Zone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Type de guide</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">badge</span>
                      <select value={editProfileForm.guide_type}
                        onChange={(e) => setEditProfileForm((f) => ({ ...f, guide_type: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white appearance-none">
                        <option value="">Sélectionner</option>
                        <option value="local">Guide Local</option>
                        <option value="professionnel">Guide Professionnel</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Zone d'activité</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">map</span>
                      <input type="text" placeholder="Sahara, Djerba, Cap Bon…"
                        value={editProfileForm.zone}
                        onChange={(e) => setEditProfileForm((f) => ({ ...f, zone: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Années d'expérience */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Années d'expérience</label>
                  <div className="relative">
                    <Star size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="number" min="0" max="50" placeholder="5"
                      value={editProfileForm.years_experience}
                      onChange={(e) => setEditProfileForm((f) => ({ ...f, years_experience: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Spécialités */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Spécialités</label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTIES_LIST.map(({ value, label }) => {
                      const active = editSpecialties.includes(value);
                      return (
                        <button key={value} type="button"
                          onClick={() => setEditSpecialties((prev) => active ? prev.filter((x) => x !== value) : [...prev, value])}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${active ? "bg-primary/10 border-primary text-primary" : "bg-slate-50 border-slate-200 text-slate-500 hover:border-primary/40"}`}>
                          {active && <Check size={10} className="inline mr-1" />}{label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Langues parlées */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Langues parlées</label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES_LIST.map(({ value, label }) => {
                      const active = editLangsSpoken.includes(value);
                      return (
                        <button key={value} type="button"
                          onClick={() => setEditLangsSpoken((prev) => active ? prev.filter((x) => x !== value) : [...prev, value])}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${active ? "bg-primary/10 border-primary text-primary" : "bg-slate-50 border-slate-200 text-slate-500 hover:border-primary/40"}`}>
                          {active && <Check size={10} className="inline mr-1" />}{label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Paysages */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Paysages maîtrisés</label>
                  <div className="flex flex-wrap gap-2">
                    {LANDSCAPES_LIST.map(({ value, label }) => {
                      const active = editLandscapes.includes(value);
                      return (
                        <button key={value} type="button"
                          onClick={() => setEditLandscapes((prev) => active ? prev.filter((x) => x !== value) : [...prev, value])}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${active ? "bg-primary/10 border-primary text-primary" : "bg-slate-50 border-slate-200 text-slate-500 hover:border-primary/40"}`}>
                          {active && <Check size={10} className="inline mr-1" />}{label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Certifications</label>
                  <div className="space-y-2">
                    {CERTIFICATIONS_LIST.map((cert) => {
                      const certs = editCertifications.split("\n").map((s) => s.trim()).filter(Boolean);
                      const active = certs.includes(cert);
                      return (
                        <button key={cert} type="button"
                          onClick={() => {
                            const list = editCertifications.split("\n").map((s) => s.trim()).filter(Boolean);
                            const updated = active ? list.filter((c) => c !== cert) : [...list, cert];
                            setEditCertifications(updated.join("\n"));
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-bold text-left transition-all ${active ? "bg-primary/10 border-primary text-slate-900" : "border-slate-100 text-slate-600 hover:border-primary/30 bg-white"}`}>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? "border-primary bg-primary" : "border-slate-300"}`}>
                            {active && <Check size={10} className="text-white" />}
                          </div>
                          {cert}
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
              className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
              <X size={16} />
            </button>
            <div className="px-8 pt-8 pb-5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Sparkles size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Publier une offre guide</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Proposez une expérience éco-touristique guidée</p>
                </div>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              <form id="publish-offer-form" onSubmit={handlePublish} className="px-8 py-6 space-y-5">

                {/* Type d'offre */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Type d'offre</label>
                  <div className="grid grid-cols-4 gap-2">
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

                {/* Titre */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Titre de l'offre *</label>
                  <input type="text" placeholder="Ex : Éco-Tour dans les forêts de Mogods"
                    value={form.title}
                    onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); setTitleError(""); }}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 transition-all placeholder:font-normal ${titleError ? "bg-red-50 border border-red-300 focus:ring-red-200" : "bg-slate-50 border border-slate-200 focus:ring-primary focus:bg-white"}`}
                  />
                  {titleError && <p className="text-xs font-semibold text-red-500 mt-1">{titleError}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Description</label>
                  <textarea rows={4} placeholder="Décrivez l'expérience, le parcours, les points d'intérêt écologiques…"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white resize-none placeholder:text-slate-400"
                  />
                </div>

                {/* Région */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Région / Emplacement</label>
                  <input type="text" placeholder="Ex : Tunis, Djerba, Sfax…"
                    value={form.region}
                    onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white placeholder:text-slate-400"
                  />
                </div>

                {/* Inclusions */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Inclusions</label>
                  <textarea rows={3} placeholder={"Ex :\n• Transport inclus\n• Équipement fourni\n• Guide bilingue"}
                    value={form.inclusions}
                    onChange={(e) => setForm((f) => ({ ...f, inclusions: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white resize-none placeholder:text-slate-400"
                  />
                </div>

                {/* Point de départ */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Point de départ</label>
                    <button type="button" onClick={() => setShowPublishMap((v) => !v)}
                      className="flex items-center gap-1 text-[10px] font-extrabold text-primary hover:text-primary/80 transition-colors">
                      <MapPin size={12} />{showPublishMap ? "Masquer la carte" : "Choisir sur la carte"}
                    </button>
                  </div>
                  <input type="text" placeholder="Ex : Place de la Kasbah, Tunis"
                    value={form.meeting_point}
                    onChange={(e) => setForm((f) => ({ ...f, meeting_point: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white placeholder:text-slate-400 mb-2"
                  />
                  {showPublishMap && (
                    <MapPicker lat={publishMapLat} lng={publishMapLng}
                      onPick={(lat, lng, address) => { setPublishMapLat(lat); setPublishMapLng(lng); setForm((f) => ({ ...f, meeting_point: address })); }}
                    />
                  )}
                </div>

                {/* Tarif + Durée */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Tarif (TND)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] font-bold">DT</span>
                      <input type="number" min="0" step="1" placeholder="150"
                        value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Durée</label>
                    <div className="relative">
                      <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Ex : 2h, 1 journée"
                        value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Groupe */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Max. pers.</label>
                    <input type="number" min="1" placeholder="15"
                      value={form.max_group_size} onChange={(e) => setForm((f) => ({ ...f, max_group_size: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Âge min.</label>
                    <input type="number" min="0" placeholder="12"
                      value={form.min_age} onChange={(e) => setForm((f) => ({ ...f, min_age: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Annulation */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Politique d'annulation</label>
                  <textarea rows={2} placeholder="Ex : Remboursement intégral si annulation 48h avant."
                    value={form.cancellation_policy} onChange={(e) => setForm((f) => ({ ...f, cancellation_policy: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white resize-none placeholder:text-slate-400"
                  />
                </div>

                {/* Photos */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Photos</label>
                  <label htmlFor="publish-images-input"
                    className="flex flex-col items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all bg-slate-50/70">
                    <span className="material-symbols-outlined text-slate-300 text-3xl">add_photo_alternate</span>
                    <p className="text-xs font-semibold text-slate-400">Cliquez pour ajouter des photos</p>
                    <input id="publish-images-input" type="file" accept="image/*" multiple className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        setPublishImages((prev) => [...prev, ...files.map((f) => ({ file: f, preview: URL.createObjectURL(f) }))]);
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
                              {isCover && <div className="absolute top-1 left-1 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-md leading-none">Cover</div>}
                              <button type="button"
                                onClick={(e) => { e.stopPropagation(); URL.revokeObjectURL(img.preview); setPublishImages((prev) => prev.filter((_, idx) => idx !== i)); setPublishCoverIdx((c) => c >= i && c > 0 ? c - 1 : c); }}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <X size={10} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mt-2">Cliquez sur une photo pour la définir comme image principale.</p>
                    </>
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
        const sliderImgs = viewOffer.images?.length ? viewOffer.images : viewOffer.cover_image ? [viewOffer.cover_image] : [];
        const td = OFFER_TYPES.find((t) => t.value === viewOffer.offer_type) ?? OFFER_TYPES[0];
        const safeIdx = Math.min(sliderIdx, Math.max(sliderImgs.length - 1, 0));
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
              <button onClick={closeEditModal}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors">
                <X size={16} />
              </button>

              {!editMode ? (
                <>
                  {/* Image carousel */}
                  <div className="relative h-56 w-full overflow-hidden shrink-0 select-none"
                    onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
                    onTouchEnd={(e) => {
                      if (touchStartX === null || sliderImgs.length <= 1) return;
                      const diff = touchStartX - e.changedTouches[0].clientX;
                      if (Math.abs(diff) > 40) setSliderIdx((i) => diff > 0 ? Math.min(i + 1, sliderImgs.length - 1) : Math.max(i - 1, 0));
                      setTouchStartX(null);
                    }}>
                    {sliderImgs.length > 0 ? (
                      <div className="flex h-full transition-transform duration-300 ease-out"
                        style={{ transform: `translateX(-${(safeIdx / sliderImgs.length) * 100}%)`, width: `${sliderImgs.length * 100}%` }}>
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
                        <button type="button" onClick={() => setSliderIdx((i) => Math.max(i - 1, 0))} disabled={safeIdx === 0}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all disabled:opacity-30">
                          <ChevronLeft size={18} />
                        </button>
                        <button type="button" onClick={() => setSliderIdx((i) => Math.min(i + 1, sliderImgs.length - 1))} disabled={safeIdx === sliderImgs.length - 1}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all disabled:opacity-30">
                          <ChevronRight size={18} />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {sliderImgs.map((_, i) => (
                            <button key={i} type="button" onClick={() => setSliderIdx(i)}
                              className={`h-1.5 rounded-full transition-all duration-200 ${i === safeIdx ? "w-5 bg-white" : "w-1.5 bg-white/50"}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="overflow-y-auto flex-1 px-8 py-6 space-y-5">
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight pr-8">{viewOffer.title}</h2>
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
                        <span className="bg-primary/10 text-primary border border-primary/20 rounded-xl px-3 py-1.5 text-[11px] font-extrabold">
                          {viewOffer.price} DT {viewOffer.duration && <span className="text-slate-400">/ {viewOffer.duration}</span>}
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
                          <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                          <p className="text-[10px] font-black tracking-widest text-emerald-700 uppercase">Inclusions</p>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{viewOffer.inclusions}</p>
                      </div>
                    )}
                    {viewOffer.meeting_point && (
                      <div>
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Point de départ</p>
                        <div className="flex items-center gap-2 text-slate-700 text-sm font-semibold mb-3">
                          <MapPin size={14} className="text-primary shrink-0" />{viewOffer.meeting_point}
                        </div>
                        <MeetingMap lat={viewOffer.meeting_lat} lng={viewOffer.meeting_lng} address={viewOffer.meeting_point} />
                      </div>
                    )}
                    {(viewOffer.max_group_size || viewOffer.min_age) && (
                      <div className="grid grid-cols-2 gap-3">
                        {viewOffer.max_group_size && (
                          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                            <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase mb-1">Max. personnes</p>
                            <p className="text-lg font-extrabold text-slate-800">{viewOffer.max_group_size}</p>
                          </div>
                        )}
                        {viewOffer.min_age && (
                          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                            <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase mb-1">Âge minimum</p>
                            <p className="text-lg font-extrabold text-slate-800">{viewOffer.min_age} ans</p>
                          </div>
                        )}
                      </div>
                    )}
                    {viewOffer.cancellation_policy && (
                      <div>
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Annulation</p>
                        <p className="text-slate-600 text-sm leading-relaxed">{viewOffer.cancellation_policy}</p>
                      </div>
                    )}
                  </div>

                  <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end shrink-0">
                    <button type="button" onClick={() => { setEditImages((viewOffer.images?.filter((s) => s.startsWith("http")) ?? []).map((src) => ({ src }))); setEditCoverIdx(0); setEditMode(true); }}
                      className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-extrabold rounded-2xl text-xs shadow-sm hover:bg-primary/90 transition-all active:scale-95">
                      <Edit3 size={14} />Gérer
                    </button>
                  </div>
                </>
              ) : (
                /* ── EDIT MODE ───────────────────────────────────────────── */
                <>
                  <div className="px-8 pt-7 pb-4 border-b border-slate-100 shrink-0">
                    <h3 className="text-lg font-extrabold text-slate-800">Gérer l'offre</h3>
                  </div>
                  <div className="overflow-y-auto flex-1">
                    <form id="edit-offer-form" onSubmit={handleSaveOffer} className="px-8 py-6 space-y-5">

                      {/* Type */}
                      <div>
                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Type d'offre</label>
                        <div className="grid grid-cols-4 gap-2">
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

                      <div>
                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Titre *</label>
                        <input type="text" value={editForm.title}
                          onChange={(e) => { setEditForm((f) => ({ ...f, title: e.target.value })); setEditTitleError(""); }}
                          className={`w-full px-4 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 transition-all ${editTitleError ? "bg-red-50 border border-red-300 focus:ring-red-200" : "bg-slate-50 border border-slate-200 focus:ring-primary focus:bg-white"}`}
                        />
                        {editTitleError && <p className="text-xs font-semibold text-red-500 mt-1">{editTitleError}</p>}
                      </div>

                      <div>
                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Description</label>
                        <textarea rows={4} value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white resize-none" />
                      </div>

                      <div>
                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Région / Emplacement</label>
                        <input type="text" placeholder="Tunis, Djerba, Sfax…" value={editForm.region} onChange={(e) => setEditForm((f) => ({ ...f, region: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white" />
                      </div>

                      <div>
                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Inclusions</label>
                        <textarea rows={3} value={editForm.inclusions} onChange={(e) => setEditForm((f) => ({ ...f, inclusions: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white resize-none" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Point de départ</label>
                          <button type="button" onClick={() => setShowEditMap((v) => !v)}
                            className="flex items-center gap-1 text-[10px] font-extrabold text-primary hover:text-primary/80 transition-colors">
                            <MapPin size={12} />{showEditMap ? "Masquer" : "Carte"}
                          </button>
                        </div>
                        <input type="text" value={editForm.meeting_point} onChange={(e) => setEditForm((f) => ({ ...f, meeting_point: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white mb-2" />
                        {showEditMap && (
                          <MapPicker lat={editMapLat} lng={editMapLng}
                            onPick={(lat, lng, address) => { setEditMapLat(lat); setEditMapLng(lng); setEditForm((f) => ({ ...f, meeting_point: address })); }}
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Tarif (DT)</label>
                          <input type="number" min="0" value={editForm.price} onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-mono" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Durée</label>
                          <input type="text" value={editForm.duration} onChange={(e) => setEditForm((f) => ({ ...f, duration: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Max. pers.</label>
                          <input type="number" min="1" value={editForm.max_group_size} onChange={(e) => setEditForm((f) => ({ ...f, max_group_size: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-mono" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Âge min.</label>
                          <input type="number" min="0" value={editForm.min_age} onChange={(e) => setEditForm((f) => ({ ...f, min_age: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-mono" />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5 block">Annulation</label>
                        <textarea rows={2} value={editForm.cancellation_policy} onChange={(e) => setEditForm((f) => ({ ...f, cancellation_policy: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white resize-none" />
                      </div>


                      {/* Photos */}
                      <div>
                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2 block">Photos</label>
                        <label htmlFor="edit-images-input"
                          className="flex flex-col items-center justify-center gap-2 w-full h-20 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all bg-slate-50/70">
                          <span className="material-symbols-outlined text-slate-300 text-2xl">add_photo_alternate</span>
                          <p className="text-xs font-semibold text-slate-400">Ajouter des photos</p>
                          <input id="edit-images-input" type="file" accept="image/*" multiple className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files ?? []);
                              setEditImages((prev) => [...prev, ...files.map((f) => ({ src: URL.createObjectURL(f), file: f }))]);
                              e.target.value = "";
                            }}
                          />
                        </label>
                        {editImages.length > 0 && (
                          <div className="mt-3 grid grid-cols-4 gap-2">
                            {editImages.map((img, i) => {
                              const isCover = i === editCoverIdx;
                              return (
                                <div key={i} onClick={() => setEditCoverIdx(i)}
                                  className={`relative group aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${isCover ? "border-primary shadow-md" : "border-transparent hover:border-slate-300"}`}>
                                  <img src={img.src} alt="" className="w-full h-full object-cover" />
                                  {isCover && <div className="absolute top-1 left-1 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-md leading-none">Cover</div>}
                                  <button type="button"
                                    onClick={(e) => { e.stopPropagation(); setEditImages((prev) => prev.filter((_, idx) => idx !== i)); setEditCoverIdx((c) => c >= i && c > 0 ? c - 1 : c); }}
                                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X size={10} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {editError && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                          <span className="material-symbols-outlined text-red-500 text-base">error</span>
                          <p className="text-sm font-semibold text-red-600">{editError}</p>
                        </div>
                      )}
                    </form>
                  </div>
                  <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setEditMode(false)}
                        className="px-4 py-2.5 border border-slate-200 text-slate-600 bg-white rounded-2xl text-xs font-bold hover:bg-slate-50 transition-colors">
                        Retour
                      </button>
                      <button type="button" onClick={handleDeleteOffer} disabled={offerDeleting}
                        className="px-4 py-2.5 border border-red-200 text-red-600 bg-white rounded-2xl text-xs font-bold hover:bg-red-50 transition-colors disabled:opacity-60">
                        {offerDeleting ? "Suppression…" : "Supprimer"}
                      </button>
                    </div>
                    <button type="submit" form="edit-offer-form" disabled={editSaving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-extrabold rounded-2xl text-xs shadow-sm hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60">
                      {editSaving ? <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Sauvegarde…</> : <><Check size={14} />Enregistrer</>}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* ══ MAIN CONTENT ═════════════════════════════════════════════════════ */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6">

        {/* ── PROFILE HEADER ────────────────────────────────────────────────── */}
        <div className="relative w-full overflow-hidden bg-white shadow-sm rounded-3xl border border-slate-100/80 mb-6">
          {profile.cover_photo
            ? <div className="relative h-48 md:h-64 lg:h-72 w-full overflow-hidden"><img src={profile.cover_photo} alt="" className="w-full h-full object-cover" /></div>
            : <BotanicalCover />
          }
          <div className="relative px-6 pb-6 pt-3 md:pt-0">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 md:-mt-20">
              <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-md" />
                    <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-lg flex items-center justify-center">
                      <AvatarImg />
                    </div>
                  </div>
                  <div className="bg-primary text-white text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-md uppercase tracking-wider border border-white">
                    <span className="material-symbols-outlined text-yellow-300" style={{ fontSize: 11 }}>star</span>
                    {scoreLabel(profile.sustainability_score)}
                  </div>
                </div>
                <div className="text-center sm:text-left pt-3 sm:pt-0 pb-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">{profile.full_name || "Guide"}</h1>
                    <ShieldCheck size={20} className="text-emerald-500 fill-emerald-100 hidden sm:block" />
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1 text-primary font-semibold text-sm">
                    <span>{roleLabel}</span>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 md:mt-0 flex flex-row flex-wrap justify-center sm:justify-end gap-3 self-center md:self-end">
                <button onClick={openModal}
                  className="bg-primary hover:bg-primary/90 active:scale-95 text-white font-bold px-5 py-3 rounded-2xl inline-flex items-center gap-2 hover:shadow-lg transition-all shadow-sm text-sm">
                  <Plus size={18} strokeWidth={2.5} /><span>Publier une offre</span>
                </button>
                <button onClick={openEditProfile}
                  className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-5 py-3 rounded-2xl inline-flex items-center gap-2 hover:shadow-sm active:scale-95 transition-all text-sm">
                  <Edit3 size={16} /><span>Modifier le profil</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── DASHBOARD COLUMNS ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── LEFT SIDEBAR ────────────────────────────────────────────────── */}
          <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100/80 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-primary">
                  <Info size={18} strokeWidth={2.5} />
                </div>
                <h2 className="text-base font-extrabold text-slate-800">Informations</h2>
              </div>
              <div className="space-y-4">
                {profile.country && (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-50 text-slate-400"><MapPin size={16} /></div>
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Localisation</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{COUNTRY_LABELS[profile.country] ?? profile.country}</p>
                    </div>
                  </div>
                )}
                {profile.zone && (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-50 text-slate-400"><Globe size={16} /></div>
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Zone d'activité</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{profile.zone}</p>
                    </div>
                  </div>
                )}
                {profile.guide_type && (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-50 text-slate-400"><BookOpen size={16} /></div>
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Type de guide</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{GUIDE_TYPE_LABELS[profile.guide_type] ?? profile.guide_type}</p>
                    </div>
                  </div>
                )}
                {profile.years_experience !== null && (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-50 text-slate-400"><Star size={16} /></div>
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Expérience</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{profile.years_experience} ans</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-50 text-slate-400"><Calendar size={16} /></div>
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Membre depuis</p>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">
                      {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
                {!profile.country && !profile.zone && !profile.guide_type && (
                  <p className="text-xs text-slate-400 italic">Aucune information renseignée.</p>
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
                <>
                  <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    {followers.slice(0, 5).map((f) => {
                      const path = f._type === "eco_traveler" ? `/profile/ecovoyageur/${f.user_id}` : f._type === "project" ? `/profile/project-owner/${f.user_id}` : `/profile/guide/${f.user_id}`;
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
                </>
              ) : (
                <p className="text-xs text-slate-400 font-medium">Aucun follower pour l'instant.</p>
              )}
            </div>

          </div>

          {/* ── RIGHT COLUMN ────────────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-wrap gap-1 border border-slate-200/50">
              {[
                { key: "tout",    label: "Tout",     Icon: LayoutGrid },
                { key: "offres",  label: "Offres",   Icon: Tag },
                { key: "reseau",  label: "Réseau",   Icon: Users },
                { key: "apropos", label: "À propos", Icon: Info },
              ].map(({ key, label, Icon }) => (
                <button key={key} onClick={() => setActiveTab(key as Tab)}
                  className={`flex-1 min-w-[70px] py-3 px-4 rounded-xl text-xs font-black tracking-tight flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"}`}>
                  <Icon size={14} strokeWidth={2.5} /><span>{label}</span>
                </button>
              ))}
            </div>

            {/* TAB: TOUT */}
            {activeTab === "tout" && (
              <div className="space-y-5">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                  <Sparkles size={12} className="text-primary" /><span>Offres de guide</span>
                </h3>
                {offers.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-100/90 shadow-sm p-12 text-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-primary text-3xl">hiking</span>
                    </div>
                    <p className="text-slate-800 font-extrabold text-base mb-1">Aucune offre publiée</p>
                    <p className="text-slate-400 text-sm mb-5">Publiez votre première expérience guidée.</p>
                    <button onClick={openModal}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary/90 shadow-sm">
                      <Plus size={16} />Publier une offre
                    </button>
                  </div>
                ) : (
                  offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)
                )}
              </div>
            )}

            {/* TAB: OFFRES */}
            {activeTab === "offres" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-800">Offres disponibles ({offers.length})</h3>
                  <button onClick={openModal} className="text-primary hover:text-primary/80 text-xs font-extrabold flex items-center gap-1">+ Publier une offre</button>
                </div>
                {offers.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-100/90 shadow-sm p-12 text-center">
                    <p className="text-slate-800 font-extrabold text-base">Aucune offre pour l'instant</p>
                    <p className="text-slate-400 text-sm mt-1">Publiez votre première expérience guidée.</p>
                  </div>
                ) : (
                  offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)
                )}
              </div>
            )}

            {/* TAB: AMIS */}
            {activeTab === "reseau" && (
              <div className="space-y-5">
                {/* Search */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2"><Search size={16} className="text-primary" />Rechercher un propriétaire éco-touristique</h3>
                  <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input type="text" value={netSearch} onChange={(e) => setNetSearch(e.target.value)} placeholder="Nom ou organisation…"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-colors" />
                    {netSearch && <button onClick={() => { setNetSearch(""); setNetResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={14} /></button>}
                  </div>
                  {netLoading && <div className="mt-3 flex items-center gap-2 text-xs text-slate-400"><div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />Recherche…</div>}
                  {!netLoading && netResults.length > 0 && (
                    <div className="mt-3 divide-y divide-slate-50">
                      {netResults.map((r) => (
                        <div key={r.user_id} className="flex items-center justify-between py-3 gap-3">
                          <button onClick={() => router.push(`/profile/project-owner/${r.user_id}`)} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 text-left">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">{r.photo ? <img src={r.photo} alt={r.full_name} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-slate-400">business</span>}</div>
                            <div className="min-w-0"><p className="font-extrabold text-slate-800 text-sm truncate">{r.full_name}</p>{r.sub && <p className="text-xs text-slate-400">{r.sub}</p>}</div>
                          </button>
                          <button onClick={() => router.push(`/profile/project-owner/${r.user_id}`)} className="shrink-0 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-bold rounded-xl hover:bg-primary hover:text-slate-900 transition-all">Voir</button>
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
                          <button onClick={() => router.push(`/profile/project-owner/${f.user_id}`)} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 text-left">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">{f.photo ? <img src={f.photo} alt={f.full_name} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-slate-400">business</span>}</div>
                            <div className="min-w-0"><p className="font-extrabold text-slate-800 text-sm truncate">{f.full_name}</p>{f.sub && <p className="text-xs text-slate-400">{f.sub}</p>}</div>
                          </button>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button onClick={() => router.push(`/profile/project-owner/${f.user_id}`)} className="px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-bold rounded-xl hover:bg-primary hover:text-slate-900 transition-all">Voir</button>
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
                        const path = f._type === "eco_traveler" ? `/profile/ecovoyageur/${f.user_id}` : f._type === "project" ? `/profile/project-owner/${f.user_id}` : `/profile/guide/${f.user_id}`;
                        const typeLabel = f._type === "eco_traveler" ? "Éco-Voyageur" : f._type === "project" ? "Prestataire" : "Guide";
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

            {/* TAB: À PROPOS */}
            {activeTab === "apropos" && (
              <div className="space-y-5">

                {profile.bio && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-100/80 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-3">Présentation</p>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{profile.bio}</p>
                  </div>
                )}

                {/* Infos professionnelles */}
                <div className="bg-white rounded-3xl border border-slate-100/80 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Informations professionnelles</p>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {profile.guide_type && (
                      <div className="flex items-center gap-4 px-6 py-4">
                        <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                          <BookOpen size={16} className="text-violet-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-0.5">Type de guide</p>
                          <p className="text-sm font-bold text-slate-800">{GUIDE_TYPE_LABELS[profile.guide_type] ?? profile.guide_type}</p>
                        </div>
                      </div>
                    )}
                    {profile.zone && (
                      <div className="flex items-center gap-4 px-6 py-4">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                          <Globe size={16} className="text-emerald-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-0.5">Zone d'activité</p>
                          <p className="text-sm font-bold text-slate-800">{profile.zone}</p>
                        </div>
                      </div>
                    )}
                    {profile.country && (
                      <div className="flex items-center gap-4 px-6 py-4">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                          <MapPin size={16} className="text-blue-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-0.5">Pays</p>
                          <p className="text-sm font-bold text-slate-800">{COUNTRY_LABELS[profile.country] ?? profile.country}</p>
                        </div>
                      </div>
                    )}
                    {profile.years_experience !== null && (
                      <div className="flex items-center gap-4 px-6 py-4">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                          <Star size={16} className="text-amber-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-0.5">Expérience</p>
                          <p className="text-sm font-bold text-slate-800">{profile.years_experience} ans</p>
                        </div>
                      </div>
                    )}
                    {profile.languages_spoken && profile.languages_spoken.length > 0 && (
                      <div className="flex items-start gap-4 px-6 py-4">
                        <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-sky-500" style={{ fontSize: 18 }}>translate</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1.5">Langues parlées</p>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.languages_spoken.map((l) => (
                              <span key={l} className="bg-sky-50 text-sky-700 border border-sky-100 rounded-lg px-2.5 py-1 text-xs font-bold">
                                {LANG_LABELS[l] ?? l}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {!profile.guide_type && !profile.zone && !profile.country && !profile.years_experience && (
                      <div className="px-6 py-8 text-center text-slate-400 text-xs font-medium">Aucune information renseignée.</div>
                    )}
                  </div>
                </div>

                {/* Spécialités */}
                {(profile.skills_activities?.length > 0 || profile.specialties?.length) && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-100/80 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-4">Spécialités</p>
                    <div className="flex flex-wrap gap-2">
                      {(profile.skills_activities?.length ? profile.skills_activities : profile.specialties ?? []).map((s) => {
                        const found = SPECIALTIES_LIST.find((x) => x.value === s);
                        return (
                          <span key={s} className="bg-primary/10 text-primary border border-primary/20 rounded-xl px-3 py-1.5 text-xs font-bold">
                            {found?.label ?? s}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Paysages */}
                {profile.skills_landscapes?.length > 0 && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-100/80 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-4">Paysages maîtrisés</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills_landscapes.map((l) => {
                        const found = LANDSCAPES_LIST.find((x) => x.value === l);
                        return (
                          <span key={l} className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl px-3 py-1.5 text-xs font-bold">
                            {found?.label ?? l}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {profile.certifications?.length > 0 && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-100/80 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-4">Certifications</p>
                    <div className="space-y-2">
                      {profile.certifications.map((c, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Check size={12} className="text-primary" />
                          </div>
                          <p className="text-sm font-semibold text-slate-700">{c}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Activité */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100/80 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-4">Activité</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: profile.reservations_handled, label: "Réservations", icon: "event_available", color: "text-blue-500 bg-blue-50" },
                      { value: profile.feedback_received,    label: "Avis reçus",   icon: "star",            color: "text-amber-500 bg-amber-50" },
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
                      {profile.sustainability_score >= 80 ? "Guide Ambassadeur Éco Voyage"
                        : scoreLabel(profile.sustainability_score)}
                    </p>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      </div>
    </div>

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
                      onClick={() => { if (oqStep === OFFER_SUSTAINABILITY_STEPS.length - 1) { setOqStep((s) => s + 1); submitOfferQuestionnaire(); } else { setOqStep((s) => s + 1); } }}
                      disabled={!oqStepAnswered}
                      className={`flex-1 py-3 font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all ${oqStepAnswered ? "bg-primary text-slate-900 hover:bg-primary/90" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                    >
                      {oqStep === OFFER_SUSTAINABILITY_STEPS.length - 1 ? "Voir mon score" : "Suivant"}<ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ) : (() => {
                const level = getOfferSustainabilityLevel(oqScore);
                const r = 54; const circ = 2 * Math.PI * r;
                return (
                  <>
                    <div className="flex flex-col items-center py-4">
                      <svg width="140" height="140" viewBox="0 0 140 140">
                        <circle cx="70" cy="70" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
                        <circle cx="70" cy="70" r={r} fill="none" stroke="#86efac" strokeWidth="10"
                          strokeDasharray={circ} strokeDashoffset={circ * (1 - oqScore / 100)}
                          strokeLinecap="round" transform="rotate(-90 70 70)" className="transition-all duration-700" />
                        <text x="70" y="65" textAnchor="middle" style={{ fontSize: 28, fontWeight: 900 }}>{oqScore}</text>
                        <text x="70" y="82" textAnchor="middle" className="fill-slate-400" style={{ fontSize: 12, fontWeight: 700 }}>/100</text>
                      </svg>
                      <span className={`mt-2 text-base font-extrabold ${level.color}`}>{level.emoji} {level.label}</span>
                      <p className="text-sm text-slate-500 mt-1 text-center">{oqScore >= 71 ? "Votre offre est éco-responsable. Excellent !" : oqScore >= 51 ? "Votre offre est sur la bonne voie. Continuez vos efforts !" : "Des améliorations sont possibles pour cette offre."}</p>
                    </div>
                    <div className="space-y-3 mb-4">
                      {OFFER_SUSTAINABILITY_STEPS.map((step) => {
                        const catScore = step.questions.reduce((sum, q) => sum + (oqAnswers[q.id] ?? 0), 0);
                        const catMax = step.questions.reduce((sum, q) => sum + Math.max(...q.options.map((o) => o.value)), 0);
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
                    <button onClick={() => setOqOpen(false)} disabled={oqSaving}
                      className="w-full py-3 bg-primary text-slate-900 font-extrabold rounded-xl hover:bg-primary/90 transition-colors">
                      {oqSaving ? "Enregistrement…" : "Fermer"}
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      );
    })()}
    </>
  );
}
