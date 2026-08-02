"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Loader2, Inbox, AlertCircle } from "lucide-react";
import CollaborationCard from "@/components/collaboration/CollaborationCard";
import CollaborationWizard from "@/components/collaboration/CollaborationWizard";
import DeclineModal from "@/components/collaboration/DeclineModal";

interface GuideCollaborationsTabProps {
  userId: string;
  token: string;
}

export default function GuideCollaborationsTab({ userId, token }: GuideCollaborationsTabProps) {
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState<string | null>(null);
  const [declineCollab, setDeclineCollab] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchCollabs = () => {
    apiFetch<any[]>("/collaborations/guide")
      .then(setCollaborations)
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

      {/* Pending invitations */}
      {pending.length > 0 && (
        <div>
          <h3 className="text-xs font-black uppercase text-amber-500 tracking-widest mb-3">
            En attente ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map((c) => (
              <CollaborationCard
                key={c.id}
                collaboration={c}
                role="guide"
                onAction={(action) => {
                  if (action === "accept") {
                    setActionError(null);
                    apiFetch(`/collaborations/${c.id}/respond`, {
                      method: "PATCH",
                      body: JSON.stringify({ accept: true }),
                    })
                      .then(() => fetchCollabs())
                      .catch((e) => setActionError(e.message || "Erreur lors de l'acceptation"));
                  } else if (action === "decline") {
                    setDeclineCollab(c.id);
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active collaborations */}
      {active.length > 0 && (
        <div>
          <h3 className="text-xs font-black uppercase text-emerald-500 tracking-widest mb-3">
            En cours ({active.length})
          </h3>
          <div className="space-y-3">
            {active.map((c) => (
              <CollaborationCard
                key={c.id}
                collaboration={c}
                role="guide"
                onAction={(action) => {
                  if (action === "contribute") {
                    setShowWizard(c.id);
                  } else if (action === "withdraw") {
                    if (!confirm("Quitter cette collaboration ? Votre contribution sera supprimée.")) return;
                    setActionError(null);
                    apiFetch(`/collaborations/${c.id}/withdraw`, { method: "PATCH" })
                      .then(() => fetchCollabs())
                      .catch((e) => setActionError(e.message || "Erreur lors du retrait"));
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
                role="guide"
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
          <p className="text-slate-400 text-sm">
            Les prestataires pourront vous inviter à collaborer sur leurs offres.
          </p>
        </div>
      )}

      {showWizard && (
        <CollaborationWizard
          collaborationId={showWizard}
          initialData={collaborations.find((c) => c.id === showWizard)?.contribution}
          onComplete={() => {
            setShowWizard(null);
            fetchCollabs();
          }}
          onCancel={() => setShowWizard(null)}
        />
      )}

      {declineCollab && (
        <DeclineModal
          onClose={() => setDeclineCollab(null)}
          onDecline={async (reason) => {
            await apiFetch(`/collaborations/${declineCollab}/respond`, {
              method: "PATCH",
              body: JSON.stringify({ accept: false, decline_reason: reason }),
            });
            fetchCollabs();
            setDeclineCollab(null);
          }}
        />
      )}
    </div>
  );
}
