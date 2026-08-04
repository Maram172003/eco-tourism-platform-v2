"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Calendar, MapPin, Star, Users, Activity, Clock, CheckCircle, XCircle, TrendingUp, BarChart3, Eye, MessageSquare, Loader2 } from "lucide-react";

type StatCard = { label: string; value: string | number; icon: React.ReactNode; color: string; bg: string; sub?: string };

export default function GuideAnalytics({ token, userId }: { token: string; userId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<{
    circuitsCount: number; circuitsApproved: number;
    avgRating: number; reviewCount: number;
    bookingsPending: number; bookingsConfirmed: number; bookingsCancelled: number;
    followersCount: number; followingCount: number;
    recentReviews: { id: string; rating: number; comment?: string; authorName?: string; created_at: string }[];
    offersByStatus: Record<string, number>;
    offersByType: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    if (!token || !userId) return;
    async function load() {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [circuits, avgRes, reviewsRes, bookings, followsCount, followers, following] = await Promise.all([
          apiFetch<any[]>("/circuits/mine", { headers }).catch(() => []),
          apiFetch<{ average: number; count: number }>(`/reviews/average/guide/${userId}`, { headers }).catch(() => ({ average: 0, count: 0 })),
          apiFetch<any[]>(`/reviews/target/guide/${userId}`, { headers }).catch(() => []),
          apiFetch<any[]>("/reservations/incoming", { headers }).catch(() => []),
          apiFetch<{ count: number }>("/follows/count", { headers }).catch(() => ({ count: 0 })),
          apiFetch<any[]>("/follows/followers/profiles", { headers }).catch(() => []),
          apiFetch<any[]>("/follows/following/profiles", { headers }).catch(() => []),
        ]);

        const offers = await apiFetch<any[]>("/offers/mine", { headers }).catch(() => []);

        const offersByStatus: Record<string, number> = {};
        const offersByType: Record<string, number> = {};
        offers.forEach((o: any) => {
          offersByStatus[o.status || "unknown"] = (offersByStatus[o.status || "unknown"] || 0) + 1;
          offersByType[o.offer_type || "unknown"] = (offersByType[o.offer_type || "unknown"] || 0) + 1;
        });

        const bookingsPending = bookings.filter((b: any) => b.status === "pending").length;
        const bookingsConfirmed = bookings.filter((b: any) => b.status === "confirmed" || b.status === "approved").length;
        const bookingsCancelled = bookings.filter((b: any) => b.status === "cancelled" || b.status === "rejected").length;

        setStats({
          circuitsCount: circuits.length,
          circuitsApproved: circuits.filter((c: any) => c.status === "approved").length,
          avgRating: avgRes.average,
          reviewCount: avgRes.count,
          bookingsPending, bookingsConfirmed, bookingsCancelled,
          followersCount: followers.length,
          followingCount: following.length,
          recentReviews: reviewsRes.slice(0, 5).map((r: any) => ({
            id: r.id, rating: r.rating, comment: r.comment,
            authorName: r.author_name || r.author?.full_name,
            created_at: r.created_at,
          })),
          offersByStatus, offersByType,
        });
      } catch (e: any) {
        setError(e.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, userId]);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={24} className="animate-spin text-primary" />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
      <p className="text-sm font-bold text-red-600">{error}</p>
    </div>
  );

  if (!stats) return null;

  const cards: StatCard[] = [
    { label: "Offres", value: Object.values(stats.offersByStatus).reduce((a, b) => a + b, 0), icon: <Activity size={16} />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Circuits", value: stats.circuitsCount, icon: <MapPin size={16} />, color: "text-blue-600", bg: "bg-blue-50", sub: `${stats.circuitsApproved} approuvés` },
    { label: "Note moyenne", value: stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)}` : "—", icon: <Star size={16} />, color: "text-amber-500", bg: "bg-amber-50", sub: `${stats.reviewCount} avis` },
    { label: "Réservations", value: stats.bookingsConfirmed + stats.bookingsPending, icon: <Calendar size={16} />, color: "text-violet-600", bg: "bg-violet-50", sub: `${stats.bookingsPending} en attente` },
    { label: "Abonnés", value: stats.followersCount, icon: <Users size={16} />, color: "text-primary", bg: "bg-primary/10" },
    { label: "Abonnements", value: stats.followingCount, icon: <TrendingUp size={16} />, color: "text-sky-600", bg: "bg-sky-50" },
  ];

  const totalOffers = Object.values(stats.offersByStatus).reduce((a, b) => a + b, 0);
  const totalBookings = stats.bookingsConfirmed + stats.bookingsPending + stats.bookingsCancelled;

  return (
    <div className="space-y-6">

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {cards.map((c) => (
          <div key={c.label} className={`${c.bg} rounded-2xl p-4 border border-slate-100/80`}>
            <div className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center mb-2 ${c.color}`}>
              {c.icon}
            </div>
            <p className="text-2xl font-extrabold text-slate-800">{c.value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">{c.label}</p>
            {c.sub && <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{c.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Offres par statut */}
        <div className="bg-white rounded-3xl border border-slate-100/80 shadow-sm p-6">
          <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-4 flex items-center gap-1.5">
            <BarChart3 size={13} /> Offres par statut
          </p>
          {totalOffers === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Aucune offre</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.offersByStatus).map(([status, count]) => {
                const pct = Math.round((count / totalOffers) * 100);
                const statusColors: Record<string, string> = {
                  approved: "bg-emerald-500", pending: "bg-amber-400", rejected: "bg-red-400", draft: "bg-slate-300",
                };
                const statusLabels: Record<string, string> = {
                  approved: "Approuvée", pending: "En attente", rejected: "Rejetée", draft: "Brouillon",
                };
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-700">{statusLabels[status] || status}</span>
                      <span className="font-bold text-slate-500">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${statusColors[status] || "bg-slate-400"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Offres par type */}
        <div className="bg-white rounded-3xl border border-slate-100/80 shadow-sm p-6">
          <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-4 flex items-center gap-1.5">
            <Activity size={13} /> Offres par type
          </p>
          {totalOffers === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Aucune offre</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.offersByType).map(([type, count]) => {
                const pct = Math.round((count / totalOffers) * 100);
                const typeLabels: Record<string, string> = {
                  eco_tour: "Éco-Tour", activity: "Activité", workshop: "Atelier", transfer: "Transfert",
                };
                const typeColors: Record<string, string> = {
                  eco_tour: "bg-emerald-500", activity: "bg-orange-400", workshop: "bg-violet-500", transfer: "bg-blue-500",
                };
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-700">{typeLabels[type] || type}</span>
                      <span className="font-bold text-slate-500">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${typeColors[type] || "bg-slate-400"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Réservations */}
        <div className="bg-white rounded-3xl border border-slate-100/80 shadow-sm p-6">
          <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-4 flex items-center gap-1.5">
            <Calendar size={13} /> Réservations entrantes
          </p>
          {totalBookings === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Aucune réservation</p>
          ) : (
            <div className="space-y-4">
              {[
                { status: "confirmed", label: "Confirmées", count: stats.bookingsConfirmed, icon: <CheckCircle size={14} />, color: "text-emerald-600", bg: "bg-emerald-50" },
                { status: "pending", label: "En attente", count: stats.bookingsPending, icon: <Clock size={14} />, color: "text-amber-600", bg: "bg-amber-50" },
                { status: "cancelled", label: "Annulées", count: stats.bookingsCancelled, icon: <XCircle size={14} />, color: "text-red-500", bg: "bg-red-50" },
              ].map((s) => (
                <div key={s.status} className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center ${s.color}`}>{s.icon}</div>
                    <span className="text-xs font-bold text-slate-700">{s.label}</span>
                  </div>
                  <span className="text-lg font-extrabold text-slate-800">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Derniers avis */}
        <div className="bg-white rounded-3xl border border-slate-100/80 shadow-sm p-6">
          <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-4 flex items-center gap-1.5">
            <MessageSquare size={13} /> Derniers avis
          </p>
          {stats.recentReviews.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Aucun avis pour le moment</p>
          ) : (
            <div className="space-y-3">
              {stats.recentReviews.map((r) => (
                <div key={r.id} className="p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700">{r.authorName || "Anonyme"}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={10} className={i < r.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-xs text-slate-500 line-clamp-2">{r.comment}</p>}
                  <p className="text-[10px] text-slate-400 mt-1">{new Date(r.created_at).toLocaleDateString("fr-FR")}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
