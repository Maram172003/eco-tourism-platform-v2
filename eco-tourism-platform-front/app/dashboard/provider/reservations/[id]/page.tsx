"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  ChevronLeft, Calendar, Users, MapPin, Clock, CreditCard,
  CheckCircle, XCircle, User, Phone, MessageSquare, AlertCircle,
} from "lucide-react";

interface Reservation {
  id: string;
  status: string;
  reservation_type: string;
  participant_count: number;
  total_price: number | null;
  deposit_amount: number | null;
  deposit_paid: boolean;
  reservation_date: string | null;
  notes: string | null;
  created_at: string;
  offer: {
    id: string;
    title: string;
    offer_type: string | null;
    region: string | null;
    duration: string | null;
  };
  session: {
    date: string;
    start_time: string | null;
    end_time: string | null;
  } | null;
  traveler?: {
    user_id: string;
    full_name: string | null;
    photo: string | null;
    phone: string | null;
  };
  invited_members?: {
    user_id: string;
    full_name: string;
    photo: string | null;
    status: string;
    share_amount: number | null;
  }[];
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
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiFetch<Reservation>(`/reservations/${id}`)
      .then(setReservation)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAction(status: "confirmed" | "rejected") {
    setActionLoading(true);
    try {
      const body: any = { status };
      if (status === "rejected" && rejectReason) body.reason = rejectReason;
      await apiFetch(`/reservations/${id}/confirm`, { method: "PATCH", body: JSON.stringify(body) });
      setReservation((r) => r ? { ...r, status } : r);
      setShowRejectForm(false);
    } catch {} finally { setActionLoading(false); }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!reservation) {
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.push("/dashboard/provider")}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500">
            <ChevronLeft size={20} />
          </button>
          <h1 className="font-bold text-slate-800 flex-1">Réservation reçue</h1>
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

        {/* Offre */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
          <span className="text-4xl">{TYPE_ICONS[reservation.offer.offer_type ?? ""] ?? "🌿"}</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800">{reservation.offer.title}</p>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-1">
              {reservation.offer.region && <span className="flex items-center gap-1"><MapPin size={10} />{reservation.offer.region}</span>}
              {reservation.offer.duration && <span className="flex items-center gap-1"><Clock size={10} />{reservation.offer.duration}</span>}
            </div>
          </div>
        </div>

        {/* Créneau */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Calendar size={15} className="text-emerald-500" /> Créneau demandé
          </h3>
          {reservation.session ? (
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-slate-700">
                {new Date(reservation.session.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
              {reservation.session.start_time && (
                <p className="text-slate-500">
                  {reservation.session.start_time}{reservation.session.end_time ? ` → ${reservation.session.end_time}` : ""}
                </p>
              )}
            </div>
          ) : reservation.reservation_date ? (
            <p className="text-sm font-semibold text-slate-700">
              {new Date(reservation.reservation_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          ) : (
            <p className="text-slate-400 text-sm">Date à convenir</p>
          )}
        </div>

        {/* Voyageur */}
        {reservation.traveler && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <User size={15} className="text-emerald-500" /> Voyageur organisateur
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                {reservation.traveler.photo
                  ? <img src={reservation.traveler.photo} alt="" className="w-full h-full object-cover" />
                  : <User size={20} className="text-emerald-400" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{reservation.traveler.full_name ?? "—"}</p>
                {reservation.traveler.phone && (
                  <a href={`tel:${reservation.traveler.phone}`}
                    className="flex items-center gap-1 text-xs text-emerald-600 mt-0.5 hover:underline">
                    <Phone size={11} /> {reservation.traveler.phone}
                  </a>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Groupe</p>
                <p className="font-bold text-slate-800">{reservation.participant_count} pers.</p>
              </div>
            </div>

            {/* Membres invités */}
            {reservation.invited_members && reservation.invited_members.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-50">
                <p className="text-xs text-slate-500 font-medium mb-2">Membres invités</p>
                <div className="space-y-2">
                  {reservation.invited_members.map((m) => (
                    <div key={m.user_id} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {m.photo ? <img src={m.photo} alt="" className="w-full h-full object-cover" /> : <User size={12} className="text-emerald-400" />}
                      </div>
                      <span className="text-sm text-slate-700 flex-1">{m.full_name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${m.status === "accepted" ? "bg-emerald-100 text-emerald-700" :
                          m.status === "declined" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                        {m.status === "accepted" ? "Accepté" : m.status === "declined" ? "Refusé" : "En attente"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {reservation.notes && (
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
            <p className="text-xs font-bold text-blue-800 mb-1 flex items-center gap-1">
              <MessageSquare size={12} /> Notes du voyageur
            </p>
            <p className="text-sm text-blue-700">{reservation.notes}</p>
          </div>
        )}

        {/* Paiement */}
        {reservation.total_price !== null && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <CreditCard size={15} className="text-emerald-500" /> Paiement
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Total</span>
                <span className="font-bold text-slate-800 text-base">{Number(reservation.total_price).toFixed(0)} TND</span>
              </div>
              {reservation.deposit_amount !== null && Number(reservation.deposit_amount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Acompte</span>
                  <span className={`font-semibold ${reservation.deposit_paid ? "text-emerald-600" : "text-amber-600"}`}>
                    {Number(reservation.deposit_amount).toFixed(0)} TND {reservation.deposit_paid ? "✓" : "(non payé)"}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {canAct && (
          <div className="space-y-3">
            <button onClick={() => handleAction("confirmed")} disabled={actionLoading}
              className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2 text-base">
              <CheckCircle size={18} /> Confirmer la réservation
            </button>

            {!showRejectForm ? (
              <button onClick={() => setShowRejectForm(true)}
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
                    className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
                    Annuler
                  </button>
                  <button onClick={() => handleAction("rejected")} disabled={actionLoading}
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
