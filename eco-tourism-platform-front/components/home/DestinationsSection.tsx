"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Clock, Users, ArrowRight } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Circuit {
  id: string;
  title: string;
  description: string;
  region: string;
  base_price: number;
  duration_days: number;
  max_participants: number;
  images: string[] | null;
  lat: number | null;
  lng: number | null;
  difficulty_level: string | null;
}

export default function DestinationsSection() {
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    apiFetch<Circuit[]>("/circuits?status=approved")
      .then((data) => setCircuits(data.slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 px-6 md:px-20 lg:px-40 max-w-[1440px] mx-auto">
      <div className="flex items-end justify-between mb-12">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            Destinations populaires
          </h2>
          <p className="text-slate-500">Explorez les plus beaux circuits éco-responsables de Tunisie.</p>
        </div>
        <button
          onClick={() => router.push("/circuits")}
          className="flex items-center gap-2 font-bold text-primary hover:gap-3 transition-all"
        >
          Voir tout <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-lg animate-pulse">
              <div className="aspect-video bg-slate-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : circuits.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg">Aucun circuit disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {circuits.map((circuit) => (
            <div
              key={circuit.id}
              className="rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
              onClick={() => router.push(`/circuits/${circuit.id}`)}
            >
              <div className="relative aspect-video overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                  style={{ backgroundImage: `url('${circuit.images?.[0] ?? "/placeholder.svg"}')` }}
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-extrabold text-primary shadow-sm flex items-center gap-1">
                  <MapPin size={12} /> {circuit.region ?? "Tunisie"}
                </div>
                {circuit.difficulty_level && (
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm ${circuit.difficulty_level === "easy" ? "bg-emerald-100 text-emerald-700" : circuit.difficulty_level === "moderate" ? "bg-amber-100 text-amber-700" : circuit.difficulty_level === "hard" ? "bg-red-100 text-red-700" : "bg-slate-800 text-white"}`}>
                    {circuit.difficulty_level === "easy" ? "🟢 Facile" : circuit.difficulty_level === "moderate" ? "🟡 Modéré" : circuit.difficulty_level === "hard" ? "🔴 Difficile" : "⚫ Expert"}
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{circuit.title}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{circuit.description?.slice(0, 80) ?? "Circuit unique en Tunisie."}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-1"><Clock size={14} /> {circuit.duration_days} jours</span>
                  <span className="flex items-center gap-1"><Users size={14} /> {circuit.max_participants ?? 10} pers.</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <span className="text-lg font-black">{Number(circuit.base_price ?? 0).toLocaleString()} TND</span>
                  <span className="text-xs font-bold text-primary group-hover:underline">Découvrir →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
