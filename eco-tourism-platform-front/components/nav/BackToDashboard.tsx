"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackToDashboard() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/dashboard")}
      className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-emerald-700 transition-colors mb-4"
    >
      <ArrowLeft size={18} />
      Tableau de bord
    </button>
  );
}
