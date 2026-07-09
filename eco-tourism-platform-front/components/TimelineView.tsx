"use client";

import React from "react";
import { Clock, MapPin, ArrowDown } from "lucide-react";

type TimelineEntryData = {
  id?: string;
  step_order: number;
  emoji: string;
  time_label: string;
  title: string;
  description?: string | null;
  duration_minutes?: number | null;
  distance_km?: number | null;
  transport_mode?: string | null;
  guide_name?: string | null;
};

export default function TimelineView({ entries, renderActions }: { entries: TimelineEntryData[]; renderActions?: (entry: TimelineEntryData, index: number) => React.ReactNode }) {
  if (entries.length === 0) return null;

  const totalDuration = entries.reduce((s, e) => s + Number(e.duration_minutes ?? 0), 0);
  const totalDistance = entries.reduce((s, e) => s + Number(e.distance_km ?? 0), 0);
  const safeDuration = isNaN(totalDuration) ? 0 : totalDuration;
  const safeDistance = isNaN(totalDistance) ? 0 : totalDistance;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 text-xs text-slate-500 font-semibold">
        {safeDuration > 0 && (
          <span className="flex items-center gap-1"><Clock size={12} /> {safeDuration >= 60 ? `${Math.floor(safeDuration / 60)}h${safeDuration % 60}` : `${safeDuration}min`}</span>
        )}
        {safeDistance > 0 && (
          <span className="flex items-center gap-1"><MapPin size={12} /> {safeDistance.toFixed(1)} km</span>
        )}
        <span className="text-slate-300">·</span>
        <span>{entries.length} étapes</span>
      </div>
      <div className="relative pl-8">
        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary/40 to-emerald-200/60 rounded-full" />
        {entries.map((entry, i) => (
          <div key={entry.id || i} className="relative pb-6 last:pb-0">
            <div className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-white border-2 border-primary/30 flex items-center justify-center text-xs shadow-sm">
              {entry.emoji}
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 group">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">{entry.time_label}</span>
                    {entry.duration_minutes && (
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                        <Clock size={10} /> {entry.duration_minutes}min
                      </span>
                    )}
                    {entry.distance_km && (
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                        <MapPin size={10} /> {entry.distance_km}km
                      </span>
                    )}
                    {entry.transport_mode && (
                      <span className="text-[10px] text-slate-400 font-medium">{entry.transport_mode}</span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-800">{entry.title}</p>
                  {entry.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{entry.description}</p>}
                  {entry.guide_name && (
                    <p className="text-xs text-primary font-semibold mt-1 flex items-center gap-1">
                      <span>🧑‍🏫</span> Guide: {entry.guide_name}
                    </p>
                  )}
                </div>
                {renderActions && (
                  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    {renderActions(entry, i)}
                  </div>
                )}
              </div>
            </div>
            {i < entries.length - 1 && (
              <div className="flex justify-center -mb-1 mt-0.5">
                <ArrowDown size={12} className="text-slate-300" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
