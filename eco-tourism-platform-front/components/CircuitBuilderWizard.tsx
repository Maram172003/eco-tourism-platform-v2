"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { apiFetch } from "@/lib/api";
import ImageUploader from "@/components/ImageUploader";
import type { MyOfferItem } from "@/components/OfferItemSearchInline";
import ExternalOfferModal from "@/components/ExternalOfferModal";
import ExternalOfferItemSearch from "@/components/ExternalOfferItemSearch";
import { Search, ArrowLeft, ArrowRight, X, Plus, Trash2, Check, MapPin, Clock, Calendar, DollarSign, Users, Info, Loader2, ExternalLink, Globe } from "lucide-react";

const PolylineDrawer = dynamic(() => import("@/components/map/PolylineDrawer"), { ssr: false, loading: () => <div className="h-[300px] bg-slate-100 animate-pulse rounded-xl" /> });
const MapPicker = dynamic(() => import("@/components/map/MapPicker"), { ssr: false, loading: () => <div className="h-[200px] bg-slate-100 animate-pulse rounded-xl" /> });

interface CircuitBuilderProps {
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface DayForm {
  id: string; day_number: number; title: string; description: string; date: string;
  lat: number | null; lng: number | null; location_name: string;
  programItems: ProgramItemForm[];
}

interface ProgramItemForm {
  id: string; title: string; description: string; start_time: string; end_time: string;
  is_included: boolean; is_required: boolean; linked_offer_item_id: string | null;
  emoji: string; duration_minutes: string; distance_km: string; transport_mode: string;
  guide_id: string | null; guide_name: string; guide_cost: string;
  category: string | null; subtypes: string[] | null; price: string; photos: string[];
  fields: Record<string, any> | null;
  external_reference: Record<string, any> | null; is_external_reference: boolean;
}

interface ExternalOfferItem {
  id: string; name: string; item_type: string | null;
  offer_id: string; offer_title: string;
  prices?: { id: string; label: string; price: string; pricing_unit: string }[];
}

interface OptionForm {
  id: string; option_group: string; option_type: string; extra_price: string;
  is_included: boolean; is_required: boolean;
  external_offer_item_id: string | null;
  external_offer_title: string;
  external_provider_name: string;
}

const EMOJIS_LIST = ["📍", "🚐", "🥾", "🛶", "🏛️", "🍽️", "🏕️", "🌅", "📸", "🎒", "🚲", "🐪", "🦅", "🌿", "🏊", "🧗", "🎶", "🎨", "🛒", "⛺", "🚗", "🐴", "🚌", "✈️", "🚣"];

const TRANSPORTS_LIST = [{ value: "", label: "Aucun" }, { value: "Van", label: "🚐 Van" }, { value: "À pied", label: "🥾 À pied" }, { value: "Vélo", label: "🚲 Vélo" }, { value: "Chameau", label: "🐪 Chameau" }, { value: "Voiture", label: "🚗 Voiture" }, { value: "Kayak", label: "🛶 Kayak" }, { value: "Cheval", label: "🐴 Cheval" }, { value: "Bus", label: "🚌 Bus" }, { value: "Vol", label: "✈️ Vol" }, { value: "Barque", label: "🚣 Barque" }];

const STEP_LABELS = ["", "Général", "Jours", "Activités", "Itinéraire", "Tarifs & Options", "Aperçu"];
const TOTAL_STEPS = 6;

const OPTION_GROUPS = [
  { value: "transport", label: "Transport" }, { value: "accommodation", label: "Hébergement" },
  { value: "equipment", label: "Équipement" }, { value: "activity", label: "Activité" }, { value: "food", label: "Repas" },
];

const TUNISIA_REGIONS = [
  "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Hammamet", "Sousse",
  "Monastir", "Mahdia", "Kairouan", "Bizerte", "Béja", "Jendouba", "Kef",
  "Siliana", "Zaghouan", "Sfax", "Gabès", "Médenine", "Tataouine", "Gafsa",
  "Tozeur", "Kébili", "Douz", "Djerba", "Zarzis", "Tabarka", "Aïn Draham",
];

function genId() { return Math.random().toString(36).substring(2, 10); }

function GuideSearchInline({ onSelect, dayDate, dayLat, dayLng, dayLocation }: {
  onSelect: (id: string, name: string, price?: string) => void;
  dayDate?: string;
  dayLat?: number | null;
  dayLng?: number | null;
  dayLocation?: string;
}) {
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

  function handleChange(val: string) {
    setQuery(val);
    triggerSearch();
  }

  function handleZoneChange(val: string) {
    setZoneFilter(val);
    triggerSearch();
  }

  function handlePriceChange(val: string) {
    setMaxPrice(val);
    triggerSearch();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); doSearch(query, zoneFilter, maxPrice); }
  }

  const hasLocation = results.some((g: any) => g.offerings?.[0]?.lat != null);

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1">
        <input value={query} onChange={(e) => handleChange(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="Guide, zone..." className="w-24 text-[11px] border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary" />
        <select value={zoneFilter} onChange={(e) => handleZoneChange(e.target.value)} className="text-[10px] border border-slate-200 rounded-lg px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-primary w-20">
          <option value="">Zone</option>
          {TUNISIA_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <input type="number" min={0} value={maxPrice} onChange={(e) => handlePriceChange(e.target.value)} placeholder="Prix max"
          className="w-14 text-[10px] border border-slate-200 rounded-lg px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-primary" />
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
      {/* Results */}
      {results.length > 0 && !showMap && (
        <div className="absolute z-20 top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 w-80 max-h-72 overflow-y-auto">
          {results.map((g: any) => {
            const off = g.offerings?.[0];
            return (
              <div key={g.user_id} className="border-b border-slate-50 last:border-0">
                <button type="button" onClick={() => { onSelect(g.user_id, g.full_name, g.offerings?.[0]?.price ? String(g.offerings[0].price) : undefined); setResults([]); setQuery(""); setZoneFilter(""); setMaxPrice(""); }}
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
      {/* Map view */}
      {results.length > 0 && showMap && (
        <div className="absolute z-20 top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 w-96 max-h-96 overflow-y-auto">
          <div className="text-[10px] font-medium text-slate-500 mb-1">Guides disponibles — cliquez sur un marqueur</div>
          <div className="h-56 rounded-lg overflow-hidden border border-slate-200">
            <MapPicker
              lat={dayLat || results[0]?.offerings?.[0]?.lat || null}
              lng={dayLng || results[0]?.offerings?.[0]?.lng || null}
              onPick={() => {}} // read-only for display
            />
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-1">
            {results.map((g: any) => {
              const off = g.offerings?.[0];
              return (
                <button key={g.user_id} type="button" onClick={() => { onSelect(g.user_id, g.full_name); setResults([]); setQuery(""); setShowMap(false); }}
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

async function searchPlace(query: string): Promise<{ lat: number; lng: number; display_name: string } | null> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=fr`);
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display_name: data[0].display_name };
  } catch { return null; }
}

function ExternalOfferSearch({ category, token, onSelect }: {
  category: string;
  token: string;
  onSelect: (itemId: string, title: string, providerName: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  async function doSearch() {
    if (!query.trim()) return;
    setLoading(true); setSearched(true);
    try {
      const params = new URLSearchParams();
      params.set("category", category);
      if (user?.sub || user?.id) params.set("exclude_author", user.sub || user.id);
      const res = await apiFetch<any[]>(`/offers/public?${params.toString()}`);
      const filtered = Array.isArray(res) ? res.filter((o: any) =>
        o.title?.toLowerCase().includes(query.toLowerCase()) ||
        o.items?.some((it: any) => it.name?.toLowerCase().includes(query.toLowerCase()))
      ) : [];
      setResults(filtered);
    } catch { setResults([]); }
    setLoading(false);
  }

  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium text-slate-400">Chercher un service externe</label>
      <div className="flex gap-1">
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); doSearch(); } }}
          placeholder={`Rechercher un${category === 'accommodation' ? ' hébergement' : category === 'restaurant' ? ' restaurant' : ' transport'}...`}
          className="flex-1 text-[11px] border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary" />
        <button type="button" onClick={doSearch} disabled={loading}
          className="px-2 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-emerald-600 disabled:opacity-50">
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
        </button>
      </div>
      {searched && results.length === 0 && !loading && (
        <p className="text-[10px] text-slate-400">Aucun résultat trouvé</p>
      )}
      {results.length > 0 && (
        <div className="max-h-48 overflow-y-auto space-y-1 mt-1">
          {results.map((offer: any) => (
            <button key={offer.id} type="button"
              onClick={() => {
                const firstItem = offer.items?.[0];
                const title = firstItem?.name || offer.title;
                onSelect(firstItem?.id || offer.id, title, offer.title);
                setResults([]); setQuery("");
              }}
              className="w-full text-left bg-white border border-slate-100 rounded-lg px-2.5 py-2 hover:border-primary hover:bg-primary/5 transition-all">
              <p className="text-xs font-medium text-slate-700">{offer.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {offer.region && <span className="text-[10px] text-slate-400">📍 {offer.region}</span>}
                {offer.items?.[0]?.prices?.[0]?.price && (
                  <span className="text-[10px] font-medium text-primary">
                    {Number(offer.items[0].prices[0].price).toLocaleString()} TND
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LocationSearch({ onPick, placeholder }: { onPick: (lat: number, lng: number, name: string) => void; placeholder?: string }) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true); setError("");
    const result = await searchPlace(query.trim());
    setSearching(false);
    if (!result) { setError("Lieu introuvable"); return; }
    onPick(result.lat, result.lng, result.display_name);
    setQuery(result.display_name.split(",")[0]);
  }

  return (
    <div className="flex gap-1.5">
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder || "Rechercher un lieu..."} className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearch(); } }} />
      <button type="button" onClick={handleSearch} disabled={searching} className="px-2.5 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-emerald-600 disabled:opacity-50 shrink-0">
        {searching ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function CircuitBuilderWizard({ token, onClose, onSuccess }: CircuitBuilderProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [region, setRegion] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [durationDays, setDurationDays] = useState("3");
  const [durationNights, setDurationNights] = useState("2");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("moderate");

  const [days, setDays] = useState<DayForm[]>([]);
  const [offerItems, setOfferItems] = useState<MyOfferItem[]>([]);
  const [waypoints, setWaypoints] = useState<[number, number][]>([]);
  const [circuitLat, setCircuitLat] = useState<number | null>(null);
  const [circuitLng, setCircuitLng] = useState<number | null>(null);
  const [circuitAddress, setCircuitAddress] = useState("");

  const [basePrice, setBasePrice] = useState("");
  const [currency, setCurrency] = useState("TND");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [bookingDeadlineDays, setBookingDeadlineDays] = useState("");
  const [confirmationMode, setConfirmationMode] = useState("automatic");
  const [inclusions, setInclusions] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [options, setOptions] = useState<OptionForm[]>([]);

  // Availability modes (Maram pattern)
  const [availMode, setAvailMode] = useState("specific");
  const [availWeekdays, setAvailWeekdays] = useState<number[]>([]);
  const [availStart, setAvailStart] = useState("");
  const [availEnd, setAvailEnd] = useState("");
  const [availSeason, setAvailSeason] = useState("");
  const [availSpecificDates, setAvailSpecificDates] = useState<string[]>([]);
  const [availTimeStart, setAvailTimeStart] = useState("09:00");
  const [availTimeEnd, setAvailTimeEnd] = useState("17:00");
  const [availDelaiReponse, setAvailDelaiReponse] = useState("");

  // Hébergement
  const [hebergementInclus, setHebergementInclus] = useState(false);
  const [hebergementType, setHebergementType] = useState<"same" | "per_day">("same");
  const [hebergementAccomType, setHebergementAccomType] = useState("chambre");
  const [hebergementNbUnites, setHebergementNbUnites] = useState("1");
  const [hebergementNbLits, setHebergementNbLits] = useState("2");
  const [hebergementPriceSource, setHebergementPriceSource] = useState("own");
  const [hebergementPrixNuit, setHebergementPrixNuit] = useState("");
  const [hebergementPrixExterne, setHebergementPrixExterne] = useState("");


  const [daySearchDayId, setDaySearchDayId] = useState<string | null>(null);

  // ExternalOfferModal state
  const [externalModalDayId, setExternalModalDayId] = useState<string | null>(null);
  const [externalModalProgId, setExternalModalProgId] = useState<string | null>(null);
  const [user, setUserState] = useState<{ sub?: string; id?: string } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) setUserState(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    if (days.length === 0) {
      const nd = Math.max(1, Number(durationDays) || 1);
      setDays(Array.from({ length: nd }, (_, i) => ({
        id: genId(), day_number: i + 1, title: `Jour ${i + 1}`, description: "", date: "",
        lat: null, lng: null, location_name: "", programItems: [],
      })));
    }
  }, []);

  useEffect(() => {
    const nd = Number(durationDays) || 1;
    if (nd > days.length) {
      setDays((prev) => [...prev, ...Array.from({ length: nd - prev.length }, (_, i) => ({
        id: genId(), day_number: prev.length + i + 1, title: `Jour ${prev.length + i + 1}`, description: "", date: "",
        lat: null, lng: null, location_name: "", programItems: [],
      }))].map((d, idx) => ({ ...d, day_number: idx + 1 })));
    } else if (nd < days.length) {
      setDays((prev) => prev.slice(0, nd).map((d, idx) => ({ ...d, day_number: idx + 1 })));
    }
  }, [durationDays]);

  useEffect(() => {
    if (token) {
      apiFetch<MyOfferItem[]>("/offers/items/mine", { headers: { Authorization: `Bearer ${token}` } })
        .then((items) => setOfferItems(Array.isArray(items) ? items : []))
        .catch(() => {});
    }
  }, [token]);

  // Auto-fill accommodation price from own offer items
  useEffect(() => {
    if (hebergementPriceSource !== "own" || hebergementPrixNuit) return;
    const accomItem = offerItems.find((it) =>
      ["room","bed","camping_space","dortoir","tente","chambre","emplacement"].includes(it.item_type || ""));
    if (accomItem?.prices?.[0]?.price) {
      setHebergementPrixNuit(accomItem.prices[0].price);
    }
  }, [hebergementPriceSource, offerItems, hebergementPrixNuit]);

  const sortedDays = [...days].sort((a, b) => a.day_number - b.day_number);
  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  function handleDurationDaysChange(val: string) {
    const n = parseInt(val) || 1;
    setDurationDays(String(n));
    setDurationNights(String(Math.max(0, n - 1)));
  }

  function addDay() {
    const n = days.length + 1;
    setDays((prev) => [...prev, { id: genId(), day_number: n, title: `Jour ${n}`, description: "", date: "", lat: null, lng: null, location_name: "", programItems: [] }]);
    setDurationDays(String(n));
    setDurationNights(String(n - 1));
  }

  function removeDay(dayId: string) {
    setDays((prev) => prev.filter((d) => d.id !== dayId).map((d, idx) => ({ ...d, day_number: idx + 1 })));
    setDurationDays(String(Math.max(1, days.length - 1)));
    setDurationNights(String(Math.max(0, days.length - 2)));
  }

  function updateDay(dayId: string, updates: Partial<DayForm>) {
    setDays((prev) => prev.map((d) => (d.id === dayId ? { ...d, ...updates } : d)));
  }

  function addProgramItem(dayId: string) {
    setDays((prev) => prev.map((d) => d.id !== dayId ? d : { ...d, programItems: [...d.programItems, { id: genId(), title: "", description: "", start_time: "", end_time: "", is_included: true, is_required: false, linked_offer_item_id: null, emoji: "📍", duration_minutes: "", distance_km: "", transport_mode: "", guide_id: null, guide_name: "", guide_cost: "", category: null, subtypes: null, price: "", photos: [], fields: null, external_reference: null, is_external_reference: false }] }));
  }

  function removeProgramItem(dayId: string, itemId: string) {
    setDays((prev) => prev.map((d) => d.id !== dayId ? d : { ...d, programItems: d.programItems.filter((p) => p.id !== itemId) }));
  }

  function updateProgramItem(dayId: string, itemId: string, updates: Partial<ProgramItemForm>) {
    setDays((prev) => prev.map((d) => d.id !== dayId ? d : { ...d, programItems: d.programItems.map((p) => p.id === itemId ? { ...p, ...updates } : p) }));
  }

  function addOption() {
    setOptions((prev) => [...prev, { id: genId(), option_group: "activity", option_type: "single_choice", extra_price: "", is_included: false, is_required: false, external_offer_item_id: null, external_offer_title: "", external_provider_name: "" }]);
  }

  function removeOption(optId: string) {
    setOptions((prev) => prev.filter((o) => o.id !== optId));
  }

  function updateOption(optId: string, updates: Partial<OptionForm>) {
    setOptions((prev) => prev.map((o) => (o.id === optId ? { ...o, ...updates } : o)));
  }

  function getWaypointFromDays(): [number, number][] {
    const pts: [number, number][] = [];
    if (circuitLat !== null && circuitLng !== null) pts.push([circuitLat, circuitLng]);
    for (const d of sortedDays) { if (d.lat !== null && d.lng !== null) pts.push([d.lat, d.lng]); }
    return pts;
  }

  const handleSubmit = async () => {
    if (!title.trim()) { setError("Le titre est requis."); return; }
    setSubmitting(true); setError(null);
    try {
      const finalWaypoints = waypoints.length > 0 ? waypoints : getWaypointFromDays();
      const mainLat = finalWaypoints.length > 0 ? finalWaypoints[0][0] : circuitLat;
      const mainLng = finalWaypoints.length > 0 ? finalWaypoints[0][1] : circuitLng;
      const circuit = await apiFetch<any>("/circuits", {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: title.trim(), description: description.trim() || undefined, region: region || undefined,
          duration_days: Number(durationDays) || undefined, duration_nights: Number(durationNights) || undefined,
          base_price: basePrice ? Number(basePrice) : undefined, currency,
          max_participants: maxParticipants ? Number(maxParticipants) : undefined,
          booking_deadline_days: bookingDeadlineDays ? Number(bookingDeadlineDays) : undefined,
          confirmation_mode: confirmationMode, difficulty_level: difficultyLevel,
          inclusions: inclusions || undefined, exclusions: exclusions || undefined,
          images: images.length > 0 ? images : undefined, lat: mainLat, lng: mainLng,
          address: circuitAddress || undefined, start_date: startDate || undefined, end_date: endDate || undefined,
          waypoints: finalWaypoints.length > 0 ? JSON.stringify(finalWaypoints) : undefined,
          availability: (() => {
            const base: any = { mode: availMode };
            if (availMode === "specific") base.specific_dates = availSpecificDates;
            if (availMode === "weekly") { base.weekdays = availWeekdays; base.heure_debut = availTimeStart; base.heure_fin = availTimeEnd; }
            if (availMode === "period") { base.avail_start = availStart; base.avail_end = availEnd; }
            if (availMode === "season") base.saisons = availSeason ? [availSeason] : undefined;
            if (availDelaiReponse) base.delai_reponse = Number(availDelaiReponse);
            return base;
          })(),
          hebergement: {
            inclus: hebergementInclus,
            type: hebergementInclus ? hebergementType : undefined,
            accom_type: hebergementInclus ? hebergementAccomType : undefined,
            nb_unites: hebergementInclus ? Number(hebergementNbUnites) : undefined,
            nb_lits: hebergementInclus ? Number(hebergementNbLits) : undefined,
            price_source: hebergementInclus ? hebergementPriceSource : undefined,
            prix_nuit: hebergementInclus && hebergementPrixNuit ? Number(hebergementPrixNuit) : undefined,
            prix_achat: hebergementInclus && hebergementPriceSource === "other" ? Number(hebergementPrixExterne) : undefined,
            prestataire: hebergementInclus && hebergementPriceSource === "external" ? hebergementPrixExterne : undefined,
          },
        }),
      });
      const circuitId = circuit.id;
      for (const day of sortedDays) {
        if (!day.title.trim()) continue;
        const createdDay = await apiFetch<any>(`/circuits/${circuitId}/days`, {
          method: "POST", headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ day_number: day.day_number, title: day.title.trim(), description: day.description || undefined, date: day.date || undefined, lat: day.lat ?? undefined, lng: day.lng ?? undefined, location_name: day.location_name || undefined }),
        });
        for (const prog of day.programItems) {
          if (!prog.title.trim()) continue;
          await apiFetch(`/circuits/${circuitId}/days/${createdDay.id}/program`, {
            method: "POST", headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              title: prog.title.trim(), description: prog.description || undefined,
              start_time: prog.start_time || undefined, end_time: prog.end_time || undefined,
              is_included: prog.is_included, is_required: prog.is_required,
              linked_offer_item_id: prog.linked_offer_item_id || undefined,
              emoji: prog.emoji || undefined,
              duration_minutes: prog.duration_minutes ? Number(prog.duration_minutes) : undefined,
              distance_km: prog.distance_km ? Number(prog.distance_km) : undefined,
              transport_mode: prog.transport_mode || undefined,
              guide_id: prog.guide_id || undefined,
              category: prog.category || undefined,
              subtypes: prog.subtypes?.length ? prog.subtypes : undefined,
              price: prog.price ? Number(prog.price) : undefined,
              photos: prog.photos?.length ? prog.photos : undefined,
              fields: { ...(prog.fields || {}), guide_cost: prog.guide_cost ? Number(prog.guide_cost) : undefined } as any,
              external_reference: prog.external_reference || undefined,
              is_external_reference: prog.is_external_reference || false,
            }),
          });
        }
      }
      for (const opt of options) {
        await apiFetch(`/circuits/${circuitId}/options`, {
          method: "POST", headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ option_group: opt.option_group || undefined, option_type: opt.option_type, extra_price: opt.extra_price ? Number(opt.extra_price) : undefined, is_included: opt.is_included, is_required: opt.is_required, offer_item_id: opt.external_offer_item_id || undefined }),
        });
      }
      onSuccess(); onClose();
    } catch (e: any) {
      setError(e.message || "Erreur lors de la création du circuit");
    } finally { setSubmitting(false); }
  };

  function renderStepIndicator() {
    return (
      <div className="flex items-center gap-1 mb-6">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${s === step ? "bg-primary text-white scale-110 shadow-md shadow-emerald-200" : s < step ? "bg-emerald-100 text-primary" : "bg-slate-100 text-slate-400"}`}>
              {s < step ? <Check size={14} /> : s}
            </div>
            {s < TOTAL_STEPS && <div className={`flex-1 h-0.5 ${s < step ? "bg-emerald-300" : "bg-slate-200"}`} />}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[2vh] sm:pt-[4vh] px-2">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[94vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step > 1 && <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><ArrowLeft size={18} /></button>}
            <h2 className="text-lg font-bold text-slate-800">{STEP_LABELS[step]}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={20} /></button>
        </div>
        <div className="px-6 py-4">
          {renderStepIndicator()}
          {error && <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 text-sm text-red-600">{error}</div>}

          {/* ─── Step 1: General Info ─────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Titre du circuit *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Circuit découverte du Sud Tunisien" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez le circuit..." rows={3} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Région</label>
                  <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Sélectionner une région</option>
                    {TUNISIA_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Devise</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="TND">TND (Dinar Tunisien)</option>
                    <option value="EUR">EUR (Euro)</option><option value="USD">USD (Dollar)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Durée (jours) *</label>
                  <input type="number" min={1} max={90} value={durationDays} onChange={(e) => handleDurationDaysChange(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Durée (nuits)</label>
                  <input type="number" min={0} max={89} value={durationNights} onChange={(e) => setDurationNights(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Date de début</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Date de fin</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Niveau de difficulté</label>
                <select value={difficultyLevel} onChange={(e) => setDifficultyLevel(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="easy">🟢 Facile</option>
                  <option value="moderate">🟡 Modéré</option>
                  <option value="hard">🔴 Difficile</option>
                  <option value="expert">⚫ Expert</option>
                </select>
              </div>
              <div>
                <ImageUploader images={images} onChange={setImages} maxImages={10} label="Images du circuit" />
                <div className="mt-1.5 flex gap-1.5">
                  <input type="text" placeholder="Ou coller une URL d'image…" className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    onKeyDown={(e) => { if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) { e.preventDefault(); const url = (e.target as HTMLInputElement).value.trim(); if (!images.includes(url)) setImages([...images, url]); (e.target as HTMLInputElement).value = ""; } }} />
                  <button type="button" onClick={(e) => { const inp = (e.target as HTMLElement).parentElement?.querySelector('input'); if (inp?.value.trim()) { const url = inp.value.trim(); if (!images.includes(url)) setImages([...images, url]); inp.value = ""; } }}
                    className="px-2.5 py-1.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-200 shrink-0">Ajouter URL</button>
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 2: Days Timeline ─────────────────────── */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-3">Organisez les {sortedDays.length} jour{sortedDays.length > 1 ? "s" : ""} de votre circuit.</p>
              <div className="space-y-3">
                {sortedDays.map((day) => (
                  <div key={day.id} className="group border border-slate-200 rounded-xl p-4 hover:border-emerald-200 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-sm font-bold text-white">{day.day_number}</span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <input value={day.title} onChange={(e) => updateDay(day.id, { title: e.target.value })} placeholder={`Jour ${day.day_number}`} className="w-full text-sm font-medium text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary" />
                          </div>
                          <div>
                            <input type="date" value={day.date} onChange={(e) => updateDay(day.id, { date: e.target.value })} className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary" />
                          </div>
                        </div>
                        <textarea value={day.description} onChange={(e) => updateDay(day.id, { description: e.target.value })} placeholder="Description du jour..." rows={2} className="w-full text-sm text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary resize-none" />

                        {/* Location: always-visible map with search */}
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Lieu du jour</label>
                          <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <MapPicker
                              lat={day.lat}
                              lng={day.lng}
                              onPick={(lat, lng, addr) => {
                                updateDay(day.id, { lat, lng, location_name: addr });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end mt-2 gap-1">
                      <span className="text-xs text-slate-400">{day.programItems.length} activité{day.programItems.length !== 1 ? "s" : ""}</span>
                      {sortedDays.length > 1 && (
                        <button type="button" onClick={() => removeDay(day.id)} className="p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addDay} className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-sm font-medium hover:border-primary hover:text-primary flex items-center justify-center gap-2">
                <Plus size={16} /> Ajouter un jour
              </button>
            </div>
          )}

          {/* ─── Step 3: Program Items ─────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Chaque activité peut être liée à une offre personnelle, à une offre externe d&apos;un autre propriétaire, ou être une référence indépendante.</p>
              {offerItems.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                  Vous n&apos;avez pas encore d&apos;offres. <a href="/dashboard?tab=offers" className="font-semibold underline">Créez des offres</a> avant d&apos;ajouter des activités au circuit.
                </div>
              )}
              {sortedDays.map((day) => (
                <div key={day.id} className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                      <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white">{day.day_number}</span>
                      {day.title}
                    </h3>
                    <span className="text-xs text-slate-400">{day.programItems.length} activité{day.programItems.length !== 1 ? "s" : ""}</span>
                  </div>
                  {day.programItems.length === 0 && <p className="text-xs text-slate-400 text-center py-3">Aucune activité pour ce jour</p>}
                  <div className="space-y-2">
                    {day.programItems.map((prog) => (
                      <div key={prog.id} className="bg-white border border-slate-200 rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-2">
                            {/* Offre liée — 3 cas : personnelle, externe, référence */}
                            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-slate-500">Activité liée à</label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setExternalModalDayId(day.id);
                                    setExternalModalProgId(prog.id);
                                  }}
                                  className="flex items-center gap-1 text-[10px] font-medium text-primary hover:text-emerald-600"
                                >
                                  <Globe size={12} />
                                  {prog.linked_offer_item_id ? "Changer" : "Sélectionner"}
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {/* Case 1: Activité personnelle (ma propre offre) */}
                                {prog.linked_offer_item_id && offerItems.some((it) => it.id === prog.linked_offer_item_id) && (
                                  <div className="flex items-center gap-1.5 bg-primary/5 border border-primary/20 rounded-lg px-2 py-1.5">
                                    <span className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="text-[11px] font-medium text-primary truncate max-w-[160px]">
                                      {offerItems.find((it) => it.id === prog.linked_offer_item_id)?.name || "Offre personnelle"}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => updateProgramItem(day.id, prog.id, { linked_offer_item_id: null })}
                                      className="text-red-400 hover:text-red-600 p-0.5"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                )}
                                {/* Case 2: Aucune offre liée — message informatif */}
                                {!prog.linked_offer_item_id && (
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-white border border-dashed border-slate-300 rounded-lg px-2.5 py-1.5">
                                    <Globe size={13} />
                                    Aucune offre liée
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Titre (prérempli depuis l'offre, éditable) */}
                            <div className="flex flex-wrap items-center gap-2">
                              <select value={prog.emoji} onChange={(e) => updateProgramItem(day.id, prog.id, { emoji: e.target.value })} className="text-lg border border-slate-200 rounded-lg px-1.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary">
                                {EMOJIS_LIST.map((e) => <option key={e} value={e}>{e}</option>)}
                              </select>
                              <input value={prog.title} onChange={(e) => updateProgramItem(day.id, prog.id, { title: e.target.value })}
                                placeholder="Titre de l'activité"
                                className="flex-1 text-sm font-medium text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <textarea value={prog.description} onChange={(e) => updateProgramItem(day.id, prog.id, { description: e.target.value })} placeholder="Description" rows={1} className="w-full text-xs text-slate-500 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                            <div className="grid grid-cols-4 gap-2">
                              <div>
                                <label className="block text-[10px] font-medium text-slate-400 mb-0.5">Début</label>
                                <input type="time" value={prog.start_time} onChange={(e) => updateProgramItem(day.id, prog.id, { start_time: e.target.value })} className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-medium text-slate-400 mb-0.5">Fin</label>
                                <input type="time" value={prog.end_time} onChange={(e) => updateProgramItem(day.id, prog.id, { end_time: e.target.value })} className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-medium text-slate-400 mb-0.5">Durée (min)</label>
                                <input type="number" min="0" value={prog.duration_minutes} onChange={(e) => updateProgramItem(day.id, prog.id, { duration_minutes: e.target.value })} className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="ex: 120" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-medium text-slate-400 mb-0.5">Distance (km)</label>
                                <input type="number" min="0" step="0.1" value={prog.distance_km} onChange={(e) => updateProgramItem(day.id, prog.id, { distance_km: e.target.value })} className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="ex: 5" />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-[10px] font-medium text-slate-400 shrink-0">Transport</label>
                              <select value={prog.transport_mode} onChange={(e) => updateProgramItem(day.id, prog.id, { transport_mode: e.target.value })} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary">
                                {TRANSPORTS_LIST.map((t) => (
                                  <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                              </select>
                            </div>
                            {/* Guide search per activity */}
                            <div className="flex items-center gap-2">
                              <label className="text-[10px] font-medium text-slate-400 shrink-0">Guide</label>
                              {prog.guide_id ? (
                                <div className="flex items-center gap-1.5 bg-primary/5 rounded-lg px-2 py-1">
                                  <span className="text-[11px] font-medium text-primary">{prog.guide_name}</span>
                                  <button type="button" onClick={() => updateProgramItem(day.id, prog.id, { guide_id: null, guide_name: "" })} className="text-red-400 hover:text-red-600 p-0.5"><X size={12} /></button>
                                </div>
                              ) : (
                                <div className="relative">
                                  <GuideSearchInline
                                    onSelect={(id, name, price) => updateProgramItem(day.id, prog.id, { guide_id: id, guide_name: name, guide_cost: price || "" })}
                                    dayDate={day.date || undefined}
                                    dayLat={day.lat}
                                    dayLng={day.lng}
                                    dayLocation={day.location_name}
                                  />
                                </div>
                              )}
                            </div>
                            {/* Price + guide cost */}
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <label className="block text-[10px] font-medium text-slate-400 mb-0.5">Prix facturé voyageur</label>
                                <div className="relative">
                                  <DollarSign size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                  <input type="number" min={0} value={prog.price} onChange={(e) => updateProgramItem(day.id, prog.id, { price: e.target.value })}
                                    placeholder="0" className="w-full pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                              </div>
                              {prog.guide_id && prog.guide_cost && (
                                <div className="text-[10px] text-slate-400 bg-slate-50 rounded-lg px-2 py-1.5 shrink-0">
                                  Coût guide: <span className="font-medium text-slate-600">{Number(prog.guide_cost).toLocaleString()} TND</span>
                                </div>
                              )}
                              {prog.linked_offer_item_id && offerItems.find((it) => it.id === prog.linked_offer_item_id)?.prices?.[0] && (
                                <div className="text-[10px] text-emerald-600 bg-emerald-50 rounded-lg px-2 py-1.5 shrink-0">
                                  Offre à {Number(offerItems.find((it) => it.id === prog.linked_offer_item_id)!.prices![0].price).toLocaleString()} TND
                                </div>
                              )}
                            </div>
                          </div>
                          <button type="button" onClick={() => removeProgramItem(day.id, prog.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0 mt-1"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addProgramItem(day.id)} className="mt-2 w-full py-1.5 rounded-lg border border-dashed border-slate-300 text-xs text-slate-400 hover:border-primary hover:text-primary flex items-center justify-center gap-1">
                    <Plus size={12} /> Ajouter une activité
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ─── Step 4: Map & Route ───────────────────────── */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Tracez l&apos;itinéraire sur la carte. Cliquez pour ajouter des points ou utilisez la recherche.</p>

              {/* Search to add waypoint */}
              <div className="bg-slate-50 rounded-xl p-3">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Ajouter une étape par recherche</label>
                <LocationSearch
                  onPick={(lat, lng, name) => {
                    setWaypoints((prev) => [...prev, [lat, lng]]);
                  }}
                  placeholder="Ex: Matmata, Gabès..."
                />
              </div>

              <PolylineDrawer waypoints={waypoints} onChange={setWaypoints} />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Adresse du point de départ</label>
                  <input value={circuitAddress} onChange={(e) => setCircuitAddress(e.target.value)} placeholder="Adresse du circuit" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Latitude</label>
                    <input type="number" step="any" value={circuitLat ?? ""} onChange={(e) => setCircuitLat(e.target.value ? Number(e.target.value) : null)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" readOnly />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Longitude</label>
                    <input type="number" step="any" value={circuitLng ?? ""} onChange={(e) => setCircuitLng(e.target.value ? Number(e.target.value) : null)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" readOnly />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400">Les champs Lat/Lng sont remplis automatiquement quand vous cliquez sur la carte ou utilisez la recherche.</p>
            </div>
          )}

          {/* ─── Step 5: Disponibilité, Tarifs & Options ─── */}
          {step === 5 && (
            <div className="space-y-5 overflow-y-auto max-h-[60vh] pr-1">
              {/* ─── Disponibilité ────────────────────── */}
              <div>
                <h3 className="font-semibold text-sm text-slate-700 mb-2">Disponibilité</h3>
                <p className="text-xs text-slate-400 mb-3">Quand votre circuit est-il disponible ?</p>
                <div className="space-y-2">
                  {[
                    { value: "specific", label: "📌 Dates spécifiques", desc: "Sélection manuelle de dates précises" },
                    { value: "weekly", label: "🔁 Récurrence hebdomadaire", desc: "Mêmes jours chaque semaine" },
                    { value: "period", label: "📅 Période ouverte", desc: "Disponible du … au …" },
                    { value: "season", label: "🌤️ Saison complète", desc: "Disponible toute une saison" },
                    { value: "on_demand", label: "💬 Sur demande", desc: "Vous confirmez après contact" },
                  ].map((m) => (
                    <button key={m.value} type="button" onClick={() => setAvailMode(m.value)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl border-2 transition-all ${
                        availMode === m.value ? "border-primary bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300"
                      }`}>
                      <p className="text-sm font-semibold text-slate-800">{m.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                    </button>
                  ))}
                </div>

                {availMode === "period" && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Date début</label>
                      <input type="date" value={availStart} onChange={(e) => setAvailStart(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Date fin</label>
                      <input type="date" value={availEnd} onChange={(e) => setAvailEnd(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                    </div>
                  </div>
                )}

                {availMode === "weekly" && (
                  <div className="space-y-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2">Jours disponibles</label>
                      <div className="flex gap-2 flex-wrap">
                        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d, i) => (
                          <button key={i} type="button" onClick={() => setAvailWeekdays((prev) => prev.includes(i) ? prev.filter((v) => v !== i) : [...prev, i])}
                            className={`w-10 h-10 rounded-full text-xs font-bold border-2 transition-all ${
                              availWeekdays.includes(i) ? "bg-primary text-white border-primary" : "bg-white text-slate-600 border-slate-200"
                            }`}>{d}</button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Créneau début</label>
                        <input type="time" value={availTimeStart} onChange={(e) => setAvailTimeStart(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Créneau fin</label>
                        <input type="time" value={availTimeEnd} onChange={(e) => setAvailTimeEnd(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                      </div>
                    </div>
                  </div>
                )}

                {availMode === "specific" && (
                  <div className="space-y-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Ajouter une date</label>
                      <input type="date" onChange={(e) => { if (e.target.value) { setAvailSpecificDates((prev) => [...prev, e.target.value]); } e.target.value = ""; }}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                    </div>
                    {availSpecificDates.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {availSpecificDates.map((d) => (
                          <span key={d} className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {d}
                            <button type="button" onClick={() => setAvailSpecificDates((prev) => prev.filter((v) => v !== d))} className="ml-0.5 hover:text-red-500">✕</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {availMode === "season" && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Saison</label>
                    <select value={availSeason} onChange={(e) => setAvailSeason(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
                      <option value="">Choisir une saison</option>
                      <option value="printemps">Printemps</option>
                      <option value="ete">Été</option>
                      <option value="automne">Automne</option>
                      <option value="hiver">Hiver</option>
                    </select>
                  </div>
                )}
              </div>

              {/* ─── Hébergement ───────────────────────── */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="font-semibold text-sm text-slate-700 mb-2">Hébergement</h3>
                <label className="flex items-center gap-3 cursor-pointer mb-2">
                  <div onClick={() => setHebergementInclus(!hebergementInclus)}
                    className={`w-11 h-6 rounded-full flex items-center transition-colors ${hebergementInclus ? "bg-primary" : "bg-slate-200"}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${hebergementInclus ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-sm text-slate-600">Hébergement inclus dans le circuit</span>
                </label>
                {hebergementInclus && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {[
                        { value: "chambre", label: "🏠 Chambre", desc: "Lit ou chambre privée" },
                        { value: "dortoir", label: "🛏️ Dortoir", desc: "Lit en dortoir partagé" },
                        { value: "tente", label: "⛺ Espace tente", desc: "Emplacement tente / bivouac" },
                      ].map((t) => (
                        <button key={t.value} type="button" onClick={() => setHebergementAccomType(t.value)}
                          className={`flex-1 text-left px-3 py-2.5 rounded-xl border-2 transition-all ${
                            hebergementAccomType === t.value ? "border-primary bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300"
                          }`}>
                          <p className="text-sm font-semibold text-slate-800">{t.label}</p>
                          <p className="text-[10px] text-slate-400">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Nombre d'unités</label>
                        <input type="number" min={1} value={hebergementNbUnites} onChange={(e) => setHebergementNbUnites(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-500 mb-0.5">{hebergementAccomType === "tente" ? "Capacité/tente" : "Lits/unité"}</label>
                        <input type="number" min={1} value={hebergementNbLits} onChange={(e) => setHebergementNbLits(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Type séjour</label>
                        <select value={hebergementType} onChange={(e) => setHebergementType(e.target.value as "same" | "per_day")} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
                          <option value="same">Même lieu</option>
                          <option value="per_day">Par jour</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Tarification hébergement</label>
                      <div className="flex gap-2 mb-2">
                        {[
                          { value: "own", label: "🏠 Mon hébergement", desc: "C'est chez moi" },
                          { value: "other", label: "🤝 Autre propriétaire", desc: "Je loue via la plateforme" },
                          { value: "external", label: "🏨 Externe", desc: "Hôtel/agence hors plateforme" },
                        ].map((s) => (
                          <button key={s.value} type="button" onClick={() => setHebergementPriceSource(s.value)}
                            className={`flex-1 text-left px-2.5 py-2 rounded-xl border-2 transition-all ${
                              hebergementPriceSource === s.value ? "border-primary bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300"
                            }`}>
                            <p className="text-xs font-semibold text-slate-800">{s.label}</p>
                            <p className="text-[9px] text-slate-400">{s.desc}</p>
                          </button>
                        ))}
                      </div>
                      {hebergementPriceSource === "own" && (
                        <div className="space-y-2">
                          <input type="number" min={0} value={hebergementPrixNuit} onChange={(e) => setHebergementPrixNuit(e.target.value)} placeholder="Prix par nuit/unité (TND)" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                          {offerItems.filter((it) =>
                            ["room","bed","camping_space","dortoir","tente","chambre","emplacement"].includes(it.item_type || "")
                          ).slice(0, 1).map((it) => it.prices?.[0] && (
                            <p key={it.id} className="text-[10px] text-emerald-600 bg-emerald-50 rounded-lg px-2 py-1">
                              Mon offre <strong>{it.name}</strong> — prix catalogue: {Number(it.prices[0].price).toLocaleString()} TND
                            </p>
                          ))}
                        </div>
                      )}
                      {hebergementPriceSource === "other" && (
                        <div className="space-y-2">
                          <ExternalOfferItemSearch
                            lat={days[0]?.lat ?? null}
                            lng={days[0]?.lng ?? null}
                            radiusKm={50}
                            itemType="room"
                            category="accommodation"
                            excludeAuthorId={user?.sub || user?.id || ""}
                            onSelect={(_id, _title, _name, _provider, price) => {
                              if (price && !hebergementPrixExterne) setHebergementPrixExterne(price);
                            }}
                            dayLabel="Hébergement à proximité"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input type="number" min={0} value={hebergementPrixExterne} onChange={(e) => setHebergementPrixExterne(e.target.value)} placeholder="Prix achat (TND)" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                            <input type="number" min={0} value={hebergementPrixNuit} onChange={(e) => setHebergementPrixNuit(e.target.value)} placeholder="Prix revente (TND)" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                          </div>
                        </div>
                      )}
                      {hebergementPriceSource === "external" && (
                        <div className="grid grid-cols-2 gap-2">
                          <input type="number" min={0} value={hebergementPrixNuit} onChange={(e) => setHebergementPrixNuit(e.target.value)} placeholder="Prix estimé (TND)" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                          <input value={hebergementPrixExterne} onChange={(e) => setHebergementPrixExterne(e.target.value)} placeholder="Nom prestataire" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                        </div>
                      )}
                    </div>
                    {hebergementType === "per_day" && (
                      <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1">Configurez l'hébergement par journée dans les détails du circuit.</p>
                    )}
                  </div>
                )}
              </div>

              {/* ─── Tarification ──────────────────────── */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="font-semibold text-sm text-slate-700 mb-2">Tarification</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Prix de base</label>
                    <input type="number" min={0} step={0.01} value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="Ex: 500" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Participants max</label>
                    <input type="number" min={1} value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} placeholder="Ex: 15" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Délai réservation (jours)</label>
                    <input type="number" min={0} value={bookingDeadlineDays} onChange={(e) => setBookingDeadlineDays(e.target.value)} placeholder="Ex: 3" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Confirmation</label>
                    <select value={confirmationMode} onChange={(e) => setConfirmationMode(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="automatic">Automatique</option>
                      <option value="manual">Manuelle</option>
                    </select>
                  </div>
                </div>
                {confirmationMode === "manual" && (
                  <div className="mt-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Délai de réponse (heures)</label>
                    <input type="number" min={1} value={availDelaiReponse} onChange={(e) => setAvailDelaiReponse(e.target.value)} placeholder="Ex: 48" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                  </div>
                )}
              </div>

              {/* ─── Inclus / Non inclus ──────────────── */}
              <div className="border-t border-slate-100 pt-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Inclus</label>
                  <textarea value={inclusions} onChange={(e) => setInclusions(e.target.value)} placeholder="Ex: Transport, hébergement, guide..." rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Non inclus</label>
                  <textarea value={exclusions} onChange={(e) => setExclusions(e.target.value)} placeholder="Ex: Repas du soir, activités optionnelles..." rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
              </div>

              {/* ─── Options supplémentaires ──────────── */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="font-semibold text-sm text-slate-700 mb-2">Options supplémentaires</h3>
                <p className="text-xs text-slate-400 mb-3">Ajoutez des options externes (hébergement, restaurant, transport). Si le service est chez un autre prestataire, cherchez-le dans le catalogue.</p>
                <div className="space-y-2">
                  {options.length === 0 && <p className="text-xs text-slate-400 text-center py-2">Aucune option ajoutée</p>}
                  {options.map((opt) => (
                    <div key={opt.id} className="bg-slate-50 rounded-xl p-3 space-y-2">
                      <div className="grid grid-cols-5 gap-2 items-end">
                        <div>
                          <label className="block text-[10px] font-medium text-slate-400 mb-0.5">Groupe</label>
                          <select value={opt.option_group} onChange={(e) => updateOption(opt.id, { option_group: e.target.value })}
                            className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary">
                            {OPTION_GROUPS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-slate-400 mb-0.5">Type</label>
                          <select value={opt.option_type} onChange={(e) => updateOption(opt.id, { option_type: e.target.value })}
                            className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="single_choice">Choix unique</option><option value="multiple_choice">Choix multiple</option><option value="quantity">Quantité</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-slate-400 mb-0.5">Prix</label>
                          <input type="number" min={0} step={0.01} value={opt.extra_price} onChange={(e) => updateOption(opt.id, { extra_price: e.target.value })} placeholder="0" className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div className="flex gap-1">
                          <label className="text-[10px] text-slate-500 cursor-pointer flex items-center gap-0.5">
                            <input type="checkbox" checked={opt.is_included} onChange={(e) => updateOption(opt.id, { is_included: e.target.checked })} className="accent-primary w-3 h-3" /> Inclus
                          </label>
                          <label className="text-[10px] text-slate-500 cursor-pointer flex items-center gap-0.5">
                            <input type="checkbox" checked={opt.is_required} onChange={(e) => updateOption(opt.id, { is_required: e.target.checked })} className="accent-primary w-3 h-3" /> Requis
                          </label>
                        </div>
                        <button type="button" onClick={() => removeOption(opt.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                      </div>
                      {(opt.option_group === 'accommodation' || opt.option_group === 'food' || opt.option_group === 'transport') && (
                        <div className="pl-2 border-l-2 border-primary/20">
                          {opt.external_offer_item_id ? (
                            <div className="flex items-center justify-between bg-primary/5 rounded-lg px-3 py-2">
                              <div>
                                <p className="text-xs font-medium text-slate-700">{opt.external_offer_title}</p>
                                {opt.external_provider_name && (
                                  <p className="text-[10px] text-slate-400">Prestataire : {opt.external_provider_name}</p>
                                )}
                              </div>
                              <button type="button" onClick={() => updateOption(opt.id, { external_offer_item_id: null, external_offer_title: "", external_provider_name: "" })}
                                className="text-red-400 hover:text-red-600 p-1"><X size={12} /></button>
                            </div>
                          ) : (
                            <ExternalOfferSearch
                              category={opt.option_group === 'accommodation' ? 'accommodation' : opt.option_group === 'food' ? 'restaurant' : 'transport'}
                              token={token}
                              onSelect={(itemId, title, providerName) => updateOption(opt.id, {
                                external_offer_item_id: itemId,
                                external_offer_title: title,
                                external_provider_name: providerName,
                              })}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addOption} className="w-full py-2 rounded-xl border-2 border-dashed border-slate-200 text-xs text-slate-400 hover:border-primary hover:text-primary flex items-center justify-center gap-1">
                    <Plus size={14} /> Ajouter une option
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 6: Preview ───────────────────────────── */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                {images.length > 0 && (
                  <div className="relative h-48 bg-slate-200"><img src={images[0]} alt={title} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" /></div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-lg font-bold text-slate-800">{title || "Titre du circuit"}</h3>
                    {basePrice && <span className="text-primary font-bold text-lg">{Number(basePrice).toLocaleString()} {currency}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-3">
                    {region && <span className="flex items-center gap-1"><MapPin size={12} /> {region}</span>}
                    {durationDays && <span className="flex items-center gap-1"><Clock size={12} /> {durationDays} jour{durationDays !== "1" ? "s" : ""}</span>}
                    {maxParticipants && <span className="flex items-center gap-1"><Users size={12} /> Max {maxParticipants} pers.</span>}
                    {confirmationMode === "automatic" ? <span className="flex items-center gap-1 text-primary"><Check size={12} /> Confirmation instantanée</span> : <span className="flex items-center gap-1 text-amber-600"><Info size={12} /> Sur demande</span>}
                  </div>
                  {description && <p className="text-sm text-slate-600 leading-relaxed mb-3 line-clamp-3">{description}</p>}
                  {sortedDays.length > 0 && (
                    <>
                      <h4 className="font-semibold text-sm text-slate-700 flex items-center gap-1 mb-2"><Calendar size={14} /> Itinéraire</h4>
                      {sortedDays.map((day) => (
                        <div key={day.id} className="flex items-start gap-2 text-xs text-slate-600 mb-1.5">
                          <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5"><span className="text-[10px] font-bold text-primary">{day.day_number}</span></div>
                          <div className="flex-1">
                            <span className="font-medium text-slate-700">{day.title}</span>
                            {day.location_name && <span className="text-[10px] text-slate-400 ml-1">— {day.location_name}</span>}
                            {day.programItems.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {day.programItems.map((p) => <span key={p.id} className="bg-slate-100 rounded px-1.5 py-0.5 text-[10px] text-slate-500">{p.start_time || ""} {p.title}</span>)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  {options.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <h4 className="font-semibold text-xs text-slate-700 mb-1">{options.length} option{options.length > 1 ? "s" : ""}</h4>
                      <div className="flex flex-wrap gap-1">{options.map((opt) => <span key={opt.id} className="text-[10px] bg-slate-100 rounded px-1.5 py-0.5 text-slate-500">{OPTION_GROUPS.find((g) => g.value === opt.option_group)?.label || opt.option_group}{opt.extra_price ? ` (+${Number(opt.extra_price).toLocaleString()} ${currency})` : ""}</span>)}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            <div>{step > 1 && <button onClick={goBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50"><ArrowLeft size={16} /> Retour</button>}</div>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-50">Annuler</button>
              {step < TOTAL_STEPS ? (
                <button onClick={goNext} className="flex items-center gap-1 px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-emerald-600">Suivant <ArrowRight size={16} /></button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 disabled:opacity-50">
                  {submitting ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Création...</> : <><Check size={16} /> Publier le circuit</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* External Offer Modal */}
      {externalModalDayId && externalModalProgId && (() => {
        const currentDay = days.find((d) => d.id === externalModalDayId);
        const currentProg = currentDay?.programItems.find((p) => p.id === externalModalProgId);
        if (!currentDay || !currentProg) return null;
        return (
          <ExternalOfferModal
            open={true}
            onClose={() => { setExternalModalDayId(null); setExternalModalProgId(null); }}
            myOfferItems={offerItems}
            selectedMyOfferId={currentProg.linked_offer_item_id}
            onSelectMyOffer={(id, price) => {
              updateProgramItem(externalModalDayId, externalModalProgId, {
                linked_offer_item_id: id, price: price || "",
              });
            }}
            externalRef={null}
            onExternalRefChange={(ref) => {
              // Future: store external ref in prog state
            }}
            dayLat={currentDay.lat}
            dayLng={currentDay.lng}
            excludeAuthorId={user?.sub || user?.id || ""}
            dayLabel={`Jour ${currentDay.day_number} — ${currentDay.title}`}
          />
        );
      })()}
    </div>
  );
}
