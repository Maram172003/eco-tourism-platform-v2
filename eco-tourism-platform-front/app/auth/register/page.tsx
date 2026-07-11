"use client";

import Navbar from "@/components/home/Navbar";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<"eco_traveler" | "provider" | "guide">("eco_traveler");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  function validate(): boolean {
    const errs: { email?: string; password?: string; confirmPassword?: string } = {};
    if (!email.trim()) {
      errs.email = "L'email est requis.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Format d'email invalide.";
    }
    if (!password) {
      errs.password = "Le mot de passe est requis.";
    } else if (password.length < 8) {
      errs.password = "Le mot de passe doit contenir au moins 8 caractères.";
    } else if (!/(?=.*[a-z])/.test(password)) {
      errs.password = "Le mot de passe doit contenir au moins une minuscule.";
    } else if (!/(?=.*[A-Z])/.test(password)) {
      errs.password = "Le mot de passe doit contenir au moins une majuscule.";
    } else if (!/(?=.*\d)/.test(password)) {
      errs.password = "Le mot de passe doit contenir au moins un chiffre.";
    }
    if (!confirmPassword) {
      errs.confirmPassword = "La confirmation est requise.";
    } else if (password !== confirmPassword) {
      errs.confirmPassword = "Les mots de passe ne correspondent pas.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!validate()) return;
    if (!termsAccepted) {
      setError("Vous devez accepter les conditions.");
      return;
    }

    try {
      setLoading(true);

      const result = await registerUser({
        email,
        password,
        role,
      });

      router.push("/auth/check-email");
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container">
      {/* TopAppBar */}
      <Navbar variant="auth" currentPage="register" backHref="/" />



      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-tertiary/5 blur-3xl rounded-full translate-x-1/3 translate-y-1/3"></div>

        <div className="w-full max-w-[1100px] grid md:grid-cols-2 bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden relative z-10 border border-outline-variant/30">
          {/* Left Side */}
          <div className="hidden md:block relative h-full min-h-[600px]">
            <img
              alt="Paysage naturel"
              className="absolute inset-0 w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCN6tiV3dBSYxTvOXc-dOPFD0dt3jN014897IcLpaqpnZcQvaV7SwmflJnLdnU5ZRbKefXlfKtP4hKxhMxP_BRWz4KsNInID_S7OidKVdJHMN3E0owyrDQmwPqQVFSrgELDsUlMaA_zfoWzLXHWSCkRHHUyzclC8xN1FSoUveoZSxEfXBT6IoI_RmTnzLUpazuEzp57PRLClpH8m17WCLM8FRqn-fppSgvvd2SfkPk43P3a-GTigO3DEgO71krkxiU4k4BIf9njQlI"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex flex-col justify-end p-12 text-white">
              <h1 className="text-4xl font-extrabold mb-4 leading-tight">
                Rejoignez la révolution du voyage durable.
              </h1>
              <p className="text-lg font-medium opacity-90 max-w-sm">
                Découvrez des destinations uniques, soutenez des projets locaux et réduisez votre empreinte carbone.
              </p>

              <div className="mt-8 flex gap-4">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                    <img
                      alt="Utilisateur"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXwzaeggaUZfoICPDfCywb1LMgBgP-IIi2inuZ1bZT4GFGTxIaGiTwbvAMQ642grVieA5EmhnJsIl0z9eNHnVqdx0im9vqWngSD1eduBYLKBfIe0APzWz1epUfoPMYuP7PeUBK17FIpEa68sFIwr3TUayGW-BrDPjaJIdSeMoLiE-YLlndCNK5Bjm6m33mNbbzwkzJ2VvCgbi8_8z0magbCOG6jj10iS12Kq4rA58PwkVauQM11MgewBztYDCtNXAxX56Ith0VRGM"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                    <img
                      alt="Utilisateur"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXabqEWeCIgjDxqy8BieBYrd4Y7RbNm3OIAS_brPJ_X0pk49LVtSQcUBXAUdWwlL9LHz5o63eQBwmbnOs1jRb3UdkJEATFgVeW8C8W7wEaXsvOiVNx7w0SQD-Eshyt5ic8j203crggrhgnTdrMQBfz8ntuF4RQ7h_x5nhWskLXgvjfnufmcHx3Qblr5gk0psbMim1XfuCgOLGnZmFm7px6OIYWVV3m6f_xRbgw5RU7MVjizFzS-WJjmLEGRQYvJjuw3iTabqWDEks"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden flex items-center justify-center font-bold text-xs">
                    +2k
                  </div>
                </div>
                <span className="text-sm font-medium self-center">
                  Déjà plus de 2,000 voyageurs engagés.
                </span>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col">
            <div className="mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
                Créer un compte
              </h2>
              <p className="text-slate-500 font-medium">
                Commencez votre aventure éco-responsable dès aujourd&apos;hui.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Role Selection */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 block ml-1">
                  Je suis un...
                </label>

                <div className="grid gap-3 grid-cols-3">
                  <label className="relative flex flex-col items-center p-3 rounded-xl border-2 border-slate-100 bg-surface-container-low cursor-pointer hover:border-primary/30 transition-all group has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input
                      checked={role === "eco_traveler"}
                      onChange={() => setRole("eco_traveler")}
                      className="sr-only"
                      name="role"
                      type="radio"
                      value="eco_traveler"
                    />
                    <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-primary transition-colors mb-1">
                      travel_explore
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 group-hover:text-primary uppercase tracking-wider">
                      Éco-voyageur
                    </span>
                  </label>

                  <label className="relative flex flex-col items-center p-3 rounded-xl border-2 border-slate-100 bg-surface-container-low cursor-pointer hover:border-primary/30 transition-all group has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input checked={role === "provider"}
                      onChange={() => setRole("provider")}
                      className="sr-only"
                      name="role"
                      type="radio"
                      value="provider" />
                    <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-primary transition-colors mb-1">
                      potted_plant
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 group-hover:text-primary uppercase tracking-wider">
                      Propriétaire
                    </span>
                  </label>

                  <label className="relative flex flex-col items-center p-3 rounded-xl border-2 border-slate-100 bg-surface-container-low cursor-pointer hover:border-primary/30 transition-all group has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input checked={role === "guide"}
                      onChange={() => setRole("guide")}
                      className="sr-only"
                      name="role"
                      type="radio"
                      value="guide" />
                    <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-primary transition-colors mb-1">
                      explore
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 group-hover:text-primary uppercase tracking-wider">
                      Guide
                    </span>
                  </label>
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="email">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 text-xl">
                        mail
                      </span>
                    </div>
                    <input
                      className={`w-full pl-11 pr-4 py-3.5 bg-surface-container border-none rounded-xl focus:ring-2 focus:ring-primary text-slate-900 placeholder:text-slate-400 font-medium transition-all ${fieldErrors.email ? "ring-2 ring-red-400" : ""}`}
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
                      id="email"
                      name="email"
                      placeholder="nom@exemple.com"
                      type="email"
                      autoComplete="email"
                    />
                  </div>
                  {fieldErrors.email && <p className="text-xs font-semibold text-red-500 ml-1">{fieldErrors.email}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="password">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 text-xl">
                          lock
                        </span>
                      </div>
                      <input
                        className={`w-full pl-11 pr-12 py-3.5 bg-surface-container border-none rounded-xl focus:ring-2 focus:ring-primary text-slate-900 placeholder:text-slate-400 font-medium transition-all ${fieldErrors.password ? "ring-2 ring-red-400" : ""}`}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                    {fieldErrors.password && <p className="text-xs font-semibold text-red-500 ml-1">{fieldErrors.password}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="confirm_password">
                      Confirmer
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 text-xl">
                          verified_user
                        </span>
                      </div>
                      <input
                        className={`w-full pl-11 pr-12 py-3.5 bg-surface-container border-none rounded-xl focus:ring-2 focus:ring-primary text-slate-900 placeholder:text-slate-400 font-medium transition-all ${fieldErrors.confirmPassword ? "ring-2 ring-red-400" : ""}`}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: undefined })); }}
                        id="confirm_password"
                        name="confirm_password"
                        placeholder="••••••••"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">
                          {showConfirmPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && <p className="text-xs font-semibold text-red-500 ml-1">{fieldErrors.confirmPassword}</p>}
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3 ml-1">
                <input
                  className="mt-1 rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 transition-colors"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  id="terms"
                  type="checkbox"
                />
                <label className="text-xs text-slate-500 font-medium" htmlFor="terms">
                  J&apos;accepte les{" "}
                  <Link href="#" className="text-primary hover:underline">
                    Conditions d&apos;Utilisation
                  </Link>{" "}
                  et la{" "}
                  <Link href="#" className="text-primary hover:underline">
                    Politique de Confidentialité
                  </Link>
                  .
                </label>
              </div>
              {error && (
                <p className="text-sm font-semibold text-red-600">{error}</p>
              )}
              <button
                className="w-full py-4 bg-primary text-black font-extrabold text-lg rounded-xl shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                type="submit"
                disabled={loading}
              >
                {loading ? "Chargement..." : "Créer un compte"}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2">
              <span className="text-sm text-slate-500 font-medium">
                Déjà un compte ?
              </span>
              <Link href="/auth/login" className="text-sm font-bold text-primary hover:underline">
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 mt-auto">
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 px-8">
          <span className="font-manrope text-xs font-medium text-slate-500 dark:text-slate-400">
            © 2024 Éco-Voyage. Tous droits réservés.
          </span>
          <div className="flex gap-6">
            <Link
              href="#"
              className="font-manrope text-xs font-medium text-slate-500 transition-colors hover:text-primary"
            >
              Confidentialité
            </Link>
            <Link
              href="#"
              className="font-manrope text-xs font-medium text-slate-500 transition-colors hover:text-primary"
            >
              Conditions
            </Link>
            <Link
              href="#"
              className="font-manrope text-xs font-medium text-slate-500 transition-colors hover:text-primary"
            >
              Aide
            </Link>
            <Link
              href="#"
              className="font-manrope text-xs font-medium text-slate-500 transition-colors hover:text-primary"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}