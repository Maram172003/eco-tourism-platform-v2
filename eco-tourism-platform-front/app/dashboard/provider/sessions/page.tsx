"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  ChevronLeft, Plus, Calendar, Clock, Users, Trash2,
  Edit3, CheckCircle, XCircle, AlertCircle, Save, X,
} from "lucide-react";

interface Offer {
  id: string;
  title: string;
  offer_type: string | null;
  fulfillment_mode: string | null;
  capacity: number | null;
}

interface OfferSession {
  id: string;
  offer_id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  capacity: number | null;
  spots_taken: number;
  status: string;
}

const TYPE_ICONS: Record<string, string> = {
  hebergement: "🏕️", activite: "🧗", circuit: "🗺️",
  restauration: "🍽️", artisanat: "🪴", location_materiel: "🎒",
  volontariat: "🌱", bien_etre: "🧘", transport: "🚌",
};

interface SessionFormState {
  date: string;
  start_time: string;
  end_time: string;
  capacity: string;
}

const emptyForm: SessionFormState = { date: "", start_time: "", end_time: "", capacity: "" };

function ProviderSessionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedOfferId = searchParams.get("offerId");

  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [sessions, setSessions] = useState<OfferSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SessionFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Offer[]>("/offers/mine")
      .then((data) => {
        const schedulable = data.filter(
          (o) => o.fulfillment_mode === "scheduled" || o.fulfillment_mode === "recurring"
        );
        setOffers(schedulable);
        if (preselectedOfferId) {
          const found = schedulable.find((o) => o.id === preselectedOfferId);
          if (found) selectOffer(found);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function selectOffer(offer: Offer) {
    setSelectedOffer(offer);
    setLoading(true);
    try {
      const s = await apiFetch<OfferSession[]>(`/offers/${offer.id}/sessions`);
      setSessions(s);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  }

  function openEdit(session: OfferSession) {
    setEditingId(session.id);
    setForm({
      date: session.date.split("T")[0],
      start_time: session.start_time ?? "",
      end_time: session.end_time ?? "",
      capacity: session.capacity !== null ? String(session.capacity) : "",
    });
    setShowForm(true);
    setError("");
  }

  async function handleSave() {
    if (!selectedOffer || !form.date) { setError("La date est obligatoire."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = {
        date: form.date,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        capacity: form.capacity ? Number(form.capacity) : selectedOffer.capacity ?? null,
      };
      if (editingId) {
        const updated = await apiFetch<OfferSession>(`/offers/sessions/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setSessions((prev) => prev.map((s) => s.id === editingId ? updated : s));
      } else {
        const created = await apiFetch<OfferSession>(`/offers/${selectedOffer.id}/sessions`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSessions((prev) => [...prev, created]);
      }
      setShowForm(false);
      setForm(emptyForm);
    } catch (e: any) {
      setError(e.message ?? "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(sessionId: string) {
    if (!confirm("Supprimer cette séance ?")) return;
    try {
      await apiFetch(`/offers/sessions/${sessionId}`, { method: "DELETE" });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (e: any) {
      alert(e.message ?? "Erreur lors de la suppression.");
    }
  }

  const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white";
  const labelCls = "block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5";

  const today = new Date().toISOString().split("T")[0];
  const upcomingSessions = sessions.filter((s) => s.date.split("T")[0] >= today);
  const pastSessions = sessions.filter((s) => s.date.split("T")[0] < today);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.push("/dashboard/provider")}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500">
            <ChevronLeft size={20} />
          </button>
          <h1 className="font-bold text-slate-800 flex-1">Gestion des séances</h1>
          {selectedOffer && (
            <button onClick={openCreate}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600">
              <Plus size={15} /> Ajouter
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">
        {/* Sélection offre */}
        {!selectedOffer ? (
          <div>
            <p className="text-sm text-slate-500 mb-3">
              Gérez les séances de vos offres à créneaux planifiés. Sélectionnez une offre :
            </p>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                <Calendar size={36} className="mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500 font-medium mb-1">Aucune offre à séances</p>
                <p className="text-xs text-slate-400 mb-4">Créez d'abord une offre avec le mode "Séances planifiées" ou "Récurrent".</p>
                <button onClick={() => router.push("/offers/new")}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 flex items-center gap-2 mx-auto">
                  <Plus size={14} /> Nouvelle offre
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {offers.map((o) => (
                  <button key={o.id} onClick={() => selectOffer(o)}
                    className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 hover:border-emerald-300 hover:shadow-md transition-all text-left">
                    <span className="text-3xl">{TYPE_ICONS[o.offer_type ?? ""] ?? "🌿"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 line-clamp-1">{o.title}</p>
                      <p className="text-xs text-emerald-600 font-medium mt-0.5">
                        {o.fulfillment_mode === "scheduled" ? "Séances planifiées" : "Récurrent"}
                        {o.capacity ? ` · ${o.capacity} places/séance` : ""}
                      </p>
                    </div>
                    <ChevronLeft size={16} className="text-slate-300 rotate-180" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Offre sélectionnée header */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <span className="text-3xl">{TYPE_ICONS[selectedOffer.offer_type ?? ""] ?? "🌿"}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 line-clamp-1">{selectedOffer.title}</p>
                <p className="text-xs text-emerald-600">
                  {selectedOffer.capacity ? `${selectedOffer.capacity} places par défaut` : "Capacité non définie"}
                </p>
              </div>
              <button onClick={() => { setSelectedOffer(null); setSessions([]); }}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-100">
                Changer
              </button>
            </div>

            {/* Formulaire ajout/édition */}
            {showForm && (
              <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                  <span>{editingId ? "Modifier la séance" : "Nouvelle séance"}</span>
                  <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={18} />
                  </button>
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="col-span-2">
                    <label className={labelCls}>Date *</label>
                    <input type="date" className={inputCls} value={form.date}
                      min={today} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Heure de début</label>
                    <input type="time" className={inputCls} value={form.start_time}
                      onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Heure de fin</label>
                    <input type="time" className={inputCls} value={form.end_time}
                      onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Capacité (laissez vide pour utiliser celle de l'offre)</label>
                    <input type="number" min={1} className={inputCls} value={form.capacity}
                      placeholder={selectedOffer.capacity ? `Par défaut : ${selectedOffer.capacity}` : "Ex: 10"}
                      onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} />
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl p-3 text-xs mb-3">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
                    Annuler
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2">
                    <Save size={14} /> {saving ? "..." : editingId ? "Enregistrer" : "Créer la séance"}
                  </button>
                </div>
              </div>
            )}

            {/* Sessions à venir */}
            <div>
              <h3 className="font-bold text-slate-700 text-sm mb-2 flex items-center gap-2">
                <Calendar size={14} className="text-emerald-500" /> Séances à venir ({upcomingSessions.length})
              </h3>
              {upcomingSessions.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-slate-400 text-sm mb-3">Aucune séance planifiée</p>
                  <button onClick={openCreate}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 flex items-center gap-2 mx-auto">
                    <Plus size={14} /> Ajouter une séance
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingSessions.map((s) => {
                    const cap = s.capacity ?? selectedOffer.capacity ?? 0;
                    const available = cap - s.spots_taken;
                    const full = available <= 0;
                    return (
                      <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
                        <div className={`w-2 h-12 rounded-full flex-shrink-0 ${full ? "bg-red-400" : "bg-emerald-400"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 text-sm">
                            {new Date(s.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                          </p>
                          {(s.start_time || s.end_time) && (
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Clock size={10} /> {s.start_time}{s.end_time ? ` → ${s.end_time}` : ""}
                            </p>
                          )}
                          <p className={`text-xs font-semibold mt-0.5 flex items-center gap-1 ${full ? "text-red-500" : "text-emerald-600"}`}>
                            <Users size={10} />
                            {s.spots_taken}/{cap} {full ? "· Complet" : `· ${available} disponible${available > 1 ? "s" : ""}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(s)}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
                            <Edit3 size={15} />
                          </button>
                          <button onClick={() => handleDelete(s.id)}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sessions passées */}
            {pastSessions.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-400 text-sm mb-2 flex items-center gap-2">
                  <Clock size={14} /> Séances passées ({pastSessions.length})
                </h3>
                <div className="space-y-2">
                  {pastSessions.map((s) => (
                    <div key={s.id} className="bg-slate-50 rounded-2xl border border-slate-100 p-4 flex items-center gap-3 opacity-60">
                      <div className="w-2 h-10 rounded-full bg-slate-300 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-600 text-sm">
                          {new Date(s.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                        </p>
                        <p className="text-xs text-slate-400">
                          {s.spots_taken} participant{s.spots_taken > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ProviderSessionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>}>
      <ProviderSessionsContent />
    </Suspense>
  );
}
