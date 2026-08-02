export interface TaxonomyNode {
  value: string;
  label: string;
  children?: TaxonomyNode[];
}

export type TaxonomyId = 'equipment_accommodation' | 'equipment_outdoor' | 'equipment_activity' | 'services_offre' | 'inclus';

const TAXONOMIES: Record<TaxonomyId, TaxonomyNode[]> = {
  equipment_accommodation: [
    {
      value: 'confort', label: 'Confort', children: [
        { value: 'clim', label: 'Climatisation' },
        { value: 'ventilateur', label: 'Ventilateur' },
        { value: 'chauffage', label: 'Chauffage' },
        { value: 'moustiquaire', label: 'Moustiquaire' },
        { value: 'insonorisation', label: 'Insonorisation' },
      ],
    },
    {
      value: 'sanitaires', label: 'Sanitaires', children: [
        { value: 'douche_privee', label: 'Douche privée' },
        { value: 'douche_exterieure', label: 'Douche extérieure (solaire)' },
        { value: 'wc_prives', label: 'WC privés' },
        { value: 'wc_communs', label: 'WC communs' },
        { value: 'eau_chaude', label: 'Eau chaude' },
        { value: 'seche_cheveux', label: 'Sèche-cheveux' },
      ],
    },
    {
      value: 'exterieur', label: 'Extérieur', children: [
        { value: 'terrasse', label: 'Terrasse' },
        { value: 'balcon', label: 'Balcon' },
        { value: 'jardin', label: 'Jardin' },
        { value: 'piscine', label: 'Piscine' },
        { value: 'parking', label: 'Parking' },
        { value: 'barbecue', label: 'Barbecue' },
      ],
    },
    {
      value: 'technologies', label: 'Technologies', children: [
        { value: 'wifi', label: 'WiFi' },
        { value: 'television', label: 'Télévision' },
        { value: 'prises_electriques', label: 'Prises électriques' },
        { value: 'chargeur_usb', label: 'Chargeurs USB' },
      ],
    },
    {
      value: 'cuisine', label: 'Cuisine', children: [
        { value: 'cuisine_equipee', label: 'Cuisine équipée' },
        { value: 'cuisinette', label: 'Cuisinette' },
        { value: 'refrigerateur', label: 'Réfrigérateur' },
        { value: 'micro_ondes', label: 'Micro-ondes' },
        { value: 'bouilloire', label: 'Bouilloire' },
      ],
    },
    {
      value: 'linge', label: 'Linge & Literie', children: [
        { value: 'linge_fourni', label: 'Linge de lit fourni' },
        { value: 'serviettes', label: 'Serviettes fournies' },
        { value: 'couverture_sup', label: 'Couverture supplémentaire' },
      ],
    },
  ],

  equipment_outdoor: [
    {
      value: 'camping', label: 'Camping', children: [
        { value: 'tente', label: 'Tente' },
        { value: 'sac_couchage', label: 'Sac de couchage' },
        { value: 'matelas', label: 'Matelas' },
        { value: 'rechaud', label: 'Réchaud' },
        { value: 'lampe_frontale', label: 'Lampe frontale' },
      ],
    },
    {
      value: 'randonnee', label: 'Randonnée', children: [
        { value: 'baton_marche', label: 'Bâtons de marche' },
        { value: 'gps', label: 'GPS' },
        { value: 'boussole', label: 'Boussole' },
        { value: 'sac_a_dos', label: 'Sac à dos' },
        { value: 'gourde', label: 'Gourde' },
      ],
    },
    {
      value: 'securite', label: 'Sécurité', children: [
        { value: 'trousse_secours', label: 'Trousse de secours' },
        { value: 'gilet_sauvetage', label: 'Gilet de sauvetage' },
        { value: 'kit_signalisation', label: 'Kit de signalisation' },
      ],
    },
  ],

  equipment_activity: [
    {
      value: 'nautique', label: 'Nautique', children: [
        { value: 'kayak', label: 'Kayak' },
        { value: 'canoe', label: 'Canoë' },
        { value: 'paddle', label: 'Paddle' },
        { value: 'combinaison', label: 'Combinaison' },
        { value: 'pagaie', label: 'Pagaie' },
      ],
    },
    {
      value: 'velo', label: 'Vélo', children: [
        { value: 'vtt', label: 'VTT' },
        { value: 'vae', label: 'VAE' },
        { value: 'velo_ville', label: 'Vélo ville' },
        { value: 'casque', label: 'Casque' },
        { value: 'kit_reparation', label: 'Kit réparation' },
      ],
    },
    {
      value: 'escalade', label: 'Escalade', children: [
        { value: 'baudrier', label: 'Baudrier' },
        { value: 'corde', label: 'Corde' },
        { value: 'mousquetons', label: 'Mousquetons' },
        { value: 'chaussons', label: "Chaussons d'escalade" },
        { value: 'magnesium', label: 'Magnésie' },
      ],
    },
    {
      value: 'sport_equip', label: 'Sport', children: [
        { value: 'casque_protection', label: 'Casque de protection' },
        { value: 'genouilleres', label: 'Genouillères' },
        { value: 'gants', label: 'Gants' },
      ],
    },
  ],

  services_offre: [
    {
      value: 'restauration', label: 'Restauration', children: [
        { value: 'petit_dej', label: 'Petit-déjeuner' },
        { value: 'demi_pension', label: 'Demi-pension' },
        { value: 'pension_complete', label: 'Pension complète' },
        { value: 'table_hotes', label: "Table d'hôtes" },
        { value: 'panier_repas', label: 'Panier repas' },
      ],
    },
    {
      value: 'transport_service', label: 'Transport', children: [
        { value: 'navette_aeroport', label: 'Navette aéroport' },
        { value: 'transfert_gare', label: 'Transfert gare' },
        { value: 'location_voiture', label: 'Location voiture' },
        { value: 'service_guide_transport', label: 'Guide transporté' },
      ],
    },
    {
      value: 'bien_etre', label: 'Bien-être', children: [
        { value: 'massage', label: 'Massage' },
        { value: 'spa', label: 'Spa' },
        { value: 'hammam', label: 'Hammam' },
        { value: 'yoga_sur_place', label: 'Yoga sur place' },
        { value: 'meditation_guidee', label: 'Méditation guidée' },
      ],
    },
    {
      value: 'activites_incluses', label: 'Activités incluses', children: [
        { value: 'randonnee_guidee', label: 'Randonnée guidée' },
        { value: 'visite_culturelle', label: 'Visite culturelle' },
        { value: 'degustation', label: 'Dégustation produits locaux' },
        { value: 'atelier_artisanat', label: "Atelier d'artisanat" },
        { value: 'cuisine_locale', label: 'Atelier cuisine locale' },
        { value: 'observation_oiseaux', label: "Observation d'oiseaux" },
      ],
    },
  ],

  inclus: [
    {
      value: 'inclus_hebergement', label: 'Hébergement', children: [
        { value: 'linge_inclus', label: 'Linge de lit' },
        { value: 'serviettes_inclus', label: 'Serviettes' },
        { value: 'petit_dej_inclus', label: 'Petit-déjeuner' },
        { value: 'menage_inclus', label: 'Ménage' },
        { value: 'wifi_inclus', label: 'WiFi' },
        { value: 'parking_inclus', label: 'Parking' },
      ],
    },
    {
      value: 'inclus_activite', label: 'Activité', children: [
        { value: 'guide_inclus', label: 'Guide' },
        { value: 'equipement_inclus', label: 'Équipement' },
        { value: 'assurance_inclus', label: 'Assurance' },
        { value: 'transport_inclus', label: 'Transport aller-retour' },
        { value: 'repas_inclus', label: 'Repas' },
        { value: 'boissons_inclus', label: 'Boissons' },
      ],
    },
    {
      value: 'inclus_supplement', label: 'Suppléments', children: [
        { value: 'photos_inclus', label: 'Photos souvenirs' },
        { value: 'certificat_inclus', label: 'Certificat de participation' },
        { value: 'goodies_inclus', label: 'Goodies' },
      ],
    },
  ],
};

export function getTaxonomy(id: TaxonomyId): TaxonomyNode[] {
  return TAXONOMIES[id] ?? [];
}

export function getAllLeafValues(nodes: TaxonomyNode[]): string[] {
  const values: string[] = [];
  for (const node of nodes) {
    if (node.children) {
      values.push(...getAllLeafValues(node.children));
    } else {
      values.push(node.value);
    }
  }
  return values;
}

export function findLeafLabel(nodes: TaxonomyNode[], value: string): string | null {
  for (const node of nodes) {
    if (!node.children && node.value === value) return node.label;
    if (node.children) {
      const found = findLeafLabel(node.children, value);
      if (found) return found;
    }
  }
  return null;
}
