"use client";

import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import { apiFetch } from "@/lib/api";

interface HeatPoint {
  lat: number;
  lng: number;
  weight: number;
}

export default function HeatmapLayer() {
  const map = useMap();
  const [points, setPoints] = useState<HeatPoint[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch<{ lat: number; lng: number; weight: number }[]>("/offers/popular-locations").catch(() => []),
      apiFetch<any[]>("/publications/heatmap").catch(() => []),
    ]).then(([offerData, placeData]) => {
      const all: HeatPoint[] = [];

      if (Array.isArray(offerData)) {
        for (const p of offerData) {
          all.push({ lat: p.lat, lng: p.lng, weight: Math.min(p.weight, 1) });
        }
      }

      if (Array.isArray(placeData)) {
        for (const p of placeData) {
          const w = Math.min((p.likes || 0) * 0.3 + (p.comments || 0) * 0.5 + (p.contributions || 0) * 0.7, 1);
          if (p.lat != null && p.lng != null) {
            all.push({ lat: p.lat, lng: p.lng, weight: w || 0.2 });
          }
        }
      }

      setPoints(all);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded || points.length === 0) return;

    const heat = (L as any).heatLayer(
      points.map((p) => [p.lat, p.lng, p.weight]),
      {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        max: 1.0,
        gradient: { 0.4: "#13ec49", 0.6: "#fbbf24", 0.8: "#f97316", 1.0: "#ef4444" },
      }
    );

    heat.addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points, loaded]);

  return null;
}
