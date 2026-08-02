"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  Check, X, Clock, MapPin, Calendar, ArrowLeft, AlertCircle, User, Route,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Booking {
  id: string;
  status: string;
  total_price: number;
  participants: { full_name: string; document_type: string; document_number: string }[];
  special_requests: string | null;
  created_at: string;
  session: { date: string; start_time: string; end_time: string } | null;
  offer: { title: string; region: string | null; images: string[] | null; confirmation_mode: string };
}

interface CircuitReservation {
  id: string;
  status: string;
  participants_count: number;
  base_total: number;
  final_total: number;
  created_at: string;
  circuit: { title: string; region: string | null };
  user: { full_name: string; email: string };
}

const STATUS_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "En attente", color: "text-amber-600", bg: "bg-amber-50" },
  confirmed: { label: "Confirmée", color: "text-primary", bg: "bg-emerald-50" },
  cancelled: { label: "Annulée", color: "text-red-600", bg: "bg-red-50" },
  completed: { label: "Terminée", color: "text-blue-600", bg: "bg-blue-50" },
};

export default function IncomingReservationsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [circuitReservations, setCircuitReservations] = useState<CircuitReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"offers" | "circuits">("offers");

  const fetchBookings = () => {
    Promise.all([
      apiFetch<Booking[]>("/reservations/incoming").catch(() => []),
      apiFetch<CircuitReservation[]>("/circuits/reservations/incoming").catch(() => []),
    ]).then(([b, c]) => {
      setBookings(b);
      setCircuitReservations(c);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleConfirmBooking = async (id: string) => {
    setProcessingId(id);
    try {
      await apiFetch(`/reservations/${id}/confirm`, { method: "PATCH" });
      fetchBookings();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectBooking = async (id: string) => {
    if (!confirm("Refuser cette réservation ?")) return;
    setProcessingId(id);
    try {
      await apiFetch(`/reservations/${id}/cancel`, { method: "PATCH" });
      fetchBookings();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmCircuit = async (id: string) => {
    setProcessingId(id);
    try {
      await apiFetch(`/circuits/reservations/${id}/confirm`, { method: "PATCH" });
      fetchBookings();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectCircuit = async (id: string) => {
    if (!confirm("Refuser cette réservation ?")) return;
    setProcessingId(id);
    try {
      await apiFetch(`/circuits/reservations/${id}/reject`, { method: "PATCH" });
      fetchBookings();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
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
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mb-4"
        >
          <ArrowLeft size={18} /> Dashboard
        </button>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">Réservations reçues</h1>
        <p className="text-slate-400 text-sm mb-4">Gérez les demandes de réservation pour vos offres et circuits</p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("offers")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === "offers" ? "bg-primary text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
          >
            Offres ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("circuits")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === "circuits" ? "bg-primary text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
          >
            Circuits ({circuitReservations.length})
          </button>
        </div>

        {activeTab === "offers" && (
          bookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
              <Clock size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">Aucune réservation d&apos;offre reçue</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const badge = STATUS_BADGES[booking.status] ?? STATUS_BADGES.pending;
                const isPending = booking.status === "pending";
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

                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                        <User size={12} />
                        {booking.participants?.length > 0 && (
                          <span>{booking.participants.map((p) => p.full_name).join(", ")}</span>
                        )}
                      </div>

                      {booking.session && (
                        <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(booking.session.date).toLocaleDateString("fr-FR")}
                          {" "}{booking.session.start_time}–{booking.session.end_time}
                        </div>
                      )}

                      {booking.special_requests && (
                        <div className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 mb-3 flex items-start gap-1.5">
                          <AlertCircle size={12} className="mt-0.5 shrink-0" />
                          {booking.special_requests}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary">
                            {Number(booking.total_price).toLocaleString()} TND
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(booking.created_at).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                        {isPending && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleConfirmBooking(booking.id)}
                              disabled={processingId === booking.id}
                              className="flex items-center gap-1 text-xs text-white bg-primary hover:bg-emerald-600 rounded-lg px-3 py-1.5 disabled:opacity-50"
                            >
                              <Check size={14} /> Confirmer
                            </button>
                            <button
                              onClick={() => handleRejectBooking(booking.id)}
                              disabled={processingId === booking.id}
                              className="flex items-center gap-1 text-xs text-red-500 border border-red-200 hover:bg-red-50 rounded-lg px-3 py-1.5 disabled:opacity-50"
                            >
                              <X size={14} /> Refuser
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {activeTab === "circuits" && (
          circuitReservations.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
              <Route size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">Aucune réservation de circuit reçue</p>
            </div>
          ) : (
            <div className="space-y-4">
              {circuitReservations.map((res) => {
                const badge = STATUS_BADGES[res.status] ?? STATUS_BADGES.pending;
                const isPending = res.status === "pending";
                return (
                  <div key={res.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                          <Route size={20} className="text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{res.circuit.title}</h3>
                          {res.circuit.region && (
                            <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin size={11} /> {res.circuit.region}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.bg} ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1"><User size={12} /> {res.user.full_name}</span>
                      <span>{res.participants_count} participant{res.participants_count > 1 ? "s" : ""}</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">
                          {Number(res.final_total).toLocaleString()} TND
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(res.created_at).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      {isPending && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleConfirmCircuit(res.id)}
                            disabled={processingId === res.id}
                            className="flex items-center gap-1 text-xs text-white bg-primary hover:bg-emerald-600 rounded-lg px-3 py-1.5 disabled:opacity-50"
                          >
                            <Check size={14} /> Confirmer
                          </button>
                          <button
                            onClick={() => handleRejectCircuit(res.id)}
                            disabled={processingId === res.id}
                            className="flex items-center gap-1 text-xs text-white bg-red-500 hover:bg-red-600 rounded-lg px-3 py-1.5 disabled:opacity-50"
                          >
                            <X size={14} /> Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
