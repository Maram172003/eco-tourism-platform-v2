// ─── Types ────────────────────────────────────────────────────────────────────

export type OfferFieldType =
  | 'text' | 'textarea' | 'number' | 'boolean'
  | 'select' | 'multiselect' | 'time' | 'file' | 'repeater'

export type CrossValidationRule = {
  field: string
  rule: 'lte' | 'gte' | 'in' | 'subset' | 'coherent' | 'requiredIfTrue' | 'requiredIfFalse'
  onboardingKey: string
  message: string
}

export interface OfferField {
  key: string
  label: string
  type: OfferFieldType
  options?: string[]
  dynamicOptions?: string        // "onboarding.fieldKey" → resolved at runtime
  placeholder?: string
  unit?: string
  required?: boolean
  conditionalOn?: { field?: string; value?: any; notValue?: any }
  subfields?: OfferField[]       // for 'repeater' type
}

export interface OfferSection {
  label: string
  icon?: string
  fields: OfferField[]
  validations?: CrossValidationRule[]
  conditionalOn?: { onboardingKey?: string; field?: string; value?: any }
}

export interface OfferSubtypeConfig {
  sections: OfferSection[]
}

// ─── Capacity / constraint helpers ────────────────────────────────────────────

export const CAPACITY_FIELD_NAMES = [
  'capacite_max', 'capacite_salle', 'nb_places', 'max_participants',
  'capacite_vehicule', 'nb_personnes_max', 'nb_lits', 'nombre_places', 'capacite',
  'groupe_max', 'nb_lits_total', 'capacite_totale', 'capacite_simultanee',
  'capacite_par_bungalow', 'capacite_par_vehicule', 'capacite_par_bateau',
  'nb_couverts_max', 'capacite_service', 'nb_tables', 'nb_emplacements',
]

export function getCapacityLimit(fields: Record<string, any>): number | null {
  for (const key of CAPACITY_FIELD_NAMES) {
    const val = fields?.[key]
    if (val != null && !isNaN(Number(val)) && Number(val) > 0) return Number(val)
  }
  return null
}

export function getLanguesLimit(fields: Record<string, any>): string[] {
  return fields?.langues_guides ?? fields?.langues ?? fields?.langues_accueil ?? []
}

export function getNiveauxLimit(fields: Record<string, any>): string[] {
  return fields?.niveaux ?? fields?.niveaux_acceptes ?? fields?.niveaux_difficulte ?? []
}

// ─── Common block constants (Blocs 3-6) ───────────────────────────────────────

export const AVAILABILITY_TYPES = [
  { value: 'specific', label: 'Dates spécifiques', icon: 'event',
    desc: 'Choisir des dates précises' },
  { value: 'weekly',   label: 'Récurrence hebdomadaire', icon: 'view_week',
    desc: 'Mêmes jours chaque semaine' },
  { value: 'period',   label: 'Période ouverte', icon: 'date_range',
    desc: 'Du … au …' },
  { value: 'on_demand',label: 'Sur demande', icon: 'schedule',
    desc: 'Vous confirmez après contact' },
  { value: 'season',   label: 'Saison complète', icon: 'wb_sunny',
    desc: 'Disponible toute une saison' },
]

export const CONFIRMATION_TYPES = [
  { value: 'instant', label: 'Instantanée',      icon: 'bolt',          desc: 'Confirmé dès paiement' },
  { value: '24h',     label: 'Sous 24h',          icon: 'schedule',      desc: 'Validation manuelle rapide' },
  { value: '48h',     label: 'Sous 48h',          icon: 'pending',       desc: 'Validation manuelle' },
  { value: 'quote',   label: 'Devis',             icon: 'request_quote', desc: 'Vous répondez avec un prix' },
  { value: 'deposit', label: 'Avec acompte',      icon: 'payments',      desc: 'Confirmé après versement' },
]

export const CANCELLATION_POLICIES = [
  { value: 'flexible', label: 'Flexible',    desc: 'Remboursement 100 % jusqu\'à 24 h avant' },
  { value: 'moderate', label: 'Modérée',     desc: '50 % remboursé jusqu\'à 48 h avant' },
  { value: 'strict',   label: 'Stricte',     desc: 'Non remboursable' },
  { value: 'custom',   label: 'Personnalisée', desc: 'À définir ci-dessous' },
]

export const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
export const SAISONS  = ['Printemps', 'Été', 'Automne', 'Hiver']

// Kept for backward compat with /offers/new page
export const OFFER_COMMON_FIELDS: OfferSection = {
  label: 'Informations de base',
  icon: '📋',
  fields: [
    { key: 'titre',             label: 'Titre *',              type: 'text',     required: true },
    { key: 'description_courte',label: 'Description courte *', type: 'textarea', required: true, placeholder: 'Max 160 caractères' },
    { key: 'description_longue',label: 'Description détaillée',type: 'textarea' },
    { key: 'langue_offre',      label: 'Langue de l\'offre *', type: 'select',   required: true,
      dynamicOptions: 'onboarding.langues' },
  ],
}

// ─── OFFER_DETAIL_FIELDS per subtype ─────────────────────────────────────────
// Keys = subtype value from PROVIDER_SCHEMA
// Sources: user spec (Éco-Tour + Hébergement + randonnee/kayak/velo/escalade)
// Remaining subtypes keep legacy simple entries.

export const OFFER_DETAIL_FIELDS: Record<string, OfferSubtypeConfig> = {

  // ══════════════════════════════════════════════════════════════════════════
  // 🌿 ÉCO-TOUR
  // ══════════════════════════════════════════════════════════════════════════

  circuit_nature: {
    sections: [
      {
        label: 'Détails du circuit',
        fields: [
          { key: 'nom_circuit',      label: 'Nom du circuit',          type: 'text',   required: true },
          { key: 'point_depart',     label: 'Point de départ précis',  type: 'text',   required: true },
          { key: 'point_arrivee',    label: 'Point d\'arrivée',        type: 'text' },
          { key: 'distance_km',      label: 'Distance totale (km)',     type: 'number', required: true },
          { key: 'denivele_positif', label: 'Dénivelé positif (m)',     type: 'number' },
          { key: 'altitude_max',     label: 'Altitude maximale (m)',    type: 'number' },
          { key: 'type_circuit',     label: 'Type',                    type: 'select',
            options: ['Boucle', 'Aller-retour', 'Traversée'] },
          { key: 'fichier_gpx',      label: 'Tracé GPX',               type: 'file' },
          { key: 'programme_jours',  label: 'Programme jour par jour',  type: 'repeater',
            subfields: [
              { key: 'titre_jour',       label: 'Titre du jour',  type: 'text' },
              { key: 'description_jour', label: 'Description',    type: 'textarea' },
            ] },
        ],
      },
      {
        label: 'Niveau & Groupe',
        fields: [
          { key: 'niveau_offre',        label: 'Niveau de cette offre',    type: 'select',
            dynamicOptions: 'onboarding.niveaux_difficulte' },
          { key: 'nb_participants_min', label: 'Nb minimum participants',  type: 'number' },
          { key: 'nb_participants_max', label: 'Nb maximum participants',  type: 'number' },
        ],
        validations: [
          { field: 'niveau_offre',        rule: 'in',  onboardingKey: 'niveaux_difficulte',
            message: 'Ce niveau ne correspond pas aux niveaux déclarés dans votre activité.' },
          { field: 'nb_participants_max', rule: 'lte', onboardingKey: 'groupe_max',
            message: 'Ne peut pas dépasser la capacité groupe déclarée lors de l\'onboarding ({value}).' },
        ],
      },
      {
        label: 'Inclus & Conditions',
        fields: [
          { key: 'inclus',                 label: 'Prestations incluses', type: 'multiselect',
            options: ['Guide', 'Transport A/R', 'Petit-déjeuner', 'Déjeuner pique-nique',
                      'Dîner', 'Hébergement', 'Équipement', 'Assurance'] },
          { key: 'non_inclus',             label: 'Non inclus',                              type: 'textarea' },
          { key: 'equipement_obligatoire', label: 'Équipement obligatoire à apporter',       type: 'textarea' },
          { key: 'restrictions_medicales', label: 'Restrictions médicales',                  type: 'textarea' },
          { key: 'annulation_meteo',       label: 'Annulation météo possible',               type: 'boolean' },
          { key: 'points_interet',         label: 'Points d\'intérêt sur le parcours',       type: 'textarea' },
        ],
      },
    ],
  },

  safari_desert: {
    sections: [
      {
        label: 'Détails',
        fields: [
          { key: 'nom_safari',          label: 'Nom du safari',          type: 'text',   required: true },
          { key: 'region_precise',      label: 'Région précise',         type: 'text',   required: true },
          { key: 'point_rendez_vous',   label: 'Point de rendez-vous',   type: 'text',   required: true },
          { key: 'itineraire',          label: 'Itinéraire détaillé',    type: 'textarea' },
          { key: 'duree_precise',       label: 'Durée précise',          type: 'text',   required: true },
          { key: 'type_vehicule_offre', label: 'Véhicule utilisé',       type: 'select',
            dynamicOptions: 'onboarding.types_vehicules' },
          { key: 'nb_vehicules_groupe', label: 'Nb de véhicules pour ce groupe', type: 'number' },
        ],
        validations: [
          { field: 'type_vehicule_offre', rule: 'in',  onboardingKey: 'types_vehicules',
            message: 'Ce véhicule n\'est pas déclaré dans votre activité.' },
          { field: 'nb_participants_max', rule: 'lte', onboardingKey: 'capacite_max',
            message: 'Dépasse la capacité maximale déclarée ({value}).' },
        ],
      },
      {
        label: 'Bivouac',
        conditionalOn: { onboardingKey: 'bivouac', value: true },
        fields: [
          { key: 'avec_bivouac',      label: 'Bivouac inclus',   type: 'boolean' },
          { key: 'type_bivouac_offre',label: 'Type de bivouac',  type: 'select',
            options: ['Tente berbère', 'À la belle étoile', 'Les deux'],
            conditionalOn: { field: 'avec_bivouac', value: true } },
          { key: 'menu_bivouac',      label: 'Menu au bivouac',  type: 'textarea',
            conditionalOn: { field: 'avec_bivouac', value: true } },
        ],
        validations: [
          { field: 'avec_bivouac', rule: 'requiredIfFalse', onboardingKey: 'bivouac',
            message: 'Vous n\'avez pas déclaré de bivouac dans votre activité.' },
        ],
      },
      {
        label: 'Animation & Conditions',
        fields: [
          { key: 'animations_incluses',   label: 'Animations incluses',          type: 'multiselect',
            options: ['Musique traditionnelle', 'Observation étoiles', 'Conte du désert', 'Thé berbère'] },
          { key: 'nb_participants_min',   label: 'Nb minimum',                   type: 'number' },
          { key: 'nb_participants_max',   label: 'Nb maximum',                   type: 'number' },
          { key: 'age_minimum',           label: 'Âge minimum',                  type: 'number' },
          { key: 'poids_maximum_kg',      label: 'Poids maximum (kg, si dromadaire)', type: 'number' },
          { key: 'contre_indications',    label: 'Contre-indications médicales', type: 'textarea' },
        ],
      },
    ],
  },

  observation_faune: {
    sections: [
      {
        label: 'Cette sortie',
        fields: [
          { key: 'titre_sortie',    label: 'Titre de la sortie',        type: 'text',     required: true },
          { key: 'especes_cibles',  label: 'Espèces cibles',            type: 'multiselect',
            dynamicOptions: 'onboarding.especes_phares' },
          { key: 'lieu_precis',     label: 'Lieu précis d\'observation', type: 'text',    required: true },
          { key: 'heure_depart',    label: 'Heure de départ',           type: 'select',
            options: ['Aube (5h-7h)', 'Matin (7h-10h)', 'Crépuscule (17h-20h)', 'Nuit (20h+)'] },
          { key: 'duree',           label: 'Durée',                     type: 'text',     required: true },
          { key: 'type_deplacement',label: 'Type de déplacement',       type: 'select',
            options: ['À pied', 'Véhicule', 'Barque', 'Mixte'] },
        ],
        validations: [
          { field: 'especes_cibles',      rule: 'subset', onboardingKey: 'especes_phares',
            message: 'Ces espèces ne figurent pas dans celles déclarées dans votre activité.' },
          { field: 'nb_participants_max', rule: 'lte',    onboardingKey: 'groupe_max',
            message: 'Dépasse la taille de groupe maximale déclarée ({value}).' },
        ],
      },
      {
        label: 'Équipement & Programme',
        fields: [
          { key: 'equipement_fourni',  label: 'Équipement fourni',       type: 'multiselect',
            options: ['Jumelles', 'Longue-vue', 'Fiches espèces', 'Application identification'] },
          { key: 'programme',          label: 'Programme détaillé',      type: 'textarea' },
          { key: 'niveau_marche',      label: 'Niveau de marche requis', type: 'select',
            options: ['Aucun', 'Léger', 'Modéré'] },
          { key: 'silence_obligatoire',label: 'Silence obligatoire',     type: 'boolean' },
          { key: 'tenue_recommandee',  label: 'Tenue recommandée',       type: 'textarea' },
          { key: 'nb_participants_min',label: 'Nb minimum',              type: 'number' },
          { key: 'nb_participants_max',label: 'Nb maximum',              type: 'number' },
        ],
      },
    ],
  },

  observation_etoiles: {
    sections: [
      {
        label: 'La séance',
        fields: [
          { key: 'titre',       label: 'Titre',              type: 'text', required: true },
          { key: 'site_offre',  label: 'Site d\'observation', type: 'select',
            dynamicOptions: 'onboarding.sites_observation' },
          { key: 'heure_debut', label: 'Heure de début',    type: 'time', required: true },
          { key: 'duree',       label: 'Durée',              type: 'text', required: true },
          { key: 'theme_soiree',label: 'Thème',              type: 'select',
            options: ['Planètes', 'Constellations', 'Météorites', 'Lune', 'Libre'] },
        ],
        validations: [
          { field: 'site_offre',          rule: 'in',  onboardingKey: 'sites_observation',
            message: 'Ce site n\'est pas déclaré dans votre activité.' },
          { field: 'nb_participants_max', rule: 'lte', onboardingKey: 'capacite_max',
            message: 'Dépasse la capacité maximale déclarée ({value}).' },
        ],
      },
      {
        label: 'Équipement & Confort',
        fields: [
          { key: 'nb_telescopes',      label: 'Nb de télescopes',       type: 'number' },
          { key: 'type_telescopes',    label: 'Type(s) de télescopes',  type: 'text' },
          { key: 'cartes_celestes',    label: 'Cartes célestes fournies', type: 'boolean' },
          { key: 'confort_inclus',     label: 'Confort inclus',         type: 'multiselect',
            options: ['Boissons chaudes', 'Couvertures', 'Chaises / tapis', 'Transport'] },
          { key: 'nb_participants_min',label: 'Nb minimum',             type: 'number' },
          { key: 'nb_participants_max',label: 'Nb maximum',             type: 'number' },
        ],
      },
    ],
  },

  speleologie: {
    sections: [
      {
        label: 'Le parcours',
        fields: [
          { key: 'titre',               label: 'Titre',                    type: 'text',   required: true },
          { key: 'grotte_site',         label: 'Grotte / site',            type: 'select',
            dynamicOptions: 'onboarding.sites_disponibles' },
          { key: 'niveau_offre',        label: 'Niveau',                   type: 'select',
            dynamicOptions: 'onboarding.niveaux' },
          { key: 'longueur_m',          label: 'Longueur du parcours (m)', type: 'number', required: true },
          { key: 'profondeur_max_m',    label: 'Profondeur maximale (m)',  type: 'number', required: true },
          { key: 'duree',               label: 'Durée totale',             type: 'text',   required: true },
          { key: 'description_parcours',label: 'Description',              type: 'textarea' },
          { key: 'points_remarquables', label: 'Points remarquables',      type: 'textarea' },
        ],
        validations: [
          { field: 'grotte_site',         rule: 'in',  onboardingKey: 'sites_disponibles',
            message: 'Ce site n\'est pas déclaré dans votre activité.' },
          { field: 'niveau_offre',        rule: 'in',  onboardingKey: 'niveaux',
            message: 'Ce niveau n\'est pas proposé dans votre activité.' },
          { field: 'nb_participants_max', rule: 'lte', onboardingKey: 'capacite_max',
            message: 'Dépasse la capacité maximale déclarée ({value}).' },
        ],
      },
      {
        label: 'Sécurité & Équipement',
        fields: [
          { key: 'equipement_fourni',    label: 'Équipement fourni',         type: 'multiselect',
            options: ['Casque', 'Lampe frontale', 'Combinaison', 'Baudrier', 'Corde'] },
          { key: 'restrictions_medicales',label: 'Restrictions médicales',   type: 'textarea', required: true },
          { key: 'age_minimum',          label: 'Âge minimum',               type: 'number' },
          { key: 'condition_physique',   label: 'Condition physique requise', type: 'select',
            options: ['Aucune', 'Bonne', 'Très bonne'] },
          { key: 'briefing_securite',    label: 'Briefing sécurité inclus',  type: 'boolean', required: true },
          { key: 'nb_participants_min',  label: 'Nb minimum',                type: 'number' },
          { key: 'nb_participants_max',  label: 'Nb maximum',                type: 'number' },
        ],
      },
    ],
  },

  visite_oasis: {
    sections: [
      {
        label: 'La visite',
        fields: [
          { key: 'titre',                   label: 'Titre',                        type: 'text',     required: true },
          { key: 'oasis_visitee',           label: 'Oasis visitée',               type: 'select',
            dynamicOptions: 'onboarding.oasis_couvertes' },
          { key: 'duree',                   label: 'Durée',                        type: 'text',     required: true },
          { key: 'itineraire',              label: 'Itinéraire dans l\'oasis',     type: 'textarea' },
          { key: 'activites_incluses',      label: 'Activités incluses',           type: 'multiselect',
            options: ['Cueillette dattes', 'Balade en calèche', 'Rencontre agriculteurs',
                      'Dégustation produits', 'Explication foggara'] },
          { key: 'transport_depuis_ville',  label: 'Transport depuis ville inclus', type: 'boolean' },
          { key: 'inclus',                  label: 'Inclus',                       type: 'multiselect',
            options: ['Guide', 'Thé traditionnel', 'Photos souvenir'] },
          { key: 'nb_participants_min',     label: 'Nb minimum',                   type: 'number' },
          { key: 'nb_participants_max',     label: 'Nb maximum',                   type: 'number' },
        ],
        validations: [
          { field: 'oasis_visitee',         rule: 'in',          onboardingKey: 'oasis_couvertes',
            message: 'Cette oasis n\'est pas déclarée dans votre activité.' },
          { field: 'transport_depuis_ville',rule: 'requiredIfFalse', onboardingKey: 'transport_propre',
            message: 'Vous n\'avez pas déclaré de transport dans votre activité.' },
        ],
      },
    ],
  },

  circuit_montagne: {
    sections: [
      {
        label: 'Le circuit',
        fields: [
          { key: 'nom_circuit',    label: 'Nom du circuit',        type: 'text',   required: true },
          { key: 'massif_concerne',label: 'Massif concerné',       type: 'text',   required: true },
          { key: 'point_depart',   label: 'Point de départ',       type: 'text',   required: true },
          { key: 'distance_km',    label: 'Distance (km)',          type: 'number', required: true },
          { key: 'denivele_m',     label: 'Dénivelé positif (m)',  type: 'number', required: true },
          { key: 'niveau_offre',   label: 'Niveau',                type: 'select',
            dynamicOptions: 'onboarding.niveaux' },
          { key: 'duree',          label: 'Durée',                 type: 'text',   required: true },
          { key: 'type_circuit',   label: 'Type',                  type: 'select',
            options: ['Boucle', 'Aller-retour', 'Traversée'] },
          { key: 'fichier_gpx',    label: 'Tracé GPX',             type: 'file' },
        ],
        validations: [
          { field: 'niveau_offre', rule: 'in', onboardingKey: 'niveaux',
            message: 'Ce niveau n\'est pas proposé dans votre activité.' },
        ],
      },
      {
        label: 'Refuge',
        conditionalOn: { onboardingKey: 'refuge_disponible', value: true },
        fields: [
          { key: 'refuge_inclus',          label: 'Refuge / hébergement inclus', type: 'boolean' },
          { key: 'nom_refuge',             label: 'Nom du refuge',              type: 'text',
            conditionalOn: { field: 'refuge_inclus', value: true } },
          { key: 'type_hebergement_refuge',label: 'Type',                       type: 'select',
            options: ['Refuge gardé', 'Gîte d\'étape', 'Bivouac organisé'],
            conditionalOn: { field: 'refuge_inclus', value: true } },
          { key: 'repas_refuge',           label: 'Repas inclus au refuge',     type: 'boolean',
            conditionalOn: { field: 'refuge_inclus', value: true } },
        ],
        validations: [
          { field: 'refuge_inclus', rule: 'requiredIfFalse', onboardingKey: 'refuge_disponible',
            message: 'Vous n\'avez pas déclaré de refuge dans votre activité.' },
        ],
      },
      {
        label: 'Inclus & Conditions',
        fields: [
          { key: 'inclus',                 label: 'Inclus',                      type: 'multiselect',
            options: ['Guide certifié', 'Transport', 'Pique-nique', 'Équipement',
                      'Hébergement', 'Demi-pension', 'Assurance'] },
          { key: 'equipement_obligatoire', label: 'Équipement obligatoire',      type: 'textarea' },
          { key: 'points_interet',         label: 'Points d\'intérêt',           type: 'textarea' },
          { key: 'annulation_meteo',       label: 'Annulation météo possible',   type: 'boolean' },
          { key: 'nb_participants_min',    label: 'Nb minimum',                  type: 'number' },
          { key: 'nb_participants_max',    label: 'Nb maximum',                  type: 'number' },
        ],
      },
    ],
  },

  tour_cotier: {
    sections: [
      {
        label: 'Le tour',
        fields: [
          { key: 'titre',                 label: 'Titre',                          type: 'text',   required: true },
          { key: 'port_depart',           label: 'Port / lieu de départ',          type: 'text',   required: true },
          { key: 'type_embarcation_offre',label: 'Type d\'embarcation',            type: 'select',
            dynamicOptions: 'onboarding.types_embarcations' },
          { key: 'nb_personnes_offre',    label: 'Nb de personnes',                type: 'number', required: true },
          { key: 'duree',                 label: 'Durée',                          type: 'text',   required: true },
          { key: 'itineraire',            label: 'Itinéraire (caps, criques, îles)', type: 'textarea' },
        ],
        validations: [
          { field: 'type_embarcation_offre', rule: 'in',  onboardingKey: 'types_embarcations',
            message: 'Cette embarcation n\'est pas déclarée dans votre activité.' },
          { field: 'nb_personnes_offre',     rule: 'lte', onboardingKey: 'capacite_totale',
            message: 'Dépasse la capacité totale déclarée ({value}).' },
        ],
      },
      {
        label: 'À bord',
        fields: [
          { key: 'activites_incluses',    label: 'Activités incluses',  type: 'multiselect',
            dynamicOptions: 'onboarding.activites_nautiques' },
          { key: 'equipement_bord',       label: 'Équipement fourni',   type: 'multiselect',
            options: ['Masques / tubas', 'Gilets de sauvetage', 'Lignes de pêche', 'Bouées'] },
          { key: 'arrets_baignade',       label: 'Arrêts baignade',     type: 'boolean' },
          { key: 'nb_arrets',             label: 'Nombre d\'arrêts',    type: 'number',
            conditionalOn: { field: 'arrets_baignade', value: true } },
          { key: 'restauration_bord',     label: 'Restauration à bord', type: 'boolean' },
          { key: 'menu_bord',             label: 'Menu / boissons',     type: 'textarea',
            conditionalOn: { field: 'restauration_bord', value: true } },
          { key: 'privatisation_possible',label: 'Privatisation possible', type: 'boolean' },
        ],
        validations: [
          { field: 'activites_incluses', rule: 'subset', onboardingKey: 'activites_nautiques',
            message: 'Ces activités ne sont pas déclarées dans votre activité.' },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 🏨 HÉBERGEMENT
  // ══════════════════════════════════════════════════════════════════════════

  dortoir: {
    sections: [
      {
        label: 'Ce lit',
        fields: [
          { key: 'nb_lits_offre', label: 'Nb de lits proposés', type: 'number', required: true },
          { key: 'type_lit',      label: 'Type de lit',         type: 'select',
            options: ['Simple', 'Superposé haut', 'Superposé bas'] },
          { key: 'dortoir_genre', label: 'Dortoir concerné',    type: 'select',
            dynamicOptions: 'onboarding.type_dortoir' },
        ],
        validations: [
          { field: 'nb_lits_offre', rule: 'lte', onboardingKey: 'nb_lits_total',
            message: 'Dépasse le nombre total de lits déclaré ({value}).' },
          { field: 'dortoir_genre', rule: 'in',  onboardingKey: 'type_dortoir',
            message: 'Ce type de dortoir n\'est pas disponible dans votre activité.' },
        ],
      },
      {
        label: 'Inclus',
        fields: [
          { key: 'inclus', label: 'Inclus dans le prix', type: 'multiselect',
            options: ['Linge de lit', 'Serviette', 'Cadenas casier', 'Petit-déjeuner', 'Accès cuisine'] },
        ],
      },
      {
        label: 'Horaires',
        fields: [
          { key: 'checkin_debut',     label: 'Check-in à partir de',  type: 'time', required: true },
          { key: 'checkin_fin',       label: 'Check-in jusqu\'à',     type: 'time', required: true },
          { key: 'checkout',          label: 'Check-out avant',        type: 'time', required: true },
          { key: 'couvre_feu',        label: 'Couvre-feu',            type: 'time' },
          { key: 'silence_partir_de', label: 'Silence à partir de',   type: 'time' },
        ],
      },
    ],
  },

  chambre_standard: {
    sections: [
      {
        label: 'La chambre',
        fields: [
          { key: 'nom_chambre',  label: 'Nom / numéro',   type: 'text',   required: true },
          { key: 'surface_m2',   label: 'Surface (m²)',    type: 'number' },
          { key: 'etage',        label: 'Étage',           type: 'number' },
          { key: 'vue',          label: 'Vue',             type: 'select',
            options: ['Jardin', 'Piscine', 'Mer', 'Montagne', 'Rue', 'Cour intérieure'] },
          { key: 'type_lit_offre',label: 'Type de lit',   type: 'select',
            dynamicOptions: 'onboarding.types_lits' },
          { key: 'nb_couchages', label: 'Nb de couchages', type: 'number', required: true },
        ],
        validations: [
          { field: 'type_lit_offre', rule: 'in',  onboardingKey: 'types_lits',
            message: 'Ce type de lit n\'est pas déclaré dans votre activité.' },
          { field: 'nb_couchages',   rule: 'lte', onboardingKey: 'capacite_max',
            message: 'Dépasse la capacité maximale déclarée ({value}).' },
        ],
      },
      {
        label: 'Salle de bain & Équipements',
        fields: [
          { key: 'sdb_type',          label: 'Salle de bain',       type: 'select',
            options: ['Privée', 'Partagée'] },
          { key: 'sdb_equipements',   label: 'Équipements sdb',     type: 'multiselect',
            options: ['Baignoire', 'Douche', 'Sèche-cheveux', 'Bidet'] },
          { key: 'equipements_chambre',label: 'Équipements chambre', type: 'multiselect',
            options: ['Climatisation', 'Chauffage', 'TV', 'Minibar', 'Coffre-fort',
                      'Bureau', 'Balcon', 'Wifi dédié', 'Bouilloire'] },
        ],
      },
      {
        label: 'Restauration & Horaires',
        fields: [
          { key: 'formule_restauration',  label: 'Formule restauration', type: 'select',
            options: ['Sans restauration', 'Petit-déjeuner', 'Demi-pension', 'Pension complète'] },
          { key: 'type_petit_dej',        label: 'Type de petit-déjeuner', type: 'select',
            options: ['Continental', 'Buffet', 'Fait maison', 'Tunisien traditionnel'],
            conditionalOn: { field: 'formule_restauration', notValue: 'Sans restauration' } },
          { key: 'checkin_debut',         label: 'Check-in à partir de',  type: 'time', required: true },
          { key: 'checkin_fin',           label: 'Check-in jusqu\'à',     type: 'time', required: true },
          { key: 'checkout',              label: 'Check-out avant',        type: 'time', required: true },
          { key: 'checkin_tardif',        label: 'Check-in tardif possible', type: 'boolean' },
          { key: 'checkin_tardif_heure',  label: 'Jusqu\'à quelle heure', type: 'time',
            conditionalOn: { field: 'checkin_tardif', value: true } },
          { key: 'early_checkin',         label: 'Early check-in possible', type: 'boolean' },
          { key: 'pmr_chambre',           label: 'Chambre accessible PMR', type: 'boolean' },
        ],
        validations: [
          { field: 'pmr_chambre', rule: 'requiredIfFalse', onboardingKey: 'pmr',
            message: 'Vous n\'avez pas déclaré d\'accessibilité PMR dans votre activité.' },
        ],
      },
    ],
  },

  chambre_superieure: {
    sections: [
      {
        label: 'La chambre',
        fields: [
          { key: 'nom_chambre',           label: 'Nom',                              type: 'text',   required: true },
          { key: 'surface_m2',            label: 'Surface (m²)',                     type: 'number' },
          { key: 'etage',                 label: 'Étage',                            type: 'number' },
          { key: 'vue',                   label: 'Vue',                              type: 'select',
            options: ['Mer', 'Montagne', 'Jardin', 'Piscine', 'Panoramique', 'Désert'] },
          { key: 'caracteristiques_offre',label: 'Caractéristiques distinctives',   type: 'multiselect',
            dynamicOptions: 'onboarding.caracteristiques' },
          { key: 'sdb_equipements',       label: 'Équipements sdb',                 type: 'multiselect',
            options: ['Baignoire', 'Douche italienne', 'Jacuzzi', 'Double vasque',
                      'Produits luxe', 'Sèche-cheveux pro'] },
        ],
        validations: [
          { field: 'caracteristiques_offre', rule: 'subset', onboardingKey: 'caracteristiques',
            message: 'Ces caractéristiques ne sont pas déclarées dans votre activité.' },
        ],
      },
      {
        label: 'Services & Horaires',
        fields: [
          { key: 'services_offre',   label: 'Services inclus',          type: 'multiselect',
            dynamicOptions: 'onboarding.services_premium' },
          { key: 'petit_dej_type',   label: 'Type de petit-déjeuner',   type: 'select',
            options: ['Continental', 'Buffet', 'Fait maison', 'Gastronomique'] },
          { key: 'checkin_debut',    label: 'Check-in à partir de',     type: 'time', required: true },
          { key: 'checkout',         label: 'Check-out avant',          type: 'time', required: true },
          { key: 'checkin_tardif',   label: 'Check-in tardif',          type: 'boolean' },
          { key: 'early_checkin',    label: 'Early check-in',           type: 'boolean' },
          { key: 'pmr_chambre',      label: 'Accessible PMR',           type: 'boolean' },
        ],
        validations: [
          { field: 'services_offre', rule: 'subset',         onboardingKey: 'services_premium',
            message: 'Ces services ne sont pas déclarés dans votre activité.' },
          { field: 'petit_dej_type', rule: 'requiredIfFalse', onboardingKey: 'petit_dej_inclus',
            message: 'Vous n\'avez pas déclaré le petit-déjeuner dans votre activité.' },
        ],
      },
    ],
  },

  suite: {
    sections: [
      {
        label: 'La suite',
        fields: [
          { key: 'nom_suite',          label: 'Nom',                     type: 'text',   required: true },
          { key: 'surface_m2',         label: 'Surface (m²)',            type: 'number' },
          { key: 'nb_pieces',          label: 'Nb de pièces',            type: 'number' },
          { key: 'vue',                label: 'Vue',                     type: 'select',
            options: ['Mer', 'Montagne', 'Jardin', 'Piscine', 'Panoramique 360°', 'Désert'] },
          { key: 'espaces_suite',      label: 'Espaces disponibles',     type: 'multiselect',
            dynamicOptions: 'onboarding.espaces_distincts' },
          { key: 'services_offre',     label: 'Services inclus',         type: 'multiselect',
            dynamicOptions: 'onboarding.services_inclus' },
          { key: 'privatisation_offre',label: 'Privatisation possible',  type: 'boolean' },
        ],
        validations: [
          { field: 'espaces_suite',      rule: 'subset',         onboardingKey: 'espaces_distincts',
            message: 'Ces espaces ne sont pas déclarés dans votre activité.' },
          { field: 'services_offre',     rule: 'subset',         onboardingKey: 'services_inclus',
            message: 'Ces services ne sont pas déclarés dans votre activité.' },
          { field: 'privatisation_offre',rule: 'requiredIfFalse', onboardingKey: 'privatisation',
            message: 'Vous n\'avez pas déclaré la privatisation dans votre activité.' },
        ],
      },
      {
        label: 'Horaires',
        fields: [
          { key: 'checkin_debut',  label: 'Check-in à partir de', type: 'time', required: true },
          { key: 'checkout',       label: 'Check-out avant',      type: 'time', required: true },
          { key: 'checkin_tardif', label: 'Check-in tardif',      type: 'boolean' },
          { key: 'early_checkin',  label: 'Early check-in',       type: 'boolean' },
        ],
      },
    ],
  },

  bungalow: {
    sections: [
      {
        label: 'Ce bungalow',
        fields: [
          { key: 'nom_bungalow',      label: 'Nom',                    type: 'text',   required: true },
          { key: 'surface_m2',        label: 'Surface (m²)',            type: 'number' },
          { key: 'vue',               label: 'Vue',                    type: 'text' },
          { key: 'capacite_offre',    label: 'Capacité (personnes)',    type: 'number', required: true },
          { key: 'configuration_lits',label: 'Configuration des lits', type: 'text' },
          { key: 'sdb_type',          label: 'Salle de bain',          type: 'select',
            options: ['Privée intérieure', 'Privée extérieure', 'Partagée'] },
          { key: 'equipements_offre', label: 'Équipements',            type: 'multiselect',
            dynamicOptions: 'onboarding.equipements' },
        ],
        validations: [
          { field: 'capacite_offre',    rule: 'lte',    onboardingKey: 'capacite_par_bungalow',
            message: 'Dépasse la capacité par bungalow déclarée ({value}).' },
          { field: 'equipements_offre', rule: 'subset', onboardingKey: 'equipements',
            message: 'Ces équipements ne sont pas déclarés dans votre activité.' },
        ],
      },
      {
        label: 'Services & Règles',
        fields: [
          { key: 'inclus',         label: 'Inclus',                  type: 'multiselect',
            options: ['Petit-déjeuner', 'Ménage quotidien', 'Linge de maison', 'Kit de bienvenue'] },
          { key: 'animaux_offre',  label: 'Animaux acceptés',        type: 'boolean' },
          { key: 'checkin_debut',  label: 'Check-in à partir de',   type: 'time', required: true },
          { key: 'checkout',       label: 'Check-out avant',         type: 'time', required: true },
        ],
        validations: [
          { field: 'animaux_offre', rule: 'requiredIfFalse', onboardingKey: 'animaux_acceptes',
            message: 'Vous n\'avez pas déclaré l\'accueil des animaux dans votre activité.' },
        ],
      },
    ],
  },

  tente_glamping: {
    sections: [
      {
        label: 'La tente',
        fields: [
          { key: 'nom_tente',       label: 'Nom de la tente',      type: 'text',   required: true },
          { key: 'type_tente_offre',label: 'Type de tente',        type: 'select',
            dynamicOptions: 'onboarding.types_tentes' },
          { key: 'surface_m2',      label: 'Surface (m²)',          type: 'number' },
          { key: 'capacite_offre',  label: 'Capacité (personnes)', type: 'number' },
          { key: 'vue',             label: 'Vue depuis la tente',  type: 'text' },
        ],
        validations: [
          { field: 'type_tente_offre', rule: 'in', onboardingKey: 'types_tentes',
            message: 'Ce type de tente n\'est pas déclaré dans votre activité.' },
        ],
      },
      {
        label: 'Confort',
        fields: [
          { key: 'configuration_lit',     label: 'Configuration du lit',      type: 'select',
            options: ['Grand lit double', '2 lits séparés', 'Matelas au sol'] },
          { key: 'qualite_literie',       label: 'Qualité literie',           type: 'select',
            options: ['Standard', 'Confort', 'Luxe'] },
          { key: 'linge_fourni',          label: 'Linge fourni',              type: 'boolean' },
          { key: 'eclairage',             label: 'Éclairage',                 type: 'multiselect',
            options: ['Guirlandes', 'LED', 'Lanternes', 'Bougies LED'] },
          { key: 'prise_electrique_offre',label: 'Prise électrique',          type: 'boolean' },
          { key: 'ventilateur_chauffage', label: 'Ventilateur / Chauffage',   type: 'boolean' },
          { key: 'sanitaires_offre',      label: 'Sanitaires',                type: 'select',
            dynamicOptions: 'onboarding.sanitaires' },
          { key: 'distance_sanitaires_m', label: 'Distance sanitaires (m)',   type: 'number',
            conditionalOn: { field: 'sanitaires_offre', value: 'Partagés' } },
        ],
        validations: [
          { field: 'prise_electrique_offre', rule: 'requiredIfFalse', onboardingKey: 'electricite',
            message: 'Vous n\'avez pas déclaré d\'électricité dans les tentes.' },
        ],
      },
      {
        label: 'Expériences & Horaires',
        fields: [
          { key: 'experiences_incluses', label: 'Expériences incluses', type: 'multiselect',
            options: ['Petit-déj livré à la tente', 'Feu de camp privatif', 'Panier bienvenue',
                      'Hamac privatif', 'Accès piscine', 'Douche solaire'] },
          { key: 'checkin_debut',        label: 'Check-in à partir de', type: 'time', required: true },
          { key: 'checkout',             label: 'Check-out avant',      type: 'time', required: true },
        ],
      },
    ],
  },

  gite_rural: {
    sections: [
      {
        label: 'Le gîte',
        fields: [
          { key: 'nom_gite',         label: 'Nom du gîte',          type: 'text',   required: true },
          { key: 'surface_m2',       label: 'Surface (m²)',          type: 'number' },
          { key: 'nb_chambres_gite', label: 'Nb de chambres',        type: 'number' },
          { key: 'capacite_offre',   label: 'Capacité totale',       type: 'number', required: true },
          { key: 'vue',              label: 'Vue / environnement',   type: 'text' },
        ],
        validations: [
          { field: 'capacite_offre', rule: 'lte', onboardingKey: 'capacite_totale',
            message: 'Dépasse la capacité totale déclarée ({value}).' },
        ],
      },
      {
        label: 'Équipements & Services',
        fields: [
          { key: 'equipements_cuisine',  label: 'Équipements cuisine',    type: 'multiselect',
            options: ['Cuisinière', 'Four', 'Réfrigérateur', 'Lave-vaisselle',
                      'Micro-ondes', 'Cafetière', 'Grille-pain'] },
          { key: 'equipements_generaux', label: 'Équipements généraux',   type: 'multiselect',
            options: ['TV', 'Wifi', 'Climatisation', 'Chauffage', 'Lave-linge',
                      'Terrasse', 'Jardin privatif', 'Parking'] },
          { key: 'table_hotes_offre',    label: 'Table d\'hôtes incluse', type: 'boolean' },
          { key: 'panier_local',         label: 'Panier produits locaux à l\'arrivée', type: 'boolean' },
          { key: 'animaux_offre',        label: 'Animaux acceptés',        type: 'boolean' },
          { key: 'checkin_debut',        label: 'Check-in à partir de',   type: 'time', required: true },
          { key: 'checkout',             label: 'Check-out avant',         type: 'time', required: true },
        ],
        validations: [
          { field: 'table_hotes_offre', rule: 'requiredIfFalse', onboardingKey: 'table_hotes',
            message: 'Vous n\'avez pas déclaré de table d\'hôtes dans votre activité.' },
          { field: 'animaux_offre',     rule: 'requiredIfFalse', onboardingKey: 'animaux_acceptes',
            message: 'Vous n\'avez pas déclaré l\'accueil des animaux dans votre activité.' },
        ],
      },
    ],
  },

  maison_hotes: {
    sections: [
      {
        label: 'La chambre',
        fields: [
          { key: 'nom_chambre', label: 'Nom de la chambre', type: 'text', required: true },
          { key: 'surface_m2',  label: 'Surface (m²)',      type: 'number' },
          { key: 'vue',         label: 'Vue',               type: 'text' },
          { key: 'type_lit',    label: 'Type de lit',       type: 'select',
            options: ['Simple', 'Double', 'Twin', 'King'] },
          { key: 'sdb_type',    label: 'Salle de bain',     type: 'select',
            options: ['Privée', 'Partagée'] },
          { key: 'nb_personnes',label: 'Nb de personnes',   type: 'number' },
        ],
      },
      {
        label: 'L\'expérience chez l\'habitant',
        fields: [
          { key: 'langue_hote_offre',    label: 'Langue de l\'hôte',          type: 'select',
            dynamicOptions: 'onboarding.langues_hotes' },
          { key: 'table_hotes_offre',    label: 'Table d\'hôtes incluse',      type: 'boolean' },
          { key: 'nb_repas_inclus',      label: 'Nb de repas inclus',          type: 'number',
            conditionalOn: { field: 'table_hotes_offre', value: true } },
          { key: 'menu_type',            label: 'Menu type',                   type: 'textarea',
            conditionalOn: { field: 'table_hotes_offre', value: true } },
          { key: 'petit_dej_maison',     label: 'Petit-déjeuner fait maison', type: 'boolean' },
          { key: 'espaces_communs_offre',label: 'Accès espaces communs',       type: 'multiselect',
            dynamicOptions: 'onboarding.espaces_communs' },
        ],
        validations: [
          { field: 'langue_hote_offre',    rule: 'in',          onboardingKey: 'langues_hotes',
            message: 'Cette langue n\'est pas déclarée dans votre activité.' },
          { field: 'table_hotes_offre',    rule: 'requiredIfFalse', onboardingKey: 'table_hotes',
            message: 'Vous n\'avez pas déclaré de table d\'hôtes dans votre activité.' },
          { field: 'espaces_communs_offre',rule: 'subset',       onboardingKey: 'espaces_communs',
            message: 'Ces espaces ne sont pas déclarés dans votre activité.' },
        ],
      },
      {
        label: 'Règles',
        fields: [
          { key: 'heure_arrivee',  label: 'Heure d\'arrivée souhaitée',        type: 'time', required: true },
          { key: 'heure_depart',   label: 'Heure de départ',                   type: 'time', required: true },
          { key: 'animaux_chambre',label: 'Animaux acceptés dans la chambre',  type: 'boolean' },
          { key: 'fumeurs',        label: 'Fumeurs acceptés',                   type: 'boolean' },
        ],
      },
    ],
  },

  riad_traditionnel: {
    sections: [
      {
        label: 'La chambre',
        fields: [
          { key: 'nom_chambre',  label: 'Nom',                type: 'text',   required: true },
          { key: 'surface_m2',   label: 'Surface (m²)',        type: 'number' },
          { key: 'type_chambre', label: 'Type',               type: 'select',
            options: ['Standard', 'Supérieure', 'Suite', 'Vue patio'] },
          { key: 'vue',          label: 'Vue',                type: 'select',
            options: ['Patio', 'Terrasse', 'Jardin', 'Toit-terrasse', 'Ruelle'] },
          { key: 'type_lit',     label: 'Type de lit',        type: 'select',
            options: ['Simple', 'Double', 'Twin', 'King'] },
          { key: 'capacite_offre',label: 'Capacité',          type: 'number' },
          { key: 'style_deco',   label: 'Style de décoration', type: 'text' },
          { key: 'equipements',  label: 'Équipements',        type: 'multiselect',
            options: ['Climatisation', 'Wifi', 'TV', 'Coffre-fort',
                      'Moucharabieh', 'Zellige', 'Fontaine privée'] },
        ],
      },
      {
        label: 'Services & Horaires',
        fields: [
          { key: 'petit_dej_traditionnel',label: 'Petit-déjeuner traditionnel inclus', type: 'boolean' },
          { key: 'acces_hammam_offre',    label: 'Accès hammam inclus',               type: 'boolean' },
          { key: 'restauration_offre',    label: 'Restauration sur place',             type: 'boolean' },
          { key: 'accueil_the',           label: 'Accueil thé / jus à l\'arrivée',    type: 'boolean' },
          { key: 'checkin_debut',         label: 'Check-in à partir de',              type: 'time', required: true },
          { key: 'checkout',              label: 'Check-out avant',                   type: 'time', required: true },
        ],
        validations: [
          { field: 'acces_hammam_offre', rule: 'requiredIfFalse', onboardingKey: 'hammam_prive',
            message: 'Vous n\'avez pas déclaré de hammam dans votre activité.' },
          { field: 'restauration_offre', rule: 'requiredIfFalse', onboardingKey: 'restauration',
            message: 'Vous n\'avez pas déclaré de restauration dans votre activité.' },
        ],
      },
    ],
  },

  ecolodge: {
    sections: [
      {
        label: 'L\'unité',
        fields: [
          { key: 'nom_unite',         label: 'Nom de l\'unité',               type: 'text',   required: true },
          { key: 'type_unite',        label: 'Type',                           type: 'select',
            options: ['Cabane', 'Bungalow', 'Suite', 'Tente'] },
          { key: 'surface_m2',        label: 'Surface (m²)',                   type: 'number' },
          { key: 'capacite_offre',    label: 'Capacité',                       type: 'number' },
          { key: 'description_unique',label: 'Ce qui rend cette unité unique', type: 'textarea' },
          { key: 'eco_equipements',   label: 'Éco-équipements',                type: 'multiselect',
            options: ['Panneau solaire dédié', 'Eau chaude solaire', 'Composteur',
                      'Produits biodégradables', 'Zéro plastique'] },
        ],
      },
      {
        label: 'Restauration & Expériences',
        fields: [
          { key: 'restauration_offre',label: 'Formule restauration',       type: 'select',
            options: ['Sans restauration', 'Petit-déjeuner bio local',
                      'Demi-pension locale', 'Panier produits locaux'] },
          { key: 'experiences_eco',   label: 'Expériences éco incluses',   type: 'multiselect',
            options: ['Visite potager', 'Initiation compostage', 'Balade guidée',
                      'Atelier cuisine', 'Plantation d\'un arbre'] },
          { key: 'checkin_debut',     label: 'Check-in à partir de',       type: 'time', required: true },
          { key: 'checkout',          label: 'Check-out avant',             type: 'time', required: true },
        ],
        validations: [
          { field: 'restauration_offre', rule: 'requiredIfFalse', onboardingKey: 'restauration_locale',
            message: 'Vous n\'avez pas déclaré de restauration locale dans votre activité.' },
        ],
      },
    ],
  },

  camping_sauvage: {
    sections: [
      {
        label: 'L\'emplacement',
        fields: [
          { key: 'nom_emplacement',    label: 'Référence de l\'emplacement', type: 'text' },
          { key: 'surface_m2',         label: 'Surface (m²)',                type: 'number' },
          { key: 'type_accepte_offre', label: 'Type accepté',                type: 'select',
            dynamicOptions: 'onboarding.types_acceptes' },
          { key: 'vue',                label: 'Vue / situation',             type: 'text' },
          { key: 'sol',                label: 'Type de sol',                 type: 'select',
            options: ['Herbe', 'Terre', 'Sable', 'Gravier', 'Mixte'] },
        ],
        validations: [
          { field: 'type_accepte_offre', rule: 'in', onboardingKey: 'types_acceptes',
            message: 'Ce type n\'est pas accepté selon votre activité.' },
        ],
      },
      {
        label: 'Équipements & Règles',
        fields: [
          { key: 'acces_eau_offre',   label: 'Accès eau potable',          type: 'boolean' },
          { key: 'sanitaires_offre',  label: 'Sanitaires',                 type: 'select',
            dynamicOptions: 'onboarding.type_sanitaires' },
          { key: 'feu_camp_offre',    label: 'Feu de camp autorisé',       type: 'boolean' },
          { key: 'borne_electrique',  label: 'Borne électrique',           type: 'boolean' },
          { key: 'ombre',             label: 'Emplacement ombragé',        type: 'boolean' },
          { key: 'animaux',           label: 'Animaux acceptés',           type: 'boolean' },
          { key: 'heure_arrivee',     label: 'Heure d\'arrivée',           type: 'time' },
          { key: 'heure_depart',      label: 'Heure de départ',            type: 'time' },
          { key: 'silence_partir_de', label: 'Silence à partir de',        type: 'time' },
        ],
        validations: [
          { field: 'acces_eau_offre', rule: 'requiredIfFalse', onboardingKey: 'acces_eau',
            message: 'Vous n\'avez pas déclaré d\'accès à l\'eau dans votre activité.' },
          { field: 'feu_camp_offre',  rule: 'requiredIfFalse', onboardingKey: 'feux_autorises',
            message: 'Les feux de camp ne sont pas autorisés selon votre activité.' },
        ],
      },
    ],
  },

  ferme_agritouristique: {
    sections: [
      {
        label: 'Cette offre',
        fields: [
          { key: 'titre',                  label: 'Titre',               type: 'text',   required: true },
          { key: 'type_offre',             label: 'Type',                type: 'select',
            options: ['Séjour complet', 'Journée à la ferme', 'Demi-journée', 'Activité seule'] },
          { key: 'activites_incluses',     label: 'Activités incluses',  type: 'multiselect',
            dynamicOptions: 'onboarding.activites_ferme' },
          { key: 'hebergement_type_offre', label: 'Hébergement',         type: 'select',
            dynamicOptions: 'onboarding.type_hebergement' },
          { key: 'capacite_offre',         label: 'Capacité',            type: 'number' },
        ],
        validations: [
          { field: 'activites_incluses', rule: 'subset', onboardingKey: 'activites_ferme',
            message: 'Ces activités ne sont pas déclarées dans votre activité.' },
        ],
      },
      {
        label: 'Restauration & Inclus',
        fields: [
          { key: 'repas_inclus',   label: 'Repas inclus',   type: 'multiselect',
            options: ['Petit-déjeuner fermier', 'Déjeuner produits maison',
                      'Dîner', 'Panier pique-nique'] },
          { key: 'produits_menu',  label: 'Produits phares du menu', type: 'textarea' },
          { key: 'inclus_offre',   label: 'Inclus',         type: 'multiselect',
            options: ['Visite de la ferme', 'Rencontre animaux', 'Dégustation',
                      'Cueillette libre', 'Atelier cuisine', 'Produit à emporter'] },
        ],
        validations: [
          { field: 'repas_inclus', rule: 'requiredIfFalse', onboardingKey: 'restauration_maison',
            message: 'Vous n\'avez pas déclaré de restauration maison dans votre activité.' },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 🚵 ACTIVITÉ — spécifications fournies (reste à venir)
  // ══════════════════════════════════════════════════════════════════════════

  randonnee: {
    sections: [
      {
        label: 'Cette randonnée',
        fields: [
          { key: 'nom_rando',          label: 'Nom',                  type: 'text',   required: true },
          { key: 'niveau_offre',       label: 'Niveau',               type: 'select',
            dynamicOptions: 'onboarding.niveaux' },
          { key: 'distance_km',        label: 'Distance (km)',         type: 'number', required: true },
          { key: 'denivele_m',         label: 'Dénivelé positif (m)', type: 'number' },
          { key: 'duree_estimee',      label: 'Durée estimée',        type: 'text',   required: true },
          { key: 'type_parcours',      label: 'Type',                 type: 'select',
            options: ['Boucle', 'Aller-retour', 'Traversée'] },
          { key: 'point_depart',       label: 'Point de départ précis', type: 'text', required: true },
          { key: 'point_arrivee',      label: 'Point d\'arrivée',      type: 'text' },
          { key: 'fichier_gpx',        label: 'Tracé GPX',             type: 'file' },
        ],
        validations: [
          { field: 'niveau_offre',        rule: 'in',  onboardingKey: 'niveaux',
            message: 'Ce niveau n\'est pas proposé dans votre activité.' },
          { field: 'nb_participants_max', rule: 'lte', onboardingKey: 'groupe_max',
            message: 'Dépasse la taille de groupe maximale déclarée ({value}).' },
        ],
      },
      {
        label: 'Groupe & Inclus',
        fields: [
          { key: 'nb_participants_min',    label: 'Nb minimum',                         type: 'number' },
          { key: 'nb_participants_max',    label: 'Nb maximum',                         type: 'number' },
          { key: 'inclus',                 label: 'Inclus',                             type: 'multiselect',
            options: ['Guide', 'Transport A/R', 'Pique-nique', 'Eau / collation',
                      'Bâtons de marche', 'Carte papier', 'Assurance', 'Trousse secours'] },
          { key: 'points_interet',         label: 'Points d\'intérêt',                  type: 'textarea' },
          { key: 'equipement_obligatoire', label: 'Équipement obligatoire à apporter', type: 'textarea' },
        ],
      },
    ],
  },

  kayak_canoe: {
    sections: [
      {
        label: 'Cette sortie',
        fields: [
          { key: 'titre',                label: 'Titre',                  type: 'text',   required: true },
          { key: 'parcours',             label: 'Parcours / itinéraire',  type: 'textarea', required: true },
          { key: 'distance_km',          label: 'Distance (km)',           type: 'number' },
          { key: 'duree',                label: 'Durée',                  type: 'text',   required: true },
          { key: 'niveau_offre',         label: 'Niveau requis',          type: 'select',
            options: ['Débutant', 'Intermédiaire', 'Avancé'] },
          { key: 'type_embarcation_offre',label: 'Type d\'embarcation',   type: 'select',
            options: ['Kayak solo', 'Kayak duo', 'Canoë', 'Kayak de mer'] },
          { key: 'nb_embarcations_offre',label: 'Nb d\'embarcations',    type: 'number' },
        ],
        validations: [
          { field: 'nb_embarcations_offre', rule: 'lte', onboardingKey: 'nb_embarcations',
            message: 'Dépasse le nombre d\'embarcations déclaré ({value}).' },
        ],
      },
      {
        label: 'Équipement & Conditions',
        fields: [
          { key: 'equipement_fourni',  label: 'Équipement fourni',   type: 'multiselect',
            options: ['Kayak / Canoë', 'Pagaie', 'Gilet de sauvetage',
                      'Casque', 'Combinaison', 'Sac étanche'] },
          { key: 'inclus',             label: 'Inclus',              type: 'multiselect',
            options: ['Encadrement', 'Briefing sécurité', 'Transport embarcations',
                      'Pique-nique', 'Photos'] },
          { key: 'nb_participants_min',label: 'Nb minimum',          type: 'number' },
          { key: 'nb_participants_max',label: 'Nb maximum',          type: 'number' },
          { key: 'age_minimum',        label: 'Âge minimum',         type: 'number' },
          { key: 'savoir_nager',       label: 'Savoir nager obligatoire', type: 'boolean' },
        ],
      },
    ],
  },

  velo_vtt: {
    sections: [
      {
        label: 'Cette sortie / location',
        fields: [
          { key: 'titre',                  label: 'Titre',                type: 'text',   required: true },
          { key: 'type_offre',             label: 'Type',                 type: 'select',
            options: ['Sortie guidée', 'Location', 'Location + itinéraire', 'Initiation'] },
          { key: 'type_velo_offre',        label: 'Type de vélo',         type: 'select',
            dynamicOptions: 'onboarding.types_velos' },
          { key: 'niveau_offre',           label: 'Niveau',               type: 'select',
            dynamicOptions: 'onboarding.niveaux' },
          { key: 'distance_km',            label: 'Distance (km)',         type: 'number' },
          { key: 'denivele_m',             label: 'Dénivelé (m)',          type: 'number' },
          { key: 'duree',                  label: 'Durée',                 type: 'text' },
          { key: 'description_itineraire', label: 'Description du parcours', type: 'textarea' },
          { key: 'fichier_gpx',            label: 'Tracé GPX',             type: 'file' },
          { key: 'nb_velos_offre',         label: 'Nb de vélos disponibles', type: 'number' },
        ],
        validations: [
          { field: 'type_velo_offre', rule: 'in',  onboardingKey: 'types_velos',
            message: 'Ce type de vélo n\'est pas déclaré dans votre activité.' },
          { field: 'niveau_offre',    rule: 'in',  onboardingKey: 'niveaux',
            message: 'Ce niveau n\'est pas proposé dans votre activité.' },
          { field: 'nb_velos_offre',  rule: 'lte', onboardingKey: 'nb_velos',
            message: 'Dépasse le nombre de vélos déclaré ({value}).' },
        ],
      },
      {
        label: 'Équipement & Inclus',
        fields: [
          { key: 'equipement_fourni', label: 'Équipement fourni', type: 'multiselect',
            options: ['Casque', 'Antivol', 'Gilet réfléchissant', 'Carte itinéraires',
                      'Kit réparation', 'Siège enfant'] },
          { key: 'points_interet',   label: 'Points d\'intérêt',  type: 'textarea' },
        ],
      },
    ],
  },

  escalade: {
    sections: [
      {
        label: 'Ce site / session',
        fields: [
          { key: 'titre',            label: 'Titre',                   type: 'text',   required: true },
          { key: 'nom_site',         label: 'Nom du site',             type: 'text',   required: true },
          { key: 'type_site_offre',  label: 'Type de site',            type: 'select',
            dynamicOptions: 'onboarding.type_site' },
          { key: 'niveau_offre',     label: 'Niveau ciblé',            type: 'select',
            dynamicOptions: 'onboarding.niveaux_voies' },
          { key: 'nb_voies',         label: 'Nb de voies disponibles', type: 'number' },
          { key: 'duree',            label: 'Durée',                   type: 'text',   required: true },
        ],
        validations: [
          { field: 'type_site_offre',     rule: 'in',  onboardingKey: 'type_site',
            message: 'Ce type de site n\'est pas déclaré dans votre activité.' },
          { field: 'niveau_offre',        rule: 'in',  onboardingKey: 'niveaux_voies',
            message: 'Ce niveau n\'est pas proposé dans votre activité.' },
          { field: 'nb_participants_max', rule: 'lte', onboardingKey: 'capacite_simultanee',
            message: 'Dépasse la capacité simultanée déclarée ({value}).' },
        ],
      },
      {
        label: 'Sécurité & Équipement',
        fields: [
          { key: 'equipement_fourni',    label: 'Équipement fourni',         type: 'multiselect',
            options: ['Baudrier', 'Casque', 'Corde', 'Chaussons', 'Chaulk'] },
          { key: 'briefing_securite',    label: 'Briefing sécurité inclus',  type: 'boolean' },
          { key: 'nb_participants_min',  label: 'Nb minimum',                type: 'number' },
          { key: 'nb_participants_max',  label: 'Nb maximum',                type: 'number' },
          { key: 'age_minimum',          label: 'Âge minimum',               type: 'number' },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 🚵 ACTIVITÉ — spécifications complètes
  // ══════════════════════════════════════════════════════════════════════════

  yoga: {
    sections: [
      {
        label: 'La séance / le pack',
        fields: [
          { key: 'titre',        label: 'Titre',              type: 'text',   required: true },
          { key: 'type_offre',   label: 'Type',               type: 'select',
            options: ['Séance unique', 'Pack 5 séances', 'Pack 10 séances', 'Retraite'] },
          { key: 'style_offre',  label: 'Style de yoga',      type: 'select',
            dynamicOptions: 'onboarding.styles_yoga' },
          { key: 'niveau_offre', label: 'Niveau',             type: 'select',
            dynamicOptions: 'onboarding.niveaux' },
          { key: 'duree_seance', label: 'Durée par séance',   type: 'select',
            options: ['30 min', '45 min', '60 min', '75 min', '90 min', '120 min'] },
          { key: 'cadre_offre',  label: 'Cadre',              type: 'select',
            dynamicOptions: 'onboarding.cadre' },
        ],
        validations: [
          { field: 'style_offre',         rule: 'in',  onboardingKey: 'styles_yoga',
            message: 'Ce style n\'est pas déclaré dans votre activité.' },
          { field: 'niveau_offre',        rule: 'in',  onboardingKey: 'niveaux',
            message: 'Ce niveau n\'est pas proposé dans votre activité.' },
          { field: 'cadre_offre',         rule: 'in',  onboardingKey: 'cadre',
            message: 'Ce cadre n\'est pas déclaré dans votre activité.' },
          { field: 'nb_participants_max', rule: 'lte', onboardingKey: 'capacite_max',
            message: 'Dépasse la capacité maximale déclarée ({value}).' },
        ],
      },
      {
        label: 'Contenu & Inclus',
        fields: [
          { key: 'theme',            label: 'Thème',                       type: 'select',
            options: ['Stress & relaxation', 'Flexibilité', 'Force', 'Dos',
                      'Prénatal', 'Senior', 'Débutant complet', 'Méditation'] },
          { key: 'meditation_fin',   label: 'Méditation en fin de séance', type: 'boolean' },
          { key: 'tapis_fourni',     label: 'Tapis fourni',                type: 'boolean' },
          { key: 'accessoires',      label: 'Accessoires fournis',         type: 'multiselect',
            options: ['Blocs', 'Sangle', 'Bolster', 'Couverture'] },
          { key: 'tisane_apres',     label: 'Tisane offerte après',        type: 'boolean' },
          { key: 'nb_participants_min', label: 'Nb minimum',               type: 'number' },
          { key: 'nb_participants_max', label: 'Nb maximum',               type: 'number' },
          { key: 'cours_particulier',label: 'Cours particulier possible',  type: 'boolean' },
        ],
        validations: [
          { field: 'tapis_fourni', rule: 'requiredIfFalse', onboardingKey: 'equipement_fourni',
            message: 'Vous n\'avez pas déclaré d\'équipement fourni dans votre activité.' },
        ],
      },
    ],
  },

  plongee: {
    sections: [
      {
        label: 'Cette plongée',
        fields: [
          { key: 'titre',                label: 'Titre',                      type: 'text',   required: true },
          { key: 'type_offre',           label: 'Type',                       type: 'select',
            options: ['Baptême', 'Exploration', 'Pack 5 plongées', 'Formation'] },
          { key: 'nom_site',             label: 'Site de plongée',            type: 'text',   required: true },
          { key: 'profondeur_max_offre', label: 'Profondeur maximale (m)',    type: 'number' },
          { key: 'niveau_requis_offre',  label: 'Niveau requis',              type: 'select',
            dynamicOptions: 'onboarding.niveaux_acceptes' },
          { key: 'duree',                label: 'Durée totale',               type: 'text',   required: true },
          { key: 'faune_epave',          label: 'Faune / épave / récif à découvrir', type: 'textarea' },
        ],
        validations: [
          { field: 'profondeur_max_offre', rule: 'lte', onboardingKey: 'profondeurs_accessibles',
            message: 'Dépasse la profondeur déclarée dans votre activité ({value}m).' },
          { field: 'niveau_requis_offre',  rule: 'in',  onboardingKey: 'niveaux_acceptes',
            message: 'Ce niveau n\'est pas accepté selon votre activité.' },
        ],
      },
      {
        label: 'Équipement & Inclus',
        fields: [
          { key: 'equipement_fourni',  label: 'Équipement fourni',    type: 'multiselect',
            options: ['Combinaison', 'Masque', 'Tuba', 'Palmes', 'Bouteille',
                      'Détendeur', 'Ordinateur de plongée', 'Lampe', 'Ceinture de plomb'] },
          { key: 'inclus',             label: 'Inclus',               type: 'multiselect',
            options: ['Briefing sécurité', 'Moniteur', 'Photos sous-marines',
                      'Transport bateau', 'Eau', 'Certificat baptême'] },
          { key: 'nb_participants_max',label: 'Nb maximum',           type: 'number' },
          { key: 'contre_indications', label: 'Contre-indications médicales', type: 'textarea' },
        ],
      },
    ],
  },

  surf_windsurf: {
    sections: [
      {
        label: 'Cette session',
        fields: [
          { key: 'titre',        label: 'Titre',         type: 'text',   required: true },
          { key: 'type_offre',   label: 'Type',          type: 'select',
            options: ['Cours découverte', 'Cours collectif', 'Cours particulier', 'Stage', 'Location'] },
          { key: 'discipline',   label: 'Discipline',    type: 'select',
            options: ['Surf', 'Windsurf', 'Bodyboard', 'Stand-up paddle'] },
          { key: 'niveau_offre', label: 'Niveau ciblé',  type: 'select',
            dynamicOptions: 'onboarding.niveaux' },
          { key: 'nom_spot',     label: 'Spot utilisé',  type: 'text' },
          { key: 'duree',        label: 'Durée',         type: 'text',   required: true },
        ],
        validations: [
          { field: 'niveau_offre', rule: 'in', onboardingKey: 'niveaux',
            message: 'Ce niveau n\'est pas proposé dans votre activité.' },
        ],
      },
      {
        label: 'Équipement & Conditions',
        fields: [
          { key: 'equipement_fourni',  label: 'Équipement fourni',           type: 'multiselect',
            dynamicOptions: 'onboarding.equipement_disponible' },
          { key: 'inclus',             label: 'Inclus',                      type: 'multiselect',
            options: ['Moniteur certifié', 'Vidéo analyse', 'Photos session', 'Rinçage combi'] },
          { key: 'nb_participants_max',label: 'Nb maximum',                  type: 'number' },
          { key: 'age_minimum',        label: 'Âge minimum',                 type: 'number' },
          { key: 'savoir_nager',       label: 'Savoir nager obligatoire',    type: 'boolean' },
        ],
        validations: [
          { field: 'equipement_fourni', rule: 'subset', onboardingKey: 'equipement_disponible',
            message: 'Cet équipement n\'est pas déclaré dans votre activité.' },
        ],
      },
    ],
  },

  tir_arc: {
    sections: [
      {
        label: 'Cette session',
        fields: [
          { key: 'titre',               label: 'Titre',             type: 'text',   required: true },
          { key: 'type_offre',          label: 'Type',              type: 'select',
            options: ['Initiation', 'Session sport', 'Parcours nature 3D', 'Compétition amicale'] },
          { key: 'type_pratique_offre', label: 'Type de pratique',  type: 'select',
            dynamicOptions: 'onboarding.type_pratique' },
          { key: 'espace_offre',        label: 'Espace',            type: 'select',
            dynamicOptions: 'onboarding.espace' },
          { key: 'duree',               label: 'Durée',             type: 'text',   required: true },
        ],
        validations: [
          { field: 'type_pratique_offre', rule: 'in',  onboardingKey: 'type_pratique',
            message: 'Ce type de pratique n\'est pas déclaré dans votre activité.' },
          { field: 'espace_offre',        rule: 'in',  onboardingKey: 'espace',
            message: 'Cet espace n\'est pas déclaré dans votre activité.' },
          { field: 'nb_participants_max', rule: 'lte', onboardingKey: 'capacite_simultanee',
            message: 'Dépasse la capacité simultanée déclarée ({value}).' },
          { field: 'age_minimum_offre',   rule: 'gte', onboardingKey: 'age_minimum',
            message: 'L\'âge minimum doit être ≥ à celui déclaré dans votre activité ({value}).' },
        ],
      },
      {
        label: 'Équipement & Conditions',
        fields: [
          { key: 'equipement_fourni',  label: 'Équipement fourni', type: 'multiselect',
            options: ['Arc', 'Flèches', 'Carquois', 'Brassard', 'Protection doigts', 'Cible'] },
          { key: 'inclus',             label: 'Inclus',            type: 'multiselect',
            options: ['Briefing sécurité', 'Encadrement', 'Correction technique', 'Certificat'] },
          { key: 'nb_participants_min',label: 'Nb minimum',        type: 'number' },
          { key: 'nb_participants_max',label: 'Nb maximum',        type: 'number' },
          { key: 'age_minimum_offre',  label: 'Âge minimum',       type: 'number' },
        ],
      },
    ],
  },

  quad_4x4: {
    sections: [
      {
        label: 'Cette sortie',
        fields: [
          { key: 'titre',               label: 'Titre',            type: 'text',   required: true },
          { key: 'type_vehicule_offre', label: 'Type de véhicule', type: 'select',
            dynamicOptions: 'onboarding.types_vehicules' },
          { key: 'terrain_offre',       label: 'Type de terrain',  type: 'select',
            dynamicOptions: 'onboarding.type_terrain' },
          { key: 'duree',               label: 'Durée',            type: 'text',   required: true },
          { key: 'distance_km',         label: 'Distance (km)',     type: 'number' },
          { key: 'itineraire',          label: 'Itinéraire',       type: 'textarea' },
          { key: 'nb_vehicules_offre',  label: 'Nb de véhicules',  type: 'number' },
        ],
        validations: [
          { field: 'type_vehicule_offre', rule: 'in',  onboardingKey: 'types_vehicules',
            message: 'Ce véhicule n\'est pas déclaré dans votre activité.' },
          { field: 'terrain_offre',       rule: 'in',  onboardingKey: 'type_terrain',
            message: 'Ce terrain n\'est pas déclaré dans votre activité.' },
          { field: 'nb_vehicules_offre',  rule: 'lte', onboardingKey: 'nb_vehicules',
            message: 'Dépasse le nombre de véhicules déclaré ({value}).' },
          { field: 'age_minimum_offre',   rule: 'gte', onboardingKey: 'age_minimum',
            message: 'L\'âge minimum doit être ≥ à celui déclaré ({value}).' },
        ],
      },
      {
        label: 'Équipement & Conditions',
        fields: [
          { key: 'equipement_securite',label: 'Équipement sécurité fourni', type: 'multiselect',
            options: ['Casque', 'Lunettes', 'Gants', 'Combinaison', 'Gilet'] },
          { key: 'inclus',             label: 'Inclus',                     type: 'multiselect',
            options: ['Guide accompagnateur', 'Briefing sécurité', 'Eau / boissons',
                      'Photos', 'Thé dans le désert'] },
          { key: 'permis_requis_offre',label: 'Permis requis',              type: 'boolean' },
          { key: 'age_minimum_offre',  label: 'Âge minimum conducteur',     type: 'number' },
          { key: 'nb_participants_max',label: 'Nb maximum',                 type: 'number' },
        ],
      },
    ],
  },

  peche_traditionnelle: {
    sections: [
      {
        label: 'Cette sortie pêche',
        fields: [
          { key: 'titre',             label: 'Titre',                      type: 'text',     required: true },
          { key: 'zone_peche_offre',  label: 'Zone de pêche',              type: 'select',
            dynamicOptions: 'onboarding.zone_peche' },
          { key: 'techniques_offre',  label: 'Techniques pratiquées',      type: 'multiselect',
            dynamicOptions: 'onboarding.techniques' },
          { key: 'duree',             label: 'Durée',                      type: 'text',     required: true },
          { key: 'lieu_depart',       label: 'Lieu de départ',             type: 'text',     required: true },
        ],
        validations: [
          { field: 'zone_peche_offre',    rule: 'in',     onboardingKey: 'zone_peche',
            message: 'Cette zone n\'est pas déclarée dans votre activité.' },
          { field: 'techniques_offre',    rule: 'subset', onboardingKey: 'techniques',
            message: 'Ces techniques ne sont pas déclarées dans votre activité.' },
          { field: 'nb_participants_max', rule: 'lte',    onboardingKey: 'capacite_simultanee',
            message: 'Dépasse la capacité simultanée déclarée ({value}).' },
        ],
      },
      {
        label: 'Équipement & Inclus',
        fields: [
          { key: 'materiel_fourni_offre',label: 'Matériel fourni',         type: 'boolean' },
          { key: 'detail_materiel',      label: 'Détail du matériel',      type: 'textarea',
            conditionalOn: { field: 'materiel_fourni_offre', value: true } },
          { key: 'embarcation_offre',    label: 'Embarcation utilisée',    type: 'boolean' },
          { key: 'type_embarcation',     label: 'Type d\'embarcation',     type: 'text',
            conditionalOn: { field: 'embarcation_offre', value: true } },
          { key: 'inclus',               label: 'Inclus',                  type: 'multiselect',
            options: ['Guide pêcheur local', 'Nettoyage du poisson', 'Cuisson sur place',
                      'Thé / café', 'Gilets de sauvetage'] },
          { key: 'repas_poisson',        label: 'Repas avec le poisson pêché', type: 'boolean' },
          { key: 'nb_participants_min',  label: 'Nb minimum',              type: 'number' },
          { key: 'nb_participants_max',  label: 'Nb maximum',              type: 'number' },
        ],
        validations: [
          { field: 'materiel_fourni_offre', rule: 'requiredIfFalse', onboardingKey: 'materiel_disponible',
            message: 'Vous n\'avez pas déclaré de matériel disponible dans votre activité.' },
          { field: 'embarcation_offre',     rule: 'requiredIfFalse', onboardingKey: 'embarcation',
            message: 'Vous n\'avez pas déclaré d\'embarcation dans votre activité.' },
        ],
      },
    ],
  },

  cours_cuisine: {
    sections: [
      {
        label: 'Cet atelier',
        fields: [
          { key: 'titre',         label: 'Titre',                    type: 'text',   required: true },
          { key: 'plats_prepares',label: 'Plats préparés',           type: 'textarea', required: true },
          { key: 'nb_recettes',   label: 'Nb de recettes',           type: 'number', required: true },
          { key: 'duree_heures',  label: 'Durée (heures)',           type: 'number', required: true },
          { key: 'cadre_offre',   label: 'Cadre',                    type: 'select',
            dynamicOptions: 'onboarding.cadre' },
          { key: 'niveau_offre',  label: 'Niveau',                   type: 'select',
            dynamicOptions: 'onboarding.niveau_requis' },
        ],
        validations: [
          { field: 'cadre_offre',         rule: 'in',  onboardingKey: 'cadre',
            message: 'Ce cadre n\'est pas déclaré dans votre activité.' },
          { field: 'niveau_offre',        rule: 'in',  onboardingKey: 'niveau_requis',
            message: 'Ce niveau n\'est pas proposé dans votre activité.' },
          { field: 'nb_participants_max', rule: 'lte', onboardingKey: 'capacite_max',
            message: 'Dépasse la capacité maximale déclarée ({value}).' },
        ],
      },
      {
        label: 'Produits & Inclus',
        fields: [
          { key: 'visite_marche',    label: 'Visite marché avant l\'atelier', type: 'boolean' },
          { key: 'duree_marche_min', label: 'Durée visite marché (min)',       type: 'number',
            conditionalOn: { field: 'visite_marche', value: true } },
          { key: 'inclus',           label: 'Inclus',                         type: 'multiselect',
            options: ['Tablier', 'Recette écrite', 'Dégustation', 'Apéritif', 'Thé',
                      'Plat à emporter', 'Photos', 'Certificat'] },
          { key: 'nb_participants_min', label: 'Nb minimum',                  type: 'number' },
          { key: 'nb_participants_max', label: 'Nb maximum',                  type: 'number' },
          { key: 'enfants_acceptes',    label: 'Adapté aux enfants',          type: 'boolean' },
          { key: 'age_min_enfant',      label: 'Âge minimum enfant',          type: 'number',
            conditionalOn: { field: 'enfants_acceptes', value: true } },
        ],
      },
    ],
  },

  plantation_jardinage: {
    sections: [
      {
        label: 'Cette session',
        fields: [
          { key: 'titre',              label: 'Titre',                  type: 'text',   required: true },
          { key: 'type_offre',         label: 'Type',                   type: 'select',
            options: ['Initiation', 'Session plantation', 'Atelier permaculture',
                      'Journée jardin', 'Stage week-end'] },
          { key: 'type_jardin_offre',  label: 'Type de jardin',         type: 'select',
            dynamicOptions: 'onboarding.type_jardin' },
          { key: 'activites_session',  label: 'Activités de cette session', type: 'multiselect',
            options: ['Semis', 'Repiquage', 'Plantation', 'Taille', 'Récolte', 'Compostage',
                      'Arrosage', 'Désherbage', 'Paillage'] },
          { key: 'duree',              label: 'Durée',                  type: 'text',   required: true },
        ],
        validations: [
          { field: 'type_jardin_offre',   rule: 'in',  onboardingKey: 'type_jardin',
            message: 'Ce type de jardin n\'est pas déclaré dans votre activité.' },
          { field: 'nb_participants_max', rule: 'lte', onboardingKey: 'capacite_simultanee',
            message: 'Dépasse la capacité simultanée déclarée ({value}).' },
        ],
      },
      {
        label: 'Ce que le participant emporte & Inclus',
        fields: [
          { key: 'emporte', label: 'Le participant repart avec', type: 'multiselect',
            options: ['Plante semée', 'Légumes récoltés', 'Bouquet herbes',
                      'Confiture maison', 'Fiche jardinage'] },
          { key: 'inclus',  label: 'Inclus',                     type: 'multiselect',
            options: ['Outils fournis', 'Gants', 'Tablier', 'Pause café / thé',
                      'Déjeuner produits jardin', 'Guide / animateur'] },
          { key: 'nb_participants_min', label: 'Nb minimum', type: 'number' },
          { key: 'nb_participants_max', label: 'Nb maximum', type: 'number' },
        ],
      },
    ],
  },

  observation_oiseaux: {
    sections: [
      {
        label: 'Cette sortie ornithologique',
        fields: [
          { key: 'titre',               label: 'Titre',                   type: 'text',   required: true },
          { key: 'milieu_offre',        label: 'Milieu d\'observation',   type: 'select',
            dynamicOptions: 'onboarding.milieux_couverts' },
          { key: 'especes_cibles_offre',label: 'Espèces cibles',          type: 'textarea' },
          { key: 'heure_depart',        label: 'Heure de départ',         type: 'time',   required: true },
          { key: 'duree',               label: 'Durée',                   type: 'text',   required: true },
          { key: 'type_deplacement',    label: 'Type de déplacement',     type: 'select',
            options: ['À pied', 'Véhicule', 'Barque', 'Affût fixe'] },
        ],
        validations: [
          { field: 'milieu_offre',        rule: 'in',  onboardingKey: 'milieux_couverts',
            message: 'Ce milieu n\'est pas déclaré dans votre activité.' },
          { field: 'nb_participants_max', rule: 'lte', onboardingKey: 'groupe_max',
            message: 'Dépasse la taille de groupe maximale déclarée ({value}).' },
        ],
      },
      {
        label: 'Équipement & Inclus',
        fields: [
          { key: 'equipement_fourni', label: 'Équipement fourni',        type: 'multiselect',
            options: ['Jumelles', 'Longue-vue', 'Fiches espèces', 'Guide ornitho', 'App'] },
          { key: 'programme_sortie',  label: 'Déroulé de la sortie',     type: 'textarea' },
          { key: 'inclus',            label: 'Inclus',                   type: 'multiselect',
            options: ['Guide ornithologue', 'Transport', 'Collation', 'Photos'] },
          { key: 'niveau_marche',     label: 'Niveau de marche requis',  type: 'select',
            options: ['Aucun', 'Léger', 'Modéré'] },
          { key: 'nb_participants_min',label: 'Nb minimum',              type: 'number' },
          { key: 'nb_participants_max',label: 'Nb maximum',              type: 'number' },
        ],
      },
    ],
  },

  equitation: {
    sections: [
      {
        label: 'Cette balade / séance',
        fields: [
          { key: 'titre',              label: 'Titre',                  type: 'text',   required: true },
          { key: 'type_offre',         label: 'Type',                   type: 'select',
            options: ['Balade', 'Cours', 'Initiation', 'Randonnée multi-jours', 'Photo équestre'] },
          { key: 'niveau_offre',       label: 'Niveau',                 type: 'select',
            dynamicOptions: 'onboarding.niveaux_accueillis' },
          { key: 'type_balade_offre',  label: 'Type de balade',         type: 'select',
            dynamicOptions: 'onboarding.types_balades' },
          { key: 'duree',              label: 'Durée',                  type: 'text',   required: true },
          { key: 'itineraire',         label: 'Itinéraire',             type: 'textarea' },
          { key: 'temperament_cheval', label: 'Tempérament du cheval',  type: 'select',
            options: ['Calme', 'Intermédiaire', 'Dynamique'] },
        ],
        validations: [
          { field: 'niveau_offre',       rule: 'in',  onboardingKey: 'niveaux_accueillis',
            message: 'Ce niveau n\'est pas proposé dans votre activité.' },
          { field: 'type_balade_offre',  rule: 'in',  onboardingKey: 'types_balades',
            message: 'Ce type de balade n\'est pas déclaré dans votre activité.' },
          { field: 'age_minimum_offre',  rule: 'gte', onboardingKey: 'age_minimum',
            message: 'L\'âge minimum doit être ≥ à celui déclaré ({value}).' },
        ],
      },
      {
        label: 'Équipement & Conditions',
        fields: [
          { key: 'equipement_fourni',  label: 'Équipement fourni',           type: 'multiselect',
            options: ['Casque (obligatoire)', 'Gilet de protection', 'Bombe enfant', 'Cravache'] },
          { key: 'inclus',             label: 'Inclus',                      type: 'multiselect',
            options: ['Moniteur certifié', 'Soins du cheval', 'Briefing', 'Photo / vidéo',
                      'Pique-nique en selle', 'Théorie équestre'] },
          { key: 'poids_max_kg',       label: 'Poids maximum cavalier (kg)', type: 'number', required: true },
          { key: 'age_minimum_offre',  label: 'Âge minimum',                 type: 'number' },
          { key: 'contre_indications', label: 'Contre-indications',          type: 'textarea' },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 🍽️ RESTAURANT & TERROIR
  // ══════════════════════════════════════════════════════════════════════════

  restaurant_traditionnel: {
    sections: [
      {
        label: 'Cette offre repas',
        fields: [
          { key: 'titre',                 label: 'Titre',                              type: 'text',   required: true },
          { key: 'type_repas',            label: 'Type de repas',                      type: 'select',
            options: ['Déjeuner', 'Dîner', 'Brunch', 'Petit-déjeuner'] },
          { key: 'type_menu',             label: 'Type de menu',                       type: 'select',
            options: ['Fixe', 'À la carte', 'Dégustation', 'Buffet'] },
          { key: 'entrees',               label: 'Entrée(s)',                          type: 'textarea' },
          { key: 'plats',                 label: 'Plat(s)',                            type: 'textarea' },
          { key: 'desserts',              label: 'Dessert(s)',                         type: 'textarea' },
          { key: 'boissons_incluses',     label: 'Boissons incluses',                  type: 'multiselect',
            options: ['Eau', 'Jus locaux', 'Thé', 'Café', 'Limonade maison'] },
          { key: 'specialite_mise_avant', label: 'Spécialité régionale mise en avant', type: 'text' },
        ],
      },
      {
        label: 'Format & Ambiance',
        fields: [
          { key: 'nb_couverts_offre', label: 'Nb de couverts pour cette offre', type: 'number' },
          { key: 'espace_offre',      label: 'Espace',                          type: 'select',
            options: ['Intérieur', 'Extérieur / terrasse', 'Au choix'] },
          { key: 'animations',        label: 'Animation incluse',               type: 'multiselect',
            options: ['Musique live', 'Démonstration culinaire', 'Histoire des plats'] },
        ],
        validations: [
          { field: 'nb_couverts_offre', rule: 'lte', onboardingKey: 'capacite',
            message: 'Dépasse la capacité déclarée ({value}).' },
        ],
      },
    ],
  },

  cafe_salon_the: {
    sections: [
      {
        label: 'Cette formule',
        fields: [
          { key: 'titre',           label: 'Titre',            type: 'text',   required: true },
          { key: 'type_offre',      label: 'Type',             type: 'select',
            options: ['Pause thé / café', 'Formule petit-déjeuner', 'Goûter traditionnel',
                      'Afterwork', 'Dégustation thés'] },
          { key: 'boissons',        label: 'Boissons proposées', type: 'multiselect',
            options: ['Thé à la menthe', 'Thé vert', 'Café turc', 'Café express',
                      'Jus frais', 'Lait de chamelle', 'Citronnade maison'] },
          { key: 'accompagnements', label: 'Accompagnements', type: 'multiselect',
            options: ['Makroudh', 'Baklava', 'Pain traditionnel', 'Fromage local',
                      'Confiture maison', 'Miel local', 'Dattes'] },
        ],
      },
      {
        label: 'Format',
        fields: [
          { key: 'nb_personnes_offre', label: 'Nb de personnes', type: 'number' },
          { key: 'espace_offre',       label: 'Espace',          type: 'select',
            dynamicOptions: 'onboarding.cadre' },
          { key: 'wifi_offre',         label: 'Wifi inclus',     type: 'boolean' },
        ],
        validations: [
          { field: 'nb_personnes_offre', rule: 'lte',          onboardingKey: 'capacite',
            message: 'Dépasse la capacité déclarée ({value}).' },
          { field: 'wifi_offre',         rule: 'requiredIfFalse', onboardingKey: 'wifi',
            message: 'Vous n\'avez pas déclaré de Wifi dans votre activité.' },
        ],
      },
    ],
  },

  ferme_restaurant: {
    sections: [
      {
        label: 'Cette offre',
        fields: [
          { key: 'titre',             label: 'Titre',                              type: 'text',   required: true },
          { key: 'type_repas',        label: 'Type',                               type: 'select',
            options: ['Déjeuner fermier', 'Dîner à la ferme', 'Brunch', 'Pique-nique'] },
          { key: 'produits_menu',     label: 'Produits de la ferme utilisés',      type: 'textarea' },
          { key: 'entrees',           label: 'Entrée(s)',                          type: 'textarea' },
          { key: 'plats',             label: 'Plat(s)',                            type: 'textarea' },
          { key: 'desserts',          label: 'Dessert(s)',                         type: 'textarea' },
          { key: 'visite_avant_repas',label: 'Visite de la ferme avant le repas', type: 'boolean' },
          { key: 'duree_visite_min',  label: 'Durée de la visite (min)',           type: 'number',
            conditionalOn: { field: 'visite_avant_repas', value: true } },
          { key: 'inclus',            label: 'Inclus',                            type: 'multiselect',
            options: ['Apéritif maison', 'Digestif local', 'Café / thé', 'Eau de source'] },
          { key: 'nb_couverts_offre', label: 'Nb de couverts',                   type: 'number' },
        ],
        validations: [
          { field: 'visite_avant_repas', rule: 'requiredIfFalse', onboardingKey: 'visite_ferme',
            message: 'Vous n\'avez pas déclaré de visite de ferme dans votre activité.' },
          { field: 'nb_couverts_offre',  rule: 'lte',             onboardingKey: 'capacite',
            message: 'Dépasse la capacité déclarée ({value}).' },
        ],
      },
    ],
  },

  food_truck: {
    sections: [
      {
        label: 'Cette offre',
        fields: [
          { key: 'titre',               label: 'Titre',                      type: 'text',   required: true },
          { key: 'type_offre',          label: 'Type',                       type: 'select',
            options: ['Menu du jour', 'Formule complète', 'Snack rapide', 'Offre événement'] },
          { key: 'lieu_exact',          label: 'Lieu exact pour cette offre', type: 'text',   required: true },
          { key: 'plats_proposes',      label: 'Plats proposés',             type: 'textarea', required: true },
          { key: 'boissons_proposees',  label: 'Boissons proposées',         type: 'textarea' },
          { key: 'prix_moyen_personne', label: 'Prix moyen par personne (TND)', type: 'number' },
          { key: 'horaires_offre',      label: 'Horaires',                   type: 'text' },
          { key: 'modes_paiement',      label: 'Modes de paiement',          type: 'multiselect',
            options: ['Espèces', 'Carte bancaire', 'Virement', 'QR code'] },
        ],
      },
    ],
  },

  table_hotes: {
    sections: [
      {
        label: 'Ce repas',
        fields: [
          { key: 'titre',              label: 'Titre',           type: 'text',   required: true },
          { key: 'type_repas',         label: 'Type',            type: 'select',
            options: ['Déjeuner', 'Dîner', 'Brunch'] },
          { key: 'format_menu_offre',  label: 'Format du menu',  type: 'select',
            dynamicOptions: 'onboarding.type_menu' },
          { key: 'entrees',            label: 'Entrée(s)',        type: 'textarea', required: true },
          { key: 'plats',              label: 'Plat(s)',          type: 'textarea', required: true },
          { key: 'desserts',           label: 'Dessert(s)',       type: 'textarea' },
          { key: 'boissons_incluses',  label: 'Boissons incluses', type: 'multiselect',
            options: ['Eau', 'Jus locaux', 'Thé', 'Café', 'Vin local'] },
        ],
        validations: [
          { field: 'format_menu_offre', rule: 'in', onboardingKey: 'type_menu',
            message: 'Ce format de menu n\'est pas déclaré dans votre activité.' },
        ],
      },
      {
        label: 'L\'expérience & Format',
        fields: [
          { key: 'repas_avec_famille',   label: 'Repas partagé avec la famille hôte', type: 'boolean' },
          { key: 'presentation_plats',   label: 'Présentation des plats par l\'hôte', type: 'boolean' },
          { key: 'recette_partagee',     label: 'Recette partagée après le repas',    type: 'boolean' },
          { key: 'visite_jardin',        label: 'Visite jardin / potager incluse',    type: 'boolean' },
          { key: 'aperitif_offert',      label: 'Apéritif traditionnel offert',       type: 'boolean' },
          { key: 'nb_couverts_offre',    label: 'Nb de couverts',                    type: 'number' },
          { key: 'espace',               label: 'Espace',                             type: 'select',
            options: ['Intérieur', 'Extérieur / jardin', 'Terrasse', 'Au choix'] },
        ],
        validations: [
          { field: 'nb_couverts_offre', rule: 'lte', onboardingKey: 'nb_couverts_max',
            message: 'Dépasse le nombre de couverts maximum déclaré ({value}).' },
        ],
      },
    ],
  },

  degustation_produits: {
    sections: [
      {
        label: 'Cette dégustation',
        fields: [
          { key: 'titre',            label: 'Titre',                       type: 'text',   required: true },
          { key: 'produits_degustes',label: 'Produits dégustés',           type: 'multiselect',
            dynamicOptions: 'onboarding.produits_proposes' },
          { key: 'nb_produits',      label: 'Nb de produits à déguster',  type: 'number' },
          { key: 'duree',            label: 'Durée',                       type: 'text',   required: true },
          { key: 'lieu_exact',       label: 'Lieu',                        type: 'select',
            options: ['En plein air', 'En cave / cellier', 'En boutique', 'En salle dégustation'] },
        ],
        validations: [
          { field: 'produits_degustes',   rule: 'subset', onboardingKey: 'produits_proposes',
            message: 'Ces produits ne sont pas déclarés dans votre activité.' },
          { field: 'nb_participants_max', rule: 'lte',    onboardingKey: 'capacite',
            message: 'Dépasse la capacité déclarée ({value}).' },
        ],
      },
      {
        label: 'Animation & Commerce',
        fields: [
          { key: 'presentation_producteur', label: 'Présentation par le producteur', type: 'boolean' },
          { key: 'fiche_produit',           label: 'Fiche produit remise',           type: 'boolean' },
          { key: 'accords_texte',           label: 'Accords suggérés',              type: 'textarea' },
          { key: 'vente_apres',             label: 'Vente sur place après dégustation', type: 'boolean' },
          { key: 'reduction_achat',         label: 'Réduction sur achat',           type: 'boolean' },
          { key: 'pct_reduction',           label: '% de réduction',                type: 'number',
            conditionalOn: { field: 'reduction_achat', value: true } },
          { key: 'nb_participants_min',     label: 'Nb minimum',                    type: 'number' },
          { key: 'nb_participants_max',     label: 'Nb maximum',                    type: 'number' },
        ],
        validations: [
          { field: 'vente_apres', rule: 'requiredIfFalse', onboardingKey: 'vente_sur_place',
            message: 'Vous n\'avez pas déclaré de vente sur place dans votre activité.' },
        ],
      },
    ],
  },

  diner_panoramique: {
    sections: [
      {
        label: 'Le cadre',
        fields: [
          { key: 'titre',           label: 'Titre',               type: 'text',   required: true },
          { key: 'vue_offre',       label: 'Type de vue',         type: 'select',
            dynamicOptions: 'onboarding.type_vue' },
          { key: 'description_lieu',label: 'Description du lieu', type: 'textarea' },
          { key: 'acces_details',   label: 'Comment y accéder',   type: 'textarea' },
        ],
        validations: [
          { field: 'vue_offre', rule: 'in', onboardingKey: 'type_vue',
            message: 'Ce type de vue n\'est pas déclaré dans votre activité.' },
        ],
      },
      {
        label: 'Le dîner & Animation',
        fields: [
          { key: 'type_repas',           label: 'Type',                type: 'select',
            options: ['Dîner', 'Brunch panoramique', 'Pique-nique vue'] },
          { key: 'entrees',              label: 'Entrée(s)',           type: 'textarea' },
          { key: 'plats',                label: 'Plat(s)',             type: 'textarea' },
          { key: 'desserts',             label: 'Dessert(s)',          type: 'textarea' },
          { key: 'boissons_incluses',    label: 'Boissons incluses',   type: 'multiselect',
            options: ['Eau', 'Jus locaux', 'Thé', 'Café', 'Vin local'] },
          { key: 'animation_offre',      label: 'Animation musicale',  type: 'boolean' },
          { key: 'type_animation',       label: 'Type d\'animation',   type: 'text',
            conditionalOn: { field: 'animation_offre', value: true } },
          { key: 'transport_depuis_ville',label: 'Transport depuis ville inclus', type: 'boolean' },
          { key: 'nb_couverts_offre',    label: 'Nb de couverts',      type: 'number' },
        ],
        validations: [
          { field: 'nb_couverts_offre', rule: 'lte', onboardingKey: 'capacite',
            message: 'Dépasse la capacité déclarée ({value}).' },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 🎨 ARTISANAT
  // ══════════════════════════════════════════════════════════════════════════

  poterie: {
    sections: [
      {
        label: 'Cet atelier',
        fields: [
          { key: 'titre',          label: 'Titre',               type: 'text',   required: true },
          { key: 'type_offre',     label: 'Type',                type: 'select',
            options: ['Visite seule', 'Démonstration', 'Initiation', 'Atelier avancé'] },
          { key: 'technique_offre',label: 'Technique travaillée', type: 'select',
            dynamicOptions: 'onboarding.techniques' },
          { key: 'duree',          label: 'Durée',               type: 'text',   required: true },
          { key: 'niveau',         label: 'Niveau',              type: 'select',
            options: ['Débutant', 'Intermédiaire', 'Tous niveaux'] },
        ],
        validations: [
          { field: 'technique_offre', rule: 'in', onboardingKey: 'techniques',
            message: 'Cette technique n\'est pas déclarée dans votre activité.' },
        ],
      },
      {
        label: 'Réalisation',
        fields: [
          { key: 'objet_realise',     label: 'Objet réalisé',                  type: 'text' },
          { key: 'piece_a_emporter',  label: 'Pièce à emporter le jour même',  type: 'boolean' },
          { key: 'delai_recuperation',label: 'Délai avant récupération (jours)', type: 'number',
            conditionalOn: { field: 'piece_a_emporter', value: false } },
          { key: 'expedition_possible',label: 'Expédition possible',           type: 'boolean',
            conditionalOn: { field: 'piece_a_emporter', value: false } },
        ],
      },
      {
        label: 'Inclus & Commerce',
        fields: [
          { key: 'inclus',             label: 'Inclus',                  type: 'multiselect',
            options: ['Matériel fourni', 'Tablier', 'Café / thé', 'Certificat', 'Photo souvenir'] },
          { key: 'vente_pieces',       label: 'Vente de pièces de l\'artisan', type: 'boolean' },
          { key: 'nb_participants_min',label: 'Nb minimum',              type: 'number' },
          { key: 'nb_participants_max',label: 'Nb maximum',              type: 'number' },
        ],
        validations: [
          { field: 'vente_pieces', rule: 'requiredIfFalse', onboardingKey: 'vente_sur_place',
            message: 'Vous n\'avez pas déclaré de vente sur place dans votre activité.' },
        ],
      },
    ],
  },

  tissage: {
    sections: [
      {
        label: 'Cet atelier',
        fields: [
          { key: 'titre',          label: 'Titre',               type: 'text',   required: true },
          { key: 'type_offre',     label: 'Type',                type: 'select',
            options: ['Visite seule', 'Démonstration', 'Initiation', 'Atelier avancé'] },
          { key: 'technique_offre',label: 'Technique travaillée', type: 'select',
            dynamicOptions: 'onboarding.techniques' },
          { key: 'matiere_offre',  label: 'Matière utilisée',    type: 'select',
            dynamicOptions: 'onboarding.matieres' },
          { key: 'duree',          label: 'Durée',               type: 'text',   required: true },
          { key: 'niveau',         label: 'Niveau',              type: 'select',
            options: ['Débutant', 'Intermédiaire', 'Tous niveaux'] },
        ],
        validations: [
          { field: 'technique_offre', rule: 'in', onboardingKey: 'techniques',
            message: 'Cette technique n\'est pas déclarée dans votre activité.' },
          { field: 'matiere_offre',   rule: 'in', onboardingKey: 'matieres',
            message: 'Cette matière n\'est pas déclarée dans votre activité.' },
        ],
      },
      {
        label: 'Réalisation & Commerce',
        fields: [
          { key: 'objet_realise',      label: 'Objet réalisé',           type: 'text' },
          { key: 'piece_a_emporter',   label: 'Pièce à emporter',        type: 'boolean' },
          { key: 'inclus',             label: 'Inclus',                  type: 'multiselect',
            options: ['Matériel fourni', 'Tablier', 'Café / thé', 'Certificat'] },
          { key: 'vente_pieces',       label: 'Vente sur place',         type: 'boolean' },
          { key: 'nb_participants_min',label: 'Nb minimum',              type: 'number' },
          { key: 'nb_participants_max',label: 'Nb maximum',              type: 'number' },
        ],
        validations: [
          { field: 'vente_pieces', rule: 'requiredIfFalse', onboardingKey: 'vente_sur_place',
            message: 'Vous n\'avez pas déclaré de vente sur place dans votre activité.' },
        ],
      },
    ],
  },

  broderie: {
    sections: [
      {
        label: 'Cet atelier',
        fields: [
          { key: 'titre',        label: 'Titre',              type: 'text',   required: true },
          { key: 'type_offre',   label: 'Type',               type: 'select',
            options: ['Visite seule', 'Démonstration', 'Initiation', 'Atelier avancé'] },
          { key: 'style_offre',  label: 'Style pratiqué',     type: 'select',
            dynamicOptions: 'onboarding.style' },
          { key: 'duree',        label: 'Durée',              type: 'text',   required: true },
          { key: 'niveau',       label: 'Niveau',             type: 'select',
            options: ['Débutant', 'Intermédiaire', 'Tous niveaux'] },
        ],
        validations: [
          { field: 'style_offre', rule: 'in', onboardingKey: 'style',
            message: 'Ce style n\'est pas déclaré dans votre activité.' },
        ],
      },
      {
        label: 'Réalisation & Commerce',
        fields: [
          { key: 'objet_realise',      label: 'Objet réalisé', type: 'text' },
          { key: 'piece_a_emporter',   label: 'Pièce à emporter', type: 'boolean' },
          { key: 'inclus',             label: 'Inclus',        type: 'multiselect',
            options: ['Matériel fourni', 'Tablier', 'Café / thé', 'Certificat'] },
          { key: 'vente_pieces',       label: 'Vente sur place', type: 'boolean' },
          { key: 'nb_participants_min',label: 'Nb minimum',    type: 'number' },
          { key: 'nb_participants_max',label: 'Nb maximum',    type: 'number' },
        ],
        validations: [
          { field: 'vente_pieces', rule: 'requiredIfFalse', onboardingKey: 'vente_sur_place',
            message: 'Vous n\'avez pas déclaré de vente sur place dans votre activité.' },
        ],
      },
    ],
  },

  vannerie: {
    sections: [
      {
        label: 'Cet atelier',
        fields: [
          { key: 'titre',          label: 'Titre',               type: 'text',   required: true },
          { key: 'type_offre',     label: 'Type',                type: 'select',
            options: ['Visite seule', 'Démonstration', 'Initiation', 'Atelier avancé'] },
          { key: 'technique_offre',label: 'Technique travaillée', type: 'select',
            dynamicOptions: 'onboarding.techniques' },
          { key: 'duree',          label: 'Durée',               type: 'text',   required: true },
        ],
        validations: [
          { field: 'technique_offre', rule: 'in', onboardingKey: 'techniques',
            message: 'Cette technique n\'est pas déclarée dans votre activité.' },
        ],
      },
      {
        label: 'Réalisation & Commerce',
        fields: [
          { key: 'objet_realise',      label: 'Objet réalisé', type: 'text' },
          { key: 'piece_a_emporter',   label: 'Pièce à emporter', type: 'boolean' },
          { key: 'inclus',             label: 'Inclus',        type: 'multiselect',
            options: ['Matériel fourni', 'Tablier', 'Café / thé', 'Certificat'] },
          { key: 'vente_pieces',       label: 'Vente sur place', type: 'boolean' },
          { key: 'nb_participants_min',label: 'Nb minimum',    type: 'number' },
          { key: 'nb_participants_max',label: 'Nb maximum',    type: 'number' },
        ],
        validations: [
          { field: 'vente_pieces', rule: 'requiredIfFalse', onboardingKey: 'vente_sur_place',
            message: 'Vous n\'avez pas déclaré de vente sur place dans votre activité.' },
        ],
      },
    ],
  },

  sculpture_bois: {
    sections: [
      {
        label: 'Cet atelier',
        fields: [
          { key: 'titre',          label: 'Titre',               type: 'text',   required: true },
          { key: 'type_offre',     label: 'Type',                type: 'select',
            options: ['Visite seule', 'Démonstration', 'Initiation', 'Atelier avancé'] },
          { key: 'technique_offre',label: 'Technique travaillée', type: 'select',
            dynamicOptions: 'onboarding.techniques' },
          { key: 'duree',          label: 'Durée',               type: 'text',   required: true },
        ],
        validations: [
          { field: 'technique_offre', rule: 'in', onboardingKey: 'techniques',
            message: 'Cette technique n\'est pas déclarée dans votre activité.' },
        ],
      },
      {
        label: 'Réalisation & Commerce',
        fields: [
          { key: 'objet_realise',      label: 'Objet réalisé', type: 'text' },
          { key: 'piece_a_emporter',   label: 'Pièce à emporter le jour même', type: 'boolean' },
          { key: 'inclus',             label: 'Inclus',        type: 'multiselect',
            options: ['Matériel fourni', 'Tablier', 'Café / thé', 'Certificat'] },
          { key: 'vente_pieces',       label: 'Vente sur place', type: 'boolean' },
          { key: 'nb_participants_min',label: 'Nb minimum',    type: 'number' },
          { key: 'nb_participants_max',label: 'Nb maximum',    type: 'number' },
        ],
        validations: [
          { field: 'vente_pieces', rule: 'requiredIfFalse', onboardingKey: 'vente_sur_place',
            message: 'Vous n\'avez pas déclaré de vente sur place dans votre activité.' },
        ],
      },
    ],
  },

  bijoux_berberes: {
    sections: [
      {
        label: 'Cet atelier / cette visite',
        fields: [
          { key: 'titre',          label: 'Titre',                  type: 'text',   required: true },
          { key: 'type_offre',     label: 'Type',                   type: 'select',
            options: ['Visite atelier', 'Démonstration', 'Initiation', 'Personnalisation'] },
          { key: 'technique_offre',label: 'Technique abordée',      type: 'multiselect',
            dynamicOptions: 'onboarding.techniques' },
          { key: 'duree',          label: 'Durée',                  type: 'text',   required: true },
        ],
        validations: [
          { field: 'technique_offre', rule: 'subset', onboardingKey: 'techniques',
            message: 'Ces techniques ne sont pas déclarées dans votre activité.' },
        ],
      },
      {
        label: 'Réalisation & Commerce',
        fields: [
          { key: 'bijou_cree',            label: 'Bijou créé / personnalisé', type: 'text' },
          { key: 'personnalisation_offre',label: 'Personnalisation incluse',  type: 'boolean' },
          { key: 'vente',                 label: 'Vente de bijoux sur place', type: 'boolean' },
          { key: 'inclus',                label: 'Inclus',                   type: 'multiselect',
            options: ['Matériel fourni', 'Thé à la menthe', 'Bijou à emporter',
                      'Écrin cadeau', 'Photo'] },
          { key: 'nb_participants_min',   label: 'Nb minimum',               type: 'number' },
          { key: 'nb_participants_max',   label: 'Nb maximum',               type: 'number' },
        ],
        validations: [
          { field: 'personnalisation_offre', rule: 'requiredIfFalse', onboardingKey: 'personnalisation',
            message: 'Vous n\'avez pas déclaré la personnalisation dans votre activité.' },
          { field: 'vente',                 rule: 'requiredIfFalse', onboardingKey: 'vente_sur_place',
            message: 'Vous n\'avez pas déclaré de vente sur place dans votre activité.' },
        ],
      },
    ],
  },

  tannerie: {
    sections: [
      {
        label: 'Cette visite',
        fields: [
          { key: 'titre',              label: 'Titre',               type: 'text',   required: true },
          { key: 'type_offre',         label: 'Type',                type: 'select',
            options: ['Visite guidée', 'Visite + produits cuir', 'Visite + achat'] },
          { key: 'duree',              label: 'Durée',               type: 'text',   required: true },
          { key: 'etapes_visitees',    label: 'Étapes présentées',   type: 'multiselect',
            options: ['Trempage', 'Chaulage', 'Tannage végétal', 'Teinture', 'Séchage', 'Finition'] },
          { key: 'langue_guide_offre', label: 'Langue du guide',     type: 'select',
            dynamicOptions: 'onboarding.langues_guide' },
        ],
        validations: [
          { field: 'langue_guide_offre', rule: 'in', onboardingKey: 'langues_guide',
            message: 'Cette langue n\'est pas déclarée dans votre activité.' },
        ],
      },
      {
        label: 'Commerce',
        fields: [
          { key: 'vente_cuir',          label: 'Vente de produits cuir', type: 'boolean' },
          { key: 'types_produits_vente',label: 'Types de produits en vente', type: 'multiselect',
            options: ['Babouches', 'Ceintures', 'Sacs', 'Portefeuilles', 'Vestes', 'Coussins'] },
          { key: 'nb_participants_max', label: 'Nb maximum',              type: 'number' },
        ],
        validations: [
          { field: 'vente_cuir', rule: 'requiredIfFalse', onboardingKey: 'vente_sur_place',
            message: 'Vous n\'avez pas déclaré de vente sur place dans votre activité.' },
        ],
      },
    ],
  },

  parfumerie_naturelle: {
    sections: [
      {
        label: 'Cet atelier',
        fields: [
          { key: 'titre',            label: 'Titre',               type: 'text',   required: true },
          { key: 'type_offre',       label: 'Type',                type: 'select',
            options: ['Visite', 'Démonstration distillation', 'Atelier parfum',
                      'Atelier savon', 'Pack complet'] },
          { key: 'plantes_offre',    label: 'Plantes / fleurs utilisées', type: 'textarea' },
          { key: 'duree',            label: 'Durée',               type: 'text',   required: true },
          { key: 'creation_offre',   label: 'Création réalisée',   type: 'multiselect',
            options: ['Flacon de parfum', 'Savon artisanal', 'Bougie naturelle',
                      'Huile de massage', 'Eau florale'] },
          { key: 'produit_a_emporter',label: 'Produit à emporter', type: 'boolean' },
        ],
      },
      {
        label: 'Commerce & Inclus',
        fields: [
          { key: 'vente_produits',     label: 'Vente de produits sur place', type: 'boolean' },
          { key: 'inclus',             label: 'Inclus',                     type: 'multiselect',
            options: ['Matériel', 'Tablier', 'Tisane aux herbes', 'Fiche recette', 'Emballage cadeau'] },
          { key: 'nb_participants_min',label: 'Nb minimum',                 type: 'number' },
          { key: 'nb_participants_max',label: 'Nb maximum',                 type: 'number' },
        ],
        validations: [
          { field: 'vente_produits', rule: 'requiredIfFalse', onboardingKey: 'vente_sur_place',
            message: 'Vous n\'avez pas déclaré de vente sur place dans votre activité.' },
        ],
      },
    ],
  },

  peinture_traditionnelle: {
    sections: [
      {
        label: 'Cet atelier',
        fields: [
          { key: 'titre',         label: 'Titre',          type: 'text',   required: true },
          { key: 'type_offre',    label: 'Type',           type: 'select',
            options: ['Visite', 'Démonstration', 'Initiation', 'Atelier guidé', 'Cours avancé'] },
          { key: 'style_offre',   label: 'Style abordé',   type: 'select',
            dynamicOptions: 'onboarding.styles' },
          { key: 'support_offre', label: 'Support utilisé', type: 'select',
            dynamicOptions: 'onboarding.supports' },
          { key: 'duree',         label: 'Durée',          type: 'text',   required: true },
          { key: 'niveau',        label: 'Niveau',         type: 'select',
            dynamicOptions: 'onboarding.niveaux' },
        ],
        validations: [
          { field: 'style_offre',   rule: 'in', onboardingKey: 'styles',
            message: 'Ce style n\'est pas déclaré dans votre activité.' },
          { field: 'support_offre', rule: 'in', onboardingKey: 'supports',
            message: 'Ce support n\'est pas déclaré dans votre activité.' },
          { field: 'niveau',        rule: 'in', onboardingKey: 'niveaux',
            message: 'Ce niveau n\'est pas proposé dans votre activité.' },
        ],
      },
      {
        label: 'Réalisation & Commerce',
        fields: [
          { key: 'oeuvre_a_emporter',  label: 'Œuvre à emporter',                type: 'boolean' },
          { key: 'vente_oeuvres',      label: 'Vente d\'œuvres de l\'artiste',   type: 'boolean' },
          { key: 'inclus',             label: 'Inclus',                          type: 'multiselect',
            options: ['Matériel', 'Tablier', 'Café / thé', 'Vernis protection', 'Photo'] },
          { key: 'nb_participants_min',label: 'Nb minimum',                      type: 'number' },
          { key: 'nb_participants_max',label: 'Nb maximum',                      type: 'number' },
        ],
        validations: [
          { field: 'vente_oeuvres', rule: 'requiredIfFalse', onboardingKey: 'vente_sur_place',
            message: 'Vous n\'avez pas déclaré de vente sur place dans votre activité.' },
        ],
      },
    ],
  },

  calligraphie: {
    sections: [
      {
        label: 'Cet atelier',
        fields: [
          { key: 'titre',                 label: 'Titre',             type: 'text',   required: true },
          { key: 'type_offre',            label: 'Type',              type: 'select',
            options: ['Initiation', 'Atelier thématique', 'Perfectionnement', 'Création personnalisée'] },
          { key: 'style_offre',           label: 'Style travaillé',   type: 'select',
            dynamicOptions: 'onboarding.styles' },
          { key: 'support_offre',         label: 'Support',           type: 'select',
            dynamicOptions: 'onboarding.supports' },
          { key: 'duree',                 label: 'Durée',             type: 'text',   required: true },
          { key: 'texte_a_calligraphier', label: 'Texte proposé (optionnel)', type: 'text' },
        ],
        validations: [
          { field: 'style_offre',   rule: 'in', onboardingKey: 'styles',
            message: 'Ce style n\'est pas déclaré dans votre activité.' },
          { field: 'support_offre', rule: 'in', onboardingKey: 'supports',
            message: 'Ce support n\'est pas déclaré dans votre activité.' },
        ],
      },
      {
        label: 'Inclus & Commerce',
        fields: [
          { key: 'materiel_offre',       label: 'Matériel fourni',                   type: 'boolean' },
          { key: 'oeuvre_a_emporter',    label: 'Œuvre à emporter',                  type: 'boolean' },
          { key: 'encadrement_possible', label: 'Encadrement / mise sous cadre possible', type: 'boolean' },
          { key: 'inclus',               label: 'Inclus',                            type: 'multiselect',
            options: ['Calame', 'Encre', 'Papier calligraphie', 'Thé', 'Encadrement'] },
          { key: 'nb_participants_min',  label: 'Nb minimum',                        type: 'number' },
          { key: 'nb_participants_max',  label: 'Nb maximum',                        type: 'number' },
        ],
        validations: [
          { field: 'materiel_offre', rule: 'requiredIfFalse', onboardingKey: 'materiel_disponible',
            message: 'Vous n\'avez pas déclaré de matériel disponible dans votre activité.' },
        ],
      },
    ],
  },

  // calligraphie_arabe uses same structure as calligraphie
  calligraphie_arabe: {
    sections: [
      {
        label: 'Cet atelier',
        fields: [
          { key: 'titre',                 label: 'Titre',             type: 'text',   required: true },
          { key: 'type_offre',            label: 'Type',              type: 'select',
            options: ['Initiation', 'Atelier thématique', 'Perfectionnement', 'Création personnalisée'] },
          { key: 'style_offre',           label: 'Style travaillé',   type: 'select',
            dynamicOptions: 'onboarding.styles' },
          { key: 'support_offre',         label: 'Support',           type: 'select',
            dynamicOptions: 'onboarding.supports' },
          { key: 'duree',                 label: 'Durée',             type: 'text',   required: true },
          { key: 'texte_a_calligraphier', label: 'Texte proposé (optionnel)', type: 'text' },
        ],
        validations: [
          { field: 'style_offre',   rule: 'in', onboardingKey: 'styles',
            message: 'Ce style n\'est pas déclaré dans votre activité.' },
          { field: 'support_offre', rule: 'in', onboardingKey: 'supports',
            message: 'Ce support n\'est pas déclaré dans votre activité.' },
        ],
      },
      {
        label: 'Inclus & Commerce',
        fields: [
          { key: 'materiel_offre',      label: 'Matériel fourni',    type: 'boolean' },
          { key: 'oeuvre_a_emporter',   label: 'Œuvre à emporter',   type: 'boolean' },
          { key: 'inclus',              label: 'Inclus',             type: 'multiselect',
            options: ['Calame', 'Encre', 'Papier calligraphie', 'Thé', 'Encadrement'] },
          { key: 'nb_participants_min', label: 'Nb minimum',         type: 'number' },
          { key: 'nb_participants_max', label: 'Nb maximum',         type: 'number' },
          { key: 'vente_oeuvres',       label: 'Vente d\'œuvres',    type: 'boolean' },
        ],
        validations: [
          { field: 'materiel_offre', rule: 'requiredIfFalse', onboardingKey: 'materiel_disponible',
            message: 'Vous n\'avez pas déclaré de matériel disponible dans votre activité.' },
        ],
      },
    ],
  },

  // AGRICULTURE & TERROIR — legacy
  visite_ferme:           { sections: [{ label: 'Cette visite', fields: [{ key: 'duree', label: 'Durée', type: 'text' }, { key: 'nb_participants_max', label: 'Nb maximum', type: 'number' }] }] },
  cueillette:             { sections: [{ label: 'Cette cueillette', fields: [{ key: 'duree', label: 'Durée', type: 'text' }, { key: 'nb_participants_max', label: 'Nb maximum', type: 'number' }] }] },
  atelier_huile_olive:    { sections: [{ label: 'Cet atelier', fields: [{ key: 'duree', label: 'Durée', type: 'text' }, { key: 'nb_participants_max', label: 'Nb maximum', type: 'number' }] }] },
  atelier_fromage_yaourt: { sections: [{ label: 'Cet atelier', fields: [{ key: 'duree', label: 'Durée', type: 'text' }, { key: 'nb_participants_max', label: 'Nb maximum', type: 'number' }] }] },
  apiculture:             { sections: [{ label: 'Cette visite', fields: [{ key: 'duree', label: 'Durée', type: 'text' }, { key: 'nb_participants_max', label: 'Nb maximum', type: 'number' }] }] },
  viticulture:            { sections: [{ label: 'Cette visite', fields: [{ key: 'duree', label: 'Durée', type: 'text' }, { key: 'nb_participants_max', label: 'Nb maximum', type: 'number' }] }] },
  elevage_responsable:    { sections: [{ label: 'Cette visite', fields: [{ key: 'duree', label: 'Durée', type: 'text' }, { key: 'nb_participants_max', label: 'Nb maximum', type: 'number' }] }] },

  // ══════════════════════════════════════════════════════════════════════════
  // 🏛️ CULTURE & PATRIMOINE
  // ══════════════════════════════════════════════════════════════════════════

  visite_medina: {
    sections: [
      {
        label: 'Cette visite',
        fields: [
          { key: 'titre',                label: 'Titre',                     type: 'text',   required: true },
          { key: 'type_visite_offre',    label: 'Type',                      type: 'select',
            options: ['Classique', 'Thématique', 'Photo', 'Culinaire', 'Nocturne'] },
          { key: 'theme_visite',         label: 'Thème de la visite',        type: 'text' },
          { key: 'duree',                label: 'Durée',                     type: 'text',   required: true },
          { key: 'itineraire_detaille',  label: 'Itinéraire détaillé',       type: 'textarea' },
          { key: 'points_forts',         label: 'Points forts',              type: 'textarea' },
          { key: 'langue_guide_offre',   label: 'Langue du guide',           type: 'select',
            dynamicOptions: 'onboarding.langues_guide' },
        ],
        validations: [
          { field: 'langue_guide_offre',   rule: 'in',  onboardingKey: 'langues_guide',
            message: 'Cette langue n\'est pas déclarée dans votre activité.' },
          { field: 'nb_participants_max',  rule: 'lte', onboardingKey: 'groupe_max',
            message: 'Dépasse la taille de groupe maximale déclarée ({value}).' },
        ],
      },
      {
        label: 'Inclus',
        fields: [
          { key: 'inclus', label: 'Inclus', type: 'multiselect',
            options: ['Guide certifié', 'Carte de la médina', 'Thé de bienvenue',
                      'Dégustation locale', 'Entrées sites', 'Photo souvenir'] },
          { key: 'nb_participants_min', label: 'Nb minimum', type: 'number' },
          { key: 'nb_participants_max', label: 'Nb maximum', type: 'number' },
        ],
      },
    ],
  },

  circuit_historique: {
    sections: [
      {
        label: 'Ce circuit',
        fields: [
          { key: 'titre',                label: 'Titre',                      type: 'text',   required: true },
          { key: 'periode_couverte',     label: 'Période historique couverte', type: 'multiselect',
            dynamicOptions: 'onboarding.periodes_historiques' },
          { key: 'sites_inclus_offre',   label: 'Sites inclus',               type: 'textarea' },
          { key: 'duree',                label: 'Durée',                      type: 'text',   required: true },
          { key: 'type_format',          label: 'Format',                     type: 'select',
            options: ['Demi-journée', 'Journée', 'Multi-jours'] },
          { key: 'langue_guide_offre',   label: 'Langue du guide',            type: 'select',
            dynamicOptions: 'onboarding.langues_guide' },
          { key: 'transport_inclus',     label: 'Transport inclus',           type: 'boolean' },
        ],
        validations: [
          { field: 'periode_couverte',    rule: 'subset', onboardingKey: 'periodes_historiques',
            message: 'Ces périodes ne sont pas déclarées dans votre activité.' },
          { field: 'langue_guide_offre',  rule: 'in',     onboardingKey: 'langues_guide',
            message: 'Cette langue n\'est pas déclarée dans votre activité.' },
          { field: 'nb_participants_max', rule: 'lte',    onboardingKey: 'groupe_max',
            message: 'Dépasse la taille de groupe maximale déclarée ({value}).' },
        ],
      },
      {
        label: 'Inclus',
        fields: [
          { key: 'inclus', label: 'Inclus', type: 'multiselect',
            options: ['Guide certifié', 'Entrées des sites', 'Repas', 'Transport',
                      'Audioguide', 'Livre souvenir'] },
          { key: 'nb_participants_min', label: 'Nb minimum', type: 'number' },
          { key: 'nb_participants_max', label: 'Nb maximum', type: 'number' },
        ],
      },
    ],
  },

  visite_musee: {
    sections: [
      {
        label: 'Cette visite',
        fields: [
          { key: 'titre',              label: 'Titre',            type: 'text',   required: true },
          { key: 'type_offre',         label: 'Type',             type: 'select',
            options: ['Guidée', 'Libre', 'Thématique', 'Groupe scolaire'] },
          { key: 'duree',              label: 'Durée',            type: 'text',   required: true },
          { key: 'focus_visite',       label: 'Focus / points forts', type: 'textarea' },
          { key: 'langue_guide_offre', label: 'Langue du guide', type: 'select',
            dynamicOptions: 'onboarding.langues_guide' },
          { key: 'audioguide_offre',   label: 'Audioguide fourni', type: 'boolean' },
        ],
        validations: [
          { field: 'langue_guide_offre', rule: 'in',          onboardingKey: 'langues_guide',
            message: 'Cette langue n\'est pas déclarée dans votre activité.' },
          { field: 'audioguide_offre',   rule: 'requiredIfFalse', onboardingKey: 'materiel_audio',
            message: 'Vous n\'avez pas déclaré d\'audioguide dans votre activité.' },
        ],
      },
      {
        label: 'Inclus',
        fields: [
          { key: 'inclus', label: 'Inclus', type: 'multiselect',
            options: ['Guide', 'Entrée musée', 'Audioguide', 'Plan du site', 'Livret pédagogique'] },
          { key: 'nb_participants_min', label: 'Nb minimum', type: 'number' },
          { key: 'nb_participants_max', label: 'Nb maximum', type: 'number' },
        ],
      },
    ],
  },

  soiree_culturelle: {
    sections: [
      {
        label: 'Cette soirée',
        fields: [
          { key: 'titre',                  label: 'Titre',                     type: 'text',   required: true },
          { key: 'programme_offre',        label: 'Programme',                 type: 'multiselect',
            dynamicOptions: 'onboarding.type_soiree' },
          { key: 'duree',                  label: 'Durée',                     type: 'text',   required: true },
          { key: 'description_programme',  label: 'Description détaillée',     type: 'textarea' },
          { key: 'espace_offre',           label: 'Espace',                    type: 'select',
            dynamicOptions: 'onboarding.cadre' },
          { key: 'restauration_offre',     label: 'Restauration incluse',      type: 'boolean' },
          { key: 'menu_soiree',            label: 'Menu / boissons',           type: 'textarea',
            conditionalOn: { field: 'restauration_offre', value: true } },
          { key: 'nb_participants_min',    label: 'Nb minimum',                type: 'number' },
          { key: 'nb_participants_max',    label: 'Nb maximum',                type: 'number' },
        ],
        validations: [
          { field: 'programme_offre',     rule: 'subset', onboardingKey: 'type_soiree',
            message: 'Ces éléments ne sont pas déclarés dans votre activité.' },
          { field: 'nb_participants_max', rule: 'lte',    onboardingKey: 'capacite',
            message: 'Dépasse la capacité déclarée ({value}).' },
        ],
      },
    ],
  },

  spectacle_traditionnel: {
    sections: [
      {
        label: 'Ce spectacle',
        fields: [
          { key: 'titre',                  label: 'Titre',                  type: 'text',   required: true },
          { key: 'type_spectacle_offre',   label: 'Type',                   type: 'multiselect',
            dynamicOptions: 'onboarding.type_spectacle' },
          { key: 'duree',                  label: 'Durée',                  type: 'text',   required: true },
          { key: 'synopsis',               label: 'Synopsis / description', type: 'textarea' },
          { key: 'artistes',               label: 'Artistes / interprètes', type: 'textarea' },
          { key: 'nb_places_offre',        label: 'Nb de places',           type: 'number' },
          { key: 'enfants_offre',          label: 'Adapté aux enfants',     type: 'boolean' },
        ],
        validations: [
          { field: 'type_spectacle_offre', rule: 'subset', onboardingKey: 'type_spectacle',
            message: 'Ces types ne sont pas déclarés dans votre activité.' },
          { field: 'nb_places_offre',      rule: 'lte',    onboardingKey: 'capacite',
            message: 'Dépasse la capacité de la salle déclarée ({value}).' },
        ],
      },
    ],
  },

  atelier_musical: {
    sections: [
      {
        label: 'Cet atelier',
        fields: [
          { key: 'titre',          label: 'Titre',           type: 'text',   required: true },
          { key: 'instrument_offre',label: 'Instrument(s)',  type: 'textarea' },
          { key: 'style_offre',    label: 'Style musical',   type: 'multiselect',
            dynamicOptions: 'onboarding.style_musical' },
          { key: 'duree',          label: 'Durée',           type: 'text',   required: true },
          { key: 'niveau_offre',   label: 'Niveau',          type: 'select',
            dynamicOptions: 'onboarding.niveaux' },
        ],
        validations: [
          { field: 'style_offre',         rule: 'subset', onboardingKey: 'style_musical',
            message: 'Ces styles ne sont pas déclarés dans votre activité.' },
          { field: 'niveau_offre',        rule: 'in',     onboardingKey: 'niveaux',
            message: 'Ce niveau n\'est pas proposé dans votre activité.' },
          { field: 'nb_participants_max', rule: 'lte',    onboardingKey: 'capacite_max',
            message: 'Dépasse la capacité maximale déclarée ({value}).' },
        ],
      },
      {
        label: 'Inclus',
        fields: [
          { key: 'instruments_fournis', label: 'Instruments fournis',  type: 'boolean' },
          { key: 'inclus',              label: 'Inclus',               type: 'multiselect',
            options: ['Instrument', 'Partition', 'Enregistrement audio', 'Thé', 'Certificat'] },
          { key: 'nb_participants_min', label: 'Nb minimum',           type: 'number' },
          { key: 'nb_participants_max', label: 'Nb maximum',           type: 'number' },
        ],
        validations: [
          { field: 'instruments_fournis', rule: 'requiredIfFalse', onboardingKey: 'instruments',
            message: 'Vous n\'avez pas déclaré d\'instruments disponibles dans votre activité.' },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 🧘 BIEN-ÊTRE & SPA
  // ══════════════════════════════════════════════════════════════════════════

  hammam_traditionnel: {
    sections: [
      {
        label: 'Cette prestation',
        fields: [
          { key: 'titre',           label: 'Titre',   type: 'text',   required: true },
          { key: 'type_prestation', label: 'Type',    type: 'select',
            options: ['Hammam simple', 'Hammam + gommage', 'Rituel complet', 'Privatisation'] },
          { key: 'pour_qui',        label: 'Pour qui', type: 'select',
            options: ['Homme', 'Femme', 'Mixte', 'Couple'] },
          { key: 'duree',           label: 'Durée',   type: 'select',
            options: ['30 min', '45 min', '60 min', '90 min', '120 min'] },
        ],
        validations: [
          { field: 'nb_participants_max', rule: 'lte', onboardingKey: 'capacite',
            message: 'Dépasse la capacité déclarée ({value}).' },
        ],
      },
      {
        label: 'Soins & Confort',
        fields: [
          { key: 'soins_inclus',       label: 'Soins inclus',     type: 'multiselect',
            dynamicOptions: 'onboarding.soins_proposes' },
          { key: 'confort_inclus',     label: 'Confort inclus',   type: 'multiselect',
            options: ['Serviette', 'Peignoir', 'Savates', 'Thé à la menthe après'] },
          { key: 'privatisation_offre',label: 'Offre en privatisation', type: 'boolean' },
          { key: 'nb_personnes_offre', label: 'Nb de personnes',  type: 'number' },
        ],
        validations: [
          { field: 'soins_inclus', rule: 'subset', onboardingKey: 'soins_proposes',
            message: 'Ces soins ne sont pas déclarés dans votre activité.' },
        ],
      },
    ],
  },

  massage_naturel: {
    sections: [
      {
        label: 'Cette séance',
        fields: [
          { key: 'titre',           label: 'Titre',           type: 'text',   required: true },
          { key: 'type_massage',    label: 'Type de massage', type: 'select',
            dynamicOptions: 'onboarding.types_massage' },
          { key: 'duree',           label: 'Durée',           type: 'select',
            options: ['30 min', '45 min', '60 min', '75 min', '90 min', '120 min'] },
          { key: 'huile_principale',label: 'Huile principale utilisée', type: 'text' },
          { key: 'focus_corporel',  label: 'Focus corporel',  type: 'multiselect',
            options: ['Dos', 'Nuque', 'Jambes', 'Pieds', 'Visage', 'Corps entier', 'Sur demande'] },
        ],
        validations: [
          { field: 'type_massage', rule: 'in', onboardingKey: 'types_massage',
            message: 'Ce type de massage n\'est pas déclaré dans votre activité.' },
        ],
      },
      {
        label: 'Inclus',
        fields: [
          { key: 'inclus', label: 'Inclus', type: 'multiselect',
            options: ['Bilan bien-être avant', 'Douche avant massage', 'Tisane après',
                      'Temps de repos', 'Musique relaxante'] },
        ],
      },
    ],
  },

  retraite_yoga: {
    sections: [
      {
        label: 'Cette retraite',
        fields: [
          { key: 'titre',            label: 'Titre',          type: 'text',   required: true },
          { key: 'style_yoga_offre', label: 'Style de yoga',  type: 'select',
            dynamicOptions: 'onboarding.styles_yoga' },
          { key: 'duree_offre',      label: 'Durée',          type: 'select',
            dynamicOptions: 'onboarding.duree_retraite' },
          { key: 'theme',            label: 'Thème',          type: 'select',
            options: ['Reconnexion', 'Détox', 'Silence', 'Couple', 'Solo', 'Famille'] },
        ],
        validations: [
          { field: 'style_yoga_offre',   rule: 'in',  onboardingKey: 'styles_yoga',
            message: 'Ce style n\'est pas déclaré dans votre activité.' },
          { field: 'duree_offre',        rule: 'in',  onboardingKey: 'duree_retraite',
            message: 'Cette durée n\'est pas proposée dans votre activité.' },
          { field: 'nb_participants_max',rule: 'lte', onboardingKey: 'capacite_max',
            message: 'Dépasse la capacité maximale déclarée ({value}).' },
        ],
      },
      {
        label: 'Programme',
        fields: [
          { key: 'nb_seances_jour',      label: 'Nb de séances yoga / jour',   type: 'number' },
          { key: 'duree_seance',         label: 'Durée par séance',            type: 'text' },
          { key: 'meditation_incluse',   label: 'Méditation incluse',          type: 'boolean' },
          { key: 'ateliers_bienetre',    label: 'Ateliers bien-être',          type: 'multiselect',
            options: ['Pranayama', 'Sound healing', 'Naturopathie', 'Pleine conscience', 'Massage'] },
        ],
      },
      {
        label: 'Hébergement & Restauration',
        fields: [
          { key: 'hebergement_offre',          label: 'Hébergement inclus',      type: 'boolean' },
          { key: 'type_hebergement_retraite',  label: 'Type d\'hébergement',     type: 'text',
            conditionalOn: { field: 'hebergement_offre', value: true } },
          { key: 'chambre_type',               label: 'Chambre',                 type: 'select',
            options: ['Individuelle', 'Partagée', 'Au choix'],
            conditionalOn: { field: 'hebergement_offre', value: true } },
          { key: 'restauration_offre',         label: 'Restauration incluse',    type: 'boolean' },
          { key: 'regime_alimentaire',         label: 'Régime alimentaire',      type: 'select',
            options: ['Végétarien', 'Vegan', 'Sans gluten', 'Non spécifié'],
            conditionalOn: { field: 'restauration_offre', value: true } },
          { key: 'nb_repas_jour',              label: 'Nb de repas / jour',      type: 'number',
            conditionalOn: { field: 'restauration_offre', value: true } },
        ],
        validations: [
          { field: 'hebergement_offre',  rule: 'requiredIfFalse', onboardingKey: 'hebergement_inclus',
            message: 'Vous n\'avez pas déclaré l\'hébergement inclus dans votre activité.' },
          { field: 'restauration_offre', rule: 'requiredIfFalse', onboardingKey: 'repas_inclus',
            message: 'Vous n\'avez pas déclaré les repas inclus dans votre activité.' },
        ],
      },
      {
        label: 'Activités & Capacité',
        fields: [
          { key: 'activites_complementaires', label: 'Activités complémentaires', type: 'multiselect',
            options: ['Randonnée nature', 'Bain de forêt', 'Atelier cuisine saine',
                      'Cercle de partage', 'Massage inclus', 'Hammam inclus'] },
          { key: 'nb_participants_min',       label: 'Nb minimum',               type: 'number' },
          { key: 'nb_participants_max',       label: 'Nb maximum',               type: 'number' },
        ],
      },
    ],
  },

  meditation: {
    sections: [
      {
        label: 'Cette séance',
        fields: [
          { key: 'titre',           label: 'Titre',     type: 'text',   required: true },
          { key: 'type_offre',      label: 'Type',      type: 'select',
            options: ['Séance unique', 'Pack 5 séances', 'Journée immersive', 'Retraite'] },
          { key: 'technique_offre', label: 'Technique', type: 'multiselect',
            dynamicOptions: 'onboarding.styles' },
          { key: 'cadre_offre',     label: 'Cadre',     type: 'select',
            dynamicOptions: 'onboarding.cadre' },
          { key: 'duree',           label: 'Durée',     type: 'text',   required: true },
        ],
        validations: [
          { field: 'technique_offre',     rule: 'subset', onboardingKey: 'styles',
            message: 'Ces techniques ne sont pas déclarées dans votre activité.' },
          { field: 'cadre_offre',         rule: 'in',     onboardingKey: 'cadre',
            message: 'Ce cadre n\'est pas déclaré dans votre activité.' },
          { field: 'nb_participants_max', rule: 'lte',    onboardingKey: 'capacite_max',
            message: 'Dépasse la capacité maximale déclarée ({value}).' },
        ],
      },
      {
        label: 'Inclus & Capacité',
        fields: [
          { key: 'inclus', label: 'Inclus', type: 'multiselect',
            options: ['Coussin de méditation', 'Couverture', 'Tisane', 'Musique guidée',
                      'Carnet de bord', 'Exercices à emporter'] },
          { key: 'nb_participants_min', label: 'Nb minimum', type: 'number' },
          { key: 'nb_participants_max', label: 'Nb maximum', type: 'number' },
        ],
      },
    ],
  },

  bain_thermal: {
    sections: [
      {
        label: 'Cette offre',
        fields: [
          { key: 'titre',          label: 'Titre',  type: 'text',   required: true },
          { key: 'type_offre',     label: 'Type',   type: 'select',
            options: ['Bain simple', 'Forfait soins', 'Journée bien-être', 'Cure'] },
          { key: 'duree',          label: 'Durée',  type: 'text',   required: true },
        ],
        validations: [
          { field: 'nb_personnes_offre', rule: 'lte', onboardingKey: 'capacite',
            message: 'Dépasse la capacité déclarée ({value}).' },
        ],
      },
      {
        label: 'Soins & Inclus',
        fields: [
          { key: 'soins_inclus',       label: 'Soins inclus',      type: 'multiselect',
            options: ['Massage', 'Gommage', 'Enveloppement', 'Bain de boue', 'Consultation'] },
          { key: 'inclus',             label: 'Inclus',            type: 'multiselect',
            options: ['Serviette', 'Peignoir', 'Casier', 'Eau minérale', 'Tisane', 'Repas'] },
          { key: 'contre_indications', label: 'Contre-indications', type: 'textarea' },
          { key: 'pmr_offre',          label: 'Accessible PMR',    type: 'boolean' },
          { key: 'nb_personnes_offre', label: 'Nb de personnes',   type: 'number' },
        ],
        validations: [
          { field: 'pmr_offre', rule: 'requiredIfFalse', onboardingKey: 'accessibilite_pmr',
            message: 'Vous n\'avez pas déclaré l\'accessibilité PMR dans votre activité.' },
        ],
      },
    ],
  },

  therapie_plantes: {
    sections: [
      {
        label: 'Ce soin',
        fields: [
          { key: 'titre',           label: 'Titre',                          type: 'text',   required: true },
          { key: 'type_soin_offre', label: 'Type de soin',                   type: 'multiselect',
            dynamicOptions: 'onboarding.type_therapie' },
          { key: 'plantes_offre',   label: 'Plantes utilisées dans ce soin', type: 'textarea' },
          { key: 'duree',           label: 'Durée',                          type: 'text',   required: true },
          { key: 'cadre_offre',     label: 'Cadre',                          type: 'select',
            options: ['Intérieur', 'Jardin', 'Nature'] },
        ],
        validations: [
          { field: 'type_soin_offre', rule: 'subset', onboardingKey: 'type_therapie',
            message: 'Ces soins ne sont pas déclarés dans votre activité.' },
        ],
      },
      {
        label: 'Inclus',
        fields: [
          { key: 'inclus',              label: 'Inclus',            type: 'multiselect',
            options: ['Bilan initial', 'Tisane à emporter', 'Fiche plantes', 'Conseils thérapeute'] },
          { key: 'contre_indications',  label: 'Contre-indications', type: 'textarea' },
        ],
      },
    ],
  },

  gommage_savon_noir: {
    sections: [
      {
        label: 'Ce soin',
        fields: [
          { key: 'titre',      label: 'Titre',    type: 'text',   required: true },
          { key: 'type_offre', label: 'Type',     type: 'select',
            options: ['Gommage simple', 'Gommage + massage', 'Rituel complet', 'Privatisation'] },
          { key: 'pour_qui',   label: 'Pour qui', type: 'select',
            options: ['Homme', 'Femme', 'Mixte', 'Couple'] },
          { key: 'duree',      label: 'Durée',    type: 'select',
            options: ['30 min', '45 min', '60 min', '90 min'] },
        ],
      },
      {
        label: 'Produits & Inclus',
        fields: [
          { key: 'produits_offre', label: 'Produits utilisés', type: 'multiselect',
            dynamicOptions: 'onboarding.produits_complementaires' },
          { key: 'cadre_offre',   label: 'Cadre',              type: 'select',
            dynamicOptions: 'onboarding.organisation' },
          { key: 'inclus',        label: 'Inclus',             type: 'multiselect',
            options: ['Serviette', 'Peignoir', 'Thé à la menthe', 'Savates', 'Temps de repos'] },
        ],
        validations: [
          { field: 'produits_offre', rule: 'subset', onboardingKey: 'produits_complementaires',
            message: 'Ces produits ne sont pas déclarés dans votre activité.' },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 🚲 TRANSPORT ÉCO
  // ══════════════════════════════════════════════════════════════════════════

  location_velo: {
    sections: [
      {
        label: 'Cette location',
        fields: [
          { key: 'titre',            label: 'Titre',                 type: 'text',   required: true },
          { key: 'type_velo_offre',  label: 'Type de vélo',          type: 'select',
            dynamicOptions: 'onboarding.types_velos' },
          { key: 'nb_velos_offre',   label: 'Nb de vélos disponibles', type: 'number' },
          { key: 'duree_location',   label: 'Durée de location',     type: 'select',
            options: ['1 heure', 'Demi-journée', 'Journée', 'Week-end', 'Semaine'] },
        ],
        validations: [
          { field: 'type_velo_offre', rule: 'in',  onboardingKey: 'types_velos',
            message: 'Ce type de vélo n\'est pas déclaré dans votre activité.' },
          { field: 'nb_velos_offre',  rule: 'lte', onboardingKey: 'nb_velos',
            message: 'Dépasse le nombre de vélos déclaré ({value}).' },
        ],
      },
      {
        label: 'Équipement & Services',
        fields: [
          { key: 'equipement_fourni',         label: 'Équipement fourni',                  type: 'multiselect',
            dynamicOptions: 'onboarding.equipement_inclus' },
          { key: 'itineraire_fourni',         label: 'Itinéraire conseillé fourni',        type: 'boolean' },
          { key: 'livraison_offre',           label: 'Livraison au point de départ',       type: 'boolean' },
          { key: 'recuperation_autre_point',  label: 'Récupération à un autre point',      type: 'boolean' },
        ],
        validations: [
          { field: 'equipement_fourni', rule: 'subset', onboardingKey: 'equipement_inclus',
            message: 'Cet équipement n\'est pas déclaré dans votre activité.' },
        ],
      },
    ],
  },

  caleche: {
    sections: [
      {
        label: 'Cette balade',
        fields: [
          { key: 'titre',              label: 'Titre',                      type: 'text',   required: true },
          { key: 'type_offre',         label: 'Type',                       type: 'select',
            options: ['Balade découverte', 'Circuit touristique', 'Privatisation', 'Transfert'] },
          { key: 'itineraire',         label: 'Itinéraire / parcours',      type: 'textarea', required: true },
          { key: 'duree',              label: 'Durée',                      type: 'text',   required: true },
          { key: 'nb_personnes_offre', label: 'Nb de personnes',            type: 'number' },
        ],
        validations: [
          { field: 'nb_personnes_offre', rule: 'lte', onboardingKey: 'capacite_par_vehicule',
            message: 'Dépasse la capacité par véhicule déclarée ({value}).' },
        ],
      },
      {
        label: 'Inclus',
        fields: [
          { key: 'inclus', label: 'Inclus', type: 'multiselect',
            options: ['Commentaire du cocher', 'Arrêts photo', 'Thé à l\'arrivée', 'Couverture (hiver)'] },
        ],
      },
    ],
  },

  bateau_traditionnel: {
    sections: [
      {
        label: 'Ce tour',
        fields: [
          { key: 'titre',              label: 'Titre',           type: 'text',   required: true },
          { key: 'type_offre',         label: 'Type',            type: 'select',
            options: ['Tour découverte', 'Coucher de soleil', 'Pêche', 'Privatisation'] },
          { key: 'itineraire',         label: 'Itinéraire',      type: 'textarea' },
          { key: 'duree',              label: 'Durée',           type: 'text',   required: true },
          { key: 'nb_personnes_offre', label: 'Nb de personnes', type: 'number' },
        ],
        validations: [
          { field: 'nb_personnes_offre', rule: 'lte', onboardingKey: 'capacite_par_bateau',
            message: 'Dépasse la capacité par bateau déclarée ({value}).' },
        ],
      },
      {
        label: 'À bord & Inclus',
        fields: [
          { key: 'arrets_baignade',    label: 'Arrêts baignade',   type: 'boolean' },
          { key: 'nb_arrets',          label: 'Nb d\'arrêts',      type: 'number',
            conditionalOn: { field: 'arrets_baignade', value: true } },
          { key: 'restauration_bord',  label: 'Restauration à bord', type: 'boolean' },
          { key: 'menu_bord',          label: 'Menu / boissons',    type: 'textarea',
            conditionalOn: { field: 'restauration_bord', value: true } },
          { key: 'inclus',             label: 'Inclus',             type: 'multiselect',
            options: ['Gilets de sauvetage', 'Masques / tubas', 'Serviettes', 'Eau', 'Photos'] },
        ],
      },
    ],
  },

  tuk_tuk: {
    sections: [
      {
        label: 'Ce trajet / tour',
        fields: [
          { key: 'titre',               label: 'Titre',                            type: 'text',   required: true },
          { key: 'type_offre',          label: 'Type',                             type: 'select',
            options: ['Trajet A→B', 'Tour découverte', 'Circuit ville', 'Privatisation'] },
          { key: 'itineraire_trajet',   label: 'Itinéraire / trajet',              type: 'textarea' },
          { key: 'duree',               label: 'Durée',                            type: 'text',   required: true },
          { key: 'nb_personnes_offre',  label: 'Nb de personnes',                  type: 'number' },
          { key: 'commentaire_inclus',  label: 'Commentaire touristique inclus',   type: 'boolean' },
          { key: 'arrets_photo',        label: 'Arrêts photo inclus',              type: 'boolean' },
        ],
        validations: [
          { field: 'nb_personnes_offre', rule: 'lte', onboardingKey: 'nb_tuk_tuks',
            message: 'Vérifiez la capacité déclarée dans votre activité.' },
        ],
      },
    ],
  },

  dromadaire: {
    sections: [
      {
        label: 'Cette balade',
        fields: [
          { key: 'titre',                  label: 'Titre',                  type: 'text',   required: true },
          { key: 'type_offre',             label: 'Type',                   type: 'select',
            options: ['Courte (30min)', 'Coucher de soleil', 'Demi-journée', 'Journée', 'Bivouac'] },
          { key: 'itineraire',             label: 'Itinéraire / parcours',  type: 'textarea', required: true },
          { key: 'duree',                  label: 'Durée',                  type: 'text',   required: true },
          { key: 'nb_dromadaires_offre',   label: 'Nb de dromadaires',      type: 'number' },
        ],
        validations: [
          { field: 'nb_dromadaires_offre', rule: 'lte', onboardingKey: 'nb_dromadaires',
            message: 'Dépasse le nombre de dromadaires déclaré ({value}).' },
        ],
      },
      {
        label: 'Confort & Conditions',
        fields: [
          { key: 'selle_confortable',     label: 'Selle confortable fournie',          type: 'boolean' },
          { key: 'aide_montee_descente',  label: 'Aide pour monter / descendre',       type: 'boolean' },
          { key: 'inclus',                label: 'Inclus',                             type: 'multiselect',
            options: ['Thé dans le désert', 'Photo souvenir', 'Turban berbère', 'Coucher de soleil'] },
          { key: 'poids_max_kg',          label: 'Poids maximum (kg)',                  type: 'number', required: true },
          { key: 'age_minimum_offre',     label: 'Âge minimum',                        type: 'number' },
          { key: 'femmes_enceintes',      label: 'Femmes enceintes acceptées',         type: 'boolean' },
          { key: 'nb_participants_max',   label: 'Nb maximum',                         type: 'number' },
        ],
      },
    ],
  },

  transfert_partage: {
    sections: [
      {
        label: 'Ce transfert',
        fields: [
          { key: 'titre',              label: 'Titre',                        type: 'text',   required: true },
          { key: 'trajet_exact',       label: 'Trajet exact',                 type: 'text',   required: true },
          { key: 'type_vehicule_offre',label: 'Type de véhicule',             type: 'select',
            dynamicOptions: 'onboarding.type_vehicule' },
          { key: 'duree_trajet',       label: 'Durée du trajet',              type: 'text' },
          { key: 'horaires_depart',    label: 'Horaires de départ disponibles', type: 'textarea' },
        ],
        validations: [
          { field: 'type_vehicule_offre', rule: 'in',  onboardingKey: 'type_vehicule',
            message: 'Ce type de véhicule n\'est pas déclaré dans votre activité.' },
          { field: 'nb_places_offre',     rule: 'lte', onboardingKey: 'nb_places',
            message: 'Dépasse le nombre de places déclaré ({value}).' },
        ],
      },
      {
        label: 'Services & Capacité',
        fields: [
          { key: 'nb_places_offre',    label: 'Nb de places',  type: 'number' },
          { key: 'bagages_inclus',     label: 'Bagages inclus', type: 'select',
            options: ['1 bagage cabine', '1 bagage soute', 'Illimité'] },
          { key: 'wifi_bord',          label: 'Wifi à bord',    type: 'boolean' },
          { key: 'pmr_offre',          label: 'Accessible PMR', type: 'boolean' },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 🤝 VOLONTARIAT & ÉCO-ACTION
  // ══════════════════════════════════════════════════════════════════════════

  plantation_arbres: {
    sections: [
      {
        label: 'Cette mission',
        fields: [
          { key: 'titre',               label: 'Titre',                type: 'text',   required: true },
          { key: 'zone_precise',        label: 'Zone précise',         type: 'text',   required: true },
          { key: 'especes_mission',     label: 'Espèces à planter',    type: 'textarea' },
          { key: 'nb_arbres',           label: 'Nb d\'arbres à planter', type: 'number' },
          { key: 'duree',               label: 'Durée',                type: 'text',   required: true },
          { key: 'difficulte_physique', label: 'Difficulté physique',  type: 'select',
            options: ['Aucune', 'Légère', 'Modérée'] },
        ],
        validations: [
          { field: 'nb_participants_max', rule: 'lte', onboardingKey: 'groupe_max',
            message: 'Dépasse la capacité bénévoles déclarée ({value}).' },
        ],
      },
      {
        label: 'Fourni & Suivi',
        fields: [
          { key: 'fourni',                label: 'Fourni par l\'organisateur',          type: 'multiselect',
            options: ['Outils', 'Gants', 'Eau et collation', 'Déjeuner partagé', 'Transport'] },
          { key: 'certificat_participation', label: 'Certificat de participation',      type: 'boolean' },
          { key: 'photo_arbre_nomme',     label: 'Photo de l\'arbre planté avec son nom', type: 'boolean' },
          { key: 'suivi_6mois',           label: 'Suivi de l\'arbre dans 6 mois (email)', type: 'boolean' },
          { key: 'briefing_foret',        label: 'Briefing sur l\'importance de la forêt', type: 'boolean' },
          { key: 'nb_participants_min',   label: 'Nb minimum',                          type: 'number' },
          { key: 'nb_participants_max',   label: 'Nb maximum',                          type: 'number' },
        ],
      },
    ],
  },

  nettoyage_plage: {
    sections: [
      {
        label: 'Cette action',
        fields: [
          { key: 'titre',               label: 'Titre',                  type: 'text',   required: true },
          { key: 'zone_concernee',      label: 'Zone concernée',         type: 'text',   required: true },
          { key: 'duree',               label: 'Durée',                  type: 'text',   required: true },
          { key: 'type_dechets_cibles', label: 'Types de déchets ciblés', type: 'multiselect',
            options: ['Plastiques', 'Mégots', 'Verre', 'Déchets organiques', 'Filets de pêche'] },
        ],
        validations: [
          { field: 'nb_participants_max', rule: 'lte', onboardingKey: 'groupe_max',
            message: 'Dépasse la capacité bénévoles déclarée ({value}).' },
        ],
      },
      {
        label: 'Fourni & Inclus',
        fields: [
          { key: 'fourni',                  label: 'Fourni',                        type: 'multiselect',
            options: ['Sacs de collecte', 'Gants', 'Pinces', 'Eau / collation',
                      'Transport', 'T-shirt souvenir', 'Attestation participation'] },
          { key: 'sensibilisation_incluse', label: 'Sensibilisation incluse',       type: 'boolean' },
          { key: 'donnees_partagees',       label: 'Données collectées partagées (kg)', type: 'boolean' },
          { key: 'nb_participants_min',     label: 'Nb minimum',                    type: 'number' },
          { key: 'nb_participants_max',     label: 'Nb maximum',                    type: 'number' },
        ],
      },
    ],
  },

  nettoyage_foret: {
    sections: [
      {
        label: 'Cette action',
        fields: [
          { key: 'titre',         label: 'Titre',              type: 'text',   required: true },
          { key: 'zone_foret',    label: 'Zone de forêt',      type: 'text',   required: true },
          { key: 'duree',         label: 'Durée',              type: 'text',   required: true },
          { key: 'type_travaux',  label: 'Type de travaux',    type: 'multiselect',
            options: ['Collecte déchets', 'Débroussaillage', 'Nettoyage sentiers', 'Élagage préventif'] },
        ],
        validations: [
          { field: 'nb_participants_max', rule: 'lte', onboardingKey: 'groupe_max',
            message: 'Dépasse la capacité bénévoles déclarée ({value}).' },
        ],
      },
      {
        label: 'Fourni & Inclus',
        fields: [
          { key: 'fourni',              label: 'Fourni',     type: 'multiselect',
            options: ['Outils', 'Gants', 'Eau / collation', 'Transport', 'Attestation'] },
          { key: 'nb_participants_min', label: 'Nb minimum', type: 'number' },
          { key: 'nb_participants_max', label: 'Nb maximum', type: 'number' },
        ],
      },
    ],
  },

  education_environnementale: {
    sections: [
      {
        label: 'Cette session',
        fields: [
          { key: 'titre',              label: 'Titre',                    type: 'text',   required: true },
          { key: 'public_cible_offre', label: 'Public cible',             type: 'select',
            dynamicOptions: 'onboarding.publics_cibles' },
          { key: 'theme_offre',        label: 'Thème de cette session',   type: 'text' },
          { key: 'duree',              label: 'Durée',                    type: 'text',   required: true },
          { key: 'format',             label: 'Format',                   type: 'select',
            options: ['Atelier interactif', 'Conférence', 'Sortie terrain', 'Visite', 'Jeu pédagogique'] },
        ],
        validations: [
          { field: 'public_cible_offre',  rule: 'in',  onboardingKey: 'publics_cibles',
            message: 'Ce public n\'est pas déclaré dans votre activité.' },
          { field: 'nb_participants_max', rule: 'lte', onboardingKey: 'capacite_max',
            message: 'Dépasse la capacité maximale déclarée ({value}).' },
        ],
      },
      {
        label: 'Contenu & Capacité',
        fields: [
          { key: 'activites_incluses',  label: 'Activités incluses',   type: 'multiselect',
            options: ['Jeu de rôle', 'Quiz', 'Expérience pratique', 'Observation', 'Débat',
                      'Création artistique'] },
          { key: 'supports_fournis',    label: 'Supports fournis',     type: 'multiselect',
            options: ['Livret pédagogique', 'Kit expérience', 'Fiches espèces',
                      'Jeu de cartes', 'App mobile'] },
          { key: 'nb_participants_min', label: 'Nb minimum',           type: 'number' },
          { key: 'nb_participants_max', label: 'Nb maximum',           type: 'number' },
        ],
      },
    ],
  },

  jardin_communautaire: {
    sections: [
      {
        label: 'Cette mission',
        fields: [
          { key: 'titre',              label: 'Titre',                  type: 'text',   required: true },
          { key: 'type_jardin_offre',  label: 'Type de jardin',         type: 'select',
            dynamicOptions: 'onboarding.type_jardin' },
          { key: 'taches_mission',     label: 'Tâches de cette mission', type: 'multiselect',
            options: ['Préparation sol', 'Semis', 'Plantation', 'Construction bacs',
                      'Irrigation', 'Paillage', 'Clôture'] },
          { key: 'duree',              label: 'Durée',                  type: 'text',   required: true },
          { key: 'competences_utiles', label: 'Compétences utiles',     type: 'textarea' },
        ],
        validations: [
          { field: 'type_jardin_offre',   rule: 'in',  onboardingKey: 'type_jardin',
            message: 'Ce type de jardin n\'est pas déclaré dans votre activité.' },
          { field: 'nb_participants_max', rule: 'lte', onboardingKey: 'groupe_max',
            message: 'Dépasse la capacité bénévoles déclarée ({value}).' },
        ],
      },
      {
        label: 'Logistique & Inclus',
        fields: [
          { key: 'hebergement_offre',   label: 'Hébergement disponible', type: 'boolean' },
          { key: 'repas_inclus',        label: 'Repas inclus',           type: 'boolean' },
          { key: 'fourni',              label: 'Fourni',                 type: 'multiselect',
            options: ['Outils', 'Graines / plants', 'Eau', 'Repas partagé', 'Certificat bénévole'] },
          { key: 'nb_participants_min', label: 'Nb minimum',             type: 'number' },
          { key: 'nb_participants_max', label: 'Nb maximum',             type: 'number' },
        ],
      },
    ],
  },

  sensibilisation_ecoles: {
    sections: [
      {
        label: 'Cette intervention',
        fields: [
          { key: 'titre',                   label: 'Titre',                  type: 'text',   required: true },
          { key: 'niveau_scolaire_offre',   label: 'Niveau scolaire ciblé',  type: 'select',
            dynamicOptions: 'onboarding.niveaux_scolaires' },
          { key: 'theme_offre',             label: 'Thème',                  type: 'text' },
          { key: 'duree',                   label: 'Durée',                  type: 'text',   required: true },
          { key: 'format',                  label: 'Format',                 type: 'select',
            options: ['Présentation', 'Atelier pratique', 'Jeu éducatif', 'Sortie terrain', 'Conférence'] },
        ],
        validations: [
          { field: 'niveau_scolaire_offre', rule: 'in', onboardingKey: 'niveaux_scolaires',
            message: 'Ce niveau scolaire n\'est pas déclaré dans votre activité.' },
        ],
      },
      {
        label: 'Supports & Capacité',
        fields: [
          { key: 'supports_utilises',      label: 'Supports utilisés',                  type: 'multiselect',
            options: ['Diaporama', 'Vidéo', 'Maquette', 'Livret élève', 'Jeu de cartes', 'App'] },
          { key: 'nb_eleves_max',          label: 'Nb max d\'élèves par intervention',  type: 'number' },
          { key: 'nb_classes_max_jour',    label: 'Nb max de classes par jour',         type: 'number' },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 🧭 GUIDE & ACTIVITÉS
  // ══════════════════════════════════════════════════════════════════════════

  guide_randonnee: {
    sections: [
      {
        label: 'Cette prestation',
        fields: [
          { key: 'titre',            label: 'Titre',                      type: 'text',   required: true },
          { key: 'type_offre',       label: 'Type',                       type: 'select',
            options: ['Guide privé', 'Guide groupe', '+ Transport', '+ Repas', 'Pack complet'] },
          { key: 'zone_offre',       label: 'Zone couverte',              type: 'text' },
          { key: 'specialite_offre', label: 'Spécialité',                 type: 'select',
            dynamicOptions: 'onboarding.specialites' },
          { key: 'duree',            label: 'Durée',                      type: 'text',   required: true },
          { key: 'niveau_groupe',    label: 'Niveau du groupe ciblé',     type: 'select',
            dynamicOptions: 'onboarding.niveaux' },
        ],
        validations: [
          { field: 'specialite_offre',    rule: 'in',  onboardingKey: 'specialites',
            message: 'Cette spécialité n\'est pas déclarée dans votre activité.' },
          { field: 'niveau_groupe',       rule: 'in',  onboardingKey: 'niveaux',
            message: 'Ce niveau n\'est pas proposé dans votre activité.' },
          { field: 'nb_participants_max', rule: 'lte', onboardingKey: 'groupe_max',
            message: 'Dépasse la taille de groupe maximale déclarée ({value}).' },
        ],
      },
      {
        label: 'Inclus & Groupe',
        fields: [
          { key: 'inclus', label: 'Inclus', type: 'multiselect',
            options: ['Transport', 'Pique-nique', 'Eau / collation', 'Carte / GPX',
                      'Assurance', 'Trousse secours', 'Présentation faune/flore'] },
          { key: 'nb_participants_min',  label: 'Nb minimum',               type: 'number' },
          { key: 'nb_participants_max',  label: 'Nb maximum',               type: 'number' },
          { key: 'guide_prive_possible', label: 'Guide privé possible',      type: 'boolean' },
        ],
      },
    ],
  },

  centre_activites: {
    sections: [
      {
        label: 'Cette offre',
        fields: [
          { key: 'titre',               label: 'Titre',               type: 'text',   required: true },
          { key: 'type_offre',          label: 'Type',                type: 'select',
            options: ['Accès journée', 'Pack activités', 'Stage', 'Cours particulier', 'Sortie groupe'] },
          { key: 'activites_offre',     label: 'Activités incluses',  type: 'multiselect',
            dynamicOptions: 'onboarding.activites' },
          { key: 'duree',               label: 'Durée',               type: 'text',   required: true },
          { key: 'tranche_age_offre',   label: 'Tranche d\'âge',     type: 'select',
            dynamicOptions: 'onboarding.publics' },
        ],
        validations: [
          { field: 'activites_offre',     rule: 'subset', onboardingKey: 'activites',
            message: 'Ces activités ne sont pas déclarées dans votre activité.' },
          { field: 'tranche_age_offre',   rule: 'in',     onboardingKey: 'publics',
            message: 'Cette tranche d\'âge n\'est pas déclarée dans votre activité.' },
        ],
      },
      {
        label: 'Inclus & Capacité',
        fields: [
          { key: 'inclus',              label: 'Inclus',     type: 'multiselect',
            options: ['Équipement', 'Encadrement', 'Vestiaires', 'Collation', 'Assurance'] },
          { key: 'nb_participants_min', label: 'Nb minimum', type: 'number' },
          { key: 'nb_participants_max', label: 'Nb maximum', type: 'number' },
        ],
      },
    ],
  },

  association_locale: {
    sections: [
      {
        label: 'Cette offre / mission',
        fields: [
          { key: 'titre',               label: 'Titre',        type: 'text',   required: true },
          { key: 'type_offre',          label: 'Type',         type: 'select',
            options: ['Mission bénévole', 'Visite de projet', 'Rencontre communautaire',
                      'Atelier participatif', 'Échange culturel'] },
          { key: 'domaine_offre',       label: 'Domaine',      type: 'select',
            dynamicOptions: 'onboarding.domaines_action' },
          { key: 'duree',               label: 'Durée',        type: 'text',   required: true },
          { key: 'description_mission', label: 'Description',  type: 'textarea' },
        ],
        validations: [
          { field: 'domaine_offre', rule: 'in', onboardingKey: 'domaines_action',
            message: 'Ce domaine n\'est pas déclaré dans votre activité.' },
        ],
      },
      {
        label: 'Inclus & Conditions',
        fields: [
          { key: 'inclus',                  label: 'Inclus',                    type: 'multiselect',
            options: ['Accueil par l\'équipe', 'Présentation projet', 'Repas partagé',
                      'Transport local', 'Attestation bénévolat', 'Certificat'] },
          { key: 'hebergement_disponible',  label: 'Hébergement disponible',    type: 'boolean' },
          { key: 'nb_participants_min',     label: 'Nb minimum',                type: 'number' },
          { key: 'nb_participants_max',     label: 'Nb maximum',                type: 'number' },
        ],
      },
    ],
  },

  agence_ecotourisme: {
    sections: [
      {
        label: 'Ce circuit / package',
        fields: [
          { key: 'titre',             label: 'Titre',                   type: 'text',     required: true },
          { key: 'type_circuit',      label: 'Type de circuit',         type: 'select',
            dynamicOptions: 'onboarding.types_circuits' },
          { key: 'destination_offre', label: 'Destination(s)',          type: 'textarea' },
          { key: 'duree',             label: 'Durée',                   type: 'text',     required: true },
          { key: 'programme_jours',   label: 'Programme jour par jour', type: 'repeater',
            subfields: [
              { key: 'titre_jour',       label: 'Titre du jour', type: 'text' },
              { key: 'description_jour', label: 'Description',   type: 'textarea' },
            ] },
        ],
        validations: [
          { field: 'type_circuit', rule: 'in', onboardingKey: 'types_circuits',
            message: 'Ce type de circuit n\'est pas déclaré dans votre activité.' },
        ],
      },
      {
        label: 'Inclus & Groupe',
        fields: [
          { key: 'inclus',              label: 'Inclus',       type: 'multiselect',
            options: ['Hébergement', 'Transport', 'Guide', 'Repas', 'Activités',
                      'Assurance voyage', 'Transferts aéroport', 'Assistance visa'] },
          { key: 'non_inclus',          label: 'Non inclus',   type: 'textarea' },
          { key: 'nb_participants_min', label: 'Nb minimum',   type: 'number' },
          { key: 'nb_participants_max', label: 'Nb maximum',   type: 'number' },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 🚗 TRANSPORT
  // ══════════════════════════════════════════════════════════════════════════

  transporteur_local: {
    sections: [
      {
        label: 'Ce trajet / service',
        fields: [
          { key: 'titre',               label: 'Titre',                   type: 'text',   required: true },
          { key: 'type_offre',          label: 'Type',                    type: 'select',
            options: ['Transfert aéroport', 'Trajet ville-ville', 'Mise à dispo journée',
                      'Circuit touristique', 'Navette régulière'] },
          { key: 'trajet_zone',         label: 'Trajet / zone desservie', type: 'text',   required: true },
          { key: 'type_vehicule_offre', label: 'Type de véhicule',        type: 'select',
            dynamicOptions: 'onboarding.types_vehicules' },
          { key: 'capacite_offre',      label: 'Nb de personnes',         type: 'number' },
          { key: 'duree_estimee',       label: 'Durée estimée',           type: 'text' },
        ],
        validations: [
          { field: 'type_vehicule_offre', rule: 'in', onboardingKey: 'types_vehicules',
            message: 'Ce type de véhicule n\'est pas déclaré dans votre activité.' },
        ],
      },
      {
        label: 'Services à bord',
        fields: [
          { key: 'services_bord', label: 'Services inclus', type: 'multiselect',
            options: ['Climatisation', 'Wifi', 'Eau minérale', 'Chargeur USB',
                      'Siège enfant', 'Espace bagages'] },
          { key: 'pmr_offre', label: 'Accessible PMR', type: 'boolean' },
        ],
      },
    ],
  },

  location_vehicule: {
    sections: [
      {
        label: 'Ce véhicule',
        fields: [
          { key: 'titre',               label: 'Titre',         type: 'text',   required: true },
          { key: 'marque_modele',       label: 'Marque & modèle', type: 'text', required: true },
          { key: 'annee',               label: 'Année',         type: 'number' },
          { key: 'type_vehicule_offre', label: 'Type',          type: 'select',
            dynamicOptions: 'onboarding.types_vehicules' },
          { key: 'carburant_offre',     label: 'Carburant',     type: 'select',
            dynamicOptions: 'onboarding.motorisations' },
          { key: 'nb_places',           label: 'Nb de places',  type: 'number' },
          { key: 'climatisation',       label: 'Climatisation', type: 'boolean' },
          { key: 'transmission',        label: 'Transmission',  type: 'select',
            options: ['Manuelle', 'Automatique'] },
        ],
        validations: [
          { field: 'type_vehicule_offre', rule: 'in', onboardingKey: 'types_vehicules',
            message: 'Ce type de véhicule n\'est pas déclaré dans votre activité.' },
          { field: 'carburant_offre',     rule: 'in', onboardingKey: 'motorisations',
            message: 'Ce carburant n\'est pas déclaré dans votre activité.' },
        ],
      },
      {
        label: 'Conditions & Équipements',
        fields: [
          { key: 'km_inclus_jour',          label: 'Kilométrage inclus / jour',      type: 'number' },
          { key: 'tarif_km_sup',            label: 'Tarif km supplémentaire (TND)',   type: 'number' },
          { key: 'age_minimum_conducteur',  label: 'Âge minimum conducteur',         type: 'number' },
          { key: 'permis_requis_offre',     label: 'Permis requis',                  type: 'select',
            dynamicOptions: 'onboarding.permis_requis' },
          { key: 'caution',                 label: 'Caution (TND)',                  type: 'number' },
          { key: 'equipements',             label: 'Équipements inclus',             type: 'multiselect',
            options: ['GPS', 'Siège enfant', 'Porte-vélos', 'Galerie de toit', 'Kit de dépannage'] },
          { key: 'assurance_type',          label: 'Assurance incluse',              type: 'select',
            options: ['Tous risques', 'Tiers', 'Vol + incendie'] },
          { key: 'livraison_vehicule',      label: 'Livraison du véhicule possible', type: 'boolean' },
        ],
        validations: [
          { field: 'permis_requis_offre', rule: 'in', onboardingKey: 'permis_requis',
            message: 'Ce permis n\'est pas déclaré dans votre activité.' },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 🛠️ ÉQUIPEMENT
  // ══════════════════════════════════════════════════════════════════════════

  location_materiel: {
    sections: [
      {
        label: 'Ce matériel',
        fields: [
          { key: 'titre',              label: 'Titre',                          type: 'text',   required: true },
          { key: 'categorie_offre',    label: 'Catégorie',                      type: 'select',
            dynamicOptions: 'onboarding.types_materiel' },
          { key: 'nom_article',        label: 'Nom de l\'article',              type: 'text',   required: true },
          { key: 'marque_modele',      label: 'Marque / modèle',                type: 'text' },
          { key: 'etat',               label: 'État',                           type: 'select',
            options: ['Neuf', 'Très bon état', 'Bon état'] },
          { key: 'tailles_disponibles',label: 'Tailles disponibles',            type: 'text' },
          { key: 'caracteristiques',   label: 'Caractéristiques techniques',    type: 'textarea' },
        ],
        validations: [
          { field: 'categorie_offre', rule: 'in', onboardingKey: 'types_materiel',
            message: 'Cette catégorie n\'est pas déclarée dans votre activité.' },
        ],
      },
      {
        label: 'Conditions de location',
        fields: [
          { key: 'accessoires_inclus',  label: 'Accessoires inclus',              type: 'textarea' },
          { key: 'notice_formation',    label: 'Notice / formation incluse',      type: 'boolean' },
          { key: 'duree_min_location',  label: 'Durée minimale',                  type: 'select',
            options: ['1 heure', 'Demi-journée', 'Journée', 'Week-end'] },
          { key: 'caution',             label: 'Caution (TND)',                   type: 'number' },
          { key: 'livraison_offre',     label: 'Livraison possible',              type: 'boolean' },
          { key: 'checklist_retour',    label: 'Checklist état au retour fournie', type: 'boolean' },
        ],
        validations: [
          { field: 'livraison_offre', rule: 'requiredIfFalse', onboardingKey: 'livraison',
            message: 'Vous n\'avez pas déclaré de livraison dans votre activité.' },
        ],
      },
    ],
  },

  centre_sport: {
    sections: [
      {
        label: 'Cette offre',
        fields: [
          { key: 'titre',                 label: 'Titre',                    type: 'text',   required: true },
          { key: 'type_offre',            label: 'Type',                     type: 'select',
            options: ['Accès journée', 'Cours collectif', 'Cours particulier', 'Stage', 'Abonnement'] },
          { key: 'sport_offre',           label: 'Sport / discipline',       type: 'text' },
          { key: 'infrastructure_offre',  label: 'Infrastructure utilisée',  type: 'select',
            dynamicOptions: 'onboarding.equipements' },
          { key: 'duree',                 label: 'Durée',                    type: 'text',   required: true },
          { key: 'niveau_offre',          label: 'Niveau',                   type: 'select',
            options: ['Débutant', 'Intermédiaire', 'Avancé', 'Tous niveaux'] },
          { key: 'tranche_age_offre',     label: 'Tranche d\'âge',          type: 'select',
            options: ['Enfants', 'Ados', 'Adultes', 'Seniors', 'Tous publics'] },
        ],
        validations: [
          { field: 'infrastructure_offre', rule: 'in', onboardingKey: 'equipements',
            message: 'Cette infrastructure n\'est pas déclarée dans votre activité.' },
        ],
      },
      {
        label: 'Inclus & Capacité',
        fields: [
          { key: 'inclus',              label: 'Inclus',     type: 'multiselect',
            options: ['Équipement sportif', 'Coach', 'Vestiaires', 'Casier', 'Douche',
                      'Serviette', 'Collation post-entraînement'] },
          { key: 'nb_participants_min', label: 'Nb minimum', type: 'number' },
          { key: 'nb_participants_max', label: 'Nb maximum', type: 'number' },
        ],
      },
    ],
  },
}
