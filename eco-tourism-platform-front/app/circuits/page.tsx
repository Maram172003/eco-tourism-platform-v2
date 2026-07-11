"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  MapPin, Clock, Calendar, Leaf, Filter, Search, ChevronRight, DollarSign, ImageOff,
} from "lucide-react";
import AppNavbar from "@/components/nav/AppNavbar";
import BackToDashboard from "@/components/nav/BackToDashboard";
import governorates from "@/lib/tunisia-governorates.json";

const REGION_NAMES = governorates.map((g) => g.name);

interface Circuit {
  id: string;
  title: string;
  description: string | null;
  base_price: number | null;
  duration_days: number | null;
  region: string | null;
  max_participants: number | null;
  status: string;
  difficulty_level: string | null;
  images?: string[] | null;
  days?: CircuitDay[];
  options?: CircuitOption[];
}

interface CircuitDay {
  id: string;
  day_number: number;
  title: string;
  description: string | null;
  date: string | null;
}

interface CircuitOption {
  id: string;
  option_group: string | null;
  option_type: string;
  extra_price: number | null;
  is_included: boolean;
  is_required: boolean;
  status: string;
}

export default function CircuitsPage() {
  const router = useRouter();
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");

  useEffect(() => {
    apiFetch<Circuit[]>("/circuits")
      .then((data) => {
        setCircuits(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = circuits.filter((c) => {
    const matchesRegion = !regionFilter || (c.region && c.region.toLowerCase() === regionFilter.toLowerCase());
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      c.title.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      (c.region && c.region.toLowerCase().includes(q));
    return matchesRegion && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 pb-12">
      <AppNavbar title="Circuits" />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <BackToDashboard />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Leaf size={24} className="text-primary" />
              Circuits
            </h1>
            <p className="text-slate-400 text-sm">{filtered.length} circuit{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un circuit, région..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
          <div className="flex items-center gap-2">
              <Filter size={15} className="text-slate-400" />
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                <option value="">Toutes les régions</option>
                {REGION_NAMES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
            <MapPin size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">Aucun circuit trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((circuit) => {
              const hasImages = circuit.images && circuit.images.length > 0;
              return (
                <button
                  key={circuit.id}
                  onClick={() => router.push(`/circuits/${circuit.id}`)}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden text-left hover:shadow-md transition-shadow group"
                >
                  <div className="h-40 bg-gradient-to-br from-emerald-100 to-teal-200 relative overflow-hidden">
                    {hasImages ? (
                      <img
                        src={circuit.images![0]}
                        alt={circuit.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Leaf size={40} className="text-emerald-400 opacity-50" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 group-hover:text-primary transition-colors">
                      {circuit.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-2">
                      {circuit.difficulty_level && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${circuit.difficulty_level === "easy" ? "bg-emerald-100 text-emerald-700" : circuit.difficulty_level === "moderate" ? "bg-amber-100 text-amber-700" : circuit.difficulty_level === "hard" ? "bg-red-100 text-red-700" : "bg-slate-800 text-white"}`}>
                          {circuit.difficulty_level === "easy" ? "🟢 Facile" : circuit.difficulty_level === "moderate" ? "🟡 Modéré" : circuit.difficulty_level === "hard" ? "🔴 Difficile" : "⚫ Expert"}
                        </span>
                      )}
                      {circuit.duration_days && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {circuit.duration_days} jour{circuit.duration_days > 1 ? "s" : ""}
                        </span>
                      )}
                      {circuit.region && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {circuit.region}
                        </span>
                      )}
                      {circuit.days && circuit.days.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {circuit.days.length} étape{circuit.days.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    {circuit.description && (
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">{circuit.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                      {circuit.base_price !== null ? (
                        <span className="font-bold text-emerald-600 text-sm flex items-center gap-1">
                          <DollarSign size={14} />
                          {Number(circuit.base_price).toLocaleString()} TND
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Prix non défini</span>
                      )}
                      <span className="text-xs text-emerald-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Voir détails <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
