
export type FieldType = "text" | "number" | "select" | "multiselect" | "boolean" | "textarea" | "url"

export interface FieldConfig {
  key: string
  label: string
  type: FieldType
  options?: string[]
  required?: boolean
  /** Affiche ce champ uniquement si le champ `field` a la valeur `value` */
  dependsOn?: { field: string; value: any }
}

export interface FieldSection {
  section: string
  icon?: string
  fields: FieldConfig[]
}

export interface SubtypeConfig {
  label: string
  category: string
  sections: FieldSection[]
}

export interface ProviderSubtype {
  value: string
  label: string
}

export interface ProviderCategory {
  value: string
  label: string
  icon: string
  subtypes: ProviderSubtype[]
}

// ─── Shared option sets ───────────────────────────────────────────────────────
const LANGS = ["Arabe", "Français", "Anglais", "Italien", "Espagnol", "Allemand", "Amazigh"]
const SAISONS = ["Printemps", "Été", "Automne", "Hiver"]
const MOIS = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"]
const NIVEAUX_3 = ["Débutant", "Intermédiaire", "Avancé"]
const REGIMES = ["Végétarien", "Vegan", "Sans gluten", "Halal", "Sans lactose"]

// ─── Category grid ────────────────────────────────────────────────────────────
export const PROVIDER_SCHEMA: ProviderCategory[] = [
  {
    value: "eco_tour", label: "Éco-Tour", icon: "eco",
    subtypes: [
      { value: "circuit_nature", label: "Circuit nature" },
      { value: "safari_desert", label: "Safari désert" },
      { value: "observation_faune", label: "Observation faune" },
      { value: "observation_etoiles", label: "Observation des étoiles" },
      { value: "speleologie", label: "Spéléologie" },
      { value: "visite_oasis", label: "Visite oasis" },
      { value: "circuit_montagne", label: "Circuit montagne" },
      { value: "tour_cotier", label: "Tour côtier" },
    ],
  },
  {
    value: "hebergement", label: "Hébergement", icon: "hotel",
    subtypes: [
      { value: "dortoir", label: "Dortoir" },
      { value: "chambre_standard", label: "Chambre standard" },
      { value: "chambre_superieure", label: "Chambre supérieure" },
      { value: "suite", label: "Suite" },
      { value: "bungalow", label: "Bungalow" },
      { value: "tente_glamping", label: "Tente glamping" },
      { value: "gite_rural", label: "Gîte rural" },
      { value: "maison_hotes", label: "Maison d'hôtes" },
      { value: "riad_traditionnel", label: "Riad traditionnel" },
      { value: "ecolodge", label: "Éco-lodge" },
      { value: "camping_sauvage", label: "Camping sauvage" },
      { value: "ferme_agritouristique", label: "Ferme agritouristique" },
    ],
  },
  {
    value: "activite", label: "Activité Outdoor", icon: "hiking",
    subtypes: [
      { value: "randonnee", label: "Randonnée" },
      { value: "kayak_canoe", label: "Kayak / Canoë" },
      { value: "velo_vtt", label: "Vélo / VTT" },
      { value: "escalade", label: "Escalade" },
      { value: "yoga", label: "Yoga" },
      { value: "plongee", label: "Plongée sous-marine" },
      { value: "surf_windsurf", label: "Surf / Windsurf" },
      { value: "tir_arc", label: "Tir à l'arc" },
      { value: "quad_4x4", label: "Quad / 4x4" },
      { value: "peche_traditionnelle", label: "Pêche traditionnelle" },
      { value: "cours_cuisine", label: "Cours de cuisine" },
      { value: "plantation_jardinage", label: "Plantation / Jardinage" },
      { value: "observation_oiseaux", label: "Observation des oiseaux" },
      { value: "equitation", label: "Équitation" },
    ],
  },
  {
    value: "restaurant_terroir", label: "Restaurant & Terroir", icon: "restaurant",
    subtypes: [
      { value: "restaurant_traditionnel", label: "Restaurant traditionnel" },
      { value: "cafe_salon_the", label: "Café / Salon de thé" },
      { value: "ferme_restaurant", label: "Ferme-restaurant" },
      { value: "food_truck", label: "Food truck" },
      { value: "table_hotes", label: "Table d'hôtes" },
      { value: "degustation_produits", label: "Dégustation de produits" },
      { value: "diner_panoramique", label: "Dîner panoramique" },
    ],
  },
  {
    value: "artisanat", label: "Artisanat", icon: "palette",
    subtypes: [
      { value: "poterie", label: "Poterie" },
      { value: "tissage", label: "Tissage" },
      { value: "bijoux_berberes", label: "Bijoux berbères" },
      { value: "broderie", label: "Broderie" },
      { value: "vannerie", label: "Vannerie" },
      { value: "sculpture_bois", label: "Sculpture sur bois" },
      { value: "tannerie", label: "Tannerie" },
      { value: "parfumerie_naturelle", label: "Parfumerie naturelle" },
      { value: "peinture_traditionnelle", label: "Peinture traditionnelle" },
      { value: "calligraphie", label: "Calligraphie" },
    ],
  },
  {
    value: "agriculture_terroir", label: "Agriculture & Terroir", icon: "agriculture",
    subtypes: [
      { value: "visite_ferme", label: "Visite de ferme" },
      { value: "cueillette", label: "Cueillette" },
      { value: "atelier_huile_olive", label: "Atelier huile d'olive" },
      { value: "atelier_fromage_yaourt", label: "Atelier fromage / yaourt" },
      { value: "apiculture", label: "Apiculture" },
      { value: "viticulture", label: "Viticulture" },
      { value: "elevage_responsable", label: "Élevage responsable" },
    ],
  },
  {
    value: "culture_patrimoine", label: "Culture & Patrimoine", icon: "account_balance",
    subtypes: [
      { value: "visite_medina", label: "Visite de médina" },
      { value: "circuit_historique", label: "Circuit historique" },
      { value: "visite_musee", label: "Visite musée / site archéologique" },
      { value: "soiree_culturelle", label: "Soirée culturelle" },
      { value: "spectacle_traditionnel", label: "Spectacle traditionnel" },
      { value: "atelier_musical", label: "Atelier musical" },
      { value: "calligraphie_arabe", label: "Calligraphie arabe" },
    ],
  },
  {
    value: "bien_etre_spa", label: "Bien-être & Spa", icon: "spa",
    subtypes: [
      { value: "hammam_traditionnel", label: "Hammam traditionnel" },
      { value: "massage_naturel", label: "Massage aux huiles naturelles" },
      { value: "retraite_yoga", label: "Retraite yoga" },
      { value: "meditation", label: "Méditation / Pleine conscience" },
      { value: "bain_thermal", label: "Bain thermal" },
      { value: "therapie_plantes", label: "Thérapie par les plantes" },
      { value: "gommage_savon_noir", label: "Gommage au savon noir" },
    ],
  },
  {
    value: "transport_eco", label: "Transport Éco", icon: "electric_bike",
    subtypes: [
      { value: "location_velo", label: "Location vélo" },
      { value: "caleche", label: "Calèche / Charrette" },
      { value: "bateau_traditionnel", label: "Bateau traditionnel (felucca)" },
      { value: "tuk_tuk", label: "Tuk-tuk électrique" },
      { value: "dromadaire", label: "Dromadaire" },
      { value: "transfert_partage", label: "Transfert partagé" },
    ],
  },
  {
    value: "volontariat_eco", label: "Volontariat & Éco-Action", icon: "volunteer_activism",
    subtypes: [
      { value: "plantation_arbres", label: "Plantation d'arbres" },
      { value: "nettoyage_plage", label: "Nettoyage de plage" },
      { value: "nettoyage_foret", label: "Nettoyage de forêt" },
      { value: "education_environnementale", label: "Éducation environnementale" },
      { value: "jardin_communautaire", label: "Construction jardin communautaire" },
      { value: "sensibilisation_ecoles", label: "Sensibilisation dans les écoles" },
    ],
  },
  {
    value: "transport", label: "Transport", icon: "directions_car",
    subtypes: [
      { value: "transporteur_local", label: "Transporteur local" },
      { value: "location_vehicule", label: "Location véhicule" },
    ],
  },
  {
    value: "equipement", label: "Location Matériel", icon: "construction",
    subtypes: [
      { value: "location_materiel", label: "Location matériel outdoor" },
      { value: "centre_sport", label: "Centre de sport" },
    ],
  },
]

// ─── Full field config per subtype ────────────────────────────────────────────
export const SUBTYPE_FIELDS: Record<string, SubtypeConfig> = {

  // ── ÉCO-TOUR ────────────────────────────────────────────────────────────────

  circuit_nature: {
    label: "Circuit nature", category: "eco_tour",
    sections: [
      { section: "Territoire & Milieux", fields: [
        { key: "zones_geographiques", label: "Zones géographiques couvertes", type: "multiselect",
          options: ["Kroumirie","Cap Bon","Dorsale tunisienne","Grand Sud","Côte Est","Chott el-Jérid","Sahel","Lac de Bizerte"] },
        { key: "types_milieux", label: "Types de milieux", type: "multiselect",
          options: ["Forêt","Montagne","Zones humides","Steppe","Côtier"] },
        { key: "saisons_activite", label: "Saisons d'activité", type: "multiselect", options: SAISONS },
      ]},
      { section: "Format & Niveaux", fields: [
        { key: "durees_proposees", label: "Durées proposées", type: "multiselect",
          options: ["Demi-journée","Journée","Multi-jours"] },
        { key: "niveaux_difficulte", label: "Niveaux de difficulté", type: "multiselect",
          options: ["Facile","Modéré","Difficile"] },
        { key: "groupe_max", label: "Taille de groupe maximum", type: "number" },
      ]},
      { section: "Encadrement & Logistique", fields: [
        { key: "langues_guides", label: "Langues des guides", type: "multiselect", options: LANGS },
        { key: "vehicule_propre", label: "Véhicule de transport écologique", type: "boolean" },
        { key: "type_vehicule_propre", label: "Type de véhicule", type: "multiselect",
          options: ["Électrique","Hybride","GPL","Vélo cargo","À traction animale"],
          dependsOn: { field: "vehicule_propre", value: true } },
      ]},
    ],
  },

  safari_desert: {
    label: "Safari désert", category: "eco_tour",
    sections: [
      { section: "Territoire", fields: [
        { key: "regions_desert", label: "Régions du désert couvertes", type: "multiselect",
          options: ["Douz","Kébili","Tozeur","Nefzaoua","Tataouine","Grand Erg Oriental"] },
        { key: "saisons_activite", label: "Saisons d'activité", type: "multiselect", options: SAISONS },
      ]},
      { section: "Véhicules & Bivouac", fields: [
        { key: "types_vehicules", label: "Types de véhicules disponibles", type: "multiselect",
          options: ["4x4","Quad","Dromadaire"] },
        { key: "bivouac", label: "Bivouac proposé", type: "boolean" },
        { key: "type_bivouac", label: "Type de bivouac", type: "select",
          options: ["Tente","Ciel ouvert","Yourte","Bivouac berbère","Khaïma"],
          dependsOn: { field: "bivouac", value: true } },
        { key: "nb_places_bivouac", label: "Nombre de places en bivouac", type: "number",
          dependsOn: { field: "bivouac", value: true } },
      ]},
      { section: "Équipe & Capacité", fields: [
        { key: "nb_guides", label: "Nombre de guides disponibles", type: "number" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
        { key: "capacite_max", label: "Capacité maximale (personnes/jour)", type: "number" },
      ]},
    ],
  },

  observation_faune: {
    label: "Observation faune", category: "eco_tour",
    sections: [
      { section: "Milieux & Espèces", fields: [
        { key: "milieux_couverts", label: "Milieux couverts", type: "multiselect",
          options: ["Zones humides","Forêt","Montagne","Côtier","Steppe"] },
        { key: "especes_phares", label: "Espèces phares observables", type: "textarea" },
        { key: "saisons_activite", label: "Meilleures saisons", type: "multiselect", options: SAISONS },
      ]},
      { section: "Équipement & Encadrement", fields: [
        { key: "equipement_optique", label: "Équipement optique disponible (jumelles…)", type: "boolean" },
        { key: "guide_naturaliste", label: "Guide naturaliste disponible", type: "boolean" },
        { key: "langues_guides", label: "Langues des guides", type: "multiselect", options: LANGS,
          dependsOn: { field: "guide_naturaliste", value: true } },
        { key: "groupe_max", label: "Taille groupe maximum", type: "number" },
      ]},
    ],
  },

  observation_etoiles: {
    label: "Observation des étoiles", category: "eco_tour",
    sections: [
      { section: "Sites & Période", fields: [
        { key: "sites_observation", label: "Sites d'observation disponibles", type: "textarea" },
        { key: "periode_activite", label: "Période d'activité (mois)", type: "multiselect", options: MOIS },
      ]},
      { section: "Équipement & Animation", fields: [
        { key: "equipement_astro", label: "Équipement astronomique disponible", type: "multiselect",
          options: ["Télescopes","Lasers pointeurs","Cartes célestes","Jumelles"] },
        { key: "animateur_scientifique", label: "Animateur scientifique présent", type: "boolean" },
        { key: "langues", label: "Langues d'animation", type: "multiselect", options: LANGS,
          dependsOn: { field: "animateur_scientifique", value: true } },
        { key: "capacite_max", label: "Capacité maximale par séance", type: "number" },
      ]},
    ],
  },

  speleologie: {
    label: "Spéléologie", category: "eco_tour",
    sections: [
      { section: "Sites & Niveaux", fields: [
        { key: "sites_disponibles", label: "Grottes / sites disponibles", type: "textarea" },
        { key: "niveaux", label: "Niveaux proposés", type: "multiselect",
          options: ["Initiation","Intermédiaire","Expert"] },
      ]},
      { section: "Sécurité, Équipement & Capacité", fields: [
        { key: "guides_certifies", label: "Guides certifiés", type: "boolean" },
        { key: "certification_guide", label: "Nom / organisme du certificat", type: "text", dependsOn: { field: "guides_certifies", value: true } },
        { key: "certification_guide_url", label: "URL ou lien justificatif du certificat", type: "url", dependsOn: { field: "guides_certifies", value: true } },
        { key: "equipement_disponible", label: "Équipement spéléo disponible", type: "boolean" },
        { key: "capacite_max", label: "Capacité maximale par groupe", type: "number" },
      ]},
    ],
  },

  visite_oasis: {
    label: "Visite oasis", category: "eco_tour",
    sections: [
      { section: "Oasis & Productions", fields: [
        { key: "oasis_couvertes", label: "Oasis couvertes (noms / régions)", type: "textarea" },
        { key: "types_productions", label: "Types de productions présentes", type: "multiselect",
          options: ["Palmiers","Cultures maraîchères","Irrigation traditionnelle","Élevage"] },
      ]},
      { section: "Encadrement & Logistique", fields: [
        { key: "guides_locaux", label: "Guides locaux disponibles", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS,
          dependsOn: { field: "guides_locaux", value: true } },
        { key: "transport_propre", label: "Transport écologique disponible", type: "boolean" },
        { key: "type_vehicule_propre", label: "Type de véhicule utilisé", type: "multiselect",
          options: ["Électrique","Hybride","Calèche","Vélo","À traction animale"],
          dependsOn: { field: "transport_propre", value: true } },
      ]},
    ],
  },

  circuit_montagne: {
    label: "Circuit montagne", category: "eco_tour",
    sections: [
      { section: "Territoire & Dénivelé", fields: [
        { key: "massifs_couverts", label: "Massifs couverts", type: "textarea" },
        { key: "deniveles_max", label: "Dénivelé maximum (m)", type: "number" },
        { key: "saisons_activite", label: "Saisons d'activité", type: "multiselect", options: SAISONS },
      ]},
      { section: "Niveaux & Hébergement", fields: [
        { key: "niveaux", label: "Niveaux acceptés", type: "multiselect",
          options: ["Facile","Modéré","Difficile","Expert"] },
        { key: "refuge_disponible", label: "Refuge / hébergement en altitude", type: "boolean" },
      ]},
      { section: "Encadrement", fields: [
        { key: "guides_certifies", label: "Guides de montagne certifiés", type: "boolean" },
        { key: "certification_guides", label: "Nom / organisme du certificat", type: "text", dependsOn: { field: "guides_certifies", value: true } },
        { key: "certification_guides_url", label: "URL ou lien justificatif du certificat", type: "url", dependsOn: { field: "guides_certifies", value: true } },
        { key: "langues_guides", label: "Langues des guides", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  tour_cotier: {
    label: "Tour côtier", category: "eco_tour",
    sections: [
      { section: "Zone & Embarcations", fields: [
        { key: "zone_maritime", label: "Zone maritime couverte", type: "text" },
        { key: "types_embarcations", label: "Types d'embarcations", type: "multiselect",
          options: ["Voilier","Barque","Catamaran","Felucca","Zodiac"] },
        { key: "capacite_totale", label: "Capacité totale (personnes)", type: "number" },
        { key: "saisons_activite", label: "Saisons d'activité", type: "multiselect", options: SAISONS },
      ]},
      { section: "Activités nautiques", fields: [
        { key: "activites_nautiques", label: "Activités nautiques associées", type: "multiselect",
          options: ["Snorkeling","Pêche","Baignade","Plongée"] },
      ]},
      { section: "Sécurité", fields: [
        { key: "capitaine_certifie", label: "Capitaine certifié", type: "boolean" },
        { key: "certification_capitaine", label: "Titre / nom du certificat", type: "text", dependsOn: { field: "capitaine_certifie", value: true } },
        { key: "certification_capitaine_url", label: "URL ou lien justificatif du certificat", type: "url", dependsOn: { field: "capitaine_certifie", value: true } },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  // ── HÉBERGEMENT ──────────────────────────────────────────────────────────────

  dortoir: {
    label: "Dortoir", category: "hebergement",
    sections: [
      { section: "Configuration", fields: [
        { key: "nb_lits_total", label: "Nombre total de lits", type: "number" },
        { key: "type_dortoir", label: "Type de dortoir", type: "select",
          options: ["Mixte","Séparé H/F","Les deux"] },
        { key: "ratio_sanitaires", label: "Ratio lits / douches", type: "text" },
      ]},
      { section: "Services communs", fields: [
        { key: "services_communs", label: "Services communs disponibles", type: "multiselect",
          options: ["Cuisine","Salon","Terrasse","Casiers","Buanderie"] },
        { key: "accueil_continu", label: "Accueil continu", type: "boolean" },
      ]},
      { section: "Langues", fields: [
        { key: "langues_accueil", label: "Langues parlées à l'accueil", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  chambre_standard: {
    label: "Chambre standard", category: "hebergement",
    sections: [
      { section: "Configuration", fields: [
        { key: "nb_chambres", label: "Nombre de chambres", type: "number" },
        { key: "capacite_max", label: "Capacité maximale du site", type: "number" },
        { key: "types_lits", label: "Types de lits disponibles", type: "multiselect",
          options: ["Simple","Double","Twin","King"] },
      ]},
      { section: "Services inclus", fields: [
        { key: "services_inclus", label: "Services inclus", type: "multiselect",
          options: ["Petit-déjeuner","Ménage quotidien","Wifi","Parking"] },
      ]},
      { section: "Accessibilité & Langues", fields: [
        { key: "pmr", label: "Accessibilité PMR", type: "boolean" },
        { key: "langues_accueil", label: "Langues parlées à l'accueil", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  chambre_superieure: {
    label: "Chambre supérieure", category: "hebergement",
    sections: [
      { section: "Configuration", fields: [
        { key: "nb_chambres", label: "Nombre de chambres supérieures", type: "number" },
        { key: "caracteristiques", label: "Caractéristiques distinctives", type: "multiselect",
          options: ["Vue panoramique","Grande surface","Terrasse privée","Jacuzzi","Salon attenant"] },
      ]},
      { section: "Services premium", fields: [
        { key: "services_premium", label: "Services premium disponibles", type: "multiselect",
          options: ["Room service","Minibar","Coffre-fort","Peignoirs"] },
        { key: "petit_dej_inclus", label: "Petit-déjeuner inclus", type: "boolean" },
      ]},
      { section: "Accessibilité & Langues", fields: [
        { key: "pmr", label: "Accessibilité PMR", type: "boolean" },
        { key: "langues_accueil", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  suite: {
    label: "Suite", category: "hebergement",
    sections: [
      { section: "Configuration", fields: [
        { key: "nb_suites", label: "Nombre de suites", type: "number" },
        { key: "surface_moyenne", label: "Surface moyenne (m²)", type: "number" },
        { key: "espaces_distincts", label: "Espaces distincts", type: "multiselect",
          options: ["Salon","Chambre séparée","Terrasse","Cuisine","Salle de bain luxe"] },
      ]},
      { section: "Services inclus", fields: [
        { key: "services_inclus", label: "Services inclus", type: "multiselect",
          options: ["Butler","Spa privé","Repas inclus","Transfert aéroport"] },
      ]},
      { section: "Options & Langues", fields: [
        { key: "privatisation", label: "Privatisation possible", type: "boolean" },
        { key: "langues_accueil", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  bungalow: {
    label: "Bungalow", category: "hebergement",
    sections: [
      { section: "Configuration", fields: [
        { key: "nb_bungalows", label: "Nombre de bungalows", type: "number" },
        { key: "capacite_par_bungalow", label: "Capacité par bungalow", type: "number" },
        { key: "environnement", label: "Environnement", type: "select",
          options: ["Forêt","Plage","Montagne","Jardin","Désert"] },
      ]},
      { section: "Équipements", fields: [
        { key: "equipements", label: "Équipements disponibles", type: "multiselect",
          options: ["Cuisine équipée","Terrasse","Climatisation","Wifi","BBQ"] },
      ]},
      { section: "Options", fields: [
        { key: "animaux_acceptes", label: "Animaux acceptés", type: "boolean" },
        { key: "types_animaux_acceptes", label: "Types d'animaux acceptés", type: "multiselect",
          options: ["Chiens","Chats","Petits animaux","Chevaux","NAC"],
          dependsOn: { field: "animaux_acceptes", value: true } },
        { key: "pmr", label: "Accessibilité PMR", type: "boolean" },
      ]},
    ],
  },

  tente_glamping: {
    label: "Tente glamping", category: "hebergement",
    sections: [
      { section: "Configuration", fields: [
        { key: "nb_tentes", label: "Nombre de tentes", type: "number" },
        { key: "types_tentes", label: "Types de tentes", type: "multiselect",
          options: ["Bell tent","Dôme géodésique","Tipi","Tente safari","Yourte"] },
        { key: "environnement", label: "Environnement", type: "select",
          options: ["Désert","Forêt","Montagne","Bord de mer","Campagne"] },
        { key: "saison_ouverture", label: "Saison d'ouverture", type: "multiselect", options: SAISONS },
      ]},
      { section: "Confort & Équipements", fields: [
        { key: "sanitaires", label: "Sanitaires", type: "select",
          options: ["Privés dans la tente","Cabine séparée privée","Partagés"] },
        { key: "electricite", label: "Électricité disponible", type: "boolean" },
        { key: "restauration", label: "Restauration sur place", type: "boolean" },
      ]},
    ],
  },

  gite_rural: {
    label: "Gîte rural", category: "hebergement",
    sections: [
      { section: "Configuration", fields: [
        { key: "nb_gites", label: "Nombre de gîtes disponibles", type: "number" },
        { key: "capacite_totale", label: "Capacité totale", type: "number" },
        { key: "environnement", label: "Environnement", type: "select",
          options: ["Village","Campagne","Montagne","Forêt"] },
      ]},
      { section: "Services", fields: [
        { key: "cuisine_equipee", label: "Cuisine équipée", type: "boolean" },
        { key: "table_hotes", label: "Table d'hôtes disponible", type: "boolean" },
        { key: "animaux_acceptes", label: "Animaux acceptés", type: "boolean" },
        { key: "types_animaux_acceptes", label: "Types d'animaux acceptés", type: "multiselect",
          options: ["Chiens","Chats","Petits animaux","Chevaux","NAC"],
          dependsOn: { field: "animaux_acceptes", value: true } },
      ]},
    ],
  },

  maison_hotes: {
    label: "Maison d'hôtes", category: "hebergement",
    sections: [
      { section: "Configuration", fields: [
        { key: "nb_chambres", label: "Nombre de chambres", type: "number" },
        { key: "style_architectural", label: "Style architectural", type: "select",
          options: ["Traditionnel","Moderne","Berbère","Andalou","Colonial"] },
        { key: "espaces_communs", label: "Espaces communs disponibles", type: "multiselect",
          options: ["Jardin","Terrasse","Salon commun","Bibliothèque","Piscine"] },
      ]},
      { section: "Accueil & Services", fields: [
        { key: "table_hotes", label: "Table d'hôtes proposée", type: "boolean" },
        { key: "langues_hotes", label: "Langues parlées par les hôtes", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  riad_traditionnel: {
    label: "Riad traditionnel", category: "hebergement",
    sections: [
      { section: "Architecture", fields: [
        { key: "nb_chambres", label: "Nombre de chambres", type: "number" },
        { key: "style_architectural", label: "Style architectural", type: "text" },
        { key: "patio_fontaine", label: "Patio / fontaine", type: "boolean" },
      ]},
      { section: "Services & Accueil", fields: [
        { key: "hammam_prive", label: "Hammam privé", type: "boolean" },
        { key: "restauration", label: "Restauration sur place", type: "boolean" },
        { key: "langues_accueil", label: "Langues parlées à l'accueil", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  ecolodge: {
    label: "Éco-lodge", category: "hebergement",
    sections: [
      { section: "Construction & Énergie", fields: [
        { key: "nb_unites", label: "Nombre d'unités", type: "number" },
        { key: "materiaux", label: "Matériaux de construction", type: "multiselect",
          options: ["Pierre","Bois","Terre","Bambou","Récupération"] },
        { key: "source_energie", label: "Source d'énergie", type: "multiselect",
          options: ["Solaire","Éolienne","Hydraulique","Mixte"] },
      ]},
      { section: "Éco-responsabilité", fields: [
        { key: "certifications", label: "Certifications éco obtenues", type: "multiselect",
          options: ["Green Key","Biosphere","EU Ecolabel","Label ONTT","Bio"] },
        { key: "gestion_dechets", label: "Gestion déchets et eau", type: "multiselect",
          options: ["Compostage","Tri sélectif","Zéro plastique","Recyclage eaux grises"] },
        { key: "restauration_locale", label: "Restauration locale et bio", type: "boolean" },
      ]},
      { section: "Accueil", fields: [
        { key: "langues_accueil", label: "Langues parlées à l'accueil", type: "multiselect", options: LANGS },
        { key: "pmr", label: "Accessibilité PMR", type: "boolean" },
      ]},
    ],
  },

  camping_sauvage: {
    label: "Camping sauvage", category: "hebergement",
    sections: [
      { section: "Configuration du site", fields: [
        { key: "surface_site", label: "Surface totale du site (m²)", type: "number" },
        { key: "nb_emplacements", label: "Nombre d'emplacements", type: "number" },
        { key: "types_acceptes", label: "Types acceptés", type: "multiselect",
          options: ["Tente","Van","Camping-car","Bivouac"] },
        { key: "saison_ouverture", label: "Saison d'ouverture", type: "multiselect", options: SAISONS },
      ]},
      { section: "Équipements & Règles", fields: [
        { key: "acces_eau", label: "Accès eau potable", type: "boolean" },
        { key: "type_sanitaires", label: "Sanitaires", type: "select",
          options: ["WC secs","WC chimiques","Sanitaires complets","Aucun"] },
        { key: "feux_autorises", label: "Feux de camp autorisés", type: "boolean" },
      ]},
    ],
  },

  ferme_agritouristique: {
    label: "Ferme agritouristique", category: "hebergement",
    sections: [
      { section: "La Ferme", fields: [
        { key: "type_production", label: "Type de production principale", type: "select",
          options: ["Maraîchage","Arboriculture","Élevage","Apiculture","Viticulture","Céréales"] },
        { key: "surface_ferme", label: "Surface de la ferme (hectares)", type: "number" },
        { key: "certifications", label: "Certifications", type: "multiselect",
          options: ["Bio","Label rouge","Agriculture raisonnée","Demeter"] },
      ]},
      { section: "Activités & Hébergement", fields: [
        { key: "activites_ferme", label: "Activités à la ferme proposées", type: "multiselect",
          options: ["Cueillette","Traite","Semis","Récolte","Fabrication fromage","Extraction miel"] },
        { key: "type_hebergement", label: "Hébergement sur place", type: "select",
          options: ["Chambre d'hôtes","Gîte","Camping","Aucun"] },
        { key: "restauration_maison", label: "Restauration avec produits maison", type: "boolean" },
      ]},
    ],
  },

  // ── ACTIVITÉ ─────────────────────────────────────────────────────────────────

  randonnee: {
    label: "Randonnée", category: "activite",
    sections: [
      { section: "Territoire & Saison", fields: [
        { key: "zones_sentiers", label: "Zones / sentiers couverts", type: "textarea" },
        { key: "saisons", label: "Saisons d'activité", type: "multiselect", options: SAISONS },
      ]},
      { section: "Niveaux & Groupes", fields: [
        { key: "niveaux", label: "Niveaux proposés", type: "multiselect",
          options: ["Facile","Modéré","Difficile"] },
        { key: "groupe_max", label: "Taille groupe maximum", type: "number" },
      ]},
      { section: "Encadrement & Matériel", fields: [
        { key: "encadrement_guide", label: "Encadrement guide disponible", type: "boolean" },
        { key: "certification_guide", label: "Nom / certification du guide (BPJEPS, brevet…)", type: "text", dependsOn: { field: "encadrement_guide", value: true } },
        { key: "certification_guide_url", label: "URL ou lien justificatif du certificat", type: "url", dependsOn: { field: "encadrement_guide", value: true } },
        { key: "langues_guides", label: "Langues des guides", type: "multiselect", options: LANGS, dependsOn: { field: "encadrement_guide", value: true } },
        { key: "equipement_disponible", label: "Équipement mis à disposition", type: "multiselect",
          options: ["Bâtons","Cartes","Trousse secours","GPS"] },
      ]},
    ],
  },

  kayak_canoe: {
    label: "Kayak / Canoë", category: "activite",
    sections: [
      { section: "Zone & Saison", fields: [
        { key: "zone_eau", label: "Plan d'eau / zone couverte", type: "select",
          options: ["Mer","Lac","Rivière","Fleuve"] },
        { key: "saisons", label: "Saison d'activité", type: "multiselect", options: SAISONS },
      ]},
      { section: "Flotte & Équipement", fields: [
        { key: "nb_embarcations", label: "Nombre d'embarcations", type: "number" },
        { key: "equipement", label: "Équipement disponible", type: "multiselect",
          options: ["Kayak","Canoë","Gilets","Pagaies","Casques"] },
      ]},
      { section: "Encadrement", fields: [
        { key: "niveau_min", label: "Niveau requis minimum", type: "select",
          options: ["Débutant","Intermédiaire","Avancé"] },
        { key: "encadrement", label: "Encadrement disponible", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  velo_vtt: {
    label: "Vélo / VTT", category: "activite",
    sections: [
      { section: "Terrain & Itinéraires", fields: [
        { key: "type_terrain", label: "Type de terrain", type: "multiselect",
          options: ["Piste cyclable","Montagne","Route","Tout-terrain"] },
        { key: "itineraires_balises", label: "Itinéraires balisés", type: "boolean" },
      ]},
      { section: "Flotte", fields: [
        { key: "nb_velos", label: "Nombre de vélos disponibles", type: "number" },
        { key: "types_velos", label: "Types de vélos", type: "multiselect",
          options: ["VTT","City","Électrique","Route","Enfant"] },
      ]},
      { section: "Encadrement & Niveaux", fields: [
        { key: "niveaux", label: "Niveaux proposés", type: "multiselect", options: NIVEAUX_3 },
        { key: "encadrement", label: "Encadrement possible", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  escalade: {
    label: "Escalade", category: "activite",
    sections: [
      { section: "Site & Voies", fields: [
        { key: "type_site", label: "Type de site", type: "multiselect",
          options: ["Falaise naturelle","Mur artificiel","Bloc"] },
        { key: "niveaux_voies", label: "Niveaux de voies disponibles", type: "multiselect",
          options: ["4 à 5","5+ à 6b","6c à 7b","7c et +"] },
        { key: "saisons", label: "Saison d'activité", type: "multiselect", options: SAISONS },
      ]},
      { section: "Sécurité, Équipement & Accueil", fields: [
        { key: "encadrement_certifie", label: "Encadrement certifié", type: "boolean" },
        { key: "certification_encadrement", label: "Nom / organisme du diplôme", type: "text", dependsOn: { field: "encadrement_certifie", value: true } },
        { key: "certification_encadrement_url", label: "URL ou lien justificatif du certificat", type: "url", dependsOn: { field: "encadrement_certifie", value: true } },
        { key: "equipement_disponible", label: "Équipement disponible sur place", type: "boolean" },
        { key: "capacite_simultanee", label: "Capacité simultanée", type: "number" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  yoga: {
    label: "Yoga", category: "activite",
    sections: [
      { section: "Pratique & Cadre", fields: [
        { key: "styles_yoga", label: "Styles de yoga pratiqués", type: "multiselect",
          options: ["Hatha","Vinyasa","Yin","Ashtanga","Kundalini","Nidra"] },
        { key: "cadre", label: "Cadre", type: "select",
          options: ["Intérieur","Extérieur","Nature","Toit-terrasse","Plage"] },
        { key: "niveaux", label: "Niveaux accueillis", type: "multiselect", options: NIVEAUX_3 },
      ]},
      { section: "Enseignement & Capacité", fields: [
        { key: "langues", label: "Langues d'enseignement", type: "multiselect", options: LANGS },
        { key: "equipement_fourni", label: "Équipement fourni (tapis / accessoires)", type: "boolean" },
        { key: "capacite_max", label: "Capacité maximale par séance", type: "number" },
      ]},
    ],
  },

  plongee: {
    label: "Plongée sous-marine", category: "activite",
    sections: [
      { section: "Zone & Profondeurs", fields: [
        { key: "zone_maritime", label: "Zone maritime", type: "text" },
        { key: "profondeurs_accessibles", label: "Profondeurs accessibles (m)", type: "number" },
        { key: "saisons", label: "Saison d'activité", type: "multiselect", options: SAISONS },
      ]},
      { section: "Certifications & Niveaux", fields: [
        { key: "niveaux_acceptes", label: "Niveaux / certifications acceptés", type: "multiselect",
          options: ["Débutant","PADI OW","PADI AOW","CMAS *","CMAS **","CMAS ***"] },
        { key: "instructeurs_certifies", label: "Instructeurs certifiés", type: "boolean" },
        { key: "certif_instructeurs", label: "Organisme(s) de certification", type: "multiselect",
          options: ["PADI","CMAS","SSI","NAUI"], dependsOn: { field: "instructeurs_certifies", value: true } },
        { key: "certif_instructeurs_url", label: "URL ou lien justificatif du certificat", type: "url", dependsOn: { field: "instructeurs_certifies", value: true } },
      ]},
      { section: "Équipement & Accueil", fields: [
        { key: "equipement_disponible", label: "Équipement de plongée disponible", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  surf_windsurf: {
    label: "Surf / Windsurf", category: "activite",
    sections: [
      { section: "Spots & Saison", fields: [
        { key: "spots", label: "Spot(s) concerné(s)", type: "textarea" },
        { key: "saisons", label: "Saison d'activité", type: "multiselect", options: SAISONS },
      ]},
      { section: "Niveaux & Encadrement", fields: [
        { key: "niveaux", label: "Niveaux accueillis", type: "multiselect", options: NIVEAUX_3 },
        { key: "instructeurs_certifies", label: "Instructeurs certifiés", type: "boolean" },
        { key: "certification_instructeurs", label: "Nom / organisme du diplôme", type: "text", dependsOn: { field: "instructeurs_certifies", value: true } },
        { key: "certification_instructeurs_url", label: "URL ou lien justificatif du certificat", type: "url", dependsOn: { field: "instructeurs_certifies", value: true } },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
      { section: "Équipement", fields: [
        { key: "equipement_disponible", label: "Équipement disponible", type: "multiselect",
          options: ["Planches surf","Planches windsurf","Voiles","Combinaisons"] },
      ]},
    ],
  },

  tir_arc: {
    label: "Tir à l'arc", category: "activite",
    sections: [
      { section: "Pratique & Espace", fields: [
        { key: "type_pratique", label: "Type de pratique", type: "multiselect",
          options: ["Traditionnel","Sportif","Nature / 3D"] },
        { key: "espace", label: "Espace", type: "select", options: ["Intérieur","Extérieur"] },
      ]},
      { section: "Encadrement, Équipement & Accueil", fields: [
        { key: "encadrement", label: "Encadrement disponible", type: "boolean" },
        { key: "equipement_disponible", label: "Équipement disponible", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
        { key: "age_minimum", label: "Âge minimum accepté", type: "number" },
        { key: "capacite_simultanee", label: "Capacité simultanée", type: "number" },
      ]},
    ],
  },

  quad_4x4: {
    label: "Quad / 4x4", category: "activite",
    sections: [
      { section: "Terrain & Véhicules", fields: [
        { key: "type_terrain", label: "Type de terrain", type: "multiselect",
          options: ["Désert","Montagne","Piste","Forêt"] },
        { key: "types_vehicules", label: "Types de véhicules", type: "multiselect",
          options: ["Quad","4x4","Buggy"] },
        { key: "nb_vehicules", label: "Nombre de véhicules disponibles", type: "number" },
      ]},
      { section: "Encadrement & Règles", fields: [
        { key: "accompagnateur", label: "Accompagnateur / guide", type: "boolean" },
        { key: "permis_requis", label: "Permis requis", type: "boolean" },
        { key: "age_minimum", label: "Âge minimum conducteur", type: "number" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  peche_traditionnelle: {
    label: "Pêche traditionnelle", category: "activite",
    sections: [
      { section: "Zone & Techniques", fields: [
        { key: "zone_peche", label: "Zone de pêche", type: "select",
          options: ["Mer","Lac","Rivière","Barrage"] },
        { key: "techniques", label: "Techniques pratiquées", type: "multiselect",
          options: ["Ligne","Filet","Harpon","Pêche à pied","Nasse"] },
        { key: "saison_principale", label: "Saison principale", type: "multiselect", options: SAISONS },
      ]},
      { section: "Équipement & Logistique", fields: [
        { key: "materiel_disponible", label: "Matériel disponible", type: "boolean" },
        { key: "embarcation", label: "Embarcation disponible", type: "boolean" },
        { key: "capacite_simultanee", label: "Capacité simultanée", type: "number" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  cours_cuisine: {
    label: "Cours de cuisine", category: "activite",
    sections: [
      { section: "Contenu & Cadre", fields: [
        { key: "specialites_enseignees", label: "Spécialités culinaires enseignées", type: "textarea" },
        { key: "cadre", label: "Cadre", type: "select",
          options: ["Cuisine traditionnelle","Ferme","Extérieur","Riad"] },
        { key: "produits_locaux", label: "Produits locaux / bio utilisés", type: "boolean" },
        { key: "pct_produits_locaux", label: "Part de produits locaux / bio (%)", type: "number",
          dependsOn: { field: "produits_locaux", value: true } },
      ]},
      { section: "Enseignement & Capacité", fields: [
        { key: "niveau_requis", label: "Niveau requis", type: "select",
          options: ["Tous niveaux","Débutant","Initié"] },
        { key: "langues", label: "Langues d'enseignement", type: "multiselect", options: LANGS },
        { key: "capacite_max", label: "Capacité maximale par atelier", type: "number" },
      ]},
    ],
  },

  plantation_jardinage: {
    label: "Plantation / Jardinage", category: "activite",
    sections: [
      { section: "Type & Culture", fields: [
        { key: "type_jardin", label: "Type de jardin / terrain", type: "select",
          options: ["Potager","Arboricole","Médicinal","Permaculture","Traditionnel"] },
        { key: "especes_cultivees", label: "Espèces cultivées", type: "textarea" },
        { key: "type_agriculture", label: "Type d'agriculture", type: "select",
          options: ["Bio","Permaculture","Traditionnel","Raisonné"] },
      ]},
      { section: "Encadrement & Capacité", fields: [
        { key: "encadrement", label: "Encadrement disponible", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
        { key: "capacite_simultanee", label: "Capacité simultanée", type: "number" },
      ]},
    ],
  },

  observation_oiseaux: {
    label: "Observation des oiseaux", category: "activite",
    sections: [
      { section: "Milieux & Espèces", fields: [
        { key: "milieux_couverts", label: "Milieux couverts", type: "multiselect",
          options: ["Zones humides","Forêt","Montagne","Côtier","Steppe"] },
        { key: "especes_phares", label: "Espèces phares présentes", type: "textarea" },
        { key: "meilleure_saison", label: "Meilleure saison", type: "multiselect", options: SAISONS },
      ]},
      { section: "Encadrement & Équipement", fields: [
        { key: "guide_ornithologue", label: "Guide ornithologue disponible", type: "boolean" },
        { key: "equipement_optique", label: "Équipement optique disponible", type: "boolean" },
        { key: "groupe_max", label: "Taille groupe maximum", type: "number" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  equitation: {
    label: "Équitation", category: "activite",
    sections: [
      { section: "Chevaux & Balades", fields: [
        { key: "races_chevaux", label: "Races de chevaux disponibles", type: "textarea" },
        { key: "nb_chevaux", label: "Nombre de chevaux disponibles", type: "number" },
        { key: "types_balades", label: "Types de balades proposées", type: "multiselect",
          options: ["Piste","Montagne","Plage","Campagne","Désert"] },
      ]},
      { section: "Encadrement & Restrictions", fields: [
        { key: "moniteur_certifie", label: "Moniteur certifié", type: "boolean" },
        { key: "certification_moniteur", label: "Nom / organisme du diplôme", type: "text", dependsOn: { field: "moniteur_certifie", value: true } },
        { key: "certification_moniteur_url", label: "URL ou lien justificatif du certificat", type: "url", dependsOn: { field: "moniteur_certifie", value: true } },
        { key: "niveaux_accueillis", label: "Niveaux accueillis", type: "multiselect", options: NIVEAUX_3 },
        { key: "age_minimum", label: "Âge minimum accepté", type: "number" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  // ── RESTAURANT & TERROIR ──────────────────────────────────────────────────────

  restaurant_traditionnel: {
    label: "Restaurant traditionnel", category: "restaurant_terroir",
    sections: [
      { section: "Cuisine & Produits", fields: [
        { key: "cuisines_regionales", label: "Cuisine(s) régionale(s) proposée(s)", type: "textarea" },
        { key: "pct_produits_locaux", label: "% produits locaux utilisés", type: "number" },
        { key: "regimes", label: "Régimes alimentaires pris en charge", type: "multiselect", options: REGIMES },
      ]},
      { section: "Espace & Accueil", fields: [
        { key: "capacite", label: "Capacité d'accueil (couverts)", type: "number" },
        { key: "terrasse", label: "Espace extérieur / terrasse", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  cafe_salon_the: {
    label: "Café / Salon de thé", category: "restaurant_terroir",
    sections: [
      { section: "Offre & Cadre", fields: [
        { key: "specialites", label: "Spécialités proposées", type: "textarea" },
        { key: "produits_maison", label: "Produits faits maison", type: "boolean" },
        { key: "cadre", label: "Cadre", type: "select",
          options: ["Traditionnel","Moderne","En pleine nature","Rooftop"] },
      ]},
      { section: "Espace & Services", fields: [
        { key: "capacite", label: "Capacité d'accueil", type: "number" },
        { key: "espace_exterieur", label: "Espace extérieur", type: "boolean" },
        { key: "wifi", label: "Wifi disponible", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  ferme_restaurant: {
    label: "Ferme-restaurant", category: "restaurant_terroir",
    sections: [
      { section: "Produits & Cuisine", fields: [
        { key: "productions_utilisees", label: "Productions de la ferme utilisées", type: "textarea" },
        { key: "type_cuisine", label: "Type de cuisine proposée", type: "text" },
        { key: "regimes", label: "Régimes alimentaires pris en charge", type: "multiselect",
          options: ["Végétarien","Vegan","Sans gluten","Halal"] },
      ]},
      { section: "Accueil & Options", fields: [
        { key: "capacite", label: "Capacité d'accueil", type: "number" },
        { key: "reservation_obligatoire", label: "Réservation obligatoire", type: "boolean" },
        { key: "visite_ferme", label: "Visite de la ferme associée", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  food_truck: {
    label: "Food truck", category: "restaurant_terroir",
    sections: [
      { section: "Offre culinaire", fields: [
        { key: "type_cuisine", label: "Type de cuisine proposée", type: "text" },
        { key: "regimes", label: "Régimes alimentaires pris en charge", type: "multiselect",
          options: ["Végétarien","Vegan","Sans gluten","Halal"] },
      ]},
      { section: "Mobilité & Présence", fields: [
        { key: "zones_deplacement", label: "Zone(s) de déplacement", type: "textarea" },
        { key: "evenements_couverts", label: "Événements / marchés couverts", type: "textarea" },
      ]},
      { section: "Service & Capacité", fields: [
        { key: "capacite_service", label: "Capacité de service simultané", type: "number" },
        { key: "commande_en_ligne", label: "Commande en ligne", type: "boolean" },
      ]},
    ],
  },

  table_hotes: {
    label: "Table d'hôtes", category: "restaurant_terroir",
    sections: [
      { section: "Menu & Produits", fields: [
        { key: "type_menu", label: "Type de menu", type: "select",
          options: ["Menu unique","Choix limité","Menu du marché"] },
        { key: "produits_locaux", label: "Produits maison / locaux utilisés", type: "boolean" },
        { key: "regimes", label: "Régimes alimentaires pris en charge", type: "multiselect",
          options: ["Végétarien","Vegan","Sans gluten","Halal"] },
      ]},
      { section: "Accueil", fields: [
        { key: "nb_couverts_max", label: "Nombre de couverts maximum", type: "number" },
        { key: "reservation_obligatoire", label: "Réservation obligatoire", type: "boolean" },
        { key: "langues_hotes", label: "Langues parlées par les hôtes", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  degustation_produits: {
    label: "Dégustation de produits", category: "restaurant_terroir",
    sections: [
      { section: "Produits", fields: [
        { key: "produits_proposes", label: "Produits proposés à la dégustation", type: "textarea" },
        { key: "origine_produits", label: "Origine des produits", type: "select",
          options: ["Ferme propre","Producteurs locaux","Région"] },
        { key: "certifications", label: "Certification / label des produits", type: "text" },
      ]},
      { section: "Animation & Commerce", fields: [
        { key: "vente_sur_place", label: "Vente sur place", type: "boolean" },
        { key: "langues", label: "Langues d'animation", type: "multiselect", options: LANGS },
        { key: "capacite", label: "Capacité d'accueil", type: "number" },
      ]},
    ],
  },

  diner_panoramique: {
    label: "Dîner panoramique", category: "restaurant_terroir",
    sections: [
      { section: "Cadre & Vue", fields: [
        { key: "type_vue", label: "Type de vue", type: "select",
          options: ["Mer","Montagne","Désert","Médina","Vallée","Forêt"] },
        { key: "acces_site", label: "Accessibilité (conditions d'accès)", type: "textarea" },
      ]},
      { section: "Offre & Animation", fields: [
        { key: "cuisine_proposee", label: "Cuisine proposée", type: "text" },
        { key: "animation_musicale", label: "Animation musicale", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
        { key: "capacite", label: "Capacité d'accueil", type: "number" },
      ]},
    ],
  },

  // ── ARTISANAT ────────────────────────────────────────────────────────────────

  poterie: {
    label: "Poterie", category: "artisanat",
    sections: [
      { section: "Savoir-faire", fields: [
        { key: "techniques", label: "Techniques maîtrisées", type: "multiselect",
          options: ["Tour de potier","Modelage à la main","Décoration","Cuisson traditionnelle"] },
        { key: "region_artistique", label: "Région / école artistique", type: "text" },
        { key: "annees_experience", label: "Années d'expérience", type: "number" },
      ]},
      { section: "Atelier & Commerce", fields: [
        { key: "atelier_demonstration", label: "Démonstration disponible", type: "boolean" },
        { key: "initiation_proposee", label: "Initiation proposée", type: "boolean" },
        { key: "vente_sur_place", label: "Vente sur place", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  tissage: {
    label: "Tissage", category: "artisanat",
    sections: [
      { section: "Savoir-faire", fields: [
        { key: "techniques", label: "Techniques pratiquées", type: "multiselect",
          options: ["Métier à tisser","Tissage à la main","Macramé"] },
        { key: "matieres", label: "Matières utilisées", type: "multiselect",
          options: ["Laine","Soie","Alfa","Coton","Lin"] },
        { key: "motifs_region", label: "Motifs / région d'inspiration", type: "text" },
      ]},
      { section: "Atelier & Commerce", fields: [
        { key: "atelier_demonstration", label: "Démonstration disponible", type: "boolean" },
        { key: "initiation_proposee", label: "Initiation proposée", type: "boolean" },
        { key: "vente_sur_place", label: "Vente sur place", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  bijoux_berberes: {
    label: "Bijoux berbères", category: "artisanat",
    sections: [
      { section: "Savoir-faire", fields: [
        { key: "materiaux", label: "Matériaux utilisés", type: "multiselect",
          options: ["Argent","Corail","Ambre","Pierres semi-précieuses","Émail"] },
        { key: "region_style", label: "Région / style", type: "select",
          options: ["Amazigh","Tunisien","Sud tunisien","Kabyle","Touareg"] },
        { key: "techniques", label: "Techniques", type: "multiselect",
          options: ["Filigrane","Gravure","Sertissage","Ciselure"] },
      ]},
      { section: "Atelier & Commerce", fields: [
        { key: "atelier_initiation", label: "Atelier initiation", type: "boolean" },
        { key: "personnalisation", label: "Personnalisation possible", type: "boolean" },
        { key: "vente_sur_place", label: "Vente sur place", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  broderie: {
    label: "Broderie", category: "artisanat",
    sections: [
      { section: "Savoir-faire", fields: [
        { key: "style", label: "Style pratiqué", type: "select",
          options: ["Tunis","Nabeul","Monastir","Hammamet","Sfax"] },
        { key: "matieres", label: "Matières utilisées", type: "multiselect",
          options: ["Fil d'or","Soie","Coton","Lin"] },
        { key: "annees_experience", label: "Années d'expérience", type: "number" },
      ]},
      { section: "Atelier & Commerce", fields: [
        { key: "atelier_initiation", label: "Atelier initiation", type: "boolean" },
        { key: "vente_sur_place", label: "Vente sur place", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  vannerie: {
    label: "Vannerie", category: "artisanat",
    sections: [
      { section: "Savoir-faire", fields: [
        { key: "matieres", label: "Matières utilisées", type: "multiselect",
          options: ["Alfa","Feuilles de palmier","Jonc","Osier","Rotin"] },
        { key: "objets_fabriques", label: "Objets fabriqués", type: "textarea" },
        { key: "region_style", label: "Région / style traditionnel", type: "text" },
      ]},
      { section: "Atelier & Commerce", fields: [
        { key: "atelier_initiation", label: "Atelier initiation", type: "boolean" },
        { key: "vente_sur_place", label: "Vente sur place", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  sculpture_bois: {
    label: "Sculpture sur bois", category: "artisanat",
    sections: [
      { section: "Savoir-faire", fields: [
        { key: "essences_utilisees", label: "Essences utilisées", type: "multiselect",
          options: ["Olivier","Cèdre","Noyer","Thuya","Jujubier"] },
        { key: "types_objets", label: "Types d'objets fabriqués", type: "textarea" },
        { key: "techniques", label: "Techniques pratiquées", type: "multiselect",
          options: ["Sculpture","Marqueterie","Tournage","Gravure"] },
      ]},
      { section: "Atelier & Commerce", fields: [
        { key: "atelier_initiation", label: "Atelier initiation", type: "boolean" },
        { key: "vente_sur_place", label: "Vente sur place", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  tannerie: {
    label: "Tannerie", category: "artisanat",
    sections: [
      { section: "Savoir-faire", fields: [
        { key: "type_tannage", label: "Type de tannage", type: "select",
          options: ["Végétal","Traditionnel","Mixte"] },
        { key: "peaux_travaillees", label: "Peaux travaillées", type: "multiselect",
          options: ["Vache","Mouton","Chèvre","Chameau"] },
        { key: "produits_fabriques", label: "Produits fabriqués", type: "textarea" },
      ]},
      { section: "Visite & Commerce", fields: [
        { key: "visite_guidee", label: "Visite guidée possible", type: "boolean" },
        { key: "langues_guide", label: "Langues du guide", type: "multiselect", options: LANGS, dependsOn: { field: "visite_guidee", value: true } },
        { key: "vente_sur_place", label: "Vente sur place", type: "boolean" },
      ]},
    ],
  },

  parfumerie_naturelle: {
    label: "Parfumerie naturelle", category: "artisanat",
    sections: [
      { section: "Matières & Produits", fields: [
        { key: "plantes_fleurs", label: "Plantes / fleurs utilisées", type: "textarea" },
        { key: "origine_matieres", label: "Origine des matières premières", type: "select",
          options: ["Ferme propre","Région locale","National"] },
        { key: "produits_fabriques", label: "Produits fabriqués", type: "multiselect",
          options: ["Huiles essentielles","Eaux florales","Savons","Bougies","Baumes"] },
      ]},
      { section: "Atelier & Commerce", fields: [
        { key: "atelier_initiation", label: "Atelier initiation", type: "boolean" },
        { key: "certification_bio", label: "Certification naturelle / bio", type: "boolean" },
        { key: "vente_sur_place", label: "Vente sur place", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  peinture_traditionnelle: {
    label: "Peinture traditionnelle", category: "artisanat",
    sections: [
      { section: "Savoir-faire", fields: [
        { key: "styles", label: "Styles pratiqués", type: "multiselect",
          options: ["Miniature","Naïf","Calligraphie","Zellige","Arabesque"] },
        { key: "supports", label: "Supports utilisés", type: "multiselect",
          options: ["Papier","Céramique","Soie","Toile","Bois"] },
      ]},
      { section: "Atelier & Commerce", fields: [
        { key: "atelier_initiation", label: "Atelier initiation", type: "boolean" },
        { key: "niveaux", label: "Niveaux accueillis", type: "multiselect", options: NIVEAUX_3 },
        { key: "vente_sur_place", label: "Vente sur place", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  calligraphie: {
    label: "Calligraphie", category: "artisanat",
    sections: [
      { section: "Savoir-faire", fields: [
        { key: "styles", label: "Styles pratiqués", type: "multiselect",
          options: ["Arabe","Amazigh","Ottoman","Maghrébin"] },
        { key: "supports", label: "Supports utilisés", type: "multiselect",
          options: ["Papier","Parchemin","Tissu","Bois","Céramique"] },
      ]},
      { section: "Enseignement & Commerce", fields: [
        { key: "materiel_disponible", label: "Matériel disponible", type: "boolean" },
        { key: "niveaux", label: "Niveaux accueillis", type: "multiselect", options: NIVEAUX_3 },
        { key: "atelier_initiation", label: "Atelier initiation", type: "boolean" },
        { key: "langues", label: "Langues d'enseignement", type: "multiselect", options: LANGS },
        { key: "vente_sur_place", label: "Vente sur place", type: "boolean" },
      ]},
    ],
  },

  // ── AGRICULTURE & TERROIR ────────────────────────────────────────────────────

  visite_ferme: {
    label: "Visite de ferme", category: "agriculture_terroir",
    sections: [
      { section: "La Ferme", fields: [
        { key: "type_production", label: "Type de production principale", type: "select",
          options: ["Maraîchage","Arboriculture","Élevage","Apiculture","Céréales","Mixte"] },
        { key: "surface_hectares", label: "Surface (hectares)", type: "number" },
        { key: "mode_culture", label: "Mode de culture", type: "select",
          options: ["Bio","Traditionnel","Raisonné","Permaculture"] },
      ]},
      { section: "Animaux & Vie de la ferme", fields: [
        { key: "animaux_presents", label: "Animaux présents", type: "textarea" },
      ]},
      { section: "Accueil", fields: [
        { key: "langues_guide", label: "Langues du guide", type: "multiselect", options: LANGS },
        { key: "enfants_acceptes", label: "Accessibilité enfants", type: "boolean" },
      ]},
    ],
  },

  cueillette: {
    label: "Cueillette", category: "agriculture_terroir",
    sections: [
      { section: "Produits & Période", fields: [
        { key: "produits_concernes", label: "Produits concernés", type: "multiselect",
          options: ["Olives","Dattes","Figues","Agrumes","Herbes aromatiques","Fruits rouges"] },
        { key: "periode_cueillette", label: "Période de cueillette (mois)", type: "multiselect", options: MOIS },
      ]},
      { section: "Culture & Encadrement", fields: [
        { key: "mode_culture", label: "Mode de culture", type: "select",
          options: ["Bio","Traditionnel","Raisonné"] },
        { key: "encadrement", label: "Encadrement disponible", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  atelier_huile_olive: {
    label: "Atelier huile d'olive", category: "agriculture_terroir",
    sections: [
      { section: "Production", fields: [
        { key: "varietes_olives", label: "Variétés d'olives utilisées", type: "textarea" },
        { key: "type_moulin", label: "Type de moulin", type: "select",
          options: ["Traditionnel à meule","Semi-moderne","Moderne continu"] },
        { key: "periode_activite", label: "Période (saison de récolte)", type: "text" },
      ]},
      { section: "Contenu de l'atelier", fields: [
        { key: "etapes_presentees", label: "Étapes présentées", type: "multiselect",
          options: ["Récolte","Lavage","Broyage","Malaxage","Extraction","Filtration","Dégustation"] },
      ]},
      { section: "Animation & Commerce", fields: [
        { key: "langues", label: "Langues d'animation", type: "multiselect", options: LANGS },
        { key: "vente_sur_place", label: "Vente d'huile sur place", type: "boolean" },
      ]},
    ],
  },

  atelier_fromage_yaourt: {
    label: "Atelier fromage / yaourt", category: "agriculture_terroir",
    sections: [
      { section: "Matières premières", fields: [
        { key: "type_lait", label: "Type de lait utilisé", type: "multiselect",
          options: ["Vache","Brebis","Chèvre","Chamelle"] },
        { key: "mode_elevage", label: "Mode d'élevage", type: "select",
          options: ["Bio","Traditionnel","Plein air"] },
      ]},
      { section: "Production & Commerce", fields: [
        { key: "produits_fabriques", label: "Produits fabriqués", type: "textarea" },
        { key: "certification", label: "Certification (bio / label)", type: "boolean" },
        { key: "langues", label: "Langues d'animation", type: "multiselect", options: LANGS },
        { key: "vente_sur_place", label: "Vente sur place", type: "boolean" },
      ]},
    ],
  },

  apiculture: {
    label: "Apiculture", category: "agriculture_terroir",
    sections: [
      { section: "Le Rucher", fields: [
        { key: "nb_ruches", label: "Nombre de ruches", type: "number" },
        { key: "types_miel", label: "Type de miel produit", type: "multiselect",
          options: ["Romarin","Thym","Oranger","Lavande","Toutes fleurs","Jujubier"] },
        { key: "mode_apiculture", label: "Mode d'apiculture", type: "select",
          options: ["Traditionnel","Bio","Conventionnel"] },
      ]},
      { section: "Animation & Commerce", fields: [
        { key: "equipement_disponible", label: "Équipement apiculteur disponible", type: "boolean" },
        { key: "langues", label: "Langues d'animation", type: "multiselect", options: LANGS },
        { key: "vente_miel", label: "Vente de miel sur place", type: "boolean" },
      ]},
    ],
  },

  viticulture: {
    label: "Viticulture", category: "agriculture_terroir",
    sections: [
      { section: "Le Vignoble", fields: [
        { key: "cepages", label: "Cépages cultivés", type: "textarea" },
        { key: "mode_culture", label: "Mode de culture", type: "select",
          options: ["Bio","Raisonné","Conventionnel"] },
        { key: "type_production", label: "Type de production", type: "multiselect",
          options: ["Raisin de table","Raisin à jus","Raisin sec"] },
      ]},
      { section: "Visite & Dégustation", fields: [
        { key: "visite_vignoble", label: "Visite du vignoble possible", type: "boolean" },
        { key: "degustation", label: "Dégustation proposée", type: "boolean" },
        { key: "langues", label: "Langues d'animation", type: "multiselect", options: LANGS },
        { key: "vente_sur_place", label: "Vente sur place", type: "boolean" },
      ]},
    ],
  },

  elevage_responsable: {
    label: "Élevage responsable", category: "agriculture_terroir",
    sections: [
      { section: "L'Élevage", fields: [
        { key: "types_animaux", label: "Types d'animaux élevés", type: "multiselect",
          options: ["Bovins","Ovins","Caprins","Volailles","Camelins","Équidés"] },
        { key: "mode_elevage", label: "Mode d'élevage", type: "select",
          options: ["Extensif","Semi-extensif","Bio","Traditionnel"] },
        { key: "certifications", label: "Certifications", type: "multiselect",
          options: ["Bio","Label rouge","Agriculture raisonnée"] },
      ]},
      { section: "Visite & Animation", fields: [
        { key: "activites_proposees", label: "Activités proposées", type: "multiselect",
          options: ["Alimentation des animaux","Traite","Fabrication fromage","Tonte"] },
        { key: "langues_guide", label: "Langues du guide", type: "multiselect", options: LANGS },
        { key: "enfants_acceptes", label: "Accessibilité enfants", type: "boolean" },
      ]},
    ],
  },

  // ── CULTURE & PATRIMOINE ─────────────────────────────────────────────────────

  visite_medina: {
    label: "Visite de médina", category: "culture_patrimoine",
    sections: [
      { section: "La Médina", fields: [
        { key: "medina_concernee", label: "Médina concernée (Tunis, Sfax, Kairouan…)", type: "text" },
        { key: "quartiers_couverts", label: "Quartiers / souks couverts", type: "textarea" },
        { key: "type_visite", label: "Type de visite", type: "select",
          options: ["Libre","Guidée","Semi-guidée"] },
      ]},
      { section: "Encadrement", fields: [
        { key: "langues_guide", label: "Langues du guide", type: "multiselect", options: LANGS },
        { key: "duree_visite", label: "Durée de la visite", type: "select",
          options: ["1h","2h","Demi-journée","Journée"] },
        { key: "groupe_max", label: "Taille groupe maximum", type: "number" },
      ]},
    ],
  },

  circuit_historique: {
    label: "Circuit historique", category: "culture_patrimoine",
    sections: [
      { section: "Sites & Périodes", fields: [
        { key: "sites_couverts", label: "Sites / monuments couverts", type: "textarea" },
        { key: "periodes_historiques", label: "Périodes historiques abordées", type: "multiselect",
          options: ["Antiquité","Médiéval","Ottoman","Protectorat","Époque moderne"] },
        { key: "durees", label: "Durées proposées", type: "multiselect",
          options: ["Demi-journée","Journée","Multi-jours"] },
      ]},
      { section: "Encadrement", fields: [
        { key: "guide_specialise", label: "Guide spécialisé histoire", type: "boolean" },
        { key: "langues_guide", label: "Langues du guide", type: "multiselect", options: LANGS },
        { key: "groupe_max", label: "Taille groupe maximum", type: "number" },
      ]},
    ],
  },

  visite_musee: {
    label: "Visite musée / site archéologique", category: "culture_patrimoine",
    sections: [
      { section: "Le Site", fields: [
        { key: "nom_site", label: "Nom du musée / site", type: "text" },
        { key: "type_site", label: "Type de site", type: "select",
          options: ["Musée archéologique","Site en plein air","Musée ethnographique","Monument historique"] },
        { key: "periode_historique", label: "Période historique principale", type: "text" },
      ]},
      { section: "Services", fields: [
        { key: "visite_guidee", label: "Visite guidée disponible", type: "boolean" },
        { key: "langues_guide", label: "Langues du guide", type: "multiselect", options: LANGS, dependsOn: { field: "visite_guidee", value: true } },
        { key: "materiel_audio", label: "Audioguide disponible", type: "boolean" },
        { key: "accessibilite_pmr", label: "Accessibilité PMR", type: "boolean" },
      ]},
    ],
  },

  soiree_culturelle: {
    label: "Soirée culturelle", category: "culture_patrimoine",
    sections: [
      { section: "Programme", fields: [
        { key: "type_soiree", label: "Type de soirée", type: "multiselect",
          options: ["Musicale","Danse traditionnelle","Conteur","Gastronomique","Mixte"] },
        { key: "cadre", label: "Cadre", type: "select",
          options: ["Plein air","Riad","Salle de spectacle","Plage"] },
        { key: "duree", label: "Durée approximative", type: "select",
          options: ["1h","2h","3h et +"] },
      ]},
      { section: "Animation & Accueil", fields: [
        { key: "langues", label: "Langues de présentation", type: "multiselect", options: LANGS },
        { key: "capacite", label: "Capacité d'accueil", type: "number" },
      ]},
    ],
  },

  spectacle_traditionnel: {
    label: "Spectacle traditionnel", category: "culture_patrimoine",
    sections: [
      { section: "Type & Contenu", fields: [
        { key: "type_spectacle", label: "Type de spectacle", type: "multiselect",
          options: ["Musique gnawa","Musique malouf","Danse folklorique","Théâtre traditionnel","Marionnettes"] },
        { key: "duree", label: "Durée", type: "select", options: ["30min","1h","2h et +"] },
      ]},
      { section: "Production & Accueil", fields: [
        { key: "nb_artistes", label: "Nombre d'artistes", type: "number" },
        { key: "langues_presentation", label: "Langues de présentation", type: "multiselect", options: LANGS },
        { key: "capacite", label: "Capacité d'accueil", type: "number" },
      ]},
    ],
  },

  atelier_musical: {
    label: "Atelier musical", category: "culture_patrimoine",
    sections: [
      { section: "Contenu", fields: [
        { key: "instruments", label: "Instruments enseignés / démontrés", type: "multiselect",
          options: ["Oud","Darbuka","Qanun","Mezoued","Zokra","Bendir","Guembri"] },
        { key: "style_musical", label: "Style musical", type: "multiselect",
          options: ["Malouf","Mezoued","Folklorique","Stambali","Contemporain"] },
        { key: "niveaux", label: "Niveaux accueillis", type: "multiselect", options: NIVEAUX_3 },
      ]},
      { section: "Enseignement & Capacité", fields: [
        { key: "duree_seance", label: "Durée d'une séance", type: "select",
          options: ["1h","2h","3h","Sur mesure"] },
        { key: "langues", label: "Langues d'enseignement", type: "multiselect", options: LANGS },
        { key: "capacite_max", label: "Capacité max par session", type: "number" },
      ]},
    ],
  },

  calligraphie_arabe: {
    label: "Calligraphie arabe", category: "culture_patrimoine",
    sections: [
      { section: "Savoir-faire", fields: [
        { key: "styles", label: "Styles de calligraphie", type: "multiselect",
          options: ["Naskh","Thuluth","Kufique","Diwani","Riq'a"] },
        { key: "supports", label: "Supports utilisés", type: "multiselect",
          options: ["Papier","Parchemin","Tissu","Bois","Céramique"] },
      ]},
      { section: "Enseignement & Commerce", fields: [
        { key: "materiel_disponible", label: "Matériel disponible", type: "boolean" },
        { key: "niveaux", label: "Niveaux accueillis", type: "multiselect", options: NIVEAUX_3 },
        { key: "langues", label: "Langues d'enseignement", type: "multiselect", options: LANGS },
        { key: "vente_oeuvres", label: "Vente d'œuvres sur place", type: "boolean" },
      ]},
    ],
  },

  // ── BIEN-ÊTRE & SPA ──────────────────────────────────────────────────────────

  hammam_traditionnel: {
    label: "Hammam traditionnel", category: "bien_etre_spa",
    sections: [
      { section: "Prestations", fields: [
        { key: "type_hammam", label: "Type de hammam", type: "select",
          options: ["Traditionnel","Rénové moderne","Royal"] },
        { key: "soins_proposes", label: "Soins proposés", type: "multiselect",
          options: ["Gommage kessa","Savon noir","Enveloppement argile","Massage","Soin visage"] },
        { key: "produits_naturels", label: "Produits naturels utilisés", type: "boolean" },
      ]},
      { section: "Accueil & Organisation", fields: [
        { key: "organisation", label: "Organisation", type: "select",
          options: ["Mixte","Séparé H/F","Sur réservation"] },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
        { key: "capacite", label: "Capacité simultanée", type: "number" },
      ]},
    ],
  },

  massage_naturel: {
    label: "Massage aux huiles naturelles", category: "bien_etre_spa",
    sections: [
      { section: "Soins & Produits", fields: [
        { key: "types_massage", label: "Types de massage", type: "multiselect",
          options: ["Relaxant","Sportif","Thérapeutique","Aromatique"] },
        { key: "huiles_utilisees", label: "Huiles utilisées", type: "textarea" },
        { key: "certifications_praticiens", label: "Certifications des praticiens", type: "text" },
      ]},
      { section: "Accueil", fields: [
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
        { key: "nb_tables", label: "Nombre de tables disponibles", type: "number" },
      ]},
    ],
  },

  retraite_yoga: {
    label: "Retraite yoga", category: "bien_etre_spa",
    sections: [
      { section: "Programme", fields: [
        { key: "duree_retraite", label: "Durée de la retraite", type: "select",
          options: ["Week-end","3-4 jours","Semaine","Sur mesure"] },
        { key: "styles_yoga", label: "Styles de yoga", type: "multiselect",
          options: ["Hatha","Vinyasa","Yin","Ashtanga","Kundalini","Nidra"] },
        { key: "cadre", label: "Cadre", type: "select",
          options: ["Plein air","Intérieur","Montagne","Plage","Oasis"] },
      ]},
      { section: "Hébergement & Restauration", fields: [
        { key: "hebergement_inclus", label: "Hébergement inclus", type: "boolean" },
        { key: "type_hebergement_retraite", label: "Type d'hébergement proposé", type: "select",
          options: ["Chambre privée","Chambre partagée","Dortoir","Tente","Bungalow"],
          dependsOn: { field: "hebergement_inclus", value: true } },
        { key: "repas_inclus", label: "Repas inclus", type: "boolean" },
        { key: "regimes_repas", label: "Régimes alimentaires disponibles", type: "multiselect",
          options: REGIMES, dependsOn: { field: "repas_inclus", value: true } },
        { key: "langues", label: "Langues d'enseignement", type: "multiselect", options: LANGS },
        { key: "capacite_max", label: "Capacité maximale", type: "number" },
      ]},
    ],
  },

  meditation: {
    label: "Méditation / Pleine conscience", category: "bien_etre_spa",
    sections: [
      { section: "Pratique", fields: [
        { key: "styles", label: "Styles pratiqués", type: "multiselect",
          options: ["Vipassana","Mindfulness","Méditation guidée","Respiration","Cohérence cardiaque"] },
        { key: "cadre", label: "Cadre", type: "select",
          options: ["Intérieur","Nature","Jardin","Mer","Désert"] },
        { key: "niveau", label: "Niveau requis", type: "select",
          options: ["Tous niveaux","Initié","Avancé"] },
      ]},
      { section: "Enseignement & Capacité", fields: [
        { key: "langues", label: "Langues d'enseignement", type: "multiselect", options: LANGS },
        { key: "capacite_max", label: "Capacité maximale par séance", type: "number" },
      ]},
    ],
  },

  bain_thermal: {
    label: "Bain thermal", category: "bien_etre_spa",
    sections: [
      { section: "Source & Soins", fields: [
        { key: "type_source", label: "Type de source", type: "select",
          options: ["Eau thermale","Eau sulfureuse","Eau minérale"] },
        { key: "temperature_eau", label: "Température de l'eau (°C)", type: "number" },
        { key: "bienfaits", label: "Bienfaits principaux", type: "multiselect",
          options: ["Détente musculaire","Soin rhumatismes","Soin peau","Anti-stress"] },
      ]},
      { section: "Accueil", fields: [
        { key: "organisation", label: "Organisation", type: "select",
          options: ["Mixte","Séparé H/F"] },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
        { key: "capacite", label: "Capacité simultanée", type: "number" },
      ]},
    ],
  },

  therapie_plantes: {
    label: "Thérapie par les plantes", category: "bien_etre_spa",
    sections: [
      { section: "Pratique", fields: [
        { key: "type_therapie", label: "Type de thérapie", type: "multiselect",
          options: ["Phytothérapie","Aromathérapie","Herboristerie","Tisanerie"] },
        { key: "plantes_utilisees", label: "Plantes médicinales utilisées", type: "textarea" },
        { key: "certifications", label: "Certifications du praticien", type: "text" },
      ]},
      { section: "Offre", fields: [
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
        { key: "vente_plantes", label: "Vente de plantes / produits", type: "boolean" },
      ]},
    ],
  },

  gommage_savon_noir: {
    label: "Gommage au savon noir", category: "bien_etre_spa",
    sections: [
      { section: "Soins & Produits", fields: [
        { key: "type_savon", label: "Type de savon utilisé", type: "select",
          options: ["Savon noir traditionnel","Beldi","Bio","Parfumé"] },
        { key: "produits_complementaires", label: "Produits complémentaires", type: "multiselect",
          options: ["Ghassoul","Huile d'argan","Henné","Eau de rose"] },
      ]},
      { section: "Accueil", fields: [
        { key: "organisation", label: "Organisation", type: "select",
          options: ["Mixte","Séparé H/F"] },
        { key: "duree_seance", label: "Durée d'une séance", type: "select",
          options: ["30min","1h","1h30"] },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
        { key: "nb_cabines", label: "Nombre de cabines", type: "number" },
      ]},
    ],
  },

  // ── TRANSPORT ÉCO ────────────────────────────────────────────────────────────

  location_velo: {
    label: "Location vélo", category: "transport_eco",
    sections: [
      { section: "Flotte & Équipement", fields: [
        { key: "nb_velos", label: "Nombre de vélos disponibles", type: "number" },
        { key: "types_velos", label: "Types de vélos", type: "multiselect",
          options: ["City","VTT","Électrique","Route","Enfant","Tandem"] },
        { key: "equipement_inclus", label: "Équipement inclus", type: "multiselect",
          options: ["Casque","Antivol","Pompe","Kit réparation","Carte"] },
      ]},
      { section: "Service", fields: [
        { key: "durees_location", label: "Durées de location", type: "multiselect",
          options: ["1h","Demi-journée","Journée","Semaine"] },
        { key: "itineraires_disponibles", label: "Itinéraires / cartes fournis", type: "boolean" },
      ]},
    ],
  },

  caleche: {
    label: "Calèche / Charrette", category: "transport_eco",
    sections: [
      { section: "Attelage & Zone", fields: [
        { key: "nb_vehicules", label: "Nombre de calèches disponibles", type: "number" },
        { key: "type_attelage", label: "Type d'attelage", type: "select",
          options: ["Calèche","Charrette","Cariole"] },
        { key: "zone_couverte", label: "Zone couverte", type: "text" },
      ]},
      { section: "Encadrement & Capacité", fields: [
        { key: "cocher_guide", label: "Cocher / guide inclus", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
        { key: "capacite_par_vehicule", label: "Capacité par véhicule", type: "number" },
      ]},
    ],
  },

  bateau_traditionnel: {
    label: "Bateau traditionnel (felucca)", category: "transport_eco",
    sections: [
      { section: "Flotte & Zone", fields: [
        { key: "nb_bateaux", label: "Nombre de bateaux", type: "number" },
        { key: "zone_maritime", label: "Zone / circuit maritime", type: "text" },
        { key: "saisons", label: "Saisons d'activité", type: "multiselect", options: SAISONS },
      ]},
      { section: "Encadrement & Capacité", fields: [
        { key: "batelier_certifie", label: "Batelier / capitaine certifié", type: "boolean" },
        { key: "certification_batelier", label: "Titre / nom du certificat", type: "text", dependsOn: { field: "batelier_certifie", value: true } },
        { key: "certification_batelier_url", label: "URL ou lien justificatif du certificat", type: "url", dependsOn: { field: "batelier_certifie", value: true } },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
        { key: "capacite_par_bateau", label: "Capacité par bateau", type: "number" },
      ]},
    ],
  },

  tuk_tuk: {
    label: "Tuk-tuk électrique", category: "transport_eco",
    sections: [
      { section: "Flotte & Zone", fields: [
        { key: "nb_tuk_tuks", label: "Nombre de tuk-tuks disponibles", type: "number" },
        { key: "autonomie", label: "Autonomie (km)", type: "number" },
        { key: "zone_couverte", label: "Zone couverte", type: "text" },
      ]},
      { section: "Service", fields: [
        { key: "durees_location", label: "Durées proposées", type: "multiselect",
          options: ["30min","1h","Demi-journée","Journée"] },
        { key: "conducteur_inclus", label: "Conducteur inclus", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  dromadaire: {
    label: "Dromadaire", category: "transport_eco",
    sections: [
      { section: "Troupeau & Zone", fields: [
        { key: "nb_dromadaires", label: "Nombre de dromadaires disponibles", type: "number" },
        { key: "type_terrain", label: "Type de terrain", type: "multiselect",
          options: ["Désert saharien","Steppe","Oasis"] },
        { key: "region_couverte", label: "Région couverte", type: "text" },
      ]},
      { section: "Encadrement & Formules", fields: [
        { key: "chamelier", label: "Chamelier disponible", type: "boolean" },
        { key: "durees_proposees", label: "Durées proposées", type: "multiselect",
          options: ["30min","1h","Demi-journée","Journée","Multi-jours"] },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  transfert_partage: {
    label: "Transfert partagé", category: "transport_eco",
    sections: [
      { section: "Service", fields: [
        { key: "type_vehicule", label: "Type de véhicule", type: "multiselect",
          options: ["Minibus","4x4","Berline","Électrique"] },
        { key: "nb_places", label: "Nombre de places disponibles", type: "number" },
        { key: "zones_couvertes", label: "Zones / trajets couverts", type: "textarea" },
      ]},
      { section: "Organisation", fields: [
        { key: "reservation_requise", label: "Réservation à l'avance requise", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  // ── VOLONTARIAT & ÉCO-ACTION ─────────────────────────────────────────────────

  plantation_arbres: {
    label: "Plantation d'arbres", category: "volontariat_eco",
    sections: [
      { section: "Programme", fields: [
        { key: "especes_plantees", label: "Espèces plantées", type: "multiselect",
          options: ["Olivier","Pin","Chêne","Acacia","Caroubier","Tamaris"] },
        { key: "site_plantation", label: "Site de plantation", type: "text" },
        { key: "periode_activite", label: "Période d'activité (mois)", type: "multiselect", options: MOIS },
      ]},
      { section: "Organisation", fields: [
        { key: "encadrement", label: "Encadrement disponible", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
        { key: "groupe_max", label: "Taille groupe maximum", type: "number" },
      ]},
    ],
  },

  nettoyage_plage: {
    label: "Nettoyage de plage", category: "volontariat_eco",
    sections: [
      { section: "Programme", fields: [
        { key: "site", label: "Site / plage concerné(e)", type: "text" },
        { key: "frequence", label: "Fréquence des actions", type: "select",
          options: ["Hebdomadaire","Mensuelle","Ponctuelle","Saisonnière"] },
        { key: "partenaires", label: "Partenaires / associations", type: "textarea" },
      ]},
      { section: "Organisation", fields: [
        { key: "equipement_fourni", label: "Équipement fourni", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
        { key: "groupe_max", label: "Taille groupe maximum", type: "number" },
      ]},
    ],
  },

  nettoyage_foret: {
    label: "Nettoyage de forêt", category: "volontariat_eco",
    sections: [
      { section: "Programme", fields: [
        { key: "site", label: "Site / forêt concernée", type: "text" },
        { key: "frequence", label: "Fréquence des actions", type: "select",
          options: ["Hebdomadaire","Mensuelle","Ponctuelle","Saisonnière"] },
        { key: "partenaires", label: "Partenaires associés", type: "textarea" },
      ]},
      { section: "Organisation", fields: [
        { key: "equipement_fourni", label: "Équipement fourni", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
        { key: "groupe_max", label: "Taille groupe maximum", type: "number" },
      ]},
    ],
  },

  education_environnementale: {
    label: "Éducation environnementale", category: "volontariat_eco",
    sections: [
      { section: "Programme", fields: [
        { key: "themes", label: "Thèmes abordés", type: "multiselect",
          options: ["Biodiversité","Eau","Déchets","Énergie","Changement climatique","Alimentation durable"] },
        { key: "publics_cibles", label: "Publics cibles", type: "multiselect",
          options: ["Enfants","Ados","Adultes","Familles","Scolaires"] },
        { key: "format", label: "Format", type: "select",
          options: ["Atelier","Conférence","Sortie nature","Exposition"] },
      ]},
      { section: "Animation", fields: [
        { key: "langues", label: "Langues d'animation", type: "multiselect", options: LANGS },
        { key: "capacite_max", label: "Capacité maximale par session", type: "number" },
      ]},
    ],
  },

  jardin_communautaire: {
    label: "Construction jardin communautaire", category: "volontariat_eco",
    sections: [
      { section: "Le Projet", fields: [
        { key: "type_jardin", label: "Type de jardin", type: "select",
          options: ["Potager","Floral","Médicinal","Permaculture"] },
        { key: "superficie", label: "Superficie visée (m²)", type: "number" },
        { key: "phase_actuelle", label: "Phase actuelle", type: "select",
          options: ["Conception","Démarrage","Développement","Opérationnel"] },
      ]},
      { section: "Participation", fields: [
        { key: "competences_requises", label: "Compétences requises", type: "multiselect",
          options: ["Aucune","Jardinage","Construction","Gestion eau"] },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
        { key: "groupe_max", label: "Taille groupe maximum", type: "number" },
      ]},
    ],
  },

  sensibilisation_ecoles: {
    label: "Sensibilisation dans les écoles", category: "volontariat_eco",
    sections: [
      { section: "Programme", fields: [
        { key: "themes", label: "Thèmes d'intervention", type: "multiselect",
          options: ["Tri déchets","Eau","Biodiversité","Alimentation","Énergie"] },
        { key: "niveaux_scolaires", label: "Niveaux scolaires ciblés", type: "multiselect",
          options: ["Primaire","Collège","Lycée"] },
        { key: "format", label: "Format", type: "select",
          options: ["Atelier","Présentation","Sortie nature","Projet"] },
      ]},
      { section: "Organisation", fields: [
        { key: "duree_intervention", label: "Durée d'une intervention", type: "select",
          options: ["1h","2h","Demi-journée"] },
        { key: "langues", label: "Langues d'animation", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  // ── GUIDE & ACTIVITÉS ────────────────────────────────────────────────────────

  guide_randonnee: {
    label: "Guide de randonnée", category: "guide_activites",
    sections: [
      { section: "Spécialités & Zone", fields: [
        { key: "zones_couvertes", label: "Zones / massifs couverts", type: "textarea" },
        { key: "specialites", label: "Spécialités", type: "multiselect",
          options: ["Montagne","Désert","Côtier","Forêt","Nature","Historique"] },
        { key: "niveaux", label: "Niveaux accompagnés", type: "multiselect", options: NIVEAUX_3 },
      ]},
      { section: "Certifications & Langues", fields: [
        { key: "certifications", label: "Certifications obtenues", type: "text" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
        { key: "groupe_max", label: "Groupe maximum accompagné", type: "number" },
      ]},
    ],
  },

  centre_activites: {
    label: "Centre d'activités", category: "guide_activites",
    sections: [
      { section: "Activités proposées", fields: [
        { key: "activites", label: "Activités proposées", type: "multiselect",
          options: ["Randonnée","Kayak","VTT","Escalade","Tir à l'arc","Via ferrata","Teambuilding"] },
        { key: "publics", label: "Publics cibles", type: "multiselect",
          options: ["Familles","Enfants","Ados","Adultes","Groupes","Scolaires"] },
      ]},
      { section: "Équipement & Encadrement", fields: [
        { key: "equipement_disponible", label: "Équipement disponible sur place", type: "boolean" },
        { key: "encadrement_certifie", label: "Encadrement certifié", type: "boolean" },
        { key: "certification_encadrement", label: "Nom / organisme du diplôme", type: "text", dependsOn: { field: "encadrement_certifie", value: true } },
        { key: "certification_encadrement_url", label: "URL ou lien justificatif du certificat", type: "url", dependsOn: { field: "encadrement_certifie", value: true } },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  association_locale: {
    label: "Association locale", category: "guide_activites",
    sections: [
      { section: "Missions", fields: [
        { key: "domaines_action", label: "Domaines d'action", type: "multiselect",
          options: ["Environnement","Culture","Artisanat","Agriculture","Tourisme durable","Social"] },
        { key: "region_intervention", label: "Région d'intervention", type: "text" },
        { key: "nb_membres", label: "Nombre de membres actifs", type: "number" },
      ]},
      { section: "Partenariats & Langues", fields: [
        { key: "partenariats", label: "Partenariats existants", type: "textarea" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  agence_ecotourisme: {
    label: "Agence écotourisme", category: "guide_activites",
    sections: [
      { section: "Offre", fields: [
        { key: "types_circuits", label: "Types de circuits proposés", type: "multiselect",
          options: ["Trekking","Culturel","Agritourisme","Désert","Côtier","Ornithologie"] },
        { key: "destinations", label: "Destinations couvertes", type: "textarea" },
        { key: "durees_proposees", label: "Durées proposées", type: "multiselect",
          options: ["Week-end","3-4 jours","Semaine","Sur mesure"] },
      ]},
      { section: "Certifications & Équipe", fields: [
        { key: "certifications", label: "Certifications", type: "multiselect",
          options: ["GSTC","Travelife","Green Key","Label ONTT"] },
        { key: "nb_guides", label: "Nombre de guides disponibles", type: "number" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  // ── TRANSPORT ────────────────────────────────────────────────────────────────

  transporteur_local: {
    label: "Transporteur local", category: "transport",
    sections: [
      { section: "Flotte & Zones", fields: [
        { key: "types_vehicules", label: "Types de véhicules", type: "multiselect",
          options: ["Berline","Monospace","Minibus","4x4","Bus"] },
        { key: "nb_vehicules", label: "Nombre de véhicules", type: "number" },
        { key: "zones_couvertes", label: "Zones / trajets couverts", type: "textarea" },
      ]},
      { section: "Services", fields: [
        { key: "services", label: "Services proposés", type: "multiselect",
          options: ["Transfert aéroport","Circuit touristique","Excursion","Longue distance"] },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
      ]},
    ],
  },

  location_vehicule: {
    label: "Location véhicule", category: "transport",
    sections: [
      { section: "Flotte", fields: [
        { key: "types_vehicules", label: "Types de véhicules disponibles", type: "multiselect",
          options: ["Berline","4x4","Minibus","Scooter","Moto"] },
        { key: "nb_vehicules", label: "Nombre de véhicules", type: "number" },
        { key: "motorisations", label: "Motorisations disponibles", type: "multiselect",
          options: ["Essence","Diesel","Hybride","Électrique"] },
      ]},
      { section: "Conditions", fields: [
        { key: "durees_location", label: "Durées de location", type: "multiselect",
          options: ["Journée","Week-end","Semaine","Mensuel"] },
        { key: "permis_requis", label: "Permis requis", type: "select",
          options: ["Permis B","Permis moto","À partir de 25 ans"] },
        { key: "kilometrage", label: "Kilométrage", type: "select",
          options: ["Limité","Illimité"] },
      ]},
    ],
  },

  // ── ÉQUIPEMENT ───────────────────────────────────────────────────────────────

  location_materiel: {
    label: "Location matériel outdoor", category: "equipement",
    sections: [
      { section: "Matériel disponible", fields: [
        { key: "types_materiel", label: "Types de matériel", type: "multiselect",
          options: ["Tentes","Sacs de couchage","Sacs à dos","Chaussures","Vélos","Kayaks","Palmes","Masques","Cordes"] },
        { key: "nb_lots", label: "Nombre de lots disponibles", type: "number" },
        { key: "saison_ouverture", label: "Saison d'ouverture", type: "multiselect", options: SAISONS },
      ]},
      { section: "Service", fields: [
        { key: "durees_location", label: "Durées de location", type: "multiselect",
          options: ["Journée","Week-end","Semaine"] },
        { key: "livraison", label: "Livraison possible", type: "boolean" },
        { key: "zone_livraison", label: "Zone / rayon de livraison", type: "text",
          dependsOn: { field: "livraison", value: true } },
      ]},
    ],
  },

  centre_sport: {
    label: "Centre de sport", category: "equipement",
    sections: [
      { section: "Activités & Équipements", fields: [
        { key: "activites", label: "Activités / sports proposés", type: "multiselect",
          options: ["Musculation","Cardio","Boxe","Arts martiaux","Natation","Tennis","Padel"] },
        { key: "equipements", label: "Infrastructures disponibles", type: "multiselect",
          options: ["Salle de sport","Piscine","Courts de tennis","Terrain football","Piste course"] },
      ]},
      { section: "Services & Encadrement", fields: [
        { key: "coachs_disponibles", label: "Coachs / moniteurs disponibles", type: "boolean" },
        { key: "langues", label: "Langues parlées", type: "multiselect", options: LANGS },
        { key: "horaires", label: "Horaires d'ouverture", type: "text" },
      ]},
    ],
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getCategoryByValue(value: string): ProviderCategory | undefined {
  return PROVIDER_SCHEMA.find((c) => c.value === value)
}

export function getSubtypeByValue(categoryValue: string, subtypeValue: string): ProviderSubtype | undefined {
  return getCategoryByValue(categoryValue)?.subtypes.find((s) => s.value === subtypeValue)
}
