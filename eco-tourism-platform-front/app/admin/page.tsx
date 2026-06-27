"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { apiFetch } from "@/lib/api";
import { Leaf, Check, X, LogOut, ChevronRight, ExternalLink, Flag, ShieldOff, Trash2, AlertTriangle, ShieldCheck, Clock, UserCheck } from "lucide-react";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => <div className="h-[220px] rounded-xl bg-slate-100 animate-pulse" />,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type PendingPublication = {
  id: string;
  type: "place" | "experience";
  title: string;
  description: string | null;
  region: string | null;
  place_name: string | null;
  images: string[] | null;
  latitude: number | null;
  longitude: number | null;
  author_id: string;
  created_at: string;
};

type PendingOffer = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  duration: string | null;
  offer_type: string | null;
  author_type: string;
  author_id: string;
  images: string[] | null;
  inclusions: string | null;
  meeting_point: string | null;
  min_group_size: number | null;
  max_group_size: number | null;
  min_age: number | null;
  cancellation_policy: string | null;
  sustainability_score: number | null;
  created_at: string;
};

type PendingProvider = {
  user_id: string;
  full_name: string | null;
  organization: string | null;
  provider_type: string | null;
  bio: string | null;
  region: string | null;
  address: string | null;
  zone: string | null;
  photo: string | null;
  cover_photo: string | null;
  opening_hours: string | null;
  services: string[] | null;
  eco_labels: string[] | null;
  certifications: string[] | null;
  website: string | null;
  phone: string | null;
  whatsapp: string | null;
  facebook: string | null;
  instagram: string | null;
  activity_types: string[] | null;
  languages_spoken: string[] | null;
  years_experience: number | null;
  sustainability_score: number | null;
};

type Tab = "publications" | "offers" | "providers" | "reports" | "banned";

type BannedUser = {
  user_id: string;
  email: string;
  role: string;
  status: string;
  ban_until: string | null;
  banned_at: string;
  full_name: string | null;
  photo: string | null;
};

type ReportUser = { user_id: string; full_name: string | null; photo: string | null; role: string; email: string | null; status: string | null };
type Report = {
  id: string;
  reporter_id: string;
  reporter_role: string;
  reported_id: string;
  reported_role: string;
  reason: string;
  status: string;
  action_taken: string | null;
  admin_note: string | null;
  created_at: string;
  resolved_at: string | null;
  reporter: ReportUser;
  reported: ReportUser;
};

// ─── RejectModal ──────────────────────────────────────────────────────────────

function RejectModal({ onConfirm, onClose }: { onConfirm: (reason: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-extrabold text-slate-900">Motif de rejet</h3>
        <textarea
          className="w-full h-28 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 font-medium resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
          placeholder="Expliquez pourquoi ce contenu est rejeté…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          autoFocus
        />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Annuler</button>
          <button disabled={!reason.trim()} onClick={() => reason.trim() && onConfirm(reason.trim())}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50">
            Rejeter
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DetailField ──────────────────────────────────────────────────────────────

function DetailField({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function DetailLink({ label, url }: { label: string; url: string | null | undefined }) {
  if (!url) return null;
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline break-all">
        {url} <ExternalLink className="w-3.5 h-3.5 shrink-0" />
      </a>
    </div>
  );
}

function DetailMap({ lat, lng }: { lat: number | null; lng: number | null }) {
  if (!lat || !lng) return null;
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Localisation</p>
      <MapView lat={lat} lng={lng} />
    </div>
  );
}

function DetailImages({ images }: { images: string[] | null }) {
  if (!images?.length) return null;
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Photos</p>
      <div className="grid grid-cols-3 gap-2">
        {images.map((src, i) => (
          <img key={i} src={src} alt="" className="w-full h-24 object-cover rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function DetailTags({ label, tags }: { label: string; tags: string[] | null }) {
  if (!tags?.length) return null;
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{t}</span>
        ))}
      </div>
    </div>
  );
}

function DetailSustainability({ score }: { score: number | null }) {
  if (score === null) return null;
  const level =
    score >= 86 ? { label: "Ambassadeur Éco Voyage", color: "text-primary",      bar: "bg-primary" } :
    score >= 71 ? { label: "Éco-Responsable",        color: "text-emerald-600", bar: "bg-emerald-500" } :
    score >= 51 ? { label: "Engagé",                 color: "text-teal-600",    bar: "bg-teal-500" } :
    score >= 31 ? { label: "Sensibilisé",            color: "text-blue-600",    bar: "bg-blue-500" } :
                  { label: "Conventionnel",           color: "text-slate-500",   bar: "bg-slate-400" };
  return (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">🌿 Score de durabilité</p>
        <span className={`text-sm font-black ${level.color}`}>{score}/100</span>
      </div>
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-1.5">
        <div className={`h-full ${level.bar} rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-bold ${level.color}`}>{level.label}</span>
    </div>
  );
}

// ─── Detail Modals ────────────────────────────────────────────────────────────

function PublicationDetail({ pub, onClose, onApprove, onReject, loading }: {
  pub: PendingPublication;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  loading: boolean;
}) {
  return (
    <DetailModal title={pub.title} badge={pub.type === "place" ? "Lieu" : "Expérience"} date={pub.created_at} onClose={onClose} onApprove={onApprove} onReject={onReject} loading={loading}>
      <DetailImages images={pub.images} />
      <DetailField label="Nom du lieu" value={pub.place_name} />
      <DetailField label="Région" value={pub.region} />
      <DetailField label="Description" value={pub.description} />
      <DetailMap lat={pub.latitude} lng={pub.longitude} />
    </DetailModal>
  );
}

function OfferDetail({ offer, onClose, onApprove, onReject, loading }: {
  offer: PendingOffer;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  loading: boolean;
}) {
  return (
    <DetailModal title={offer.title} badge={offer.author_type === "guide" ? "Guide" : "Prestataire"} date={offer.created_at} onClose={onClose} onApprove={onApprove} onReject={onReject} loading={loading}>
      <DetailImages images={offer.images} />
      <div className="grid grid-cols-3 gap-4">
        <DetailField label="Type d'offre" value={offer.offer_type} />
        <DetailField label="Prix" value={offer.price != null ? `${offer.price} TND` : null} />
        <DetailField label="Durée" value={offer.duration} />
      </div>
      <DetailField label="Description" value={offer.description} />
      <DetailField label="Inclusions" value={offer.inclusions} />
      <DetailField label="Point de rendez-vous" value={offer.meeting_point} />
      <div className="grid grid-cols-3 gap-4">
        <DetailField label="Groupe min" value={offer.min_group_size} />
        <DetailField label="Groupe max" value={offer.max_group_size} />
        <DetailField label="Âge minimum" value={offer.min_age} />
      </div>
      <DetailField label="Politique d'annulation" value={offer.cancellation_policy} />
      <DetailSustainability score={offer.sustainability_score} />
    </DetailModal>
  );
}

const PROVIDER_TYPE_LABELS: Record<string, string> = {
  guide: "Guide nature", agence: "Agence de voyage", ecolodge: "Écolodge",
  restaurant: "Restauration", artisan: "Artisan", association: "Association",
  bien_etre: "Bien-être", transport: "Transport",
};

function ProviderDetail({ provider, onClose, onApprove, onReject, loading }: {
  provider: PendingProvider;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  loading: boolean;
}) {
  const name = provider.full_name ?? provider.organization ?? "Prestataire";
  const badge = provider.provider_type ? (PROVIDER_TYPE_LABELS[provider.provider_type] ?? provider.provider_type) : "Prestataire";
  return (
    <DetailModal title={name} badge={badge} date={new Date().toISOString()} onClose={onClose} onApprove={onApprove} onReject={onReject} loading={loading}>
      <DetailImages images={provider.photo ? [provider.photo] : null} />
      <div className="grid grid-cols-2 gap-4">
        <DetailField label="Région" value={provider.region} />
        <DetailField label="Type" value={PROVIDER_TYPE_LABELS[provider.provider_type ?? ""] ?? provider.provider_type} />
      </div>
      <DetailField label="Organisation" value={provider.organization} />
      <DetailField label="Adresse" value={provider.address} />
      <DetailField label="Zone" value={provider.zone} />
      <DetailField label="Biographie" value={provider.bio} />
      <DetailField label="Horaires" value={provider.opening_hours} />
      <div className="grid grid-cols-2 gap-4">
        <DetailField label="Téléphone" value={provider.phone} />
        <DetailField label="WhatsApp" value={provider.whatsapp} />
      </div>
      <DetailField label="Expérience" value={provider.years_experience ? `${provider.years_experience} ans` : null} />
      <DetailLink label="Site web" url={provider.website} />
      <DetailLink label="Facebook" url={provider.facebook} />
      <DetailTags label="Activités" tags={provider.activity_types} />
      <DetailTags label="Langues" tags={provider.languages_spoken} />
      <DetailTags label="Labels éco" tags={provider.eco_labels} />
      <DetailTags label="Certifications" tags={provider.certifications} />
      <DetailSustainability score={provider.sustainability_score} />
    </DetailModal>
  );
}

function DetailModal({ title, badge, date, onClose, onApprove, onReject, loading, children }: {
  title: string;
  badge: string;
  date: string;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TypeBadge label={badge} />
              <span className="text-xs font-medium text-slate-400">
                {new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">{title}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors shrink-0 ml-4">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {children}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-100 flex gap-3 justify-end shrink-0">
          <button disabled={loading} onClick={onReject}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors disabled:opacity-50">
            <X className="w-4 h-4" /> Rejeter
          </button>
          <button disabled={loading} onClick={onApprove}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors disabled:opacity-50">
            <Check className="w-4 h-4" /> Approuver
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TypeBadge ────────────────────────────────────────────────────────────────

function TypeBadge({ label }: { label: string }) {
  return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">{label}</span>;
}

// ─── ContentCard ──────────────────────────────────────────────────────────────

function ContentCard({ title, badge, meta, description, date, loading, onOpen, onApprove, onReject }: {
  title: string;
  badge: string;
  meta: string;
  description: string | null;
  date: string;
  loading: boolean;
  onOpen: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-5">
      <button className="flex-1 min-w-0 text-left group" onClick={onOpen}>
        <div className="flex items-center gap-2 mb-1.5">
          <TypeBadge label={badge} />
          <span className="text-xs font-medium text-slate-400">
            {new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <h3 className="text-base font-extrabold text-slate-900 truncate group-hover:text-primary transition-colors">{title}</h3>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary shrink-0 transition-colors" />
        </div>
        {meta && <p className="text-xs font-medium text-slate-500 mt-0.5">{meta}</p>}
        {description && <p className="text-sm text-slate-600 mt-2 line-clamp-2">{description}</p>}
      </button>
      <div className="flex flex-col gap-2 shrink-0">
        <button disabled={loading} onClick={onApprove}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-bold hover:bg-green-100 transition-colors disabled:opacity-50">
          <Check className="w-4 h-4" /> Approuver
        </button>
        <button disabled={loading} onClick={onReject}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50">
          <X className="w-4 h-4" /> Rejeter
        </button>
      </div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="text-center py-20 text-slate-400">
      <Check className="w-10 h-10 mx-auto mb-3 text-green-400" />
      <p className="text-sm font-bold">{label}</p>
    </div>
  );
}

// ─── ResolveModal ─────────────────────────────────────────────────────────────

const ACTION_OPTIONS = [
  { value: "warn",    label: "Avertir l'utilisateur",    icon: AlertTriangle, color: "text-orange-600 border-orange-300 bg-orange-50 hover:bg-orange-100" },
  { value: "ban",     label: "Bannir le compte",          icon: ShieldOff,     color: "text-red-600 border-red-300 bg-red-50 hover:bg-red-100" },
  { value: "delete",  label: "Supprimer le compte",       icon: Trash2,        color: "text-red-700 border-red-400 bg-red-100 hover:bg-red-200" },
  { value: "dismiss", label: "Rejeter le signalement",    icon: X,             color: "text-slate-600 border-slate-300 bg-slate-50 hover:bg-slate-100" },
];

const BAN_DURATIONS = [
  { label: "1 jour",    days: 1 },
  { label: "3 jours",   days: 3 },
  { label: "7 jours",   days: 7 },
  { label: "30 jours",  days: 30 },
  { label: "Permanent", days: 0 },
];

function ResolveModal({ report, onConfirm, onClose }: { report: Report; onConfirm: (action: string, note: string, banDays?: number) => void; onClose: () => void }) {
  const [action, setAction] = useState("");
  const [banDays, setBanDays] = useState(7);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center shrink-0">
            <Flag className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Résoudre le signalement</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Signalé par <strong>{report.reporter.full_name ?? "—"}</strong> · Motif : {report.reason}
            </p>
          </div>
        </div>

        {/* Reported user info */}
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden flex items-center justify-center shrink-0">
            {report.reported.photo
              ? <img src={report.reported.photo} alt="" className="w-full h-full object-cover" />
              : <span className="material-symbols-outlined text-slate-400 text-base">person</span>}
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-800">{report.reported.full_name ?? "—"}</p>
            <p className="text-xs text-slate-400 font-medium">{report.reported.role} · {report.reported.email}</p>
          </div>
          {report.reported.status === "banned" && (
            <span className="ml-auto text-xs font-bold px-2 py-1 bg-red-100 text-red-600 rounded-lg">Banni</span>
          )}
        </div>

        {/* Action choice */}
        <div className="grid grid-cols-2 gap-2">
          {ACTION_OPTIONS.map(({ value, label, icon: Icon, color }) => (
            <button key={value} onClick={() => setAction(value)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all text-left ${action === value ? color + " ring-2 ring-offset-1 ring-current" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              <Icon size={15} className="shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {/* Ban duration selector */}
        {action === "ban" && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Durée du ban</p>
            <div className="flex gap-2 flex-wrap">
              {BAN_DURATIONS.map((d) => (
                <button key={d.days} onClick={() => setBanDays(d.days)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${banDays === d.days ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Note admin */}
        <textarea
          className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 font-medium resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Note optionnelle pour l'utilisateur signalé et le signalant…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Annuler</button>
          <button
            disabled={!action || submitted}
            onClick={() => {
              if (!action || submitted) return;
              setSubmitted(true);
              onConfirm(action, note, action === "ban" ? banDays : undefined);
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:opacity-40">
            {submitted && <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            Confirmer l'action
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [tab, setTab] = useState<Tab>("publications");

  const [publications, setPublications] = useState<PendingPublication[]>([]);
  const [offers, setOffers] = useState<PendingOffer[]>([]);
  const [providers, setProviders] = useState<PendingProvider[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [detailPub, setDetailPub] = useState<PendingPublication | null>(null);
  const [detailOffer, setDetailOffer] = useState<PendingOffer | null>(null);
  const [detailProvider, setDetailProvider] = useState<PendingProvider | null>(null);

  const [rejectTarget, setRejectTarget] = useState<{ type: Tab; id: string } | null>(null);
  const [resolveTarget, setResolveTarget] = useState<Report | null>(null);
  const [banEditTarget, setBanEditTarget] = useState<BannedUser | null>(null);
  const [banEditDays, setBanEditDays] = useState(7);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const tkn = localStorage.getItem("access_token");
    if (!stored || !tkn) { router.push("/auth/login"); return; }
    const { role } = JSON.parse(stored) as { role: string };
    if (role !== "admin") { router.push("/auth/login"); return; }
    setToken(tkn);
  }, [router]);

  useEffect(() => {
    if (!token) return;
    async function fetchAll() {
      setLoading(true);
      try {
        const [pubs, offrs, provs, reps, banned] = await Promise.all([
          apiFetch<PendingPublication[]>("/admin/publications/pending", { headers: { Authorization: `Bearer ${token}` } }),
          apiFetch<PendingOffer[]>("/admin/offers/pending", { headers: { Authorization: `Bearer ${token}` } }),
          apiFetch<PendingProvider[]>("/admin/providers/pending", { headers: { Authorization: `Bearer ${token}` } }),
          apiFetch<Report[]>("/admin/reports", { headers: { Authorization: `Bearer ${token}` } }),
          apiFetch<BannedUser[]>("/admin/users/banned", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setPublications(pubs);
        setOffers(offrs);
        setProviders(provs);
        setReports(reps);
        setBannedUsers(banned);
      } catch {}
      finally { setLoading(false); }
    }
    fetchAll();
  }, [token]);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  }

  async function approve(type: Tab, id: string) {
    setActionLoading(id);
    try {
      await apiFetch(`/admin/${type}/${id}/approve`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      removeItem(type, id);
      closeDetail();
    } catch {}
    setActionLoading(null);
  }

  async function reject(type: Tab, id: string, reason: string) {
    setActionLoading(id);
    try {
      await apiFetch(`/admin/${type}/${id}/reject`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason }),
      });
      removeItem(type, id);
      closeDetail();
    } catch {}
    setActionLoading(null);
    setRejectTarget(null);
  }

  function removeItem(type: Tab, id: string) {
    if (type === "publications") setPublications((p) => p.filter((x) => x.id !== id));
    if (type === "offers") setOffers((p) => p.filter((x) => x.id !== id));
    if (type === "providers") setProviders((p) => p.filter((x) => x.user_id !== id));
  }

  async function resolveReport(action: string, note: string, banDays?: number) {
    if (!resolveTarget) return;
    setActionLoading(resolveTarget.id);
    try {
      await apiFetch(`/admin/reports/${resolveTarget.id}/resolve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, note, ban_days: banDays }),
      });
      setReports((prev) => prev.map((r) => r.id === resolveTarget.id
        ? { ...r, status: action === "dismiss" ? "dismissed" : "resolved", action_taken: action, admin_note: note }
        : r
      ));
      setResolveTarget(null);
    } catch {}
    setActionLoading(null);
  }

  function closeDetail() {
    setDetailPub(null);
    setDetailOffer(null);
    setDetailProvider(null);
  }

  async function unbanUser(userId: string) {
    setActionLoading(userId);
    try {
      await apiFetch(`/admin/users/${userId}/unban`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      setBannedUsers((prev) => prev.filter((u) => u.user_id !== userId));
    } catch {}
    setActionLoading(null);
  }

  async function updateBan(userId: string, days: number) {
    setActionLoading(userId);
    try {
      const result = await apiFetch<{ ban_until: string | null }>(`/admin/users/${userId}/ban`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ban_days: days }),
      });
      setBannedUsers((prev) => prev.map((u) => u.user_id === userId ? { ...u, ban_until: result.ban_until } : u));
      setBanEditTarget(null);
    } catch {}
    setActionLoading(null);
  }

  const pendingReports = reports.filter((r) => r.status === "pending");
  const counts: Record<Tab, number> = { publications: publications.length, offers: offers.length, providers: providers.length, reports: pendingReports.length, banned: bannedUsers.length };
  const tabLabels: Record<Tab, string> = { publications: "Lieux", offers: "Offres", providers: "Prestataires", reports: "Signalements", banned: "Bannis" };

  if (!token) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Administration</p>
              <h1 className="text-lg font-extrabold text-slate-900 leading-none">Modération du contenu</h1>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {(["publications", "offers", "providers"] as Tab[]).map((t) => (
            <div key={t} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{tabLabels[t]}</p>
              <p className="text-3xl font-extrabold text-slate-900">{counts[t]}</p>
              <p className="text-xs font-medium text-slate-500 mt-1">en attente</p>
            </div>
          ))}
          <div className="bg-red-50 rounded-2xl p-5 border border-red-100 shadow-sm">
            <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Signalements</p>
            <p className="text-3xl font-extrabold text-red-600">{pendingReports.length}</p>
            <p className="text-xs font-medium text-red-400 mt-1">en attente</p>
          </div>
          <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100 shadow-sm">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">Bannis</p>
            <p className="text-3xl font-extrabold text-orange-600">{bannedUsers.length}</p>
            <p className="text-xs font-medium text-orange-400 mt-1">comptes suspendus</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["publications", "offers", "providers", "reports", "banned"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t
                  ? t === "reports" ? "bg-red-500 text-white shadow-md"
                  : t === "banned" ? "bg-orange-500 text-white shadow-md"
                  : "bg-primary text-slate-900 shadow-md shadow-primary/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}>
              {t === "reports" && <Flag size={14} />}
              {t === "banned" && <ShieldOff size={14} />}
              {tabLabels[t]}
              {counts[t] > 0 && (
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-extrabold ${
                  tab === t ? "bg-white text-slate-900" : "bg-red-100 text-red-600"
                }`}>
                  {counts[t]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {tab === "publications" && (
              publications.length === 0 ? <Empty label="Aucun lieu en attente" /> :
              publications.map((pub) => (
                <ContentCard key={pub.id}
                  title={pub.title}
                  badge={pub.type === "place" ? "Lieu" : "Expérience"}
                  meta={[pub.place_name, pub.region].filter(Boolean).join(" · ")}
                  description={pub.description}
                  date={pub.created_at}
                  loading={actionLoading === pub.id}
                  onOpen={() => setDetailPub(pub)}
                  onApprove={() => approve("publications", pub.id)}
                  onReject={() => setRejectTarget({ type: "publications", id: pub.id })}
                />
              ))
            )}

            {tab === "offers" && (
              offers.length === 0 ? <Empty label="Aucune offre en attente" /> :
              offers.map((offer) => (
                <ContentCard key={offer.id}
                  title={offer.title}
                  badge={offer.author_type === "guide" ? "Guide" : "Prestataire"}
                  meta={[offer.offer_type, offer.duration, offer.price != null ? `${offer.price} TND` : null].filter(Boolean).join(" · ")}
                  description={offer.description}
                  date={offer.created_at}
                  loading={actionLoading === offer.id}
                  onOpen={() => setDetailOffer(offer)}
                  onApprove={() => approve("offers", offer.id)}
                  onReject={() => setRejectTarget({ type: "offers", id: offer.id })}
                />
              ))
            )}

            {tab === "providers" && (
              providers.length === 0 ? <Empty label="Aucun prestataire en attente" /> :
              providers.map((prov) => (
                <ContentCard key={prov.user_id}
                  title={prov.full_name ?? prov.organization ?? "Prestataire"}
                  badge={PROVIDER_TYPE_LABELS[prov.provider_type ?? ""] ?? "Prestataire"}
                  meta={[prov.region, prov.activity_types?.slice(0, 2).join(", ")].filter(Boolean).join(" · ")}
                  description={prov.bio}
                  date={new Date().toISOString()}
                  loading={actionLoading === prov.user_id}
                  onOpen={() => setDetailProvider(prov)}
                  onApprove={() => approve("providers", prov.user_id)}
                  onReject={() => setRejectTarget({ type: "providers", id: prov.user_id })}
                />
              ))
            )}

            {tab === "reports" && (
              reports.length === 0 ? <Empty label="Aucun signalement" /> :
              reports.map((rep) => {
                const isPending = rep.status === "pending";
                const actionLabel: Record<string, string> = { warn: "Averti", ban: "Banni", delete: "Compte supprimé", dismiss: "Rejeté" };
                return (
                  <div key={rep.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${isPending ? "border-red-200" : "border-slate-100"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Reported user */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                            {rep.reported.photo
                              ? <img src={rep.reported.photo} alt="" className="w-full h-full object-cover" />
                              : <span className="material-symbols-outlined text-slate-400 text-base">person</span>}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-extrabold text-slate-900 truncate">{rep.reported.full_name ?? "—"}</p>
                            <p className="text-xs text-slate-400 font-medium capitalize">{rep.reported.role.replace("_", " ")}</p>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200">
                              <Flag size={11} /> {rep.reason}
                            </span>
                            {!isPending && rep.action_taken && (
                              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                                {actionLabel[rep.action_taken] ?? rep.action_taken}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-medium">
                            Signalé par <strong className="text-slate-600">{rep.reporter.full_name ?? "—"}</strong> · {new Date(rep.created_at).toLocaleDateString("fr-FR")}
                          </p>
                          {rep.admin_note && (
                            <p className="text-xs text-slate-500 mt-1 italic">Note : {rep.admin_note}</p>
                          )}
                        </div>
                      </div>

                      {isPending ? (
                        <button
                          onClick={() => setResolveTarget(rep)}
                          disabled={actionLoading === rep.id}
                          className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50">
                          {actionLoading === rep.id
                            ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            : <ShieldOff size={14} />}
                          Résoudre
                        </button>
                      ) : (
                        <span className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl ${rep.status === "dismissed" ? "bg-slate-100 text-slate-500" : "bg-green-50 text-green-600 border border-green-200"}`}>
                          {rep.status === "dismissed" ? "Rejeté" : "Résolu"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            {tab === "banned" && (
              bannedUsers.length === 0 ? <Empty label="Aucun utilisateur banni" /> :
              bannedUsers.map((u) => {
                const isPermanent = !u.ban_until;
                const banDate = u.ban_until ? new Date(u.ban_until) : null;
                const isExpired = banDate && new Date() > banDate;
                return (
                  <div key={u.user_id} className="bg-white rounded-2xl border border-orange-200 shadow-sm p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                        {u.photo ? <img src={u.photo} alt="" className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-slate-400 text-base">person</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-extrabold text-slate-900">{u.full_name ?? "—"}</p>
                        <p className="text-xs text-slate-400 font-medium">{u.email} · {u.role.replace("_", " ")}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {isPermanent ? (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-red-100 text-red-600">Ban permanent</span>
                          ) : isExpired ? (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500">Expiré le {banDate!.toLocaleDateString("fr-FR")}</span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-orange-100 text-orange-700">
                              <Clock size={11} /> Jusqu'au {banDate!.toLocaleDateString("fr-FR")}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Edit ban duration */}
                        {banEditTarget?.user_id === u.user_id ? (
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {BAN_DURATIONS.map((d) => (
                                <button key={d.days} onClick={() => setBanEditDays(d.days)}
                                  className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all ${banEditDays === d.days ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-600"}`}>
                                  {d.label}
                                </button>
                              ))}
                            </div>
                            <button onClick={() => updateBan(u.user_id, banEditDays)} disabled={actionLoading === u.user_id}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50">
                              {actionLoading === u.user_id ? "..." : "Appliquer"}
                            </button>
                            <button onClick={() => setBanEditTarget(null)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100">
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => { setBanEditTarget(u); setBanEditDays(7); }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border-2 border-orange-200 text-orange-600 hover:bg-orange-50 transition-colors">
                            <Clock size={13} /> Modifier
                          </button>
                        )}

                        {/* Unban */}
                        <button onClick={() => unbanUser(u.user_id)} disabled={actionLoading === u.user_id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50">
                          {actionLoading === u.user_id
                            ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            : <UserCheck size={13} />}
                          Débannir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Detail modals */}
      {detailPub && (
        <PublicationDetail pub={detailPub} onClose={closeDetail}
          onApprove={() => approve("publications", detailPub.id)}
          onReject={() => { closeDetail(); setRejectTarget({ type: "publications", id: detailPub.id }); }}
          loading={actionLoading === detailPub.id}
        />
      )}
      {detailOffer && (
        <OfferDetail offer={detailOffer} onClose={closeDetail}
          onApprove={() => approve("offers", detailOffer.id)}
          onReject={() => { closeDetail(); setRejectTarget({ type: "offers", id: detailOffer.id }); }}
          loading={actionLoading === detailOffer.id}
        />
      )}
      {detailProvider && (
        <ProviderDetail provider={detailProvider} onClose={closeDetail}
          onApprove={() => approve("providers", detailProvider.user_id)}
          onReject={() => { closeDetail(); setRejectTarget({ type: "providers", id: detailProvider.user_id }); }}
          loading={actionLoading === detailProvider.user_id}
        />
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          onConfirm={(reason) => reject(rejectTarget.type, rejectTarget.id, reason)}
          onClose={() => setRejectTarget(null)}
        />
      )}

      {/* Resolve report modal */}
      {resolveTarget && (
        <ResolveModal
          report={resolveTarget}
          onConfirm={(action, note) => resolveReport(action, note)}
          onClose={() => setResolveTarget(null)}
        />
      )}
    </div>
  );
}
