"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfileRouter() {
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/auth/login"); return; }
    const { role } = JSON.parse(stored) as { role: string };
    if (role === "eco_traveler") router.push("/profile/ecovoyageur");
    else if (role === "guide") router.push("/profile/guide");
    else if (role === "project") router.push("/profile/project-owner");
    else router.push("/auth/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );
}
