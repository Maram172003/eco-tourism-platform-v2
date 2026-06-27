"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface ExperienceCardProps {
  image: string;
  location: string;
  title: string;
  rating: number;
  description: string;
  price: number;
}

export default function ExperienceCard({
  image,
  location,
  title,
  rating,
  description,
  price,
}: ExperienceCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="flex flex-col rounded-3xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-lg group"
    >
      <div className="relative aspect-video overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
          style={{ backgroundImage: `url('${image}')` }}
        />
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-extrabold text-primary shadow-sm uppercase tracking-widest">
          {location}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold">{title}</h3>
          <div className="flex items-center gap-1 text-slate-900 dark:text-slate-100">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-bold">{rating}</span>
          </div>
        </div>

        <p className="text-slate-500 text-sm mb-6 line-clamp-2">{description}</p>

        <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-700">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">À partir de</span>
            <span className="text-lg font-black">
              {price}TND <span className="text-xs font-medium text-slate-400">/nuit</span>
            </span>
          </div>

          <button className="h-10 px-4 rounded-xl border border-primary text-primary font-bold hover:bg-primary hover:text-slate-900 transition-all text-sm">
            Réserver
          </button>
        </div>
      </div>
    </motion.div>
  );
}