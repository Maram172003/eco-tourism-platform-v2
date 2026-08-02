"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Loader2, Inbox, Plus, AlertCircle } from "lucide-react";
import CollaborationCard from "@/components/collaboration/CollaborationCard";

interface ProviderCollaborationsTabProps {
  userId: string;
  token: string;
}

export default function ProviderCollaborationsTab({ userId, token }: ProviderCollaborationsTabProps) {
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchCollabs = () => {
    Promise.all([
      apiFetch<any[]>("/collaborations/provider"),
      apiFetch<any>("/collaborations/provider/stats").catch(() => null),
    ])
      .then(([collabs, s]) => {
        setCollaborations(collabs);
        setStats(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (token) fetchCollabs();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  const pending = collaborations.filter((c) => c.status === "pending");
  const active = collaborations.filter((c) => c.status === "accepted" || c.status === "completed");
  const past = collaborations.filter((c) => c.status === "declined" || c.status === "cancelled");

  return (
    <div className="space-y-6">
      {/* Error */}
      {actionError && (
        <div className="flex items-start gap-3 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-slate-800" },
            { label: "En attente", value: stats.pending, color: "text-amber-600" },
            { label: "Actives", value: stats.accepted, color: "text-blue-600" },
            { label: "Complétées", value: stats.completed, color: "text-emerald-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-3 text-center">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pending responses */}
      {pending.length > 0 && (
        <div>
          <h3 className="text-xs font-black uppercase text-amber-500 tracking-widest mb-3">
            En attente de réponse ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map((c) => (
              <CollaborationCard
                key={c.id}
                collaboration={c}
                role="provider"
                onAction={(action) => {
                  if (action === "cancel") {
                    if (!confirm("Voulez-vous vraiment annuler cette invitation ?")) return;
                    setActionError(null);
                    apiFetch(`/collaborations/${c.id}`, { method: "DELETE" })
                      .then(() => fetchCollabs())
                      .catch((e) => setActionError(e.message || "Erreur lors de l'annulation"));
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active */}
      {active.length > 0 && (
        <div>
          <h3 className="text-xs font-black uppercase text-emerald-500 tracking-widest mb-3">
            Collaborations actives ({active.length})
          </h3>
          <div className="space-y-3">
            {active.map((c) => (
              <CollaborationCard
                key={c.id}
                collaboration={c}
                role="provider"
                onAction={(action) => {
                  if (action === "kick") {
                    if (!confirm("Retirer ce collaborateur ? Sa contribution sera supprimée.")) return;
                    setActionError(null);
                    apiFetch(`/collaborations/${c.id}/kick`, { method: "PATCH" })
                      .then(() => fetchCollabs())
                      .catch((e) => setActionError(e.message || "Erreur lors du retrait"));
                  } else if (action === "cancel") {
                    if (!confirm("Voulez-vous vraiment annuler cette collaboration active ?")) return;
                    setActionError(null);
                    apiFetch(`/collaborations/${c.id}`, { method: "DELETE" })
                      .then(() => fetchCollabs())
                      .catch((e) => setActionError(e.message || "Erreur lors de l'annulation"));
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3">
            Historique ({past.length})
          </h3>
          <div className="space-y-3">
            {past.map((c) => (
              <CollaborationCard
                key={c.id}
                collaboration={c}
                role="provider"
              />
            ))}
          </div>
        </div>
      )}

      {collaborations.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-100/80 shadow-sm p-12 text-center">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox size={24} className="text-emerald-400" />
          </div>
          <p className="text-slate-800 font-extrabold text-base mb-1">Aucune collaboration</p>
          <p className="text-slate-400 text-sm mb-4">
            Invitez des guides à collaborer sur vos offres depuis la page de détail d&apos;une offre.
          </p>
          <Link
            href="/offers"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700"
          >
            <Plus size={16} /> Voir mes offres
          </Link>
        </div>
      )}
    </div>
  );
}
