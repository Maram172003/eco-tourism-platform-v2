"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";

export default function CheckEmailPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-8 border border-slate-200 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Leaf className="text-primary w-7 h-7" />
          <span className="text-xl font-extrabold tracking-tight">Éco-Voyage</span>
        </div>
        <h1 className="text-2xl font-extrabold mb-4 text-slate-900">
          Vérifiez votre email
        </h1>

        <p className="text-slate-600 font-medium mb-6">
          Un email de vérification a été envoyé à votre adresse. Cliquez sur le lien reçu pour activer votre compte.
        </p>

        <p className="text-sm text-slate-500 mb-6">
          Après vérification, vous serez connecté automatiquement.
        </p>

        <Link
          href="/auth/login"
          className="inline-block px-5 py-3 rounded-xl bg-primary text-black font-bold"
        >
          Retour à la connexion
        </Link>
      </div>
    </main>
  );
}