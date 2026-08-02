"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface DeclineModalProps {
  onClose: () => void;
  onDecline: (reason: string) => void;
  loading?: boolean;
}

export default function DeclineModal({ onClose, onDecline, loading }: DeclineModalProps) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Refuser l&apos;invitation</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-600">
            Vous pouvez expliquer la raison de votre refus (optionnel).
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex: Je ne suis pas disponible à cette date..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none text-sm resize-none"
          />
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              onClick={() => onDecline(reason)}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Confirmer le refus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
