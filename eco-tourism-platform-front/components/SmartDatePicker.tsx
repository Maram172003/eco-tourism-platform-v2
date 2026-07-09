"use client";

import { useState, useMemo } from "react";
import { Calendar, Clock, X, Plus, Sparkles } from "lucide-react";

interface AvailabilityRule {
  availability_type: string;
  start_date: string | null;
  end_date: string | null;
  weekdays: number[] | null;
  start_time: string | null;
  end_time: string | null;
  recurrence_rule: string | null;
}

interface SmartDatePickerProps {
  rules: AvailabilityRule[];
  onChange: (rules: AvailabilityRule[]) => void;
}

const WEEKDAY_NAMES = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const WEEKDAY_NAMES_FULL = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

const PRESETS = [
  { label: "Date unique", icon: "📅", type: "single", desc: "Un seul jour précis" },
  { label: "Plusieurs dates", icon: "📆", type: "multiple", desc: "Jours spécifiques" },
  { label: "Chaque semaine", icon: "🔄", type: "weekly", desc: "Jours fixes par semaine" },
  { label: "Chaque année", icon: "🎉", type: "yearly", desc: "Événement annuel" },
  { label: "Personnalisé", icon: "⚙️", type: "custom", desc: "Règle avancée (RRULE)" },
] as const;

type PresetType = typeof PRESETS[number]["type"];

/** Estime le nombre de sessions que la règle va générer (sur 90 jours) */
function estimateSessionCount(rule: AvailabilityRule): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + 90);

  switch (rule.availability_type) {
    case "date_range": {
      if (!rule.start_date || !rule.end_date) return 0;
      const start = new Date(rule.start_date);
      const end = new Date(rule.end_date);
      let count = 0;
      for (let d = new Date(start); d <= end && d <= maxDate; d.setDate(d.getDate() + 1)) {
        if (d < now) continue;
        if (rule.weekdays?.length && !rule.weekdays.includes(d.getDay())) continue;
        count++;
      }
      return count;
    }
    case "weekly": {
      const days = rule.weekdays ?? [1, 2, 3, 4, 5];
      const msPerDay = 86400000;
      const totalDays = Math.min(90, Math.ceil((maxDate.getTime() - now.getTime()) / msPerDay));
      return Math.floor((totalDays * days.length) / 7);
    }
    case "daily":
      return 90;
    case "weekend_only":
      return 90 * 2 / 7 | 0;
    case "yearly":
      return 1;
    case "custom": {
      if (!rule.recurrence_rule) return 0;
      const freq = rule.recurrence_rule.match(/FREQ=(\w+)/)?.[1];
      if (freq === "WEEKLY") {
        const byDay = rule.recurrence_rule.match(/BYDAY=([\w,]+)/)?.[1]?.split(",") ?? [];
        return Math.floor((90 * byDay.length) / 7);
      }
      if (freq === "YEARLY") return 1;
      return 0;
    }
    default:
      return 0;
  }
}

/** Génère un résumé lisible de la règle */
function describeRule(rule: AvailabilityRule): string {
  switch (rule.availability_type) {
    case "date_range": {
      if (!rule.start_date) return "Période non définie";
      const start = new Date(rule.start_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
      if (rule.start_date === rule.end_date) {
        const time = rule.start_time && rule.end_time ? ` de ${rule.start_time} à ${rule.end_time}` : "";
        return `Le ${start}${time}`;
      }
      const end = rule.end_date ? new Date(rule.end_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "...";
      const days = rule.weekdays?.length ? `, ${rule.weekdays.map((d) => WEEKDAY_NAMES_FULL[d]).join(", ")}` : "";
      const time = rule.start_time && rule.end_time ? ` (${rule.start_time}-${rule.end_time})` : "";
      return `Du ${start} au ${end}${days}${time}`;
    }
    case "weekly": {
      const days = rule.weekdays?.length ? rule.weekdays.map((d) => WEEKDAY_NAMES_FULL[d]).join(", ") : "tous les jours";
      const time = rule.start_time && rule.end_time ? ` de ${rule.start_time} à ${rule.end_time}` : "";
      return `Chaque ${days}${time}`;
    }
    case "daily":
      return `Tous les jours${rule.start_time && rule.end_time ? ` de ${rule.start_time} à ${rule.end_time}` : ""}`;
    case "weekend_only":
      return `Samedis et dimanches${rule.start_time && rule.end_time ? ` (${rule.start_time}-${rule.end_time})` : ""}`;
    case "yearly":
      return `Événement annuel${rule.start_date ? ` (${new Date(rule.start_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })})` : ""}`;
    case "custom":
      return rule.recurrence_rule ? `Règle: ${rule.recurrence_rule}` : "Règle personnalisée";
    default:
      return "Non défini";
  }
}

function DateRangePicker({ rule, onChange }: { rule: AvailabilityRule; onChange: (r: AvailabilityRule) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="text-[10px] text-slate-400 mb-0.5 block">Du</label>
        <input
          type="date"
          value={rule.start_date ?? ""}
          onChange={(e) => onChange({ ...rule, start_date: e.target.value || null })}
          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>
      <div>
        <label className="text-[10px] text-slate-400 mb-0.5 block">Au</label>
        <input
          type="date"
          value={rule.end_date ?? ""}
          onChange={(e) => onChange({ ...rule, end_date: e.target.value || null })}
          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>
    </div>
  );
}

function WeekdayPicker({ rule, onChange }: { rule: AvailabilityRule; onChange: (r: AvailabilityRule) => void }) {
  const selected = rule.weekdays ?? [];
  const toggle = (day: number) => {
    const next = selected.includes(day) ? selected.filter((d) => d !== day) : [...selected, day].sort();
    onChange({ ...rule, weekdays: next.length ? next : null });
  };

  return (
    <div className="flex gap-1">
      {WEEKDAY_NAMES.map((name, i) => (
        <button
          key={i}
          type="button"
          onClick={() => toggle(i)}
          className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-colors ${
            selected.includes(i)
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  );
}

function TimeRangePicker({ rule, onChange }: { rule: AvailabilityRule; onChange: (r: AvailabilityRule) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1"><Clock size={10} /> Début</label>
        <input
          type="time"
          value={rule.start_time ?? ""}
          onChange={(e) => onChange({ ...rule, start_time: e.target.value || null })}
          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>
      <div>
        <label className="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1"><Clock size={10} /> Fin</label>
        <input
          type="time"
          value={rule.end_time ?? ""}
          onChange={(e) => onChange({ ...rule, end_time: e.target.value || null })}
          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>
    </div>
  );
}

function SingleDatePicker({ rule, onChange }: { rule: AvailabilityRule; onChange: (r: AvailabilityRule) => void }) {
  return (
    <div className="space-y-2">
      <div>
        <label className="text-[10px] text-slate-400 mb-0.5 block">Date</label>
        <input
          type="date"
          value={rule.start_date ?? ""}
          onChange={(e) => onChange({ ...rule, start_date: e.target.value || null, end_date: e.target.value || null })}
          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>
      <TimeRangePicker rule={rule} onChange={onChange} />
    </div>
  );
}

function YearlyPicker({ rule, onChange }: { rule: AvailabilityRule; onChange: (r: AvailabilityRule) => void }) {
  return (
    <div className="space-y-2">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
        <p className="text-[10px] text-amber-700 font-medium">
          📅 Chaque année — Les dates seront répétées automatiquement
        </p>
      </div>
      <DateRangePicker rule={rule} onChange={onChange} />
      <TimeRangePicker rule={rule} onChange={onChange} />
    </div>
  );
}

export default function SmartDatePicker({ rules, onChange }: SmartDatePickerProps) {
  const [activePreset, setActivePreset] = useState<PresetType>("single");
  const [showPresets, setShowPresets] = useState(true);

  const totalEstimatedSessions = useMemo(
    () => rules.reduce((sum, rule) => sum + estimateSessionCount(rule), 0),
    [rules],
  );

  const createRule = (type: PresetType): AvailabilityRule => {
    const now = new Date().toISOString().split("T")[0];
    const base: AvailabilityRule = {
      availability_type: "custom",
      start_date: null,
      end_date: null,
      weekdays: null,
      start_time: null,
      end_time: null,
      recurrence_rule: null,
    };

    switch (type) {
      case "single":
        return { ...base, availability_type: "date_range", start_date: now, end_date: now };
      case "multiple":
        return { ...base, availability_type: "date_range", start_date: now, end_date: now };
      case "weekly":
        return { ...base, availability_type: "weekly", weekdays: [6], start_time: "09:00", end_time: "17:00" };
      case "yearly":
        return { ...base, availability_type: "yearly", start_date: now, end_date: now, recurrence_rule: "FREQ=YEARLY" };
      default:
        return base;
    }
  };

  const handlePresetSelect = (type: PresetType) => {
    setActivePreset(type);
    if (type === "multiple") {
      onChange([createRule("single")]);
    } else {
      onChange([createRule(type)]);
    }
    setShowPresets(false);
  };

  const handleUpdateRule = (index: number, updated: AvailabilityRule) => {
    const next = [...rules];
    next[index] = updated;
    onChange(next);
  };

  const addRule = () => {
    onChange([...rules, createRule("single")]);
  };

  const removeRule = (index: number) => {
    if (rules.length <= 1) return;
    onChange(rules.filter((_, i) => i !== index));
  };

  const getPresetLabel = (rule: AvailabilityRule): string => {
    switch (rule.availability_type) {
      case "weekly": return "🔄 Hebdomadaire";
      case "yearly": return "🎉 Annuel";
      case "daily": return "📌 Quotidien";
      case "weekend_only": return "🌴 Week-end";
      case "date_range":
        if (rule.weekdays?.length) return "🌊 Saisonnière";
        if (rule.start_date === rule.end_date) return "📅 Date unique";
        return "📆 Période";
      default: return "⚙️ Personnalisé";
    }
  };

  if (showPresets) {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
            <Calendar size={14} /> Disponibilités
          </label>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Définissez quand votre offre sera disponible à la réservation
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.type}
              type="button"
              onClick={() => handlePresetSelect(p.type)}
              className="flex flex-col items-center gap-1 p-3 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all text-center"
            >
              <span className="text-lg">{p.icon}</span>
              <span className="text-[10px] font-semibold text-slate-600">{p.label}</span>
              <span className="text-[9px] text-slate-400">{p.desc}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
            <Calendar size={14} /> Disponibilités
          </label>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {describeRule(rules[0])}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowPresets(true)}
          className="text-[10px] text-primary hover:text-emerald-700 font-medium"
        >
          Changer le type
        </button>
      </div>

      {rules.map((rule, idx) => (
        <div key={idx} className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500">
              {getPresetLabel(rule)} {rules.length > 1 ? `#${idx + 1}` : ""}
            </span>
            {rules.length > 1 && (
              <button type="button" onClick={() => removeRule(idx)} className="text-slate-400 hover:text-red-500">
                <X size={12} />
              </button>
            )}
          </div>

          {(activePreset === "single" || rule.availability_type === "date_range" && rule.start_date === rule.end_date) && (
            <SingleDatePicker rule={rule} onChange={(r) => handleUpdateRule(idx, r)} />
          )}

          {activePreset === "weekly" && (
            <div className="space-y-2">
              <WeekdayPicker rule={rule} onChange={(r) => handleUpdateRule(idx, r)} />
              <TimeRangePicker rule={rule} onChange={(r) => handleUpdateRule(idx, r)} />
            </div>
          )}

          {activePreset === "yearly" && (
            <YearlyPicker rule={rule} onChange={(r) => handleUpdateRule(idx, r)} />
          )}

          {(activePreset === "custom" || activePreset === "multiple") && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 mb-0.5 block">Type</label>
                  <select
                    value={rule.availability_type}
                    onChange={(e) => handleUpdateRule(idx, { ...rule, availability_type: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  >
                    <option value="date_range">Période</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="daily">Quotidien</option>
                    <option value="weekend_only">Weekends</option>
                    <option value="yearly">Annuel</option>
                    <option value="custom">Personnalisé</option>
                  </select>
                </div>
                <div />
              </div>
              <DateRangePicker rule={rule} onChange={(r) => handleUpdateRule(idx, r)} />
              <WeekdayPicker rule={rule} onChange={(r) => handleUpdateRule(idx, r)} />
              <TimeRangePicker rule={rule} onChange={(r) => handleUpdateRule(idx, r)} />
            </div>
          )}
        </div>
      ))}

      {activePreset === "multiple" && (
        <button
          type="button"
          onClick={addRule}
          className="flex items-center gap-1 text-xs text-primary hover:text-emerald-700 font-medium"
        >
          <Plus size={12} /> Ajouter une date
        </button>
      )}

      {/* Estimation des sessions */}
      {totalEstimatedSessions > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-start gap-2">
          <Sparkles size={14} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-slate-700">
              ~{totalEstimatedSessions} session{totalEstimatedSessions > 1 ? "s" : ""} seront générées
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Sur les 90 prochains jours. Les sessions seront créées automatiquement lors de la publication.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
