"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import StatCard from "../cards/StatCard";
import dynamic from "next/dynamic";
import { Calendar, MapPin, Star, Users } from "lucide-react";

const RevenueChart = dynamic(() => import("../charts/RevenueChart"), { ssr: false });
const BarChartComponent = dynamic(() => import("../charts/BarChart"), { ssr: false });
const PieChartComponent = dynamic(() => import("../charts/PieChart"), { ssr: false });

interface AnalyticsData {
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalTravelers: number;
  revenueByMonth: { name: string; value: number }[];
  bookingsByMonth: { name: string; value: number }[];
  topActivities: { name: string; value: number }[];
}

export default function EcoTravelerAnalytics({ token }: { token: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [bookings, reviews] = await Promise.all([
          apiFetch<any[]>("/bookings/mine", { headers: { Authorization: `Bearer ${token}` } }).catch(() => []),
          apiFetch<any[]>("/reviews/mine", { headers: { Authorization: `Bearer ${token}` } }).catch(() => []),
        ]);

        const totalBookings = bookings?.length ?? 0;
        const totalRevenue = bookings?.reduce((sum: number, b: any) => sum + (Number(b.total_price) || 0), 0) ?? 0;
        const averageRating = reviews?.length
          ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length
          : 0;

        const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
        const now = new Date();

        const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          const month = d.getMonth();
          const year = d.getFullYear();
          const monthBookings = bookings?.filter((b: any) => {
            const bd = new Date(b.created_at);
            return bd.getMonth() === month && bd.getFullYear() === year;
          }) ?? [];
          return {
            name: monthNames[month],
            value: monthBookings.reduce((sum: number, b: any) => sum + (Number(b.total_price) || 0), 0),
          };
        });

        const bookingsByMonth = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          const month = d.getMonth();
          const year = d.getFullYear();
          return {
            name: monthNames[month],
            value: bookings?.filter((b: any) => {
              const bd = new Date(b.created_at);
              return bd.getMonth() === month && bd.getFullYear() === year;
            }).length ?? 0,
          };
        });

        const activityCount: Record<string, number> = {};
        bookings?.forEach((b: any) => {
          const type = b.offer?.offer_type || "Autre";
          activityCount[type] = (activityCount[type] || 0) + 1;
        });
        const topActivities = Object.entries(activityCount)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        setData({
          totalBookings,
          totalRevenue,
          averageRating: Math.round(averageRating * 10) / 10,
          totalTravelers: 1,
          revenueByMonth,
          bookingsByMonth,
          topActivities,
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
        <StatCard title="Voyages" value={data.totalBookings} icon={<Calendar size={20} />} color="bg-primary/10 text-primary" />
        <StatCard title="Dépenses" value={`${data.totalRevenue.toLocaleString()} TND`} icon={<MapPin size={20} />} color="bg-blue-50 text-blue-600" />
        <StatCard title="Note moyenne" value={data.averageRating || "—"} icon={<Star size={20} />} color="bg-amber-50 text-amber-600" />
        <StatCard title="Score durable" value="85%" icon={<Users size={20} />} color="bg-emerald-50 text-emerald-600" change={12} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={data.revenueByMonth} title="Dépenses par mois" color="#3b6470" />
        <BarChartComponent data={data.bookingsByMonth} title="Réservations par mois" color="#3b6470" label="Réservations" />
      </div>

      {data.topActivities.length > 0 && (
        <PieChartComponent data={data.topActivities} title="Activités favorites" />
      )}
    </div>
  );
}
