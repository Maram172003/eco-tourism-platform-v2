"use client";

import { useEffect, useState } from "react";
import { ArrowRight, MapPin, Clock, Calendar, Users, Loader2, Leaf } from "lucide-react";
import Link from "next/link";

interface Circuit {
  id: string;
  title: string;
  description: string | null;
  base_price: number | null;
  duration_days: number | null;
  region: string | null;
  status: string;
  images: string[] | null;
  max_participants: number | null;
  difficulty_level: string | null;
}

const REGION_COLORS: Record<string, string> = {
  Djerba: "from-emerald-500 to-blue-600",
  Tataouine: "from-amber-500 to-orange-600",
  Kairouan: "from-purple-500 to-indigo-600",
  Sousse: "from-emerald-500 to-teal-600",
};

const REGION_IMAGES: Record<string, string> = {
  Djerba: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80",
  Tataouine: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&q=80",
  Kairouan: "https://images.unsplash.com/photo-1548018560-c7196e4f220b?w=600&q=80",
  Sousse: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
};

function CircuitCard({ circuit }: { circuit: Circuit }) {
  const region = circuit.region || "Tunisie";
  const gradient = REGION_COLORS[region] || "from-emerald-500 to-blue-600";
  const image = REGION_IMAGES[region] || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80";

  return (
    <Link href={`/circuits/${circuit.id}`}>
      <div className="relative rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 group cursor-pointer h-full">
        <div className="relative h-48 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
            style={{ backgroundImage: `url('${image}')` }}
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${gradient} opacity-40`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold text-emerald-700 shadow-sm flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {region}
          </div>

          {circuit.duration_days && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold text-slate-700 shadow-sm flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {circuit.duration_days}j/{circuit.duration_days - 1}n
            </div>
          )}
          {circuit.difficulty_level && (
            <div className="absolute top-3 right-3 mt-8 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold shadow-sm flex items-center gap-1">
              {circuit.difficulty_level === "easy" ? "🟢 Facile" : circuit.difficulty_level === "moderate" ? "🟡 Modéré" : circuit.difficulty_level === "hard" ? "🔴 Difficile" : "⚫ Expert"}
            </div>
          )}

          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-lg font-black text-white drop-shadow-lg leading-tight">
              {circuit.title}
            </h3>
          </div>
        </div>

        <div className="p-5">
          {circuit.description && (
            <p className="text-slate-400 text-sm line-clamp-2 mb-4">{circuit.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
            {circuit.max_participants && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Max {circuit.max_participants}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5 text-secondary" /> Éco-certifié
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-50">
            {circuit.base_price !== null ? (
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium">À partir de</span>
                <span className="text-xl font-black text-slate-900">
                  {Number(circuit.base_price).toLocaleString()} <span className="text-xs font-medium text-slate-400">TND</span>
                </span>
              </div>
            ) : (
              <span className="text-sm text-slate-400">Prix sur demande</span>
            )}
            <span className="text-xs font-bold text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Voir détails <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CircuitsSection() {
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/circuits`)
      .then((res) => res.json())
      .then((data) => {
        const approved = (Array.isArray(data) ? data : []).filter(
          (c: Circuit & { status?: string }) => c.status === "approved"
        );
        setCircuits(approved.slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (circuits.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="px-6 md:px-20 lg:px-40 max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-1 w-8 rounded-full bg-gradient-to-r from-secondary to-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-secondary">Circuits</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Circuits éco-responsables
            </h2>
            <p className="text-slate-500">Explorez la Tunisie avec des circuits durables et certifiés.</p>
          </div>
          <Link href="/circuits" className="hidden md:flex items-center gap-2 font-bold text-primary hover:text-emerald-700 hover:gap-3 transition-all text-sm">
            Tous les circuits <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {circuits.map((circuit) => (
            <CircuitCard key={circuit.id} circuit={circuit} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/circuits" className="inline-flex items-center gap-2 font-bold text-primary text-sm">
            Voir tous les circuits <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
