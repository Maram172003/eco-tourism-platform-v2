"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { motion } from "framer-motion";
import {
  Home, UtensilsCrossed, Hammer, Footprints, Sprout, HeartHandshake,
  MapPin, ArrowRight, Leaf, Globe,
} from "lucide-react";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const categories = [
  {
    icon: <Home size={24} />,
    title: "Hébergement",
    description: "Éco-lodges, maisons d'hôtes, campings durables et hébergements responsables.",
    count: "50+",
    color: "bg-emerald-50 text-emerald-600",
    borderColor: "hover:border-emerald-300",
  },
  {
    icon: <UtensilsCrossed size={24} />,
    title: "Restaurant",
    description: "Restaurants bio, cuisine locale, produits du terroir et circuits courts.",
    count: "30+",
    color: "bg-amber-50 text-amber-600",
    borderColor: "hover:border-amber-300",
  },
  {
    icon: <Hammer size={24} />,
    title: "Artisanat",
    description: "Artisans locaux, savoir-faire traditionnel et créations éco-responsables.",
    count: "40+",
    color: "bg-blue-50 text-blue-600",
    borderColor: "hover:border-blue-300",
  },
  {
    icon: <Footprints size={24} />,
    title: "Activités",
    description: "Randonnées, excursions, ateliers et expériences immersives en pleine nature.",
    count: "60+",
    color: "bg-purple-50 text-purple-600",
    borderColor: "hover:border-purple-300",
  },
  {
    icon: <Sprout size={24} />,
    title: "Agriculture",
    description: "Fermes bio, agritourisme, jardins partagés et production locale.",
    count: "20+",
    color: "bg-green-50 text-green-600",
    borderColor: "hover:border-green-300",
  },
  {
    icon: <HeartHandshake size={24} />,
    title: "Associations",
    description: "Associations de protection de l'environnement et du patrimoine naturel.",
    count: "15+",
    color: "bg-rose-50 text-rose-600",
    borderColor: "hover:border-rose-300",
  },
];

const values = [
  { icon: <Leaf size={20} />, title: "Éco-responsabilité", description: "Tous nos partenaires s'engagent pour un tourisme respectueux de l'environnement." },
  { icon: <Globe size={20} />, title: "Tourisme local", description: "Soutenez l'économie locale en découvrant des acteurs authentiques." },
  { icon: <MapPin size={20} />, title: "Authenticité", description: "Des expériences véritables, loin du tourisme de masse." },
];

export default function EcoProjectsPage() {
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
              <Globe size={14} /> Éco-Établissements
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight">
              Éco-Établissements en Tunisie
            </h1>
            <p className="text-lg text-emerald-100 max-w-2xl mx-auto leading-relaxed">
              Découvrez les acteurs du tourisme durable : hébergements, restaurants, artisans, agriculteurs et associations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
          <h2 className="text-3xl font-extrabold text-center text-slate-800 mb-4">Nos catégories</h2>
          <p className="text-center text-slate-500 mb-12 max-w-xl mx-auto">
            Explorez les différents types de projets éco-responsables disponibles.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ delay: i * 0.1 }}
              className={`bg-white rounded-2xl p-6 border border-slate-100 ${cat.borderColor} hover:shadow-lg transition-all cursor-pointer group`}
              onClick={() => router.push("/offers")}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center`}>
                  {cat.icon}
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                  {cat.count}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors">
                {cat.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">{cat.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Map placeholder */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <h2 className="text-3xl font-extrabold text-center text-slate-800 mb-4">Carte interactive</h2>
            <p className="text-center text-slate-500 mb-8 max-w-xl mx-auto">
              Localisez les projets éco-responsables sur la carte de la Tunisie.
            </p>
          </motion.div>
          <div className="bg-white rounded-2xl border border-slate-100 h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin size={48} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">Carte interactive bientôt disponible</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((val, i) => (
            <motion.div
              key={val.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                {val.icon}
              </div>
              <h3 className="font-bold text-slate-800 mb-2">{val.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{val.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary/10 to-emerald-50 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-extrabold text-slate-800 mb-4">Vous avez un établissement éco-responsable ?</h2>
          <p className="text-slate-500 mb-8">Rejoignez EcoVoyage et partagez votre engagement avec les voyageurs.</p>
          <button
            onClick={() => router.push("/auth/register")}
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
          >
            Nous rejoindre <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
