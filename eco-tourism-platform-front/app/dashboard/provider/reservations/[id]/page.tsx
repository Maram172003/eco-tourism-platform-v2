"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import {
  ChevronLeft, Calendar, Users, MapPin, Clock, CreditCard,
  CheckCircle, XCircle, User, MessageSquare, AlertCircle, Leaf,
} from "lucide-react";

interface Participant {
  id: string;
  full_name: string;
  age: number | null;
  is_group_leader: boolean;
}

interface Reservation {
  id: string;
  reservation_ref: string;
  status: string;
  total_price: number | null;
  currency: string;
  special_requests: string | null;
  cancel_reason: string | null;
  created_at: string;
  offer: {
    id: string;
    title: string;
    offer_type: string | null;
    region: string | null;
    duration: string | null;
  } | null;
  offerItem: { id: string; name: string } | null;
  session: {
    date: string;
    start_time: string | null;
    end_time: string | null;
  } | null;
  guideOffering: { id: string; title: string } | null;
  guideOfferingSession: {
    date: string;
    start_time: string | null;
    end_time: string | null;
  } | null;
  traveler: {
    email: string;
  } | null;
  participants: Participant[];
}

const TYPE_ICONS: Record<string, string> = {
  hebergement: "🏕️", activite: "🧗", circuit: "🗺️",
  restauration: "🍽️", artisanat: "🪴", location_materiel: "🎒",
  volontariat: "🌱", bien_etre: "🧘", transport: "🚌",
};

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "En attente", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  confirmed: { label: "Confirmée",  color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  rejected:  { label: "Refusée",   color: "text-red-700", bg: "bg-red-50 border-red-200" },
  cancelled: { label: "Annulée",   color: "text-slate-600", bg: "bg-slate-50 border-slate-200" },
  completed: { label: "Terminée",  color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
};

export default function ProviderReservationDetailPage() {
  return (
    <ToastProvider>
      <ProviderReservationDetail />
    </ToastProvider>
  );
}

function ProviderReservationDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiFetch<Reservation>(`/reservations/${id}`)
      .then(setReservation)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAction(status: "confirmed" | "rejected") {
    setActionLoading(true);
    try {
      const body: any = { status };
      if (status === "rejected" && rejectReason) body.reason = rejectReason;
      await apiFetch(`/reservations/${id}/confirm`, { method: "PATCH", body: JSON.stringify(body) });
      setReservation((r) => (r ? { ...r, status } : r));
      setShowRejectForm(false);
      toast(status === "confirmed" ? "Réservation confirmée" : "Réservation refusée", "success");
    } catch {
      toast("Action impossible, réessayez", "error");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError || !reservation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-400">
        <AlertCircle size={40} className="opacity-30" />
        <p>Réservation introuvable</p>
        <button onClick={() => router.push("/dashboard/provider")} className="text-emerald-600 text-sm hover:underline">
          Retour au dashboard
        </button>
      </div>
    );
  }

  const statusCfg = STATUS_LABELS[reservation.status] ?? STATUS_LABELS.pending;
  const canAct = reservation.status === "pending";
  const offer = reservation.offer;
  const mainTitle = offer?.title ?? reservation.guideOffering?.title ?? reservation.offerItem?.name ?? "Réservation";
  const slotDate = reservation.session?.date ?? reservation.guideOfferingSession?.date ?? null;
  const slotTime = reservation.session?.start_time ?? reservation.guideOfferingSession?.start_time ?? null;
  const slotEndTime = reservation.session?.end_time ?? reservation.guideOfferingSession?.end_time ?? null;
  const slotLabel = reservation.session ? "Créneau demandé" : reservation.guideOfferingSession ? "Prestation guide" : "Date souhaitée";
  const participantCount = reservation.participants?.length ?? 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.push("/dashboard/provider")}
            aria-label="Retour au dashboard"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500">
            <ChevronLeft size={20} />
          </button>
          <h1 className="font-bold text-slate-800 flex-1">Réservation reçue</h1>
          {reservation.reservation_ref && (
            <span className="text-xs font-mono text-slate-400">Réf. {reservation.reservation_ref}</span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Statut */}
        <div className={`rounded-2xl border p-4 flex items-center gap-3 ${statusCfg.bg}`}>
          {reservation.status === "confirmed" ? <CheckCircle size={18} className="text-emerald-500" />
            : reservation.status === "rejected" ? <XCircle size={18} className="text-red-500" />
            : <Clock size={18} className="text-amber-500" />}
          <div>
            <p className={`font-bold text-sm ${statusCfg.color}`}>{statusCfg.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Reçue le {new Date(reservation.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {reservation.status === "rejected" && reservation.cancel_reason && (
          <div className="bg-red-50 rounded-2xl border border-red-100 p-4">
            <p className="text-xs font-bold text-red-700 mb-1">Motif du refus</p>
            <p className="text-sm text-red-600">{reservation.cancel_reason}</p>
          </div>
        )}

        {/* Offre / prestation */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
          <span className="text-4xl">
            {offer ? (TYPE_ICONS[offer.offer_type ?? ""] ?? "🌿") : "🧭"}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800">{mainTitle}</p>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-1">
              {offer?.region && <span className="flex items-center gap-1"><MapPin size={10} />{offer.region}</span>}
              {offer?.duration && <span className="flex items-center gap-1"><Clock size={10} />{offer.duration}</span>}
              {!offer && reservation.guideOffering && (
                <span className="flex items-center gap-1"><User size={10} /> Prestation guide</span>
              )}
            </div>
          </div>
        </div>

        {/* Créneau */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Calendar size={15} className="text-emerald-500" /> {slotLabel}
          </h3>
          {slotDate ? (
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-slate-700">
                {new Date(slotDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
              {slotTime && (
                <p className="text-slate-500">
                  {slotTime}{slotEndTime ? ` → ${slotEndTime}` : ""}
                </p>
              )}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">Date à convenir</p>
          )}
        </div>

        {/* Voyageur */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <User size={15} className="text-emerald-500" /> Voyageur organisateur
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 overflow-hidden flex items-center justify-center flex-shrink-0">
              <User size={20} className="text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 truncate">{reservation.traveler?.email ?? "—"}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {participantCount} participant{participantCount > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {reservation.participants && reservation.participants.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-50">
              <p className="text-xs text-slate-500 font-medium mb-2">Participants du groupe</p>
              <div className="space-y-2">
                {reservation.participants.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      <User size={12} className="text-emerald-400" />
                    </div>
                    <span className="text-sm text-slate-700 flex-1 truncate">{p.full_name}</span>
                    {p.is_group_leader && (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100 rounded-full px-1.5 py-0.5">Responsable</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Demandes spéciales */}
        {reservation.special_requests && (
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
            <p className="text-xs font-bold text-blue-800 mb-1 flex items-center gap-1">
              <MessageSquare size={12} /> Demandes du voyageur
            </p>
            <p className="text-sm text-blue-700">{reservation.special_requests}</p>
          </div>
        )}

        {/* Paiement */}
        {reservation.total_price !== null && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <CreditCard size={15} className="text-emerald-500" /> Tarif
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Total</span>
              <span className="font-bold text-slate-800 text-base">
                {Number(reservation.total_price).toLocaleString()} {reservation.currency ?? "TND"}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        {canAct && (
          <div className="space-y-3">
            <button onClick={() => handleAction("confirmed")} disabled={actionLoading}
              aria-label="Confirmer la réservation"
              className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2 text-base">
              <CheckCircle size={18} /> {actionLoading ? "..." : "Confirmer la réservation"}
            </button>

            {!showRejectForm ? (
              <button onClick={() => setShowRejectForm(true)}
                aria-label="Refuser la réservation"
                className="w-full py-3 border-2 border-red-200 text-red-600 font-semibold rounded-2xl hover:bg-red-50 flex items-center justify-center gap-2 text-sm">
                <XCircle size={16} /> Refuser
              </button>
            ) : (
              <div className="bg-red-50 rounded-2xl border border-red-200 p-4 space-y-3">
                <p className="text-sm font-bold text-red-800">Motif de refus (optionnel)</p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="Ex: Dates non disponibles, capacité insuffisante..."
                  className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none bg-white"
                />
                <div className="flex gap-2">
                  <button onClick={() => setShowRejectForm(false)}
                    aria-label="Annuler le refus"
                    className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
                    Annuler
                  </button>
                  <button onClick={() => handleAction("rejected")} disabled={actionLoading}
                    aria-label="Confirmer le refus"
                    className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 disabled:opacity-50">
                    {actionLoading ? "..." : "Confirmer le refus"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
