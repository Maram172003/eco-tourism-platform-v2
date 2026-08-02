export const ITEMS_WITHOUT_LOCATION = new Set([
  'room', 'bed', 'camping_space', 'dormitory', 'suite', 'bungalow', 'tent',
  'dish', 'menu', 'product',
]);

/**
 * Une catégorie a-t-elle des itemTypes qui n'ont pas besoin de localisation ?
 * Utile pour le Step 2 du wizard : si oui, on attend le Step 3 (itemType choisi)
 * avant d'afficher les champs de localisation.
 */
export function hasItemTypesWithoutLocation(category: string, itemTypeValues: string[]): boolean {
  if (category === 'accommodation') return true;
  if (category === 'restaurant') return true;
  if (category === 'craft') return true;
  return itemTypeValues.some(v => ITEMS_WITHOUT_LOCATION.has(v));
}

const ITEMS_WITH_GUIDE = new Set([
  'hiking', 'randonnee', 'kayak', 'paddle', 'vtt', 'escalade', 'equitation',
  'speleologie', 'tyrolienne', 'observation', 'astronomie', 'photographie', 'guided_tour',
  'yoga', 'meditation', 'poterie', 'cuisine', 'musique',
  'surfing', 'diving', 'paragliding',
]);

const CATEGORIES_WITH_GUIDE = new Set([
  'activity', 'transport', 'eco_tour', 'workshop',
]);

/**
 * L'offre a-t-elle besoin d'une localisation propre ?
 * Si false -> hérite de la localisation du venue
 */
export function needsLocation(category: string, itemType: string): boolean {
  if (category === 'accommodation') return false;
  if (category === 'restaurant') return false;
  if (category === 'craft') return false;
  if (ITEMS_WITHOUT_LOCATION.has(itemType)) return false;
  return true;
}

/**
 * L'offre peut-elle être associée à un guide ?
 */
export function canHaveGuide(category: string, itemType: string): boolean {
  if (!CATEGORIES_WITH_GUIDE.has(category)) return false;
  if (ITEMS_WITH_GUIDE.has(itemType)) return true;
  if (itemType === 'other') return false;
  return CATEGORIES_WITH_GUIDE.has(category);
}

/**
 * Source de la localisation
 */
export function locationSource(category: string, itemType: string): 'offer' | 'venue' {
  return needsLocation(category, itemType) ? 'offer' : 'venue';
}

/**
 * Le guide est-il requis ou optionnel pour ce type d'offre ?
 */
export function guideRequirement(category: string, itemType: string): 'required' | 'optional' | 'none' {
  if (itemType === 'guided_tour') return 'required';
  if (category === 'guide_service') return 'required';
  if (canHaveGuide(category, itemType)) return 'optional';
  return 'none';
}

/**
 * Types d'activités qui ont des sous-types spécifiques dans le wizard
 */
export interface ActivitySubType {
  value: string;
  label: string;
  icon?: string;
}

export function getActivitySubTypes(): ActivitySubType[] {
  return [
    { value: 'randonnee', label: 'Randonnée', icon: '🥾' },
    { value: 'trekking', label: 'Trekking', icon: '🏔️' },
    { value: 'kayak', label: 'Kayak', icon: '🛶' },
    { value: 'paddle', label: 'Paddle', icon: '🏄' },
    { value: 'vtt', label: 'VTT', icon: '🚵' },
    { value: 'escalade', label: 'Escalade', icon: '🧗' },
    { value: 'tyrolienne', label: 'Tyrolienne', icon: '🪢' },
    { value: 'speleologie', label: 'Spéléologie', icon: '⛰️' },
    { value: 'equitation', label: 'Équitation', icon: '🐴' },
    { value: 'observation', label: 'Observation nature', icon: '🔭' },
    { value: 'astronomie', label: 'Astronomie', icon: '🌟' },
    { value: 'photographie', label: 'Photographie', icon: '📷' },
    { value: 'yoga', label: 'Yoga', icon: '🧘' },
    { value: 'meditation', label: 'Méditation', icon: '🧘‍♀️' },
    { value: 'poterie', label: 'Poterie', icon: '🏺' },
    { value: 'cuisine', label: 'Cuisine', icon: '👨‍🍳' },
    { value: 'musique', label: 'Musique', icon: '🎵' },
    { value: 'surfing', label: 'Surf', icon: '🏄‍♂️' },
    { value: 'diving', label: 'Plongée', icon: '🤿' },
    { value: 'paragliding', label: 'Parapente', icon: '🪂' },
    { value: 'other', label: 'Autre activité', icon: '🎯' },
  ];
}

/**
 * Vérifie si un item_type a des champs de difficulté
 */
export function hasDifficulty(itemType: string): boolean {
  return ['randonnee', 'trekking', 'vtt', 'escalade', 'kayak', 'speleologie', 'equitation', 'surfing', 'diving', 'paragliding', 'tyrolienne'].includes(itemType);
}

/**
 * Vérifie si un item_type gère les horaires checkin/checkout
 */
export function hasCheckinCheckout(category: string): boolean {
  return ['accommodation'].includes(category);
}

/**
 * Vérifie si un item_type gère la durée / sessions
 */
export function hasDuration(category: string, itemType: string): boolean {
  if (category === 'accommodation') return false;
  if (category === 'restaurant') return false;
  if (itemType === 'product') return false;
  return true;
}
