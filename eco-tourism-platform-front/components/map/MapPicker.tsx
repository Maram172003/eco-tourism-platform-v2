"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "fr" } }
    );
    const data = await res.json();
    return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

async function searchPlace(
  query: string
): Promise<{ lat: number; lng: number; display_name: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=fr`
    );
    const data = await res.json();
    if (!data.length) return null;
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      display_name: data[0].display_name,
    };
  } catch {
    return null;
  }
}

export default function MapPicker({
  lat,
  lng,
  onPick,
}: {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number, address: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  // Keep onPick ref fresh so the map click handler never captures a stale closure
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Create the Leaflet map imperatively — runs once per mount, destroyed on unmount
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const container = containerRef.current!;
    const map = L.map(container, {
      center: lat !== null && lng !== null ? [lat, lng] : [33.8869, 9.5375],
      zoom: lat !== null ? 13 : 6,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    if (lat !== null && lng !== null) {
      markerRef.current = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
    }

    map.on("click", async (e) => {
      const clat = e.latlng.lat;
      const clng = e.latlng.lng;
      if (markerRef.current) {
        markerRef.current.setLatLng([clat, clng]);
      } else {
        markerRef.current = L.marker([clat, clng], { icon: markerIcon }).addTo(map);
      }
      const address = await reverseGeocode(clat, clng);
      onPickRef.current(clat, clng, address);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      try { document.head.removeChild(link); } catch {}
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync marker imperatively when lat/lng props change after initial mount
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (lat !== null && lng !== null) {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
      }
      map.flyTo([lat, lng], 14, { duration: 1 });
    }
  }, [lat, lng]);

  async function handleSearch() {
    const q = searchRef.current?.value.trim();
    if (!q) return;
    setSearching(true);
    setSearchErr("");
    const result = await searchPlace(q);
    setSearching(false);
    if (!result) { setSearchErr("Lieu introuvable. Essayez un autre nom."); return; }
    const map = mapRef.current;
    if (map) {
      if (markerRef.current) {
        markerRef.current.setLatLng([result.lat, result.lng]);
      } else {
        markerRef.current = L.marker([result.lat, result.lng], { icon: markerIcon }).addTo(map);
      }
      map.flyTo([result.lat, result.lng], 14, { duration: 1 });
    }
    onPickRef.current(result.lat, result.lng, result.display_name);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); handleSearch(); }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          ref={searchRef}
          type="text"
          placeholder="Rechercher un lieu…"
          defaultValue=""
          onKeyDown={handleKeyDown}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="px-4 py-2 bg-primary text-white text-xs font-extrabold rounded-xl hover:bg-primary/90 disabled:opacity-50 shrink-0"
        >
          {searching ? "…" : "Chercher"}
        </button>
      </div>
      {searchErr && <p className="text-xs text-red-500 font-semibold">{searchErr}</p>}
      <div
        ref={containerRef}
        className="rounded-2xl overflow-hidden border border-slate-200"
        style={{ height: "220px", width: "100%" }}
      />
      <p className="text-[10px] text-slate-400 font-medium">
        Cliquez sur la carte <span className="text-slate-300">ou</span> recherchez un lieu pour positionner le marqueur.
      </p>
    </div>
  );
}
