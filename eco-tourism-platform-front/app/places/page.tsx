"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  MapPin, TrendingUp, Flame, Leaf, ArrowLeft, Tag, Star, Plus,
} from "lucide-react";
import AppNavbar from "@/components/nav/AppNavbar";
import BackToDashboard from "@/components/nav/BackToDashboard";

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
  status: string;
  created_at: string;
}

const CATEGORIES = [
  { value: "", label: "Tous" },
  { value: "nature", label: "Nature" },
  { value: "plage", label: "Plage" },
  { value: "monument", label: "Monument" },
  { value: "musée", label: "Musée" },
  { value: "restaurant", label: "Restaurant" },
  { value: "hébergement", label: "Hébergement" },
  { value: "artisanat", label: "Artisanat" },
  { value: "aventure", label: "Aventure" },
];

export default function PlacesPage() {
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token") || localStorage.getItem("access_token"));
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = category
      ? `/publications/places/category/${category}?limit=50`
      : "/publications/places/trending?limit=50";
    apiFetch<Place[]>(url)
      .then(setPlaces)
      .catch(() => setPlaces([]))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 pb-12">
      <AppNavbar title="Lieux populaires" />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <BackToDashboard />

        <div className="flex items-center gap-3 mb-6">
          <TrendingUp size={24} className="text-primary" />
          <h1 className="text-2xl font-bold text-slate-800">Lieux populaires</h1>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                category === cat.value
                  ? "bg-primary text-white"
                  : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <MapPin size={48} className="mx-auto mb-3 opacity-50" />
            <p>Aucun lieu trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {places.map((place) => (
              <Link
                key={place.id}
                href={`/places/${place.id}`}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="h-40 bg-slate-100 relative overflow-hidden">
                  {place.images?.[0] ? (
                    <img
                      src={place.images[0]}
                      alt={place.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center">
                      <MapPin size={36} className="text-emerald-300" />
                    </div>
                  )}
                  {place.category && (
                    <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-slate-600 rounded-full px-2 py-0.5 flex items-center gap-1">
                      <Tag size={10} /> {place.category}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{place.title}</h3>
                    <span className="flex items-center gap-0.5 text-xs font-semibold text-primary shrink-0">
                      <Flame size={12} /> {place.popularity_score}
                    </span>
                  </div>
                  {(place.place_name || place.region) && (
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin size={10} /> {place.place_name}{place.place_name && place.region ? ", " : ""}{place.region}
                    </p>
                  )}
                  {place.description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{place.description}</p>
                  )}
                  {place.tags && place.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {place.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] text-slate-400 bg-slate-50 rounded-full px-1.5 py-0.5">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {token && (
        <button
          onClick={() => router.push("/profile/ecovoyageur")}
          className="fixed bottom-6 right-6 z-40 bg-primary hover:bg-primary/90 active:scale-95 text-white font-bold px-5 py-3.5 rounded-2xl shadow-lg hover:shadow-xl inline-flex items-center gap-2 transition-all"
        >
          <Plus size={18} strokeWidth={3} />
          Recommander un lieu
        </button>
      )}
    </div>
  );
}
