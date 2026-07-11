"use client";

import { useState } from "react";
import { Plus, X, Clock, MapPin, ArrowDown, GripVertical } from "lucide-react";

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
};

const EMOJIS = ["📍", "🚐", "🛶", "🥾", "🏛️", "🍽️", "🏕️", "🌅", "📸", "🎒", "🚲", "🐪", "🦅", "🌿", "🏊", "🧗", "🎶", "🎨", "🛒", "⛺"];

const TRANSPORTS = ["", "🚐 Van", "🥾 À pied", "🚲 Vélo", "🐪 Chameau", "🚗 Voiture", "🛶 Kayak", "🐴 Cheval", "🚌 Bus"];

export default function TimelineEditor({
  entries, onChange,
}: {
  entries: TimelineEntryData[];
  onChange: (entries: TimelineEntryData[]) => void;
}) {
  const [showPicker, setShowPicker] = useState<number | null>(null);

  function addEntry() {
    onChange([...entries, {
      step_order: entries.length,
      emoji: "📍",
      time_label: "",
      title: "",
      description: "",
      duration_minutes: null,
      distance_km: null,
      transport_mode: null,
    }]);
  }

  function removeEntry(i: number) {
    const next = entries.filter((_, idx) => idx !== i).map((e, idx) => ({ ...e, step_order: idx }));
    onChange(next);
  }

  function updateEntry(i: number, field: string, value: any) {
    const next = entries.map((e, idx) => idx === i ? { ...e, [field]: value } : e);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase flex items-center gap-1">
          <Clock size={12} /> Timeline du voyage
          {entries.length > 0 && <span className="text-primary font-bold">({entries.length} étapes)</span>}
        </p>
        <button type="button" onClick={addEntry}
          className="flex items-center gap-1 text-[10px] font-extrabold text-primary hover:text-primary/80 transition-colors">
          <Plus size={12} /> Ajouter une étape
        </button>
      </div>

      {entries.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          Ajoutez les étapes de votre expérience pour créer une timeline visuelle
        </p>
      )}

      <div className="relative pl-7">
        {entries.length > 0 && (
          <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-primary/30 to-emerald-200/40 rounded-full" />
        )}
        {entries.map((entry, i) => (
          <div key={i} className="relative pb-4 last:pb-0">
            <button type="button" onClick={() => setShowPicker(showPicker === i ? null : i)}
              className="absolute -left-7 top-1 w-6 h-6 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center text-xs shadow-sm hover:border-primary/50 transition-colors cursor-pointer">
              {entry.emoji}
            </button>
            {showPicker === i && (
              <div className="absolute -left-7 top-8 z-10 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 w-48">
                <div className="grid grid-cols-5 gap-1">
                  {EMOJIS.map((e) => (
                    <button key={e} type="button" onClick={() => { updateEntry(i, "emoji", e); setShowPicker(null); }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm hover:bg-primary/10 transition-colors ${entry.emoji === e ? "bg-primary/20 ring-2 ring-primary/30" : ""}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-white border border-slate-100 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input type="text" value={entry.time_label} onChange={(e) => updateEntry(i, "time_label", e.target.value)}
                  placeholder="Ex: 09:30"
                  className="w-20 text-[11px] font-bold text-primary bg-primary/5 border border-primary/10 rounded-lg px-2 py-1 outline-none focus:border-primary/30 text-center" />
                <input type="text" value={entry.title} onChange={(e) => updateEntry(i, "title", e.target.value)}
                  placeholder="Titre de l'étape *"
                  className="flex-1 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-primary/40 placeholder:text-slate-400" />
                <button type="button" onClick={() => removeEntry(i)}
                  className="w-6 h-6 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors shrink-0">
                  <X size={12} />
                </button>
              </div>
              <textarea value={entry.description || ""} onChange={(e) => updateEntry(i, "description", e.target.value)}
                placeholder="Description de cette étape (optionnelle)"
                rows={2}
                className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-primary/40 resize-none placeholder:text-slate-400" />
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Clock size={10} />
                  <input type="number" value={entry.duration_minutes || ""} onChange={(e) => updateEntry(i, "duration_minutes", e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Durée" className="w-14 text-[10px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-primary/40 text-center" />
                  <span>min</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <MapPin size={10} />
                  <input type="number" step="0.1" value={entry.distance_km || ""} onChange={(e) => updateEntry(i, "distance_km", e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Dist." className="w-14 text-[10px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-primary/40 text-center" />
                  <span>km</span>
                </div>
                <select value={entry.transport_mode || ""} onChange={(e) => updateEntry(i, "transport_mode", e.target.value || null)}
                  className="text-[10px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-primary/40 text-slate-600">
                  {TRANSPORTS.map((t) => (
                    <option key={t} value={t.replace(/^[^\s]+\s/, "")}>{t || "Transport"}</option>
                  ))}
                </select>
              </div>
            </div>
            {i < entries.length - 1 && (
              <div className="flex justify-center -mb-1 mt-0.5"><ArrowDown size={10} className="text-slate-300" /></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
