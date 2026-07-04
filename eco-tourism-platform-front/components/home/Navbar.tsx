"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Leaf, Menu, X, MapPin } from "lucide-react";
import { useState } from "react";

type NavbarProps = {
  variant?: "home" | "auth";
  currentPage?: "login" | "register" | null;
  backHref?: string;
};

export default function Navbar({
  variant = "home",
  currentPage = null,
  backHref = "/",
}: NavbarProps) {
  const isAuth = variant === "auth";
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLandingPage = pathname === "/" || pathname === "/how-it-works" || pathname === "/destinations" || pathname === "/eco-projects" || pathname === "/impact" || pathname === "/auth/login" || pathname === "/auth/register" || pathname === "/onboarding/project-owner" || pathname.startsWith("/explore");

  return (
    <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-md px-6 md:px-20 lg:px-40 py-4 ${
      isLandingPage
        ? "border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80"
        : "border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 dark:from-emerald-950/20 dark:via-background-dark dark:to-emerald-950/20"
    }`}>
      <div className="mx-auto flex max-w-[1440px] items-center justify-between">
        <div className="flex items-center gap-4">
          {isAuth && (
            <Link
              href={backHref}
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-black hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
          )}

          <Link
            href="/"
            className="flex items-center gap-2 text-slate-900"
          >
            <Leaf className="text-primary w-8 h-8" />
            <h2 className="text-xl font-extrabold tracking-tight">Éco-Voyage</h2>
          </Link>
        </div>

        {!isAuth && (
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-semibold mr-4 xl:mr-8">
            <Link href="/explore" className="text-sm font-semibold text-black hover:text-primary transition-colors whitespace-nowrap">
              Explorer
            </Link>
            <Link href="/places" className="text-sm font-semibold text-black hover:text-primary transition-colors flex items-center gap-1 whitespace-nowrap">
              <MapPin size={14} /> Lieux
            </Link>
            <Link href="/destinations" className="text-sm font-semibold text-black hover:text-primary transition-colors whitespace-nowrap">
              Destinations
            </Link>
            <Link href="/circuits" className="text-sm font-semibold text-black hover:text-primary transition-colors whitespace-nowrap">
              Circuits
            </Link>
            <Link href="/eco-projects" className="text-sm font-semibold text-black hover:text-primary transition-colors whitespace-nowrap">
              Projets Éco
            </Link>
            <Link href="/how-it-works" className="text-sm font-semibold text-black hover:text-primary transition-colors whitespace-nowrap">
              Comment ça marche
            </Link>
            <Link href="/impact" className="text-sm font-semibold text-black hover:text-primary transition-colors whitespace-nowrap">
              Impact
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/auth/login"
            className={`hidden sm:flex h-11 items-center justify-center rounded-xl px-5 text-sm font-bold transition-all ${
              currentPage === "login"
                ? "bg-slate-200 text-slate-900"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Connexion
          </Link>

          <Link
            href="/auth/register"
            className="flex h-11 items-center justify-center rounded-xl px-6 text-sm font-bold bg-primary text-white shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
          >
            S&apos;inscrire
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-primary transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && !isAuth && (
        <nav className="lg:hidden mt-4 pb-4 border-t border-slate-100 pt-4 flex flex-col gap-3">
          <Link href="/explore" onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-50">
            Explorer
          </Link>
          <Link href="/places" onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-2">
            <MapPin size={14} /> Lieux
          </Link>
          <Link href="/destinations" onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-50">
            Destinations
          </Link>
          <Link href="/circuits" onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-50">
            Circuits
          </Link>
          <Link href="/eco-projects" onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-50">
            Projets Éco
          </Link>
          <Link href="/how-it-works" onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-50">
            Comment ça marche
          </Link>
          <Link href="/impact" onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-50">
            Impact
          </Link>
          <div className="flex gap-2 mt-2 pt-3 border-t border-slate-50">
            <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold">
              Connexion
            </Link>
            <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 rounded-xl bg-primary text-white text-sm font-bold">
              S&apos;inscrire
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
