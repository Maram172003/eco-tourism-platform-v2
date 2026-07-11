"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from "react-leaflet";
import L from "leaflet";

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

interface CircuitMapInnerProps {
  circuitLat: number | null;
  circuitLng: number | null;
  days: MapDay[];
  radii?: MapRadius[];
}

export default function CircuitMapInner({ circuitLat, circuitLng, days, radii }: CircuitMapInnerProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    setReady(true);
    return () => { document.head.removeChild(link); };
  }, []);

  const locatedDays = days.filter((d) => d.lat != null && d.lng != null);
  const hasCircuitLocation = circuitLat != null && circuitLng != null;

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

  const allPoints: [number, number][] = [];
  if (hasCircuitLocation) allPoints.push([circuitLat!, circuitLng!]);
  locatedDays.forEach((d) => allPoints.push([d.lat!, d.lng!]));

  const center: [number, number] = locatedDays.length > 0
    ? [locatedDays[0].lat!, locatedDays[0].lng!]
    : [circuitLat!, circuitLng!];

  const bounds = allPoints.length > 1 ? L.latLngBounds(allPoints) : undefined;

  if (!ready) return <div className="h-[300px] bg-slate-100 animate-pulse" />;

  return (
    <MapContainer
      center={center}
      zoom={bounds ? undefined : 10}
      bounds={bounds}
      boundsOptions={{ padding: [40, 40] }}
      style={{ height: "300px", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {hasCircuitLocation && (
        <Marker position={[circuitLat!, circuitLng!]} icon={markerIcon}>
          <Popup><b>Départ / Point principal</b></Popup>
        </Marker>
      )}

      {locatedDays.map((day, index) => (
        <Marker
          key={`${day.day_number}-${index}`}
          position={[day.lat!, day.lng!]}
          icon={createNumberIcon(day.day_number)}
        >
          <Popup>
            <b>Jour {day.day_number}</b><br />
            {day.title}
            {day.location_name && <><br /><small>{day.location_name}</small></>}
          </Popup>
        </Marker>
      ))}

      {/* Radius circles (guide zones, mobile offers) */}
      {radii?.map((r, i) => {
        const meters = r.radiusKm * 1000;
        return (
          <Circle
            key={`radius-${i}`}
            center={[r.lat, r.lng]}
            radius={meters}
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
        );
      })}

      {locatedDays.length > 1 && (
        <Polyline
          positions={locatedDays.map((d) => [d.lat!, d.lng!])}
          pathOptions={{ color: "#13ec49", weight: 3, dashArray: "8 6" }}
        />
      )}
    </MapContainer>
  );
}
