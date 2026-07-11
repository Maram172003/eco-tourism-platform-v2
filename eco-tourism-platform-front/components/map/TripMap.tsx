"use client";

import dynamic from "next/dynamic";

const TripMapInner = dynamic(() => import("./TripMapInner"), { ssr: false });

interface MapItem {
  label: string;
  lat: number;
  lng: number;
  day_number?: number | null;
}

interface TripMapProps {
  items: MapItem[];
  className?: string;
}

export default function TripMap({ items, className = "" }: TripMapProps) {
  const located = items.filter((i) => i.lat != null && i.lng != null);

  if (located.length === 0) {
    return (
      <div className={`bg-slate-50 rounded-2xl border border-slate-200 p-6 text-center ${className}`}>
        <p className="text-slate-400 text-sm">Aucune localisation disponible pour les offres de ce plan</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl overflow-hidden border border-slate-200 ${className}`}>
      <TripMapInner items={items} />
    </div>
  );
}
