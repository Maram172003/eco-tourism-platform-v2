"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Search, X, MapPin } from "lucide-react";
import { apiFetch } from "@/lib/api";

const MapPicker = dynamic(() => import("@/components/map/MapPicker"), {
  ssr: false,
  loading: () => <div className="h-[200px] bg-slate-100 animate-pulse rounded-xl" />,
});

interface GuideSearchInlineProps {
  onSelect: (guideId: string, guideName: string) => void;
  date?: string;
}

export default function GuideSearchInline({ onSelect, date }: GuideSearchInlineProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [selectedGuideName, setSelectedGuideName] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  async function doSearch(q: string) {
    if (!q.trim()) { setSearchResults([]); setHasSearched(false); return; }
    setLoading(true); setHasSearched(true);
    try {
      const params = new URLSearchParams();
      params.set("q", q.trim());
      if (date) params.set("date", date);
      const res = await apiFetch<any[]>(`/guide/public/search?${params.toString()}`);
      setSearchResults(res || []);
    } catch { setSearchResults([]); }
    setLoading(false);
  }

  function handleChange(val: string) {
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => doSearch(val), 300);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); doSearch(searchQuery); }
  }

  function handleSelect(guideId: string, guideName: string) {
    setSelectedGuideId(guideId);
    setSelectedGuideName(guideName);
    setSearchResults([]);
    setSearchQuery("");
    setHasSearched(false);
    onSelect(guideId, guideName);
  }

  function handleClear() {
    setSelectedGuideId(null);
    setSelectedGuideName(null);
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
  }

  return (
    <div className="space-y-2">
      {selectedGuideId && selectedGuideName ? (
        <div className="flex items-center gap-1.5 bg-primary/5 rounded-xl px-3 py-2">
          <span className="text-xs font-medium text-primary">{selectedGuideName}</span>
          <button type="button" onClick={handleClear} className="text-red-400 hover:text-red-600 p-0.5 ml-auto">
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1">
            <div className="relative flex-1">
              <input value={searchQuery} onChange={(e) => handleChange(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Chercher un guide..."
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
              {loading && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                </div>
              )}
            </div>
            <button type="button" onClick={() => doSearch(searchQuery)}
              className="p-2 text-primary hover:bg-primary/10 rounded-xl">
              <Search size={16} />
            </button>
          </div>

          {searchResults.length > 0 && (
            <button type="button" onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
              <MapPin size={14} />
              {showMap ? "Masquer la carte" : "Voir sur la carte"}
            </button>
          )}

          {showMap && searchResults.length > 0 && (
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <MapPicker
                lat={searchResults[0]?.latitude ?? searchResults[0]?.lat ?? 36.8065}
                lng={searchResults[0]?.longitude ?? searchResults[0]?.lng ?? 10.1815}
                onPick={() => {}}
              />
            </div>
          )}

          {hasSearched && !loading && searchResults.length === 0 && searchQuery.trim() && (
            <p className="text-xs text-slate-400 px-1">Aucun guide trouvé</p>
          )}
        </>
      )}

      {searchResults.length > 0 && !selectedGuideId && (
        <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 max-h-72 overflow-y-auto">
          {searchResults.map((g: any) => (
            <div key={g.user_id || g.id} className="border-b border-slate-50 last:border-0">
              <div className="flex items-start gap-2 px-2 py-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">{g.full_name?.charAt(0) || g.name?.charAt(0) || "G"}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-700">{g.full_name || g.name}</div>
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5 text-[10px] text-slate-400">
                    {g.zone && <span>📍 {g.zone}</span>}
                    {g.offerings?.[0]?.radius_km && <span>📏 Rayon {g.offerings[0].radius_km}km</span>}
                    {g.offerings?.[0]?.price != null && (
                      <span className="font-medium text-primary">💰 {Number(g.offerings[0].price).toLocaleString()} TND</span>
                    )}
                  </div>
                  {g.offerings?.[0]?.languages && (
                    <div className="flex flex-wrap gap-0.5 mt-1">
                      <span className="text-[9px] bg-slate-100 text-slate-500 rounded px-1 py-0.5">🗣️ {g.offerings[0].languages}</span>
                    </div>
                  )}
                  {g.availability !== false && (
                    <span className="inline-block mt-1 text-[9px] text-emerald-600 bg-emerald-50 rounded px-1 py-0.5">✓ Disponible</span>
                  )}
                </div>
              </div>
              <div className="px-2 pb-1.5 flex items-center justify-between">
                <a href={`/profile/guide/${g.user_id || g.id}`} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] text-primary font-medium hover:underline">
                  Voir le profil
                </a>
                <button type="button" onClick={() => handleSelect(g.user_id || g.id, g.full_name || g.name)}
                  className="text-xs bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary-dark">
                  Sélectionner
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
