"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Search, MapPin, Loader2, LayoutGrid, Map, SlidersHorizontal, X, Star, Globe, Clock, ChevronLeft, ChevronRight, ExternalLink, Phone, Mail } from "lucide-react";
import { apiFetch } from "@/lib/api";
import governorates from "@/lib/tunisia-governorates.json";

const TUNISIA_REGIONS = governorates.map((g) => g.name);

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => <div className="h-full bg-slate-100 animate-pulse rounded-2xl" />,
});

const LANGUAGES = [
  "Arabe", "Français", "Anglais", "Allemand", "Italien", "Espagnol", "Russe", "Amazigh",
];

const PRICE_RANGES = [
  { label: "Tous", min: 0, max: Infinity },
  { label: "0–50 TND", min: 0, max: 50 },
  { label: "50–100 TND", min: 50, max: 100 },
  { label: "100–200 TND", min: 100, max: 200 },
  { label: "200–500 TND", min: 200, max: 500 },
  { label: "500+ TND", min: 500, max: Infinity },
];

const SPECIALTIES = [
  "Randonnée", "Trekking", "VTT", "Escalade", "Spéléologie",
  "Observation", "Photographie", "Culture", "Gastronomie", "Artisanat",
  "Yoga", "Méditation", "Astronomie", "Équitation", "Paddle",
];

export default function GuideSearchPage() {
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState("");
  const [priceRangeIdx, setPriceRangeIdx] = useState(0);
  const [language, setLanguage] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [displacementOnly, setDisplacementOnly] = useState(false);
  const [availDate, setAvailDate] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map" | "split">("split");
  const [showFilters, setShowFilters] = useState(false);

  async function doSearch() {
    setLoading(true); setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (zone) params.set("zone", zone);
      if (language) params.set("language", language);
      if (specialty) params.set("specialty", specialty);
      if (availDate) params.set("date", availDate);
      if (displacementOnly) params.set("displacement_allowed", "true");
      const priceRange = PRICE_RANGES[priceRangeIdx];
      if (priceRangeIdx > 0) params.set("max_price", String(priceRange.max === Infinity ? 99999 : priceRange.max));
      const res = await apiFetch<any[]>(`/guide/search?${params.toString()}`);
      setResults(res || []);
    } catch { setResults([]); }
    setLoading(false);
  }

  const markers = useMemo(() => {
    return results.flatMap((g: any) => {
      const off = g.offerings?.[0];
      if (!off?.lat || !off?.lng) return [];
      return {
        lat: off.lat,
        lng: off.lng,
        label: g.full_name,
        type: "guide" as const,
        id: g.user_id,
      };
    });
  }, [results]);

  const radii = useMemo(() => {
    return results.flatMap((g: any) => {
      const off = g.offerings?.[0];
      if (!off?.lat || !off?.lng || !off?.radius_km) return [];
      return { lat: off.lat, lng: off.lng, radiusKm: off.radius_km, color: "#f59e0b", label: `${g.full_name} — ${off.radius_km}km` };
    });
  }, [results]);

  const defaultLat = markers.length > 0 ? markers[0].lat : 33.8869;
  const defaultLng = markers.length > 0 ? markers[0].lng : 9.5375;

  // Load all guides on mount
  useEffect(() => { doSearch(); }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero search */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 px-4 pt-12 pb-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-black text-white mb-1">Trouver un guide</h1>
          <p className="text-sm text-emerald-100 mb-4">Recherchez par nom, zone, spécialité ou disponibilité</p>
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[200px] relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") doSearch(); }}
                placeholder="Nom du guide, zone..." className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border-0 focus:ring-2 focus:ring-emerald-300 shadow-sm" />
            </div>
            <select value={zone} onChange={(e) => setZone(e.target.value)} className="px-3 py-2.5 rounded-xl text-sm border-0 bg-white shadow-sm focus:ring-2 focus:ring-emerald-300">
              <option value="">Toutes zones</option>
              {TUNISIA_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button onClick={doSearch} disabled={loading}
              className="px-5 py-2.5 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 disabled:opacity-50 flex items-center gap-2 shadow-sm">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Chercher
            </button>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2.5 rounded-xl font-medium text-sm flex items-center gap-1.5 transition-colors shadow-sm ${showFilters ? "bg-emerald-500 text-white" : "bg-white/20 text-white hover:bg-white/30"}`}>
              <SlidersHorizontal size={14} /> Filtres
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Filters panel */}
        {showFilters && (
          <div className="mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Langue</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">Toutes</option>
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prix max</label>
                <select value={priceRangeIdx} onChange={(e) => setPriceRangeIdx(Number(e.target.value))} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
                  {PRICE_RANGES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Spécialité</label>
                <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">Toutes</option>
                  {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</label>
                <input type="date" value={availDate} onChange={(e) => setAvailDate(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
              </div>
              <label className="flex items-center gap-2 pb-1">
                <input type="checkbox" checked={displacementOnly} onChange={(e) => setDisplacementOnly(e.target.checked)} className="rounded" />
                <span className="text-xs font-medium text-slate-600">Déplacement possible</span>
              </label>
              <button onClick={() => { setZone(""); setLanguage(""); setPriceRangeIdx(0); setSpecialty(""); setDisplacementOnly(false); setAvailDate(""); }} className="text-xs text-slate-400 hover:text-red-500 font-medium pb-1">
                <X size={14} className="inline mr-0.5" /> Réinitialiser
              </button>
            </div>
          </div>
        )}

        {/* View toggle + results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            {results.length > 0 ? `${results.length} guide${results.length !== 1 ? "s" : ""} trouvé${results.length !== 1 ? "s" : ""}` : ""}
            {loading && <Loader2 size={12} className="animate-spin inline ml-1" />}
          </p>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" || viewMode === "split" ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600"}`}><LayoutGrid size={16} /></button>
            <button onClick={() => setViewMode("map")} className={`p-1.5 rounded-md transition-colors ${viewMode === "map" ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600"}`}><Map size={16} /></button>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        )}

        {!loading && results.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Search size={40} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Aucun guide trouvé</p>
            <p className="text-xs mt-1">Essayez d&apos;élargir vos critères de recherche</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            {/* Split view: list + map */}
            {viewMode === "split" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {results.map((g: any) => <GuideCard key={g.user_id} guide={g} />)}
                </div>
                <div className="sticky top-4 h-[calc(100vh-200px)] rounded-2xl overflow-hidden border border-slate-200">
                  {markers.length > 0 ? (
                    <MapView lat={defaultLat} lng={defaultLng} markers={markers} height="100%" radii={radii} layerVisibility={{ offers: false, circuits: false, places: false, guides: true }} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-300 bg-slate-50">
                      <MapPin size={32} className="mb-2 opacity-50" />
                      <p className="text-sm">Aucun guide avec localisation</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Map only */}
            {viewMode === "map" && (
              <div className="h-[calc(100vh-280px)] rounded-2xl overflow-hidden border border-slate-200 relative">
                {markers.length > 0 ? (
                  <MapView lat={defaultLat} lng={defaultLng} markers={markers} height="100%" radii={radii} layerVisibility={{ offers: false, circuits: false, places: false, guides: true }} />
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-300 bg-slate-50">
                    <MapPin size={32} className="mb-2 opacity-50" />
                    <p className="text-sm">Aucun guide avec localisation</p>
                  </div>
                )}
              </div>
            )}

            {/* Grid only */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.map((g: any) => <GuideCard key={g.user_id} guide={g} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function GuideCard({ guide }: { guide: any }) {
  const off = guide.offerings?.[0];
  const [showContact, setShowContact] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all group">
      <Link href={`/profile/guide/${guide.user_id}`} className="block p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 overflow-hidden">
            {guide.photo ? (
              <img src={guide.photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-emerald-600">{guide.full_name?.charAt(0) || "G"}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 truncate">{guide.full_name}</h3>
              {guide.sustainability_score != null && (
                <span className="text-[10px] text-emerald-600 bg-emerald-50 rounded-full px-1.5 py-0.5 font-medium">🌿 {guide.sustainability_score}%</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {guide.guide_type && <span className="capitalize">{guide.guide_type.replace(/_/g, " ")}</span>}
              {guide.zone && <span> · 📍 {guide.zone}</span>}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{guide.bio || "Aucune description"}</p>

        {guide.specialties && guide.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {guide.specialties.slice(0, 4).map((s: string) => (
              <span key={s} className="text-[10px] bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">{s}</span>
            ))}
            {guide.specialties.length > 4 && <span className="text-[10px] text-slate-400">+{guide.specialties.length - 4}</span>}
          </div>
        )}
      </Link>

      {off && (
        <div className="px-4 pb-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
              {off.radius_km && <span>📏 Rayon {off.radius_km} km</span>}
              {off.languages && <span>🗣️ {off.languages}</span>}
              {off.displacement_allowed && off.displacement_max_km && (
                <span>🚗 Déplacement {off.displacement_max_km}km</span>
              )}
            </div>
            {off.price != null && (
              <span className="text-sm font-black text-emerald-600">{Number(off.price).toLocaleString()} TND</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowContact(!showContact)}
              className="flex-1 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5">
              📞 Contacter
            </button>
            <Link href={`/profile/guide/${guide.user_id}`}
              className="flex-1 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 flex items-center justify-center gap-1.5">
              Voir profil <ExternalLink size={12} />
            </Link>
          </div>

          {showContact && (
            <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2 space-y-1">
              <p className="flex items-center gap-1.5"><Mail size={12} /> Contact via messagerie</p>
              <p className="text-[10px] text-slate-400">Connectez-vous pour envoyer un message direct au guide.</p>
            </div>
          )}
        </div>
      )}

      {/* Availability indicator */}
      {off && (
        <div className={`px-4 py-1.5 border-t ${guide.availability !== false ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"}`}>
          <div className="flex items-center justify-between text-[10px]">
            <span className={guide.availability !== false ? "text-emerald-600 font-medium" : "text-slate-400"}>
              {guide.availability !== false ? "✓ Disponible" : "Disponibilité à vérifier"}
            </span>
            {guide.years_experience != null && (
              <span className="text-slate-400">⭐ {guide.years_experience} ans d&apos;expérience</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
