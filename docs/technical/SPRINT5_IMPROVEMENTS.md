# Sprint 5 — Améliorations Circuit & Offre

## Objectif
Intégrer les patterns avancés de Maram v2 dans le module circuit + offre : disponibilités, hébergement, catégories par activité, UX enrichie, validations intelligentes.

## Changements Backend

### Circuit entity (`circuit.entity.ts`)
- `availability` (JSONB) : `{ mode, specific_dates, weekdays, avail_start, avail_end, saisons, heure_debut, heure_fin, delai_reponse }`
- `hebergement` (JSONB) : `{ inclus, type: 'same' | 'per_day' }`

### CircuitProgramItem entity (`circuit-program-item.entity.ts`)
- `category` (varchar) : `'hebergement' | 'activite' | 'restauration' | 'transport' | 'workshop'`
- `subtypes` (simple-array) : `['randonnee', 'observation']` provenant de `OFFER_DETAIL_FIELDS`
- `price` (decimal) : prix individuel de l'activité
- `photos` (simple-array) : photos spécifiques à l'activité
- `unit_details` (JSONB) : détails par unité pour sous-types avec unités
- `fields` (JSONB) : champs dynamiques du sous-type

### DTOs
- `CreateCircuitDto` : `availability`, `hebergement`
- `CreateCircuitProgramItemDto` : `category`, `subtypes`, `price`, `photos`, `unit_details`, `fields`

### Service (`circuit.service.ts`)
- Propagation `availability`/`hebergement` dans `create`/`update`
- Propagation `category`/`subtypes`/`price`/`photos`/`unit_details`/`fields` dans `addProgramItem`/`updateProgramItem`

### Offer controller/service
- `GET /offers/public` enrichi avec `lat`, `lng`, `radius_km`, `item_type` (recherche `ST_DWithin` PostGIS)
- Ajout `type` (enum : activity/restaurant/craft/transport) à `offer.entity.ts`
- Ajout `distance_km` (decimal) et `external_reference` (JSONB) à `offer.entity.ts`
- Ajout `categories` (simple-array) et `tags` (simple-array) à `offer.entity.ts`

## Changements Frontend

### CircuitBuilderWizard (wizard circuit)
- **Step 2/6** : MapPicker par jour + offres externes à proximité (rayon configurable)
- **Step 4/6** : Waypoints sur carte avec auto-calcul distance totale circuit
- **Step 5/6** : Délai réservation auto-calculé + option recherche améliorée
- **Submit** : envoie `availability`, `hebergement`, `category`, `subtypes`, `price`, `photos`, `fields`, `external_reference`

### Circuit detail page (`/circuits/[id]`)
- Form ajout jour avec MapPicker
- Form édition jour avec MapPicker  
- Form ajout/édition activité enrichi (catégorie, sous-types, prix, photos)
- Guide selector intelligent : carte + liste + disponibilité par date
- Validation dates : durée auto-calculée, distance = circuit total

### ExternalOfferModal
- 3 onglets : Mes offres / Offres externes / Référence externe
- Recherche géolocalisée (lat/lng/radius) pour offres externes
- Formulaire référence externe

### GuideSearchInline
- Carte + liste guides
- Disponibilité par date
- Profil détaillé avec zone, rayon, langues, prix
- Lien "Voir le profil" (nouvel onglet)

## Offres Djerba/Fernana créées
- Projets divers (hébergement, artisanat, activité, transport)
- Offres avec rayons variés
- Circuits thématiques

## Nouveaux Guides (15)
- MDP : `17092001`
- Emails basés sur `amirbennoomen@gmail.com` (variations points)
- Profils : randonnée, culture, désert, montagne, vélo, artisanat, oiseaux, cuisine, plongée, yoga, photo, équitation, kayak

## UX/UI
- Icônes par catégorie d'activité
- Timeline avec couleurs par type
- Step indicator progressif
- Validation en temps réel
- Auto-calcul durée depuis dates
- Détection conflits horaires par jour
