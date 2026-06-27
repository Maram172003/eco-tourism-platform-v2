"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapView({ lat, lng }: { lat: number; lng: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [cssReady, setCssReady] = useState(false);

  useEffect(() => {
    if (document.querySelector('link[href*="leaflet.css"]')) { setCssReady(true); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.onload = () => setCssReady(true);
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (!cssReady || !containerRef.current) return;

    // Initialize map only once per mount
    const map = L.map(containerRef.current, { scrollWheelZoom: false, zoomControl: true });
    map.setView([lat, lng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.marker([lat, lng], { icon: markerIcon }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [cssReady]);

  // Update view when coords change without remounting
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 13);
    }
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      style={{ height: "220px", width: "100%", borderRadius: "0.75rem" }}
      className={cssReady ? "" : "bg-slate-100 animate-pulse"}
    />
  );
}
