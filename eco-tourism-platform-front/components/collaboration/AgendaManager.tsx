"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import {
  Loader2, Plus, Trash2, CalendarDays, AlertCircle, Sun,
} from "lucide-react";

interface TimeSlot {
  start: string;
  end: string;
}

interface AvailabilitySlot {
  id: string;
  type: string;
  dates: string[] | null;
  start_date: string | null;
  end_date: string | null;
  days_of_week: string[] | null;
  label: string | null;
  time_slots: Record<string, TimeSlot[]> | null;
  created_at: string;
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const TYPE_LABELS: Record<string, string> = {
  specific: "Dates précises",
  range: "Plage de dates",
  recurring: "Jours récurrents",
};

function formatSlot(s: AvailabilitySlot): string {
  if (s.type === "specific" && s.dates?.length) {
    const count = s.dates.length;
    return `${count} date${count > 1 ? "s" : ""} (${s.dates[0]}${count > 1 ? " …" : ""})`;
  }
  if (s.type === "range" && s.start_date && s.end_date) {
    return `Du ${s.start_date} au ${s.end_date}`;
  }
  if (s.type === "recurring" && s.days_of_week?.length) {
    const labels = s.days_of_week
      .map((d) => WEEKDAYS[Number(d)])
      .filter(Boolean);
    return `Tous les ${labels.join(", ")}`;
  }
  return "Créneau";
}

function formatTimes(s: AvailabilitySlot): string {
  if (!s.time_slots) return "Horaires libres";
  const entries = Object.entries(s.time_slots);
  if (!entries.length) return "Horaires libres";
  const ranges: string[] = [];
  for (const [, slots] of entries) {
    for (const t of slots) {
      ranges.push(`${t.start} – ${t.end}`);
    }
  }
  const unique = Array.from(new Set(ranges));
  return unique.length ? unique.join(", ") : "Horaires libres";
}

interface AgendaManagerProps {
  userId: string;
}

export default function AgendaManager({ userId }: AgendaManagerProps) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [type, setType] = useState<"specific" | "range" | "recurring">("recurring");
  const [dates, setDates] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const fetchSlots = useCallback(() => {
    apiFetch<AvailabilitySlot[]>("/collaborations/availability")
      .then(setSlots)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (userId) fetchSlots();
  }, [userId, fetchSlots]);

  const toggleDay = (i: number) => {
    setDaysOfWeek((prev) => {
      const idx = String(i);
      return prev.includes(idx)
        ? prev.filter((d) => d !== idx)
        : [...prev, idx];
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const timeSlots =
        startTime && endTime
          ? { "0": [{ start: startTime, end: endTime }] }
          : null;
      const body: any = {
        type,
        time_slots: timeSlots,
      };
      if (type === "specific") {
        body.dates = dates
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean);
      } else if (type === "range") {
        body.start_date = startDate || null;
        body.end_date = endDate || null;
      } else if (type === "recurring") {
        body.days_of_week = daysOfWeek;
      }
      await apiFetch("/collaborations/availability", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setShowForm(false);
      resetForm();
      fetchSlots();
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'ajout du créneau");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setDates("");
    setStartDate("");
    setEndDate("");
    setDaysOfWeek([]);
    setStartTime("09:00");
    setEndTime("17:00");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce créneau ?")) return;
    try {
      await apiFetch(`/collaborations/availability/${id}`, { method: "DELETE" });
      setSlots((prev) => prev.filter((s) => s.id !== id));
    } catch (e: any) {
      setError(e.message || "Erreur lors de la suppression");
    }
  };

  const isCollabSlot = (s: AvailabilitySlot) =>
    s.label?.startsWith("[Collab]") || s.label?.startsWith("[Offre]");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-start gap-3 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-slate-800 text-base">Mon agenda de disponibilité</h3>
          <p className="text-xs text-slate-500">
            Vos créneaux servent à détecter les conflits avec vos collaborations.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
          >
            <Plus size={16} /> Ajouter un créneau
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white border border-emerald-100 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-800">Nouveau créneau</p>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-sm font-semibold">
              Annuler
            </button>
          </div>

          {/* Type selector */}
          <div className="grid grid-cols-3 gap-2">
            {(["specific", "range", "recurring"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`p-2.5 rounded-xl text-center text-xs font-medium border transition ${
                  type === t
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          {type === "specific" && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Dates (séparées par des virgules, format AAAA-MM-JJ)
              </label>
              <input
                type="text"
                value={dates}
                onChange={(e) => setDates(e.target.value)}
                placeholder="2026-08-10, 2026-08-11"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm"
              />
            </div>
          )}

          {type === "range" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Du</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Au</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm"
                />
              </div>
            </div>
          )}

          {type === "recurring" && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Jours de la semaine
              </label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((d, i) => {
                  const active = daysOfWeek.includes(String(i));
                  return (
                    <button
                      key={i}
                      onClick={() => toggleDay(i)}
                      className={`w-10 h-10 rounded-xl text-xs font-bold border transition ${
                        active
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Début</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Fin</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={16} />}
            Ajouter
          </button>
        </div>
      )}

      {/* Slots list */}
      {slots.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100/80 shadow-sm p-12 text-center">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CalendarDays size={24} className="text-emerald-400" />
          </div>
          <p className="text-slate-800 font-extrabold text-base mb-1">Aucun créneau</p>
          <p className="text-slate-400 text-sm">
            Ajoutez vos disponibilités pour que le système détecte les conflits avec vos collaborations.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {slots.map((s) => {
            const auto = isCollabSlot(s);
            return (
              <div
                key={s.id}
                className={`bg-white border rounded-2xl p-4 flex items-center gap-4 ${
                  auto ? "border-slate-100" : "border-slate-100"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    auto ? "bg-blue-50 text-blue-500" : "bg-emerald-50 text-emerald-500"
                  }`}
                >
                  {s.type === "recurring" ? (
                    <Sun size={18} />
                  ) : (
                    <CalendarDays size={18} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-800">
                      {s.label || formatSlot(s)}
                    </p>
                    {auto && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-medium shrink-0">
                        Automatique
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {TYPE_LABELS[s.type] || s.type} · {formatTimes(s)}
                  </p>
                </div>
                {!auto && (
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 shrink-0"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
