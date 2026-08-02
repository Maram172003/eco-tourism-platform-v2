"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  Loader2, CalendarDays, AlertTriangle, AlertCircle, CheckCircle2, Sun,
} from "lucide-react";

interface TimeSlot {
  start: string;
  end: string;
}

interface SlotLike {
  type: "specific" | "range" | "recurring";
  dates?: string[];
  start_date?: string;
  end_date?: string;
  days_of_week?: string[];
  time_slots?: Record<string, TimeSlot[]>;
}

interface Conflict {
  userId: string;
  userName: string;
  section: string;
  conflictSlot: string;
  conflictDays: string[];
  conflictTimeSlots: any;
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

interface OfferAgendaSyncProps {
  offerId: string;
  offerTitle: string;
}

export default function OfferAgendaSync({ offerId, offerTitle }: OfferAgendaSyncProps) {
  const [type, setType] = useState<"specific" | "range" | "recurring">("recurring");
  const [dates, setDates] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [conflicts, setConflicts] = useState<Conflict[] | null>(null);
  const [checking, setChecking] = useState(false);

  const buildDispo = (): SlotLike => {
    const timeSlots =
      startTime && endTime ? { "0": [{ start: startTime, end: endTime }] } : null;
    if (type === "specific") {
      return {
        type,
        dates: dates.split(",").map((d) => d.trim()).filter(Boolean),
        time_slots: timeSlots ?? undefined,
      };
    }
    if (type === "range") {
      return {
        type,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        time_slots: timeSlots ?? undefined,
      };
    }
    return {
      type,
      days_of_week: daysOfWeek,
      time_slots: timeSlots ?? undefined,
    };
  };

  const checkConflicts = async () => {
    setChecking(true);
    setError("");
    setSuccess("");
    try {
      const res = await apiFetch<Conflict[]>(
        `/collaborations/offer/${offerId}/collab-conflicts`,
        { method: "POST", body: JSON.stringify({ disponibilite: buildDispo() }) },
      );
      setConflicts(Array.isArray(res) ? res : []);
    } catch (e: any) {
      setError(e.message || "Erreur lors de la vérification");
      setConflicts(null);
    } finally {
      setChecking(false);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await apiFetch<{ message: string }>(
        `/collaborations/offer/${offerId}/availability`,
        { method: "PATCH", body: JSON.stringify({ disponibilite: buildDispo() }) },
      );
      setSuccess(res?.message || "Agenda synchronisé.");
      setConflicts(null);
    } catch (e: any) {
      setError(e.message || "Erreur lors de la synchronisation");
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (i: number) => {
    setDaysOfWeek((prev) => {
      const idx = String(i);
      return prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx];
    });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <CalendarDays size={18} className="text-emerald-600" />
        <h2 className="text-lg font-bold text-slate-800">Agenda de l&apos;offre</h2>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Synchronise la disponibilité de cette offre avec l&apos;agenda de vos collaborateurs
        ({offerTitle}).
      </p>

      {/* Type */}
      <div className="grid grid-cols-3 gap-2 mb-4">
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
            {t === "specific" ? "Dates précises" : t === "range" ? "Plage de dates" : "Récurrent"}
          </button>
        ))}
      </div>

      {type === "specific" && (
        <div className="mb-4">
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
        <div className="grid grid-cols-2 gap-3 mb-4">
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
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Jours de la semaine</label>
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

      {/* Time */}
      <div className="grid grid-cols-2 gap-3 mb-4">
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

      {error && (
        <div className="flex items-start gap-3 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl mb-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-xl mb-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Conflicts */}
      {conflicts && conflicts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <p className="text-sm font-bold text-amber-700">
              {conflicts.length} conflit{conflicts.length > 1 ? "s" : ""} d&apos;agenda détecté{conflicts.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="space-y-2">
            {conflicts.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-white rounded-lg px-3 py-2 border border-amber-100">
                <div>
                  <p className="font-semibold text-slate-700">{c.userName}</p>
                  <p className="text-slate-500">Section : {c.section}</p>
                </div>
                <div className="text-right text-amber-700">
                  <p className="font-semibold">↕ {c.conflictSlot}</p>
                  <p>{c.conflictDays.join(", ")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {conflicts && conflicts.length === 0 && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 text-sm text-emerald-700 font-medium">
          <CheckCircle2 size={16} /> Aucun conflit d&apos;agenda.
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={checkConflicts}
          disabled={checking}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
        >
          {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sun size={16} />}
          Vérifier
        </button>
        <button
          onClick={handleSync}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays size={16} />}
          Synchroniser
        </button>
      </div>
    </div>
  );
}
