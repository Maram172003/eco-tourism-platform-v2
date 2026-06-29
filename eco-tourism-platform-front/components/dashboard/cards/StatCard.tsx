"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: string;
}

export default function StatCard({ title, value, change, icon, color = "bg-primary/10 text-primary" }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-extrabold text-slate-900">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{isPositive ? "+" : ""}{change}%</span>
              <span className="text-slate-400 font-normal">vs mois dernier</span>
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
