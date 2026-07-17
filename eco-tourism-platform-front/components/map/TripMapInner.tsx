"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";

interface MapItem {
  label: string;
  lat: number;
  lng: number;
  day_number?: number | null;
}

interface TripMapInnerProps {
  items: MapItem[];
}

export default function TripMapInner({ items }: TripMapInnerProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    setReady(true);
    return () => { document.head.removeChild(link); };
  }, []);

  const located = items.filter((i) => i.lat != null && i.lng != null);

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

  const allPoints: [number, number][] = located.map((i) => [i.lat, i.lng]);
  const center: [number, number] = [located[0].lat, located[0].lng];
  const bounds = allPoints.length > 1 ? L.latLngBounds(allPoints) : undefined;

  if (!ready) return <div className="h-[280px] bg-slate-100 animate-pulse" />;

  return (
    <MapContainer
      center={center}
      zoom={bounds ? undefined : 10}
      bounds={bounds}
      boundsOptions={{ padding: [40, 40] }}
      style={{ height: "280px", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {located.map((item, idx) => (
        <Marker
          key={idx}
          position={[item.lat, item.lng]}
          icon={item.day_number ? createNumberIcon(item.day_number) : markerIcon}
        >
          <Popup>
            {item.day_number && <b>Jour {item.day_number} &mdash; </b>}
            {item.label}
          </Popup>
        </Marker>
      ))}
      {located.length > 1 && (
        <Polyline
          positions={located.map((i) => [i.lat, i.lng])}
          pathOptions={{ color: "#13ec49", weight: 3, dashArray: "8 6" }}
        />
      )}
    </MapContainer>
  );
}
