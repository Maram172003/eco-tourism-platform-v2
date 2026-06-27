"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { apiFetch } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) setError("Lien invalide. Veuillez refaire une demande.");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Lien invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Leaf className="text-primary w-8 h-8" />
          <span className="text-xl font-extrabold tracking-tight">Éco-Voyage</span>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">check_circle</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Mot de passe mis à jour !</h1>
              <p className="text-slate-500 font-medium mb-2">
                Votre mot de passe a été réinitialisé avec succès.
              </p>
              <p className="text-sm text-slate-400 mb-6">Redirection vers la connexion...</p>
              <Link
                href="/auth/login"
                className="inline-block px-6 py-3 bg-primary text-slate-900 font-bold rounded-xl hover:bg-primary/90 transition-all"
              >
                Se connecter
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Nouveau mot de passe</h1>
                <p className="text-slate-500 font-medium text-sm">
                  Choisissez un nouveau mot de passe sécurisé.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Nouveau mot de passe</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary text-slate-900 placeholder:text-slate-400 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Confirmer le mot de passe</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary text-slate-900 placeholder:text-slate-400 font-medium"
                    />
                  </div>
                </div>

                {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full py-3.5 bg-primary text-slate-900 font-extrabold rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60"
                >
                  {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/auth/login" className="text-sm text-slate-500 hover:text-primary font-medium transition-colors">
                  ← Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
