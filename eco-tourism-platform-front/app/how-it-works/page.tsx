"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { motion } from "framer-motion";
import {
  MapPin, Route, Users, Leaf, Star, Shield, Heart, Globe, Compass,
  BookOpen, Award, ArrowRight,
} from "lucide-react";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const roles = [
  {
    icon: <Compass size={28} />,
    title: "Éco-Voyageur",
    description: "Découvrez des expériences authentiques et éco-responsables. Réservez des offres, participez à des circuits, créez des trip plans personnalisés.",
    features: [
      { icon: <MapPin size={16} />, text: "Réserver des offres locales" },
      { icon: <Route size={16} />, text: "Rejoindre des circuits organisés" },
      { icon: <BookOpen size={16} />, text: "Créer des Trip Plans" },
      { icon: <Heart size={16} />, text: "Partager des lieux et expériences" },
    ],
    color: "from-emerald-50 to-teal-50",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    icon: <Users size={28} />,
    title: "Guide",
    description: "Proposez des circuits et des activités uniques. Gérez vos réservations et partagez votre expertise locale avec les voyageurs.",
    features: [
      { icon: <Route size={16} />, text: "Créer et gérer des circuits" },
      { icon: <MapPin size={16} />, text: "Publier des offres d'activités" },
      { icon: <Calendar size={16} />, text: "Gérer les réservations" },
      { icon: <Star size={16} />, text: "Construire votre réputation" },
    ],
    color: "from-blue-50 to-indigo-50",
    iconBg: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: <Globe size={28} />,
    title: "Propriétaire de Projet",
    description: "Gérez votre établissement (hôtel, restaurant, artisanat) et recevez des réservations directement via la plateforme.",
    features: [
      { icon: <Shield size={16} />, text: "Gérer votre établissement" },
      { icon: <MapPin size={16} />, text: "Publier des offres" },
      { icon: <Users size={16} />, text: "Recevoir des réservations" },
      { icon: <Leaf size={16} />, text: "Valoriser vos pratiques éco" },
    ],
    color: "from-amber-50 to-orange-50",
    iconBg: "bg-amber-500/10 text-amber-600",
  },
];

const steps = [
  {
    num: "01",
    title: "Créez votre profil",
    description: "Inscrivez-vous en tant qu'Éco-Voyageur, Guide ou Propriétaire de Projet. Complétez votre profil pour une expérience personnalisée.",
  },
  {
    num: "02",
    title: "Explorez les offres",
    description: "Parcourez les offres locales, circuits et hébergements éco-responsables. Utilisez la carte interactive pour découvrir les bons plans.",
  },
  {
    num: "03",
    title: "Réservez en toute confiance",
    description: "Effectuez vos réservations en ligne avec confirmation instantanée ou sur demande. Gérez tout depuis votre tableau de bord.",
  },
  {
    num: "04",
    title: "Partagez et gagnez",
    description: "Partagez vos expériences, gagnez des badges et un score durable. Contribuez à la communauté éco-touristique.",
  },
];

const features = [
  { icon: <Award size={20} />, title: "Score Durable", description: "Chaque action vous permet de gagner un score de durabilité et des badges éco-responsables." },
  { icon: <Star size={20} />, title: "Badges", description: "Obtenez des badges reconnaissant votre engagement pour un tourisme durable." },
  { icon: <MapPin size={20} />, title: "Trip Plans", description: "Créez des itinéraires personnalisés en combinant offres, circuits et lieux." },
  { icon: <Heart size={20} />, title: "Favoris", description: "Sauvegardez vos offres, circuits et projets préférés pour les retrouver facilement." },
  { icon: <Shield size={20} />, title: "Réservations Sécurisées", description: "Système de réservation fiable avec confirmation et gestion des annulations." },
  { icon: <Globe size={20} />, title: "Carte Interactive", description: "Explorez les offres et circuits sur une carte interactive avec géolocalisation." },
];

export default function HowItWorksPage() {
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
              <Leaf size={14} /> Éco-tourisme en Tunisie
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight">
              Comment ça marche ?
            </h1>
            <p className="text-lg text-emerald-100 max-w-2xl mx-auto leading-relaxed">
              EcoVoyage connecte les voyageurs éco-responsables avec les acteurs locaux du tourisme durable en Tunisie.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Roles */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
          <h2 className="text-3xl font-extrabold text-center text-slate-800 mb-4">Trois rôles, une mission</h2>
          <p className="text-center text-slate-500 mb-12 max-w-xl mx-auto">
            Que vous soyez voyageur, guide ou propriétaire, EcoVoyage s&apos;adapte à vos besoins.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role, i) => (
            <motion.div
              key={role.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ delay: i * 0.15 }}
              className={`rounded-3xl bg-gradient-to-br ${role.color} p-8 border border-slate-100`}
            >
              <div className={`w-14 h-14 rounded-2xl ${role.iconBg} flex items-center justify-center mb-5`}>
                {role.icon}
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 mb-3">{role.title}</h3>
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">{role.description}</p>
              <ul className="space-y-2.5">
                {role.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-2.5 text-sm text-slate-600">
                    <span className="text-primary">{f.icon}</span>
                    {f.text}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <h2 className="text-3xl font-extrabold text-center text-slate-800 mb-12">En 4 étapes simples</h2>
          </motion.div>

          <div className="space-y-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-6 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-lg font-extrabold text-primary">{step.num}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
          <h2 className="text-3xl font-extrabold text-center text-slate-800 mb-4">Fonctionnalités clés</h2>
          <p className="text-center text-slate-500 mb-12 max-w-xl mx-auto">
            Tout ce dont vous avez besoin pour un éco-tourisme responsable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                {feat.icon}
              </div>
              <h3 className="font-bold text-slate-800 mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feat.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary/10 to-emerald-50 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-extrabold text-slate-800 mb-4">Prêt à commencer ?</h2>
          <p className="text-slate-500 mb-8">Rejoignez la communauté EcoVoyage et participez au tourisme durable.</p>
          <button
            onClick={() => router.push("/auth/register")}
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
          >
            Créer un compte <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Calendar({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
