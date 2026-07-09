"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { Trash2 } from "lucide-react";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function createNumberIcon(num: number, bgColor = "#13ec49") {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background:${bgColor};color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)">${num}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    // Petit délai pour laisser la carte s'initialiser correctement
    const timer = setTimeout(() => {
      if (points.length > 1) {
        map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 14 });
      } else if (points.length === 1) {
        map.setView(points[0], 13);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [points, map]);
  return null;
}

function InvalidateSizeFix() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

interface DraggableMarkerProps {
  pos: [number, number];
  index: number;
  onDrag: (index: number, lat: number, lng: number) => void;
  markerColor?: string;
}

function DraggableMarker({ pos, index, onDrag, markerColor }: DraggableMarkerProps) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const p = marker.getLatLng();
        onDrag(index, p.lat, p.lng);
      }
    },
  };

  return (
    <Marker
      ref={markerRef}
      position={pos}
      draggable={true}
      icon={index === 0 ? markerIcon : createNumberIcon(index + 1, markerColor)}
      eventHandlers={eventHandlers}
    />
  );
}

interface PolylineDrawerProps {
  waypoints: [number, number][];
  onChange: (waypoints: [number, number][]) => void;
  color?: string;
  anchors?: [number, number][]; // Points verrouillés du jour actif
  allAnchors?: { pos: [number, number]; dayNumber: number; dayId: string; dayIndex: number }[]; // Tous les anchors de tous les jours
  activeDayIndex?: number; // Index du jour actif
  dayColors?: string[]; // Couleurs de chaque jour
}

export default function PolylineDrawer({ waypoints, onChange, color = "#13ec49", anchors = [], allAnchors = [], activeDayIndex = 0, dayColors = [] }: PolylineDrawerProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    setReady(true);
    return () => { document.head.removeChild(link); };
  }, []);

  function ClickHandler() {
    useMapEvents({
      click(e) {
        onChange([...waypoints, [e.latlng.lat, e.latlng.lng]]);
      },
    });
    return null;
  }

  const handleDrag = useCallback((index: number, lat: number, lng: number) => {
    const next = [...waypoints];
    next[index] = [lat, lng];
    onChange(next);
  }, [waypoints, onChange]);

  // Points du jour actif : anchors + waypoints pour la polyline locale
  const activePoints = [...anchors, ...waypoints];
  // Tous les anchors globaux pour le FitBounds
  const globalAnchors = allAnchors.map((a) => a.pos);
  const allPoints = [...globalAnchors, ...waypoints];
  const center: [number, number] = allPoints.length > 0
    ? allPoints[0]
    : [33.8869, 9.5375];

  if (!ready) return <div className="h-[300px] bg-slate-100 animate-pulse rounded-xl" />;

  return (
    <div className="space-y-2">
      <div className="map-contained border border-slate-200 rounded-xl overflow-hidden" style={{ height: 300 }}>
        <MapContainer
          center={center}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickHandler />
          <FitBounds points={allPoints} />
          <InvalidateSizeFix />
          {/* Tous les anchors globaux (destinations de tous les jours) */}
          {allAnchors.map((anchor) => {
            const isActive = anchor.dayIndex !== undefined ? anchor.dayIndex === activeDayIndex : false;
            const dayColor = dayColors[anchor.dayIndex ?? 0] || '#94a3b8';
            return (
              <Marker
                key={`global-anchor-${anchor.dayId}-${anchor.pos[0]}-${anchor.pos[1]}`}
                position={anchor.pos}
                draggable={false}
                icon={createNumberIcon(
                  anchor.dayNumber,
                  isActive ? dayColor : '#94a3b8'
                )}
              />
            );
          })}
          {/* Markers waypoints du jour actif (éditables, draggables) */}
          {waypoints.map((pos, i) => (
            <DraggableMarker
              key={`wp-${i}-${pos[0]}-${pos[1]}`}
              pos={pos}
              index={i}
              onDrag={handleDrag}
              markerColor={color}
            />
          ))}
          {/* Route globale reliant tous les anchors (pointillé gris) */}
          {globalAnchors.length > 1 && (
            <Polyline
              positions={globalAnchors}
              pathOptions={{ color: '#94a3b8', weight: 2, dashArray: '10 8', opacity: 0.5 }}
            />
          )}
          {/* Route du jour actif (pleine, couleur du jour) */}
          {activePoints.length > 1 && (
            <Polyline
              positions={activePoints}
              pathOptions={{ color, weight: 3, dashArray: '8 6' }}
            />
          )}
        </MapContainer>
      </div>
      {/* Route globale : résumé de tous les jours */}
      {allAnchors.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Route globale</p>
          {allAnchors.map((anchor) => {
            const isActive = anchor.dayIndex !== undefined ? anchor.dayIndex === activeDayIndex : false;
            const dayColor = dayColors[anchor.dayIndex ?? 0] || '#94a3b8';
            return (
              <div key={`global-${anchor.dayId}`}
                className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs transition-all ${
                  isActive ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold' : 'bg-slate-50 border border-slate-100 text-slate-500'
                }`}>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: isActive ? dayColor : '#94a3b8' }}>
                    {anchor.dayNumber}
                  </span>
                  <span className="text-[10px]">🔒 Jour {anchor.dayNumber}</span>
                  {anchor.pos[0].toFixed(4)}, {anchor.pos[1].toFixed(4)}
                </span>
                {isActive && <span className="text-[10px] text-primary">◄ éditer</span>}
                {!isActive && <span className="text-[10px] text-slate-400">verrouillé</span>}
              </div>
            );
          })}
        </div>
      )}
      {waypoints.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {waypoints.map((pos, i) => (
            <div key={`wp-${i}`} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5 text-xs text-slate-600">
              <span>
                ⭐ <strong>Arrêt {i + 1}</strong>: {pos[0].toFixed(4)}, {pos[1].toFixed(4)}
              </span>
              <button
                type="button"
                onClick={() => {
                  const next = waypoints.filter((_, idx) => idx !== i);
                  onChange(next);
                }}
                className="p-1 text-red-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      {allPoints.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-2">Définissez les lieux des jours dans l&apos;étape 2, puis ajoutez des arrêts ici</p>
      )}
    </div>
  );
}
