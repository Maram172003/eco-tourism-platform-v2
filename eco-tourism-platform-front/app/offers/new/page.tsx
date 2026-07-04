"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { apiFetch } from "@/lib/api";
import { Loader2 } from "lucide-react";
import AppNavbar from "@/components/nav/AppNavbar";
import BackToDashboard from "@/components/nav/BackToDashboard";

const GuidedOfferWizard = dynamic(
  () => import("@/components/GuidedOfferWizard"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    ),
  }
);

export default function NewOfferPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [userRole, setUserRole] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const tkn = localStorage.getItem("access_token");
    if (!storedUser || !tkn) {
      router.push("/auth/login?redirect=/offers/new");
      return;
    }
    setToken(tkn);
    let role = "";
    try {
      const parsed = JSON.parse(storedUser);
      role = parsed.role || "";
      setUserRole(role);
    } catch { /* ignore */ }

    const apiPath = role === "eco_traveler" ? "/eco-traveler/profile"
      : role === "guide" ? "/guide/profile"
      : "/project-owner/profile";
    apiFetch<any>(apiPath, {
      headers: { Authorization: `Bearer ${tkn}` },
    })
      .then(setProfile)
      .catch(() => {})
      .finally(() => setReady(true));
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <AppNavbar title="Nouvelle offre" />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <BackToDashboard />

        {token && (
          <GuidedOfferWizard
            variant="page"
            token={token}
            userRole={userRole}
            userProjectId={profile?.projects?.[0]?.id}
            userProjectType={profile?.projects?.[0]?.project_type?.[0]}
            userProjects={profile?.projects}
            onClose={() => router.push("/dashboard")}
            onSuccess={(offer) => {
              router.push(`/offers/${offer.id}`);
            }}
          />
        )}
      </div>
    </div>
  );
}
