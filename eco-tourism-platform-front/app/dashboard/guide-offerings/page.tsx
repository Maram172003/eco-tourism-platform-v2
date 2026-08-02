"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { apiFetch } from "@/lib/api";
import { Plus, Trash2, Edit, MapPin, DollarSign, Users, Globe, Compass, X, Check, Loader2, Calendar, Clock, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import AppNavbar from "@/components/nav/AppNavbar";
import Modal from "@/components/ui/Modal";

const MapPicker = dynamic(() => import("@/components/map/MapPicker"), {
  ssr: false,
  loading: () => <div className="h-[200px] rounded-2xl bg-slate-100 animate-pulse" />,
});

interface GuideOffering {
  id: string;
  guide_id: string;
  title: string;
  description: string | null;
  languages: string[] | null;
  price: number;
  pricing_unit: string;
  min_travelers: number | null;
  max_travelers: number | null;
  service_zone_type: string;
  lat: number | null;
  lng: number | null;
  radius_km: number | null;
  zone_governorate: string | null;
  zone_municipality: string | null;
  displacement_allowed: boolean;
  displacement_max_km: number | null;
  displacement_type: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const PRICING_UNITS = [
  { value: "hour", label: "Par heure" },
  { value: "half_day", label: "Par demi-journée" },
  { value: "day", label: "Par jour" },
  { value: "trip", label: "Par voyage" },
  { value: "person", label: "Par personne" },
  { value: "group", label: "Par groupe" },
];

const ZONE_TYPES = [
  { value: "point", label: "📍 Point fixe", desc: "Lieu de rendez-vous précis" },
  { value: "radius", label: "🎯 Rayon", desc: "Zone de service autour d'un point" },
  { value: "governorate", label: "🏛️ Gouvernorat", desc: "Tout un gouvernorat" },
  { value: "municipality", label: "🏘️ Municipalité", desc: "Une municipalité" },
];

function OfferingForm({ token, offering, onClose, onSuccess }: {
  token: string;
  offering?: GuideOffering;
  onClose: () => void;
  onSuccess: (o: GuideOffering) => void;
}) {
  const isEdit = !!offering;
  const [title, setTitle] = useState(offering?.title ?? "");
  const [description, setDescription] = useState(offering?.description ?? "");
  const [price, setPrice] = useState(offering?.price?.toString() ?? "");
  const [pricingUnit, setPricingUnit] = useState(offering?.pricing_unit ?? "hour");
  const [minTravelers, setMinTravelers] = useState(offering?.min_travelers?.toString() ?? "");
  const [maxTravelers, setMaxTravelers] = useState(offering?.max_travelers?.toString() ?? "");
  const [languages, setLanguages] = useState(offering?.languages?.join(", ") ?? "");
  const [zoneType, setZoneType] = useState(offering?.service_zone_type ?? "point");
  const [lat, setLat] = useState<number | null>(offering?.lat ? Number(offering.lat) : null);
  const [lng, setLng] = useState<number | null>(offering?.lng ? Number(offering.lng) : null);
  const [radiusKm, setRadiusKm] = useState(offering?.radius_km?.toString() ?? "10");
  const [governorate, setGovernorate] = useState(offering?.zone_governorate ?? "");
  const [municipality, setMunicipality] = useState(offering?.zone_municipality ?? "");
  const [displacementAllowed, setDisplacementAllowed] = useState(offering?.displacement_allowed ?? false);
  const [displacementMaxKm, setDisplacementMaxKm] = useState(offering?.displacement_max_km?.toString() ?? "");
  const [displacementType, setDisplacementType] = useState(offering?.displacement_type ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Le titre est obligatoire"); return; }
    if (!price || isNaN(Number(price)) || Number(price) < 0) { setError("Prix invalide"); return; }
    setSubmitting(true);
    setError("");
    try {
      const body: Record<string, any> = {
        title: title.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        pricing_unit: pricingUnit,
        min_travelers: minTravelers ? Number(minTravelers) : undefined,
        max_travelers: maxTravelers ? Number(maxTravelers) : undefined,
        languages: languages.trim() ? languages.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        service_zone_type: zoneType,
        lat: lat ?? undefined,
        lng: lng ?? undefined,
        radius_km: zoneType === "radius" ? (radiusKm ? Number(radiusKm) : undefined) : undefined,
        zone_governorate: zoneType === "governorate" ? governorate.trim() || undefined : undefined,
        zone_municipality: zoneType === "municipality" ? municipality.trim() || undefined : undefined,
        displacement_allowed: displacementAllowed,
        displacement_max_km: displacementAllowed && displacementMaxKm ? Number(displacementMaxKm) : undefined,
        displacement_type: displacementAllowed && displacementType ? displacementType : undefined,
      };
      const result = isEdit
        ? await apiFetch<GuideOffering>(`/guide-offerings/${offering.id}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
          })
        : await apiFetch<GuideOffering>("/guide-offerings", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
          });
      onSuccess(result);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">{isEdit ? "Modifier" : "Nouvelle"} prestation de guide</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Titre *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Visite guidée de Carthage" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Décrivez votre prestation..." className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Prix *</label>
              <input type="number" min="0" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="50" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Unité</label>
              <select value={pricingUnit} onChange={(e) => setPricingUnit(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
                {PRICING_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Min voyageurs</label>
              <input type="number" min="1" value={minTravelers} onChange={(e) => setMinTravelers(e.target.value)} placeholder="1" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Max voyageurs</label>
              <input type="number" min="1" value={maxTravelers} onChange={(e) => setMaxTravelers(e.target.value)} placeholder="10" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Langues (séparées par des virgules)</label>
            <input value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="Français, Anglais, Arabe" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
          </div>

          {/* Zone de service */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Zone de service</label>
            <div className="grid grid-cols-2 gap-2">
              {ZONE_TYPES.map((z) => (
                <button key={z.value} type="button" onClick={() => setZoneType(z.value)}
                  className={`text-left px-3 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${zoneType === z.value ? "bg-emerald-50 border-emerald-400 text-emerald-800 shadow-sm" : "border-slate-200 text-slate-600 hover:border-emerald-300"}`}>
                  <span className="block">{z.label}</span>
                  <span className="block text-[10px] font-normal text-slate-400 mt-0.5">{z.desc}</span>
                  {zoneType === z.value && <span className="text-emerald-600 text-[10px] font-bold mt-1 block">✓ Sélectionné</span>}
                </button>
              ))}
            </div>

            {zoneType === "point" && (
              <div>
                <MapPicker lat={lat ?? 36.8065} lng={lng ?? 10.1815} onPick={(la, ln, addr, region) => { setLat(la); setLng(ln); }} />
                {lat !== null && <p className="text-xs text-slate-400 mt-1">{lat.toFixed(5)}, {lng?.toFixed(5)}</p>}
              </div>
            )}

            {zoneType === "radius" && (
              <div className="space-y-2">
                <MapPicker lat={lat ?? 36.8065} lng={lng ?? 10.1815} radiusKm={radiusKm ? Number(radiusKm) : null} onPick={(la, ln, addr, region) => { setLat(la); setLng(ln); }} />
                {lat !== null && <p className="text-xs text-slate-400">{lat.toFixed(5)}, {lng?.toFixed(5)}</p>}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Rayon (km)</label>
                  <input type="number" min="1" step="1" value={radiusKm} onChange={(e) => setRadiusKm(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
              </div>
            )}

            {zoneType === "governorate" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Gouvernorat</label>
                <input value={governorate} onChange={(e) => setGovernorate(e.target.value)} placeholder="Tunis, Sousse, Nabeul..." className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
            )}

            {zoneType === "municipality" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Gouvernorat</label>
                  <input value={governorate} onChange={(e) => setGovernorate(e.target.value)} placeholder="Tunis" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Municipalité</label>
                  <input value={municipality} onChange={(e) => setMunicipality(e.target.value)} placeholder="La Marsa" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
              </div>
            )}
          </div>

          {/* Déplacement */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={displacementAllowed} onChange={(e) => setDisplacementAllowed(e.target.checked)} className="accent-primary" />
              <span className="text-sm font-bold text-slate-700">Je peux me déplacer chez le voyageur</span>
            </label>
            {displacementAllowed && (
              <div className="grid grid-cols-2 gap-3 pl-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Déplacement max (km)</label>
                  <input type="number" min="0" step="1" value={displacementMaxKm} onChange={(e) => setDisplacementMaxKm(e.target.value)} placeholder="50" className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Type de transport</label>
                  <input value={displacementType} onChange={(e) => setDisplacementType(e.target.value)} placeholder="Voiture, Bus..." className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
              </div>
            )}
          </div>

          {error && <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Annuler</button>
            <button type="submit" disabled={submitting} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {isEdit ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface GuideSession {
  id: string;
  guide_offering_id: string;
  date: string;
  start_time: string;
  end_time: string;
  total_capacity: number | null;
  remaining_capacity: number | null;
  price_override: number | null;
  status: string;
  created_at: string;
}

function SessionPanel({ token, offeringId }: { token: string; offeringId: string }) {
  const [sessions, setSessions] = useState<GuideSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<GuideSession[]>(`/guide-offerings/${offeringId}/sessions`);
      setSessions(data ?? []);
    } catch { setSessions([]); }
    finally { setLoading(false); }
  }, [offeringId]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const data = await apiFetch<GuideSession[]>(`/guide-offerings/${offeringId}/availability/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ days_ahead: 90 }),
      });
      setSessions(data ?? []);
    } catch (err: any) { alert(err.message || "Erreur lors de la génération"); }
    finally { setGenerating(false); }
  }

  async function handleDeleteSession(sessionId: string) {
    if (!confirm("Supprimer cette session ?")) return;
    try {
      await apiFetch(`/guide-offerings/${offeringId}/sessions/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch { alert("Erreur lors de la suppression"); }
  }

  const grouped = sessions.reduce<Record<string, GuideSession[]>>((acc, s) => {
    const key = s.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase">Sessions ({sessions.length})</span>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors disabled:opacity-50"
        >
          {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          Générer les sessions
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-slate-400" /></div>
      ) : sessions.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">Aucune session. Créez des règles de disponibilité puis générez les sessions.</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {Object.entries(grouped).map(([date, daySessions]) => (
            <div key={date}>
              <p className="text-[11px] font-bold text-slate-500 mb-1">
                {new Date(date + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
              <div className="space-y-1">
                {daySessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-slate-700 font-medium"><Clock size={11} /> {s.start_time} - {s.end_time}</span>
                      {s.total_capacity != null && <span className="text-slate-400">Capacité: {s.remaining_capacity ?? s.total_capacity}/{s.total_capacity}</span>}
                      {s.price_override != null && <span className="text-amber-600 font-medium">{Number(s.price_override).toLocaleString()} TND</span>}
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        s.status === "available" ? "bg-emerald-100 text-emerald-700" :
                        s.status === "full" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"
                      }`}>{s.status}</span>
                    </div>
                    <button onClick={() => handleDeleteSession(s.id)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GuideOfferingsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [offerings, setOfferings] = useState<GuideOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffering, setEditingOffering] = useState<GuideOffering | undefined>(undefined);
  const [myId, setMyId] = useState<string | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = localStorage.getItem("access_token");
    if (!t) { router.push("/auth/login"); return; }
    setToken(t);
    try {
      const payload = JSON.parse(atob(t.split(".")[1]));
      setMyId(payload.sub ?? payload.id ?? payload.user_id ?? null);
    } catch {}
  }, [router]);

  const loadOfferings = useCallback(() => {
    if (!token) return;
    setLoading(true);
    apiFetch<GuideOffering[]>("/guide-offerings/mine", { headers: { Authorization: `Bearer ${token}` } })
      .then(setOfferings)
      .catch(() => setOfferings([]))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { loadOfferings(); }, [loadOfferings]);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette prestation ?")) return;
    try {
      await apiFetch(`/guide-offerings/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setOfferings((prev) => prev.filter((o) => o.id !== id));
    } catch { alert("Erreur lors de la suppression"); }
  }

  function handleEdit(offering: GuideOffering) {
    setEditingOffering(offering);
    setShowForm(true);
  }

  function handleFormSuccess(offering: GuideOffering) {
    setShowForm(false);
    setEditingOffering(undefined);
    loadOfferings();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <AppNavbar title="Mes prestations de guide" />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-800">Mes prestations</h1>
          <div className="flex items-center gap-2">
            {myId && (
              <button onClick={() => router.push(`/profile/guide/${myId}`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/5 transition-colors">
                <Compass size={16} /> Voir profil public
              </button>
            )}
            <button onClick={() => { setEditingOffering(undefined); setShowForm(true); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-emerald-600 transition-colors">
              <Plus size={16} /> Nouvelle prestation
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-primary" /></div>
        ) : offerings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
            <Compass size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucune prestation pour le moment</p>
            <p className="text-xs text-slate-400 mt-1">Créez votre première prestation de guide</p>
          </div>
        ) : (
          <div className="space-y-3">
            {offerings.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-800">{o.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${o.status === "active" ? "bg-emerald-100 text-emerald-700" : o.status === "rejected" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                          {o.status === "active" ? "Active" : o.status === "rejected" ? "Refusée" : "En attente"}
                        </span>
                      </div>
                      {o.description && <p className="text-sm text-slate-500 mb-3 line-clamp-2">{o.description}</p>}
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><DollarSign size={12} /> {Number(o.price).toLocaleString()} TND/{o.pricing_unit}</span>
                        {o.min_travelers && <span className="flex items-center gap-1"><Users size={12} /> {o.min_travelers}-{o.max_travelers ?? "∞"} pers.</span>}
                        {o.languages && o.languages.length > 0 && <span className="flex items-center gap-1"><Globe size={12} /> {o.languages.join(", ")}</span>}
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {o.service_zone_type === "point" && "Point fixe"}
                          {o.service_zone_type === "radius" && `Rayon ${o.radius_km ?? "?"} km`}
                          {o.service_zone_type === "governorate" && `Gouvernorat ${o.zone_governorate ?? ""}`}
                          {o.service_zone_type === "municipality" && `${o.zone_municipality ?? ""}, ${o.zone_governorate ?? ""}`}
                        </span>
                        {o.displacement_allowed && <span className="text-emerald-600">Déplacement possible ({o.displacement_max_km ?? "?"} km)</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setExpandedSessions((prev) => { const next = new Set(prev); if (next.has(o.id)) next.delete(o.id); else next.add(o.id); return next; })}
                        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition-colors">
                        <Calendar size={14} />
                      </button>
                      <button onClick={() => handleEdit(o)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(o.id)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                {expandedSessions.has(o.id) && (
                  <div className="px-5 pb-5">
                    <SessionPanel token={token!} offeringId={o.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <OfferingForm
          token={token!}
          offering={editingOffering}
          onClose={() => { setShowForm(false); setEditingOffering(undefined); }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
