"use client";

import { useState } from "react";
import { X } from "lucide-react";

export interface MyOfferItem {
  id: string; name: string; item_type: string | null; offer_id: string; offer_title: string;
  prices?: { id: string; label: string; price: string; pricing_unit: string }[];
}

export default function OfferItemSearchInline({ items, onSelect, selectedId, onAutoFill }: {
  items: MyOfferItem[];
  onSelect: (id: string | null) => void;
  selectedId: string | null;
  onAutoFill?: (title: string) => void;
}) {
  const [query, setQuery] = useState("");
  const selected = selectedId ? items.find((it) => it.id === selectedId) : null;
  const filtered = query.trim()
    ? items.filter((it) => it.name.toLowerCase().includes(query.toLowerCase()) || it.offer_title.toLowerCase().includes(query.toLowerCase()) || it.item_type?.toLowerCase().includes(query.toLowerCase()))
    : [];

  if (selected && !query) {
    return (
      <div className="flex items-center gap-1.5 bg-primary/5 rounded-lg px-2 py-1">
        <span className="text-[11px] font-medium text-primary">{selected.name}</span>
        <span className="text-[10px] text-slate-400">({selected.item_type || "—"})</span>
        <button type="button" onClick={() => onSelect(null)} className="text-red-400 hover:text-red-600 p-0.5"><X size={12} /></button>
      </div>
    );
  }

  function handlePick(item: MyOfferItem) {
    onSelect(item.id);
    setQuery("");
    if (onAutoFill) onAutoFill(item.name);
  }

  return (
    <div className="relative">
      <input value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder="Chercher une offre..." className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
      {query && filtered.length > 0 && (
        <div className="absolute z-20 top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 p-1 w-full max-h-48 overflow-y-auto">
          {filtered.map((item) => (
            <button key={item.id} type="button" onClick={() => handlePick(item)}
              className="w-full flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-primary/5 text-left border-b border-slate-50 last:border-0">
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-700">{item.name}</div>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  <span className="text-[10px] text-slate-400 bg-slate-50 rounded px-1">{item.item_type || "—"}</span>
                  <span className="text-[10px] text-slate-400">via {item.offer_title}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      {query && filtered.length === 0 && (
        <div className="absolute z-20 top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 p-2 w-full">
          <p className="text-[11px] text-slate-400">Aucune offre trouvée</p>
        </div>
      )}
    </div>
  );
}
