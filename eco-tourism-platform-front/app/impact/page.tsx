"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { motion } from "framer-motion";
import {
  Briefcase, Building, ShoppingBag, Cloud, TreePine,
  Leaf, ArrowRight, Globe, Users, Target,
} from "lucide-react";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const sdgs = [
  {
    num: 8,
    icon: <Briefcase size={28} />,
    title: "Travail décent et croissance économique",
    color: "from-pink-500 to-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    borderColor: "border-red-200",
    description: "Promouvoir une croissance économique soutenue, inclusive et durable. Favoriser l'emploi et les revenus décents pour tous.",
    actions: [
      "Créer des emplois locaux dans le tourisme durable",
      "Soutenir les petits entrepreneurs et artisans",
      "Promouvoir l'économie sociale et solidaire",
    ],
  },
  {
    num: 11,
    icon: <Building size={28} />,
    title: "Villes et communautés durables",
    color: "from-orange-400 to-amber-500",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "border-amber-200",
    description: "Rendre les villes et les habitats inclusifs, sûrs, résilients et durables. Protéger le patrimoine culturel et naturel.",
    actions: [
      "Préserver les médinas et patrimoines locaux",
      "Développer un tourisme urbain responsable",
      "Améliorer l'accessibilité des sites touristiques",
    ],
  },
  {
    num: 12,
    icon: <ShoppingBag size={28} />,
    title: "Consommation responsable",
    color: "from-amber-500 to-yellow-500",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-600",
    borderColor: "border-yellow-200",
    description: "Assurer des modes de consommation et de production durables. Réduire le gaspillage alimentaire et la pollution.",
    actions: [
      "Promouvoir les produits locaux et de saison",
      "Encourager la réduction des déchets plastiques",
      "Soutenir les circuits courts et l'agriculture bio",
    ],
  },
  {
    num: 13,
    icon: <Cloud size={28} />,
    title: "Action climatique",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-200",
    description: "Lutter contre le changement climatique et ses impacts. Intégrer les mesures climatiques dans les politiques et stratégies.",
    actions: [
      "Compenser les émissions de carbone des voyages",
      "Promouvoir les transports à faibles émissions",
      "Sensibiliser les voyageurs aux enjeux climatiques",
    ],
  },
  {
    num: 15,
    icon: <TreePine size={28} />,
    title: "Vie terrestre",
    color: "from-lime-500 to-green-500",
    bgColor: "bg-lime-50",
    textColor: "text-lime-600",
    borderColor: "border-lime-200",
    description: "Protéger, restaurer et promouvoir l'utilisation durable des écosystèmes terrestres. Lutter contre la désertification.",
    actions: [
      "Protéger les zones naturelles et parcs nationaux",
      "Promouvoir l'écotourisme responsable",
      "Sensibiliser à la biodiversité locale",
    ],
  },
];

const impactStats = [
  { value: "2,500+", label: "Voyageurs engagés", icon: <Users size={20} /> },
  { value: "150+", label: "Établissements partenaires", icon: <Target size={20} /> },
  { value: "50+", label: "Communautés bénéficiaires", icon: <Globe size={20} /> },
  { value: "85%", label: "Score de durabilité moyen", icon: <Leaf size={20} /> },
];

export default function ImpactPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="home" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-4 py-24 text-center relative">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-sm font-bold mb-6">
              <Target size={14} /> Impact & Développement Durable
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight">
              Notre impact
            </h1>
            <p className="text-lg text-emerald-100 max-w-2xl mx-auto leading-relaxed">
              EcoVoyage s&apos;inscrit dans les Objectifs de Développement Durable des Nations Unies pour un tourisme responsable et durable.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {impactStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                {stat.icon}
              </div>
              <p className="text-2xl font-extrabold text-slate-800">{stat.value}</p>
              <p className="text-xs font-bold text-slate-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SDGs */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
          <h2 className="text-3xl font-extrabold text-center text-slate-800 mb-4">Objectifs de Développement Durable</h2>
          <p className="text-center text-slate-500 mb-12 max-w-xl mx-auto">
            Nos actions contribuent directement à ces objectifs mondiaux.
          </p>
        </motion.div>

        <div className="space-y-8">
          {sdgs.map((sdg, i) => (
            <motion.div
              key={sdg.num}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ delay: i * 0.1 }}
              className={`bg-white rounded-2xl border ${sdg.borderColor} overflow-hidden`}
            >
              <div className={`bg-gradient-to-r ${sdg.color} p-6 text-white`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    {sdg.icon}
                  </div>
                  <div>
                    <div className="text-sm font-bold opacity-80">ODD {sdg.num}</div>
                    <h3 className="text-xl font-extrabold">{sdg.title}</h3>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{sdg.description}</p>
                <div className="space-y-2">
                  {sdg.actions.map((action) => (
                    <div key={action} className="flex items-start gap-2">
                      <Leaf size={14} className={`${sdg.textColor} mt-0.5 shrink-0`} />
                      <span className="text-sm text-slate-600">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Commitment */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <h2 className="text-3xl font-extrabold text-slate-800 mb-4">Notre engagement</h2>
            <p className="text-slate-500 mb-8 max-w-xl mx-auto leading-relaxed">
              Chaque réservation, chaque circuit, chaque projet sur EcoVoyage contribue à un avenir plus durable.
              Ensemble, nous construisons un tourisme responsable qui respecte les personnes et la planète.
            </p>
            <button
              onClick={() => router.push("/auth/register")}
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
            >
              Rejoindre le mouvement <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
