"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft, Leaf, Calendar, Plus, Trash2, MapPin, Clock,
  Search, X, Loader2, Check, AlertCircle, Tag, Share2, Edit, ChevronRight,
} from "lucide-react";
import AppNavbar from "@/components/nav/AppNavbar";
import BackToDashboard from "@/components/nav/BackToDashboard";

const TripMap = dynamic(() => import("@/components/map/TripMap"), { ssr: false });
const MapPicker = dynamic(() => import("@/components/map/MapPicker"), { ssr: false });

interface TripPlan {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string;
  items: TripPlanItem[];
}

interface TripPlanItem {
  id: string;
  day_number: number | null;
  sort_order: number;
  notes: string | null;
  created_at: string;
  offerItem: OfferItem | null;
  circuit: CircuitBrief | null;
}

interface CircuitBrief {
  id: string;
  title: string;
  region: string | null;
  lat: number | null;
  lng: number | null;
  base_price: number | null;
  currency: string;
  duration_days: number | null;
  max_participants: number | null;
  description: string | null;
}

interface OfferItem {
  id: string;
  name: string;
  description: string | null;
  item_type: string | null;
  details_json: Record<string, any> | null;
  status: string;
  prices: OfferItemPrice[];
  offer: OfferBrief | null;
}

interface OfferItemPrice {
  id: string;
  label: string;
  price: number;
  currency: string;
  pricing_unit?: string;
  is_default: boolean;
}

interface OfferBrief {
  id: string;
  title: string;
  region: string | null;
  images: string[] | null;
  latitude: number | null;
  longitude: number | null;
}

interface OfferListItem {
  id: string;
  title: string;
  region: string | null;
  offer_type: string | null;
  images: string[] | null;
}

interface OfferFull extends OfferListItem {
  items: OfferItemFull[];
}

interface OfferItemFull {
  id: string;
  name: string;
  description: string | null;
  item_type: string | null;
  details_json: Record<string, any> | null;
  status: string;
  prices: OfferItemPrice[];
}

interface Participant {
  full_name: string;
  age: number | null;
  document_type: string;
  document_number: string;
  is_group_leader: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  planning: "En planification",
  confirmed: "Confirmé",
  completed: "Terminé",
  cancelled: "Annulé",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  planning: "bg-blue-100 text-blue-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function TripPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showBook, setShowBook] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);

  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editItemDay, setEditItemDay] = useState("");
  const [editItemNotes, setEditItemNotes] = useState("");

  const loadPlan = useCallback(() => {
    setLoading(true);
    apiFetch<TripPlan>(`/trip-plans/${id}`)
      .then((data) => { setPlan(data); setEditTitle(data.title); })
      .catch(() => router.push("/trip-plans"))
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) { router.push("/auth/login"); return; }
    loadPlan();
  }, [loadPlan, router]);

  const handleSaveTitle = async () => {
    if (!editTitle.trim() || !plan) return;
    setSavingTitle(true);
    try {
      const updated = await apiFetch<TripPlan>(`/trip-plans/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: editTitle.trim() }),
      });
      setPlan(updated);
      setEditingTitle(false);
    } catch (e: any) { alert(e.message); }
    setSavingTitle(false);
  };

  const handleSaveItem = async (itemId: string) => {
    try {
      await apiFetch(`/trip-plans/${id}/items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify({
          day_number: editItemDay ? parseInt(editItemDay) : null,
          notes: editItemNotes.trim() || null,
        }),
      });
      setEditingItem(null);
      loadPlan();
    } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 pb-12">
      <AppNavbar title="Trip Plan" />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <BackToDashboard />
          <button
            onClick={() => router.push("/trip-plans")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft size={16} /> Mes plans
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 animate-pulse space-y-3">
            <div className="h-8 bg-slate-100 rounded w-1/2" />
            <div className="h-4 bg-slate-100 rounded w-3/4" />
          </div>
        ) : !plan ? (
          <div className="text-center py-20 text-slate-400">
            <Leaf size={40} className="mx-auto mb-2 opacity-30" />
            Plan introuvable
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {editingTitle ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 text-xl font-bold border-b-2 border-emerald-300 bg-transparent focus:outline-none py-0.5"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") handleSaveTitle(); if (e.key === "Escape") setEditingTitle(false); }}
                      />
                      <button onClick={handleSaveTitle} disabled={savingTitle} className="text-primary hover:text-emerald-700">
                        {savingTitle ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
                      </button>
                      <button onClick={() => setEditingTitle(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                    </div>
                  ) : (
                    <h1
                      className="text-2xl font-bold text-slate-800 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => setEditingTitle(true)}
                      title="Cliquer pour modifier"
                    >
                      {plan.title}
                    </h1>
                  )}
                  {plan.description && <p className="text-slate-500 mt-1">{plan.description}</p>}
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-400">
                    {plan.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(plan.start_date).toLocaleDateString("fr-FR")}
                        {plan.end_date && ` — ${new Date(plan.end_date).toLocaleDateString("fr-FR")}`}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[plan.status] ?? "bg-slate-100 text-slate-500"}`}>
                      {STATUS_LABELS[plan.status] ?? plan.status}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag size={14} />
                      {plan.items?.length ?? 0} élément{(plan.items?.length ?? 0) !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowBook(true)}
                    disabled={!plan.items?.length}
                    className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <Check size={16} /> Réserver
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/trip-plans/${plan.id}`;
                      const text = `Découvrez mon plan de voyage: ${plan.title} ${url}`;
                      router.push(`/messagerie?share=${encodeURIComponent(text)}`);
                    }}
                    className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-primary hover:border-emerald-200 transition-colors"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>

              {/* Budget summary */}
              {plan.items && plan.items.length > 0 && (() => {
                let totalBudget = 0;
                for (const item of plan.items) {
                  if (item.offerItem?.prices?.length) {
                    const price = item.offerItem.prices.find((p) => p.is_default)?.price ?? item.offerItem.prices[0]?.price;
                    if (price) totalBudget += Number(price);
                  } else if (item.circuit?.base_price) {
                    totalBudget += Number(item.circuit.base_price);
                  }
                }
                if (totalBudget > 0) {
                  return (
                    <div className="mt-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Budget estimé</p>
                          <p className="text-2xl font-black text-emerald-700">{totalBudget.toLocaleString()} TND</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-emerald-500">{plan.items.length} activité{plan.items.length > 1 ? "s" : ""}</p>
                          <p className="text-xs text-emerald-400">~{Math.round(totalBudget / (plan.items.length || 1))} TND/activité</p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Timeline grouped by day */}
              {plan.items && plan.items.length > 1 && (() => {
                const sorted = [...plan.items].sort((a, b) => (a.day_number ?? 999) - (b.day_number ?? 999) || a.sort_order - b.sort_order);
                const grouped: Record<number, typeof sorted> = {};
                const unassigned: typeof sorted = [];
                for (const item of sorted) {
                  if (item.day_number) {
                    if (!grouped[item.day_number]) grouped[item.day_number] = [];
                    grouped[item.day_number].push(item);
                  } else {
                    unassigned.push(item);
                  }
                }
                const days = Object.keys(grouped).map(Number).sort((a, b) => a - b);
                const totalDays = days.length + (unassigned.length > 0 ? 1 : 0);

                return (
                  <div className="mt-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Itinéraire jour par jour</h3>
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
                      <div className="space-y-4">
                        {days.map((dayNum) => (
                          <div key={dayNum}>
                            <div className="flex items-center gap-3 relative mb-2">
                              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold z-10 shrink-0">
                                {dayNum}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-700">Jour {dayNum}</h4>
                                <p className="text-[10px] text-slate-400">
                                  {grouped[dayNum].length} activité{grouped[dayNum].length > 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                            <div className="ml-[18px] space-y-2 border-l-2 border-dashed border-slate-200 pl-5 mb-3">
                              {grouped[dayNum].map((item) => (
                                <div key={item.id} className="bg-white rounded-xl border border-slate-100 p-3 -ml-5 relative">
                                  <div className="absolute -left-[9px] top-3 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white" />
                                  <p className="text-sm font-semibold text-slate-800">
                                    {item.offerItem?.name ?? item.circuit?.title ?? "Activité"}
                                  </p>
                                  {item.offerItem?.offer && (
                                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                      <MapPin size={10} />
                                      {item.offerItem.offer.title}
                                      {item.offerItem.offer.region && ` — ${item.offerItem.offer.region}`}
                                    </p>
                                  )}
                                  {item.circuit && (
                                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                      <MapPin size={10} />
                                      {item.circuit.title}
                                      {item.circuit.region && ` — ${item.circuit.region}`}
                                    </p>
                                  )}
                                  {item.notes && <p className="text-xs text-slate-400 mt-0.5 italic">{item.notes}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        {unassigned.length > 0 && (
                          <div>
                            <div className="flex items-center gap-3 relative mb-2">
                              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold z-10 shrink-0">
                                ?
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-500">Non assigné</h4>
                                <p className="text-[10px] text-slate-400">
                                  {unassigned.length} activité{unassigned.length > 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                            <div className="ml-[18px] space-y-2 border-l-2 border-dashed border-slate-200 pl-5">
                              {unassigned.map((item) => (
                                <div key={item.id} className="bg-white rounded-xl border border-slate-100 p-3 -ml-5 relative">
                                  <div className="absolute -left-[9px] top-3 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white" />
                                  <p className="text-sm font-semibold text-slate-800">
                                    {item.offerItem?.name ?? item.circuit?.title ?? "Activité"}
                                  </p>
                                  {item.notes && <p className="text-xs text-slate-400 mt-0.5 italic">{item.notes}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-800 text-lg">Activités</h2>
                <button
                  onClick={() => setShowAddItem(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium text-sm hover:bg-slate-200 transition-colors"
                >
                  <Plus size={16} /> Ajouter
                </button>
              </div>

              {!plan.items?.length ? (
                <div className="text-center py-12 text-slate-400">
                  <MapPin size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="font-medium">Aucune activité dans ce plan</p>
                  <p className="text-sm mt-1">Ajoutez des offres depuis le catalogue pour commencer</p>
                  <button
                    onClick={() => setShowAddItem(true)}
                    className="mt-3 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-emerald-600"
                  >
                    Ajouter une activité
                  </button>
                </div>
              ) : (
                <>
                  <TripMap
                    className="mb-4"
                    items={[
                      ...plan.items
                        .filter((item) => item.offerItem?.offer?.latitude && item.offerItem?.offer?.longitude)
                        .map((item) => ({
                          label: item.offerItem?.name ?? item.offerItem?.offer?.title ?? "",
                          lat: Number(item.offerItem!.offer!.latitude),
                          lng: Number(item.offerItem!.offer!.longitude),
                          day_number: item.day_number,
                          type: "offer" as const,
                        })),
                      ...plan.items
                        .filter((item) => item.circuit?.lat && item.circuit?.lng)
                        .map((item) => ({
                          label: item.circuit!.title,
                          lat: Number(item.circuit!.lat),
                          lng: Number(item.circuit!.lng),
                          day_number: item.day_number,
                          type: "circuit" as const,
                        })),
                    ]}
                  />
                  <div className="space-y-3">
                  {plan.items.map((item) => (
                    <div key={item.id} className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-semibold text-slate-800">
                              {item.offerItem?.name ?? item.circuit?.title ?? item.notes ?? "Élément supprimé"}
                            </h4>
                            {item.offerItem?.item_type && (
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                                {item.offerItem.item_type}
                              </span>
                            )}
                            {item.circuit && (
                              <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                                Circuit {item.circuit.duration_days ? `(${item.circuit.duration_days}j)` : ""}
                              </span>
                            )}
                            {item.day_number && (
                              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                                Jour {item.day_number}
                              </span>
                            )}
                          </div>
                          {item.offerItem?.offer && (
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                              <MapPin size={10} />
                              {item.offerItem.offer.title}
                              {item.offerItem.offer.region && ` — ${item.offerItem.offer.region}`}
                            </p>
                          )}
                          {item.circuit && (
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                              <MapPin size={10} />
                              {item.circuit.title}
                              {item.circuit.region && ` — ${item.circuit.region}`}
                            </p>
                          )}
                            {(item.offerItem?.details_json?.room_sub_type || item.offerItem?.details_json?.bed_count || item.offerItem?.details_json?.tent_capacity) && (
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              {item.offerItem.details_json?.room_sub_type && (
                                <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full">
                                  {item.offerItem.details_json.room_sub_type === 'shared' ? '🛏 Dortoir' :
                                   item.offerItem.details_json.room_sub_type === 'private' ? '🏠 Privé' :
                                   item.offerItem.details_json.room_sub_type === 'double' ? '👫 Double' :
                                   item.offerItem.details_json.room_sub_type === 'family' ? '👨‍👩‍👧‍👦 Famille' :
                                   item.offerItem.details_json.room_sub_type === 'suite' ? '👑 Suite' :
                                   item.offerItem.details_json.room_sub_type === 'studio' ? '🏢 Studio' :
                                   item.offerItem.details_json.room_sub_type}
                                </span>
                              )}
                              {item.offerItem.details_json?.bed_count != null && (
                                <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">
                                  🛏 {item.offerItem.details_json.bed_count} lit{item.offerItem.details_json.bed_count > 1 ? 's' : ''}
                                </span>
                              )}
                              {item.offerItem.details_json?.tent_capacity != null && (
                                <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
                                  ⛺ {item.offerItem.details_json.tent_capacity} pers.
                                </span>
                              )}
                            </div>
                          )}
                          {item.notes && (item.offerItem?.name || item.circuit?.title) && (
                            <p className="text-xs text-slate-500 mt-1 italic">{item.notes}</p>
                          )}
                          {item.offerItem?.prices && item.offerItem.prices.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.offerItem.prices.filter((p) => p.is_default || item.offerItem!.prices.length === 1).map((p) => (
                                <span key={p.id} className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                                  {Number(p.price).toLocaleString()} {p.currency}
                                </span>
                              ))}
                            </div>
                          )}
                          {item.circuit && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.circuit.base_price != null && (
                                <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full">
                                  {Number(item.circuit.base_price).toLocaleString()} {item.circuit.currency}
                                </span>
                              )}
                              {item.circuit.duration_days && (
                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                  {item.circuit.duration_days} jour{item.circuit.duration_days > 1 ? "s" : ""}
                                </span>
                              )}
                              {item.circuit.max_participants && (
                                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                                  Max {item.circuit.max_participants} pers.
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => { setEditingItem(item.id); setEditItemDay(String(item.day_number ?? "")); setEditItemNotes(item.notes ?? ""); }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm("Retirer cette activité du plan ?")) return;
                              try {
                                await apiFetch(`/trip-plans/${id}/items/${item.id}`, { method: "DELETE" });
                                loadPlan();
                              } catch (e: any) { alert(e.message); }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {showAddItem && plan && <AddItemModal planId={id} plan={plan} onClose={() => setShowAddItem(false)} onAdded={loadPlan} />}
      {showBook && plan && <BookModal planId={id} plan={plan} onClose={() => setShowBook(false)} onBooked={() => { loadPlan(); setShowBook(false); }} />}

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg p-6 mx-4 max-w-sm w-full">
            <h3 className="font-bold text-slate-800 mb-4">Modifier l&apos;activité</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Numéro du jour</label>
                <input
                  type="number"
                  min={1}
                  value={editItemDay}
                  onChange={(e) => setEditItemDay(e.target.value)}
                  placeholder="Ex: 1"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
                <textarea
                  value={editItemNotes}
                  onChange={(e) => setEditItemNotes(e.target.value)}
                  placeholder="Notes optionnelles..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setEditingItem(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600">Annuler</button>
              <button onClick={() => handleSaveItem(editingItem)} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-emerald-600">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg p-6 mx-4 max-w-sm w-full">
            <h3 className="font-bold text-slate-800 mb-2">Supprimer le plan ?</h3>
            <p className="text-sm text-slate-500 mb-4">Cette action est irréversible.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600">Annuler</button>
              <button
                onClick={async () => {
                  try { await apiFetch(`/trip-plans/${id}`, { method: "DELETE" }); router.push("/trip-plans"); }
                  catch (e: any) { alert(e.message); }
                }}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddItemModal({ planId, plan, onClose, onAdded }: { planId: string; plan: TripPlan; onClose: () => void; onAdded: () => void }) {
  const [tab, setTab] = useState<"offers" | "guides">("offers");
  const [offers, setOffers] = useState<OfferListItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedOffer, setSelectedOffer] = useState<OfferFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [dayNumber, setDayNumber] = useState(() => {
    const existingDays = (plan.items ?? [])
      .map((i) => i.day_number)
      .filter((d): d is number => d != null);
    return existingDays.length > 0 ? String(Math.max(...existingDays) + 1) : "1";
  });
  const [notes, setNotes] = useState("");
  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLng, setMapLng] = useState<number | null>(null);

  // Guide search state
  const [guides, setGuides] = useState<any[]>([]);
  const [searchingGuides, setSearchingGuides] = useState(false);
  const [guideSearchQuery, setGuideSearchQuery] = useState("");
  const [selectedGuide, setSelectedGuide] = useState<any | null>(null);
  const [addingGuideOffering, setAddingGuideOffering] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<OfferListItem[]>("/offers")
      .then(setOffers)
      .finally(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? offers.filter((o) => o.title.toLowerCase().includes(search.toLowerCase()) || (o.region && o.region.toLowerCase().includes(search.toLowerCase())))
    : offers;

  const handleSelectOffer = async (offerId: string) => {
    try {
      const full = await apiFetch<OfferFull>(`/offers/${offerId}`);
      setSelectedOffer(full);
    } catch { /* ignore */ }
  };

  const handleAddItem = async (offerItemId: string) => {
    setAdding(offerItemId);
    try {
      await apiFetch(`/trip-plans/${planId}/items`, {
        method: "POST",
        body: JSON.stringify({
          offer_item_id: offerItemId,
          day_number: dayNumber ? parseInt(dayNumber) : undefined,
          lat: mapLat ?? undefined,
          lng: mapLng ?? undefined,
          notes: notes.trim() || undefined,
        }),
      });
      onAdded();
      onClose();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setAdding(null);
    }
  };

  async function handleGuideSearch() {
    const q = guideSearchQuery.trim();
    if (!q) return;
    setSearchingGuides(true);
    try {
      const data = await apiFetch<any[]>(`/guide/search?q=${encodeURIComponent(q)}`);
      setGuides(data ?? []);
    } catch { setGuides([]); }
    setSearchingGuides(false);
    setSelectedGuide(null);
  }

  async function handleAddGuideOffering(offeringId: string) {
    setAddingGuideOffering(offeringId);
    try {
      await apiFetch(`/trip-plans/${planId}/items`, {
        method: "POST",
        body: JSON.stringify({
          guide_offering_id: offeringId,
          day_number: dayNumber ? parseInt(dayNumber) : undefined,
          notes: notes.trim() || undefined,
        }),
      });
      onAdded();
      onClose();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setAddingGuideOffering(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 bg-black/30 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-lg mx-4 w-full max-w-lg mb-12">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Ajouter une activité</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>

        <div className="p-4">
          {/* Tabs */}
          {!selectedOffer && !selectedGuide && (
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-4">
              <button onClick={() => setTab("offers")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${tab === "offers" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                🏪 Offres
              </button>
              <button onClick={() => setTab("guides")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${tab === "guides" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                🧑‍🏫 Guides
              </button>
            </div>
          )}

          {selectedOffer ? (
            <div>
              <button onClick={() => setSelectedOffer(null)} className="text-sm text-primary hover:underline mb-3 flex items-center gap-1">
                <ArrowLeft size={14} /> Retour aux offres
              </button>
              <h4 className="font-bold text-slate-800 mb-1">{selectedOffer.title}</h4>
              <p className="text-xs text-slate-400 mb-3">{selectedOffer.region}</p>

              <div className="mt-3 grid grid-cols-2 gap-2 mb-3">
                <input type="number" placeholder="Jour (optionnel)" value={dayNumber} onChange={(e) => setDayNumber(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                <input type="text" placeholder="Note (optionnelle)" value={notes} onChange={(e) => setNotes(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              </div>

              <div className="mb-3">
                <label className="text-xs font-medium text-slate-500 mb-1 block">Localisation (optionnel)</label>
                <div className="h-48 rounded-xl overflow-hidden">
                  <MapPicker
                    lat={mapLat ?? 36.8065}
                    lng={mapLng ?? 10.1815}
                    onPick={(lat, lng) => { setMapLat(lat); setMapLng(lng); }}
                  />
                </div>
                {mapLat && mapLng && (
                  <p className="text-[10px] text-slate-400 mt-1">📍 {mapLat.toFixed(5)}, {mapLng.toFixed(5)}</p>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedOffer.items
                  .filter((i) => i.status === "active")
                  .map((item) => (
                    <div key={item.id} className="border border-slate-100 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-800">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{item.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.item_type && <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{item.item_type}</span>}
                            {item.details_json?.room_sub_type && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">{item.details_json.room_sub_type}</span>}
                            {item.details_json?.bed_count != null && <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">🛏 {item.details_json.bed_count} lit(s)</span>}
                            {item.details_json?.tent_capacity != null && <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">⛺ {item.details_json.tent_capacity} pers.</span>}
                          </div>
                          {item.prices.length > 0 && (
                            <p className="text-xs text-primary font-semibold mt-1">
                              {Number(item.prices.find((p) => p.is_default)?.price ?? item.prices[0].price).toLocaleString()} {item.prices[0].currency}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddItem(item.id)}
                          disabled={adding === item.id}
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-1"
                        >
                          {adding === item.id ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                          Ajouter
                        </button>
                      </div>
                    </div>
                  ))}
                {selectedOffer.items.filter((i) => i.status === "active").length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-slate-400 mb-2">Aucun élément actif dans cette offre</p>
                    <p className="text-xs text-slate-300">Le prestataire n&apos;a pas encore ajouté d&apos;activités à cette offre.</p>
                  </div>
                )}
              </div>
            </div>
          ) : selectedGuide ? (
            <div>
              <button onClick={() => setSelectedGuide(null)} className="text-sm text-primary hover:underline mb-3 flex items-center gap-1">
                <ArrowLeft size={14} /> Retour aux guides
              </button>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-lg">
                  {selectedGuide.photo ? <img src={selectedGuide.photo} alt="" className="w-full h-full rounded-full object-cover" /> : "🧑‍🏫"}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{selectedGuide.full_name}</h4>
                  {selectedGuide.zone && <p className="text-xs text-slate-400">📍 {selectedGuide.zone}</p>}
                  {selectedGuide.sustainability_score != null && (
                    <p className="text-xs text-emerald-600">🌿 Score: {selectedGuide.sustainability_score}</p>
                  )}
                </div>
              </div>
              {selectedGuide.bio && <p className="text-xs text-slate-500 mb-3">{selectedGuide.bio}</p>}
              <div className="flex gap-2 mb-4">
                <a href={`/profile/guide/${selectedGuide.user_id}`}
                  className="flex-1 text-center text-xs font-bold py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
                  Voir profil public
                </a>
                <button onClick={() => {
                  const text = `Bonjour ${selectedGuide.full_name}, je suis intéressé par vos services de guide pour mon voyage.`;
                  window.location.href = `/messagerie?share=${encodeURIComponent(text)}&userId=${selectedGuide.user_id}`;
                }}
                  className="flex-1 text-xs font-bold py-2 rounded-xl bg-primary text-white hover:bg-emerald-600">
                  Contacter
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <input type="number" placeholder="Jour (optionnel)" value={dayNumber} onChange={(e) => setDayNumber(e.target.value)} className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                <input type="text" placeholder="Note" value={notes} onChange={(e) => setNotes(e.target.value)} className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              </div>
              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prestations</h5>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(selectedGuide.offerings ?? []).map((o: any) => (
                  <div key={o.id} className="border border-slate-100 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-800">{o.title}</p>
                        {o.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{o.description}</p>}
                        <div className="flex flex-wrap gap-2 mt-2 text-[10px] text-slate-500">
                          <span className="font-bold text-primary">{Number(o.price).toLocaleString()} TND/{o.pricing_unit}</span>
                          {o.service_zone_type === "radius" && o.radius_km && <span>📏 Rayon {o.radius_km} km</span>}
                          {o.service_zone_type === "all_tunisia" && <span>🌍 Toute la Tunisie</span>}
                          {o.service_zone_type === "point" && <span>📍 Point fixe</span>}
                          {o.languages?.length > 0 && <span>🗣️ {o.languages.join(", ")}</span>}
                        </div>
                      </div>
                      <button onClick={() => handleAddGuideOffering(o.id)} disabled={addingGuideOffering === o.id}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 disabled:opacity-50 flex items-center gap-1">
                        {addingGuideOffering === o.id ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                        Ajouter
                      </button>
                    </div>
                  </div>
                ))}
                {(!selectedGuide.offerings || selectedGuide.offerings.length === 0) && (
                  <p className="text-sm text-slate-400 text-center py-4">Aucune prestation disponible</p>
                )}
              </div>
            </div>
          ) : tab === "offers" ? (
            <div>
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher une offre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>

              {loading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />)}
                </div>
              ) : (
                <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                  {filtered.map((offer) => (
                    <button
                      key={offer.id}
                      onClick={() => handleSelectOffer(offer.id)}
                      className="w-full text-left p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors"
                    >
                      <p className="font-medium text-sm text-slate-800">{offer.title}</p>
                      {offer.region && <p className="text-xs text-slate-400">{offer.region}</p>}
                    </button>
                  ))}
                  {filtered.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Aucune offre trouvée</p>}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Rechercher un guide par nom..."
                  value={guideSearchQuery}
                  onChange={(e) => setGuideSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleGuideSearch(); }}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
                <button onClick={handleGuideSearch} disabled={searchingGuides}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-emerald-600 disabled:opacity-50">
                  {searchingGuides ? <Loader2 size={14} className="animate-spin" /> : "Chercher"}
                </button>
              </div>

              {searchingGuides ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />)}
                </div>
              ) : guides.length > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {guides.map((g) => (
                    <button key={g.user_id} onClick={() => setSelectedGuide(g)}
                      className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-sm shrink-0">
                          {g.photo ? <img src={g.photo} alt="" className="w-full h-full rounded-full object-cover" /> : "🧑‍🏫"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-800">{g.full_name}</p>
                          <div className="flex flex-wrap gap-1.5 mt-0.5">
                            {g.zone && <span className="text-[10px] text-slate-400">📍 {g.zone}</span>}
                            {g.sustainability_score != null && (
                              <span className="text-[10px] text-emerald-600">🌿 {g.sustainability_score}</span>
                            )}
                            <span className="text-[10px] text-amber-600">{(g.offerings ?? []).length} prestation(s)</span>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : guideSearchQuery.trim() && !searchingGuides ? (
                <p className="text-sm text-slate-400 text-center py-4">Aucun guide trouvé pour "{guideSearchQuery}"</p>
              ) : (
                <div className="text-center py-8">
                  <span className="text-3xl mb-2 block">🧑‍🏫</span>
                  <p className="text-sm text-slate-400">Cherchez un guide par nom pour voir ses prestations</p>
                  <p className="text-xs text-slate-300 mt-1">Vous pourrez le contacter ou ajouter une note à votre plan</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookModal({ planId, plan, onClose, onBooked }: { planId: string; plan: TripPlan; onClose: () => void; onBooked: () => void }) {
  const parsedParticipantCount = (() => {
    let max = 1;
    for (const item of plan.items ?? []) {
      if (!item.notes) continue;
      const match = item.notes.match(/(\d+)\s*participants?/i);
      if (match) {
        const n = parseInt(match[1], 10);
        if (!isNaN(n) && n > max) max = n;
      }
    }
    return max;
  })();

  const [participants, setParticipants] = useState<Participant[]>(() =>
    Array.from({ length: parsedParticipantCount }, (_, i) => ({
      full_name: "", age: null, document_type: "none", document_number: "", is_group_leader: i === 0,
    }))
  );
  const [specialRequests, setSpecialRequests] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async () => {
    if (!participants[0].full_name.trim()) {
      setError("Veuillez remplir le nom du participant principal.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/trip-plans/${planId}/book`, {
        method: "POST",
        body: JSON.stringify({
          participants: participants.filter((p) => p.full_name.trim()),
          special_requests: specialRequests || undefined,
        }),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const itemCount = plan.items?.length ?? 0;

  const planCurrency = plan.items?.reduce<string | null>((cur, item) => {
    return cur ?? item.circuit?.currency ?? item.offerItem?.prices?.[0]?.currency ?? null;
  }, null) ?? "TND";

  const estimatedTotal = plan.items?.reduce((sum, item) => {
    if (item.circuit?.base_price) {
      return sum + Number(item.circuit.base_price) * participants.length;
    }
    if (item.offerItem?.prices?.length) {
      const defaultPrice = item.offerItem.prices.find(p => p.is_default) ?? item.offerItem.prices[0];
      if (defaultPrice?.price) {
        const unitPrice = Number(defaultPrice.price);
        const pricingUnit = defaultPrice.pricing_unit ?? 'per_person';
        if (pricingUnit === 'per_person' || pricingUnit === 'per_person_per_night') {
          return sum + unitPrice * participants.length;
        }
        return sum + unitPrice;
      }
    }
    if ((item as any).guideOffering?.price) {
      return sum + Number((item as any).guideOffering.price) * participants.length;
    }
    return sum;
  }, 0) ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 bg-black/30 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-lg mx-4 w-full max-w-md mb-12">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Réserver le plan</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>

        <div className="p-4">
          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check size={28} className="text-primary" />
              </div>
              <h4 className="font-bold text-slate-800 mb-1">Réservation effectuée !</h4>
              <p className="text-sm text-slate-500 mb-4">{itemCount} réservation{itemCount !== 1 ? "s" : ""} créée{itemCount !== 1 ? "s" : ""}</p>
              <button onClick={onBooked} className="px-5 py-2 rounded-xl bg-primary text-white font-medium text-sm">Terminé</button>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-4">
                {itemCount} activité{itemCount !== 1 ? "s" : ""} du plan seront réservée{itemCount !== 1 ? "s" : ""} en une fois.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 text-sm text-red-600 flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Participants</label>
                {participants.map((p, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-500">Participant {i + 1}{p.is_group_leader ? " (responsable)" : ""}</span>
                      {i > 0 && <button onClick={() => removeParticipant(i)} className="text-xs text-red-400 hover:text-red-600">Supprimer</button>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Nom complet *" value={p.full_name} onChange={(e) => updateParticipant(i, "full_name", e.target.value)} className="col-span-2 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                      <input type="number" placeholder="Âge" value={p.age ?? ""} onChange={(e) => updateParticipant(i, "age", e.target.value ? parseInt(e.target.value) : null)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                      <select value={p.document_type} onChange={(e) => updateParticipant(i, "document_type", e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300">
                        <option value="none">Aucun document</option>
                        <option value="passport">Passeport</option>
                        <option value="id_card">Carte d&apos;identité</option>
                      </select>
                      {p.document_type !== "none" && (
                        <input type="text" placeholder="N° document" value={p.document_number} onChange={(e) => updateParticipant(i, "document_number", e.target.value)} className="col-span-2 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                      )}
                    </div>
                  </div>
                ))}
                <button onClick={addParticipant} className="text-sm text-primary hover:text-emerald-700 font-medium">+ Ajouter un participant</button>
              </div>

              {estimatedTotal > 0 && (
                <div className="mb-4 bg-slate-50 rounded-xl p-3">
                  <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Récapitulatif des prix</h4>
                  <div className="space-y-1">
                    {plan.items?.map((item) => {
                      let label = "";
                      let price: number | null = null;
                      if (item.circuit?.base_price) {
                        label = item.circuit.title;
                        price = Number(item.circuit.base_price) * participants.length;
                      } else if (item.offerItem?.prices?.length) {
                        const p = item.offerItem.prices.find(p => p.is_default) ?? item.offerItem.prices[0];
                        label = item.offerItem.name;
                        if (p?.price) {
                          const unitPrice = Number(p.price);
                          const pricingUnit = p.pricing_unit ?? 'per_person';
                          if (pricingUnit === 'per_person' || pricingUnit === 'per_person_per_night') {
                            price = unitPrice * participants.length;
                          } else {
                            price = unitPrice;
                          }
                        }
                      } else if ((item as any).guideOffering?.price) {
                        label = (item as any).guideOffering.title;
                        price = Number((item as any).guideOffering.price) * participants.length;
                      }
                      if (!price) return null;
                      return (
                        <div key={item.id} className="flex justify-between text-xs text-slate-500">
                          <span className="truncate mr-2">{label}</span>
                          <span className="font-medium shrink-0">{price.toLocaleString()} {planCurrency}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-800 pt-2 mt-2 border-t border-slate-200">
                    <span>Total estimé</span>
                    <span className="text-primary">{estimatedTotal.toLocaleString()} {planCurrency}</span>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Demandes spéciales</label>
                <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} placeholder="Allergies, préférences..." rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none" />
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Réservation en cours…</>
                ) : (
                  <><Check size={18} /> Réserver le plan</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
