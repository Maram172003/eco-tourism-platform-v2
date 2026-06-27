import { ArrowRight } from "lucide-react";
import ExperienceCard from "./ExperienceCard";

const experiences = [
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC6fLYaEUNgBDhKLagxFXwER6hpcyiVluIeu3Dk1ThNBDJB8OC9kv7tNvAuXAt4nSRuMaL7r9VK2sIy4TnafL2Jh45c5oM9LbvnmdRk8YooUSOzs1URRszdD294V_mH-f4dBoBQdxqRGv-a1qM8GEaPZ7QQ_ipr4Vnq4ySwgoKURVdUNw0Bb5W6aiVoiGgxJ3BDmFA5T959BRGdBYy7QgmpLdVHOPZP_WnrA1fs05vqCA5yNgYuJ7s9A8qUSKQzMu2wLg5cB4yaOVI",
    location: "Alpes Françaises",
    title: "Éco-Gîte Solaire",
    rating: 4.9,
    description: "Immersion totale dans un refuge 100% autonome à 1500m d'altitude.",
    price: 120,
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuABL-A6_cEF6vGK5W-PKCOFL9a6FdhGj8AVZPRf8O_gZo2-3LohSJupavWV1fEtsskucazhDDJTK4GGo96YhEn3Yvz5RJ5Xktf9cf_VWbFoSSBeh4_kzfQCNmpa-DcAkV5GLeY8l2Ndc6gu4cBlOAAjEbswiSsS0qRndHPNAqNV5vajJ0ESb2owxskM692ADq8yp0OA7ZudNRp3jjfXJpilFLescOiSauqJjkOQgq2RY6j6JNxpyaPoxFIt0WeRQQa_Vap6Tr8PV3c",
    location: "Bali, Indonésie",
    title: "Bamboo Mansion",
    rating: 4.8,
    description: "Architecture d'exception en bambou au milieu des rizières d'Ubud.",
    price: 210,
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuApxE9K_VW-p-2suuIysmLfCC-Ng7AN0IwxtQW2j75xmLAsJRIadlTTSpd40QTJx-PZuYnaWZdtVe9oktJxM8hautKC1J2ZEtnlPN7ZZA8W0eHX4XnrKhuM3qKgAPO1F39MPry9yklvzb61looli2cCF7qUTJzfJbGCJS_QHkCL9AcKYGiNv8jCrDsFfQabzVTl-eQLQ-CGs7P2oY4tKd8xC5hZo2EScnWWdXQJTDJE1ArcW_Pnqj-5mlJ_oUWXV4egSJj7ONUq9bY",
    location: "Costa Rica",
    title: "Sanctuaire Tortues",
    rating: 5.0,
    description: "Volontariat et séjour en bord de mer pour la protection des nids.",
    price: 85,
  },
];

export default function FeaturedExperiences() {
  return (
    <section className="py-24 px-6 md:px-20 lg:px-40 max-w-[1440px] mx-auto">
      <div className="flex items-end justify-between mb-12">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            Expériences à la une
          </h2>
          <p className="text-slate-500">Nos pépites durables les plus appréciées ce mois-ci.</p>
        </div>
        <button className="flex items-center gap-2 font-bold text-primary hover:gap-3 transition-all">
          Voir tout <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {experiences.map((exp, index) => (
          <ExperienceCard
            key={index}
            image={exp.image}
            location={exp.location}
            title={exp.title}
            rating={exp.rating}
            description={exp.description}
            price={exp.price}
          />
        ))}
      </div>
    </section>
  );
}