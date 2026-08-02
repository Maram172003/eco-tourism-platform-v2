"use client";

import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type NearbyMarker = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: "place" | "offer" | "circuit";
  href?: string;
};

type PlaceMapProps = {
  lat: number;
  lng: number;
  title?: string;
  markers?: NearbyMarker[];
};

const MARKER_STYLES: Record<string, { bg: string; icon: string }> = {
  place:   { bg: "#065f46", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>` },
  offer:   { bg: "#2563eb", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>` },
  circuit: { bg: "#7c3aed", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>` },
};

function buildIcon(bg: string, html: string) {
  return L.divIcon({
    html: `<div style="background:${bg};color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${html}</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
}

export default function PlaceMap({ lat, lng, title, markers }: PlaceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    // Main place marker (rouge, plus gros)
    const mainIcon = L.divIcon({
      html: `<div style="background:#dc2626;color:white;border-radius:50%;width:48px;height:48px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 12px rgba(220,38,38,0.5);border:3px solid white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
      className: "",
      iconSize: [48, 48],
      iconAnchor: [24, 48],
    });
    L.marker([lat, lng], { icon: mainIcon })
      .addTo(map)
      .bindPopup(`<b style="color:#dc2626">${title || "Lieu"}</b>`);

    // Layer group for nearby markers
    const layer = L.layerGroup().addTo(map);
    markersLayer.current = layer;

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
      markersLayer.current = null;
    };
  }, [lat, lng, title]);

  // Update nearby markers when they change
  useEffect(() => {
    const layer = markersLayer.current;
    if (!layer || !mapInstance.current) return;

    layer.clearLayers();

    if (!markers || markers.length === 0) return;

    const bounds = L.latLngBounds([[lat, lng]]);

    markers.forEach((m) => {
      if (!m.lat || !m.lng) return;
      const style = MARKER_STYLES[m.type] || MARKER_STYLES.place;
      const icon = buildIcon(style.bg, style.icon);
      const popupContent = m.href
        ? `<a href="${m.href}" style="font-weight:600;color:${style.bg};text-decoration:none">${m.title}</a>`
        : m.title;
      L.marker([m.lat, m.lng], { icon })
        .addTo(layer)
        .bindPopup(popupContent);
      bounds.extend([m.lat, m.lng]);
    });

    mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
  }, [markers, lat, lng]);

  if (!lat || !lng) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        <MapPin size={24} className="mr-2" />
        Position non disponible
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full rounded-xl" />;
}
