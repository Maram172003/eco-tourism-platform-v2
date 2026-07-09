"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Search, X, ExternalLink } from "lucide-react";
import { apiFetch } from "@/lib/api";
import governorates from "@/lib/tunisia-governorates.json";

const TUNISIA_REGIONS = governorates.map((g) => g.name);

const MapPicker = dynamic(() => import("@/components/map/MapPicker"), {
  ssr: false,
  loading: () => <div className="h-[200px] bg-slate-100 animate-pulse rounded-xl" />,
});

interface GuideSearchInlineProps {
  onSelect: (guideId: string, guideName: string, price?: string, offeringId?: string) => void;
  dayDate?: string;
  dayLat?: number | null;
  dayLng?: number | null;
  dayLocation?: string;
}

export default function GuideSearchInline({ onSelect, dayDate, dayLat, dayLng }: GuideSearchInlineProps) {
  const [query, setQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function hasFilters(q: string, z: string, p: string) {
    return q.trim() !== "" || z !== "" || p !== "";
  }

  async function doSearch(q: string, z: string, p: string) {
    if (!hasFilters(q, z, p)) { setResults([]); setHasSearched(false); return; }
    setLoading(true); setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (z) params.set("zone", z);
      if (p) params.set("max_price", p);
      if (dayDate) params.set("date", dayDate);
      if (dayLat != null && dayLng != null) {
        params.set("lat", String(dayLat));
        params.set("lng", String(dayLng));
      }
      const res = await apiFetch<any[]>(`/guide/search?${params.toString()}`);
      setResults(res || []);
    } catch { setResults([]); }
    setLoading(false);
  }

  function triggerSearch() {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => doSearch(query, zoneFilter, maxPrice), 200);
  }

  const hasLocation = results.some((g: any) => g.offerings?.[0]?.lat != null);

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1">
        <input value={query} onChange={(e) => { setQuery(e.target.value); triggerSearch(); }}
          placeholder="Guide, zone..." className="w-24 text-[11px] border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary" />
        <select value={zoneFilter} onChange={(e) => { setZoneFilter(e.target.value); triggerSearch(); }}
          className="text-[10px] border border-slate-200 rounded-lg px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-primary w-20">
          <option value="">Zone</option>
          {TUNISIA_REGIONS.map((r: string) => <option key={r} value={r}>{r}</option>)}
        </select>
        <input type="number" min={0} value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); triggerSearch(); }}
          placeholder="Prix max" className="w-14 text-[10px] border border-slate-200 rounded-lg px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-primary" />
        <button type="button" onClick={() => doSearch(query, zoneFilter, maxPrice)} className="p-1 text-primary hover:bg-primary/10 rounded-lg">
          {loading ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" /> : <Search size={13} />}
        </button>
        {!loading && hasSearched && results.length === 0 && (
          <span className="text-[10px] text-slate-400">Aucun guide</span>
        )}
        {hasSearched && results.length > 0 && hasLocation && (
          <button type="button" onClick={() => setShowMap(!showMap)} className={`text-[10px] font-medium ml-auto ${showMap ? "text-primary" : "text-slate-400 hover:text-primary"}`}>
            {showMap ? "Liste" : "🗺️ Carte"}
          </button>
        )}
      </div>
      {results.length > 0 && !showMap && (
        <div className="absolute z-20 top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 w-80 max-h-72 overflow-y-auto">
          {results.map((g: any) => {
            const off = g.offerings?.[0];
            return (
              <div key={g.user_id} className="border-b border-slate-50 last:border-0">
                <button type="button" onClick={() => { onSelect(g.user_id, g.full_name, off?.price ? String(off.price) : undefined, off?.id); setResults([]); setQuery(""); setZoneFilter(""); setMaxPrice(""); }}
                  className="w-full flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-primary/5 text-left">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    {g.photo ? <img src={g.photo} alt="" className="w-full h-full rounded-full object-cover" /> : <span className="text-xs font-bold text-primary">{g.full_name?.charAt(0) || "G"}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-700">{g.full_name}</div>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5 text-[10px] text-slate-400">
                      {g.zone && <span>📍 {g.zone}</span>}
                      {off?.radius_km && <span>📏 {off.radius_km}km</span>}
                      {off?.price != null && <span className="font-medium text-primary">💰 {Number(off.price).toLocaleString()} TND/{off.pricing_unit === "day" ? "jour" : "pers"}</span>}
                      {off?.languages && <span>🗣️ {off.languages}</span>}
                    </div>
                    {g.availability !== false && (
                      <span className="inline-block mt-0.5 text-[9px] text-emerald-600 bg-emerald-50 rounded px-1 py-0.5">✓ Disponible le {dayDate || "cette date"}</span>
                    )}
                  </div>
                </button>
                <div className="px-2 pb-1.5 flex justify-between items-center">
                  <a href={`/profile/guide/${g.user_id}`} target="_blank" rel="noopener noreferrer" className="text-[9px] text-primary font-medium hover:underline flex items-center gap-0.5">
                    Voir le profil <ExternalLink size={9} />
                  </a>
                  {g.sustainability_score != null && (
                    <span className="text-[9px] text-emerald-500">🌿 {g.sustainability_score}%</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {results.length > 0 && showMap && (
        <div className="absolute z-20 top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 w-96 max-h-96 overflow-y-auto">
          <div className="text-[10px] font-medium text-slate-500 mb-1">Guides disponibles — cliquez sur un marqueur</div>
          <div className="h-56 rounded-lg overflow-hidden border border-slate-200">
            <MapPicker
              lat={dayLat || results[0]?.offerings?.[0]?.lat || null}
              lng={dayLng || results[0]?.offerings?.[0]?.lng || null}
              onPick={() => {}}
            />
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-1">
            {results.map((g: any) => {
              const off = g.offerings?.[0];
              return (
                <button key={g.user_id} type="button" onClick={() => { onSelect(g.user_id, g.full_name, off?.price ? String(off.price) : undefined, off?.id); setResults([]); setQuery(""); setShowMap(false); }}
                  className="flex items-center gap-1.5 text-left px-2 py-1.5 rounded-lg hover:bg-primary/5 border border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-primary">{g.full_name?.charAt(0) || "G"}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-slate-700 truncate">{g.full_name}</p>
                    <p className="text-[9px] text-slate-400 truncate">{g.zone}{off?.radius_km ? ` · ${off.radius_km}km` : ""}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
