"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Leaf, MapPin, ShoppingCart, User, Menu, X, LayoutDashboard, Route, Compass, MessageCircle, Star } from "lucide-react";
import { apiFetch } from "@/lib/api";

type AppNavbarProps = {
  title?: string;
};

export default function AppNavbar({ title }: AppNavbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ full_name?: string; role?: string } | null>(null);
  const [unread, setUnread] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    const token = localStorage.getItem("access_token");
    if (token) {
      apiFetch<number>("/notifications/unread", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((count) => setUnread(count ?? 0))
        .catch(() => {});
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 backdrop-blur-md px-4 md:px-8 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-slate-800"
          >
            <Leaf className="text-primary w-7 h-7" />
            <span className="text-lg font-extrabold tracking-tight hidden sm:inline">Éco-Voyage</span>
          </Link>
          {title && (
            <>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="text-sm font-semibold text-slate-500 hidden sm:inline">{title}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className="hidden lg:flex text-sm font-semibold text-slate-600 hover:text-primary transition-colors px-3 py-1.5"
          >
            <LayoutDashboard size={14} className="mr-1.5" /> Tableau de bord
          </Link>

          {user?.role !== 'guide' && (
            <Link
              href="/circuits"
              className="hidden lg:flex text-sm font-semibold text-slate-600 hover:text-primary transition-colors px-3 py-1.5"
            >
              <Route size={14} className="mr-1.5" /> Circuits
            </Link>
          )}

          <Link
            href="/explore"
            className="hidden lg:flex text-sm font-semibold text-slate-600 hover:text-primary transition-colors px-3 py-1.5"
          >
            <Compass size={14} className="mr-1.5" /> Explorer
          </Link>

          <Link
            href="/places"
            className="hidden lg:flex text-sm font-semibold text-slate-600 hover:text-primary transition-colors px-3 py-1.5"
          >
            <MapPin size={14} className="mr-1.5" /> Lieux
          </Link>

          <Link
            href="/guide/search"
            className="hidden lg:flex text-sm font-semibold text-slate-600 hover:text-primary transition-colors px-3 py-1.5"
          >
            <Star size={14} className="mr-1.5" /> Guides
          </Link>

          {user && (
            <Link
              href="/messagerie"
              className="hidden lg:flex text-sm font-semibold text-slate-600 hover:text-primary transition-colors px-3 py-1.5"
            >
              <MessageCircle size={14} className="mr-1.5" /> Messages
            </Link>
          )}

          <Link
            href="/cart"
            className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-primary transition-all"
          >
            <ShoppingCart size={20} />
          </Link>

          <Link
            href="/notifications"
            className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-primary transition-all"
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </Link>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-all"
          >
            <User size={16} />
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-slate-500 hover:text-primary transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden mt-3 pb-3 border-t border-slate-100 pt-3 flex flex-col gap-1">
          <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <LayoutDashboard size={16} className="text-slate-400" /> Tableau de bord
          </Link>
          <Link href="/explore" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <Compass size={16} className="text-slate-400" /> Explorer
          </Link>
          <Link href="/places" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <MapPin size={16} className="text-slate-400" /> Lieux
          </Link>
          <Link href="/guide/search" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <Star size={16} className="text-slate-400" /> Guides
          </Link>
          {user?.role !== 'guide' && (
            <Link href="/circuits" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              <Route size={16} className="text-slate-400" /> Circuits
            </Link>
          )}
          <Link href="/eco-projects" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <Leaf size={16} className="text-slate-400" /> Éco-Établissements
          </Link>
          {user && (
            <Link href="/messagerie" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              <MessageCircle size={16} className="text-slate-400" /> Messages
            </Link>
          )}
          <Link href="/notifications" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors relative">
            <Bell size={16} className="text-slate-400" /> Notifications
            {unread > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unread > 99 ? "99+" : unread}</span>}
          </Link>
        </nav>
      )}
    </header>
  );
}
