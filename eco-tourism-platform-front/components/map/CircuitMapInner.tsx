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

interface MapWaypoint {
  lat: number;
  lng: number;
  label?: string;
}

interface CircuitMapInnerProps {
  circuitLat: number | null;
  circuitLng: number | null;
  days: MapDay[];
  radii?: MapRadius[];
  waypoints?: MapWaypoint[];
}

export default function CircuitMapInner({ circuitLat, circuitLng, days, radii, waypoints }: CircuitMapInnerProps) {
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
  waypoints?.forEach((w: any) => {
    const lat = Array.isArray(w) ? w[0] : w.lat;
    const lng = Array.isArray(w) ? w[1] : w.lng;
    if (lat != null && lng != null) allPoints.push([Number(lat), Number(lng)]);
  });

  if (!ready) return <div className="h-[300px] bg-slate-100 animate-pulse" />;

  if (allPoints.length === 0) {
    return (
      <div className="h-[300px] bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
        Aucune position disponible pour ce circuit
      </div>
    );
  }

  const center: [number, number] = locatedDays.length > 0
    ? [locatedDays[0].lat!, locatedDays[0].lng!]
    : hasCircuitLocation
    ? [circuitLat!, circuitLng!]
    : allPoints[0];

  const bounds = allPoints.length > 1 ? L.latLngBounds(allPoints) : undefined;

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

      {/* Waypoints markers */}
      {waypoints?.map((w: any, i) => {
        const wLat = Array.isArray(w) ? w[0] : w.lat;
        const wLng = Array.isArray(w) ? w[1] : w.lng;
        if (wLat == null || wLng == null) return null;
        return (
          <Marker
            key={`wp-${i}`}
            position={[Number(wLat), Number(wLng)]}
            icon={L.divIcon({
              className: "custom-marker",
              html: `<div style="background:#f59e0b;color:#fff;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:11px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)">w</div>`,
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            })}
          >
            <Popup><b>{(Array.isArray(w) ? null : w.label) || `Étape ${i + 1}`}</b></Popup>
          </Marker>
        );
      })}

      {/* Polyline: days + waypoints in order */}
      {(() => {
        const routePoints: [number, number][] = [];
        if (hasCircuitLocation) routePoints.push([circuitLat!, circuitLng!]);
        const sortedAll = [
          ...locatedDays.map((d) => ({ lat: d.lat!, lng: d.lng!, day: d.day_number, idx: 0 })),
          ...(waypoints?.map((w: any, i) => {
            const wLat = Array.isArray(w) ? w[0] : w.lat;
            const wLng = Array.isArray(w) ? w[1] : w.lng;
            return { lat: Number(wLat), lng: Number(wLng), day: 0, idx: i + 1 };
          }).filter((w) => w.lat && w.lng) || []),
        ].sort((a, b) => a.day - b.day || a.idx - b.idx);
        sortedAll.forEach((p) => routePoints.push([p.lat, p.lng]));
        if (routePoints.length > 1) {
          return (
            <Polyline
              positions={routePoints}
              pathOptions={{ color: "#13ec49", weight: 3, dashArray: "8 6" }}
            />
          );
        }
        return null;
      })()}
    </MapContainer>
  );
}
