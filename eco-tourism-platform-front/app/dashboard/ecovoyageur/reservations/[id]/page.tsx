"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  ChevronLeft, Calendar, Users, MapPin, Clock, Leaf,
  CheckCircle, XCircle, AlertCircle, User, QrCode, Download,
} from "lucide-react";

interface Participant {
  id: string;
  full_name: string;
  age: number | null;
  document_type: string | null;
  document_number: string | null;
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
    images: string[] | null;
    meeting_point: string | null;
  } | null;
  offerItem: { id: string; name: string } | null;
  session: {
    id: string;
    date: string;
    start_time: string | null;
    end_time: string | null;
  } | null;
  guideOffering: { id: string; title: string } | null;
  guideOfferingSession: {
    id: string;
    date: string;
    start_time: string | null;
    end_time: string | null;
  } | null;
  participants: Participant[];
}

const TYPE_ICONS: Record<string, string> = {
  hebergement: "🏕️", activite: "🧗", circuit: "🗺️",
  restauration: "🍽️", artisanat: "🪴", location_materiel: "🎒",
  volontariat: "🌱", bien_etre: "🧘", transport: "🚌",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: {
    label: "En attente de confirmation",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    icon: <Clock size={18} className="text-amber-500" />,
  },
  confirmed: {
    label: "Réservation confirmée",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    icon: <CheckCircle size={18} className="text-emerald-500" />,
  },
  rejected: {
    label: "Réservation refusée",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    icon: <XCircle size={18} className="text-red-500" />,
  },
  cancelled: {
    label: "Réservation annulée",
    color: "text-slate-600",
    bg: "bg-slate-50 border-slate-200",
    icon: <XCircle size={18} className="text-slate-400" />,
  },
  completed: {
    label: "Expérience terminée",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    icon: <CheckCircle size={18} className="text-blue-500" />,
  },
};

function QrCodeDisplay({ value }: { value: string }) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(value)}`;
    setQrUrl(url);
  }, [value]);

  if (!qrUrl) return <div className="w-40 h-40 bg-slate-100 animate-pulse rounded-xl" />;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrUrl} alt="QR Code réservation" className="w-40 h-40 rounded-xl border border-slate-200 shadow-sm" />
      <a href={qrUrl} download={`reservation-${value}.png`} target="_blank" rel="noreferrer"
        className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold hover:underline">
        <Download size={12} /> Télécharger le QR
      </a>
    </div>
  );
}

export default function ReservationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiFetch<Reservation>(`/reservations/${id}`)
      .then(setReservation)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleCancel() {
    setCancelling(true);
    try {
      await apiFetch(`/reservations/${id}/cancel`, { method: "PATCH" });
      setReservation((r) => (r ? { ...r, status: "cancelled" } : r));
      setConfirmCancel(false);
    } catch {
      setLoadError(true);
    } finally {
      setCancelling(false);
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
        <button onClick={() => router.push("/reservations")} className="text-emerald-600 text-sm hover:underline">
          Mes réservations
        </button>
      </div>
    );
  }

  const status = STATUS_CONFIG[reservation.status] ?? STATUS_CONFIG.pending;
  const canCancel = reservation.status === "pending" || reservation.status === "confirmed";
  const offer = reservation.offer;
  const guideTitle = reservation.guideOffering?.title ?? null;
  const itemName = reservation.offerItem?.name ?? null;
  const mainTitle = offer?.title ?? guideTitle ?? itemName ?? "Réservation";
  const mainImage = offer?.images?.[0] ?? null;
  const slotDate = reservation.session?.date ?? reservation.guideOfferingSession?.date ?? null;
  const slotTime = reservation.session?.start_time ?? reservation.guideOfferingSession?.start_time ?? null;
  const slotEndTime = reservation.session?.end_time ?? reservation.guideOfferingSession?.end_time ?? null;
  const slotLabel = reservation.session ? "Session choisie" : reservation.guideOfferingSession ? "Prestation guide" : "Date souhaitée";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.push("/reservations")}
            aria-label="Retour à mes réservations"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500">
            <ChevronLeft size={20} />
          </button>
          <h1 className="font-bold text-slate-800 flex-1">Détail de la réservation</h1>
          {reservation.reservation_ref && (
            <span className="text-xs font-mono text-slate-400">Réf. {reservation.reservation_ref}</span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        <div className={`rounded-2xl border p-4 flex items-center gap-3 ${status.bg}`}>
          {status.icon}
          <div>
            <p className={`font-bold text-sm ${status.color}`}>{status.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Réservé le {new Date(reservation.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-emerald-100 to-teal-200 relative">
            {mainImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mainImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">
                {TYPE_ICONS[offer?.offer_type ?? ""] ?? "🌿"}
              </div>
            )}
          </div>
          <div className="p-4">
            {offer ? (
              <button onClick={() => router.push(`/offers/${offer.id}`)}
                className="font-bold text-slate-800 text-lg hover:text-emerald-600 transition-colors text-left">
                {offer.title}
              </button>
            ) : (
              <p className="font-bold text-slate-800 text-lg">{mainTitle}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2 text-xs text-slate-500">
              {offer?.region && (
                <span className="flex items-center gap-1"><MapPin size={10} /> {offer.region}</span>
              )}
              {offer?.duration && (
                <span className="flex items-center gap-1"><Clock size={10} /> {offer.duration}</span>
              )}
              {!offer && guideTitle && (
                <span className="flex items-center gap-1"><User size={10} /> Prestation guide</span>
              )}
              {itemName && itemName !== mainTitle && (
                <span className="flex items-center gap-1"><Leaf size={10} /> {itemName}</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Calendar size={16} className="text-emerald-500" /> Créneau
          </h3>
          <div className="space-y-2 text-sm">
            {slotDate ? (
              <>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">{slotLabel}</span>
                  <span className="font-medium text-slate-800 text-right">
                    {new Date(slotDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
                {slotTime && (
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Horaire</span>
                    <span className="font-medium text-slate-800">
                      {slotTime}{slotEndTime ? ` → ${slotEndTime}` : ""}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-slate-400 text-sm">Date à confirmer avec le prestataire</p>
            )}
            {offer?.meeting_point && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Point de rendez-vous</span>
                <span className="font-medium text-slate-800 text-right max-w-52">{offer.meeting_point}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Users size={16} className="text-emerald-500" /> Participants
          </h3>
          {reservation.participants?.length > 0 ? (
            <div className="space-y-2">
              {reservation.participants.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    <User size={14} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {p.full_name}
                      {p.is_group_leader && (
                        <span className="ml-1.5 text-[10px] font-semibold text-emerald-600 bg-emerald-100 rounded-full px-1.5 py-0.5">Responsable</span>
                      )}
                    </p>
                    {p.age != null && <p className="text-xs text-slate-400">{p.age} ans</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Vous (participant principal)</p>
          )}
          <p className="text-xs text-slate-400 mt-3">
            {reservation.participants?.length ?? 1} participant{reservation.participants?.length !== 1 ? "s" : ""}
          </p>
        </div>

        {reservation.total_price !== null && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Leaf size={16} className="text-emerald-500" /> Paiement
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Total</span>
              <span className="font-bold text-slate-800 text-lg">{Number(reservation.total_price).toLocaleString()} {reservation.currency ?? "TND"}</span>
            </div>
          </div>
        )}

        {reservation.special_requests && (
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
            <p className="text-xs font-bold text-blue-800 mb-1">Demandes spéciales</p>
            <p className="text-sm text-blue-700">{reservation.special_requests}</p>
          </div>
        )}

        {reservation.status === "cancelled" && reservation.cancel_reason && (
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-bold text-slate-600 mb-1">Motif d'annulation</p>
            <p className="text-sm text-slate-500">{reservation.cancel_reason}</p>
          </div>
        )}

        {reservation.status === "confirmed" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col items-center gap-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 self-start">
              <QrCode size={16} className="text-emerald-500" /> QR Code de confirmation
            </h3>
            <QrCodeDisplay value={`eco-voyage-reservation:${reservation.id}`} />
            <p className="text-xs text-slate-400 text-center">Présentez ce QR code au prestataire le jour J</p>
          </div>
        )}

        {canCancel && (
          <div className="bg-red-50 rounded-2xl border border-red-100 p-4">
            <p className="text-sm font-bold text-red-800 mb-2">Annuler la réservation</p>
            <p className="text-xs text-red-600 mb-3">L'annulation peut être soumise à des frais selon la politique du prestataire.</p>
            <button onClick={() => setConfirmCancel(true)} disabled={cancelling}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-200 disabled:opacity-50">
              <XCircle size={14} /> {cancelling ? "Annulation..." : "Annuler ma réservation"}
            </button>
          </div>
        )}

        {reservation.guideOffering && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex-shrink-0 flex items-center justify-center text-xl">🌿</div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800">{reservation.guideOffering.title}</p>
              <p className="text-xs text-slate-400">Prestation guide</p>
            </div>
          </div>
        )}
      </div>

      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
          <div className="bg-white rounded-2xl shadow-lg mx-4 w-full max-w-sm p-5">
            <h3 id="cancel-title" className="font-bold text-slate-800 mb-2">Annuler cette réservation ?</h3>
            <p className="text-sm text-slate-500 mb-4">Les places réservées seront libérées.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmCancel(false)} disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                Retour
              </button>
              <button onClick={handleCancel} disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50">
                {cancelling ? "…" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
