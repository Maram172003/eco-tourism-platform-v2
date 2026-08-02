"use client";

import { ArrowRight } from "lucide-react";
import ExperienceCard from "./ExperienceCard";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface Offer {
  id: string;
  title: string;
  description: string;
  region: string;
  price: number;
  images: string[] | null;
}

export default function FeaturedExperiences() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    apiFetch<Offer[]>("/offers")
      .then((data) => setOffers(data.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 px-6 md:px-20 lg:px-40 max-w-[1440px] mx-auto">
      <div className="flex items-end justify-between mb-12">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            Expériences à la une
          </h2>
          <p className="text-slate-500">Nos pépites durables les plus appréciées ce mois-ci.</p>
        </div>
        <button
          onClick={() => router.push("/offers")}
          className="flex items-center gap-2 font-bold text-primary hover:gap-3 transition-all"
        >
          Voir tout <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-lg animate-pulse">
              <div className="aspect-video bg-slate-200" />
              <div className="p-6 space-y-4">
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg">Aucune expérience disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer) => (
            <ExperienceCard
              key={offer.id}
              id={offer.id}
              image={offer.images?.[0] ?? "/placeholder.svg"}
              location={offer.region ?? "Tunisie"}
              title={offer.title}
              rating={4.5 + Math.random() * 0.5}
              description={offer.description?.slice(0, 120) ?? "Découvrez cette expérience unique."}
              price={offer.price}
            />
          ))}
        </div>
      )}
    </section>
  );
}
