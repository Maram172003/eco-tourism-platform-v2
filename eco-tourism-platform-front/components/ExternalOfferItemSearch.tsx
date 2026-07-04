"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { MapPin, DollarSign, Building2, Loader2 } from "lucide-react";

type ExternalOffer = {
  id: string;
  title: string;
  offer_type: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  author_id: string;
  items?: {
    id: string;
    name: string;
    item_type: string | null;
    prices?: { id: string; label: string; price: string }[];
  }[];
};

type Props = {
  lat: number | null;
  lng: number | null;
  radiusKm?: number;
  itemType?: string;
  category?: string;
  excludeAuthorId: string;
  onSelect: (offerItemId: string, offerTitle: string, itemName: string, providerName: string, price?: string) => void;
  dayLabel?: string;
};

export default function ExternalOfferItemSearch({
  lat, lng, radiusKm = 30, itemType = "room", category = "accommodation",
  excludeAuthorId, onSelect, dayLabel,
}: Props) {
  const [results, setResults] = useState<ExternalOffer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lat == null || lng == null) return;
    setLoading(true);
    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      radius_km: String(radiusKm),
      item_type: itemType,
      category: category,
      exclude_author: excludeAuthorId,
    });
    apiFetch<ExternalOffer[]>(`/offers/public?${params}`)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [lat, lng, radiusKm, itemType, category, excludeAuthorId]);

  if (lat == null || lng == null) {
    return <p className="text-xs text-slate-400">Définis la position du jour pour chercher des offres à proximité.</p>;
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
        <Loader2 size={14} className="animate-spin" />
        Recherche d&apos;offres à proximité ({radiusKm} km)…
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
        Aucune offre trouvée dans un rayon de {radiusKm} km. Tu peux ajouter une référence externe ci-dessous.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-500">{results.length} offre(s) trouvée(s) à proximité {dayLabel ? `(${dayLabel})` : ""}</p>
      {results.map((offer) => {
        const items = offer.items || [];
        return (
          <div key={offer.id} className="border border-slate-200 rounded-xl p-3 hover:bg-slate-50 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Building2 size={14} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-800">{offer.title}</span>
              </div>
            </div>
            {(offer.region || offer.address) && (
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <MapPin size={11} />
                {offer.address || offer.region}
              </div>
            )}
            {items.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelect(item.id, offer.title, item.name, offer.title, item.prices?.[0]?.price)}
                      className="flex items-center gap-1 text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1 hover:bg-primary hover:text-white hover:border-primary transition-colors"
                    >
                      <span>{item.name}</span>
                      {item.prices?.[0] && (
                        <span className="flex items-center gap-0.5 opacity-70">
                          <DollarSign size={10} />
                          {Number(item.prices[0].price).toLocaleString()}
                        </span>
                      )}
                      <span className="text-[10px] opacity-60">Lier</span>
                    </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
