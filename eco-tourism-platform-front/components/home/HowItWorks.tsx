"use client";

import { Map, Flame, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Map,
    title: "Explorez local",
    description:
      "Découvrez des destinations hors des sentiers battus, sélectionnées pour leur engagement éthique.",
  },
  {
    icon: Flame,
    title: "Réservez engagé",
    description:
      "Chaque réservation inclut une contribution directe à des projets de protection de la faune ou de reforestation.",
  },
  {
    icon: HeartHandshake,
    title: "Vivez l'impact",
    description:
      "Participez à des ateliers, rencontrez les locaux et devenez un acteur du changement positif.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-slate-50 dark:bg-slate-900/50 py-24 px-6 md:px-20 lg:px-40">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50">
            Comment ça marche
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            Une plateforme simple et transparente pour connecter les voyageurs conscients aux
            projets locaux porteurs de sens.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center group hover:border-primary transition-colors"
            >
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-slate-900 transition-all">
                <step.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-slate-500 dark:text-slate-400">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}