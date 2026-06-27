"use client";

export default function Newsletter() {
  return (
    <section className="px-6 md:px-20 lg:px-40 pb-24">
      <div className="max-w-[1440px] mx-auto rounded-[2.5rem] bg-primary dark:bg-primary/90 p-12 md:p-20 flex flex-col items-center text-center overflow-hidden relative">
        <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-slate-900/10 blur-3xl"></div>

        <h2 className="text-3xl md:text-5xl font-black text-slate-900 max-w-2xl mb-6 relative z-10">
          Prêt pour votre prochaine éco-aventure ?
        </h2>

        <p className="text-slate-900/70 text-lg font-semibold max-w-xl mb-10 relative z-10">
          Rejoignez notre newsletter et recevez chaque semaine une sélection exclusive de
          destinations durables et des conseils pour voyager léger.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md relative z-10">
          <input
            className="flex-1 h-14 rounded-xl border-none px-6 focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
            placeholder="Votre email"
            type="email"
          />
          <button className="h-14 px-8 rounded-xl bg-slate-900 text-primary font-bold shadow-lg hover:scale-105 transition-all">
            S'inscrire
          </button>
        </div>
      </div>
    </section>
  );
}