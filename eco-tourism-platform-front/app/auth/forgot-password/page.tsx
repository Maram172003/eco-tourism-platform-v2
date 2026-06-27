"use client";

import { useState } from "react";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
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
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">mark_email_read</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Email envoyé !</h1>
              <p className="text-slate-500 font-medium mb-6">
                Si un compte est associé à <strong>{email}</strong>, vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <p className="text-sm text-slate-400 mb-6">Pensez à vérifier vos spams.</p>
              <Link
                href="/auth/login"
                className="inline-block px-6 py-3 bg-primary text-slate-900 font-bold rounded-xl hover:bg-primary/90 transition-all"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Mot de passe oublié ?</h1>
                <p className="text-slate-500 font-medium text-sm">
                  Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Adresse email</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@exemple.com"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary text-slate-900 placeholder:text-slate-400 font-medium"
                    />
                  </div>
                </div>

                {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-primary text-slate-900 font-extrabold rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60"
                >
                  {loading ? "Envoi en cours..." : "Envoyer le lien"}
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
