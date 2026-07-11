/**
 * Mapping venue_type → allowed offer categories
 * Ensures artisan venues don't create accommodation offers, etc.
 */

export const VENUE_TYPES = [
  { value: 'accommodation', label: 'Hébergement', icon: '🏨', description: 'Hôtel, éco-lodge, gîte' },
  { value: 'camping', label: 'Camping', icon: '⛺', description: 'Camping, espace tente' },
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️', description: 'Restaurant, café, food truck' },
  { value: 'activity_center', label: 'Centre d\'activités', icon: '🎯', description: 'Sports, loisirs, plein air' },
  { value: 'artisan', label: 'Artisanat', icon: '🏺', description: 'Artisanat local, artisan' },
  { value: 'farm', label: 'Ferme écologique', icon: '🌾', description: 'Agrotourisme, ferme' },
  { value: 'transport', label: 'Transport', icon: '🚌', description: 'Transport, transfert, location' },
  { value: 'event_space', label: 'Espace événementiel', icon: '🎪', description: 'Événements, séminaires' },
  { value: 'tourism_association', label: 'Association tourisme', icon: '🤝', description: 'Association, guide local' },
  { value: 'eco_park', label: 'Parc écologique', icon: '🌿', description: 'Parc naturel, réserve' },
] as const;

export const OFFER_CATEGORIES = [
  { value: 'accommodation', label: 'Hébergement', icon: '🏨', description: 'Chambre, dortoir, tente' },
  { value: 'activity', label: 'Activité', icon: '🥾', description: 'Randonnée, kayak, visite' },
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️', description: 'Repas, menu, buffet' },
  { value: 'transport', label: 'Transport', icon: '🚌', description: 'Transfert, location véhicule' },
  { value: 'workshop', label: 'Atelier', icon: '🎨', description: 'Artisanat, cuisine, art' },
  { value: 'guide_service', label: 'Service guide', icon: '🧭', description: 'Guide touristique local' },
  { value: 'equipment_rental', label: 'Location équipement', icon: '🎿', description: 'Vélo, kayak, matériel' },
  { value: 'event', label: 'Événement', icon: '🎪', description: 'Festival, spectacle, conférence' },
  { value: 'craft', label: 'Artisanat', icon: '🏺', description: 'Produits artisanaux locaux' },
  { value: 'circuit', label: 'Circuit', icon: '🗺️', description: 'Circuit multi-jours organisé' },
  { value: 'sejour', label: 'Séjour', icon: '🌴', description: 'Forfait hébergement + activités' },
  { value: 'eco_tour', label: 'Éco-Tour', icon: '🌿', description: 'Tourisme durable et responsable' },
] as const;

/**
 * Which offer categories are available for each venue type
 */
export const VENUE_TYPE_OFFERS: Record<string, string[]> = {
  accommodation: ['accommodation', 'restaurant', 'activity', 'sejour'],
  camping: ['accommodation', 'activity', 'equipment_rental', 'sejour'],
  restaurant: ['restaurant', 'event', 'craft'],
  activity_center: ['activity', 'workshop', 'equipment_rental', 'event'],
  artisan: ['workshop', 'event', 'equipment_rental', 'craft'],
  farm: ['accommodation', 'restaurant', 'activity', 'workshop', 'sejour', 'eco_tour'],
  transport: ['transport', 'equipment_rental', 'circuit'],
  event_space: ['event', 'accommodation', 'restaurant', 'workshop'],
  tourism_association: ['activity', 'guide_service', 'workshop', 'transport', 'eco_tour', 'circuit', 'event'],
  eco_park: ['activity', 'accommodation', 'guide_service', 'equipment_rental', 'eco_tour', 'circuit'],
};

/**
 * For guides (no venue), allowed offer categories
 */
export const GUIDE_ALLOWED_OFFERS = ['activity', 'guide_service', 'workshop', 'transport', 'equipment_rental', 'event', 'craft', 'circuit'];

/**
 * Offer category → fields that appear in the creation form
 */
export const CATEGORY_FORM_FIELDS: Record<string, string[]> = {
  accommodation: ['title', 'description', 'region', 'address', 'gps', 'images', 'confirmation_mode', 'items', 'sessions'],
  activity: ['title', 'description', 'region', 'address', 'gps', 'meeting_point', 'images', 'min_group_size', 'max_group_size', 'min_age', 'confirmation_mode', 'items', 'sessions'],
  restaurant: ['title', 'description', 'region', 'address', 'gps', 'images', 'confirmation_mode', 'items', 'sessions'],
  transport: ['title', 'description', 'region', 'address', 'gps', 'images', 'confirmation_mode', 'items'],
  workshop: ['title', 'description', 'region', 'address', 'gps', 'images', 'min_group_size', 'max_group_size', 'confirmation_mode', 'items', 'sessions'],
  guide_service: ['title', 'description', 'region', 'address', 'gps', 'meeting_point', 'images', 'min_group_size', 'max_group_size', 'confirmation_mode', 'items', 'sessions'],
  equipment_rental: ['title', 'description', 'region', 'address', 'gps', 'images', 'confirmation_mode', 'items'],
  event: ['title', 'description', 'region', 'address', 'gps', 'images', 'min_group_size', 'max_group_size', 'min_age', 'confirmation_mode', 'items', 'sessions'],
  craft: ['title', 'description', 'region', 'address', 'gps', 'images', 'confirmation_mode', 'items', 'sessions'],
  circuit: ['title', 'description', 'region', 'address', 'gps', 'images', 'min_group_size', 'max_group_size', 'confirmation_mode', 'items', 'sessions'],
  sejour: ['title', 'description', 'region', 'address', 'gps', 'images', 'confirmation_mode', 'items', 'sessions'],
  eco_tour: ['title', 'description', 'region', 'address', 'gps', 'meeting_point', 'images', 'min_group_size', 'max_group_size', 'min_age', 'confirmation_mode', 'items', 'sessions'],
};

/**
 * OfferItem item_type values per category (fiche technique)
 */
export const ITEM_TYPES_BY_CATEGORY: Record<string, { value: string; label: string }[]> = {
  accommodation: [
    { value: 'room', label: 'Chambre' },
    { value: 'bed', label: 'Lit (dortoir)' },
    { value: 'camping_space', label: 'Espace tente' },
    { value: 'suite', label: 'Suite' },
    { value: 'bungalow', label: 'Bungalow' },
    { value: 'ecolodge', label: 'Éco-lodge' },
  ],
  activity: [
    { value: 'activity', label: 'Activité' },
    { value: 'guided_tour', label: 'Visite guidée' },
    { value: 'hiking', label: 'Randonnée' },
    { value: 'kayak', label: 'Kayak' },
    { value: 'vtt', label: 'VTT' },
    { value: 'escalade', label: 'Escalade' },
    { value: 'equitation', label: 'Équitation' },
    { value: 'observation', label: 'Observation' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'meditation', label: 'Méditation' },
    { value: 'photographie', label: 'Photographie' },
    { value: 'other', label: 'Autre' },
  ],
  restaurant: [
    { value: 'dish', label: 'Plat' },
    { value: 'menu', label: 'Menu complet' },
  ],
  transport: [
    { value: 'transport_service', label: 'Service de transport' },
  ],
  workshop: [
    { value: 'workshop', label: 'Atelier' },
    { value: 'poterie', label: 'Poterie' },
    { value: 'cuisine', label: 'Cuisine' },
    { value: 'tissage', label: 'Tissage' },
    { value: 'musique', label: 'Musique' },
    { value: 'other', label: 'Autre' },
  ],
  guide_service: [
    { value: 'guided_tour', label: 'Visite guidée' },
    { value: 'hiking', label: 'Guide randonnée' },
  ],
  equipment_rental: [
    { value: 'equipment', label: 'Équipement' },
  ],
  event: [
    { value: 'festival', label: 'Festival' },
    { value: 'concert', label: 'Concert' },
    { value: 'conference', label: 'Conférence' },
    { value: 'workshop', label: 'Atelier spécial' },
    { value: 'celebration', label: 'Célébration' },
    { value: 'exposition', label: 'Exposition' },
    { value: 'food_tasting', label: 'Dégustation' },
    { value: 'other', label: 'Autre' },
  ],
  craft: [
    { value: 'product', label: 'Produit artisanal' },
    { value: 'poterie', label: 'Poterie' },
    { value: 'tissage', label: 'Tissage' },
    { value: 'bijouterie', label: 'Bijouterie' },
    { value: 'other', label: 'Autre' },
  ],
  circuit: [
    { value: 'circuit', label: 'Circuit complet' },
  ],
  sejour: [
    { value: 'package', label: 'Forfait séjour' },
    { value: 'all_inclusive', label: 'Tout inclus' },
  ],
  eco_tour: [
    { value: 'activity', label: 'Activité éco' },
    { value: 'guided_tour', label: 'Visite éco-guidée' },
    { value: 'hiking', label: 'Randonnée nature' },
    { value: 'observation', label: 'Observation faune/flore' },
    { value: 'workshop', label: 'Atelier éco' },
  ],
};

/**
 * Sous-types spécifiques pour room (stockés dans details_json)
 */
export const ROOM_SUB_TYPES = [
  { value: 'private', label: 'Chambre privée', icon: '🏠' },
  { value: 'double', label: 'Chambre double', icon: '👫' },
  { value: 'family', label: 'Chambre famille', icon: '👨‍👩‍👧‍👦' },
  { value: 'shared', label: 'Dortoir partagé', icon: '🛏' },
  { value: 'suite', label: 'Suite', icon: '👑' },
  { value: 'studio', label: 'Studio', icon: '🏢' },
] as const;

/**
 * Unités de tarification (fiche technique: pricing_unit)
 */
export const PRICING_UNITS = [
  { value: 'per_person', label: 'Par personne' },
  { value: 'per_night', label: 'Par nuit' },
  { value: 'per_hour', label: 'Par heure' },
  { value: 'per_half_day', label: 'Par demi-journée' },
  { value: 'per_day', label: 'Par jour' },
  { value: 'per_trip', label: 'Par trajet' },
  { value: 'per_group', label: 'Par groupe' },
  { value: 'per_vehicle', label: 'Par véhicule' },
  { value: 'per_meal', label: 'Par repas' },
  { value: 'per_stay', label: 'Par séjour' },
  { value: 'per_item', label: 'Par article' },
] as const;
