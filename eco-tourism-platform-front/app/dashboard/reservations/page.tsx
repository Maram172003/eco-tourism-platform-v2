"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  Calendar, Clock, MapPin, AlertCircle, Check, X, ChevronRight,
  ArrowLeft,
} from "lucide-react";
import AppNavbar from "@/components/nav/AppNavbar";
import { useRouter } from "next/navigation";

interface Booking {
  id: string;
  status: string;
  total_price: number;
  participants: { full_name: string }[];
  special_requests: string | null;
  created_at: string;
  session: { date: string; start_time: string; end_time: string } | null;
  offer: { id: string; title: string; region: string | null; images: string[] | null };
}

const STATUS_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "En attente", color: "text-amber-600", bg: "bg-amber-50" },
  confirmed: { label: "Confirmée", color: "text-primary", bg: "bg-emerald-50" },
  cancelled: { label: "Annulée", color: "text-red-600", bg: "bg-red-50" },
  completed: { label: "Terminée", color: "text-blue-600", bg: "bg-blue-50" },
};

export default function MyReservationsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchBookings = () => {
    apiFetch<Booking[]>("/bookings/mine")
      .then(setBookings)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Annuler cette réservation ?")) return;
    setCancelling(id);
    try {
      await apiFetch(`/bookings/${id}/cancel`, { method: "PATCH" });
      fetchBookings();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 pb-12">
      <AppNavbar title="Mes réservations" />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-emerald-700 transition-colors mb-4"
        >
          <ArrowLeft size={18} /> Tableau de bord
        </button>

        <h1 className="text-2xl font-bold text-slate-800 mb-6">Mes réservations</h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
            <Calendar size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 mb-4">Aucune réservation pour le moment</p>
            <button onClick={() => router.push("/offers")} className="text-primary underline text-sm">
              Découvrir des offres
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const badge = STATUS_BADGES[booking.status] ?? STATUS_BADGES.pending;
              return (
                <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        {booking.offer.images?.[0] ? (
                          <img src={booking.offer.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <MapPin size={20} className="text-emerald-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-slate-800">{booking.offer.title}</h3>
                          {booking.offer.region && (
                            <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin size={11} /> {booking.offer.region}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.bg} ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
                      {booking.session && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(booking.session.date).toLocaleDateString("fr-FR")}
                          {" "}{booking.session.start_time}–{booking.session.end_time}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(booking.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>

                    {booking.participants?.length > 0 && (
                      <div className="text-xs text-slate-400 mb-3">
                        {booking.participants.length} participant{booking.participants.length > 1 ? "s" : ""}
                        : {booking.participants.map((p) => p.full_name).join(", ")}
                      </div>
                    )}

                    {booking.special_requests && (
                      <div className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 mb-3">
                        {booking.special_requests}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                      <span className="font-bold text-primary">
                        {Number(booking.total_price).toLocaleString()} TND
                      </span>
                      <div className="flex gap-2">
                        {["pending", "confirmed"].includes(booking.status) && (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancelling === booking.id}
                            className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 disabled:opacity-50"
                          >
                            {cancelling === booking.id ? "..." : "Annuler"}
                          </button>
                        )}
                        <button
                          onClick={() => router.push(`/offers/${booking.offer.id}`)}
                          className="text-xs text-primary hover:text-emerald-700 flex items-center gap-1"
                        >
                          Voir l&apos;offre <ChevronRight size={14} />
                        </button>
                      </div>
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
}
