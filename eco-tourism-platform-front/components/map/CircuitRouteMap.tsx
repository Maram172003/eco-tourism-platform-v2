"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

export type CircuitPoint = { jour: number; lat: number; lng: number; destination: string; };
export type HebergementPoint = { lat: number; lng: number; nom: string; };

function numberedIcon(jour: number) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:#16a34a;color:#fff;
      font-size:11px;font-weight:900;
      display:flex;align-items:center;justify-content:center;
      border:2.5px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
      font-family:sans-serif;
    ">${jour}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function hotelIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:30px;height:30px;border-radius:8px;
      background:#f97316;color:#fff;
      font-size:15px;
      display:flex;align-items:center;justify-content:center;
      border:2.5px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
    ">🏨</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18],
  });
}

export default function CircuitRouteMap({
  points,
  hebergementPoint,
}: {
  points: CircuitPoint[];
  hebergementPoint?: HebergementPoint;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || (points.length === 0 && !hebergementPoint)) return;

    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const map = L.map(containerRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    // Circuit route points — numbered markers + polyline
    const latlngs: L.LatLngTuple[] = points.map((p) => [p.lat, p.lng]);

    points.forEach((p) => {
      L.marker([p.lat, p.lng], { icon: numberedIcon(p.jour) })
        .addTo(map)
        .bindPopup(`<b>Jour ${p.jour}</b><br/><span style="font-size:11px">${p.destination}</span>`, {
          maxWidth: 180,
        });
    });

    if (latlngs.length >= 2) {
      L.polyline(latlngs, {
        color: "#16a34a",
        weight: 3,
        opacity: 0.75,
        dashArray: "6 4",
      }).addTo(map);
    }

    // Hébergement marker — NOT connected to polyline
    if (hebergementPoint) {
      L.marker([hebergementPoint.lat, hebergementPoint.lng], { icon: hotelIcon() })
        .addTo(map)
        .bindPopup(`<b>Hébergement</b><br/><span style="font-size:11px">${hebergementPoint.nom}</span>`, {
          maxWidth: 180,
        });
    }

    // Fit view to all markers including hébergement
    const allLatLngs: L.LatLngTuple[] = [
      ...latlngs,
      ...(hebergementPoint ? [[hebergementPoint.lat, hebergementPoint.lng] as L.LatLngTuple] : []),
    ];

    if (allLatLngs.length === 1) {
      map.setView(allLatLngs[0], 12);
    } else {
      map.fitBounds(L.latLngBounds(allLatLngs), { padding: [32, 32] });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points), JSON.stringify(hebergementPoint)]);

  return (
    <div
      ref={containerRef}
      style={{ height: "200px", width: "100%", borderRadius: "0.75rem" }}
      className="border border-slate-200 overflow-hidden"
    />
  );
}
