"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const user = searchParams.get("user");

    if (!accessToken || !refreshToken || !user) {
      router.push("/auth/login");
      return;
    }

    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem("user", user);

    const parsedUser = JSON.parse(user);

    // Check for stored redirect URL (from pre-login cart flow)
    const storedRedirect = localStorage.getItem("post_login_redirect");
    if (storedRedirect) {
      localStorage.removeItem("post_login_redirect");
      router.push(storedRedirect);
      return;
    }

    // Vérifier si l'utilisateur a déjà complété l'onboarding
    const profileApi = parsedUser.role === "eco_traveler" ? "/eco-traveler/profile"
      : parsedUser.role === "guide" ? "/guide/profile"
      : "/providers/profile";

    const onboardingRoutes: Record<string, string> = {
      eco_traveler: "/onboarding/eco-traveler",
      guide: "/onboarding/guide",
      provider: "/onboarding/provider",
    };

    ;(async () => {
      try {
        const { apiFetch } = await import("@/lib/api");
        const profile = await apiFetch<any>(profileApi, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (profile?.is_onboarded) {
          router.push(storedRedirect || "/dashboard");
          return;
        }
      } catch {}
      router.push(onboardingRoutes[parsedUser.role] || "/dashboard");
    })();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-slate-500 font-medium">Connexion en cours…</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
