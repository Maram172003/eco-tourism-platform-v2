"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import StatCard from "../cards/StatCard";
import dynamic from "next/dynamic";
import { Route, MapPin, Users, DollarSign, Star, TrendingUp } from "lucide-react";

const RevenueChart = dynamic(() => import("../charts/RevenueChart"), { ssr: false });
const BarChartComponent = dynamic(() => import("../charts/BarChart"), { ssr: false });
const PieChartComponent = dynamic(() => import("../charts/PieChart"), { ssr: false });

interface GuideAnalytics {
  totalCircuits: number;
  totalReservations: number;
  totalRevenue: number;
  averageRating: number;
  revenueByMonth: { name: string; value: number }[];
  reservationsByMonth: { name: string; value: number }[];
  topCircuits: { name: string; value: number }[];
}

export default function GuideAnalytics({ token }: { token: string }) {
  const [data, setData] = useState<GuideAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [circuits, incoming] = await Promise.all([
          apiFetch<any[]>("/guide/circuits", { headers: { Authorization: `Bearer ${token}` } }).catch(() => []),
          apiFetch<any[]>("/circuits/reservations/incoming", { headers: { Authorization: `Bearer ${token}` } }).catch(() => []),
        ]);

        const totalCircuits = circuits?.length ?? 0;
        const totalReservations = incoming?.length ?? 0;
        const totalRevenue = incoming?.reduce((sum: number, r: any) => sum + (Number(r.final_total) || 0), 0) ?? 0;

        const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
        const now = new Date();

        const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          const month = d.getMonth();
          const year = d.getFullYear();
          const monthRes = incoming?.filter((r: any) => {
            const rd = new Date(r.created_at);
            return rd.getMonth() === month && rd.getFullYear() === year;
          }) ?? [];
          return {
            name: monthNames[month],
            value: monthRes.reduce((sum: number, r: any) => sum + (Number(r.final_total) || 0), 0),
          };
        });

        const reservationsByMonth = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          const month = d.getMonth();
          const year = d.getFullYear();
          return {
            name: monthNames[month],
            value: incoming?.filter((r: any) => {
              const rd = new Date(r.created_at);
              return rd.getMonth() === month && rd.getFullYear() === year;
            }).length ?? 0,
          };
        });

        const circuitCount: Record<string, number> = {};
        incoming?.forEach((r: any) => {
          const title = r.circuit?.title || "Circuit";
          circuitCount[title] = (circuitCount[title] || 0) + 1;
        });
        const topCircuits = Object.entries(circuitCount)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        setData({
          totalCircuits,
          totalReservations,
          totalRevenue,
          averageRating: 4.7,
          revenueByMonth,
          reservationsByMonth,
          topCircuits,
        });
      } catch {}
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-100 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Circuits" value={data.totalCircuits} icon={<Route size={20} />} color="bg-primary/10 text-primary" />
        <StatCard title="Réservations" value={data.totalReservations} icon={<Users size={20} />} color="bg-blue-50 text-blue-600" />
        <StatCard title="Revenus" value={`${data.totalRevenue.toLocaleString()} TND`} icon={<DollarSign size={20} />} color="bg-emerald-50 text-emerald-600" change={15} />
        <StatCard title="Note moyenne" value={data.averageRating} icon={<Star size={20} />} color="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={data.revenueByMonth} title="Revenus par mois" color="#3b6470" />
        <BarChartComponent data={data.reservationsByMonth} title="Réservations par mois" color="#3b6470" label="Réservations" />
      </div>

      {data.topCircuits.length > 0 && (
        <PieChartComponent data={data.topCircuits} title="Top circuits" />
      )}
    </div>
  );
}
