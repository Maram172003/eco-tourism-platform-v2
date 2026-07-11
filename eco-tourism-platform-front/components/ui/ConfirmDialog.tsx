"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Info, CheckCircle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const variantStyles = {
    danger: {
      icon: <AlertTriangle size={24} className="text-red-500" />,
      bg: "bg-red-50",
      btn: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: <Info size={24} className="text-amber-500" />,
      bg: "bg-amber-50",
      btn: "bg-amber-600 hover:bg-amber-700",
    },
    info: {
      icon: <CheckCircle size={24} className="text-blue-500" />,
      bg: "bg-blue-50",
      btn: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const v = variantStyles[variant];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full ${v.bg} flex items-center justify-center`}>
            {v.icon}
          </div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        </div>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-white font-bold text-sm ${v.btn} transition-colors disabled:opacity-50`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Chargement...
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
