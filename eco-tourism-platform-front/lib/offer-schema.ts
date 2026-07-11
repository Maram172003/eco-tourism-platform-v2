import { LANGS, REGIMES, NIVEAUX } from './shared-configs';

export interface CrossValidationRule {
  field: string;
  rule: 'lte' | 'gte' | 'in' | 'subset' | 'coherent' | 'requiredIfTrue' | 'requiredIfFalse';
  onboardingKey: string;
  message: string;
}

export interface SchemaField {
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'time' | 'file' | 'textarea' | 'hierarchy' | 'repeater';
  required?: boolean;
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  conditionalOn?: { field: string; value: string | boolean };
  min?: number;
  max?: number;
  unit?: string;
  taxonomy?: string;
  dynamicOptions?: { endpoint: string; labelField: string; valueField: string };
  repeaterConfig?: { addLabel: string; fields: string[]; minItems?: number; maxItems?: number };
}

export interface SchemaSection {
  id: string;
  label: string;
  fields: string[];
  conditionalOn?: { field: string; value: string | boolean };
}

export interface OfferTypeSchema {
  key: string;
  label: string;
  category: string;
  sections: SchemaSection[];
  fields: Record<string, SchemaField>;
  display?: {
    cardFields?: string[];
    filterable?: string[];
  };
}

export const OFFER_SCHEMAS: Record<string, OfferTypeSchema> = {

  // ───────── HÉBERGEMENT ─────────

  accommodation_room: {
    key: 'accommodation_room',
    label: 'Chambre',
    category: 'accommodation',
    sections: [
      { id: 'general', label: 'Informations', fields: ['surface_m2', 'vue', 'etage', 'bed_count'] },
      { id: 'bathroom', label: 'Salle de bain', fields: ['sdb_type', 'sdb_equipements'] },
      { id: 'capacity', label: 'Capacité', fields: ['nb_couchages', 'type_lit', 'pmr_chambre'] },
      { id: 'schedule', label: 'Horaires', fields: ['checkin_debut', 'checkin_fin', 'checkout', 'couvre_feu'] },
      { id: 'services', label: 'Services', fields: ['formule_restauration', 'equipements_chambre', 'inclus'] },
    ],
    fields: {
      surface_m2: { type: 'number', label: 'Surface (m²)', placeholder: '25', unit: 'm²' },
      vue: { type: 'select', label: 'Vue', options: [
        { value: 'jardin', label: 'Jardin' }, { value: 'piscine', label: 'Piscine' },
        { value: 'mer', label: 'Mer' }, { value: 'montagne', label: 'Montagne' },
        { value: 'ville', label: 'Ville' }, { value: 'aucune', label: 'Aucune' },
      ]},
      etage: { type: 'number', label: 'Étage', placeholder: 'Rez-de-chaussée' },
      bed_count: { type: 'number', required: true, label: 'Nombre de lits', min: 1 },
      nb_couchages: { type: 'number', required: true, label: 'Nombre de couchages', min: 1 },
      type_lit: { type: 'select', label: 'Type de lit', options: [
        { value: 'simple', label: 'Lit simple' }, { value: 'double', label: 'Lit double' },
        { value: 'king', label: 'Lit king size' }, { value: 'superpose', label: 'Lit superposé' },
        { value: 'canape', label: 'Canapé-lit' }, { value: 'mixte', label: 'Plusieurs types' },
      ]},
      sdb_type: { type: 'select', label: 'Type de salle de bain', options: [
        { value: 'prive', label: 'Privée' }, { value: 'partage', label: 'Partagée' },
        { value: 'commune', label: 'Salle commune' },
      ]},
      sdb_equipements: { type: 'multiselect', label: 'Équipements SdB', conditionalOn: { field: 'sdb_type', value: 'prive' }, options: [
        { value: 'douche', label: 'Douche' }, { value: 'baignoire', label: 'Baignoire' },
        { value: 'wc', label: 'WC' }, { value: 'lavabo', label: 'Lavabo' },
        { value: 'seche_cheveux', label: 'Sèche-cheveux' },
      ]},
      equipements_chambre: { type: 'hierarchy', label: 'Équipements chambre', taxonomy: 'equipment_accommodation' },
      formule_restauration: { type: 'select', label: 'Formule restauration', options: [
        { value: 'sans', label: 'Sans restauration' }, { value: 'petit_dej', label: 'Petit-déjeuner' },
        { value: 'demi_pension', label: 'Demi-pension' }, { value: 'pension_complete', label: 'Pension complète' },
      ]},
      inclus: { type: 'hierarchy', label: 'Inclus dans le prix', taxonomy: 'inclus' },
      checkin_debut: { type: 'time', required: true, label: 'Check-in à partir de' },
      checkin_fin: { type: 'time', label: 'Check-in jusqu\'à' },
      checkout: { type: 'time', required: true, label: 'Check-out avant' },
      couvre_feu: { type: 'time', label: 'Couvre-feu' },
      pmr_chambre: { type: 'boolean', label: 'Chambre accessible PMR' },
    },
    display: { cardFields: ['surface_m2', 'bed_count', 'vue'], filterable: ['vue', 'pmr_chambre', 'equipements_chambre'] },
  },

  accommodation_bed: {
    key: 'accommodation_bed',
    label: 'Lit (dortoir)',
    category: 'accommodation',
    sections: [
      { id: 'capacity', label: 'Capacité', fields: ['nb_lits_offre', 'type_lit', 'dortoir_genre'] },
      { id: 'schedule', label: 'Horaires', fields: ['checkin_debut', 'checkin_fin', 'checkout', 'couvre_feu', 'silence_partir_de'] },
      { id: 'services', label: 'Services', fields: ['inclus'] },
    ],
    fields: {
      nb_lits_offre: { type: 'number', required: true, label: 'Nombre de lits proposés', min: 1 },
      type_lit: { type: 'select', label: 'Type de lit', options: [
        { value: 'simple', label: 'Lit simple' }, { value: 'superpose', label: 'Lit superposé' },
      ]},
      dortoir_genre: { type: 'select', label: 'Genre du dortoir', options: [
        { value: 'mixte', label: 'Mixte' }, { value: 'hommes', label: 'Hommes' },
        { value: 'femmes', label: 'Femmes' },
      ]},
      checkin_debut: { type: 'time', required: true, label: 'Check-in à partir de' },
      checkin_fin: { type: 'time', label: 'Check-in jusqu\'à' },
      checkout: { type: 'time', required: true, label: 'Check-out avant' },
      couvre_feu: { type: 'time', label: 'Couvre-feu' },
      silence_partir_de: { type: 'time', label: 'Silence à partir de' },
      inclus: { type: 'hierarchy', label: 'Inclus dans le prix', taxonomy: 'inclus' },
    },
    display: { cardFields: ['nb_lits_offre', 'type_lit', 'dortoir_genre'], filterable: ['dortoir_genre'] },
  },

  accommodation_camping_space: {
    key: 'accommodation_camping_space',
    label: 'Espace tente',
    category: 'accommodation',
    sections: [
      { id: 'general', label: 'Informations', fields: ['type_tente_offre', 'surface_m2', 'capacite_offre'] },
      { id: 'comfort', label: 'Confort', fields: ['qualite_literie', 'electricite', 'prise_electrique_offre', 'linge_fourni'] },
      { id: 'bathroom', label: 'Sanitaires', fields: ['sanitaires_offre', 'distance_sanitaires_m'] },
      { id: 'schedule', label: 'Horaires', fields: ['checkin_debut', 'checkout'] },
      { id: 'services', label: 'Services', fields: ['experiences_incluses'] },
    ],
    fields: {
      type_tente_offre: { type: 'select', required: true, label: 'Type de tente', options: [
        { value: 'safari', label: 'Tente safari' }, { value: 'bell', label: 'Tente bell' },
        { value: 'yurt', label: 'Yourte' }, { value: 'chalet', label: 'Tente chalet' },
        { value: 'toile', label: 'Tente toile' }, { value: 'tipi', label: 'Tipi' },
        { value: 'autre', label: 'Autre' },
      ]},
      surface_m2: { type: 'number', label: 'Surface (m²)', placeholder: '12', unit: 'm²' },
      capacite_offre: { type: 'number', required: true, label: 'Capacité (personnes)', min: 1, max: 10 },
      qualite_literie: { type: 'select', label: 'Qualité de la literie', options: [
        { value: 'standard', label: 'Standard' }, { value: 'confort', label: 'Confort' },
        { value: 'premium', label: 'Premium' },
      ]},
      electricite: { type: 'boolean', label: 'Électricité disponible' },
      prise_electrique_offre: { type: 'boolean', label: 'Prise électrique dans la tente', conditionalOn: { field: 'electricite', value: true } },
      linge_fourni: { type: 'boolean', label: 'Linge de lit fourni' },
      sanitaires_offre: { type: 'select', label: 'Sanitaires', options: [
        { value: 'prives', label: 'Privés' }, { value: 'partages', label: 'Partagés' },
        { value: 'communs', label: 'Communs (bloc)' },
      ]},
      distance_sanitaires_m: { type: 'number', label: 'Distance sanitaires (m)', unit: 'm', conditionalOn: { field: 'sanitaires_offre', value: 'partages' } },
      checkin_debut: { type: 'time', required: true, label: 'Check-in à partir de' },
      checkout: { type: 'time', required: true, label: 'Check-out avant' },
      experiences_incluses: { type: 'multiselect', label: 'Expériences incluses', options: [
        { value: 'feu_camp', label: 'Feu de camp' }, { value: 'petit_dej', label: 'Petit-déjeuner' },
        { value: 'etoiles', label: 'Observation étoiles' }, { value: 'randonnee', label: 'Randonnée' },
      ]},
    },
    display: { cardFields: ['type_tente_offre', 'capacite_offre', 'surface_m2'], filterable: ['type_tente_offre', 'sanitaires_offre', 'electricite'] },
  },

  accommodation_suite: {
    key: 'accommodation_suite',
    label: 'Suite',
    category: 'accommodation',
    sections: [
      { id: 'general', label: 'Informations', fields: ['surface_m2', 'vue', 'nb_pieces'] },
      { id: 'spaces', label: 'Espaces', fields: ['espaces_suite', 'privatisation_offre'] },
      { id: 'bathroom', label: 'Salle de bain', fields: ['sdb_type', 'sdb_equipements'] },
      { id: 'services', label: 'Services', fields: ['services_offre', 'inclus'] },
      { id: 'schedule', label: 'Horaires', fields: ['checkin_debut', 'checkout'] },
    ],
    fields: {
      surface_m2: { type: 'number', label: 'Surface (m²)', unit: 'm²' },
      vue: { type: 'select', label: 'Vue', options: [
        { value: 'jardin', label: 'Jardin' }, { value: 'piscine', label: 'Piscine' },
        { value: 'mer', label: 'Mer' }, { value: 'montagne', label: 'Montagne' },
      ]},
      nb_pieces: { type: 'number', label: 'Nombre de pièces', min: 1 },
      espaces_suite: { type: 'multiselect', label: 'Espaces distincts', options: [
        { value: 'salon', label: 'Salon' }, { value: 'coin_the', label: "Coin thé" },
        { value: 'terrasse', label: 'Terrasse privative' }, { value: 'jardin_prive', label: 'Jardin privé' },
        { value: 'balcon', label: 'Balcon' }, { value: 'cuisinette', label: 'Cuisinette' },
      ]},
      privatisation_offre: { type: 'boolean', label: 'Privatisation possible' },
      sdb_type: { type: 'select', label: 'Type de salle de bain', options: [
        { value: 'prive', label: 'Privée' }, { value: 'partage', label: 'Partagée' },
      ]},
      sdb_equipements: { type: 'multiselect', label: 'Équipements SdB', conditionalOn: { field: 'sdb_type', value: 'prive' }, options: [
        { value: 'douche', label: 'Douche' }, { value: 'baignoire', label: 'Baignoire' },
        { value: 'wc', label: 'WC' }, { value: 'double_lavabo', label: 'Double lavabo' },
        { value: 'seche_cheveux', label: 'Sèche-cheveux' },
      ]},
      services_offre: { type: 'hierarchy', label: 'Services premium', taxonomy: 'services_offre' },
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'linge', label: 'Linge de lit' }, { value: 'serviettes', label: 'Serviettes' },
        { value: 'petit_dej', label: 'Petit-déjeuner' }, { value: 'parking', label: 'Parking' },
        { value: 'wifi', label: 'WiFi' },
      ]},
      checkin_debut: { type: 'time', required: true, label: 'Check-in à partir de' },
      checkout: { type: 'time', required: true, label: 'Check-out avant' },
    },
    display: { cardFields: ['surface_m2', 'nb_pieces', 'vue'], filterable: ['vue', 'privatisation_offre', 'services_offre'] },
  },

  accommodation_bungalow: {
    key: 'accommodation_bungalow',
    label: 'Bungalow',
    category: 'accommodation',
    sections: [
      { id: 'general', label: 'Informations', fields: ['surface_m2', 'vue', 'capacite_offre', 'configuration_lits'] },
      { id: 'bathroom', label: 'Salle de bain', fields: ['sdb_type', 'equipements_offre'] },
      { id: 'options', label: 'Options', fields: ['animaux_offre', 'inclus'] },
      { id: 'schedule', label: 'Horaires', fields: ['checkin_debut', 'checkout'] },
    ],
    fields: {
      surface_m2: { type: 'number', label: 'Surface (m²)', unit: 'm²' },
      vue: { type: 'select', label: 'Vue', options: [
        { value: 'jardin', label: 'Jardin' }, { value: 'mer', label: 'Mer' },
        { value: 'montagne', label: 'Montagne' }, { value: 'piscine', label: 'Piscine' },
        { value: 'nature', label: 'Nature' },
      ]},
      capacite_offre: { type: 'number', required: true, label: 'Capacité (personnes)', min: 1, max: 10 },
      configuration_lits: { type: 'select', label: 'Configuration des lits', options: [
        { value: '1_double', label: '1 lit double' }, { value: '2_simples', label: '2 lits simples' },
        { value: 'double_superpose', label: 'Lit double + superposé' },
        { value: 'familiale', label: 'Familiale (plusieurs lits)' },
      ]},
      sdb_type: { type: 'select', label: 'Salle de bain', options: [
        { value: 'prive', label: 'Privée' }, { value: 'partage', label: 'Partagée' },
        { value: 'exterieure', label: 'Extérieure (douche solaire)' },
      ]},
      equipements_offre: { type: 'hierarchy', label: 'Équipements', taxonomy: 'equipment_accommodation' },
      animaux_offre: { type: 'boolean', label: 'Animaux acceptés' },
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'linge', label: 'Linge de lit' }, { value: 'serviettes', label: 'Serviettes' },
        { value: 'petit_dej', label: 'Petit-déjeuner' }, { value: 'parking', label: 'Parking' },
      ]},
      checkin_debut: { type: 'time', required: true, label: 'Check-in à partir de' },
      checkout: { type: 'time', required: true, label: 'Check-out avant' },
    },
    display: { cardFields: ['capacite_offre', 'surface_m2', 'vue'], filterable: ['sdb_type', 'animaux_offre', 'equipements_offre'] },
  },

  accommodation_ecolodge: {
    key: 'accommodation_ecolodge',
    label: 'Éco-lodge',
    category: 'accommodation',
    sections: [
      { id: 'general', label: "L'unité", fields: ['type_unite', 'surface_m2', 'capacite_offre', 'description_unique'] },
      { id: 'eco', label: 'Éco-construction', fields: ['materiaux', 'source_energie', 'certifications'] },
      { id: 'equipment', label: 'Équipements', fields: ['eco_equipements', 'experiences_eco'] },
      { id: 'restauration', label: 'Restauration', fields: ['restauration_offre'] },
      { id: 'schedule', label: 'Horaires', fields: ['checkin_debut', 'checkout'] },
    ],
    fields: {
      type_unite: { type: 'select', label: "Type d'unité", options: [
        { value: 'cabane', label: 'Cabane' }, { value: 'bungalow', label: 'Bungalow' },
        { value: 'suite', label: 'Suite' }, { value: 'tente', label: 'Tente lodge' },
        { value: 'dome', label: 'Dôme' }, { value: 'yourte', label: 'Yourte' },
      ]},
      surface_m2: { type: 'number', label: 'Surface (m²)', unit: 'm²' },
      capacite_offre: { type: 'number', required: true, label: 'Capacité (personnes)', min: 1, max: 10 },
      description_unique: { type: 'textarea', label: 'Ce qui rend unique' },
      materiaux: { type: 'multiselect', label: 'Matériaux de construction', options: [
        { value: 'bois_local', label: 'Bois local' }, { value: 'pierre', label: 'Pierre' },
        { value: 'terre', label: 'Terre / Pisé' }, { value: 'paille', label: 'Paille' },
        { value: 'brique', label: 'Brique de terre cuite' }, { value: 'recuperation', label: 'Matériaux de récupération' },
        { value: 'toit_vegetal', label: 'Toit végétal' },
      ]},
      source_energie: { type: 'multiselect', label: "Source d'énergie", options: [
        { value: 'solaire', label: 'Solaire' }, { value: 'eolien', label: 'Éolien' },
        { value: 'reseau', label: 'Réseau électrique' }, { value: 'gaz', label: 'Gaz' },
      ]},
      certifications: { type: 'multiselect', label: 'Certifications éco', options: [
        { value: 'ecolabel', label: 'Ecolabel' }, { value: 'green_key', label: 'Green Key' },
        { value: 'biosphere', label: 'Biosphere' }, { value: 'local', label: 'Label local' },
      ]},
      eco_equipements: { type: 'hierarchy', label: 'Éco-équipements', taxonomy: 'equipment_accommodation' },
      experiences_eco: { type: 'multiselect', label: 'Expériences éco incluses', options: [
        { value: 'visite_ferme', label: 'Visite de la ferme' }, { value: 'atelier_bio', label: 'Atelier bio' },
        { value: 'randonnee', label: 'Randonnée nature' }, { value: 'degustation', label: 'Dégustation produits locaux' },
        { value: 'observation', label: 'Observation faune' },
      ]},
      restauration_offre: { type: 'select', label: 'Formule restauration', options: [
        { value: 'sans', label: 'Sans restauration' }, { value: 'petit_dej', label: 'Petit-déjeuner' },
        { value: 'demi_pension', label: 'Demi-pension' }, { value: 'pension', label: 'Pension complète' },
        { value: 'table_hotes', label: 'Table d\'hôtes' },
      ]},
      checkin_debut: { type: 'time', required: true, label: 'Check-in à partir de' },
      checkout: { type: 'time', required: true, label: 'Check-out avant' },
    },
    display: { cardFields: ['type_unite', 'capacite_offre', 'surface_m2'], filterable: ['type_unite', 'materiaux', 'certifications', 'restauration_offre'] },
  },

  // ───────── ACTIVITÉS ─────────

  activity_randonnee: {
    key: 'activity_randonnee',
    label: 'Randonnée',
    category: 'activity',
    sections: [
      { id: 'course', label: 'Parcours', fields: ['distance_km', 'denivele_m', 'altitude_max', 'duree_estimee', 'type_parcours', 'point_depart', 'point_arrivee', 'fichier_gpx'] },
      { id: 'level', label: 'Niveau & Groupe', fields: ['niveau_offre', 'nb_participants_min', 'nb_participants_max'] },
      { id: 'guide', label: 'Encadrement', fields: ['encadrement_guide', 'langues_guides'] },
      { id: 'inclus', label: 'Inclus & Conditions', fields: ['inclus', 'equipement_obligatoire', 'points_interet'] },
    ],
    fields: {
      distance_km: { type: 'number', required: true, label: 'Distance (km)', unit: 'km', min: 0 },
      denivele_m: { type: 'number', label: 'Dénivelé positif (m)', unit: 'm' },
      altitude_max: { type: 'number', label: 'Altitude maximale (m)', unit: 'm' },
      duree_estimee: { type: 'text', required: true, label: 'Durée estimée', placeholder: '4h / 1 journée' },
      type_parcours: { type: 'select', label: 'Type de parcours', options: [
        { value: 'boucle', label: 'Boucle' }, { value: 'aller_retour', label: 'Aller-retour' },
        { value: 'traversee', label: 'Traversée' },
      ]},
      point_depart: { type: 'text', required: true, label: 'Point de départ' },
      point_arrivee: { type: 'text', label: "Point d'arrivée" },
      fichier_gpx: { type: 'file', label: 'Tracé GPX' },
      niveau_offre: { type: 'select', required: true, label: 'Niveau', options: [
        { value: 'facile', label: 'Facile' }, { value: 'moyen', label: 'Moyen' },
        { value: 'difficile', label: 'Difficile' }, { value: 'tres_difficile', label: 'Très difficile' },
      ]},
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
      encadrement_guide: { type: 'boolean', label: 'Encadrement par un guide' },
      langues_guides: { type: 'multiselect', label: "Langues du guide", conditionalOn: { field: 'encadrement_guide', value: true }, options: LANGS },
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'guide', label: 'Guide' }, { value: 'repas', label: 'Repas' },
        { value: 'transport', label: 'Transport aller-retour' }, { value: 'assurance', label: 'Assurance' },
        { value: 'baton_marche', label: 'Bâtons de marche' },
      ]},
      equipement_obligatoire: { type: 'textarea', label: 'Équipement obligatoire' },
      points_interet: { type: 'textarea', label: "Points d'intérêt" },
    },
    display: { cardFields: ['distance_km', 'denivele_m', 'duree_estimee', 'niveau_offre'], filterable: ['niveau_offre', 'encadrement_guide', 'distance_km'] },
  },

  activity_kayak: {
    key: 'activity_kayak',
    label: 'Kayak',
    category: 'activity',
    sections: [
      { id: 'course', label: 'Parcours', fields: ['parcours', 'distance_km', 'duree'] },
      { id: 'embarcation', label: 'Embarcation', fields: ['type_embarcation_offre', 'nb_embarcations_offre'] },
      { id: 'level', label: 'Niveau & Sécurité', fields: ['niveau_offre', 'savoir_nager', 'age_minimum', 'nb_participants_min', 'nb_participants_max'] },
      { id: 'equipment', label: 'Équipement', fields: ['equipement_fourni', 'inclus'] },
    ],
    fields: {
      parcours: { type: 'text', required: true, label: 'Parcours / itinéraire' },
      distance_km: { type: 'number', label: 'Distance (km)', unit: 'km' },
      duree: { type: 'text', required: true, label: 'Durée', placeholder: '2h / demi-journée' },
      type_embarcation_offre: { type: 'select', required: true, label: "Type d'embarcation", options: [
        { value: 'kayak_simple', label: 'Kayak simple' }, { value: 'kayak_double', label: 'Kayak double' },
        { value: 'canoe', label: 'Canoë' }, { value: 'paddle', label: 'Paddle' },
      ]},
      nb_embarcations_offre: { type: 'number', required: true, label: "Nombre d'embarcations", min: 1 },
      niveau_offre: { type: 'select', required: true, label: 'Niveau requis', options: [
        { value: 'debutant', label: 'Débutant' }, { value: 'intermediaire', label: 'Intermédiaire' },
        { value: 'confirme', label: 'Confirmé' },
      ]},
      savoir_nager: { type: 'boolean', label: 'Savoir nager obligatoire' },
      age_minimum: { type: 'number', label: 'Âge minimum', min: 0 },
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
      equipement_fourni: { type: 'multiselect', label: 'Équipement fourni', options: [
        { value: 'gilet', label: 'Gilet de sauvetage' }, { value: 'pagaie', label: 'Pagaie' },
        { value: 'combinaison', label: 'Combinaison' }, { value: 'sac_etanche', label: 'Sac étanche' },
      ]},
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'guide', label: 'Guide' }, { value: 'initiation', label: 'Initiation' },
        { value: 'assurance', label: 'Assurance' },
      ]},
    },
    display: { cardFields: ['type_embarcation_offre', 'distance_km', 'duree', 'niveau_offre'], filterable: ['niveau_offre', 'type_embarcation_offre', 'savoir_nager'] },
  },

  activity_vtt: {
    key: 'activity_vtt',
    label: 'VTT',
    category: 'activity',
    sections: [
      { id: 'course', label: 'Parcours', fields: ['distance_km', 'denivele_m', 'duree', 'type_terrain'] },
      { id: 'bike', label: 'Vélo', fields: ['type_velo_offre', 'nb_velos_offre', 'equipement_fourni'] },
      { id: 'level', label: 'Niveau & Groupe', fields: ['niveau_offre', 'nb_participants_min', 'nb_participants_max'] },
      { id: 'inclus', label: 'Inclus', fields: ['points_interet', 'inclus'] },
    ],
    fields: {
      distance_km: { type: 'number', label: 'Distance (km)', unit: 'km' },
      denivele_m: { type: 'number', label: 'Dénivelé (m)', unit: 'm' },
      duree: { type: 'text', required: true, label: 'Durée' },
      type_terrain: { type: 'select', label: 'Type de terrain', options: [
        { value: 'montagne', label: 'Montagne' }, { value: 'foret', label: 'Forêt' },
        { value: 'desert', label: 'Désert' }, { value: 'route', label: 'Route' },
        { value: 'mixte', label: 'Mixte' },
      ]},
      type_velo_offre: { type: 'select', required: true, label: 'Type de vélo', options: [
        { value: 'vtt', label: 'VTT' }, { value: 'vae', label: 'VAE' },
        { value: 'gravel', label: 'Gravel' }, { value: 'ville', label: 'Vélo ville' },
      ]},
      nb_velos_offre: { type: 'number', required: true, label: 'Nombre de vélos', min: 1 },
      equipement_fourni: { type: 'multiselect', label: 'Équipement fourni', options: [
        { value: 'casque', label: 'Casque' }, { value: 'gants', label: 'Gants' },
        { value: 'kit_reparation', label: 'Kit réparation' }, { value: 'sacoche', label: 'Sacoche' },
      ]},
      niveau_offre: { type: 'select', required: true, label: 'Niveau', options: [
        { value: 'facile', label: 'Facile' }, { value: 'moyen', label: 'Moyen' },
        { value: 'difficile', label: 'Difficile' },
      ]},
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
      points_interet: { type: 'textarea', label: "Points d'intérêt" },
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'guide', label: 'Guide' }, { value: 'casque', label: 'Casque' },
        { value: 'assurance', label: 'Assurance' },
      ]},
    },
    display: { cardFields: ['type_velo_offre', 'distance_km', 'duree', 'niveau_offre'], filterable: ['niveau_offre', 'type_velo_offre', 'type_terrain'] },
  },

  activity_yoga: {
    key: 'activity_yoga',
    label: 'Yoga',
    category: 'activity',
    sections: [
      { id: 'general', label: 'Séance', fields: ['style_offre', 'cadre_offre', 'niveau_offre', 'duree_seance'] },
      { id: 'equipment', label: 'Équipement', fields: ['tapis_fourni', 'accessoires'] },
      { id: 'group', label: 'Groupe', fields: ['nb_participants_min', 'nb_participants_max'] },
    ],
    fields: {
      style_offre: { type: 'select', required: true, label: 'Style de yoga', options: [
        { value: 'hatha', label: 'Hatha' }, { value: 'vinyasa', label: 'Vinyasa' },
        { value: 'ashtanga', label: 'Ashtanga' }, { value: 'yin', label: 'Yin' },
        { value: 'nidra', label: 'Yoga Nidra' }, { value: 'prénatal', label: 'Prénatal' },
      ]},
      cadre_offre: { type: 'select', label: 'Cadre', options: [
        { value: 'interieur', label: 'Intérieur' }, { value: 'exterieur', label: 'Extérieur' },
        { value: 'plage', label: 'Plage' }, { value: 'terrasse', label: 'Terrasse' },
      ]},
      niveau_offre: { type: 'select', label: 'Niveau', options: [
        { value: 'debutant', label: 'Débutant' }, { value: 'intermediaire', label: 'Intermédiaire' },
        { value: 'avance', label: 'Avancé' }, { value: 'tous', label: 'Tous niveaux' },
      ]},
      duree_seance: { type: 'text', required: true, label: 'Durée par séance', placeholder: '1h / 1h30' },
      tapis_fourni: { type: 'boolean', label: 'Tapis fourni' },
      accessoires: { type: 'multiselect', label: 'Accessoires fournis', options: [
        { value: 'bloc', label: 'Blocs' }, { value: 'sangle', label: 'Sangles' },
        { value: 'coussin', label: 'Coussin' }, { value: 'couverture', label: 'Couverture' },
      ]},
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
    },
    display: { cardFields: ['style_offre', 'cadre_offre', 'duree_seance', 'niveau_offre'], filterable: ['style_offre', 'niveau_offre', 'cadre_offre'] },
  },

  activity_escalade: {
    key: 'activity_escalade',
    label: 'Escalade',
    category: 'activity',
    sections: [
      { id: 'site', label: "Site d'escalade", fields: ['nom_site', 'type_site', 'hauteur_max', 'nb_voies', 'cotation_max'] },
      { id: 'level', label: 'Niveau & Sécurité', fields: ['niveau_offre', 'encadrement_guide', 'age_minimum', 'nb_participants_max'] },
      { id: 'equipment', label: 'Équipement', fields: ['equipement_fourni', 'inclus'] },
    ],
    fields: {
      nom_site: { type: 'text', required: true, label: "Nom du site d'escalade" },
      type_site: { type: 'select', required: true, label: "Type de site", options: [
        { value: 'falaise', label: 'Falaise naturelle' }, { value: 'bloc', label: 'Bloc' },
        { value: 'via_ferrata', label: 'Via ferrata' }, { value: 'mur', label: "Mur d'escalade" },
        { value: 'deep_water', label: 'Deep water solo' },
      ]},
      hauteur_max: { type: 'number', label: 'Hauteur maximale (m)', unit: 'm' },
      nb_voies: { type: 'number', label: 'Nombre de voies', min: 1 },
      cotation_max: { type: 'text', label: 'Cotation maximale' },
      niveau_offre: { type: 'select', required: true, label: 'Niveau requis', options: [
        { value: 'initiation', label: 'Initiation' }, { value: 'debutant', label: 'Débutant' },
        { value: 'intermediaire', label: 'Intermédiaire' }, { value: 'confirme', label: 'Confirmé' },
        { value: 'expert', label: 'Expert' },
      ]},
      encadrement_guide: { type: 'boolean', label: 'Encadrement par moniteur' },
      age_minimum: { type: 'number', label: 'Âge minimum', min: 0 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
      equipement_fourni: { type: 'multiselect', label: 'Équipement fourni', options: [
        { value: 'baudrier', label: 'Baudrier' }, { value: 'corde', label: 'Cordes' },
        { value: 'casque', label: 'Casque' }, { value: 'mousquetons', label: 'Mousquetons' },
        { value: 'chaussons', label: "Chaussons d'escalade" }, { value: 'magnesium', label: 'Magnésie' },
      ]},
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'moniteur', label: 'Moniteur diplômé' }, { value: 'assurance', label: 'Assurance' },
        { value: 'transport', label: 'Transport' },
      ]},
    },
    display: { cardFields: ['nom_site', 'type_site', 'hauteur_max', 'niveau_offre'], filterable: ['niveau_offre', 'type_site', 'encadrement_guide'] },
  },

  activity_equitation: {
    key: 'activity_equitation',
    label: 'Équitation',
    category: 'activity',
    sections: [
      { id: 'ride', label: 'Balade', fields: ['type_balade', 'duree', 'distance_km', 'type_terrain'] },
      { id: 'horse', label: 'Monture', fields: ['type_monture', 'poids_max'] },
      { id: 'level', label: 'Niveau & Sécurité', fields: ['niveau_offre', 'encadrement_guide', 'age_minimum', 'nb_participants_max'] },
      { id: 'equipment', label: 'Équipement', fields: ['equipement_fourni', 'inclus'] },
    ],
    fields: {
      type_balade: { type: 'select', required: true, label: "Type de balade", options: [
        { value: 'promenade', label: 'Promenade' }, { value: 'randonnee', label: 'Randonnée' },
        { value: 'trek', label: 'Trek équestre' }, { value: 'initiation', label: "Séance d'initiation" },
        { value: 'voltige', label: 'Voltige' },
      ]},
      duree: { type: 'text', required: true, label: 'Durée' },
      distance_km: { type: 'number', label: 'Distance (km)', unit: 'km' },
      type_terrain: { type: 'select', label: 'Terrain', options: [
        { value: 'plage', label: 'Plage' }, { value: 'foret', label: 'Forêt' },
        { value: 'montagne', label: 'Montagne' }, { value: 'desert', label: 'Désert' },
        { value: 'manege', label: 'Manège' },
      ]},
      type_monture: { type: 'select', label: "Type de monture", options: [
        { value: 'cheval', label: 'Cheval' }, { value: 'poney', label: 'Poney' },
        { value: 'dromadaire', label: 'Dromadaire' }, { value: 'ane', label: 'Âne' },
      ]},
      poids_max: { type: 'number', label: 'Poids max cavalier (kg)', unit: 'kg' },
      niveau_offre: { type: 'select', required: true, label: 'Niveau requis', options: [
        { value: 'debutant', label: 'Débutant' }, { value: 'intermediaire', label: 'Intermédiaire' },
        { value: 'confirme', label: 'Confirmé' },
      ]},
      encadrement_guide: { type: 'boolean', label: 'Encadrement par un guide' },
      age_minimum: { type: 'number', label: 'Âge minimum', min: 0 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
      equipement_fourni: { type: 'multiselect', label: 'Équipement fourni', options: [
        { value: 'casque', label: 'Casque' }, { value: 'bombe', label: "Bombe d'équitation" },
        { value: 'bottes', label: 'Bottes' }, { value: 'gilet', label: 'Gilet de protection' },
      ]},
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'guide', label: 'Guide équestre' }, { value: 'assurance', label: 'Assurance' },
        { value: 'initiation', label: "Séance d'initiation" },
      ]},
    },
    display: { cardFields: ['type_balade', 'duree', 'niveau_offre', 'type_monture'], filterable: ['niveau_offre', 'type_balade', 'type_terrain', 'type_monture'] },
  },

  activity_observation: {
    key: 'activity_observation',
    label: 'Observation',
    category: 'activity',
    sections: [
      { id: 'type', label: "Type d'observation", fields: ['type_observation', 'saison_ideale', 'duree', 'meilleurs_horaires'] },
      { id: 'level', label: 'Groupe', fields: ['nb_participants_min', 'nb_participants_max'] },
      { id: 'guide', label: 'Guide', fields: ['encadrement_guide', 'inclus'] },
    ],
    fields: {
      type_observation: { type: 'select', required: true, label: "Type d'observation", options: [
        { value: 'faune', label: 'Faune sauvage' }, { value: 'flore', label: 'Flore' },
        { value: 'oiseaux', label: 'Observation ornithologique' }, { value: 'etoiles', label: 'Astronomie' },
        { value: 'paysages', label: 'Paysages' },
      ]},
      saison_ideale: { type: 'text', label: 'Saison idéale', placeholder: 'Printemps / Automne' },
      duree: { type: 'text', required: true, label: 'Durée' },
      meilleurs_horaires: { type: 'text', label: 'Meilleurs horaires', placeholder: 'Aube / Crépuscule' },
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
      encadrement_guide: { type: 'boolean', label: 'Guide naturaliste' },
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'guide', label: 'Guide naturaliste' }, { value: 'jumelles', label: 'Jumelles' },
        { value: 'longue_vue', label: 'Longue-vue' }, { value: 'transport', label: 'Transport' },
      ]},
    },
    display: { cardFields: ['type_observation', 'duree', 'saison_ideale'], filterable: ['type_observation', 'encadrement_guide'] },
  },

  activity_meditation: {
    key: 'activity_meditation',
    label: 'Méditation',
    category: 'activity',
    sections: [
      { id: 'session', label: 'Session', fields: ['type_meditation', 'cadre_offre', 'duree_seance', 'niveau_offre'] },
      { id: 'group', label: 'Groupe', fields: ['nb_participants_max'] },
      { id: 'equipment', label: 'Équipement', fields: ['accessoires'] },
    ],
    fields: {
      type_meditation: { type: 'select', required: true, label: 'Type de méditation', options: [
        { value: 'pleine_conscience', label: 'Pleine conscience' }, { value: 'guidee', label: 'Guidée' },
        { value: 'transcendantale', label: 'Transcendantale' }, { value: 'zen', label: 'Zen (Zazen)' },
        { value: 'vipassana', label: 'Vipassana' }, { value: 'marche', label: 'Marche méditative' },
      ]},
      cadre_offre: { type: 'select', label: 'Cadre', options: [
        { value: 'interieur', label: 'Intérieur' }, { value: 'exterieur', label: 'Extérieur' },
        { value: 'jardin', label: 'Jardin' }, { value: 'plage', label: 'Plage' },
        { value: 'foret', label: 'Forêt' },
      ]},
      duree_seance: { type: 'text', required: true, label: 'Durée par séance' },
      niveau_offre: { type: 'select', label: 'Niveau', options: [
        { value: 'debutant', label: 'Débutant' }, { value: 'intermediaire', label: 'Intermédiaire' },
        { value: 'avance', label: 'Avancé' }, { value: 'tous', label: 'Tous niveaux' },
      ]},
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
      accessoires: { type: 'multiselect', label: 'Accessoires fournis', options: [
        { value: 'coussin', label: 'Coussin de méditation' }, { value: 'tapis', label: 'Tapis' },
        { value: 'couverture', label: 'Couverture' }, { value: 'bol_tibetain', label: 'Bol tibétain' },
      ]},
    },
    display: { cardFields: ['type_meditation', 'cadre_offre', 'duree_seance', 'niveau_offre'], filterable: ['type_meditation', 'niveau_offre', 'cadre_offre'] },
  },

  activity_photographie: {
    key: 'activity_photographie',
    label: 'Photographie',
    category: 'activity',
    sections: [
      { id: 'type', label: "Type d'atelier", fields: ['type_photo', 'niveau_offre', 'duree'] },
      { id: 'theme', label: 'Thème', fields: ['theme_photo', 'points_interet'] },
      { id: 'group', label: 'Groupe', fields: ['nb_participants_min', 'nb_participants_max'] },
      { id: 'equipment', label: 'Équipement', fields: ['materiel_fourni', 'inclus'] },
    ],
    fields: {
      type_photo: { type: 'select', required: true, label: "Type d'atelier", options: [
        { value: 'initiation', label: "Initiation photographie" }, { value: 'balade', label: 'Balade photo' },
        { value: 'stage', label: 'Stage' }, { value: 'night', label: 'Photo nocturne' },
        { value: 'macro', label: 'Macro' }, { value: 'paysage', label: 'Paysage' },
        { value: 'faune', label: 'Photo animalière' },
      ]},
      niveau_offre: { type: 'select', label: 'Niveau requis', options: [
        { value: 'debutant', label: 'Débutant' }, { value: 'intermediaire', label: 'Intermédiaire' },
        { value: 'avance', label: 'Avancé' }, { value: 'tous', label: 'Tous niveaux' },
      ]},
      duree: { type: 'text', required: true, label: 'Durée' },
      theme_photo: { type: 'multiselect', label: 'Thèmes abordés', options: [
        { value: 'nature', label: 'Nature' }, { value: 'faune', label: 'Faune' },
        { value: 'portrait', label: 'Portrait' }, { value: 'paysage', label: 'Paysage' },
        { value: 'architecture', label: 'Architecture' }, { value: 'macro', label: 'Macro' },
        { value: 'nocturne', label: 'Nocturne' }, { value: 'street', label: 'Street photo' },
      ]},
      points_interet: { type: 'textarea', label: "Points d'intérêt / lieux" },
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
      materiel_fourni: { type: 'multiselect', label: 'Matériel fourni', options: [
        { value: 'boitier', label: 'Boîtier reflex/miroir' }, { value: 'objectif', label: 'Objectifs' },
        { value: 'trepied', label: 'Trépied' }, { value: 'filtres', label: 'Filtres' },
      ]},
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'guide', label: 'Guide photographe' }, { value: 'edition', label: 'Post-traitement' },
        { value: 'impression', label: "Tirage d'une photo" },
      ]},
    },
    display: { cardFields: ['type_photo', 'duree', 'niveau_offre', 'theme_photo'], filterable: ['niveau_offre', 'type_photo', 'theme_photo'] },
  },

  activity_guided_tour: {
    key: 'activity_guided_tour',
    label: 'Visite guidée',
    category: 'activity',
    sections: [
      { id: 'tour', label: 'Visite', fields: ['type_visite', 'duree', 'distance_marche', 'themes_visite'] },
      { id: 'guide', label: 'Guide', fields: ['langues_guides', 'nb_participants_max'] },
      { id: 'inclus', label: 'Inclus', fields: ['points_interet', 'inclus'] },
    ],
    fields: {
      type_visite: { type: 'select', required: true, label: 'Type de visite', options: [
        { value: 'historique', label: 'Historique' }, { value: 'culturelle', label: 'Culturelle' },
        { value: 'nature', label: 'Nature' }, { value: 'gastronomique', label: 'Gastronomique' },
        { value: 'nocturne', label: 'Nocturne' }, { value: 'thematique', label: 'Thématique' },
      ]},
      duree: { type: 'text', required: true, label: 'Durée' },
      distance_marche: { type: 'number', label: 'Distance à pied (km)', unit: 'km' },
      themes_visite: { type: 'multiselect', label: "Thèmes de la visite", options: [
        { value: 'patrimoine', label: 'Patrimoine' }, { value: 'architecture', label: 'Architecture' },
        { value: 'artisanat', label: 'Artisanat' }, { value: 'cuisine', label: 'Cuisine locale' },
        { value: 'histoire', label: 'Histoire' }, { value: 'nature', label: 'Nature' },
        { value: 'oiseaux', label: 'Observation oiseaux' },
        { value: 'photographie', label: 'Photographie' },
      ]},
      langues_guides: { type: 'multiselect', required: true, label: "Langues du guide", options: LANGS },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
      points_interet: { type: 'textarea', label: "Points d'intérêt" },
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'guide', label: 'Guide conférencier' }, { value: 'entree', label: "Billets d'entrée" },
        { value: 'degustation', label: 'Dégustation' },
      ]},
    },
    display: { cardFields: ['type_visite', 'duree', 'themes_visite'], filterable: ['type_visite', 'langues_guides', 'themes_visite'] },
  },

  activity_other: {
    key: 'activity_other',
    label: 'Autre activité',
    category: 'activity',
    sections: [
      { id: 'general', label: 'Informations', fields: ['activity_custom_name', 'duree', 'description_activity', 'niveau_offre'] },
      { id: 'group', label: 'Groupe', fields: ['nb_participants_min', 'nb_participants_max'] },
      { id: 'equipment', label: 'Équipement', fields: ['equipement_fourni', 'inclus'] },
    ],
    fields: {
      activity_custom_name: { type: 'text', required: true, label: "Nom de l'activité" },
      duree: { type: 'text', required: true, label: 'Durée' },
      description_activity: { type: 'textarea', label: 'Description / déroulement' },
      niveau_offre: { type: 'select', label: 'Niveau', options: [
        { value: 'facile', label: 'Facile' }, { value: 'moyen', label: 'Moyen' },
        { value: 'difficile', label: 'Difficile' }, { value: 'tous', label: 'Tous niveaux' },
      ]},
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
      equipement_fourni: { type: 'textarea', label: 'Équipement fourni' },
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'guide', label: 'Guide' }, { value: 'assurance', label: 'Assurance' },
        { value: 'equipement', label: 'Équipement' },
      ]},
    },
    display: { cardFields: ['activity_custom_name', 'duree', 'niveau_offre'], filterable: ['niveau_offre'] },
  },

  // ───────── RESTAURATION ─────────

  restaurant_menu: {
    key: 'restaurant_menu',
    label: 'Menu complet',
    category: 'restaurant',
    sections: [
      { id: 'general', label: 'Informations', fields: ['nb_plats', 'formule', 'regimes_offre'] },
      { id: 'capacity', label: 'Capacité', fields: ['nb_couverts_offre'] },
      { id: 'inclus', label: 'Inclus', fields: ['inclus'] },
    ],
    fields: {
      nb_plats: { type: 'number', required: true, label: 'Nombre de plats', min: 1 },
      formule: { type: 'text', label: 'Formule', placeholder: 'Entrée + Plat + Dessert' },
      regimes_offre: { type: 'multiselect', label: 'Régimes proposés', options: REGIMES },
      nb_couverts_offre: { type: 'number', required: true, label: 'Nombre de couverts', min: 1 },
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'boisson', label: 'Boisson' }, { value: 'pain', label: 'Pain' },
        { value: 'the', label: 'Thé' }, { value: 'cafe', label: 'Café' },
      ]},
    },
    display: { cardFields: ['nb_plats', 'formule', 'nb_couverts_offre'], filterable: ['regimes_offre'] },
  },

  restaurant_dish: {
    key: 'restaurant_dish',
    label: 'Plat',
    category: 'restaurant',
    sections: [
      { id: 'general', label: 'Informations', fields: ['type_plat', 'regimes_offre'] },
    ],
    fields: {
      type_plat: { type: 'select', required: true, label: 'Type de plat', options: [
        { value: 'entree', label: 'Entrée' }, { value: 'plat', label: 'Plat principal' },
        { value: 'dessert', label: 'Dessert' },
      ]},
      regimes_offre: { type: 'multiselect', label: 'Régimes proposés', options: [
        { value: 'vegetarien', label: 'Végétarien' }, { value: 'vegan', label: 'Vegan' },
        { value: 'halal', label: 'Halal' }, { value: 'sans_gluten', label: 'Sans gluten' },
      ]},
    },
    display: { cardFields: ['type_plat'], filterable: ['regimes_offre', 'type_plat'] },
  },

  // ───────── ATELIER ─────────

  workshop_poterie: {
    key: 'workshop_poterie',
    label: 'Poterie',
    category: 'workshop',
    sections: [
      { id: 'general', label: "L'atelier", fields: ['technique_enseignee', 'niveau_offre', 'duree', 'materiel_fourni'] },
      { id: 'group', label: 'Groupe', fields: ['nb_participants_min', 'nb_participants_max'] },
      { id: 'options', label: 'Options', fields: ['creation_a_emporter', 'vente_sur_place', 'inclus'] },
    ],
    fields: {
      technique_enseignee: { type: 'select', required: true, label: 'Technique enseignée', options: [
        { value: 'tour', label: 'Tour de potier' }, { value: 'modelage', label: 'Modelage main' },
        { value: 'colombin', label: 'Colombin' }, { value: 'emaux', label: 'Émaux & décoration' },
      ]},
      niveau_offre: { type: 'select', label: 'Niveau', options: [
        { value: 'debutant', label: 'Débutant' }, { value: 'intermediaire', label: 'Intermédiaire' },
        { value: 'avance', label: 'Avancé' },
      ]},
      duree: { type: 'text', required: true, label: 'Durée', placeholder: '2h / demi-journée' },
      materiel_fourni: { type: 'boolean', label: 'Matériel fourni' },
      creation_a_emporter: { type: 'boolean', label: 'Création à emporter' },
      vente_sur_place: { type: 'boolean', label: 'Vente sur place' },
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'terre', label: 'Terre' }, { value: 'emaux', label: 'Émaux' },
        { value: 'cuisson', label: 'Cuisson' }, { value: 'outils', label: 'Outils' },
      ]},
    },
    display: { cardFields: ['technique_enseignee', 'duree', 'niveau_offre'], filterable: ['niveau_offre', 'technique_enseignee'] },
  },

  workshop_cuisine: {
    key: 'workshop_cuisine',
    label: 'Atelier cuisine',
    category: 'workshop',
    sections: [
      { id: 'general', label: "L'atelier", fields: ['plats_prepares', 'niveau_offre', 'duree_heures', 'nb_recettes'] },
      { id: 'group', label: 'Groupe', fields: ['nb_participants_min', 'nb_participants_max', 'enfants_acceptes'] },
      { id: 'options', label: 'Options', fields: ['visite_marche', 'inclus'] },
    ],
    fields: {
      plats_prepares: { type: 'text', required: true, label: 'Plats préparés', placeholder: 'Couscous, brik, mloukhia...' },
      niveau_offre: { type: 'select', label: 'Niveau', options: [
        { value: 'debutant', label: 'Débutant' }, { value: 'intermediaire', label: 'Intermédiaire' },
        { value: 'avance', label: 'Avancé' },
      ]},
      duree_heures: { type: 'number', required: true, label: 'Durée (heures)', unit: 'h', min: 1 },
      nb_recettes: { type: 'number', required: true, label: 'Nombre de recettes', min: 1 },
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
      enfants_acceptes: { type: 'boolean', label: 'Adapté aux enfants' },
      visite_marche: { type: 'boolean', label: 'Visite du marché incluse' },
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'ingredients', label: 'Ingrédients' }, { value: 'tablier', label: 'Tablier' },
        { value: 'recette', label: 'Fiche recette' }, { value: 'degustation', label: 'Dégustation' },
      ]},
    },
    display: { cardFields: ['nb_recettes', 'duree_heures', 'niveau_offre', 'plats_prepares'], filterable: ['niveau_offre', 'enfants_acceptes'] },
  },

  workshop_tissage: {
    key: 'workshop_tissage',
    label: 'Tissage',
    category: 'workshop',
    sections: [
      { id: 'general', label: "L'atelier", fields: ['technique_proposee', 'duree_heures', 'niveau_offre', 'cycle_complet'] },
      { id: 'materials', label: 'Matériel', fields: ['type_metier', 'materiaux_inclus', 'nb_participants_max'] },
    ],
    fields: {
      technique_proposee: { type: 'select', required: true, label: 'Technique', options: [
        { value: 'tapis', label: 'Tissage de tapis' }, { value: 'kilim', label: 'Kilim' },
        { value: 'margoum', label: 'Margoum (broderie berbère)' },
        { value: 'tissage_traditionnel', label: 'Tissage traditionnel' },
        { value: 'teinture', label: "Teinture naturelle + tissage" },
      ]},
      duree_heures: { type: 'number', required: true, label: 'Durée (heures)', unit: 'h', min: 1 },
      niveau_offre: { type: 'select', label: 'Niveau', options: [
        { value: 'debutant', label: 'Débutant' }, { value: 'intermediaire', label: 'Intermédiaire' },
        { value: 'avance', label: 'Avancé' }, { value: 'tous', label: 'Tous niveaux' },
      ]},
      cycle_complet: { type: 'boolean', label: 'Atelier en plusieurs sessions' },
      type_metier: { type: 'select', label: "Type de métier à tisser", options: [
        { value: 'vertical', label: 'Métier vertical' }, { value: 'horizontal', label: 'Métier horizontal' },
        { value: 'cadre', label: 'Cadre de tissage' },
      ]},
      materiaux_inclus: { type: 'multiselect', label: 'Matériaux inclus', options: [
        { value: 'laine', label: 'Laine' }, { value: 'coton', label: 'Coton' },
        { value: 'soie', label: 'Soie' }, { value: 'alfa', label: 'Alfa (fibre naturelle)' },
        { value: 'teintures', label: 'Teintures naturelles' },
      ]},
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
    },
    display: { cardFields: ['technique_proposee', 'duree_heures', 'niveau_offre'], filterable: ['technique_proposee', 'niveau_offre', 'cycle_complet'] },
  },

  workshop_musique: {
    key: 'workshop_musique',
    label: 'Musique',
    category: 'workshop',
    sections: [
      { id: 'general', label: 'Atelier musical', fields: ['instrument_enseigne', 'style_musical', 'duree_heures', 'niveau_offre'] },
      { id: 'group', label: 'Groupe', fields: ['nb_participants_min', 'nb_participants_max'] },
      { id: 'inclus', label: 'Inclus', fields: ['instrument_fourni', 'inclus'] },
    ],
    fields: {
      instrument_enseigne: { type: 'select', required: true, label: 'Instrument enseigné', options: [
        { value: 'darbouka', label: 'Darbouka' }, { value: 'oud', label: 'Oud' },
        { value: 'violon', label: 'Violon' }, { value: 'nei', label: 'Neï (flûte)' },
        { value: 'percussions', label: 'Percussions' }, { value: 'chant', label: 'Chant' },
      ]},
      style_musical: { type: 'multiselect', label: 'Styles musicaux', options: [
        { value: 'traditionnel', label: 'Traditionnel' }, { value: 'soufi', label: 'Soufi' },
        { value: 'malouf', label: 'Malouf' }, { value: 'stambeli', label: 'Stambeli' },
        { value: 'moderne', label: 'Moderne' },
      ]},
      duree_heures: { type: 'number', required: true, label: 'Durée (heures)', unit: 'h', min: 1 },
      niveau_offre: { type: 'select', label: 'Niveau requis', options: [
        { value: 'debutant', label: 'Débutant' }, { value: 'intermediaire', label: 'Intermédiaire' },
        { value: 'avance', label: 'Avancé' }, { value: 'tous', label: 'Tous niveaux' },
      ]},
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
      instrument_fourni: { type: 'boolean', label: 'Instrument fourni' },
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'instrument', label: 'Instrument' }, { value: 'partition', label: 'Partitions' },
        { value: 'enregistrement', label: "Enregistrement audio" },
      ]},
    },
    display: { cardFields: ['instrument_enseigne', 'duree_heures', 'niveau_offre'], filterable: ['niveau_offre', 'instrument_enseigne', 'style_musical'] },
  },

  workshop_other: {
    key: 'workshop_other',
    label: 'Autre atelier',
    category: 'workshop',
    sections: [
      { id: 'general', label: "L'atelier", fields: ['workshop_custom_name', 'duree_heures', 'niveau_offre', 'description_workshop'] },
      { id: 'group', label: 'Groupe', fields: ['nb_participants_min', 'nb_participants_max'] },
      { id: 'inclus', label: 'Inclus', fields: ['materiel_fourni', 'inclus'] },
    ],
    fields: {
      workshop_custom_name: { type: 'text', required: true, label: "Nom de l'atelier" },
      duree_heures: { type: 'number', required: true, label: 'Durée (heures)', unit: 'h', min: 1 },
      niveau_offre: { type: 'select', label: 'Niveau', options: [
        { value: 'debutant', label: 'Débutant' }, { value: 'intermediaire', label: 'Intermédiaire' },
        { value: 'avance', label: 'Avancé' }, { value: 'tous', label: 'Tous niveaux' },
      ]},
      description_workshop: { type: 'textarea', label: 'Description / déroulement' },
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
      materiel_fourni: { type: 'text', label: 'Matériel fourni' },
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'materiel', label: 'Matériel' }, { value: 'gouter', label: 'Goûter' },
      ]},
    },
    display: { cardFields: ['workshop_custom_name', 'duree_heures', 'niveau_offre'], filterable: ['niveau_offre'] },
  },

  // ───────── ÉQUIPEMENT RENTAL ─────────

  equipment_rental_equipment: {
    key: 'equipment_rental_equipment',
    label: 'Location équipement',
    category: 'equipment_rental',
    sections: [
      { id: 'item', label: 'Équipement', fields: ['type_equipement', 'marque_modele', 'quantite_disponible_offre', 'etat_offre'] },
      { id: 'conditions', label: 'Conditions', fields: ['livraison_offre', 'caution_offre', 'age_minimum', 'conditions_utilisation'] },
    ],
    fields: {
      type_equipement: { type: 'select', required: true, label: "Type d'équipement", options: [
        { value: 'velo', label: 'Vélo' }, { value: 'vtt', label: 'VTT' },
        { value: 'kayak', label: 'Kayak' }, { value: 'canoe', label: 'Canoë' },
        { value: 'paddle', label: 'Paddle' }, { value: 'tente', label: 'Tente' },
        { value: 'sac_couchage', label: 'Sac de couchage' }, { value: 'matelas', label: 'Matelas' },
        { value: 'equipement_escalade', label: "Équipement d'escalade" },
        { value: 'combinaison', label: 'Combinaison' }, { value: 'autre', label: 'Autre' },
      ]},
      marque_modele: { type: 'text', label: 'Marque / Modèle' },
      quantite_disponible_offre: { type: 'number', required: true, label: 'Quantité disponible', min: 1 },
      etat_offre: { type: 'select', label: 'État', options: [
        { value: 'neuf', label: 'Neuf' }, { value: 'tres_bon', label: 'Très bon état' },
        { value: 'bon', label: 'Bon état' }, { value: 'usage', label: "D'occasion" },
      ]},
      livraison_offre: { type: 'boolean', label: 'Livraison possible' },
      caution_offre: { type: 'number', label: 'Montant de la caution (DT)', unit: 'DT' },
      age_minimum: { type: 'number', label: 'Âge minimum', min: 0 },
      conditions_utilisation: { type: 'textarea', label: "Conditions d'utilisation" },
    },
    display: { cardFields: ['type_equipement', 'quantite_disponible_offre', 'etat_offre'], filterable: ['type_equipement', 'etat_offre', 'livraison_offre'] },
  },

  // ───────── GUIDE SERVICE ─────────

  guide_service_hiking: {
    key: 'guide_service_hiking',
    label: 'Guide randonnée',
    category: 'guide_service',
    sections: [
      { id: 'general', label: 'Prestation', fields: ['zone_offre', 'duree', 'type_parcours_prefere', 'niveau_offre'] },
      { id: 'group', label: 'Groupe', fields: ['nb_participants_min', 'nb_participants_max'] },
      { id: 'languages', label: 'Langues', fields: ['langues'] },
    ],
    fields: {
      zone_offre: { type: 'text', required: true, label: 'Zone couverte' },
      duree: { type: 'text', required: true, label: 'Durée' },
      type_parcours_prefere: { type: 'multiselect', label: 'Types de parcours préférés', options: [
        { value: 'montagne', label: 'Montagne' }, { value: 'foret', label: 'Forêt' },
        { value: 'desert', label: 'Désert' }, { value: 'cote', label: 'Côte' },
        { value: 'oasis', label: 'Oasis' }, { value: 'ville', label: 'Urbain' },
      ]},
      niveau_offre: { type: 'select', label: 'Niveau proposé', options: [
        { value: 'facile', label: 'Facile' }, { value: 'moyen', label: 'Moyen' },
        { value: 'difficile', label: 'Difficile' }, { value: 'tous', label: 'Tous niveaux' },
      ]},
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
      langues: { type: 'multiselect', required: true, label: 'Langues parlées', options: [
        { value: 'fr', label: 'Français' }, { value: 'ar', label: 'Arabe' },
        { value: 'en', label: 'Anglais' }, { value: 'de', label: 'Allemand' },
        { value: 'it', label: 'Italien' }, { value: 'es', label: 'Espagnol' },
      ]},
    },
    display: { cardFields: ['zone_offre', 'duree', 'niveau_offre'], filterable: ['niveau_offre', 'type_parcours_prefere', 'langues'] },
  },

  // ───────── TRANSPORT ─────────

  transport_transport_service: {
    key: 'transport_transport_service',
    label: 'Service transport',
    category: 'transport',
    sections: [
      { id: 'route', label: 'Trajet', fields: ['trajet_exact', 'duree_trajet', 'horaires_depart'] },
      { id: 'vehicle', label: 'Véhicule', fields: ['type_vehicule_offre', 'capacite_offre'] },
      { id: 'services', label: 'Services', fields: ['wifi_bord', 'pmr_offre', 'bagages_inclus'] },
    ],
    fields: {
      trajet_exact: { type: 'text', required: true, label: 'Trajet exact' },
      duree_trajet: { type: 'text', required: true, label: 'Durée du trajet', placeholder: '30 min / 2h' },
      horaires_depart: { type: 'textarea', label: 'Horaires de départ' },
      type_vehicule_offre: { type: 'select', required: true, label: 'Type de véhicule', options: [
        { value: 'voiture', label: 'Voiture' }, { value: 'minibus', label: 'Minibus' },
        { value: 'bus', label: 'Bus' }, { value: '4x4', label: '4x4' },
      ]},
      capacite_offre: { type: 'number', required: true, label: 'Nombre de personnes', min: 1 },
      wifi_bord: { type: 'boolean', label: 'WiFi à bord' },
      pmr_offre: { type: 'boolean', label: 'Accessible PMR' },
      bagages_inclus: { type: 'boolean', label: 'Bagages inclus' },
    },
    display: { cardFields: ['type_vehicule_offre', 'capacite_offre', 'duree_trajet'], filterable: ['type_vehicule_offre', 'pmr_offre'] },
  },

  // ───────── GUIDE SERVICE ─────────

  guide_service_guided_tour: {
    key: 'guide_service_guided_tour',
    label: 'Visite guidée',
    category: 'guide_service',
    sections: [
      { id: 'general', label: 'Visite', fields: ['zone_offre', 'specialite_offre', 'duree', 'langues'] },
      { id: 'group', label: 'Groupe', fields: ['nb_participants_min', 'nb_participants_max'] },
      { id: 'inclus', label: 'Inclus', fields: ['inclus'] },
    ],
    fields: {
      zone_offre: { type: 'text', required: true, label: 'Zone couverte' },
      specialite_offre: { type: 'text', label: 'Spécialité', placeholder: 'Histoire, nature, gastronomie...' },
      duree: { type: 'text', required: true, label: 'Durée' },
      langues: { type: 'multiselect', required: true, label: 'Langues parlées', options: [
        { value: 'fr', label: 'Français' }, { value: 'ar', label: 'Arabe' },
        { value: 'en', label: 'Anglais' }, { value: 'de', label: 'Allemand' },
        { value: 'it', label: 'Italien' }, { value: 'es', label: 'Espagnol' },
      ]},
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'audioguide', label: 'Audioguide' }, { value: 'entree', label: "Billet d'entrée" },
        { value: 'transport', label: 'Transport' },
      ]},
    },
    display: { cardFields: ['zone_offre', 'duree', 'specialite_offre'], filterable: ['langues', 'specialite_offre'] },
  },

  // ───────── CIRCUIT ─────────

  circuit_circuit: {
    key: 'circuit_circuit',
    label: 'Circuit complet',
    category: 'circuit',
    sections: [
      { id: 'general', label: 'Aperçu', fields: ['duree_jours', 'duree_nuits', 'niveau_offre', 'zone_circuit'] },
      { id: 'itineraire', label: 'Itinéraire', fields: ['points_forts', 'etapes_principales'] },
      { id: 'group', label: 'Groupe', fields: ['nb_participants_min', 'nb_participants_max'] },
      { id: 'inclus', label: 'Inclus', fields: ['hebergement_inclus', 'repas_inclus', 'guide_inclus', 'inclus'] },
    ],
    fields: {
      duree_jours: { type: 'number', required: true, label: 'Durée (jours)', min: 1, max: 30 },
      duree_nuits: { type: 'number', label: 'Nombre de nuits', min: 0, max: 29 },
      niveau_offre: { type: 'select', required: true, label: 'Niveau', options: [
        { value: 'facile', label: 'Facile' }, { value: 'moyen', label: 'Moyen' },
        { value: 'difficile', label: 'Difficile' }, { value: 'expert', label: 'Expert' },
      ]},
      zone_circuit: { type: 'select', required: true, label: 'Zone', options: [
        { value: 'nord', label: 'Nord (Tunis, Bizerte, Béja)' },
        { value: 'nord_est', label: 'Nord-Est (Nabeul, Hammamet, Cap Bon)' },
        { value: 'centre', label: 'Centre (Kairouan, Sousse, Monastir)' },
        { value: 'sud_est', label: 'Sud-Est (Djerba, Zarzis, Gabès)' },
        { value: 'sud_ouest', label: 'Sud-Ouest (Tozeur, Douz, Tataouine)' },
        { value: 'multi', label: 'Multi-région' },
      ]},
      points_forts: { type: 'textarea', label: "Points forts du circuit" },
      etapes_principales: { type: 'textarea', label: 'Étapes principales', placeholder: 'Jour 1: Arrivée à Tunis...\nJour 2: Découverte de Carthage...' },
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
      hebergement_inclus: { type: 'boolean', label: 'Hébergement inclus' },
      repas_inclus: { type: 'select', label: 'Repas inclus', options: [
        { value: 'aucun', label: 'Aucun' }, { value: 'petit_dej', label: 'Petit-déjeuner' },
        { value: 'demi_pension', label: 'Demi-pension' }, { value: 'pension', label: 'Pension complète' },
        { value: 'tout', label: 'Tout inclus' },
      ]},
      guide_inclus: { type: 'boolean', label: 'Guide accompagnateur inclus' },
      inclus: { type: 'hierarchy', label: 'Inclus', taxonomy: 'inclus' },
    },
    display: { cardFields: ['zone_circuit', 'duree_jours', 'niveau_offre', 'nb_participants_max'], filterable: ['zone_circuit', 'niveau_offre', 'duree_jours'] },
  },

  // ───────── SÉJOUR ─────────

  sejour_package: {
    key: 'sejour_package',
    label: 'Forfait séjour',
    category: 'sejour',
    sections: [
      { id: 'general', label: 'Séjour', fields: ['duree_jours', 'type_hebergement', 'formule_repas'] },
      { id: 'activities', label: 'Activités', fields: ['activites_incluses', 'equipement_fourni'] },
      { id: 'group', label: 'Groupe', fields: ['nb_participants_min', 'nb_participants_max'] },
    ],
    fields: {
      duree_jours: { type: 'number', required: true, label: 'Durée (jours)', min: 1, max: 30 },
      type_hebergement: { type: 'select', required: true, label: "Type d'hébergement", options: [
        { value: 'ecolodge', label: 'Éco-lodge' }, { value: 'hotel', label: 'Hôtel' },
        { value: 'camping', label: 'Camping' }, { value: 'gite', label: "Gîte d'étape" },
        { value: 'mixte', label: 'Mixte (plusieurs types)' },
      ]},
      formule_repas: { type: 'select', label: 'Formule repas', options: [
        { value: 'sans', label: 'Sans repas' }, { value: 'petit_dej', label: 'Petit-déjeuner' },
        { value: 'demi_pension', label: 'Demi-pension' }, { value: 'pension', label: 'Pension complète' },
      ]},
      activites_incluses: { type: 'hierarchy', label: 'Activités incluses', taxonomy: 'services_offre' },
      equipement_fourni: { type: 'multiselect', label: 'Équipement fourni', options: [
        { value: 'sac_couchage', label: 'Sac de couchage' }, { value: 'matelas', label: 'Matelas' },
        { value: 'baton_marche', label: 'Bâtons de marche' }, { value: 'gourde', label: 'Gourde réutilisable' },
      ]},
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
    },
    display: { cardFields: ['duree_jours', 'type_hebergement', 'formule_repas', 'nb_participants_max'], filterable: ['type_hebergement', 'formule_repas'] },
  },

  sejour_all_inclusive: {
    key: 'sejour_all_inclusive',
    label: 'Tout inclus',
    category: 'sejour',
    sections: [
      { id: 'general', label: 'Séjour', fields: ['duree_jours', 'type_hebergement', 'formule_repas', 'transport_inclus'] },
      { id: 'activities', label: 'Activités & Services', fields: ['activites_incluses', 'services_premium'] },
      { id: 'group', label: 'Groupe', fields: ['nb_participants_min', 'nb_participants_max'] },
    ],
    fields: {
      duree_jours: { type: 'number', required: true, label: 'Durée (jours)', min: 1, max: 30 },
      type_hebergement: { type: 'select', required: true, label: "Type d'hébergement", options: [
        { value: 'ecolodge', label: 'Éco-lodge' }, { value: 'hotel', label: 'Hôtel' },
        { value: 'bungalow', label: 'Bungalow' }, { value: 'mixte', label: 'Mixte' },
      ]},
      formule_repas: { type: 'select', label: 'Formule repas', options: [
        { value: 'demi_pension', label: 'Demi-pension' }, { value: 'pension', label: 'Pension complète' },
      ]},
      transport_inclus: { type: 'boolean', label: 'Transport aller-retour inclus' },
      activites_incluses: { type: 'hierarchy', label: 'Activités incluses', taxonomy: 'services_offre' },
      services_premium: { type: 'multiselect', label: 'Services premium', options: [
        { value: 'spa', label: 'Accès spa' }, { value: 'massage', label: 'Massage' },
        { value: 'guide_prive', label: 'Guide privé' }, { value: 'photographe', label: 'Photographe' },
      ]},
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
    },
    display: { cardFields: ['duree_jours', 'type_hebergement', 'formule_repas', 'transport_inclus'], filterable: ['type_hebergement', 'formule_repas', 'transport_inclus'] },
  },

  // ───────── ÉCO-TOUR ─────────

  eco_tour_activity: {
    key: 'eco_tour_activity',
    label: 'Activité éco',
    category: 'eco_tour',
    sections: [
      { id: 'general', label: 'Activité', fields: ['eco_custom_name', 'duree', 'niveau_offre'] },
      { id: 'eco', label: 'Engagement éco', fields: ['pratiques_eco', 'impact_positif'] },
      { id: 'group', label: 'Groupe', fields: ['nb_participants_min', 'nb_participants_max'] },
    ],
    fields: {
      eco_custom_name: { type: 'text', required: true, label: "Nom de l'activité" },
      duree: { type: 'text', required: true, label: 'Durée' },
      niveau_offre: { type: 'select', label: 'Niveau', options: [
        { value: 'facile', label: 'Facile' }, { value: 'moyen', label: 'Moyen' },
        { value: 'difficile', label: 'Difficile' }, { value: 'tous', label: 'Tous niveaux' },
      ]},
      pratiques_eco: { type: 'multiselect', label: 'Pratiques éco-responsables', options: [
        { value: 'zero_dechet', label: 'Zéro déchet' }, { value: 'compensation', label: 'Compensation carbone' },
        { value: 'local', label: 'Produits locaux' }, { value: 'solaire', label: 'Énergie solaire' },
        { value: 'sensibilisation', label: 'Sensibilisation environnementale' },
      ]},
      impact_positif: { type: 'textarea', label: "Impact positif sur l'environnement" },
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
    },
    display: { cardFields: ['eco_custom_name', 'duree', 'niveau_offre', 'pratiques_eco'], filterable: ['niveau_offre', 'pratiques_eco'] },
  },

  eco_tour_guided_tour: {
    key: 'eco_tour_guided_tour',
    label: 'Visite éco-guidée',
    category: 'eco_tour',
    sections: [
      { id: 'general', label: 'Visite', fields: ['themes_visite', 'duree', 'distance_marche', 'langues_guides'] },
      { id: 'eco', label: 'Démarche', fields: ['pratiques_eco', 'points_interet'] },
      { id: 'group', label: 'Groupe', fields: ['nb_participants_min', 'nb_participants_max'] },
    ],
    fields: {
      themes_visite: { type: 'multiselect', required: true, label: 'Thèmes', options: [
        { value: 'nature', label: 'Nature' }, { value: 'patrimoine', label: 'Patrimoine' },
        { value: 'biodiversite', label: 'Biodiversité' }, { value: 'agroecologie', label: 'Agroécologie' },
        { value: 'culture_berbere', label: 'Culture berbère' },
      ]},
      duree: { type: 'text', required: true, label: 'Durée' },
      distance_marche: { type: 'number', label: 'Distance à pied (km)', unit: 'km' },
      langues_guides: { type: 'multiselect', required: true, label: 'Langues du guide', options: LANGS },
      pratiques_eco: { type: 'multiselect', label: 'Pratiques éco', options: [
        { value: 'sensibilisation', label: 'Sensibilisation' }, { value: 'groupe_restreint', label: 'Groupe restreint (max 8)' },
        { value: 'deplacement_doux', label: 'Déplacement doux' },
      ]},
      points_interet: { type: 'textarea', label: "Points d'intérêt" },
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
    },
    display: { cardFields: ['themes_visite', 'duree', 'distance_marche', 'langues_guides'], filterable: ['themes_visite', 'pratiques_eco'] },
  },

  eco_tour_hiking: {
    key: 'eco_tour_hiking',
    label: 'Randonnée nature',
    category: 'eco_tour',
    sections: [
      { id: 'course', label: 'Parcours', fields: ['distance_km', 'denivele_m', 'duree_estimee', 'type_parcours', 'point_depart'] },
      { id: 'eco', label: 'Démarche', fields: ['pratiques_eco', 'points_interet'] },
      { id: 'level', label: 'Niveau', fields: ['niveau_offre', 'nb_participants_min', 'nb_participants_max'] },
    ],
    fields: {
      distance_km: { type: 'number', required: true, label: 'Distance (km)', unit: 'km', min: 0 },
      denivele_m: { type: 'number', label: 'Dénivelé (m)', unit: 'm' },
      duree_estimee: { type: 'text', required: true, label: 'Durée estimée' },
      type_parcours: { type: 'select', label: 'Type de parcours', options: [
        { value: 'boucle', label: 'Boucle' }, { value: 'aller_retour', label: 'Aller-retour' },
        { value: 'traversee', label: 'Traversée' },
      ]},
      point_depart: { type: 'text', required: true, label: 'Point de départ' },
      pratiques_eco: { type: 'multiselect', label: 'Pratiques éco', options: [
        { value: 'zero_dechet', label: 'Zéro déchet' }, { value: 'faune', label: 'Respect faune' },
        { value: 'flore', label: 'Respect flore' }, { value: 'groupe_reduit', label: 'Groupe réduit' },
      ]},
      points_interet: { type: 'textarea', label: "Points d'intérêt nature" },
      niveau_offre: { type: 'select', required: true, label: 'Niveau', options: [
        { value: 'facile', label: 'Facile' }, { value: 'moyen', label: 'Moyen' },
        { value: 'difficile', label: 'Difficile' },
      ]},
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
    },
    display: { cardFields: ['distance_km', 'duree_estimee', 'niveau_offre'], filterable: ['niveau_offre', 'pratiques_eco'] },
  },

  eco_tour_observation: {
    key: 'eco_tour_observation',
    label: 'Observation faune/flore',
    category: 'eco_tour',
    sections: [
      { id: 'type', label: "Type d'observation", fields: ['type_observation', 'saison_ideale', 'duree', 'meilleurs_horaires'] },
      { id: 'guide', label: 'Guide', fields: ['encadrement_guide', 'langues_guides'] },
      { id: 'group', label: 'Groupe', fields: ['nb_participants_min', 'nb_participants_max'] },
    ],
    fields: {
      type_observation: { type: 'select', required: true, label: "Type d'observation", options: [
        { value: 'faune', label: 'Faune sauvage' }, { value: 'flore', label: 'Flore endémique' },
        { value: 'oiseaux', label: 'Observation ornithologique' }, { value: 'etoiles', label: 'Astronomie' },
      ]},
      saison_ideale: { type: 'text', label: 'Saison idéale' },
      duree: { type: 'text', required: true, label: 'Durée' },
      meilleurs_horaires: { type: 'text', label: 'Meilleurs horaires' },
      encadrement_guide: { type: 'boolean', label: 'Guide naturaliste' },
      langues_guides: { type: 'multiselect', label: 'Langues du guide', conditionalOn: { field: 'encadrement_guide', value: true }, options: [
        { value: 'fr', label: 'Français' }, { value: 'ar', label: 'Arabe' },
        { value: 'en', label: 'Anglais' }, { value: 'de', label: 'Allemand' },
      ]},
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
    },
    display: { cardFields: ['type_observation', 'duree', 'saison_ideale'], filterable: ['type_observation', 'encadrement_guide'] },
  },

  eco_tour_workshop: {
    key: 'eco_tour_workshop',
    label: 'Atelier éco',
    category: 'eco_tour',
    sections: [
      { id: 'general', label: "L'atelier", fields: ['eco_custom_name', 'duree', 'niveau_offre', 'description_workshop'] },
      { id: 'eco', label: 'Engagement', fields: ['pratiques_eco', 'materiaux_ecoresponsables'] },
      { id: 'group', label: 'Groupe', fields: ['nb_participants_min', 'nb_participants_max'] },
    ],
    fields: {
      eco_custom_name: { type: 'text', required: true, label: "Nom de l'atelier" },
      duree: { type: 'text', required: true, label: 'Durée' },
      niveau_offre: { type: 'select', label: 'Niveau', options: [
        { value: 'debutant', label: 'Débutant' }, { value: 'tous', label: 'Tous niveaux' },
      ]},
      description_workshop: { type: 'textarea', label: 'Description' },
      pratiques_eco: { type: 'multiselect', label: 'Pratiques éco', options: [
        { value: 'materiaux_naturels', label: 'Matériaux naturels' }, { value: 'zero_dechet', label: 'Zéro déchet' },
        { value: 'recyclage', label: 'Recyclage / Upcycling' }, { value: 'local', label: 'Produits locaux' },
      ]},
      materiaux_ecoresponsables: { type: 'textarea', label: 'Matériaux éco-responsables utilisés' },
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
    },
    display: { cardFields: ['eco_custom_name', 'duree', 'niveau_offre', 'pratiques_eco'], filterable: ['niveau_offre', 'pratiques_eco'] },
  },

  // ───────── CIRCUIT (inspiré Maram) ─────────

  circuit_nature: {
    key: 'circuit_nature',
    label: 'Circuit nature',
    category: 'circuit',
    sections: [
      { id: 'general', label: 'Informations', fields: ['circuit_nom', 'circuit_duree_jours', 'circuit_difficulte', 'circuit_periode', 'circuit_langues'] },
      { id: 'programme', label: 'Programme détaillé', fields: ['programme_jours'] },
      { id: 'hebergement', label: 'Hébergement', fields: ['refuge_inclus', 'type_hebergement_circuit', 'nuit_etoile', 'unit_details'] },
      { id: 'logistics', label: 'Logistique', fields: ['point_depart', 'point_arrivee', 'transport_inclus', 'equipement_fourni_circuit'] },
    ],
    fields: {
      circuit_nom: { type: 'text', required: true, label: "Nom du circuit" },
      circuit_duree_jours: { type: 'number', required: true, label: 'Durée (jours)', min: 1, max: 30 },
      circuit_difficulte: { type: 'select', required: true, label: 'Difficulté', options: [
        { value: 'facile', label: 'Facile' }, { value: 'moyen', label: 'Moyen' },
        { value: 'difficile', label: 'Difficile' }, { value: 'expert', label: 'Expert' },
      ]},
      circuit_periode: { type: 'multiselect', label: 'Période recommandée', options: [
        { value: 'printemps', label: 'Printemps' }, { value: 'ete', label: 'Été' },
        { value: 'automne', label: 'Automne' }, { value: 'hiver', label: 'Hiver' },
      ]},
      circuit_langues: { type: 'multiselect', label: 'Langues', options: [
        { value: 'fr', label: 'Français' }, { value: 'ar', label: 'Arabe' },
        { value: 'en', label: 'Anglais' }, { value: 'de', label: 'Allemand' },
        { value: 'it', label: 'Italien' }, { value: 'es', label: 'Espagnol' },
      ]},
      programme_jours: { type: 'textarea', label: 'Programme jour par jour', placeholder: 'Jour 1 : Arrivée et installation...\nJour 2 : Randonnée guidée...' },
      refuge_inclus: { type: 'boolean', label: 'Nuit en refuge incluse' },
      type_hebergement_circuit: { type: 'select', label: "Type d'hébergement", options: [
        { value: 'refuge', label: 'Refuge' }, { value: 'tente', label: 'Tente / Bivouac' },
        { value: 'gite', label: "Gîte d'étape" }, { value: 'ecolodge', label: 'Éco-lodge' },
        { value: 'chez_habitant', label: "Chez l'habitant" }, { value: 'mixte', label: 'Mixte' },
      ]},
      nuit_etoile: { type: 'boolean', label: 'Nuit à la belle étoile possible' },
      unit_details: { type: 'textarea', label: "Détail des unités", placeholder: 'Ex: 2 tentes 2 places, 1 refuge 6 pers...' },
      point_depart: { type: 'text', label: 'Point de départ' },
      point_arrivee: { type: 'text', label: "Point d'arrivée" },
      transport_inclus: { type: 'boolean', label: 'Transport inclus' },
      equipement_fourni_circuit: { type: 'multiselect', label: 'Équipement fourni', options: [
        { value: 'tente', label: 'Tente' }, { value: 'sac_couchage', label: 'Sac de couchage' },
        { value: 'matelas', label: 'Matelas' }, { value: 'rechaud', label: 'Réchaud' },
        { value: 'gourde', label: "Gourde d'eau" }, { value: 'baton_marche', label: 'Bâtons de marche' },
      ]},
    },
    display: { cardFields: ['circuit_nom', 'circuit_duree_jours', 'circuit_difficulte'], filterable: ['circuit_difficulte', 'circuit_periode', 'type_hebergement_circuit', 'refuge_inclus'] },
  },

  circuit_culturel: {
    key: 'circuit_culturel',
    label: 'Circuit culturel',
    category: 'circuit',
    sections: [
      { id: 'general', label: 'Informations', fields: ['circuit_nom', 'circuit_duree_jours', 'themes_visite', 'circuit_langues'] },
      { id: 'programme', label: 'Programme', fields: ['programme_jours'] },
      { id: 'hebergement', label: 'Hébergement', fields: ['type_hebergement_circuit', 'refuge_inclus'] },
    ],
    fields: {
      circuit_nom: { type: 'text', required: true, label: "Nom du circuit" },
      circuit_duree_jours: { type: 'number', required: true, label: 'Durée (jours)', min: 1, max: 30 },
      themes_visite: { type: 'multiselect', label: 'Thèmes', options: [
        { value: 'histoire', label: 'Histoire' }, { value: 'architecture', label: 'Architecture' },
        { value: 'artisanat', label: 'Artisanat' }, { value: 'gastronomie', label: 'Gastronomie' },
        { value: 'musique', label: 'Musique' }, { value: 'patrimoine', label: 'Patrimoine' },
      ]},
      circuit_langues: { type: 'multiselect', label: 'Langues', options: [
        { value: 'fr', label: 'Français' }, { value: 'ar', label: 'Arabe' },
        { value: 'en', label: 'Anglais' }, { value: 'de', label: 'Allemand' },
        { value: 'it', label: 'Italien' }, { value: 'es', label: 'Espagnol' },
      ]},
      programme_jours: { type: 'textarea', label: 'Programme jour par jour', placeholder: 'Jour 1 : Visite de la médina...' },
      type_hebergement_circuit: { type: 'select', label: "Type d'hébergement", conditionalOn: { field: 'refuge_inclus', value: true }, options: [
        { value: 'hotel', label: 'Hôtel' }, { value: 'riad', label: 'Riad / Dar' },
        { value: 'ecolodge', label: 'Éco-lodge' }, { value: 'chez_habitant', label: "Chez l'habitant" },
      ]},
      refuge_inclus: { type: 'boolean', label: 'Hébergement inclus' },
    },
    display: { cardFields: ['circuit_nom', 'circuit_duree_jours', 'themes_visite'], filterable: ['themes_visite', 'refuge_inclus'] },
  },

  transport_service: {
    key: 'transport_service',
    label: 'Service transport',
    category: 'transport',
    sections: [
      { id: 'route', label: 'Trajet', fields: ['type_vehicule', 'point_depart', 'point_arrivee', 'duree_trajet', 'distance_trajet_km'] },
      { id: 'capacity', label: 'Capacité', fields: ['nb_places', 'bagages_autorises'] },
      { id: 'options', label: 'Options', fields: ['aller_retour', 'arrets_intermediaires', 'inclus'] },
    ],
    fields: {
      type_vehicule: { type: 'select', required: true, label: 'Type de véhicule', options: [
        { value: '4x4', label: '4x4' }, { value: 'minibus', label: 'Minibus' },
        { value: 'bus', label: 'Bus' }, { value: 'van', label: 'Van' },
        { value: 'bateau', label: 'Bateau' }, { value: 'cheval', label: 'Cheval / Calèche' },
        { value: 'dromadaire', label: 'Dromadaire' },
      ]},
      point_depart: { type: 'text', required: true, label: 'Point de départ' },
      point_arrivee: { type: 'text', required: true, label: "Point d'arrivée" },
      duree_trajet: { type: 'text', required: true, label: 'Durée estimée', placeholder: '2h / 1 journée' },
      distance_trajet_km: { type: 'number', label: 'Distance (km)', unit: 'km' },
      nb_places: { type: 'number', required: true, label: 'Nombre de places', min: 1 },
      bagages_autorises: { type: 'boolean', label: 'Bagages autorisés' },
      aller_retour: { type: 'boolean', label: 'Aller-retour' },
      arrets_intermediaires: { type: 'text', label: "Arrêts intermédiaires" },
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'chauffeur', label: 'Chauffeur' }, { value: 'guide', label: 'Guide accompagnateur' },
        { value: 'assurance', label: 'Assurance voyage' }, { value: 'rafraichissements', label: 'Rafraîchissements' },
      ]},
    },
    display: { cardFields: ['type_vehicule', 'duree_trajet', 'nb_places'], filterable: ['type_vehicule', 'aller_retour'] },
  },
};

export function getSchema(category: string, itemType: string): OfferTypeSchema | null {
  const key = `${category}_${itemType}`;
  return OFFER_SCHEMAS[key] ?? null;
}

export function getSchemaFields(category: string, itemType: string, fieldName?: string): SchemaField | Record<string, SchemaField> | null {
  const schema = getSchema(category, itemType);
  if (!schema) return null;
  if (fieldName) return schema.fields[fieldName] ?? null;
  return schema.fields;
}
