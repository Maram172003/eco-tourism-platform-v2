"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  Plus, Leaf, MapPin, Calendar, ChevronRight, Trash2,
  MoreHorizontal, Clock, AlertCircle,
} from "lucide-react";
import AppNavbar from "@/components/nav/AppNavbar";
import BackToDashboard from "@/components/nav/BackToDashboard";

interface TripPlan {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  items: TripPlanItem[];
}

interface TripPlanItem {
  id: string;
  day_number: number | null;
  sort_order: number;
  notes: string | null;
  offerItem: {
    id: string;
    name: string;
    item_type: string | null;
    offer: { title: string; region: string | null } | null;
  } | null;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  planning: "En planification",
  confirmed: "Confirmé",
  completed: "Terminé",
  cancelled: "Annulé",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  planning: "bg-blue-100 text-blue-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function TripPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<TripPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const loadPlans = () => {
    setLoading(true);
    apiFetch<TripPlan[]>("/trip-plans/mine")
      .then(setPlans)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/auth/login"); return; }
    loadPlans();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce plan de voyage ?")) return;
    try {
      await apiFetch(`/trip-plans/${id}`, { method: "DELETE" });
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      alert(e.message);
    }
    setMenuOpen(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <AppNavbar title="Trip Plans" />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <BackToDashboard />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Leaf size={24} className="text-primary" />
              Mes Plans de Voyage
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Organisez vos activités et réservez en une fois
            </p>
          </div>
          <button
            onClick={() => router.push("/trip-plans/new")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
          >
            <Plus size={18} />
            Nouveau plan
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20">
            <Leaf size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 font-medium mb-1">Aucun plan de voyage</p>
            <p className="text-slate-400 text-sm mb-6">
              Créez votre premier plan pour organiser vos activités durables
            </p>
            <button
              onClick={() => router.push("/trip-plans/new")}
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-emerald-600"
            >
              Créer un plan
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => {
              const itemCount = plan.items?.length ?? 0;
              const offerNames = plan.items
                ?.map((i) => i.offerItem?.offer?.title ?? i.offerItem?.name ?? "")
                .filter(Boolean)
                .slice(0, 2);

              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer relative"
                  onClick={() => router.push(`/trip-plans/${plan.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-800 text-lg truncate">{plan.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[plan.status] ?? "bg-slate-100 text-slate-500"}`}>
                          {STATUS_LABELS[plan.status] ?? plan.status}
                        </span>
                      </div>
                      {plan.description && (
                        <p className="text-slate-500 text-sm line-clamp-1 mb-2">{plan.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        {plan.start_date && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(plan.start_date).toLocaleDateString("fr-FR")}
                            {plan.end_date && ` — ${new Date(plan.end_date).toLocaleDateString("fr-FR")}`}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {itemCount} élément{itemCount !== 1 ? "s" : ""}
                        </span>
                        {offerNames.length > 0 && (
                          <span className="flex items-center gap-1 text-slate-400 truncate max-w-xs">
                            <MapPin size={12} />
                            {offerNames.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <ChevronRight size={18} className="text-slate-300" />
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === plan.id ? null : plan.id); }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {menuOpen === plan.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1 min-w-[140px] z-10">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(plan.id); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={14} /> Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
