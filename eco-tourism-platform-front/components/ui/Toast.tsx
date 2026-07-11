"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 4000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = {
    success: <CheckCircle size={18} className="text-emerald-500" />,
    error: <AlertTriangle size={18} className="text-red-500" />,
    info: <Info size={18} className="text-blue-500" />,
  };

  const borders = {
    success: "border-emerald-200",
    error: "border-red-200",
    info: "border-blue-200",
  };

  return (
    <div
      className={`flex items-center gap-3 bg-white border ${borders[toast.type]} rounded-xl px-4 py-3 shadow-lg animate-[slideIn_0.3s_ease-out]`}
      style={{ animation: "slideIn 0.3s ease-out" }}
    >
      {icons[toast.type]}
      <p className="text-sm font-medium text-slate-700 flex-1">{toast.message}</p>
      <button onClick={onRemove} className="text-slate-400 hover:text-slate-600">
        <X size={14} />
      </button>
    </div>
  );
}
