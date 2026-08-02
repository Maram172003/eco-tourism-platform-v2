"use client";

import { useEffect, useState } from "react";
import { Loader2, CloudSun, Droplets, Wind } from "lucide-react";

interface WeatherData {
  current: {
    temperature: number;
    weather_code: number;
  };
  daily: Array<{
    date: string;
    temp_max: number;
    temp_min: number;
    weather_code: number;
  }>;
}

const WMO_ICONS: Record<number, string> = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌦️",
  61: "🌧️", 63: "🌧️", 65: "🌧️",
  71: "🌨️", 73: "🌨️", 75: "🌨️",
  80: "🌦️", 81: "🌦️", 82: "🌦️",
  95: "⛈️", 96: "⛈️", 99: "⛈️",
};

const WMO_LABELS: Record<number, string> = {
  0: "Dégagé", 1: "Peu nuageux", 2: "Partiellement nuageux", 3: "Couvert",
  45: "Brouillard", 48: "Brouillard givrant",
  51: "Bruine légère", 53: "Bruine modérée", 55: "Bruine dense",
  61: "Pluie légère", 63: "Pluie modérée", 65: "Pluie forte",
  71: "Neige légère", 73: "Neige modérée", 75: "Neige forte",
  80: "Averses légères", 81: "Averses modérées", 82: "Averses fortes",
  95: "Orage", 96: "Orage avec grêle", 99: "Orage violent",
};

function weatherLabel(code: number): string {
  return WMO_LABELS[code] || "N/A";
}

function weatherIcon(code: number): string {
  return WMO_ICONS[code] || "❓";
}

function fmtDay(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === tomorrow.toDateString()) return "Demain";
  return d.toLocaleDateString("fr-FR", { weekday: "long" });
}

export default function WeatherSection({ lat, lng, placeName }: { lat: number; lng: number; placeName?: string }) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!lat || !lng) return;
    setLoading(true);
    setError(false);

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&timezone=auto&forecast_days=5`
    )
      .then((r) => r.json())
      .then((json) => {
        if (!json?.daily?.time) throw new Error("No data");
        setData({
          current: {
            temperature: Math.round(json.current.temperature_2m),
            weather_code: json.current.weather_code,
          },
          daily: json.daily.time.map((date: string, i: number) => ({
            date,
            temp_max: Math.round(json.daily.temperature_2m_max[i]),
            temp_min: Math.round(json.daily.temperature_2m_min[i]),
            weather_code: json.daily.weather_code[i],
          })),
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={20} className="animate-spin text-slate-300" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-xs text-slate-400 text-center py-6">Météo indisponible pour le moment.</p>
    );
  }

  return (
    <div>
      {/* Current weather */}
      <div className="flex items-center gap-4 mb-5 p-4 bg-gradient-to-br from-emerald-50 to-sky-50 rounded-xl border border-emerald-100/50">
        <span className="text-5xl">{weatherIcon(data.current.weather_code)}</span>
        <div>
          <p className="text-3xl font-bold text-slate-800">{data.current.temperature}°C</p>
          <p className="text-sm text-slate-500">{weatherLabel(data.current.weather_code)}</p>
          {placeName && <p className="text-xs text-slate-400">{placeName}</p>}
        </div>
      </div>

      {/* Forecast */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {data.daily.map((day) => (
          <div key={day.date} className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 mb-1 capitalize">{fmtDay(day.date)}</p>
            <span className="text-2xl block mb-1">{weatherIcon(day.weather_code)}</span>
            <p className="text-xs font-bold text-slate-700">{day.temp_max}° / {day.temp_min}°</p>
            <p className="text-[9px] text-slate-400 mt-0.5">{weatherLabel(day.weather_code)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
