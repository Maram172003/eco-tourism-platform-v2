"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import HeatmapLayer from "@/components/map/HeatmapLayer";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const circuitIcon = L.divIcon({
  className: "",
  html: `<div style="background:#7c3aed;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,0.3);">⚡</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const placeIcon = L.divIcon({
  className: "",
  html: `<div style="background:#059669;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,0.3);">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const guideIcon = L.divIcon({
  className: "",
  html: `<div style="background:#f59e0b;color:#fff;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 6px rgba(0,0,0,0.3);">🧑‍🏫</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

interface MarkerRadius {
  lat: number;
  lng: number;
  radiusKm: number;
  color?: string;
  label?: string;
}

interface MarkerData {
  lat: number;
  lng: number;
  label: string;
  type?: "offer" | "circuit" | "place" | "guide";
  id?: string;
}

interface MapViewProps {
  lat: number;
  lng: number;
  markers?: MarkerData[];
  className?: string;
  height?: string;
  showHeatmap?: boolean;
  polylines?: [number, number][][];
  radii?: MarkerRadius[];
  layerVisibility?: { offers: boolean; circuits: boolean; places: boolean; guides?: boolean };
}

function Recenter({ lat, lng, markers }: { lat: number; lng: number; markers?: MarkerData[] }) {
  const map = useMap();
  useEffect(() => {
    const valid = markers?.filter((m) => m.lat && m.lng) ?? [];
    if (valid.length > 1) {
      const bounds = L.latLngBounds(valid.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    } else {
      map.setView([lat, lng], valid.length === 1 ? 10 : 7);
    }
  }, [lat, lng, markers, map]);
  return null;
}

function MapLegend() {
  return (
    <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 p-2.5 text-xs space-y-1.5">
      <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-1">Légende</p>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-white border-2 border-slate-400" />
        <span className="text-slate-600">Offre</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-purple-600 flex items-center justify-center text-[7px] text-white">⚡</span>
        <span className="text-slate-600">Circuit</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-emerald-600 flex items-center justify-center text-[7px] text-white">📍</span>
        <span className="text-slate-600">Lieu</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-amber-500 flex items-center justify-center text-[8px] text-white">🧑</span>
        <span className="text-slate-600">Guide</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-5 h-0.5 bg-emerald-500" style={{ borderTop: "2px dashed #13ec49" }} />
        <span className="text-slate-600">Itinéraire</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full border-2 border-dashed border-amber-400 bg-amber-50" />
        <span className="text-slate-600">Zone service</span>
      </div>
    </div>
  );
}

export default function MapView({ lat, lng, markers, className, height = "220px", showHeatmap = false, polylines, radii, layerVisibility }: MapViewProps) {
  const [cssReady, setCssReady] = useState(false);

  useEffect(() => {
    if (document.querySelector('link[href*="leaflet.css"]')) {
      setCssReady(true);
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.onload = () => setCssReady(true);
    document.head.appendChild(link);
  }, []);

  if (!cssReady) return <div className={`bg-slate-100 animate-pulse rounded-2xl ${className}`} style={{ height }} />;

  const showOffers = layerVisibility?.offers ?? true;
  const showCircuits = layerVisibility?.circuits ?? true;
  const showPlaces = layerVisibility?.places ?? true;
  const showGuides = layerVisibility?.guides ?? true;

  const filteredMarkers = (markers ?? []).filter((m) => {
    if (m.type === "circuit") return showCircuits;
    if (m.type === "place") return showPlaces;
    if (m.type === "guide") return showGuides;
    return showOffers;
  });

  const fallbackMarker = filteredMarkers.length
    ? filteredMarkers
    : [{ lat, lng, label: "", type: "offer" as const }];

  const mapKey = `${lat}-${lng}-${filteredMarkers.length}-${filteredMarkers.map(m => `${m.lat},${m.lng}`).join(";")}`;

  return (
    <div className="relative w-full" style={{ height }}>
      <MapContainer
        key={mapKey}
        center={[33.8, 9.5]}
        zoom={7}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
        zoomControl={true}
        className={className}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {showHeatmap && <HeatmapLayer />}

        {/* Radius circles */}
        {radii?.map((r, i) => (
          <Circle
            key={`radius-${i}`}
            center={[r.lat, r.lng]}
            radius={r.radiusKm * 1000}
            pathOptions={{
              color: r.color ?? "#8b5cf6",
              fillColor: r.color ?? "#8b5cf6",
              fillOpacity: 0.1,
              weight: 2,
              dashArray: "6 4",
            }}
          >
            {r.label && <Popup>{r.label}</Popup>}
          </Circle>
        ))}

        {/* Polylines */}
        {polylines?.map((points, i) => (
          <Polyline key={`poly-${i}`} positions={points} pathOptions={{ color: "#13ec49", weight: 3, dashArray: "8 6" }} />
        ))}

        {/* Markers */}
        {fallbackMarker.map((m, i) => (
          <Marker
            key={`${m.lat}-${m.lng}-${i}`}
            position={[m.lat, m.lng]}
            icon={m.type === "circuit" ? circuitIcon : m.type === "place" ? placeIcon : m.type === "guide" ? guideIcon : defaultIcon}
          >
            {m.label && (
              <Popup>
                <div className="text-sm">
                  <p className="font-bold text-slate-800 mb-1">{m.label}</p>
                  {m.id && (
                    <a
                      href={m.type === "circuit" ? `/circuits/${m.id}` : m.type === "place" ? `/places/${m.id}` : m.type === "guide" ? `/profile/guide/${m.id}` : `/offers/${m.id}`}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      Voir détails →
                    </a>
                  )}
                </div>
              </Popup>
            )}
          </Marker>
        ))}
        <Recenter lat={lat} lng={lng} markers={filteredMarkers} />
      </MapContainer>

      {/* Legend */}
      <MapLegend />
    </div>
  );
}
