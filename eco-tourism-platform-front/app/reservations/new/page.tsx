"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, Leaf, Check, AlertCircle } from "lucide-react";
import AppNavbar from "@/components/nav/AppNavbar";
import BackToDashboard from "@/components/nav/BackToDashboard";

interface OfferItem {
  id: string;
  name: string;
  item_type: string | null;
  status: string;
  prices: { id: string; label: string; price: number; currency: string; is_default: boolean }[];
  sessions: {
    id: string; date: string; start_time: string; end_time: string;
    total_capacity: number | null; remaining_capacity: number | null;
    price_override: number | null; status: string;
  }[];
}

interface Offer {
  id: string;
  title: string;
  price: number | null;
  confirmation_mode: string;
  items: OfferItem[];
}

interface Participant {
  full_name: string;
  age: number | null;
  document_type: string;
  document_number: string;
  is_group_leader: boolean;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <NewReservationPage />
    </Suspense>
  );
}

function NewReservationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const offerId = searchParams.get("offerId");

  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [specialRequests, setSpecialRequests] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([
    { full_name: "", age: null, document_type: "none", document_number: "", is_group_leader: true },
  ]);
  const [isCircuit, setIsCircuit] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push(`/auth/login?redirect=/reservations/new?offerId=${offerId}`);
      return;
    }
    if (!offerId) { setLoading(false); return; }
    apiFetch<Offer>(`/offers/${offerId}`)
      .then((data) => { setOffer(data); setLoading(false); })
      .catch(() => {
        apiFetch<any>(`/circuits/${offerId}`)
          .then((c) => {
            setIsCircuit(true);
            setOffer({
              id: c.id,
              title: c.title,
              price: c.base_price,
              confirmation_mode: c.confirmation_mode ?? "automatic",
              items: c.options?.filter((o: any) => o.status === "active" && !o.is_included).map((o: any) => ({
                id: o.id,
                name: o.option_group ?? "Option",
                item_type: "circuit_option",
                status: o.status,
                prices: [{ id: "default", label: "Prix", price: o.extra_price ?? 0, currency: c.currency ?? "TND", is_default: true }],
                sessions: [],
              })) ?? [],
            });
          })
          .catch(() => {})
          .finally(() => setLoading(false));
      });
  }, [offerId]);

  const addParticipant = () => {
    setParticipants([...participants, { full_name: "", age: null, document_type: "none", document_number: "", is_group_leader: false }]);
  };

  const removeParticipant = (index: number) => {
    if (participants.length <= 1) return;
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string | number | boolean | null) => {
    const updated = [...participants];
    (updated[index] as any)[field] = value;
    setParticipants(updated);
  };

  const baseUnitPrice = offer?.price
    ? Number(offer.price)
    : offer?.items?.length
    ? offer.items
        .filter((i) => i.status !== "inactive")
        .reduce((sum, i) => {
          const p = i.prices?.find((pp) => pp.is_default) ?? i.prices?.[0];
          return sum + (p ? Number(p.price) : 0);
        }, 0)
    : 0;

  const displayPrice = baseUnitPrice * participants.length;

  const handleSubmit = async () => {
    if (!offerId || !participants[0].full_name.trim()) {
      setError("Veuillez remplir le nom du participant principal.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (isCircuit) {
        const result = await apiFetch<any>(`/circuits/${offerId}/reserve`, {
          method: "POST",
          body: JSON.stringify({
            participants_count: participants.length,
          }),
        });
        setBookingRef(result.reservation_ref ?? null);
        setTotalPrice(Number(result.final_total ?? result.base_total ?? 0));
      } else {
        const result = await apiFetch<any>("/reservations", {
          method: "POST",
          body: JSON.stringify({
            offer_id: offerId,
            special_requests: specialRequests || undefined,
            confirmation_mode: offer?.confirmation_mode ?? "automatic",
            participants: participants.filter((p) => p.full_name.trim()),
          }),
        });
        setBookingRef(result.reservation_ref ?? null);
        setTotalPrice(Number(result.total_price ?? 0));
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!offerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={40} className="mx-auto mb-3 text-amber-400" />
          <p className="text-slate-500">Aucune offre sélectionnée</p>
          <button onClick={() => router.push("/offers")} className="mt-4 text-primary underline text-sm">Voir les offres</button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {offer?.confirmation_mode === "manual" ? "Demande envoyée !" : "Réservation confirmée !"}
          </h2>
          <p className="text-slate-500 text-sm mb-4">
            {offer?.confirmation_mode === "manual"
              ? "Votre demande a été envoyée. Le prestataire va la confirmer sous peu."
              : "Votre réservation est confirmée. Vous recevrez un email de confirmation."}
          </p>

          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2">
            {bookingRef && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Référence</span>
                <span className="font-mono font-bold text-slate-800">{bookingRef}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Offre</span>
              <span className="font-medium text-slate-800">{offer?.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Participants</span>
              <span className="font-medium text-slate-800">{participants.length}</span>
            </div>
            {totalPrice > 0 && (
              <div className="flex justify-between text-sm border-t border-slate-200 pt-2">
                <span className="text-slate-500 font-medium">Total</span>
                <span className="font-bold text-primary">{totalPrice.toLocaleString()} TND</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push("/dashboard/reservations")} className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-emerald-600">
              Mes réservations
            </button>
            <button onClick={() => router.push("/offers")} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
              Continuer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 pb-12">
      <AppNavbar title="Nouvelle réservation" />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <BackToDashboard />

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h1 className="text-xl font-bold text-slate-800 mb-1">Nouvelle réservation</h1>
          <p className="text-slate-400 text-sm mb-6">{offer?.title}</p>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 flex items-start gap-2 text-sm text-red-600">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-1">Participants</label>
            {participants.map((p, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Participant {i + 1}{p.is_group_leader ? " (responsable)" : ""}</span>
                  {i > 0 && (
                    <button onClick={() => removeParticipant(i)} className="text-xs text-red-400 hover:text-red-600">Supprimer</button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nom complet *"
                    value={p.full_name}
                    onChange={(e) => updateParticipant(i, "full_name", e.target.value)}
                    className="col-span-2 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                  <input
                    type="number"
                    placeholder="Âge"
                    value={p.age ?? ""}
                    onChange={(e) => updateParticipant(i, "age", e.target.value ? parseInt(e.target.value) : null)}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                  <select
                    value={p.document_type}
                    onChange={(e) => updateParticipant(i, "document_type", e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  >
                    <option value="none">Aucun document</option>
                    <option value="passport">Passeport</option>
                    <option value="id_card">Carte d&apos;identité</option>
                  </select>
                  {p.document_type !== "none" && (
                    <input
                      type="text"
                      placeholder="N° document"
                      value={p.document_number}
                      onChange={(e) => updateParticipant(i, "document_number", e.target.value)}
                      className="col-span-2 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                  )}
                </div>
              </div>
            ))}
            <button onClick={addParticipant} className="text-sm text-primary hover:text-emerald-700 font-medium">
              + Ajouter un participant
            </button>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-1">Demandes spéciales</label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Allergies, préférences, informations complémentaires..."
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
            />
          </div>

          <div className="border-t border-slate-100 pt-4 mb-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Total</span>
              <span className="font-bold text-lg text-primary">{displayPrice.toLocaleString()} TND</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Réservation en cours…
              </>
            ) : (
              <>
                <Check size={18} />
                Confirmer la réservation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
