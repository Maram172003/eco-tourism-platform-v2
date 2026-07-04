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

function createNumberIcon(num: number) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background:#13ec49;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)">${num}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    } else if (points.length === 1) {
      map.setView(points[0], 13);
    }
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
}

function DraggableMarker({ pos, index, onDrag }: DraggableMarkerProps) {
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
      icon={index === 0 ? markerIcon : createNumberIcon(index + 1)}
      eventHandlers={eventHandlers}
    />
  );
}

interface PolylineDrawerProps {
  waypoints: [number, number][];
  onChange: (waypoints: [number, number][]) => void;
}

export default function PolylineDrawer({ waypoints, onChange }: PolylineDrawerProps) {
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

  const center: [number, number] = waypoints.length > 0
    ? waypoints[0]
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
          <FitBounds points={waypoints} />
          <InvalidateSizeFix />
          {waypoints.map((pos, i) => (
            <DraggableMarker key={`${i}-${pos[0]}-${pos[1]}`} pos={pos} index={i} onDrag={handleDrag} />
          ))}
          {waypoints.length > 1 && (
            <Polyline
              positions={waypoints}
              pathOptions={{ color: "#13ec49", weight: 3, dashArray: "8 6" }}
            />
          )}
        </MapContainer>
      </div>
      {waypoints.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {waypoints.map((pos, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5 text-xs text-slate-600">
              <span>
                <strong>{i === 0 ? "Départ" : `Étape ${i}`}</strong>: {pos[0].toFixed(4)}, {pos[1].toFixed(4)}
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
      {waypoints.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-2">Cliquez sur la carte pour ajouter des étapes à l&apos;itinéraire</p>
      )}
    </div>
  );
}
