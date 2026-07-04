"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, X, Trash2, Plus, Minus, ArrowRight } from "lucide-react";

function getGuestCart(): any[] {
  try { return JSON.parse(localStorage.getItem("guest_cart") || "[]"); } catch { return []; }
}

export default function CartWidget() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setItems(getGuestCart());
    const handler = () => setItems(getGuestCart());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  function updateQty(idx: number, delta: number) {
    const updated = [...items];
    updated[idx].quantity = Math.max(1, (updated[idx].quantity || 1) + delta);
    localStorage.setItem("guest_cart", JSON.stringify(updated));
    setItems(updated);
  }

  function removeItem(idx: number) {
    const updated = [...items];
    updated.splice(idx, 1);
    localStorage.setItem("guest_cart", JSON.stringify(updated));
    setItems(updated);
  }

  const count = items.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-emerald-600 transition-all flex items-center gap-2"
      >
        <ShoppingCart size={22} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-primary" />
                <h2 className="font-bold text-slate-800">Mon panier</h2>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {items.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-12">Votre panier est vide</p>
              )}

              {items.map((item: any, idx: number) => (
                <div key={idx} className="border border-slate-100 rounded-xl p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-full">{item.type === "circuit" ? "circuit" : "offre"}</span>
                      <p className="text-xs text-slate-500 mt-1">Réf: {item.ref_id.slice(0, 8)}…</p>
                    </div>
                    <button onClick={() => removeItem(idx)} className="p-1 text-slate-300 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 border border-slate-200 rounded-lg">
                      <button onClick={() => updateQty(idx, -1)} className="p-1.5 text-slate-400 hover:text-slate-600" disabled={(item.quantity || 1) <= 1}>
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-bold text-slate-700 w-4 text-center">{item.quantity || 1}</span>
                      <button onClick={() => updateQty(idx, 1)} className="p-1.5 text-slate-400 hover:text-slate-600">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {items.length > 0 && (
              <div className="p-4 border-t border-slate-100 sticky bottom-0 bg-white">
                <a
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors"
                >
                  Voir le panier <ArrowRight size={16} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
