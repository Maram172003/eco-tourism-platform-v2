"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  Calendar, Users, Leaf, MapPin, CheckCircle, XCircle,
  Clock, Plus, ChevronRight, ShieldAlert, Mountain,
} from "lucide-react";
import AppNavbar from "@/components/nav/AppNavbar";

interface ReservationOffer {
  id: string;
  title: string;
  region: string | null;
  images: string[] | null;
}

interface ReservationItem {
  id: string;
  reservation_ref: string;
  status: string;
  total_price: number | null;
  currency: string;
  created_at: string;
  special_requests: string | null;
  session?: {
    id: string;
    date: string;
    start_time: string | null;
    end_time: string | null;
  } | null;
  guideOfferingSession?: {
    id: string;
    date: string;
    start_time: string | null;
    end_time: string | null;
  } | null;
  offerItem?: { id: string; name: string } | null;
  offer?: ReservationOffer | null;
  guideOffering?: { id: string; title: string } | null;
  participants?: { id: string; full_name: string }[];
}

interface CircuitReservation {
  id: string;
  status: string;
  final_total: number;
  participants_count: number | null;
  created_at: string;
  circuit?: {
    id: string;
    title: string;
    region: string | null;
    cover_image: string | null;
    images: string[] | null;
  } | null;
}

interface CardEntry {
  key: string;
  kind: "offer" | "circuit";
  id: string;
  ref: string | null;
  title: string;
  region: string | null;
  image: string | null;
  status: string;
  total: number | null;
  date: string | null;
  time: string | null;
  participantCount: number;
  participants: { id: string; full_name: string }[];
  specialRequests: string | null;
  circuitId: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: "En attente",
    color: "bg-amber-100 text-amber-700",
    icon: <Clock size={12} />,
  },
  confirmed: {
    label: "Confirmée",
    color: "bg-emerald-100 text-emerald-700",
    icon: <CheckCircle size={12} />,
  },
  cancelled: {
    label: "Annulée",
    color: "bg-red-100 text-red-600",
    icon: <XCircle size={12} />,
  },
  completed: {
    label: "Terminée",
    color: "bg-slate-100 text-slate-600",
    icon: <CheckCircle size={12} />,
  },
  rejected: {
    label: "Refusée",
    color: "bg-red-100 text-red-600",
    icon: <ShieldAlert size={12} />,
  },
  expired: {
    label: "Expirée",
    color: "bg-slate-200 text-slate-600",
    icon: <Clock size={12} />,
  },
};

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function ReservationsPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<CardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<CardEntry | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mine, circuits] = await Promise.all([
        apiFetch<ReservationItem[]>("/reservations/mine").catch(() => []),
        apiFetch<CircuitReservation[]>("/circuits/reservations/mine").catch(() => []),
      ]);

      const offerEntries: CardEntry[] = (mine ?? []).map((r) => ({
        key: `offer-${r.id}`,
        kind: "offer",
        id: r.id,
        ref: r.reservation_ref ?? null,
        title: r.offer?.title ?? r.guideOffering?.title ?? r.offerItem?.name ?? "Réservation",
        region: r.offer?.region ?? null,
        image: r.offer?.images?.[0] ?? null,
        status: r.status,
        total: r.total_price != null ? Number(r.total_price) : null,
        date: formatDate(r.session?.date ?? r.guideOfferingSession?.date ?? r.created_at),
        time: (r.session ?? r.guideOfferingSession)?.start_time ?? null,
        participantCount: r.participants?.length ?? 1,
        participants: r.participants ?? [],
        specialRequests: r.special_requests ?? null,
        circuitId: null,
      }));

      const circuitEntries: CardEntry[] = (circuits ?? []).map((r) => ({
        key: `circuit-${r.id}`,
        kind: "circuit",
        id: r.id,
        ref: null,
        title: r.circuit?.title ?? "Réservation de circuit",
        region: r.circuit?.region ?? null,
        image: r.circuit?.cover_image ?? r.circuit?.images?.[0] ?? null,
        status: r.status,
        total: r.final_total != null ? Number(r.final_total) : null,
        date: formatDate(r.created_at),
        time: null,
        participantCount: r.participants_count ?? 1,
        participants: [],
        specialRequests: null,
        circuitId: r.circuit?.id ?? null,
      }));

      const sorted = [...offerEntries, ...circuitEntries].sort(
        (a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime(),
      );
      setEntries(sorted);
    } catch {
      setError("Impossible de charger vos réservations. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async (entry: CardEntry) => {
    setCancelling(entry.key);
    try {
      if (entry.kind === "circuit") {
        await apiFetch(`/circuits/reservations/${entry.id}`, { method: "DELETE" });
      } else {
        await apiFetch(`/reservations/${entry.id}/cancel`, { method: "PATCH" });
      }
      setConfirmCancel(null);
      await load();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'annulation.");
    } finally {
      setCancelling(null);
    }
  };

  const openEntry = (entry: CardEntry) => {
    if (entry.kind === "circuit") {
      router.push(entry.circuitId ? `/circuits/${entry.circuitId}` : "/circuits");
    } else {
      router.push(`/dashboard/ecovoyageur/reservations/${entry.id}`);
    }
  };

  const filtered = filter === "all" ? entries : entries.filter((e) => e.status === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <AppNavbar title="Mes réservations" />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={24} className="text-primary" />
              Mes réservations
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Suivez vos offres, circuits et prestations guide
            </p>
          </div>
          <button
            onClick={() => router.push("/offers")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
          >
            <Plus size={18} />
            Nouvelle
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 flex items-center justify-between gap-2 text-sm text-red-600">
            <span className="flex items-start gap-2">
              <Calendar size={16} className="mt-0.5 shrink-0" /> {error}
            </span>
            <button
              onClick={load}
              className="text-xs font-semibold text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-100 shrink-0"
            >
              Réessayer
            </button>
          </div>
        )}

        {!loading && entries.length > 1 && (
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
            {[
              { value: "all", label: "Toutes" },
              { value: "pending", label: "En attente" },
              { value: "confirmed", label: "Confirmées" },
              { value: "cancelled", label: "Annulées" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                  filter === f.value
                    ? "bg-primary text-white"
                    : "bg-white text-slate-500 border border-slate-200 hover:border-emerald-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <Calendar size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 font-medium mb-1">Aucune réservation</p>
            <p className="text-slate-400 text-sm mb-6">
              {entries.length === 0
                ? "Explorez le catalogue pour réserver une expérience durable"
                : "Aucune réservation ne correspond à ce filtre"}
            </p>
            <button
              onClick={() => router.push("/offers")}
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-emerald-600"
            >
              Voir les offres
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((entry) => {
              const statusCfg = STATUS_CONFIG[entry.status] ?? STATUS_CONFIG.pending;
              const cancellable =
                entry.status === "pending" || entry.status === "confirmed";
              return (
                <div
                  key={entry.key}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => openEntry(entry)}
                >
                  <div className="flex gap-4 p-4">
                    <div className="w-16 h-16 rounded-xl bg-emerald-100 flex-shrink-0 overflow-hidden">
                      {entry.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={entry.image} alt={entry.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {entry.kind === "circuit" ? (
                            <Mountain size={20} className="text-emerald-400" />
                          ) : (
                            <Leaf size={20} className="text-emerald-400" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {entry.kind === "circuit" && (
                              <span className="text-[10px] font-bold uppercase tracking-wide text-purple-600 bg-purple-50 rounded-full px-2 py-0.5 shrink-0">
                                Circuit
                              </span>
                            )}
                            <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{entry.title}</h3>
                          </div>
                        </div>
                        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${statusCfg.color}`}>
                          {statusCfg.icon} {statusCfg.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-2">
                        {entry.date && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {entry.date}
                            {entry.time && ` · ${entry.time}`}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users size={11} />
                          {entry.participantCount} personne{entry.participantCount > 1 ? "s" : ""}
                        </span>
                        {entry.region && (
                          <span className="flex items-center gap-1"><MapPin size={11} />{entry.region}</span>
                        )}
                      </div>
                      {entry.specialRequests && (
                        <div className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2.5 py-1 mb-2 line-clamp-1">
                          {entry.specialRequests}
                        </div>
                      )}
                      {entry.ref && (
                        <p className="text-[10px] text-slate-400 font-mono mb-1">Réf. {entry.ref}</p>
                      )}
                      {entry.total !== null && (
                        <p className="text-emerald-600 font-bold text-sm">
                          {Number(entry.total).toLocaleString()} TND
                        </p>
                      )}
                    </div>
                    <ChevronRight size={18} className="text-slate-300 shrink-0 self-center" />
                  </div>
                  {cancellable && (
                    <div
                      className="px-4 pb-3 border-t border-slate-50 pt-2.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setConfirmCancel(entry)}
                        disabled={cancelling === entry.key}
                        className="text-xs text-red-500 hover:text-red-600 font-medium disabled:opacity-50"
                      >
                        {cancelling === entry.key ? "Annulation…" : "Annuler la réservation"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
          <div className="bg-white rounded-2xl shadow-lg mx-4 w-full max-w-sm p-5">
            <h3 id="cancel-title" className="font-bold text-slate-800 mb-2">Annuler cette réservation ?</h3>
            <p className="text-sm text-slate-500 mb-4">
              La réservation de « {confirmCancel.title} » sera annulée et les places libérées.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmCancel(null)}
                disabled={cancelling === confirmCancel.key}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleCancel(confirmCancel)}
                disabled={cancelling === confirmCancel.key}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50"
              >
                {cancelling === confirmCancel.key ? "…" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
