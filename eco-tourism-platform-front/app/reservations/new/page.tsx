"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  Calendar, Users, User, UserPlus, X, ChevronLeft, ChevronRight,
  Leaf, Clock, MapPin, AlertCircle, CheckCircle, Search, Check,
  CreditCard, Zap, MessageSquare,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Offer {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  price_type: string | null;
  duration: string | null;
  region: string | null;
  images: string[] | null;
  offer_type: string | null;
  fulfillment_mode: string | null;
  confirmation_mode: string | null;
  capacity: number | null;
  deposit_percentage: number | null;
  booking_deadline_hours: number | null;
  min_group_size: number | null;
  max_group_size: number | null;
  cancellation_policy: string | null;
}

interface OfferSession {
  id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  capacity: number | null;
  spots_taken: number;
  status: string;
}

interface UserResult {
  user_id: string;
  full_name: string;
  photo: string | null;
}

const STEPS = ["Créneau", "Participants", "Paiement"];

const TYPE_ICONS: Record<string, string> = {
  hebergement: "🏕️", activite: "🧗", circuit: "🗺️",
  restauration: "🍽️", artisanat: "🪴", location_materiel: "🎒",
  volontariat: "🌱", bien_etre: "🧘", transport: "🚌",
};

const FULFILLMENT_LABELS: Record<string, string> = {
  instant_stock: "Réservation directe",
  calendar_stock: "Calendrier",
  scheduled: "Séances planifiées",
  recurring: "Récurrent",
  on_request: "Sur demande",
  mixed: "Mixte",
};

// ─── Page principale ──────────────────────────────────────────────────────────

function NewReservationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const offerId = searchParams.get("offerId");

  const [step, setStep] = useState(0);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [sessions, setSessions] = useState<OfferSession[]>([]);
  const [loadingOffer, setLoadingOffer] = useState(true);

  // Étape 1
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [requestedDate, setRequestedDate] = useState("");

  // Étape 2
  const [participantCount, setParticipantCount] = useState(1);
  const [reservationType, setReservationType] = useState<"solo" | "group">("solo");
  const [invitedUsers, setInvitedUsers] = useState<UserResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [notes, setNotes] = useState("");

  // Soumission
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!offerId) return;
    apiFetch<Offer>(`/offers/${offerId}`)
      .then((o) => {
        setOffer(o);
        // Charger les séances si scheduled/recurring
        if (o.fulfillment_mode === "scheduled" || o.fulfillment_mode === "recurring") {
          return apiFetch<OfferSession[]>(`/offers/${offerId}/sessions`).then(setSessions).catch(() => {});
        }
      })
      .catch(() => setError("Offre introuvable."))
      .finally(() => setLoadingOffer(false));
  }, [offerId]);

  // Recherche d'amis
  useEffect(() => {
    if (!searchQuery.trim() || reservationType !== "group") {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await apiFetch<UserResult[]>(`/eco-traveler/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(results.filter((u) => !invitedUsers.find((i) => i.user_id === u.user_id)));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, reservationType, invitedUsers]);

  // ─── Calculs prix ───────────────────────────────────────────────────────────
  const realParticipantCount = reservationType === "group" ? 1 + invitedUsers.length : participantCount;
  const pricePerUnit = offer?.price ? Number(offer.price) : null;
  const totalPrice = pricePerUnit !== null ? pricePerUnit * realParticipantCount : null;
  const depositPct = offer?.deposit_percentage ?? 0;
  const depositAmount = totalPrice !== null && depositPct > 0 ? (totalPrice * depositPct) / 100 : null;
  const remainingAmount = totalPrice !== null && depositAmount !== null ? totalPrice - depositAmount : null;

  // ─── Validation par étape ───────────────────────────────────────────────────
  function canNext() {
    if (!offer) return false;
    if (step === 0) {
      const mode = offer.fulfillment_mode;
      if (mode === "scheduled" || mode === "recurring") return !!selectedSessionId;
      if (mode === "on_request") return !!requestedDate;
      return true; // instant_stock, calendar_stock, mixed
    }
    if (step === 1) {
      if (reservationType === "group" && invitedUsers.length === 0) return false;
      return true;
    }
    return true;
  }

  // ─── Soumission ─────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      await apiFetch("/reservations", {
        method: "POST",
        body: JSON.stringify({
          offer_id: offerId,
          session_id: selectedSessionId ?? undefined,
          reservation_date: requestedDate || undefined,
          reservation_type: reservationType,
          participant_count: realParticipantCount,
          notes: notes || undefined,
          invited_user_ids: reservationType === "group" ? invitedUsers.map((u) => u.user_id) : [],
        }),
      });
      setSuccess(true);
      setTimeout(() => router.push("/reservations"), 2500);
    } catch (e: any) {
      setError(e.message ?? "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!offerId) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Aucune offre sélectionnée.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => step > 0 ? setStep(step - 1) : router.back()} className="text-slate-400 hover:text-slate-700">
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Leaf size={18} className="text-emerald-500" /> Réserver
            </h1>
            <p className="text-xs text-slate-400">Étape {step + 1} sur {STEPS.length} — {STEPS[step]}</p>
          </div>
        </div>
        <div className="h-1 bg-slate-100">
          <div className="h-1 bg-emerald-500 transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                ${i < step ? "bg-emerald-500 text-white" : i === step ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400" : "bg-slate-100 text-slate-400"}`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? "text-emerald-700 font-semibold" : "text-slate-400"}`}>{label}</span>
              {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? "bg-emerald-400" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        {/* Fiche offre */}
        {loadingOffer ? (
          <div className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
        ) : offer ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex gap-4">
            <div className="w-16 h-16 rounded-xl bg-emerald-50 flex-shrink-0 flex items-center justify-center text-3xl">
              {offer.images?.[0]
                ? <img src={offer.images[0]} alt={offer.title} className="w-full h-full object-cover rounded-xl" />
                : TYPE_ICONS[offer.offer_type ?? ""] ?? "🌿"
              }
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-slate-800 text-sm line-clamp-1">{offer.title}</h2>
              <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
                {offer.region && <span className="flex items-center gap-1"><MapPin size={10} />{offer.region}</span>}
                {offer.duration && <span className="flex items-center gap-1"><Clock size={10} />{offer.duration}</span>}
                {offer.fulfillment_mode && (
                  <span className="bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5">
                    {FULFILLMENT_LABELS[offer.fulfillment_mode]}
                  </span>
                )}
              </div>
              {offer.confirmation_mode === "instant" && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 rounded-full px-2 py-0.5 mt-1">
                  <Zap size={10} /> Confirmation instantanée
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 rounded-2xl p-4 text-red-600 text-sm">{error}</div>
        )}

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
            <CheckCircle size={40} className="text-emerald-500" />
            <div>
              <p className="font-bold text-emerald-800 text-lg">Réservation envoyée !</p>
              <p className="text-sm text-emerald-600 mt-1">
                {offer?.confirmation_mode === "instant"
                  ? "Votre réservation est confirmée automatiquement."
                  : "Le prestataire va confirmer votre réservation sous peu."}
              </p>
            </div>
          </div>
        ) : offer ? (
          <>
            {/* ─── Étape 1 : Créneau ─── */}
            {step === 0 && (
              <div className="space-y-4">
                {(offer.fulfillment_mode === "scheduled" || offer.fulfillment_mode === "recurring") && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Calendar size={16} /> Choisir une séance
                    </h3>
                    {sessions.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-4">Aucune séance disponible pour le moment.</p>
                    ) : (
                      <div className="space-y-2">
                        {sessions.map((s) => {
                          const available = (s.capacity ?? offer.capacity ?? 0) - s.spots_taken;
                          const full = available <= 0;
                          return (
                            <button
                              key={s.id}
                              disabled={full}
                              onClick={() => setSelectedSessionId(s.id)}
                              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all
                                ${full ? "opacity-40 cursor-not-allowed border-slate-100 bg-slate-50"
                                  : selectedSessionId === s.id
                                  ? "border-emerald-500 bg-emerald-50"
                                  : "border-slate-200 bg-white hover:border-slate-300"}`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-semibold text-slate-800 text-sm">
                                    {new Date(s.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                                  </span>
                                  {(s.start_time || s.end_time) && (
                                    <span className="text-slate-500 text-xs ml-2">
                                      {s.start_time}{s.end_time ? ` → ${s.end_time}` : ""}
                                    </span>
                                  )}
                                </div>
                                <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${full ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"}`}>
                                  {full ? "Complet" : `${available} place${available > 1 ? "s" : ""}`}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {offer.fulfillment_mode === "on_request" && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <MessageSquare size={16} /> Date souhaitée
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">
                      Le prestataire confirmera selon ses disponibilités.
                    </p>
                    <input
                      type="date"
                      value={requestedDate}
                      min={today}
                      onChange={(e) => setRequestedDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                  </div>
                )}

                {(offer.fulfillment_mode === "instant_stock" || offer.fulfillment_mode === "calendar_stock" || offer.fulfillment_mode === "mixed") && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Calendar size={16} /> Date souhaitée
                    </h3>
                    <input
                      type="date"
                      value={requestedDate}
                      min={today}
                      onChange={(e) => setRequestedDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                    {offer.capacity && (
                      <p className="text-xs text-emerald-600 mt-2">
                        {offer.capacity} places disponibles au total
                      </p>
                    )}
                  </div>
                )}

                {offer.cancellation_policy && (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                    <p className="text-xs font-bold text-amber-800 mb-1">Politique d'annulation</p>
                    <p className="text-xs text-amber-700">{offer.cancellation_policy}</p>
                  </div>
                )}
              </div>
            )}

            {/* ─── Étape 2 : Participants ─── */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                  <h3 className="font-semibold text-slate-700 mb-3">Type de réservation</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { v: "solo", icon: <User size={20} />, label: "Solo", desc: "Réservation individuelle" },
                      { v: "group", icon: <Users size={20} />, label: "Groupe", desc: "Inviter des amis" },
                    ].map((t) => (
                      <button
                        key={t.v}
                        type="button"
                        onClick={() => { setReservationType(t.v as any); if (t.v === "solo") setInvitedUsers([]); }}
                        className={`p-4 rounded-xl border-2 text-left transition-all
                          ${reservationType === t.v ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-slate-300"}`}
                      >
                        <div className={reservationType === t.v ? "text-emerald-500 mb-2" : "text-slate-400 mb-2"}>{t.icon}</div>
                        <p className={`font-semibold text-sm ${reservationType === t.v ? "text-emerald-700" : "text-slate-600"}`}>{t.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {reservationType === "solo" && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Users size={16} /> Nombre de participants
                    </h3>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setParticipantCount(Math.max(1, participantCount - 1))}
                        className="w-10 h-10 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-xl hover:border-emerald-300 flex items-center justify-center"
                      >−</button>
                      <span className="text-2xl font-bold text-slate-800 w-8 text-center">{participantCount}</span>
                      <button
                        type="button"
                        onClick={() => setParticipantCount(Math.min(offer.max_group_size ?? 99, participantCount + 1))}
                        className="w-10 h-10 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-xl hover:border-emerald-300 flex items-center justify-center"
                      >+</button>
                      <span className="text-sm text-slate-400">personne{participantCount > 1 ? "s" : ""}</span>
                    </div>
                  </div>
                )}

                {reservationType === "group" && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <UserPlus size={16} /> Inviter des amis
                    </h3>
                    <div className="relative mb-3">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Rechercher un éco-voyageur..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      />
                    </div>
                    {searching && <p className="text-xs text-slate-400 mb-2">Recherche en cours…</p>}
                    {searchResults.length > 0 && (
                      <div className="border border-slate-100 rounded-xl divide-y mb-3 overflow-hidden">
                        {searchResults.map((u) => (
                          <button key={u.user_id} type="button" onClick={() => { setInvitedUsers((p) => [...p, u]); setSearchQuery(""); setSearchResults([]); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-emerald-50 text-left">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                              {u.photo ? <img src={u.photo} alt={u.full_name} className="w-full h-full object-cover" /> : <User size={16} className="text-emerald-400" />}
                            </div>
                            <span className="text-sm font-medium text-slate-700">{u.full_name}</span>
                            <span className="ml-auto text-xs text-emerald-500">+ Inviter</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {invitedUsers.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-500 font-medium">Invités ({invitedUsers.length})</p>
                        {invitedUsers.map((u) => (
                          <div key={u.user_id} className="flex items-center gap-3 bg-emerald-50 rounded-xl px-3 py-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                              {u.photo ? <img src={u.photo} alt="" className="w-full h-full object-cover" /> : <User size={13} className="text-emerald-500" />}
                            </div>
                            <span className="text-sm font-medium text-slate-700 flex-1">{u.full_name}</span>
                            <button type="button" onClick={() => setInvitedUsers((p) => p.filter((x) => x.user_id !== u.user_id))} className="text-slate-400 hover:text-red-400">
                              <X size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                  <h3 className="font-semibold text-slate-700 mb-3">Notes (optionnel)</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Allergies, demandes spéciales, questions pour le prestataire..."
                    rows={3}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
                  />
                </div>
              </div>
            )}

            {/* ─── Étape 3 : Paiement ─── */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                  <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <CreditCard size={16} /> Récapitulatif & Paiement
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Offre</span>
                      <span className="font-medium line-clamp-1 max-w-40 text-right">{offer.title}</span>
                    </div>
                    {selectedSessionId && sessions.length > 0 && (() => {
                      const s = sessions.find((x) => x.id === selectedSessionId);
                      return s ? (
                        <div className="flex justify-between text-slate-600">
                          <span>Séance</span>
                          <span className="font-medium">{new Date(s.date).toLocaleDateString("fr-FR")} {s.start_time && `à ${s.start_time}`}</span>
                        </div>
                      ) : null;
                    })()}
                    {requestedDate && (
                      <div className="flex justify-between text-slate-600">
                        <span>Date souhaitée</span>
                        <span className="font-medium">{new Date(requestedDate).toLocaleDateString("fr-FR")}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Participants</span>
                      <span className="font-medium">{realParticipantCount} personne{realParticipantCount > 1 ? "s" : ""}</span>
                    </div>
                    {pricePerUnit !== null && (
                      <div className="flex justify-between text-slate-600">
                        <span>Prix unitaire</span>
                        <span>{pricePerUnit.toFixed(0)} TND</span>
                      </div>
                    )}
                    <div className="border-t border-slate-100 pt-3">
                      {totalPrice !== null ? (
                        <>
                          <div className="flex justify-between font-bold text-slate-800 text-base">
                            <span>Total</span>
                            <span>{totalPrice.toFixed(0)} TND</span>
                          </div>
                          {depositAmount !== null && depositAmount > 0 ? (
                            <>
                              <div className="flex justify-between text-amber-600 font-semibold mt-2">
                                <span>Acompte à payer maintenant ({depositPct}%)</span>
                                <span>{depositAmount.toFixed(0)} TND</span>
                              </div>
                              <div className="flex justify-between text-slate-400 text-xs mt-1">
                                <span>Reste à payer le jour J</span>
                                <span>{remainingAmount!.toFixed(0)} TND</span>
                              </div>
                            </>
                          ) : (
                            <p className="text-xs text-emerald-600 mt-1">Paiement intégral à la confirmation.</p>
                          )}
                        </>
                      ) : (
                        <p className="text-slate-400 text-sm">Le prix sera défini par le prestataire.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mode de confirmation */}
                <div className={`rounded-2xl p-4 border ${offer.confirmation_mode === "instant" ? "bg-amber-50 border-amber-100" : "bg-blue-50 border-blue-100"}`}>
                  {offer.confirmation_mode === "instant" ? (
                    <div className="flex items-center gap-2 text-amber-700">
                      <Zap size={16} />
                      <div>
                        <p className="font-semibold text-sm">Confirmation instantanée</p>
                        <p className="text-xs mt-0.5">Votre réservation sera confirmée immédiatement.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-blue-700">
                      <Clock size={16} />
                      <div>
                        <p className="font-semibold text-sm">Confirmation sous 48h</p>
                        <p className="text-xs mt-0.5">Le prestataire vous confirmera votre réservation.</p>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-red-600 bg-red-50 rounded-xl p-3 text-sm">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 disabled:opacity-60 transition-colors text-base shadow-sm flex items-center justify-center gap-2"
                >
                  {submitting ? "Envoi en cours…" : depositAmount ? `Confirmer & payer l'acompte (${depositAmount.toFixed(0)} TND)` : "Confirmer la réservation"}
                </button>
              </div>
            )}

            {/* Navigation */}
            {step < 2 && (
              <div className="flex gap-3">
                {step > 0 && (
                  <button onClick={() => setStep(step - 1)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 flex items-center justify-center gap-2">
                    <ChevronLeft size={16} /> Précédent
                  </button>
                )}
                <button
                  onClick={() => canNext() && setStep(step + 1)}
                  disabled={!canNext()}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  Suivant <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function NewReservationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>}>
      <NewReservationContent />
    </Suspense>
  );
}
