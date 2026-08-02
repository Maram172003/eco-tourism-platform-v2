"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Check } from "lucide-react";
import type { TaxonomyNode } from "@/lib/offer-taxonomy";

interface Props {
  nodes: TaxonomyNode[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label?: string;
  placeholder?: string;
}

export default function HierarchicalSelect({ nodes, selected, onChange, label, placeholder }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(nodes.map(n => n.value)));

  function toggle(value: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  function isSelected(value: string): boolean {
    return selected.includes(value);
  }

  function handleToggleLeaf(value: string) {
    if (isSelected(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  function getLeafCount(nodes: TaxonomyNode[]): number {
    let count = 0;
    for (const n of nodes) {
      if (n.children) count += getLeafCount(n.children);
      else count++;
    }
    return count;
  }

  function getSelectedLeafCount(nodes: TaxonomyNode[]): number {
    let count = 0;
    for (const n of nodes) {
      if (n.children) count += getSelectedLeafCount(n.children);
      else if (isSelected(n.value)) count++;
    }
    return count;
  }

  function renderNode(node: TaxonomyNode, depth: number = 0) {
    const hasChildren = !!node.children && node.children.length > 0;
    const isExpanded = expanded.has(node.value);

    if (!hasChildren) {
      const sel = isSelected(node.value);
      return (
        <button
          key={node.value}
          type="button"
          onClick={() => handleToggleLeaf(node.value)}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-left transition-all ${
            sel ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"
          }`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          <span className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
            sel ? "bg-primary border-primary" : "border-slate-300"
          }`}>
            {sel && <Check size={10} className="text-white" />}
          </span>
          {node.label}
        </button>
      );
    }

    const leafTotal = getLeafCount(node.children ?? []);
    const leafSelected = getSelectedLeafCount(node.children ?? []);

    return (
      <div key={node.value}>
        <button
          type="button"
          onClick={() => toggle(node.value)}
          className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all"
          style={{ paddingLeft: `${8 + depth * 16}px` }}
        >
          {isExpanded ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />}
          {node.label}
          {leafSelected > 0 && (
            <span className="ml-auto text-[10px] bg-primary/10 text-primary font-semibold px-1.5 py-0.5 rounded-full">
              {leafSelected}/{leafTotal}
            </span>
          )}
        </button>
        {isExpanded && (
          <div className="ml-0">
            {node.children?.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  const totalSelected = selected.length;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
          {label}
          {totalSelected > 0 && (
            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
              {totalSelected} sélectionné{totalSelected > 1 ? "s" : ""}
            </span>
          )}
        </label>
      )}
      <div className="border border-slate-200 rounded-xl bg-white max-h-64 overflow-y-auto p-1.5 space-y-0.5">
        {nodes.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-4">{placeholder || "Aucune option disponible"}</p>
        )}
        {nodes.map((node) => renderNode(node))}
      </div>
    </div>
  );
}
