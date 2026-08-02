"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft, Leaf, MapPin, Clock, Users, Star, Calendar,
  DollarSign, ShieldCheck, Info, ChevronDown, ChevronUp,
  ChevronRight, Check, Heart, ShoppingCart, AlertTriangle,
  CalendarDays, Timer, Hash, Tag, UserPlus, AlertCircle, Loader2,
} from "lucide-react";
import AppNavbar from "@/components/nav/AppNavbar";
import BackToDashboard from "@/components/nav/BackToDashboard";
import { OFFER_SCHEMAS } from "@/lib/offer-schema";
import dynamic from "next/dynamic";
import CollaborationInviteModal from "@/components/collaboration/CollaborationInviteModal";
import CollaborationCard from "@/components/collaboration/CollaborationCard";
import CollaborationWizard from "@/components/collaboration/CollaborationWizard";
import DeclineModal from "@/components/collaboration/DeclineModal";
import OfferAgendaSync from "@/components/collaboration/OfferAgendaSync";

const GuidedOfferWizard = dynamic(() => import("@/components/GuidedOfferWizard"), { ssr: false });
const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });
const OfferItemDetails = dynamic(() => import("@/components/OfferItemDetails"), { ssr: false });

interface OfferItemPrice {
  id: string;
  label: string;
  price: number;
  currency: string;
  is_default: boolean;
}

interface OfferItemCapacity {
  id: string;
  capacity_type: string;
  total_quantity: number;
  remaining_quantity: number;
}

interface OfferItemSession {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  total_capacity: number | null;
  remaining_capacity: number | null;
  price_override: number | null;
  status: string;
}

interface OfferItem {
  id: string;
  name: string;
  description: string | null;
  item_type: string | null;
  details_json: Record<string, any> | null;
  requires_confirmation: boolean;
  booking_deadline_days: number | null;
  cancellation_deadline_days: number | null;
  status: string;
  prices: OfferItemPrice[];
  sessions: OfferItemSession[];
  capacity: OfferItemCapacity[];
}

interface Offer {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  duration: string | null;
  offer_type: string | null;
  region: string | null;
  images: string[] | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  meeting_point: string | null;
  meeting_lat: number | null;
  meeting_lng: number | null;
  min_group_size: number | null;
  max_group_size: number | null;
  min_age: number | null;
  inclusions: string | null;
  cancellation_policy: string | null;
  sustainability_score: number | null;
  confirmation_mode: string;
  location_type: string;
  status: string;
  venue_id: string | null;
  venue?: { id: string; name: string } | null;
  author_id: string;
  author_type: string;
  items: OfferItem[];
  requires_guide_override?: boolean | null;
  final_price?: number | null;
  publish_ready?: boolean;
  category?: { requires_guide: boolean } | null;
}

const TYPE_LABELS: Record<string, string> = {
  eco_tour: "Éco-tour",
  accommodation: "Hébergement",
  activity: "Activité",
  restaurant: "Restaurant",
  craft: "Artisanat",
  workshop: "Atelier",
  transfer: "Transfert",
  sejour: "Séjour",
  circuit: "Circuit",
};

const SECTION_LABELS: Record<string, string> = {
  randonnee: "Randonnée / Nature",
  visite_culturelle: "Visite culturelle",
  guide_tour: "Guide touristique",
  transport: "Transport / Transfert",
  accompagnement: "Accompagnement",
  photographie: "Photographie",
  gastronomie: "Gastronomie / Dégustation",
  bien_etre: "Bien-être / Méditation",
  autre: "Autre",
};

export default function OfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [user, setUser] = useState<{ role: string; sub?: string; id?: string } | null>(null);
  const [existingBooking, setExistingBooking] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [showEditWizard, setShowEditWizard] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showWizard, setShowWizard] = useState<string | null>(null);
  const [declineCollab, setDeclineCollab] = useState<string | null>(null);
  const [collabStatus, setCollabStatus] = useState<any>(null);
  const [publishing, setPublishing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [appliedPriceEdits, setAppliedPriceEdits] = useState<Record<string, string>>({});
  const [savingAppliedPrice, setSavingAppliedPrice] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    apiFetch<Offer>(`/offers/${id}`)
      .then(setOffer)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    const u = JSON.parse(stored);
    if (u.role !== "eco_traveler") return;
    const token = localStorage.getItem("access_token");
    if (!token) return;
    apiFetch<any[]>("/reservations/mine", { headers: { Authorization: `Bearer ${token}` } })
      .then((bookings) => setExistingBooking(bookings.some((b) => b.offer?.id === id && b.status !== "cancelled" && b.status !== "rejected")))
      .catch(() => {});
    apiFetch<any>(`/favorites/check/offer/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setIsFavorite(res?.isFavorite ?? false))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    const u = JSON.parse(stored);
    if (u.role !== "provider" && u.role !== "guide") return;
    apiFetch<any[]>(`/collaborations/offer/${id}`)
      .then(setCollaborations)
      .catch(() => {});
    if (u.role === "provider") {
      apiFetch<any>(`/collaborations/offer/${id}/status`)
        .then(setCollabStatus)
        .catch(() => {});
    }
  }, [id]);

  const toggleFavorite = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    setTogglingFav(true);
    try {
      await apiFetch("/favorites", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ target_type: "offer", target_id: id }),
      });
      setIsFavorite((prev) => !prev);
    } catch {}
    setTogglingFav(false);
  };

  const addToCart = async (offerItemId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        const cartRes = await apiFetch<any>("/travel-carts/me", { headers: { Authorization: `Bearer ${token}` } });
        await apiFetch(`/travel-carts/${cartRes.id}/items`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ offer_item_id: offerItemId, quantity: 1 }),
        });
      } else {
        const cart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
        cart.push({ id: crypto.randomUUID(), type: "offer_item", ref_id: offerItemId, quantity: 1, added_at: new Date().toISOString() });
        localStorage.setItem("guest_cart", JSON.stringify(cart));
      }
      setShowAddedToCart(true);
      setTimeout(() => setShowAddedToCart(false), 2000);
    } catch (e) {
      console.error("Add to cart error:", e);
    }
  };

  const handleSaveAppliedPrice = async (collabId: string) => {
    const raw = appliedPriceEdits[collabId];
    const price = parseFloat(raw);
    if (Number.isNaN(price) || price < 0) return;
    setSavingAppliedPrice(collabId);
    try {
      await apiFetch(`/collaborations/${collabId}/applied-price`, {
        method: "PATCH",
        body: JSON.stringify({ applied_price: price }),
      });
      apiFetch<any>(`/collaborations/offer/${id}/status`)
        .then(setCollabStatus)
        .catch(() => {});
    } catch (e: any) {
      alert(e.message || "Erreur lors de la mise à jour du prix du guide");
    } finally {
      setSavingAppliedPrice(null);
    }
  };

  const handlePublish = async () => {
    if (!confirm("Confirmer la publication de cette offre ? Les guides seront notifiés.")) return;
    setPublishing(true);
    try {
      await apiFetch(`/collaborations/offer/${id}/publish`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      setOffer((prev) => prev ? { ...prev, publish_ready: true } : prev);
      apiFetch<any>(`/collaborations/offer/${id}/status`)
        .then(setCollabStatus)
        .catch(() => {});
    } catch (e: any) {
      alert(e.message || "Erreur lors de la publication");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <p className="text-slate-500">Offre introuvable</p>
      </div>
    );
  }

  const isAuthor = !!user && offer.author_id === (user.sub || user.id);
  const canReserve = user?.role === "eco_traveler" && !existingBooking && !isAuthor;
  const canAddToCart = user?.role === "eco_traveler" && !isAuthor;
  const images = offer.images?.filter(Boolean) ?? [];
  const allImages = images.length > 0 ? images : null;

  const basePrice = Number(offer.price ?? 0);
  const activeCollabs = collaborations.filter((c) =>
    ["pending", "accepted", "completed"].includes(c.status),
  );
  const guideSum = activeCollabs.reduce(
    (s, c) =>
      s + Number(c.contribution?.applied_price ?? c.contribution?.price ?? 0),
    0,
  );
  const displayTotal =
    offer.final_price != null ? Number(offer.final_price) : basePrice + guideSum;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 pb-12">
      <AppNavbar title={offer ? offer.title : "Offre"} />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <BackToDashboard />

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {allImages ? (
            <div className="h-64 sm:h-80 relative bg-slate-900">
              <img
                src={allImages[galleryIdx]}
                alt={offer.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setGalleryIdx((i) => (i - 1 + allImages.length) % allImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70"
                  >
                    <ChevronDown size={18} className="rotate-90" />
                  </button>
                  <button
                    onClick={() => setGalleryIdx((i) => (i + 1) % allImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setGalleryIdx(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === galleryIdx ? "bg-white scale-125" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
              {offer.sustainability_score !== null && (
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 text-sm font-bold text-primary shadow-sm">
                  <Star size={14} fill="currentColor" />
                  {offer.sustainability_score}
                </div>
              )}
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center">
              <Leaf size={48} className="text-emerald-400 opacity-50" />
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{offer.title}</h1>
                {offer.offer_type && (
                  <span className="inline-block mt-1 text-sm text-primary bg-emerald-50 rounded-full px-3 py-0.5 font-medium">
                    {TYPE_LABELS[offer.offer_type] ?? offer.offer_type}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {user?.role === "eco_traveler" && (
                  <button
                    onClick={toggleFavorite}
                    disabled={togglingFav}
                    className={`p-2 rounded-xl transition-colors ${
                      isFavorite
                        ? "bg-red-50 text-red-500 hover:bg-red-100"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                    }`}
                  >
                    <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                  </button>
                )}
                {isAuthor && (
                  <button onClick={() => setShowEditWizard(true)} className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl text-sm hover:bg-primary/20 transition-colors flex items-center gap-1.5">
                    ✏️ Modifier
                  </button>
                )}
              </div>
              <div className="text-right">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border mb-1 ${
                  offer.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  offer.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-red-50 text-red-700 border-red-200"
                }`}>
                  {offer.status === "approved" ? "Active" : offer.status === "pending" ? "En attente" : offer.status === "draft" ? "Brouillon" : "Refusée"}
                </span>
                {isAuthor && (offer.requires_guide_override === true || (offer.requires_guide_override === null && offer.category?.requires_guide === true)) && (
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border mb-1 ml-1 ${
                    offer.publish_ready ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {offer.publish_ready ? "Publiée avec guide" : "En attente collaboration"}
                  </span>
                )}
                {displayTotal > 0 ? (
                  <div className="text-primary font-bold text-2xl">
                    {displayTotal.toLocaleString()} <span className="text-sm font-normal text-slate-400">TND</span>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400 font-normal">Prix non défini</span>
                )}
                {isAuthor && (basePrice > 0 || guideSum > 0) && (
                  <p className="text-xs text-slate-500 mt-1">
                    Tarif de base {basePrice.toLocaleString()} TND
                    {guideSum > 0 && (
                      <> + guides {guideSum.toLocaleString()} TND ={" "}
                        <span className="font-semibold text-emerald-700">{displayTotal.toLocaleString()} TND</span>
                      </>
                    )}
                  </p>
                )}
                {offer.confirmation_mode === "automatic" ? (
                  <span className="inline-flex items-center gap-1 text-xs text-primary bg-emerald-50 rounded-full px-2 py-0.5 mt-1">
                    <ShieldCheck size={12} /> Confirmation instantanée
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 rounded-full px-2 py-0.5 mt-1">
                    <Info size={12} /> Sur demande
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-500 mb-4">
              {offer.region && <span className="flex items-center gap-1"><MapPin size={14} /> {offer.region}</span>}
              {offer.venue?.name && <span className="flex items-center gap-1"><Tag size={14} /> {offer.venue.name}</span>}
              {offer.duration && <span className="flex items-center gap-1"><Clock size={14} /> {offer.duration}</span>}
              {(offer.min_group_size || offer.max_group_size) && (
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {offer.min_group_size && offer.max_group_size
                    ? `${offer.min_group_size}–${offer.max_group_size} pers.`
                    : offer.max_group_size ? `Max ${offer.max_group_size} pers.` : `Min ${offer.min_group_size} pers.`}
                </span>
              )}
              {offer.min_age && <span className="flex items-center gap-1"><Calendar size={14} /> Âge min. {offer.min_age} ans</span>}
              {offer.location_type && (
                <span className="flex items-center gap-1">
                  {offer.location_type === "fixed" ? "📍" : "🚐"} {offer.location_type === "fixed" ? "Lieu fixe" : "Mobile"}
                </span>
              )}
            </div>

            {offer.description && (
              <p className="text-slate-600 leading-relaxed mb-4 whitespace-pre-line">{offer.description}</p>
            )}

            {offer.meeting_point && (
              <div className="bg-slate-50 rounded-xl p-3 mb-4 flex items-start gap-2 text-sm">
                <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-slate-700">Point de rendez-vous :</span>
                  <span className="text-slate-500 ml-1">{offer.meeting_point}</span>
                </div>
              </div>
            )}

            {offer.address && (
              <div className="bg-slate-50 rounded-xl p-3 mb-4 flex items-start gap-2 text-sm">
                <MapPin size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-slate-700">Adresse :</span>
                  <span className="text-slate-500 ml-1">{offer.address}</span>
                </div>
              </div>
            )}

            {(offer.latitude && offer.longitude) && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-600 mb-2">Localisation</h3>
                <MapView lat={Number(offer.latitude)} lng={Number(offer.longitude)} />
                {offer.meeting_lat && offer.meeting_lng && (
                  <p className="text-xs text-slate-400 mt-1.5">
                    Point de rendez-vous affiché séparément sur la carte
                  </p>
                )}
              </div>
            )}

            {offer.inclusions && (
              <div className="bg-emerald-50 rounded-xl p-3 mb-4 text-sm">
                <span className="font-medium text-emerald-700">Inclus :</span>
                <p className="text-primary mt-1 whitespace-pre-line">{offer.inclusions}</p>
              </div>
            )}

            {offer.cancellation_policy && (
              <div className="bg-amber-50 rounded-xl p-3 mb-4 text-sm">
                <span className="font-medium text-amber-700">Politique d&apos;annulation :</span>
                <p className="text-amber-600 mt-1 whitespace-pre-line">{offer.cancellation_policy}</p>
              </div>
            )}

            {/* ─── Règles de disponibilité ──────────────────────── */}
            {offer.items?.some((item) => item.status === "active") && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                  <CalendarDays size={14} /> Règles de disponibilité
                </h3>
                <div className="bg-blue-50 rounded-xl p-3 text-sm space-y-1.5">
                  {(() => {
                    const activeItems = (offer.items ?? []).filter((i) => i.status === "active");
                    const firstItem = activeItems[0];
                    const rules: string[] = [];
                    if (firstItem.booking_deadline_days !== null) {
                      rules.push(`Réservation obligatoire ${firstItem.booking_deadline_days} jour${firstItem.booking_deadline_days > 1 ? "s" : ""} avant la date`);
                    }
                    if (firstItem.cancellation_deadline_days !== null) {
                      rules.push(`Annulation gratuite jusqu'à ${firstItem.cancellation_deadline_days} jour${firstItem.cancellation_deadline_days > 1 ? "s" : ""} avant`);
                    }
                    if (rules.length > 0) {
                      return rules.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-blue-700">
                          <Info size={14} className="mt-0.5 shrink-0" />
                          <span>{r}</span>
                        </div>
                      ));
                    }
                    return (
                      <div className="flex items-center gap-2 text-blue-600">
                        <Info size={14} />
                        <span>Disponible sous réserve de places</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {(offer.items?.length ?? 0) > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-bold text-slate-800 mb-3">Ce qui est proposé</h2>
                <div className="space-y-3">
                  {(offer.items ?? []).filter((item) => item.status === "active").map((item) => (
                    <div key={item.id} className="border border-slate-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-slate-800">{item.name}</span>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {item.item_type && (
                              <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                                {OFFER_SCHEMAS[`${offer.offer_type}_${item.item_type}`]?.label || item.item_type}
                              </span>
                            )}
                            {(() => {
                              const schema = OFFER_SCHEMAS[`${offer.offer_type}_${item.item_type}`];
                              if (!schema?.display?.cardFields || !item.details_json) return null;
                              return schema.display.cardFields.map((f) => {
                                const val = item.details_json![f];
                                if (val == null || val === "" || (Array.isArray(val) && val.length === 0)) return null;
                                const fieldDef = schema.fields[f];
                                let display: string;
                                if (fieldDef.type === "number") {
                                  display = fieldDef.unit ? `${val} ${fieldDef.unit}` : String(val);
                                } else if (fieldDef.type === "select") {
                                  display = fieldDef.options?.find((o) => o.value === val)?.label || val;
                                } else if (Array.isArray(val)) {
                                  display = val.join(", ");
                                } else {
                                  display = String(val);
                                }
                                return (
                                  <span key={f} className="text-xs text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">
                                    {fieldDef.label}: {display}
                                  </span>
                                );
                              });
                            })()}
                          </div>
                          {/* ─── Session preview (visible sans expansion) ─── */}
                          {(() => {
                            const availSessions = item.sessions.filter((s) => s.status === "available" && (!s.remaining_capacity || s.remaining_capacity > 0));
                            if (availSessions.length === 0) return null;
                            const next = availSessions.slice(0, 3);
                            return (
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                <CalendarDays size={12} className="text-primary shrink-0" />
                                {next.map((s) => (
                                  <span key={s.id} className="text-[11px] font-medium text-primary bg-emerald-50 rounded-md px-1.5 py-0.5 whitespace-nowrap">
                                    {new Date(s.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                                    {s.start_time ? ` ${s.start_time}` : ""}
                                  </span>
                                ))}
                                {availSessions.length > 3 && (
                                  <span className="text-[11px] text-slate-400">+{availSessions.length - 3}</span>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {item.prices.find((p) => p.is_default) && (
                            <span className="text-primary font-bold">
                              {Number(item.prices.find((p) => p.is_default)!.price).toLocaleString()} TND
                            </span>
                          )}
                          {expandedItem === item.id ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                        </div>
                      </button>

                      {expandedItem === item.id && (
                        <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
                          {item.description && (
                            <p className="text-sm text-slate-500">{item.description}</p>
                          )}

                          {item.details_json && Object.keys(item.details_json).length > 0 && (
                            <OfferItemDetails
                              detailsJson={item.details_json}
                              schemaKey={`${offer.offer_type}_${item.item_type}`}
                            />
                          )}

                          {/* Capacité globale (depuis OfferItemCapacity) */}
                          {item.capacity?.[0] && (
                            <div className="bg-emerald-50 rounded-lg px-3 py-2 flex items-center justify-between text-sm">
                              <span className="text-emerald-700 flex items-center gap-1.5">
                                <Hash size={14} /> Capacité ({item.capacity[0].capacity_type})
                              </span>
                              <span className="font-semibold text-primary">
                                {item.capacity[0].total_quantity} place{item.capacity[0].total_quantity > 1 ? "s" : ""}
                                {item.capacity[0].remaining_quantity != null && (
                                  <span className="text-xs text-slate-400 ml-1">({item.capacity[0].remaining_quantity} restante{item.capacity[0].remaining_quantity > 1 ? "s" : ""})</span>
                                )}
                              </span>
                            </div>
                          )}

                          {/* Délais */}
                          {(item.booking_deadline_days !== null || item.cancellation_deadline_days !== null) && (
                            <div className="bg-amber-50 rounded-lg px-3 py-2 text-sm space-y-1">
                              {item.booking_deadline_days !== null && (
                                <div className="flex items-center gap-1.5 text-amber-700">
                                  <Timer size={14} />
                                  <span>Réservation {item.booking_deadline_days} jour{item.booking_deadline_days > 1 ? "s" : ""} avant</span>
                                </div>
                              )}
                              {item.cancellation_deadline_days !== null && (
                                <div className="flex items-center gap-1.5 text-amber-700">
                                  <AlertTriangle size={14} />
                                  <span>Annulation gratuite {item.cancellation_deadline_days} jour{item.cancellation_deadline_days > 1 ? "s" : ""} avant</span>
                                </div>
                              )}
                            </div>
                          )}

                          {item.prices.length > 0 && (
                            <div>
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tarifs</span>
                              <div className="mt-1 space-y-1">
                                {item.prices.map((p) => (
                                  <div key={p.id} className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-1.5">
                                    <span className="text-slate-600">{p.label}</span>
                                    <span className="font-semibold text-primary">
                                      {Number(p.price).toLocaleString()} {p.currency}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {item.sessions.length > 0 && (
                            <div>
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Toutes les sessions ({item.sessions.filter((s) => s.status === "available").length})
                              </span>
                              <div className="mt-1 space-y-1 max-h-60 overflow-y-auto">
                                {item.sessions
                                  .filter((s) => s.status === "available" && (!s.remaining_capacity || s.remaining_capacity > 0))
                                  .map((session) => (
                                    <div key={session.id} className="flex items-center justify-between text-sm bg-blue-50 rounded-lg px-3 py-1.5">
                                      <span className="text-slate-600">
                                        {new Date(session.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                                        {" — "}{session.start_time} à {session.end_time}
                                      </span>
                                      <span className="text-xs text-slate-400">
                                        {session.remaining_capacity !== null ? `${session.remaining_capacity} places` : ""}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Collaborations ─────────────────────────────────── */}
            {(isAuthor || user?.role === "guide") && collaborations.length > 0 && (
              <div className="mt-6">
                {actionError && (
                  <div className="flex items-start gap-3 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl mb-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{actionError}</span>
                    <button onClick={() => setActionError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
                  </div>
                )}
                <h2 className="text-lg font-bold text-slate-800 mb-3">Collaborateurs</h2>
                <div className="space-y-3">
                  {collaborations.map((c) => (
                    <CollaborationCard
                      key={c.id}
                      collaboration={c}
                      role={user?.role === "provider" ? "provider" : "guide"}
                      onAction={(action) => {
                        setActionError(null);
                        if (action === "accept") {
                          apiFetch(`/collaborations/${c.id}/respond`, {
                            method: "PATCH",
                            body: JSON.stringify({ accept: true }),
                          }).then(() => {
                            setCollaborations((prev) =>
                              prev.map((x) => x.id === c.id ? { ...x, status: "accepted" } : x)
                            );
                          }).catch((e) => setActionError(e.message || "Erreur lors de l'acceptation"));
                        } else if (action === "decline") {
                          setDeclineCollab(c.id);
                        } else if (action === "contribute") {
                          setShowWizard(c.id);
                        } else if (action === "cancel") {
                          if (!confirm("Voulez-vous vraiment annuler cette collaboration ?")) return;
                          apiFetch(`/collaborations/${c.id}`, { method: "DELETE" }).then(() => {
                            setCollaborations((prev) => prev.filter((x) => x.id !== c.id));
                          }).catch((e) => setActionError(e.message || "Erreur lors de l'annulation"));
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ─── Publication panel (provider with requires_guide) ──── */}
            {isAuthor && (offer.requires_guide_override === true || (offer.requires_guide_override === null && offer.category?.requires_guide === true)) && collabStatus && (
              <div className="mt-6 bg-white border border-slate-100 rounded-2xl p-5">
                <h2 className="text-lg font-bold text-slate-800 mb-3">Publication</h2>

                {/* Status summary */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-extrabold text-slate-800">{collabStatus.total}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-extrabold text-emerald-700">{collabStatus.completed}</p>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase">Complétées</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-extrabold text-amber-700">{collabStatus.pending}</p>
                    <p className="text-[10px] font-bold text-amber-400 uppercase">En attente</p>
                  </div>
                </div>

                {/* Guide contributions */}
                {collabStatus.contributions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Contributions des guides
                    </p>
                    <div className="space-y-2">
                      {collabStatus.contributions.map((c: any, i: number) => {
                        const appliedValue =
                          c.applied_price != null ? String(c.applied_price) : "";
                        const appliedRaw = appliedPriceEdits[c.collab_id] ?? appliedValue;
                        const dirty = appliedRaw !== appliedValue;
                        return (
                          <div
                            key={c.collab_id ?? i}
                            className="bg-emerald-50 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 flex items-center gap-2 flex-wrap">
                                {c.guide_name}
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-white text-slate-500 border border-slate-200">
                                  {c.status === "completed"
                                    ? "Contribution validée"
                                    : c.status === "accepted"
                                      ? "Accepté"
                                      : "En attente"}
                                </span>
                              </p>
                              <p className="text-xs text-slate-500">{SECTION_LABELS[c.section] || c.section}</p>
                              {c.price != null && (
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  Prix proposé par le guide : {Number(c.price).toLocaleString()} {c.currency}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
                                Prix appliqué
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={appliedRaw}
                                  onChange={(e) =>
                                    setAppliedPriceEdits((prev) => ({
                                      ...prev,
                                      [c.collab_id]: e.target.value,
                                    }))
                                  }
                                  onBlur={() => {
                                    if (dirty) handleSaveAppliedPrice(c.collab_id);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                                  }}
                                  className="w-24 px-2 py-1.5 pr-6 rounded-lg border border-emerald-200 text-sm font-bold text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                                  {c.currency}
                                </span>
                              </div>
                              {savingAppliedPrice === c.collab_id && (
                                <Loader2 size={16} className="animate-spin text-emerald-500" />
                              )}
                              {dirty && savingAppliedPrice !== c.collab_id && (
                                <button
                                  onClick={() => handleSaveAppliedPrice(c.collab_id)}
                                  className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                  <Check size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-slate-400 mt-2 italic">
                      Prix de l&apos;offre = tarif de base + prix appliqué des guides. Modifiez le prix
                      appliqué d&apos;un guide : le total est recalculé automatiquement.
                    </p>
                  </div>
                )}

                {/* Publish button */}
                {collabStatus.all_done ? (
                  <button
                    onClick={handlePublish}
                    disabled={publishing || offer.publish_ready}
                    className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {publishing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : offer.publish_ready ? (
                      <>
                        <Check size={18} /> Offre publiée avec collaboration
                      </>
                    ) : (
                      <>
                        <Check size={18} /> Confirmer la publication
                      </>
                    )}
                  </button>
                ) : (
                  <div className="bg-amber-50 rounded-xl p-3 text-sm text-amber-700 text-center font-medium">
                    En attente de {collabStatus.pending} collaboration(s) avant publication
                  </div>
                )}
              </div>
            )}

            {isAuthor && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="mt-4 w-full py-2.5 rounded-xl border-2 border-dashed border-emerald-300 text-emerald-600 text-sm font-semibold hover:bg-emerald-50 flex items-center justify-center gap-2"
              >
                <UserPlus size={16} /> Inviter un collaborateur
              </button>
            )}
            {isAuthor && (
              <div className="mt-4">
                <OfferAgendaSync offerId={id} offerTitle={offer?.title || ""} />
              </div>
            )}

            {/* Added to cart notification */}
            {showAddedToCart && (
              <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-xl z-50 flex items-center gap-2">
                <ShoppingCart size={16} /> Ajouté au panier !
              </div>
            )}

            {/* Global Add to cart + Réserver buttons (only for eco_traveler, not author) */}
            {canAddToCart && (
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => {
                    const activeItems = (offer.items ?? []).filter((i) => i.status === "active");
                    activeItems.forEach((i) => addToCart(i.id));
                  }}
                  className="py-3 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white text-base flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingCart size={18} /> Ajouter au panier
                </button>
                {canReserve && (
                  <button
                    onClick={() => router.push(`/reservations/new?offerId=${offer.id}`)}
                    className="py-3 rounded-xl bg-primary text-white font-semibold hover:bg-emerald-600 text-base flex items-center justify-center gap-2"
                  >
                    <Check size={18} /> Réserver
                  </button>
                )}
              </div>
            )}
            {!user && (
              <button
                onClick={() => router.push(`/auth/login?redirect=/offers/${id}`)}
                className="w-full mt-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-emerald-600 text-base flex items-center justify-center gap-2"
              >
                <Check size={18} /> Connectez-vous pour réserver
              </button>
            )}
            {canReserve && !canAddToCart && (
              <button
                onClick={() => router.push(`/reservations/new?offerId=${offer.id}`)}
                className="w-full mt-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-emerald-600 text-base flex items-center justify-center gap-2"
              >
                <Check size={18} /> Réserver cette offre
              </button>
            )}
            {existingBooking && (
              <div className="w-full mt-6 py-3 rounded-xl bg-blue-50 text-blue-700 text-base text-center font-medium">
                Vous avez déjà réservé cette offre
              </div>
            )}
          </div>
        </div>
      </div>
      {showEditWizard && (
        <GuidedOfferWizard
          token={localStorage.getItem("access_token") || ""}
          userRole={user?.role || ""}
          onClose={() => setShowEditWizard(false)}
          onSuccess={(updated) => {
            setOffer(updated);
            setShowEditWizard(false);
          }}
          editOffer={offer}
        />
      )}
      {showInviteModal && (
        <CollaborationInviteModal
          offerId={id}
          offerTitle={offer?.title || ""}
          offerRegion={offer?.region}
          defaultType={user?.role === "guide" ? "provider" : "guide"}
          onClose={() => setShowInviteModal(false)}
          onInvited={() => {
            setShowInviteModal(false);
            apiFetch<any[]>(`/collaborations/offer/${id}`).then(setCollaborations).catch(() => {});
            if (user?.role === "provider") {
              apiFetch<any>(`/collaborations/offer/${id}/status`).then(setCollabStatus).catch(() => {});
            }
          }}
        />
      )}
      {showWizard && (
        <CollaborationWizard
          collaborationId={showWizard}
          initialData={collaborations.find((c) => c.id === showWizard)?.contribution}
          onComplete={() => {
            setShowWizard(null);
            apiFetch<any[]>(`/collaborations/offer/${id}`).then(setCollaborations).catch(() => {});
          }}
          onCancel={() => setShowWizard(null)}
        />
      )}
      {declineCollab && (
        <DeclineModal
          onClose={() => setDeclineCollab(null)}
          onDecline={async (reason) => {
            await apiFetch(`/collaborations/${declineCollab}/respond`, {
              method: "PATCH",
              body: JSON.stringify({ accept: false, decline_reason: reason }),
            });
            setCollaborations((prev) =>
              prev.map((x) => x.id === declineCollab ? { ...x, status: "declined", decline_reason: reason } : x)
            );
            setDeclineCollab(null);
          }}
        />
      )}
    </div>
  );
}
