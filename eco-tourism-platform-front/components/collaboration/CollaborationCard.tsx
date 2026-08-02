"use client";

import { Clock, CheckCircle, XCircle, AlertCircle, Loader2, User } from "lucide-react";

interface CollaborationCardProps {
  collaboration: any;
  role: "provider" | "guide";
  onAction?: (action: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "En attente", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  accepted: { label: "Acceptée", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle },
  completed: { label: "Complétée", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
  declined: { label: "Refusée", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  cancelled: { label: "Annulée", color: "bg-slate-50 text-slate-500 border-slate-200", icon: AlertCircle },
};

const SECTION_LABELS: Record<string, string> = {
  randonnee: "Randonnée / Nature",
  visite_culturelle: "Visite culturelle",
  guide_tour: "Guide touristique",
  transport: "Transport / Transfert",
  accompagnement: "Accompagnement",
  photographie: "Photographie",
  gastronomie: "Gastronomie / Dégustation",
  bien_etre: "Bien-être / Méditation",
  autre: "Autre",
};

export default function CollaborationCard({
  collaboration,
  role,
  onAction,
}: CollaborationCardProps) {
  const st = STATUS_CONFIG[collaboration.status] ?? STATUS_CONFIG.pending;
  const Icon = st.icon;
  const person =
    role === "provider" ? collaboration.guide : collaboration.provider;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-sm font-bold text-emerald-700 overflow-hidden">
            {person?.photo ? (
              <img
                src={person.photo}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : person?.full_name ? (
              person.full_name.charAt(0)
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {person?.full_name || "Utilisateur"}
            </p>
            <p className="text-xs text-slate-500">
              {role === "provider" ? "Guide" : "Prestataire"}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${st.color}`}
        >
          <Icon className="w-3.5 h-3.5" />
          {st.label}
        </span>
      </div>

      {/* Offer & Section */}
      <div className="mb-3">
        <p className="text-sm text-slate-700 font-medium truncate">
          {collaboration.offer?.title || "Offre"}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          {SECTION_LABELS[collaboration.section] || collaboration.section}
        </p>
      </div>

      {/* Message */}
      {collaboration.message && (
        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3 mb-3 line-clamp-2">
          &ldquo;{collaboration.message}&rdquo;
        </p>
      )}

      {/* Contribution summary */}
      {collaboration.contribution && (
        <div className="bg-emerald-50 rounded-lg p-3 mb-3">
          <p className="text-xs font-semibold text-emerald-700 mb-1">
            Contribution du guide
          </p>
          <div className="flex flex-wrap gap-2">
            {collaboration.contribution.services?.map((s: string, i: number) => (
              <span key={i} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
            {collaboration.contribution.price != null && (
              <span className="text-xs font-semibold text-emerald-700">
                {collaboration.contribution.price} {collaboration.contribution.currency || "TND"}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Decline reason */}
      {collaboration.decline_reason && (
        <p className="text-xs text-red-500 bg-red-50 rounded-lg p-3 mb-3">
          Raison du refus : {collaboration.decline_reason}
        </p>
      )}

      {/* Actions */}
      {role === "guide" &&
        collaboration.status === "pending" &&
        onAction && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onAction("decline")}
              className="flex-1 py-2 rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Refuser
            </button>
            <button
              onClick={() => onAction("accept")}
              className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
            >
              Accepter
            </button>
          </div>
        )}

      {role === "guide" &&
        collaboration.status === "accepted" &&
        onAction && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onAction("withdraw")}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Quitter
            </button>
            <button
              onClick={() => onAction("contribute")}
              className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              Remplir ma contribution
            </button>
          </div>
        )}

      {role === "guide" &&
        collaboration.status === "completed" &&
        onAction && (
          <button
            onClick={() => onAction("withdraw")}
            className="w-full mt-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Quitter la collaboration
          </button>
        )}

      {role === "provider" &&
        (collaboration.status === "pending" || collaboration.status === "accepted") &&
        onAction && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onAction("cancel")}
              className="flex-1 py-2 rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Annuler
            </button>
            {collaboration.status === "accepted" && (
              <button
                onClick={() => onAction("kick")}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Retirer
              </button>
            )}
          </div>
        )}

      {role === "provider" &&
        collaboration.status === "completed" &&
        onAction && (
          <button
            onClick={() => onAction("kick")}
            className="w-full mt-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Retirer le collaborateur
          </button>
        )}
    </div>
  );
}
