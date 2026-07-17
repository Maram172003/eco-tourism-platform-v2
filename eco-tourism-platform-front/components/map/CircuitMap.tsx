"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";

const MapInner = dynamic(() => import("./CircuitMapInner"), { ssr: false });

interface MapDay {
  day_number: number;
  title: string;
  lat: number | null;
  lng: number | null;
  location_name: string | null;
}

interface MapRadius {
  lat: number;
  lng: number;
  radiusKm: number;
  color?: string;
  label?: string;
}

interface MapWaypoint {
  lat: number;
  lng: number;
  label?: string;
}

interface CircuitMapProps {
  circuitLat: number | null;
  circuitLng: number | null;
  days: MapDay[];
  radii?: MapRadius[];
  waypoints?: MapWaypoint[];
  className?: string;
}

export default function CircuitMap({ circuitLat, circuitLng, days, radii, waypoints, className = "" }: CircuitMapProps) {
  const locatedDays = days.filter((d) => d.lat != null && d.lng != null);
  const hasCircuitLocation = circuitLat != null && circuitLng != null;
  const hasAnyLocation = hasCircuitLocation || locatedDays.length > 0;

  if (!hasAnyLocation) {
    return (
      <div className={`bg-slate-50 rounded-2xl border border-slate-200 p-6 text-center ${className}`}>
        <p className="text-slate-400 text-sm">Aucune localisation définie pour ce circuit</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl overflow-hidden border border-slate-200 ${className}`}>
      <MapInner circuitLat={circuitLat} circuitLng={circuitLng} days={days} radii={radii} waypoints={waypoints} />
    </div>
  );
}
