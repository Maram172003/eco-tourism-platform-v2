"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { apiFetch } from "@/lib/api";
import {
  Leaf, Check, X, LogOut, ChevronRight, ExternalLink, Flag, ShieldOff, Trash2,
  AlertTriangle, ShieldCheck, Clock, UserCheck, BarChart3, Users, BookOpen,
  MapPin, CircuitBoard, Briefcase, MessageSquare, CalendarCheck, Search,
  ChevronLeft, Eye, Ban, RefreshCw, Star, TrendingUp, Leaf as LeafIcon,
  Globe, Phone, Mail, Map, FileText, Image as ImageIcon, Info, Zap,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => <div className="h-[220px] rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 animate-pulse" />,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab =
  | "statistics" | "publications" | "offers" | "projects" | "circuits"
  | "guide-offerings" | "reports" | "banned" | "users" | "providers"
  | "bookings" | "reviews" | "sustainability" | "audit-logs";

type StatsOverview = {
  users: { total: number; by_role: Record<string, number>; recent: any[] };
  organizations: { total: number };
  publications: { total: number; by_status: Record<string, number> };
  offers: { total: number; by_status: Record<string, number> };
  circuits: { total: number; by_status: Record<string, number> };
  venues: { total: number; by_status: Record<string, number> };
  guide_offerings: { total: number; by_status: Record<string, number> };
  bookings: { total: number; by_status: Record<string, number>; today: number; this_month: number; revenue_today: number; revenue_this_month: number };
  reviews: { total: number };
  suspended_providers: number;
  pending_moderation: number;
  moderation: { pending_publications: number; pending_offers: number; pending_circuits: number; pending_venues: number; pending_guide_offerings: number };
};

type PendingPublication = { id: string; type: "place" | "experience"; title: string; description: string | null; region: string | null; place_name: string | null; images: string[] | null; latitude: number | null; longitude: number | null; author_id: string; created_at: string };
type PendingOffer = { id: string; title: string; description: string | null; price: number | null; duration: string | null; offer_type: string | null; author_type: string; author_id: string; images: string[] | null; sustainability_score: number | null; created_at: string; status: string };
type PendingVenue = { id: string; name: string; description: string | null; region: string | null; address: string | null; photo: string | null; photos: string[] | null; venue_type: string[] | null; lat: number | null; lng: number | null; sustainability_score: number | null; provider_id: string; created_at: string };
type PendingCircuit = { id: string; title: string; description: string | null; region: string | null; base_price: number | null; duration_days: number | null; cover_image: string | null; author_id: string; created_at: string };
type PendingGuideOffering = { id: string; title: string; description: string | null; price: number | null; languages: string[] | null; guide_id: string; created_at: string };

type UserList = { id: string; email: string; role: string; status: string; created_at: string; ban_until: string | null; full_name: string | null; photo: string | null };
type ProviderList = { user_id: string; full_name: string; organization: string | null; city: string | null; status: string; sustainability_score: number | null; venues_count: number; offers_count: number; bookings_count: number; revenue: number; created_at: string };
type BookingList = { id: string; booking_ref: string; status: string; total_price: number; currency: string; created_at: string; offer_title: string | null; traveler_email: string | null };
type ReviewList = { id: string; author_id: string; author_email: string | null; target_type: string; target_id: string; rating: number; comment: string | null; created_at: string };
type SustainabilityStats = { offers_with_score: number; avg_offer_score: string; top_providers: any[]; top_venues: any[]; total_carbon_kg: string };
type AuditLog = { id: string; admin_id: string; entity_type: string; entity_id: string; action: string; reason: string | null; created_at: string };

type BannedUser = { user_id: string; email: string; role: string; status: string; ban_until: string | null; banned_at: string; full_name: string | null; photo: string | null };
type ReportUser = { user_id: string; full_name: string | null; photo: string | null; role: string; email: string | null; status: string | null };
type Report = { id: string; reporter_id: string; reporter_role: string; reported_id: string; reported_role: string; reason: string; status: string; action_taken: string | null; admin_note: string | null; created_at: string; resolved_at: string | null; reporter: ReportUser; reported: ReportUser };

// ─── Design System ──────────────────────────────────────────────────────────

const GLASS = "backdrop-blur-xl bg-white/70 border border-white/50 shadow-xl shadow-slate-200/40";
const GLASS_HOVER = "hover:bg-white/90 hover:shadow-2xl hover:shadow-slate-300/50";
const CARD = "bg-white rounded-3xl border border-slate-100/80 shadow-sm shadow-slate-200/50 transition-all duration-300";
const CARD_HOVER = "hover:shadow-lg hover:shadow-slate-300/40 hover:border-slate-200/80";
const GRADIENT_PRIMARY = "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600";
const GRADIENT_BLUE = "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600";
const GRADIENT_AMBER = "bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500";
const GRADIENT_RED = "bg-gradient-to-br from-red-400 via-red-500 to-rose-600";
const GRADIENT_PURPLE = "bg-gradient-to-br from-purple-400 via-purple-500 to-violet-600";
const GRADIENT_TEAL = "bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-600";
const GRADIENT_PINK = "bg-gradient-to-br from-pink-400 via-pink-500 to-rose-500";
const GRADIENT_SLATE = "bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600";

// ─── Shared Components ────────────────────────────────────────────────────────

function TypeBadge({ label, color = "emerald" }: { label: string; color?: string }) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    blue: "bg-blue-50 text-blue-700 border-blue-200/60",
    amber: "bg-amber-50 text-amber-700 border-amber-200/60",
    red: "bg-red-50 text-red-600 border-red-200/60",
    purple: "bg-purple-50 text-purple-700 border-purple-200/60",
  };
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold border ${colors[color] ?? colors.emerald}`}>{label}</span>;
}

function Empty({ label }: { label: string }) {
  return (
    <div className="text-center py-24">
      <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center border border-green-100/50">
        <Check className="w-10 h-10 text-emerald-400" />
      </div>
      <p className="text-sm font-bold text-slate-500">{label}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, gradient, trend }: { icon: any; label: string; value: string | number; gradient: string; trend?: string }) {
  return (
    <div className={`${CARD} ${CARD_HOVER} p-5 relative overflow-hidden group cursor-default`}>
      <div className={`absolute top-0 right-0 w-24 h-24 ${gradient} opacity-10 rounded-bl-[60px] transition-all duration-500 group-hover:opacity-20 group-hover:scale-110`} />
      <div className={`w-10 h-10 rounded-2xl ${gradient} flex items-center justify-center mb-3 shadow-lg shadow-black/10`}>
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
      {trend && <p className="text-xs font-bold text-emerald-500 mt-1">{trend}</p>}
    </div>
  );
}

function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 hover:shadow-md"><ChevronLeft size={16} /></button>
      <div className="flex items-center gap-1 bg-white rounded-2xl border border-slate-200/80 px-4 py-2">
        <span className="text-sm font-extrabold text-slate-900">{page}</span>
        <span className="text-xs text-slate-400 font-bold">/ {pages}</span>
      </div>
      <button disabled={page >= pages} onClick={() => onChange(page + 1)} className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 hover:shadow-md"><ChevronRight size={16} /></button>
    </div>
  );
}

function RejectModal({ onConfirm, onClose }: { onConfirm: (reason: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-7 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto"><ShieldOff size={24} className="text-red-500" /></div>
        <h3 className="text-lg font-extrabold text-slate-900 text-center">Motif de rejet</h3>
        <textarea className="w-full h-28 px-5 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-sm text-slate-800 font-medium resize-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all" placeholder="Expliquez pourquoi…" value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-5 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all">Annuler</button>
          <button disabled={!reason.trim()} onClick={() => reason.trim() && onConfirm(reason.trim())} className="flex-1 px-5 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/25">Rejeter</button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-7 py-5 flex items-center justify-between z-10">
          <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-2xl hover:bg-slate-100 flex items-center justify-center transition-colors"><X size={18} className="text-slate-500" /></button>
        </div>
        <div className="p-7 overflow-y-auto max-h-[calc(85vh-80px)]">{children}</div>
      </div>
    </div>
  );
}

function DetailField({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="flex items-start gap-3.5 py-3 border-b border-slate-50 last:border-0 group">
      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
        <Icon size={14} className="text-slate-400 group-hover:text-primary transition-colors" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em]">{label}</p>
        <p className="text-sm font-semibold text-slate-800 mt-0.5 break-words leading-relaxed">{Array.isArray(value) ? value.join(", ") : String(value)}</p>
      </div>
    </div>
  );
}

function BanModal({ onConfirm, onClose }: { onConfirm: (days: number | null, note: string) => void; onClose: () => void }) {
  const [days, setDays] = useState("");
  const [note, setNote] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-7 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto"><Ban size={24} className="text-orange-500" /></div>
        <h3 className="text-lg font-extrabold text-slate-900 text-center">Bannir l'utilisateur</h3>
        <div>
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em]">Durée (jours, vide = permanent)</label>
          <input type="number" min="1" className="w-full mt-2 px-5 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-sm font-medium focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all" placeholder="ex: 7, 30, 90…" value={days} onChange={(e) => setDays(e.target.value)} />
        </div>
        <div>
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em]">Note (optionnel)</label>
          <textarea className="w-full h-20 mt-2 px-5 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-sm text-slate-800 font-medium resize-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all" placeholder="Raison du bannissement…" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-5 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all">Annuler</button>
          <button onClick={() => onConfirm(days ? +days : null, note)} className="flex-1 px-5 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg shadow-orange-500/25">Bannir</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [tab, setTab] = useState<Tab>("statistics");

  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [publications, setPublications] = useState<PendingPublication[]>([]);
  const [offers, setOffers] = useState<PendingOffer[]>([]);
  const [venues, setVenues] = useState<PendingVenue[]>([]);
  const [circuits, setCircuits] = useState<PendingCircuit[]>([]);
  const [guideOfferings, setGuideOfferings] = useState<PendingGuideOffering[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [users, setUsers] = useState<UserList[]>([]);
  const [usersMeta, setUsersMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [providers, setProviders] = useState<ProviderList[]>([]);
  const [providersMeta, setProvidersMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [bookings, setBookings] = useState<BookingList[]>([]);
  const [bookingsMeta, setBookingsMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [reviews, setReviews] = useState<ReviewList[]>([]);
  const [reviewsMeta, setReviewsMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [sustainability, setSustainability] = useState<SustainabilityStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditMeta, setAuditMeta] = useState({ total: 0, page: 1, pages: 1 });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<{ type: string; id: string } | null>(null);
  const [resolveTarget, setResolveTarget] = useState<Report | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailType, setDetailType] = useState<string | null>(null);
  const [banTarget, setBanTarget] = useState<string | null>(null);

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
        const [s, pubs, offrs, projs, circs, gos, reps, banned] = await Promise.all([
          apiFetch<StatsOverview>("/admin/stats/overview", { headers: { Authorization: `Bearer ${token}` } }),
          apiFetch<PendingPublication[]>("/admin/publications/pending", { headers: { Authorization: `Bearer ${token}` } }),
          apiFetch<PendingOffer[]>("/admin/offers/pending", { headers: { Authorization: `Bearer ${token}` } }),
          apiFetch<PendingVenue[]>("/admin/projects/pending", { headers: { Authorization: `Bearer ${token}` } }),
          apiFetch<PendingCircuit[]>("/admin/circuits/pending", { headers: { Authorization: `Bearer ${token}` } }),
          apiFetch<PendingGuideOffering[]>("/admin/guide-offerings/pending", { headers: { Authorization: `Bearer ${token}` } }),
          apiFetch<Report[]>("/admin/reports", { headers: { Authorization: `Bearer ${token}` } }),
          apiFetch<BannedUser[]>("/admin/users/banned", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setStats(s); setPublications(pubs); setOffers(offrs); setVenues(projs);
        setCircuits(circs); setGuideOfferings(gos); setReports(reps); setBannedUsers(banned);
      } catch {}
      finally { setLoading(false); }
    }
    fetchAll();
  }, [token]);

  const fetchTabData = useCallback(async (t: Tab, page = 1) => {
    if (!token) return;
    const h = { Authorization: `Bearer ${token}` };
    try {
      if (t === "users") {
        const params = new URLSearchParams({ page: String(page), limit: "15" });
        if (roleFilter) params.set("role", roleFilter);
        if (statusFilter) params.set("status", statusFilter);
        if (searchQuery) params.set("search", searchQuery);
        const r = await apiFetch<{ users: UserList[]; total: number; page: number; pages: number }>(`/admin/users?${params}`, { headers: h });
        setUsers(r.users); setUsersMeta({ total: r.total, page: r.page, pages: r.pages });
      } else if (t === "providers") {
        const params = new URLSearchParams({ page: String(page), limit: "15" });
        if (statusFilter) params.set("status", statusFilter);
        if (searchQuery) params.set("search", searchQuery);
        const r = await apiFetch<{ providers: ProviderList[]; total: number; page: number; pages: number }>(`/admin/providers?${params}`, { headers: h });
        setProviders(r.providers); setProvidersMeta({ total: r.total, page: r.page, pages: r.pages });
      } else if (t === "bookings") {
        const params = new URLSearchParams({ page: String(page), limit: "15" });
        if (statusFilter) params.set("status", statusFilter);
        if (searchQuery) params.set("search", searchQuery);
        const r = await apiFetch<{ bookings: BookingList[]; total: number; page: number; pages: number }>(`/admin/bookings?${params}`, { headers: h });
        setBookings(r.bookings); setBookingsMeta({ total: r.total, page: r.page, pages: r.pages });
      } else if (t === "reviews") {
        const r = await apiFetch<{ reviews: ReviewList[]; total: number; page: number; pages: number }>(`/admin/reviews?page=${page}&limit=15`, { headers: h });
        setReviews(r.reviews); setReviewsMeta({ total: r.total, page: r.page, pages: r.pages });
      } else if (t === "sustainability") {
        const r = await apiFetch<SustainabilityStats>("/admin/sustainability", { headers: h });
        setSustainability(r);
      } else if (t === "audit-logs") {
        const r = await apiFetch<{ logs: AuditLog[]; total: number; page: number; pages: number }>(`/admin/audit-logs?page=${page}&limit=30`, { headers: h });
        setAuditLogs(r.logs); setAuditMeta({ total: r.total, page: r.page, pages: r.pages });
      }
    } catch {}
  }, [token, roleFilter, statusFilter, searchQuery]);

  useEffect(() => { if (tab !== "statistics") fetchTabData(tab); }, [tab, fetchTabData]);

  async function approve(type: string, id: string) {
    setActionLoading(id);
    try {
      await apiFetch(`/admin/${type}/${id}/approve`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      if (type === "publications") setPublications((p) => p.filter((x) => x.id !== id));
      if (type === "offers") setOffers((p) => p.filter((x) => x.id !== id));
      if (type === "projects") setVenues((p) => p.filter((x) => x.id !== id));
      if (type === "circuits") setCircuits((p) => p.filter((x) => x.id !== id));
      if (type === "guide-offerings") setGuideOfferings((p) => p.filter((x) => x.id !== id));
    } catch {}
    setActionLoading(null);
  }

  async function reject(type: string, id: string, reason: string) {
    setActionLoading(id);
    try {
      await apiFetch(`/admin/${type}/${id}/reject`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ reason }) });
      if (type === "publications") setPublications((p) => p.filter((x) => x.id !== id));
      if (type === "offers") setOffers((p) => p.filter((x) => x.id !== id));
      if (type === "projects") setVenues((p) => p.filter((x) => x.id !== id));
      if (type === "circuits") setCircuits((p) => p.filter((x) => x.id !== id));
      if (type === "guide-offerings") setGuideOfferings((p) => p.filter((x) => x.id !== id));
    } catch {}
    setActionLoading(null);
    setRejectTarget(null);
  }

  async function unbanUser(userId: string) {
    setActionLoading(userId);
    try {
      await apiFetch(`/admin/users/${userId}/unban`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      setBannedUsers((prev) => prev.filter((u) => u.user_id !== userId));
    } catch {}
    setActionLoading(null);
  }

  async function suspendProvider(id: string) {
    setActionLoading(id);
    try {
      await apiFetch(`/admin/providers/${id}/suspend`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      setProviders((prev) => prev.map((p) => p.user_id === id ? { ...p, status: "suspended" } : p));
    } catch {}
    setActionLoading(null);
  }

  async function reactivateProvider(id: string) {
    setActionLoading(id);
    try {
      await apiFetch(`/admin/providers/${id}/reactivate`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      setProviders((prev) => prev.map((p) => p.user_id === id ? { ...p, status: "active" } : p));
    } catch {}
    setActionLoading(null);
  }

  async function deleteUser(id: string) {
    setActionLoading(id);
    try {
      await apiFetch(`/admin/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {}
    setActionLoading(null);
  }

  async function banUser(id: string, days: number | null, note: string) {
    setActionLoading(id);
    try {
      await apiFetch(`/admin/users/${id}/ban`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ ban_days: days, note }) });
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: "banned" } : u));
    } catch {}
    setActionLoading(null);
    setBanTarget(null);
  }

  async function deleteReview(id: string) {
    setActionLoading(id);
    try {
      await apiFetch(`/admin/reviews/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {}
    setActionLoading(null);
  }

  async function resolveReportAction(action: string, note: string, banDays?: number) {
    if (!resolveTarget) return;
    setActionLoading(resolveTarget.id);
    try {
      await apiFetch(`/admin/reports/${resolveTarget.id}/resolve`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ action, note, ban_days: banDays }) });
      setReports((prev) => prev.map((r) => r.id === resolveTarget.id ? { ...r, status: action === "dismiss" ? "dismissed" : "resolved", action_taken: action, admin_note: note } : r));
      setResolveTarget(null);
    } catch {}
    setActionLoading(null);
  }

  async function openDetail(type: string, id: string) {
    setDetailLoading(true); setDetailType(type); setDetailData(null);
    try {
      const endpoints: Record<string, string> = { publication: `/admin/publications/${id}`, offer: `/admin/offers/${id}`, venue: `/admin/projects/${id}`, circuit: `/admin/circuits/${id}`, "guide-offering": `/admin/guide-offerings/${id}`, user: `/admin/users/${id}` };
      const data = await apiFetch(endpoints[type], { headers: { Authorization: `Bearer ${token}` } });
      setDetailData(data);
    } catch {}
    setDetailLoading(false);
  }

  function closeDetail() { setDetailData(null); setDetailType(null); }

  function handleLogout() {
    localStorage.removeItem("access_token"); localStorage.removeItem("refresh_token"); localStorage.removeItem("user");
    router.push("/auth/login");
  }

  const pendingReports = reports.filter((r) => r.status === "pending");
  const tabLabels: Record<Tab, string> = {
    statistics: "Dashboard", publications: "Lieux", offers: "Offres", projects: "Établissements",
    circuits: "Circuits", "guide-offerings": "Offres Guide", reports: "Signalements", banned: "Bannis",
    users: "Utilisateurs", providers: "Providers", bookings: "Réservations", reviews: "Avis",
    sustainability: "Durabilité", "audit-logs": "Journal d'audit",
  };

  const tabIcons: Record<Tab, any> = {
    statistics: BarChart3, publications: MapPin, offers: Briefcase, projects: MapPin,
    circuits: CircuitBoard, "guide-offerings": Users, reports: Flag, banned: Ban,
    users: Users, providers: Briefcase, bookings: CalendarCheck, reviews: Star,
    sustainability: LeafIcon, "audit-logs": ShieldCheck,
  };

  const menuGroups = [
    { label: "Supervision", tabs: ["statistics" as Tab, "users" as Tab, "providers" as Tab] },
    { label: "Contenu", tabs: ["publications" as Tab, "offers" as Tab, "projects" as Tab, "circuits" as Tab, "guide-offerings" as Tab] },
    { label: "Opérations", tabs: ["bookings" as Tab, "reviews" as Tab, "reports" as Tab, "banned" as Tab] },
    { label: "Insights", tabs: ["sustainability" as Tab, "audit-logs" as Tab] },
  ];

  if (!token) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center">
      <div className="w-12 h-12 rounded-3xl border-4 border-emerald-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Header */}
      <header className={`${GLASS} sticky top-0 z-30 border-b border-slate-200/50`}>
        <div className="max-w-[1600px] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-11 h-11 ${GRADIENT_PRIMARY} rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30`}>
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-[0.2em]">Administration</p>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Supervision de la plateforme</h1>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-slate-600 hover:bg-white/80 hover:shadow-lg hover:shadow-slate-200/50 border border-transparent hover:border-slate-200/80 transition-all duration-300">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <nav className="w-60 shrink-0 space-y-7">
            {menuGroups.map((g) => (
              <div key={g.label}>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-3 px-4">{g.label}</p>
                <div className="space-y-1">
                  {g.tabs.map((t) => {
                    const Icon = tabIcons[t];
                    return (
                      <button key={t} onClick={() => { setTab(t); setSearchQuery(""); setRoleFilter(""); setStatusFilter(""); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 text-left group ${
                          tab === t
                            ? `${GRADIENT_PRIMARY} text-white shadow-lg shadow-emerald-500/30`
                            : "text-slate-500 hover:text-slate-800 hover:bg-white/80 hover:shadow-md hover:shadow-slate-200/50"
                        }`}>
                        <Icon size={16} className={tab === t ? "text-white" : "text-slate-400 group-hover:text-emerald-500 transition-colors"} />
                        <span className="flex-1">{tabLabels[t]}</span>
                        {t === "reports" && pendingReports.length > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-extrabold bg-white text-red-600 shadow-sm">{pendingReports.length}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="w-12 h-12 rounded-3xl border-4 border-emerald-500 border-t-transparent animate-spin" />
                <p className="text-sm font-bold text-slate-400">Chargement…</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* DASHBOARD */}
                {/* ═══════════════════════════════════════════════════════════ */}
                {tab === "statistics" && stats && (() => {
                  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];
                  const roleData = Object.entries(stats.users.by_role).map(([role, count]) => ({ name: role.replace("_", " "), value: Number(count) }));
                  const bookingStatusData = Object.entries(stats.bookings.by_status).map(([status, count]) => ({ name: status, count: Number(count) }));
                  const moderationData = [
                    { name: "Publications", value: stats.moderation.pending_publications },
                    { name: "Offres", value: stats.moderation.pending_offers },
                    { name: "Circuits", value: stats.moderation.pending_circuits },
                    { name: "Établissements", value: stats.moderation.pending_venues },
                    { name: "Offres Guide", value: stats.moderation.pending_guide_offerings },
                  ].filter((d) => d.value > 0);
                  const revenueData = [
                    { name: "Aujourd'hui", revenue: stats.bookings.revenue_today, reservations: stats.bookings.today },
                    { name: "Ce mois", revenue: stats.bookings.revenue_this_month, reservations: stats.bookings.this_month },
                  ];
                  return (
                  <div className="space-y-6">
                    {/* KPIs Row 1 */}
                    <div className="grid grid-cols-4 gap-5">
                      <StatCard icon={Users} label="Utilisateurs" value={stats.users.total} gradient={GRADIENT_BLUE} />
                      <StatCard icon={MapPin} label="Établissements" value={stats.venues.total} gradient={GRADIENT_PRIMARY} />
                      <StatCard icon={Briefcase} label="Offres" value={stats.offers.total} gradient={GRADIENT_AMBER} />
                      <StatCard icon={CalendarCheck} label="Réservations" value={stats.bookings.total} gradient={GRADIENT_PURPLE} />
                    </div>
                    {/* KPIs Row 2 */}
                    <div className="grid grid-cols-4 gap-5">
                      <StatCard icon={CircuitBoard} label="Circuits" value={stats.circuits.total} gradient={GRADIENT_TEAL} />
                      <StatCard icon={BookOpen} label="Offres Guide" value={stats.guide_offerings.total} gradient={GRADIENT_PINK} />
                      <StatCard icon={MessageSquare} label="Avis" value={stats.reviews.total} gradient={GRADIENT_SLATE} />
                      <StatCard icon={TrendingUp} label="Revenu ce mois" value={`${stats.bookings.revenue_this_month.toLocaleString("fr-FR")} TND`} gradient={GRADIENT_PRIMARY} />
                    </div>
                    {/* KPIs Row 3 */}
                    <div className="grid grid-cols-4 gap-5">
                      <StatCard icon={Zap} label="Résa. aujourd'hui" value={stats.bookings.today} gradient={GRADIENT_BLUE} />
                      <StatCard icon={CalendarCheck} label="Résa. ce mois" value={stats.bookings.this_month} gradient={GRADIENT_PURPLE} />
                      <StatCard icon={TrendingUp} label="CA aujourd'hui" value={`${stats.bookings.revenue_today.toLocaleString("fr-FR")} TND`} gradient={GRADIENT_AMBER} />
                      <StatCard icon={LeafIcon} label="Modération" value={stats.pending_moderation} gradient={GRADIENT_RED} />
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className={`${CARD} p-7`}>
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-[0.15em] mb-5">Répartition des utilisateurs</h3>
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart>
                            <Pie data={roleData} cx="50%" cy="50%" innerRadius={65} outerRadius={105} paddingAngle={5} dataKey="value" label={({ name, percent }: any) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}>
                              {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth={2} />)}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className={`${CARD} p-7`}>
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-[0.15em] mb-5">Réservations par statut</h3>
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={bookingStatusData} barSize={36}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 700, fill: "#64748b" }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                            <Tooltip />
                            <Bar dataKey="count" radius={[12, 12, 0, 0]}>
                              {bookingStatusData.map((entry, i) => (
                                <Cell key={i} fill={entry.name === "confirmed" ? "#10b981" : entry.name === "completed" ? "#3b82f6" : entry.name === "cancelled" ? "#ef4444" : entry.name === "pending" ? "#f59e0b" : "#94a3b8"} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className={`${CARD} p-7`}>
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-[0.15em] mb-5">File de modération</h3>
                        {moderationData.length === 0 ? (
                          <div className="flex items-center justify-center h-[280px]">
                            <div className="text-center"><div className="w-16 h-16 mx-auto mb-3 rounded-3xl bg-emerald-50 flex items-center justify-center"><Check className="w-8 h-8 text-emerald-400" /></div><p className="text-sm font-bold text-slate-500">Tout est à jour !</p></div>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={moderationData} layout="vertical" barSize={24}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fontWeight: 700, fill: "#64748b" }} />
                              <Tooltip />
                              <Bar dataKey="value" radius={[0, 12, 12, 0]} fill="#f59e0b" />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>

                      <div className={`${CARD} p-7`}>
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-[0.15em] mb-5">Revenu & Réservations</h3>
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={revenueData} barSize={44}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 700, fill: "#64748b" }} />
                            <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="revenue" name="Revenu (TND)" fill="#10b981" radius={[12, 12, 0, 0]} />
                            <Bar yAxisId="right" dataKey="reservations" name="Réservations" fill="#3b82f6" radius={[12, 12, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Recent users */}
                    <div className={`${CARD} p-7`}>
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-[0.15em] mb-5">Derniers inscrits</h3>
                      <div className="space-y-3">
                        {stats.users.recent.map((u) => (
                          <div key={u.id} className="flex items-center gap-4 bg-slate-50/50 rounded-2xl p-4 hover:bg-white hover:shadow-md transition-all duration-300 group">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center border border-slate-100 group-hover:border-primary/20 transition-colors">
                              <span className="material-symbols-outlined text-slate-400 text-sm group-hover:text-primary transition-colors">person</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-extrabold text-slate-900 truncate">{u.email}</p>
                              <p className="text-xs text-slate-400 font-bold capitalize">{u.role.replace("_", " ")}</p>
                            </div>
                            <span className={`text-[11px] font-extrabold px-3 py-1 rounded-xl ${u.status === "banned" ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>{u.status}</span>
                            <span className="text-xs text-slate-400 font-bold">{new Date(u.created_at).toLocaleDateString("fr-FR")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  );
                })()}

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* USERS */}
                {/* ═══════════════════════════════════════════════════════════ */}
                {tab === "users" && (
                  <div className="space-y-5">
                    <div className={`${CARD} p-5 flex items-center gap-4`}>
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-sm font-medium focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all" placeholder="Rechercher par email…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchTabData("users")} />
                      </div>
                      <select className="px-4 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-sm font-bold focus:ring-2 focus:ring-emerald-400 focus:border-transparent" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="">Tous les rôles</option><option value="eco_traveler">Éco-Voyageur</option><option value="provider">Provider</option><option value="guide">Guide</option>
                      </select>
                      <select className="px-4 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-sm font-bold focus:ring-2 focus:ring-emerald-400 focus:border-transparent" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">Tous les statuts</option><option value="active">Actif</option><option value="banned">Banni</option><option value="pending">En attente</option>
                      </select>
                      <button onClick={() => fetchTabData("users")} className={`px-6 py-3 rounded-2xl text-sm font-bold text-white ${GRADIENT_PRIMARY} shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all`}>Rechercher</button>
                    </div>
                    <p className="text-xs font-extrabold text-slate-400 uppercase tracking-[0.15em]">{usersMeta.total} utilisateurs trouvés</p>
                    {users.length === 0 ? <Empty label="Aucun utilisateur" /> : (
                      <div className="space-y-3">
                        {users.map((u) => (
                          <div key={u.id} className={`${CARD} ${CARD_HOVER} p-5 flex items-center gap-5`}>
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden flex items-center justify-center shrink-0 border border-slate-100">
                              {u.photo ? <img src={u.photo} alt="" className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-slate-400 text-sm">person</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-extrabold text-slate-900 truncate">{u.full_name ?? u.email}</p>
                              <p className="text-xs text-slate-400 font-bold">{u.email} · {u.role.replace("_", " ")}</p>
                            </div>
                            <span className={`text-[11px] font-extrabold px-3 py-1 rounded-xl ${u.status === "banned" ? "bg-red-50 text-red-600 border border-red-100" : u.status === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>{u.status}</span>
                            <span className="text-xs text-slate-400 font-bold">{new Date(u.created_at).toLocaleDateString("fr-FR")}</span>
                            <div className="flex gap-2 shrink-0">
                              <button onClick={() => openDetail("user", u.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-all"><Eye size={13} /> Détails</button>
                              {u.status === "banned" ? (
                                <button onClick={() => unbanUser(u.id)} disabled={actionLoading === u.id} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 shadow-lg shadow-emerald-500/25 transition-all"><RefreshCw size={13} /> Débannir</button>
                              ) : (
                                <>
                                  <button onClick={() => setBanTarget(u.id)} disabled={actionLoading === u.id} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100 disabled:opacity-50 transition-all"><Ban size={13} /> Bannir</button>
                                  <button onClick={() => deleteUser(u.id)} disabled={actionLoading === u.id} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 disabled:opacity-50 transition-all"><Trash2 size={13} /> Supprimer</button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <Pagination page={usersMeta.page} pages={usersMeta.pages} onChange={(p) => fetchTabData("users", p)} />
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* PROVIDERS */}
                {/* ═══════════════════════════════════════════════════════════ */}
                {tab === "providers" && (
                  <div className="space-y-5">
                    <div className={`${CARD} p-5 flex items-center gap-4`}>
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-sm font-medium focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all" placeholder="Rechercher…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchTabData("providers")} />
                      </div>
                      <select className="px-4 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-sm font-bold focus:ring-2 focus:ring-emerald-400 focus:border-transparent" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">Tous les statuts</option><option value="active">Actif</option><option value="suspended">Suspendu</option><option value="pending">En attente</option>
                      </select>
                      <button onClick={() => fetchTabData("providers")} className={`px-6 py-3 rounded-2xl text-sm font-bold text-white ${GRADIENT_PRIMARY} shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all`}>Rechercher</button>
                    </div>
                    <p className="text-xs font-extrabold text-slate-400 uppercase tracking-[0.15em]">{providersMeta.total} providers</p>
                    {providers.length === 0 ? <Empty label="Aucun provider" /> : (
                      <div className="space-y-3">
                        {providers.map((p) => (
                          <div key={p.user_id} className={`${CARD} ${CARD_HOVER} p-5`}>
                            <div className="flex items-center gap-5">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-extrabold text-slate-900">{p.full_name}</p>
                                <p className="text-xs text-slate-400 font-bold">{p.organization ?? "—"} · {p.city ?? "—"}</p>
                              </div>
                              <div className="flex items-center gap-5 text-xs font-bold text-slate-500">
                                <div className="text-center"><p className="text-lg font-extrabold text-slate-900">{p.venues_count}</p><p className="text-[10px] text-slate-400">étab.</p></div>
                                <div className="text-center"><p className="text-lg font-extrabold text-slate-900">{p.offers_count}</p><p className="text-[10px] text-slate-400">offres</p></div>
                                <div className="text-center"><p className="text-lg font-extrabold text-slate-900">{p.bookings_count}</p><p className="text-[10px] text-slate-400">résa.</p></div>
                                <div className="text-center"><p className="text-lg font-extrabold text-emerald-600">{p.revenue.toLocaleString("fr-FR")}</p><p className="text-[10px] text-slate-400">TND</p></div>
                                {p.sustainability_score != null && <div className="text-center"><p className="text-lg font-extrabold text-primary">🌿 {p.sustainability_score}</p><p className="text-[10px] text-slate-400">score</p></div>}
                              </div>
                              <span className={`text-[11px] font-extrabold px-3 py-1 rounded-xl ${p.status === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : p.status === "suspended" ? "bg-red-50 text-red-600 border border-red-100" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>{p.status}</span>
                              <div className="flex gap-2 shrink-0">
                                {p.status === "active" ? (
                                  <button onClick={() => suspendProvider(p.user_id)} disabled={actionLoading === p.user_id} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100 disabled:opacity-50 transition-all"><Ban size={13} /> Suspendre</button>
                                ) : (
                                  <button onClick={() => reactivateProvider(p.user_id)} disabled={actionLoading === p.user_id} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 disabled:opacity-50 transition-all"><RefreshCw size={13} /> Réactiver</button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <Pagination page={providersMeta.page} pages={providersMeta.pages} onChange={(p) => fetchTabData("providers", p)} />
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* BOOKINGS */}
                {/* ═══════════════════════════════════════════════════════════ */}
                {tab === "bookings" && (
                  <div className="space-y-5">
                    <div className={`${CARD} p-5 flex items-center gap-4`}>
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-sm font-medium focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all" placeholder="Rechercher par référence…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchTabData("bookings")} />
                      </div>
                      <select className="px-4 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-sm font-bold focus:ring-2 focus:ring-emerald-400 focus:border-transparent" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">Tous les statuts</option><option value="pending">En attente</option><option value="confirmed">Confirmée</option><option value="completed">Terminée</option><option value="cancelled">Annulée</option>
                      </select>
                      <button onClick={() => fetchTabData("bookings")} className={`px-6 py-3 rounded-2xl text-sm font-bold text-white ${GRADIENT_PRIMARY} shadow-lg shadow-emerald-500/25 transition-all`}>Rechercher</button>
                    </div>
                    <p className="text-xs font-extrabold text-slate-400 uppercase tracking-[0.15em]">{bookingsMeta.total} réservations</p>
                    {bookings.length === 0 ? <Empty label="Aucune réservation" /> : (
                      <div className="space-y-3">
                        {bookings.map((b) => (
                          <div key={b.id} className={`${CARD} ${CARD_HOVER} p-5 flex items-center gap-5`}>
                            <div className="w-11 h-11 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100"><CalendarCheck size={18} className="text-purple-500" /></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-extrabold text-slate-900">{b.booking_ref}</p>
                              <p className="text-xs text-slate-400 font-bold">{b.offer_title ?? "—"} · {b.traveler_email ?? "—"}</p>
                            </div>
                            <span className="text-sm font-extrabold text-emerald-600">{b.total_price} {b.currency}</span>
                            <span className={`text-[11px] font-extrabold px-3 py-1 rounded-xl ${
                              b.status === "confirmed" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                              b.status === "completed" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                              b.status === "cancelled" ? "bg-red-50 text-red-600 border border-red-100" :
                              "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}>{b.status}</span>
                            <span className="text-xs text-slate-400 font-bold">{new Date(b.created_at).toLocaleDateString("fr-FR")}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <Pagination page={bookingsMeta.page} pages={bookingsMeta.pages} onChange={(p) => fetchTabData("bookings", p)} />
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* REVIEWS */}
                {/* ═══════════════════════════════════════════════════════════ */}
                {tab === "reviews" && (
                  <div className="space-y-5">
                    <p className="text-xs font-extrabold text-slate-400 uppercase tracking-[0.15em]">{reviewsMeta.total} avis</p>
                    {reviews.length === 0 ? <Empty label="Aucun avis" /> : (
                      <div className="space-y-3">
                        {reviews.map((r) => (
                          <div key={r.id} className={`${CARD} ${CARD_HOVER} p-5 flex items-center gap-5`}>
                            <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100">
                              <div className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className={i < r.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />)}</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">{r.comment ?? "Sans commentaire"}</p>
                              <p className="text-xs text-slate-400 font-bold">{r.author_email} · {r.target_type} · {new Date(r.created_at).toLocaleDateString("fr-FR")}</p>
                            </div>
                            <button onClick={() => deleteReview(r.id)} disabled={actionLoading === r.id} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 disabled:opacity-50 transition-all"><Trash2 size={13} /> Supprimer</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <Pagination page={reviewsMeta.page} pages={reviewsMeta.pages} onChange={(p) => fetchTabData("reviews", p)} />
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* SUSTAINABILITY */}
                {/* ═══════════════════════════════════════════════════════════ */}
                {tab === "sustainability" && sustainability && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-5">
                      <StatCard icon={LeafIcon} label="Offres avec score" value={sustainability.offers_with_score} gradient={GRADIENT_PRIMARY} />
                      <StatCard icon={Star} label="Score moyen" value={sustainability.avg_offer_score} gradient={GRADIENT_AMBER} />
                      <StatCard icon={TrendingUp} label="CO₂ total" value={`${sustainability.total_carbon_kg} kg`} gradient={GRADIENT_TEAL} />
                    </div>
                    <div className={`${CARD} p-7`}>
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-[0.15em] mb-5">Top Providers durables</h3>
                      <div className="space-y-3">
                        {sustainability.top_providers.map((p, i) => (
                          <div key={p.user_id} className="flex items-center gap-4 bg-gradient-to-r from-emerald-50/50 to-transparent rounded-2xl p-4 hover:from-emerald-50 transition-all">
                            <span className="text-xl font-extrabold text-emerald-300 w-8 text-center">#{i + 1}</span>
                            <div className="flex-1"><p className="text-sm font-extrabold text-slate-900">{p.full_name}</p></div>
                            <span className="text-sm font-extrabold text-emerald-600">🌿 {p.score}/100</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={`${CARD} p-7`}>
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-[0.15em] mb-5">Top Établissements durables</h3>
                      <div className="space-y-3">
                        {sustainability.top_venues.map((v, i) => (
                          <div key={v.id} className="flex items-center gap-4 bg-gradient-to-r from-blue-50/50 to-transparent rounded-2xl p-4 hover:from-blue-50 transition-all">
                            <span className="text-xl font-extrabold text-blue-300 w-8 text-center">#{i + 1}</span>
                            <div className="flex-1"><p className="text-sm font-extrabold text-slate-900">{v.name}</p></div>
                            <span className="text-sm font-extrabold text-blue-600">🌿 {v.score}/100</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* AUDIT LOGS */}
                {/* ═══════════════════════════════════════════════════════════ */}
                {tab === "audit-logs" && (
                  <div className="space-y-5">
                    <p className="text-xs font-extrabold text-slate-400 uppercase tracking-[0.15em]">{auditMeta.total} actions enregistrées</p>
                    {auditLogs.length === 0 ? <Empty label="Aucun journal" /> : (
                      <div className="space-y-3">
                        {auditLogs.map((log) => (
                          <div key={log.id} className={`${CARD} ${CARD_HOVER} p-5 flex items-center gap-5`}>
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100"><ShieldCheck size={16} className="text-slate-400" /></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-800">
                                <span className="text-slate-400">{log.admin_id.slice(0, 8)}…</span>{" "}
                                a effectué <span className="text-emerald-600 font-extrabold">{log.action}</span> sur{" "}
                                <span className="text-slate-600">{log.entity_type}</span>
                              </p>
                              {log.reason && <p className="text-xs text-slate-400 font-bold mt-0.5">Motif : {log.reason}</p>}
                            </div>
                            <span className="text-xs text-slate-400 font-bold shrink-0">{new Date(log.created_at).toLocaleString("fr-FR")}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <Pagination page={auditMeta.page} pages={auditMeta.pages} onChange={(p) => fetchTabData("audit-logs", p)} />
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* MODERATION - Publications */}
                {/* ═══════════════════════════════════════════════════════════ */}
                {tab === "publications" && (
                  publications.length === 0 ? <Empty label="Aucun lieu en attente" /> :
                  <div className="space-y-4">
                    {publications.map((pub) => (
                      <div key={pub.id} className={`${CARD} ${CARD_HOVER} p-6`}>
                        <div className="flex items-start gap-5">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <TypeBadge label={pub.type === "place" ? "Lieu" : "Expérience"} color="emerald" />
                              <span className="text-xs font-bold text-slate-400">{new Date(pub.created_at).toLocaleDateString("fr-FR")}</span>
                            </div>
                            <h3 className="text-base font-extrabold text-slate-900">{pub.title}</h3>
                            <p className="text-xs font-bold text-slate-500 mt-1">{[pub.place_name, pub.region].filter(Boolean).join(" · ")}</p>
                          </div>
                          <div className="flex gap-2.5 shrink-0">
                            <button onClick={() => openDetail("publication", pub.id)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 text-sm font-bold hover:bg-blue-100 transition-all"><Eye size={14} /> Détails</button>
                            <button onClick={() => approve("publications", pub.id)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 transition-all"><Check size={14} /> Approuver</button>
                            <button onClick={() => setRejectTarget({ type: "publications", id: pub.id })} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold hover:bg-red-100 transition-all"><X size={14} /> Rejeter</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === "offers" && (
                  offers.length === 0 ? <Empty label="Aucune offre en attente" /> :
                  <div className="space-y-4">
                    {offers.map((offer) => (
                      <div key={offer.id} className={`${CARD} ${CARD_HOVER} p-6`}>
                        <div className="flex items-start gap-5">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <TypeBadge label={offer.author_type === "guide" ? "Guide" : "Provider"} color={offer.author_type === "guide" ? "blue" : "amber"} />
                              <span className="text-xs font-bold text-slate-400">{new Date(offer.created_at).toLocaleDateString("fr-FR")}</span>
                            </div>
                            <h3 className="text-base font-extrabold text-slate-900">{offer.title}</h3>
                            <p className="text-xs font-bold text-slate-500 mt-1">{[offer.offer_type, offer.duration, offer.price != null ? `${offer.price} TND` : null].filter(Boolean).join(" · ")}</p>
                          </div>
                          <div className="flex gap-2.5 shrink-0">
                            <button onClick={() => openDetail("offer", offer.id)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 text-sm font-bold hover:bg-blue-100 transition-all"><Eye size={14} /> Détails</button>
                            <button onClick={() => approve("offers", offer.id)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 transition-all"><Check size={14} /> Approuver</button>
                            <button onClick={() => setRejectTarget({ type: "offers", id: offer.id })} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold hover:bg-red-100 transition-all"><X size={14} /> Rejeter</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === "projects" && (
                  venues.length === 0 ? <Empty label="Aucun établissement en attente" /> :
                  <div className="space-y-4">
                    {venues.map((v) => (
                      <div key={v.id} className={`${CARD} ${CARD_HOVER} p-6`}>
                        <div className="flex items-start gap-5">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2"><TypeBadge label="Établissement" color="purple" /><span className="text-xs font-bold text-slate-400">{new Date(v.created_at).toLocaleDateString("fr-FR")}</span></div>
                            <h3 className="text-base font-extrabold text-slate-900">{v.name}</h3>
                            <p className="text-xs font-bold text-slate-500 mt-1">{[v.region, v.address].filter(Boolean).join(" · ")}</p>
                          </div>
                          <div className="flex gap-2.5 shrink-0">
                            <button onClick={() => openDetail("venue", v.id)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 text-sm font-bold hover:bg-blue-100 transition-all"><Eye size={14} /> Détails</button>
                            <button onClick={() => approve("projects", v.id)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 transition-all"><Check size={14} /> Approuver</button>
                            <button onClick={() => setRejectTarget({ type: "projects", id: v.id })} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold hover:bg-red-100 transition-all"><X size={14} /> Rejeter</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === "circuits" && (
                  circuits.length === 0 ? <Empty label="Aucun circuit en attente" /> :
                  <div className="space-y-4">
                    {circuits.map((c) => (
                      <div key={c.id} className={`${CARD} ${CARD_HOVER} p-6`}>
                        <div className="flex items-start gap-5">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2"><TypeBadge label="Circuit" color="teal" /><span className="text-xs font-bold text-slate-400">{new Date(c.created_at).toLocaleDateString("fr-FR")}</span></div>
                            <h3 className="text-base font-extrabold text-slate-900">{c.title}</h3>
                            <p className="text-xs font-bold text-slate-500 mt-1">{[c.region, c.duration_days != null ? `${c.duration_days} jours` : null, c.base_price != null ? `${c.base_price} TND` : null].filter(Boolean).join(" · ")}</p>
                          </div>
                          <div className="flex gap-2.5 shrink-0">
                            <button onClick={() => openDetail("circuit", c.id)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 text-sm font-bold hover:bg-blue-100 transition-all"><Eye size={14} /> Détails</button>
                            <button onClick={() => approve("circuits", c.id)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 transition-all"><Check size={14} /> Approuver</button>
                            <button onClick={() => setRejectTarget({ type: "circuits", id: c.id })} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold hover:bg-red-100 transition-all"><X size={14} /> Rejeter</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === "guide-offerings" && (
                  guideOfferings.length === 0 ? <Empty label="Aucune offre guide en attente" /> :
                  <div className="space-y-4">
                    {guideOfferings.map((go) => (
                      <div key={go.id} className={`${CARD} ${CARD_HOVER} p-6`}>
                        <div className="flex items-start gap-5">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2"><TypeBadge label="Offre Guide" color="blue" /><span className="text-xs font-bold text-slate-400">{new Date(go.created_at).toLocaleDateString("fr-FR")}</span></div>
                            <h3 className="text-base font-extrabold text-slate-900">{go.title}</h3>
                            <p className="text-xs font-bold text-slate-500 mt-1">{[go.price != null ? `${go.price} TND` : null, go.languages?.join(", ")].filter(Boolean).join(" · ")}</p>
                          </div>
                          <div className="flex gap-2.5 shrink-0">
                            <button onClick={() => openDetail("guide-offering", go.id)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 text-sm font-bold hover:bg-blue-100 transition-all"><Eye size={14} /> Détails</button>
                            <button onClick={() => approve("guide-offerings", go.id)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 transition-all"><Check size={14} /> Approuver</button>
                            <button onClick={() => setRejectTarget({ type: "guide-offerings", id: go.id })} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold hover:bg-red-100 transition-all"><X size={14} /> Rejeter</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* REPORTS */}
                {/* ═══════════════════════════════════════════════════════════ */}
                {tab === "reports" && (
                  reports.length === 0 ? <Empty label="Aucun signalement" /> :
                  <div className="space-y-4">
                    {reports.map((rep) => {
                      const isPending = rep.status === "pending";
                      return (
                        <div key={rep.id} className={`${CARD} ${CARD_HOVER} p-6 ${isPending ? "border-red-200/80 bg-red-50/30" : ""}`}>
                          <div className="flex items-start justify-between gap-5">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-100"><Flag size={11} /> {rep.reason}</span>
                                {!isPending && rep.action_taken && <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200">{rep.action_taken}</span>}
                              </div>
                              <p className="text-xs text-slate-400 font-bold">Signalé par <strong className="text-slate-700">{rep.reporter.full_name ?? "—"}</strong> · {new Date(rep.created_at).toLocaleDateString("fr-FR")}</p>
                              <div className="flex items-center gap-3 mt-3">
                                <button onClick={() => openDetail("user", rep.reported_id)} className="text-xs font-bold text-blue-600 hover:underline">Voir profil signalé</button>
                                <button onClick={() => openDetail("user", rep.reporter_id)} className="text-xs font-bold text-slate-500 hover:underline">Voir profil signaleur</button>
                              </div>
                            </div>
                            {isPending ? (
                              <button onClick={() => setResolveTarget(rep)} className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-bold hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/25 transition-all"><ShieldOff size={14} /> Résoudre</button>
                            ) : (
                              <span className="shrink-0 text-xs font-extrabold px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">Résolu</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {tab === "banned" && (
                  bannedUsers.length === 0 ? <Empty label="Aucun utilisateur banni" /> :
                  <div className="space-y-4">
                    {bannedUsers.map((u) => {
                      const isPermanent = !u.ban_until;
                      const banDate = u.ban_until ? new Date(u.ban_until) : null;
                      const isExpired = banDate && new Date() > banDate;
                      return (
                        <div key={u.user_id} className={`${CARD} ${CARD_HOVER} p-6 border-orange-200/80 bg-orange-50/30`}>
                          <div className="flex items-center gap-5">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-extrabold text-slate-900">{u.full_name ?? "—"}</p>
                              <p className="text-xs text-slate-400 font-bold">{u.email} · {u.role.replace("_", " ")}</p>
                              <div className="flex items-center gap-2 mt-2">
                                {isPermanent ? <span className="text-[11px] font-extrabold px-3 py-1 rounded-xl bg-red-50 text-red-600 border border-red-100">Ban permanent</span>
                                : isExpired ? <span className="text-[11px] font-extrabold px-3 py-1 rounded-xl bg-slate-100 text-slate-500 border border-slate-200">Expiré</span>
                                : <span className="flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-xl bg-orange-50 text-orange-600 border border-orange-100"><Clock size={11} /> Jusqu'au {banDate!.toLocaleDateString("fr-FR")}</span>}
                              </div>
                            </div>
                            <button onClick={() => unbanUser(u.user_id)} disabled={actionLoading === u.user_id} className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50">
                              {actionLoading === u.user_id ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <UserCheck size={14} />}
                              Débannir
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODALS */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {rejectTarget && <RejectModal onConfirm={(reason) => reject(rejectTarget.type, rejectTarget.id, reason)} onClose={() => setRejectTarget(null)} />}
      {banTarget && <BanModal onConfirm={(days, note) => banUser(banTarget, days, note)} onClose={() => setBanTarget(null)} />}

      {resolveTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setResolveTarget(null)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-7 space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center"><div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4"><ShieldOff size={24} className="text-red-500" /></div><h3 className="text-lg font-extrabold text-slate-900">Résoudre le signalement</h3></div>
            <p className="text-sm text-slate-600 text-center">Motif : <span className="font-bold">{resolveTarget.reason}</span></p>
            <p className="text-xs text-slate-400 text-center">Signalé par <strong>{resolveTarget.reporter.full_name ?? resolveTarget.reporter.email}</strong> contre <strong>{resolveTarget.reported.full_name ?? resolveTarget.reported.email}</strong></p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "warn", label: "Avertir", gradient: "from-amber-400 to-orange-500 shadow-amber-500/25" },
                { key: "ban", label: "Bannir (30j)", gradient: "from-red-400 to-rose-600 shadow-red-500/25" },
                { key: "delete", label: "Supprimer", gradient: "from-red-500 to-red-700 shadow-red-600/25" },
                { key: "dismiss", label: "Rejeter", gradient: "from-slate-400 to-slate-600 shadow-slate-500/25" },
              ].map((a) => (
                <button key={a.key} onClick={() => {
                  if (a.key === "ban") resolveReportAction("ban", "Banni suite à un signalement", 30);
                  else resolveReportAction(a.key, "");
                }} className={`px-5 py-3.5 rounded-2xl bg-gradient-to-r ${a.gradient} text-sm font-bold text-white capitalize shadow-lg hover:shadow-xl transition-all`}>{a.label}</button>
              ))}
            </div>
            <button onClick={() => setResolveTarget(null)} className="w-full px-5 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all">Annuler</button>
          </div>
        </div>
      )}

      {detailType && (
        <DetailModal title={
          detailType === "publication" ? "Détail Lieu" : detailType === "offer" ? "Détail Offre" : detailType === "venue" ? "Détail Établissement" : detailType === "circuit" ? "Détail Circuit" : detailType === "guide-offering" ? "Détail Offre Guide" : "Détail Utilisateur"
        } onClose={closeDetail}>
          {detailLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 rounded-3xl border-4 border-emerald-500 border-t-transparent animate-spin" />
              <p className="text-sm font-bold text-slate-400">Chargement…</p>
            </div>
          ) : detailData ? (
            <div className="space-y-1">
              {detailType === "publication" && (<>
                <DetailField icon={Info} label="Titre" value={detailData.title} />
                <DetailField icon={FileText} label="Type" value={detailData.type} />
                <DetailField icon={FileText} label="Description" value={detailData.description} />
                <DetailField icon={MapPin} label="Nom du lieu" value={detailData.place_name} />
                <DetailField icon={Map} label="Région" value={detailData.region} />
                <DetailField icon={MapPin} label="Latitude" value={detailData.latitude} />
                <DetailField icon={MapPin} label="Longitude" value={detailData.longitude} />
                <DetailField icon={ImageIcon} label="Images" value={detailData.images} />
                <DetailField icon={Clock} label="Créé le" value={new Date(detailData.created_at).toLocaleString("fr-FR")} />
                {detailData.author && <DetailField icon={Users} label="Auteur" value={`${detailData.author.full_name ?? detailData.author.email} (${detailData.author.role})`} />}
                {detailData.latitude && detailData.longitude && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100">
                    <MapView lat={detailData.latitude} lng={detailData.longitude} markers={[{ id: detailData.id, lat: detailData.latitude, lng: detailData.longitude, label: detailData.title }]} />
                  </div>
                )}
                <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
                  <button onClick={() => { approve("publications", detailData.id); closeDetail(); }} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25 transition-all"><Check size={16} /> Approuver</button>
                  <button onClick={() => { closeDetail(); setRejectTarget({ type: "publications", id: detailData.id }); }} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/25 transition-all"><X size={16} /> Rejeter</button>
                </div>
              </>)}

              {detailType === "offer" && (<>
                <DetailField icon={Info} label="Titre" value={detailData.title} />
                <DetailField icon={FileText} label="Description" value={detailData.description} />
                <DetailField icon={Briefcase} label="Type d'offre" value={detailData.offer_type} />
                <DetailField icon={Clock} label="Durée" value={detailData.duration} />
                <DetailField icon={TrendingUp} label="Prix" value={detailData.price != null ? `${detailData.price} TND` : null} />
                <DetailField icon={LeafIcon} label="Score durabilité" value={detailData.sustainability_score} />
                <DetailField icon={FileText} label="Certifications" value={detailData.sustainability_certifications} />
                <DetailField icon={ImageIcon} label="Images" value={detailData.images} />
                <DetailField icon={Clock} label="Créé le" value={new Date(detailData.created_at).toLocaleString("fr-FR")} />
                {detailData.author && <DetailField icon={Users} label="Auteur" value={`${detailData.author.full_name ?? detailData.author.email} (${detailData.author.role})`} />}
                <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
                  <button onClick={() => { approve("offers", detailData.id); closeDetail(); }} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/25 transition-all"><Check size={16} /> Approuver</button>
                  <button onClick={() => { closeDetail(); setRejectTarget({ type: "offers", id: detailData.id }); }} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold shadow-lg shadow-red-500/25 transition-all"><X size={16} /> Rejeter</button>
                </div>
              </>)}

              {detailType === "venue" && (<>
                <DetailField icon={Info} label="Nom" value={detailData.name} />
                <DetailField icon={FileText} label="Description" value={detailData.description} />
                <DetailField icon={Map} label="Région" value={detailData.region} />
                <DetailField icon={MapPin} label="Adresse" value={detailData.address} />
                <DetailField icon={MapPin} label="Latitude" value={detailData.lat} />
                <DetailField icon={MapPin} label="Longitude" value={detailData.lng} />
                <DetailField icon={Briefcase} label="Type" value={detailData.venue_type} />
                <DetailField icon={LeafIcon} label="Score durabilité" value={detailData.sustainability_score} />
                <DetailField icon={ImageIcon} label="Photos" value={detailData.photos} />
                <DetailField icon={Clock} label="Créé le" value={new Date(detailData.created_at).toLocaleString("fr-FR")} />
                {detailData.provider && <DetailField icon={Users} label="Provider" value={`${detailData.provider.full_name ?? "—"} · ${detailData.provider.city ?? "—"} · ${detailData.offers_count} offres`} />}
                {detailData.lat && detailData.lng && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100">
                    <MapView lat={detailData.lat} lng={detailData.lng} markers={[{ id: detailData.id, lat: detailData.lat, lng: detailData.lng, label: detailData.name }]} />
                  </div>
                )}
                <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
                  <button onClick={() => { approve("projects", detailData.id); closeDetail(); }} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/25 transition-all"><Check size={16} /> Approuver</button>
                  <button onClick={() => { closeDetail(); setRejectTarget({ type: "projects", id: detailData.id }); }} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold shadow-lg shadow-red-500/25 transition-all"><X size={16} /> Rejeter</button>
                </div>
              </>)}

              {detailType === "circuit" && (<>
                <DetailField icon={Info} label="Titre" value={detailData.title} />
                <DetailField icon={FileText} label="Description" value={detailData.description} />
                <DetailField icon={Map} label="Région" value={detailData.region} />
                <DetailField icon={Clock} label="Durée (jours)" value={detailData.duration_days} />
                <DetailField icon={TrendingUp} label="Prix de base" value={detailData.base_price != null ? `${detailData.base_price} TND` : null} />
                <DetailField icon={ImageIcon} label="Image de couverture" value={detailData.cover_image} />
                <DetailField icon={Clock} label="Créé le" value={new Date(detailData.created_at).toLocaleString("fr-FR")} />
                {detailData.author && <DetailField icon={Users} label="Auteur" value={`${detailData.author.full_name ?? detailData.author.email} (${detailData.author.role})`} />}
                {detailData.cover_image && <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100"><img src={detailData.cover_image} alt={detailData.title} className="w-full h-48 object-cover" /></div>}
                <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
                  <button onClick={() => { approve("circuits", detailData.id); closeDetail(); }} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/25 transition-all"><Check size={16} /> Approuver</button>
                  <button onClick={() => { closeDetail(); setRejectTarget({ type: "circuits", id: detailData.id }); }} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold shadow-lg shadow-red-500/25 transition-all"><X size={16} /> Rejeter</button>
                </div>
              </>)}

              {detailType === "guide-offering" && (<>
                <DetailField icon={Info} label="Titre" value={detailData.title} />
                <DetailField icon={FileText} label="Description" value={detailData.description} />
                <DetailField icon={TrendingUp} label="Prix" value={detailData.price != null ? `${detailData.price} TND` : null} />
                <DetailField icon={Globe} label="Langues" value={detailData.languages} />
                <DetailField icon={Clock} label="Créé le" value={new Date(detailData.created_at).toLocaleString("fr-FR")} />
                {detailData.guide && <DetailField icon={Users} label="Guide" value={`${detailData.guide.full_name ?? "—"} · ${detailData.guide.email ?? "—"}`} />}
                <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
                  <button onClick={() => { approve("guide-offerings", detailData.id); closeDetail(); }} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/25 transition-all"><Check size={16} /> Approuver</button>
                  <button onClick={() => { closeDetail(); setRejectTarget({ type: "guide-offerings", id: detailData.id }); }} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold shadow-lg shadow-red-500/25 transition-all"><X size={16} /> Rejeter</button>
                </div>
              </>)}

              {detailType === "user" && detailData.user && (<>
                <DetailField icon={Users} label="Email" value={detailData.user.email} />
                <DetailField icon={Info} label="Rôle" value={detailData.user.role?.replace("_", " ")} />
                <DetailField icon={ShieldCheck} label="Statut" value={detailData.user.status} />
                <DetailField icon={Clock} label="Inscrit le" value={new Date(detailData.user.created_at).toLocaleString("fr-FR")} />
                {detailData.user.ban_until && <DetailField icon={Ban} label="Banni jusqu'au" value={new Date(detailData.user.ban_until).toLocaleString("fr-FR")} />}
                {detailData.profile && (<>
                  <div className="pt-4 mt-3 border-t border-slate-100"><p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em]">Profil</p></div>
                  <DetailField icon={Users} label="Nom complet" value={detailData.profile.full_name} />
                  <DetailField icon={FileText} label="Bio" value={detailData.profile.bio} />
                  <DetailField icon={MapPin} label="Ville" value={detailData.profile.city} />
                  <DetailField icon={Map} label="Région" value={detailData.profile.region} />
                  <DetailField icon={Phone} label="WhatsApp" value={detailData.profile.whatsapp} />
                  <DetailField icon={Globe} label="Site web" value={detailData.profile.website} />
                  <DetailField icon={Info} label="Années d'expérience" value={detailData.profile.years_experience} />
                  <DetailField icon={Globe} label="Langues" value={detailData.profile.languages_spoken} />
                  {detailData.profile.photo && <div className="mt-3"><img src={detailData.profile.photo} alt="Photo" className="w-20 h-20 rounded-2xl object-cover border border-slate-100 shadow-md" /></div>}
                </>)}
                <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
                  {detailData.user.status === "banned" ? (
                    <button onClick={() => { unbanUser(detailData.user.id); closeDetail(); }} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/25 transition-all"><RefreshCw size={16} /> Débannir</button>
                  ) : (
                    <button onClick={() => { closeDetail(); setBanTarget(detailData.user.id); }} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-lg shadow-orange-500/25 transition-all"><Ban size={16} /> Bannir</button>
                  )}
                </div>
              </>)}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-12"><p className="text-sm font-bold">Aucune donnée</p></div>
          )}
        </DetailModal>
      )}
    </div>
  );
}
