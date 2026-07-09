"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import StatCard from "../cards/StatCard";
import dynamic from "next/dynamic";
import { Building2, Bed, Users, DollarSign, TrendingUp, Star } from "lucide-react";

const RevenueChart = dynamic(() => import("../charts/RevenueChart"), { ssr: false });
const BarChartComponent = dynamic(() => import("../charts/BarChart"), { ssr: false });
const PieChartComponent = dynamic(() => import("../charts/PieChart"), { ssr: false });

interface ProjectAnalytics {
  totalOffers: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  occupancyRate: number;
  revenueByMonth: { name: string; value: number }[];
  bookingsByMonth: { name: string; value: number }[];
  topOffers: { name: string; value: number }[];
}

export default function ProjectOwnerAnalytics({ token }: { token: string }) {
  const [data, setData] = useState<ProjectAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [offers, incoming] = await Promise.all([
          apiFetch<any[]>("/project-owner/offers", { headers: { Authorization: `Bearer ${token}` } }).catch(() => []),
          apiFetch<any[]>("/circuits/reservations/incoming", { headers: { Authorization: `Bearer ${token}` } }).catch(() => []),
        ]);

        const totalOffers = offers?.length ?? 0;
        const totalBookings = incoming?.length ?? 0;
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

        const bookingsByMonth = Array.from({ length: 6 }, (_, i) => {
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

        const offerCount: Record<string, number> = {};
        incoming?.forEach((r: any) => {
          const title = r.circuit?.title || r.offer?.title || "Offre";
          offerCount[title] = (offerCount[title] || 0) + 1;
        });
        const topOffers = Object.entries(offerCount)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        setData({
          totalOffers,
          totalBookings,
          totalRevenue,
          averageRating: 4.5,
          occupancyRate: totalOffers > 0 ? Math.round((totalBookings / (totalOffers * 30)) * 100) : 0,
          revenueByMonth,
          bookingsByMonth,
          topOffers,
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
        <StatCard title="Offres actives" value={data.totalOffers} icon={<Building2 size={20} />} color="bg-primary/10 text-primary" />
        <StatCard title="Réservations" value={data.totalBookings} icon={<Bed size={20} />} color="bg-blue-50 text-blue-600" />
        <StatCard title="Chiffre d'affaires" value={`${data.totalRevenue.toLocaleString()} TND`} icon={<DollarSign size={20} />} color="bg-emerald-50 text-emerald-600" change={18} />
        <StatCard title="Note moyenne" value={data.averageRating} icon={<Star size={20} />} color="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={data.revenueByMonth} title="Revenus par mois" />
        <BarChartComponent data={data.bookingsByMonth} title="Réservations par mois" label="Réservations" />
      </div>

      {data.topOffers.length > 0 && (
        <PieChartComponent data={data.topOffers} title="Top offres" />
      )}
    </div>
  );
}
