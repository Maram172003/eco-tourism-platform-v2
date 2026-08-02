"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Search, ShoppingCart, Plus, Loader2, MapPin, Check, LayoutGrid, Map, SlidersHorizontal, X, Leaf, Eye, EyeOff, Flame } from "lucide-react";
import { apiFetch } from "@/lib/api";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => <div className="h-full bg-slate-100 animate-pulse rounded-2xl" />,
});

interface OfferItem {
  id: string;
  offer_id: string;
  name: string;
  item_type: string | null;
  latitude: number | null;
  longitude: number | null;
  region: string | null;
  prices: { price: number; currency: string; pricing_unit: string }[];
  offer_title?: string;
}

interface Circuit {
  id: string;
  title: string;
  region: string | null;
  lat: number | null;
  lng: number | null;
  base_price: number | null;
  currency: string;
  duration_days: number | null;
  difficulty_level: string | null;
  waypoints: string | null;
}

interface Place {
  id: string;
  title: string;
  description: string | null;
  images: string[] | null;
  latitude: number | null;
  longitude: number | null;
  place_name: string | null;
  region: string | null;
  category: string | null;
  tags: string[] | null;
  popularity_score: number;
}

const ITEM_TYPE_ICONS: Record<string, string> = {
  activity: "🚴", accommodation: "🏨", meal: "🍽️", transport: "🚐", workshop: "🎨",
  event: "🎪", guided_tour: "🧭", equipment: "🎿", equipment_rental: "🎿",
  kayak: "🛶", paddle: "🏄", trekking: "🥾", vtt: "🚲", escalade: "🧗", tyrolienne: "🪢",
  speleologie: "🕳️", randonnee: "🥾", equitation: "🐴", observation: "🐦", astronomie: "🔭",
  photographie: "📷", yoga: "🧘", meditation: "🧘", poterie: "🏺", tissage: "🧶",
  cuisine: "🍲", musique: "🎵", calligraphie: "✍️", other: "📌",
  room: "🛏️", bed: "🛏️", camping_space: "⛺", dish: "🍲", menu: "📋",
  transport_service: "🚐", hiking: "🥾", water_sport: "🏄",
  festival: "🎪", concert: "🎵", conference: "🎤", celebration: "🥳",
  exposition: "🖼️", food_tasting: "🍷", product: "🏺", package: "🎁",
  all_inclusive: "⭐", bijouterie: "💍", craft: "🏺",
};

const PRICING_LABELS: Record<string, string> = {
  per_person: "/pers", per_night: "/nuit", per_hour: "/h",
  per_half_day: "/½j", per_day: "/jour", per_person_per_night: "/pers/nuit",
  per_room_per_night: "/chambre/nuit", per_bed: "/lit",
};

const PRICE_RANGES = [
  { label: "Tous", min: 0, max: Infinity },
  { label: "0–50 TND", min: 0, max: 50 },
  { label: "50–100 TND", min: 50, max: 100 },
  { label: "100–300 TND", min: 100, max: 300 },
  { label: "300+ TND", min: 300, max: Infinity },
];

const TYPE_FILTERS = [
  { value: "all", label: "Tout", icon: "🌍" },
  { value: "outdoor", label: "Outdoor", icon: "🚴" },
  { value: "nature", label: "Nature", icon: "🌿" },
  { value: "culture", label: "Culture", icon: "🎭" },
  { value: "hebergement", label: "Hébergement", icon: "🏨" },
  { value: "restaurant", label: "Restaurant", icon: "🍽️" },
  { value: "transport", label: "Transport", icon: "🚐" },
  { value: "event", label: "Événement", icon: "🎪" },
  { value: "workshop", label: "Atelier", icon: "🎨" },
  { value: "circuit", label: "Circuits", icon: "🗺️" },
] as const;

const OUTDOOR_TYPES = ["activity", "kayak", "paddle", "trekking", "vtt", "escalade", "tyrolienne", "speleologie", "randonnee", "equitation"];
const NATURE_TYPES = ["observation", "astronomie", "photographie"];
const CULTURE_TYPES = ["yoga", "meditation", "poterie", "tissage", "cuisine", "musique", "calligraphie", "workshop"];
const EVENT_TYPES = ["event", "activity", "guided_tour"];
const HEBERGEMENT_TYPES = ["accommodation", "room", "bed", "camping_space"];
const RESTAURANT_TYPES = ["meal", "dish", "menu"];
const TRANSPORT_TYPES = ["transport", "transport_service"];

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function getGuestCart(): any[] {
  try { return JSON.parse(localStorage.getItem("guest_cart") || "[]"); }
  catch { return []; }
}

function saveGuestCart(items: any[]) {
  localStorage.setItem("guest_cart", JSON.stringify(items));
}

function getItemCategories(type: string | null): string[] {
  if (!type) return [];
  const cats: string[] = [];
  if (OUTDOOR_TYPES.includes(type)) cats.push("outdoor");
  if (NATURE_TYPES.includes(type)) cats.push("nature");
  if (CULTURE_TYPES.includes(type)) cats.push("culture");
  if (EVENT_TYPES.includes(type)) cats.push("event");
  if (HEBERGEMENT_TYPES.includes(type)) cats.push("hebergement");
  if (RESTAURANT_TYPES.includes(type)) cats.push("restaurant");
  if (TRANSPORT_TYPES.includes(type)) cats.push("transport");
  if (type === "workshop") cats.push("workshop");
  return cats;
}

export default function ExplorePage() {
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdded, setShowAdded] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartIds, setCartIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"split" | "map" | "grid">("split");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState(0);
  const [selectedItem, setSelectedItem] = useState<OfferItem | Circuit | Place | null>(null);
  const [showOffers, setShowOffers] = useState(true);
  const [showCircuits, setShowCircuits] = useState(true);
  const [places, setPlaces] = useState<Place[]>([]);
  const [showPlaces, setShowPlaces] = useState(true);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [guides, setGuides] = useState<any[]>([]);
  const [showGuides, setShowGuides] = useState(false);
  const [guideSearchQuery, setGuideSearchQuery] = useState("");
  const [guideLanguage, setGuideLanguage] = useState("");
  const [guideMaxPrice, setGuideMaxPrice] = useState("");
  const [guideDate, setGuideDate] = useState("");
  const [loadingGuides, setLoadingGuides] = useState(false);

  async function fetchGuides() {
    setLoadingGuides(true);
    try {
      const params = new URLSearchParams();
      if (guideSearchQuery.trim()) params.set("q", guideSearchQuery.trim());
      if (guideLanguage.trim()) params.set("language", guideLanguage.trim());
      if (guideMaxPrice.trim()) { const v = parseFloat(guideMaxPrice); if (!isNaN(v)) params.set("max_price", String(v)); }
      if (guideDate) params.set("date", guideDate);
      const qs = params.toString();
      const data = await apiFetch<any[]>(`/guide/search${qs ? `?${qs}` : ""}`);
      setGuides(data ?? []);
    } catch { setGuides([]); }
    finally { setLoadingGuides(false); }
  }

  useEffect(() => {
    const cart = getGuestCart();
    setCartCount(cart.length);
    setCartIds(new Set(cart.map((i: any) => `${i.type}:${i.ref_id}`)));
    loadData();
    fetchGuides();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchGuides(), 300);
    return () => clearTimeout(timer);
  }, [guideSearchQuery, guideLanguage, guideMaxPrice, guideDate]);

  async function addToCart(type: "offer_item" | "circuit", id: string, name?: string, unitPrice?: number | null, currency?: string) {
    if (!isValidUUID(id)) return;
    setAdding(id);
    try {
      const cart = getGuestCart();
      const existing = cart.find((i: any) => i.type === type && i.ref_id === id);
      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
      } else {
        cart.push({ id: crypto.randomUUID(), type, ref_id: id, name: name ?? "", unit_price: unitPrice ?? null, currency: currency ?? "TND", quantity: 1, added_at: new Date().toISOString() });
      }
      saveGuestCart(cart);
      setCartCount(cart.length);
      setCartIds(new Set(cart.map((i: any) => `${i.type}:${i.ref_id}`)));
      setShowAdded(true);
      setTimeout(() => setShowAdded(false), 2000);
    } catch (e) { console.error("Add to cart error:", e); }
    finally { setAdding(null); }
  }

  async function loadData() {
    setLoading(true);
    try {
      const [offersData, circuitsData] = await Promise.all([
        apiFetch<any[]>("/offers").catch(() => []),
        apiFetch<any[]>("/circuits").catch(() => []),
      ]);
      const enrichedOffers: OfferItem[] = [];
      for (const offer of offersData ?? []) {
        if (!offer.latitude && !offer.longitude) continue;
        const items = await apiFetch<any[]>(`/offers/${offer.id}/items`).catch(() => []);
        for (const item of items ?? []) {
          if (!isValidUUID(item.id)) continue;
          enrichedOffers.push({
            id: item.id, offer_id: offer.id, name: item.name, item_type: item.item_type,
            latitude: offer.latitude ?? null, longitude: offer.longitude ?? null,
            region: offer.region ?? null, prices: item.prices ?? [], offer_title: offer.title,
          });
        }
      }
      setOffers(enrichedOffers);
      setCircuits((circuitsData ?? []).filter((c: any) => isValidUUID(c.id)).map((c: any) => ({
        id: c.id, title: c.title, region: c.region ?? null, lat: c.lat ?? null, lng: c.lng ?? null,
        base_price: c.base_price ?? null, currency: c.currency ?? "TND", duration_days: c.duration_days ?? null,
        difficulty_level: c.difficulty_level ?? null, waypoints: c.waypoints ?? null,
      })));
      setLoadingPlaces(true);
      apiFetch<Place[]>("/publications/places?limit=100").then(setPlaces).catch(() => {}).finally(() => setLoadingPlaces(false));
    } catch {} finally { setLoading(false); }
  }

  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      if (searchQuery && !o.name.toLowerCase().includes(searchQuery.toLowerCase()) && !o.region?.toLowerCase().includes(searchQuery.toLowerCase()) && !o.offer_title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (typeFilter !== "all") {
        if (typeFilter === "circuit") return false;
        const cats = getItemCategories(o.item_type);
        if (!cats.includes(typeFilter)) return false;
      }
      if (priceRange > 0) {
        const p = PRICE_RANGES[priceRange];
        const price = o.prices?.[0]?.price ?? 0;
        if (price < p.min || price > p.max) return false;
      }
      return true;
    });
  }, [offers, searchQuery, typeFilter, priceRange]);

  const filteredCircuits = useMemo(() => {
    return circuits.filter((c) => {
      if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) && !c.region?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (typeFilter !== "all" && typeFilter !== "circuit") return false;
      if (priceRange > 0) {
        const p = PRICE_RANGES[priceRange];
        const price = c.base_price ?? 0;
        if (price < p.min || price > p.max) return false;
      }
      return true;
    });
  }, [circuits, searchQuery, typeFilter, priceRange]);

  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.region?.toLowerCase().includes(searchQuery.toLowerCase()) && !p.place_name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (typeFilter !== "all") {
        if (typeFilter === "place" && !p.category) return true;
        if (p.category && !["place", p.category].includes(typeFilter)) return false;
      }
      return true;
    });
  }, [places, searchQuery, typeFilter]);

  const markers = useMemo(() => [
    ...(showOffers ? filteredOffers.filter((o) => o.latitude && o.longitude).map((o) => ({ lat: o.latitude!, lng: o.longitude!, label: o.name, type: "offer" as const, id: o.offer_id })) : []),
    ...(showCircuits ? filteredCircuits.filter((c) => c.lat && c.lng).map((c) => ({ lat: c.lat!, lng: c.lng!, label: c.title, type: "circuit" as const, id: c.id })) : []),
    ...(showPlaces ? filteredPlaces.filter((p) => p.latitude && p.longitude).map((p) => ({ lat: p.latitude!, lng: p.longitude!, label: p.title, type: "place" as const, id: p.id })) : []),
    ...(showGuides ? guides.flatMap((g: any) => {
      return (g.offerings ?? []).filter((o: any) => o.lat && o.lng).map((o: any) => ({
        lat: Number(o.lat), lng: Number(o.lng), label: g.full_name ?? g.name ?? "Guide", type: "guide" as const, id: g.user_id,
      }));
    }) : []),
  ], [filteredOffers, filteredCircuits, filteredPlaces, showOffers, showCircuits, showPlaces, showGuides, guides]);

  const radii = useMemo(() => {
    if (!showGuides) return [];
    return guides.flatMap((g: any) => {
      return (g.offerings ?? []).filter((o: any) => o.lat && o.lng && o.radius_km).map((o: any) => ({
        lat: Number(o.lat), lng: Number(o.lng), radiusKm: Number(o.radius_km),
        color: "#f59e0b", label: `${g.full_name ?? "Guide"} — ${o.title ?? ""} (rayon ${o.radius_km}km)`,
      }));
    });
  }, [showGuides, guides]);

  const polylines = useMemo(() => {
    return filteredCircuits
      .filter((c) => c.waypoints)
      .map((c) => {
        try {
          const pts: [number, number][] = JSON.parse(c.waypoints!);
          return pts.filter((p) => p.length === 2 && !isNaN(p[0]) && !isNaN(p[1]));
        } catch { return []; }
      })
      .filter((pts) => pts.length > 1);
  }, [filteredCircuits]);

  const hasActiveFilters = typeFilter !== "all" || priceRange > 0 || guideSearchQuery.trim() !== "" || guideLanguage.trim() !== "" || guideMaxPrice.trim() !== "" || guideDate !== "";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <h1 className="text-xl font-black text-slate-900">Explorer</h1>
          <div className="flex items-center gap-2">
            {/* View mode toggles */}
            <div className="hidden sm:flex bg-slate-100 rounded-xl overflow-hidden">
              <button onClick={() => setViewMode("split")} className={`p-2 ${viewMode === "split" ? "bg-white shadow-sm text-primary" : "text-slate-400"}`} title="Split">
                <LayoutGrid size={16} />
              </button>
              <button onClick={() => setViewMode("map")} className={`p-2 ${viewMode === "map" ? "bg-white shadow-sm text-primary" : "text-slate-400"}`} title="Map">
                <Map size={16} />
              </button>
              <button onClick={() => setViewMode("grid")} className={`p-2 ${viewMode === "grid" ? "bg-white shadow-sm text-primary" : "text-slate-400"}`} title="Grid">
                <LayoutGrid size={16} />
              </button>
            </div>
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`p-2 rounded-xl text-sm font-bold transition-colors ${showHeatmap ? "bg-primary text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"}`}
              title="Carte de chaleur"
            >
              🔥
            </button>
            <div className="hidden sm:flex bg-slate-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowOffers(!showOffers)}
                className={`flex items-center gap-1 px-2.5 py-2 text-xs font-bold transition-colors ${showOffers ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600"}`}
                title="Afficher les offres"
              >
                {showOffers ? <Eye size={14} /> : <EyeOff size={14} />} Offres
              </button>
              <button
                onClick={() => setShowCircuits(!showCircuits)}
                className={`flex items-center gap-1 px-2.5 py-2 text-xs font-bold transition-colors ${showCircuits ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600"}`}
                title="Afficher les circuits"
              >
                {showCircuits ? <Eye size={14} /> : <EyeOff size={14} />} Circuits
              </button>
              <button
                onClick={() => setShowPlaces(!showPlaces)}
                className={`flex items-center gap-1 px-2.5 py-2 text-xs font-bold transition-colors ${showPlaces ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600"}`}
                title="Afficher les lieux"
              >
                {showPlaces ? <Eye size={14} /> : <EyeOff size={14} />} Lieux
              </button>
              <button
                onClick={() => setShowGuides(!showGuides)}
                className={`flex items-center gap-1 px-2.5 py-2 text-xs font-bold transition-colors ${showGuides ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600"}`}
                title="Afficher les guides"
              >
                {loadingGuides ? <Loader2 size={12} className="animate-spin" /> : showGuides ? <Eye size={14} /> : <EyeOff size={14} />} Guides
              </button>
            </div>
            <a href="/cart" className="relative flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50">
              <ShoppingCart size={16} />
              {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>}
            </a>
          </div>
        </div>
      </div>

          {/* Search + Filters */}
          <div className="bg-white border-b border-slate-100 px-4 py-3">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm" placeholder="Rechercher une activité, un lieu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-bold transition-colors ${showFilters || hasActiveFilters ? "bg-primary text-white border-primary" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                  <SlidersHorizontal size={14} />
                  Filtres
                  {hasActiveFilters && <span className="w-4 h-4 bg-white text-primary text-[9px] rounded-full flex items-center justify-center">!</span>}
                </button>
              </div>

          {/* Layer toggles (mobile) */}
          <div className="flex sm:hidden items-center gap-1.5 mt-2">
            <button onClick={() => setShowOffers(!showOffers)} className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${showOffers ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"}`}>📦 Offres</button>
            <button onClick={() => setShowCircuits(!showCircuits)} className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${showCircuits ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"}`}>🗺️ Circuits</button>
            <button onClick={() => setShowPlaces(!showPlaces)} className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${showPlaces ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"}`}>📍 Lieux</button>
            <button onClick={() => setShowGuides(!showGuides)} className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${showGuides ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"}`}>
              {loadingGuides ? <Loader2 size={10} className="animate-spin inline" /> : "🧑‍🏫"} Guides
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Filtres</span>
                {hasActiveFilters && (
                  <button onClick={() => { setTypeFilter("all"); setPriceRange(0); setGuideSearchQuery(""); setGuideLanguage(""); setGuideMaxPrice(""); setGuideDate(""); }} className="text-[10px] text-primary font-medium hover:underline">Réinitialiser tout</button>
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Type</span>
                <div className="flex flex-wrap gap-1.5">
                  {TYPE_FILTERS.map((t) => (
                    <button key={t.value} onClick={() => setTypeFilter(t.value)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${typeFilter === t.value ? "bg-primary text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-primary/30"}`}>
                      <span>{t.icon}</span> {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Prix (offres & circuits)</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRICE_RANGES.map((p, i) => (
                    <button key={i} onClick={() => setPriceRange(i)} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${priceRange === i ? "bg-primary text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-primary/30"}`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {showGuides && (
                <div className="border-t border-slate-200 pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Filtres guides</span>
                    {(guideSearchQuery || guideLanguage || guideMaxPrice || guideDate) && (
                      <button onClick={() => { setGuideSearchQuery(""); setGuideLanguage(""); setGuideMaxPrice(""); setGuideDate(""); }} className="text-[10px] text-primary font-medium hover:underline">Réinitialiser</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Nom du guide</label>
                      <input className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs" placeholder="Rechercher un guide..." value={guideSearchQuery} onChange={(e) => setGuideSearchQuery(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Langue</label>
                      <input className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs" placeholder="Français, Anglais..." value={guideLanguage} onChange={(e) => setGuideLanguage(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Prix max (TND)</label>
                      <input type="number" min="0" className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs" placeholder="Ex: 200" value={guideMaxPrice} onChange={(e) => setGuideMaxPrice(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Disponibilité</label>
                      <input type="date" className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs" value={guideDate} onChange={(e) => setGuideDate(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {showAdded && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-xl z-50 flex items-center gap-2">
          <ShoppingCart size={16} /> Ajouté au panier !
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {viewMode === "split" && (
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Map */}
            <div className="lg:w-1/2 h-[400px] lg:h-[calc(100vh-200px)] rounded-2xl overflow-hidden border border-slate-100 sticky top-20">
              {loading ? (
                <div className="h-full bg-slate-100 animate-pulse flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
              ) : markers.length > 0 ? (
                <MapView lat={markers[0].lat} lng={markers[0].lng} markers={markers} height="100%" showHeatmap={showHeatmap} polylines={polylines} radii={radii} layerVisibility={{ offers: showOffers, circuits: showCircuits, places: showPlaces, guides: showGuides }} />
              ) : (
                <div className="h-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm">Aucune localisation</div>
              )}
            </div>
            {/* Cards */}
            <div className="lg:w-1/2 space-y-3">
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">{filteredOffers.length + filteredCircuits.length + filteredPlaces.length + (showGuides ? guides.length : 0)} résultat{(filteredOffers.length + filteredCircuits.length + filteredPlaces.length + (showGuides ? guides.length : 0)) !== 1 ? "s" : ""}{loadingGuides && <Loader2 size={10} className="animate-spin" />}</p>
              <ExploreCards offers={showOffers ? filteredOffers : []} circuits={showCircuits ? filteredCircuits : []} places={showPlaces ? filteredPlaces : []} guides={showGuides ? guides : []} cartIds={cartIds} adding={adding} onAdd={addToCart} onSelect={setSelectedItem} />
            </div>
          </div>
        )}

        {viewMode === "map" && (
          <div className="h-[calc(100vh-180px)] rounded-2xl overflow-hidden border border-slate-100">
            {loading ? (
              <div className="h-full bg-slate-100 animate-pulse flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
            ) : markers.length > 0 ? (
              <MapView lat={markers[0].lat} lng={markers[0].lng} markers={markers} height="100%" showHeatmap={showHeatmap} polylines={polylines} radii={radii} layerVisibility={{ offers: showOffers, circuits: showCircuits, places: showPlaces, guides: showGuides }} />
            ) : (
              <div className="h-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm">Aucune localisation</div>
            )}
          </div>
        )}

        {viewMode === "grid" && (
          <div>
            <p className="text-xs text-slate-400 font-medium mb-3 flex items-center gap-1.5">{filteredOffers.length + filteredCircuits.length + filteredPlaces.length + (showGuides ? guides.length : 0)} résultat{(filteredOffers.length + filteredCircuits.length + filteredPlaces.length + (showGuides ? guides.length : 0)) !== 1 ? "s" : ""}{loadingGuides && <Loader2 size={10} className="animate-spin" />}</p>
            <ExploreCards offers={showOffers ? filteredOffers : []} circuits={showCircuits ? filteredCircuits : []} places={showPlaces ? filteredPlaces : []} guides={showGuides ? guides : []} cartIds={cartIds} adding={adding} onAdd={addToCart} onSelect={setSelectedItem} />
          </div>
        )}
      </div>

      {/* Mobile selected item detail */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center lg:hidden" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
            {"name" in selectedItem ? (
              <OfferCard item={selectedItem as OfferItem} cartIds={cartIds} adding={adding} onAdd={addToCart} />
            ) : "title" in selectedItem && "category" in selectedItem ? (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-emerald-500" />
                  <h3 className="font-bold text-slate-800">{(selectedItem as Place).title}</h3>
                </div>
                <p className="text-xs text-slate-500 mb-3">{(selectedItem as Place).description}</p>
                <a href={`/places/${(selectedItem as Place).id}`} className="block w-full text-center py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-colors" onClick={(e) => e.stopPropagation()}>
                  Voir le lieu
                </a>
              </div>
            ) : (
              <CircuitCard item={selectedItem as Circuit} cartIds={cartIds} adding={adding} onAdd={addToCart} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ExploreCards({ offers, circuits, places, guides, cartIds, adding, onAdd, onSelect }: {
  offers: OfferItem[]; circuits: Circuit[]; places: Place[]; guides: any[]; cartIds: Set<string>; adding: string | null;
  onAdd: (type: "offer_item" | "circuit", id: string, name?: string, unitPrice?: number | null, currency?: string) => void;
  onSelect: (item: OfferItem | Circuit | Place) => void;
}) {
  if (!offers.length && !circuits.length && !places.length && !guides.length) {
    return (
      <div className="text-center py-16 text-slate-400">
        <Search size={40} className="mx-auto mb-3 opacity-30" />
        <p className="font-medium">Aucun résultat</p>
        <p className="text-sm mt-1">Essayez de modifier vos filtres</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {places.map((place) => (
        <a key={place.id} href={`/places/${place.id}`} className="block bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
          <PlaceCard place={place} />
        </a>
      ))}
      {guides.map((guide: any) => (
        <a key={guide.user_id} href={`/profile/guide/${guide.user_id}`} className="block bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
          <GuideCard guide={guide} />
        </a>
      ))}
      {offers.map((item) => (
        <div key={item.id} className="bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect(item)}>
          <OfferCard item={item} cartIds={cartIds} adding={adding} onAdd={onAdd} />
        </div>
      ))}
      {circuits.map((circuit) => (
        <div key={circuit.id} className="bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect(circuit)}>
          <CircuitCard item={circuit} cartIds={cartIds} adding={adding} onAdd={onAdd} />
        </div>
      ))}
    </div>
  );
}

function GuideCard({ guide }: { guide: any }) {
  const offeringCount = guide.offerings?.length ?? 0;
  const minPrice = guide.offerings?.reduce?.((min: number, o: any) => o.price != null && (min === 0 || o.price < min) ? o.price : min, 0) ?? 0;
  const languages = guide.offerings?.[0]?.languages ?? guide.languages_spoken ?? [];
  return (
    <div className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-lg shrink-0">
          {guide.photo ? <img src={guide.photo} alt="" className="w-10 h-10 rounded-xl object-cover" /> : <span className="text-amber-600 font-bold">G</span>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-slate-800 truncate">{guide.full_name ?? guide.name ?? "Guide"}</p>
          {guide.zone && <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={9} /> {guide.zone}</p>}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {guide.guide_type && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full font-medium">{guide.guide_type}</span>}
            {guide.sustainability_score != null && <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full font-medium">🌿 {guide.sustainability_score}</span>}
            {offeringCount > 0 && <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full font-medium">{offeringCount} prestation{offeringCount > 1 ? "s" : ""}</span>}
            {languages.length > 0 && (typeof languages === 'string' ? [languages] : languages).slice(0, 3).map((lang: string, i: number) => (
              <span key={i} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full font-medium">{lang}</span>
            ))}
          </div>
        </div>
        <div className="text-right shrink-0">
          {minPrice > 0 && <p className="text-sm font-black text-amber-600">{Number(minPrice).toLocaleString()} TND</p>}
        </div>
      </div>
    </div>
  );
}

function PlaceCard({ place }: { place: Place }) {
  return (
    <div className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-lg shrink-0">
          <MapPin size={18} className="text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-slate-800 hover:text-primary transition-colors truncate">{place.title}</p>
          {(place.place_name || place.region) && (
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin size={9} /> {place.place_name}{place.place_name && place.region ? ", " : ""}{place.region}
            </p>
          )}
          {place.description && (
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{place.description}</p>
          )}
          {place.category && (
            <span className="inline-block mt-1.5 text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full font-medium">{place.category}</span>
          )}
        </div>
        {place.popularity_score > 0 && (
          <div className="text-right shrink-0">
            <p className="text-xs font-bold text-primary flex items-center gap-0.5"><Flame size={11} /> {place.popularity_score}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function OfferCard({ item, cartIds, adding, onAdd }: { item: OfferItem; cartIds: Set<string>; adding: string | null; onAdd: (type: "offer_item" | "circuit", id: string, name?: string, unitPrice?: number | null, currency?: string) => void }) {
  const inCart = cartIds.has(`offer_item:${item.id}`);
  const icon = ITEM_TYPE_ICONS[item.item_type ?? ""] ?? "📌";
  const pricingUnit = item.prices?.[0]?.pricing_unit;
  const pricingLabel = pricingUnit ? PRICING_LABELS[pricingUnit] ?? "" : "";

  return (
    <div className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <a href={`/offers/${item.offer_id}`} className="block" onClick={(e) => e.stopPropagation()}>
            <p className="font-bold text-sm text-slate-800 hover:text-primary transition-colors truncate">{item.name}</p>
          </a>
          {item.offer_title && <p className="text-[11px] text-slate-400 truncate">{item.offer_title}</p>}
          <div className="flex items-center gap-2 mt-1">
            {item.region && <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><MapPin size={9} /> {item.region}</span>}
            {item.item_type && <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full font-medium">{item.item_type}</span>}
          </div>
        </div>
        <div className="text-right shrink-0">
          {item.prices?.length > 0 && (
            <div>
              <p className="text-sm font-black text-primary">{Number(item.prices[0].price).toLocaleString()} <span className="text-[10px] font-medium">{item.prices[0].currency ?? "TND"}</span></p>
              {pricingLabel && <p className="text-[9px] text-slate-400">{pricingLabel}</p>}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3">
        <button
          onClick={(e) => { e.stopPropagation(); if (!inCart) onAdd("offer_item", item.id, item.name, item.prices?.[0]?.price ?? null, item.prices?.[0]?.currency ?? "TND"); }}
          disabled={adding === item.id || inCart}
          className={`w-full py-2 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
            inCart ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default" : "bg-primary text-white hover:bg-emerald-600 disabled:opacity-50"
          }`}
        >
          {inCart ? <><Check size={12} /> Déjà en panier</> : adding === item.id ? <><Loader2 size={12} className="animate-spin" /> Ajout...</> : <><Plus size={12} /> Ajouter au panier</>}
        </button>
      </div>
    </div>
  );
}

function CircuitCard({ item, cartIds, adding, onAdd }: { item: Circuit; cartIds: Set<string>; adding: string | null; onAdd: (type: "offer_item" | "circuit", id: string, name?: string, unitPrice?: number | null, currency?: string) => void }) {
  const inCart = cartIds.has(`circuit:${item.id}`);

  return (
    <div className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-lg shrink-0">🗺️</div>
        <div className="flex-1 min-w-0">
          <a href={`/circuits/${item.id}`} className="block" onClick={(e) => e.stopPropagation()}>
            <p className="font-bold text-sm text-slate-800 hover:text-primary transition-colors truncate">{item.title}</p>
          </a>
          <div className="flex items-center gap-2 mt-1">
            {item.difficulty_level && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.difficulty_level === "easy" ? "bg-emerald-100 text-emerald-700" : item.difficulty_level === "moderate" ? "bg-amber-100 text-amber-700" : item.difficulty_level === "hard" ? "bg-red-100 text-red-700" : "bg-slate-800 text-white"}`}>
                {item.difficulty_level === "easy" ? "🟢 Facile" : item.difficulty_level === "moderate" ? "🟡 Modéré" : item.difficulty_level === "hard" ? "🔴 Difficile" : "⚫ Expert"}
              </span>
            )}
            {item.region && <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><MapPin size={9} /> {item.region}</span>}
            {item.duration_days && <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full font-medium">{item.duration_days}j</span>}
          </div>
        </div>
        <div className="text-right shrink-0">
          {item.base_price != null && (
            <p className="text-sm font-black text-primary">{Number(item.base_price).toLocaleString()} <span className="text-[10px] font-medium">{item.currency}</span></p>
          )}
        </div>
      </div>
      <div className="mt-3">
        <button
          onClick={(e) => { e.stopPropagation(); if (!inCart) onAdd("circuit", item.id, item.title, item.base_price, item.currency); }}
          disabled={adding === item.id || inCart}
          className={`w-full py-2 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
            inCart ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default" : "bg-primary text-white hover:bg-emerald-600 disabled:opacity-50"
          }`}
        >
          {inCart ? <><Check size={12} /> Déjà en panier</> : adding === item.id ? <><Loader2 size={12} className="animate-spin" /> Ajout...</> : <><Plus size={12} /> Ajouter au panier</>}
        </button>
      </div>
    </div>
  );
}
