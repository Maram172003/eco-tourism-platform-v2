"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo([lat, lng], 14, { duration: 1 }); }, [lat, lng, map]);
  return null;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`,
      { headers: { "Accept-Language": "fr" } }
    );
    const data = await res.json();
    return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

async function searchPlace(query: string): Promise<{ lat: number; lng: number; display_name: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=fr`
    );
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display_name: data[0].display_name };
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
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);
  const [searching, setSearching]   = useState(false);
  const [searchErr, setSearchErr]   = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  async function handleClick(clat: number, clng: number) {
    const address = await reverseGeocode(clat, clng);
    onPick(clat, clng, address);
  }

  async function handleSearch() {
    const q = searchRef.current?.value.trim();
    if (!q) return;
    setSearching(true); setSearchErr("");
    const result = await searchPlace(q);
    setSearching(false);
    if (!result) { setSearchErr("Lieu introuvable. Essayez un autre nom."); return; }
    setFlyTarget({ lat: result.lat, lng: result.lng });
    onPick(result.lat, result.lng, result.display_name);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); handleSearch(); }
  }

  return (
    <div className="space-y-2">
      {/* Search bar — div not form to avoid nested <form> */}
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

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-slate-200">
        <MapContainer
          center={lat && lng ? [lat, lng] : [33.8869, 9.5375]}
          zoom={lat && lng ? 13 : 6}
          style={{ height: "220px", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickHandler onPick={handleClick} />
          {flyTarget && <FlyTo lat={flyTarget.lat} lng={flyTarget.lng} />}
          {lat !== null && lng !== null && (
            <Marker position={[lat, lng]} icon={markerIcon} />
          )}
        </MapContainer>
      </div>
      <p className="text-[10px] text-slate-400 font-medium">
        Cliquez sur la carte <span className="text-slate-300">ou</span> recherchez un lieu pour positionner le marqueur.
      </p>
    </div>
  );
}
