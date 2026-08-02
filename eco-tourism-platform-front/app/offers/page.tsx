"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  MapPin, Clock, Users, Star, Leaf, Search, Filter, ArrowRight,
  ChevronLeft, Tag,
} from "lucide-react";
import AppNavbar from "@/components/nav/AppNavbar";
import BackToDashboard from "@/components/nav/BackToDashboard";

interface Offer {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  duration: string | null;
  offer_type: string | null;
  region: string | null;
  images: string[] | null;
  min_group_size: number | null;
  max_group_size: number | null;
  sustainability_score: number | null;
  author_id: string;
  author_type: string;
  status: string;
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

const TYPE_COLORS: Record<string, string> = {
  eco_tour: "bg-emerald-100 text-emerald-700",
  accommodation: "bg-blue-100 text-blue-700",
  activity: "bg-amber-100 text-amber-700",
  restaurant: "bg-rose-100 text-rose-700",
  craft: "bg-purple-100 text-purple-700",
  workshop: "bg-cyan-100 text-cyan-700",
  transfer: "bg-slate-100 text-slate-700",
  sejour: "bg-orange-100 text-orange-700",
  circuit: "bg-teal-100 text-teal-700",
};

export default function OffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filtered, setFiltered] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("");
  const [regions, setRegions] = useState<string[]>([]);
  const [user, setUser] = useState<{ role: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    apiFetch<Offer[]>("/offers")
      .then((data) => {
        const approved = data.filter((o) => o.status === "approved");
        setOffers(approved);
        setFiltered(approved);
        const uniqueRegions = [...new Set(approved.map((o) => o.region).filter(Boolean))] as string[];
        setRegions(uniqueRegions);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = offers;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          (o.description && o.description.toLowerCase().includes(q)) ||
          (o.region && o.region.toLowerCase().includes(q))
      );
    }
    if (typeFilter !== "all") {
      result = result.filter((o) => o.offer_type === typeFilter);
    }
    if (regionFilter) {
      result = result.filter((o) => o.region === regionFilter);
    }
    setFiltered(result);
  }, [search, typeFilter, regionFilter, offers]);

  const canReserve = user?.role === "eco_traveler";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 pb-12">
      <AppNavbar title="Catalogue des offres" />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <BackToDashboard />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Leaf size={24} className="text-primary" />
              Catalogue des offres
            </h1>
            <p className="text-sm text-slate-400">{filtered.length} offre{filtered.length !== 1 ? "s" : ""} trouvée{filtered.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une offre, région..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <option value="all">Tous les types</option>
              {Object.entries(TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          {regions.length > 0 && (
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-slate-400" />
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                <option value="">Toutes les régions</option>
                {regions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Leaf size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucune offre trouvée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                canReserve={canReserve}
                onReserve={() => router.push(`/reservations/new?offerId=${offer.id}`)}
                onDetail={() => router.push(`/offers/${offer.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OfferCard({
  offer,
  canReserve,
  onReserve,
  onDetail,
}: {
  offer: Offer;
  canReserve: boolean;
  onReserve: () => void;
  onDetail: () => void;
}) {
  const typeColor = TYPE_COLORS[offer.offer_type ?? ""] ?? "bg-slate-100 text-slate-600";
  const typeLabel = TYPE_LABELS[offer.offer_type ?? ""] ?? offer.offer_type ?? "Autre";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="h-44 bg-gradient-to-br from-emerald-100 to-teal-200 relative overflow-hidden">
        {offer.images?.[0] ? (
          <img
            src={offer.images[0]}
            alt={offer.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Leaf size={40} className="text-emerald-400 opacity-50" />
          </div>
        )}
        {offer.sustainability_score !== null && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 text-xs font-bold text-primary">
            <Star size={11} fill="currentColor" />
            {offer.sustainability_score}
          </div>
        )}
        {offer.offer_type && (
          <div className={`absolute top-3 left-3 rounded-full px-2 py-1 text-xs font-semibold ${typeColor}`}>
            {typeLabel}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-slate-800 text-base mb-1 line-clamp-1">{offer.title}</h3>
        {offer.description && (
          <p className="text-slate-500 text-sm line-clamp-2 mb-3">{offer.description}</p>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-3">
          {offer.region && (
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {offer.region}
            </span>
          )}
          {offer.duration && (
            <span className="flex items-center gap-1">
              <Clock size={11} /> {offer.duration}
            </span>
          )}
          {(offer.min_group_size || offer.max_group_size) && (
            <span className="flex items-center gap-1">
              <Users size={11} />
              {offer.min_group_size && offer.max_group_size
                ? `${offer.min_group_size}–${offer.max_group_size} pers.`
                : offer.max_group_size
                ? `Max ${offer.max_group_size} pers.`
                : `Min ${offer.min_group_size} pers.`}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div>
            {offer.price !== null ? (
              <span className="text-primary font-bold text-lg">
                {Number(offer.price).toFixed(0)} <span className="text-sm font-normal text-slate-400">TND/pers.</span>
              </span>
            ) : (
              <span className="text-slate-400 text-sm">Prix non défini</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onDetail}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Détails
            </button>
            {canReserve && (
              <button
                onClick={onReserve}
                className="text-xs px-3 py-1.5 rounded-xl bg-primary text-white font-semibold hover:bg-emerald-600 flex items-center gap-1"
              >
                Réserver <ArrowRight size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
