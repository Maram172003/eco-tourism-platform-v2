# Documentation de Synthèse Globale — Éco-Voyage

Ce document regroupe l'architecture, le modèle de données, les cas d'utilisation et le plan d'intégration des améliorations du projet Maram.

---

## Sommaire

1. [Stack & Infrastructure](#1-stack--infrastructure)
2. [Architecture Applicative](#2-architecture-applicative)
3. [Modèle de Données](#3-modèle-de-données)
4. [Modules Fonctionnels](#4-modules-fonctionnels)
5. [Système de Schemas Dynamiques](#5-système-de-schemas-dynamiques)
6. [Mapping avec Maram](#6-mapping-avec-maram)
7. [Plan d'Intégration](#7-plan-dintégration)

---

## 1. Stack & Infrastructure

| Couche | Technologie | Version |
|--------|-------------|---------|
| **Backend** | NestJS | ^11.1.16 |
| **Frontend** | Next.js | 16.2.1 |
| **Base relationnelle** | PostgreSQL | 15 (TypeORM) |
| **Base NoSQL** | MongoDB | 7 (Mongoose) |
| **Authentification** | JWT + Passport | @nestjs/jwt ^11 |
| **Conteneurisation** | Docker Compose | 4 services |
| **Stockage images** | Cloudinary | Upload cloud |
| **Styling** | Tailwind CSS | ^4.2.2 |
| **Cartographie** | Leaflet / OpenStreetMap | Sans clé API |

---

## 2. Architecture Applicative

### Backend (NestJS)

```
backend/src/
├── auth/              # JWT + Google OAuth + refresh rotation
├── users/             # CRUD utilisateurs
├── eco-traveler/      # Profils voyageurs + scoring MongoDB
├── guide/             # Profils guides + scoring MongoDB
├── project-owner/     # Profils propriétaires + CRUD projets
├── offer/             # Offres (40+ schemas dynamiques)
│   ├── entities/      # Offer, OfferItem, Price, Session, Capacity, Availability
│   └── dto/
├── booking/           # Réservations avec transactions atomiques
├── circuit/           # Circuits multi-jours (CircuitDay, ProgramItem, Option)
├── trip-plan/         # Plans de voyage (regroupement + réservation groupée)
├── favorite/          # Favoris multi-types
├── review/            # Avis 1-5 étoiles + photos
├── notification/      # Système de notifications
├── questionnaire/     # QCM durabilité (11/10 questions par rôle)
├── publication/       # Publications sociales (places/experiences)
├── messages/          # Messagerie privée
├── follow/            # Abonnements entre utilisateurs
├── reports/           # Signalements + modération
├── admin/             # Validation de contenu
├── upload/            # Cloudinary SDK
├── mail/              # Nodemailer
├── database/          # TypeORM + Mongoose config
└── common/            # Guards, decorators, enums
```

### Frontend (Next.js App Router)

```
frontend/app/
├── (auth)/            # Login, register, forgot-password
├── onboarding/        # Wizard multi-étapes par rôle
├── dashboard/         # Tableaux de bord (voyageur, guide, propriétaire)
├── offers/            # Catalogue Destinations + détail
├── circuits/          # Circuits publics + détail avec carte
├── trip-plans/        # Plans de voyage
├── reservations/      # Réservation avec participants
├── notifications/     # Notifications
├── profile/           # Profils publics
└── admin/             # Panel admin

frontend/components/
├── CircuitBuilderWizard.tsx    # Wizard circuit 6 étapes
├── GuidedOfferWizard.tsx       # Wizard offre 9 étapes
├── ExternalOfferModal.tsx      # 3 onglets (propre/externe/référence)
├── GuideSearchInline.tsx       # Recherche guides avec carte
├── OfferItemSearchInline.tsx   # Recherche items offre
├── SmartDatePicker.tsx         # Calendrier récurrence
├── ImageUploader.tsx           # Upload drag-and-drop
├── HierarchicalSelect.tsx      # Sélecteur hiérarchique
├── TimelineView.tsx            # Affichage Polarsteps-style
├── TimelineEditor.tsx          # Éditeur de timeline
├── WeatherSection.tsx          # Météo intégrée
├── CartWidget.tsx              # Widget panier flottant
└── map/                        # Leaflet components

frontend/lib/
├── offer-schema.ts    # 40+ schemas dynamiques (OFFER_SCHEMAS)
├── offer-config.ts    # PROJECT_TYPES, OFFER_CATEGORIES, ITEM_TYPES_BY_CATEGORY
├── offer-rules.ts     # needsLocation, canHaveGuide, guideRequirement
├── offer-taxonomy.ts  # 5 taxonomies (equipment, services, inclus)
├── api.ts             # apiFetch utilitaire
├── auth.ts            # Auth helpers
└── distance.ts        # Calculs géospatiaux
```

---

## 3. Modèle de Données

### Architecture 1:N — Le point clé

```
User (role=project)
  └── ProjectOwner (infos perso, 1:1 avec User)
       └── Project (1:N) ← UN PROPRIÉTAIRE PEUT AVOIR PLUSIEURS PROJETS
            ├── name, project_type[], region, lat, lng, eco_labels
            └── offers (via PROJECT_TYPE_OFFERS mapping)
```

### PostgreSQL — Tables principales

| Table | Description | Relation |
|-------|-------------|----------|
| `users` | Auth, rôles, status, tokens | — |
| `eco_travelers` | Profils voyageurs, scores | 1:1 → users |
| `guides` | Profils guides, spécialités | 1:1 → users |
| `project_owners` | Profils propriétaires | 1:1 → users |
| `projects` | Projets éco-touristiques | N:1 → project_owners |
| `offers` | Offres éco-touristiques | N:1 → users (guide/project_owner) |
| `offer_items` | Éléments vendables | N:1 → offers |
| `offer_item_prices` | Prix par catégorie | N:1 → offer_items |
| `offer_item_sessions` | Créneaux datés | N:1 → offer_items |
| `offer_item_capacities` | Capacité restante | N:1 → offer_items |
| `circuits` | Circuits multi-jours | N:1 → users |
| `circuit_days` | Jours du circuit | N:1 → circuits |
| `circuit_program_items` | Activités | N:1 → circuit_days |
| `circuit_options` | Options additionnelles | N:1 → circuits |
| `bookings` | Réservations | N:1 → users + offers |
| `booking_participants` | Participants | N:1 → bookings |
| `trip_plans` | Plans de voyage | N:1 → eco_travelers |
| `trip_plan_items` | Items du plan | N:1 → trip_plans |

### MongoDB — Collections

| Collection | Usage |
|-----------|-------|
| `traveler_preferences` | Intérêts, paysages, objectifs |
| `traveler_engagement` | Score, badges, stats |
| `guide_skills` | Activités, certifications, langues |
| `guide_engagement` | Score, badges, stats |
| `project_services` | Pratiques écologiques |
| `user_stats` | Statistiques globales |

---

## 4. Modules Fonctionnels

### 4.1 Système de Score de Durabilité

```
Score Final = Questionnaire × 20% + Réservations × 40% + Feedbacks × 20% + Partages × 20%
```

| Seuil | Voyageur | Guide | Propriétaire |
|-------|----------|-------|-------------|
| ≥ 80 | Ambassadeur durable | Guide Ambassadeur | Propriétaire Ambassadeur |
| ≥ 60 | Écovoyageur engagé | Guide Expert | Propriétaire Engagé |
| ≥ 40 | Voyageur sensible | Guide Engagé | Propriétaire Sensible |
| < 40 | Voyageur classique | Guide en Développement | Propriétaire en Dev |

### 4.2 Workflow d'Offres

```
Création → status = "pending"
              │
      ┌───────┴───────┐
      │               │
   Ambassadeur     Non-ambassadeur
      │               │
   approved      Admin examine
                     │
              ┌──────┴──────┐
              │             │
          approved      rejected
```

### 4.3 Réservations

- **Prix calculé côté serveur** (anti-fraude) avec 3 fallbacks
- **Transactions atomiques** anti-overbooking
- **Modes de confirmation** : automatique / manuel
- **Gestion des capacités** : remaining_capacity décrémenté/restauré

### 4.4 Circuits Multi-Jours

- Structure : Circuit → CircuitDay → CircuitProgramItem
- 4 types d'activités : own, other, guide, standalone reference
- Options additionnelles (transport, hébergement, équipement)
- Hébergement configurable (same/per_day, own/other/external)

### 4.5 Plans de Voyage

- Regroupement OfferItems + Circuits
- Organisation par jour avec notes
- Réservation groupée en une seule action
- Vérification des limites (participants, âge)

---

## 5. Système de Schemas Dynamiques

### Architecture du moteur

```typescript
// frontend/lib/offer-schema.ts
OFFER_SCHEMAS: Record<string, OfferTypeSchema> = {
  "accommodation_room": {
    sections: [...],  // Informations, SdB, Capacité, Horaires, Services
    fields: {...},     // surface_m2, vue, bed_count, sdb_type, checkin/checkout...
    display: {...}     // cardFields, filterable
  },
  "activity_randonnee": {
    sections: [...],  // Parcours, Niveau, Guide, Inclus
    fields: {...},     // distance_km, denivele_m, niveau_offre, inclus...
  },
  // ... 40+ schemas
};
```

### Types de champs supportés

| Type | Usage |
|------|-------|
| `text` | Champs texte libre |
| `number` | Nombres avec min/max/unit |
| `select` | Liste déroulante |
| `multiselect` | Sélection multiple (pills) |
| `boolean` | Toggle on/off |
| `time` | Sélecteur horaire |
| `file` | Upload fichier |
| `textarea` | Zone de texte |
| `hierarchy` | Sélecteur hiérarchique (taxonomie) |

### Conditions d'affichage

```typescript
fieldDef.conditionalOn = { field: 'sdb_type', value: 'prive' }
// Le champ n'apparaît que si le champ parent a la valeur spécifiée
```

### Mapping project_type → offers

```typescript
PROJECT_TYPE_OFFERS = {
  accommodation: ['accommodation', 'restaurant', 'activity', 'sejour'],
  camping: ['accommodation', 'activity', 'equipment_rental', 'sejour'],
  restaurant: ['restaurant', 'event', 'craft'],
  activity_center: ['activity', 'workshop', 'equipment_rental', 'event'],
  // ... 10 types
}
```

---

## 6. Mapping avec Maram (eco-tourism-platform-v2)

### Correspondance des entités

| Éco-Voyage | Maram | Relation |
|---|---|---|
| User (role=project) | User + Provider | Le compte |
| ProjectOwner | Provider | La personne physique |
| Project | Organization | L'entité juridique |
| Project.project_type[] | ProviderActivity.category | Catégories d'activités |
| Offer + OfferItem | Offer + OfferItem (simplifié) | Produit vendable |
| Circuit (structured) | Circuit (JSONB etapes) | Circuit multi-jours |

### Ce que notre projet fait MIEUX

| Capacité | Éco-Voyage | Maram |
|----------|-----------|-------|
| Schemas d'offres | ~40+ dynamiques | ~15 |
| Circuits | Wizard 6 étapes, hiérarchique | JSONB simple |
| Pricing | Multi-items, auto-fill | `price` decimal |
| Règles métier | `offer-rules.ts` | Pas de règles |
| Architecture | ProjectOwner → N Projects (1:N) | Provider → 1 Org (1:1) |
| Taxonomies | 5 taxonomies hiérarchiques | Pas de taxonomies |

### Ce que Maram fait MIEUX (à intégrer)

| Élément | Description | Effort |
|---------|-------------|--------|
| Shared constants | LANGS, SAISONS, REGIMES, NIVEAUX réutilisables | Faible |
| CrossValidationRule | Valider offres vs contraintes projet | Faible |
| `repeater` field type | Listes dynamiques (horaires/jour) | Faible |
| `dynamicOptions` | Options depuis API | Faible |

### Ce qu'il NE PAS prendre de Maram

- ❌ Circuit en JSONB (`etapes: object[]`) — Notre structure est supérieure
- ❌ Offre avec `price` decimal — Notre système multi-items est supérieur
- ❌ Architecture 1:1 — Notre 1:N est plus flexible
- ❌ provider-schema.ts — Notre `PROJECT_TYPES` + `PROJECT_TYPE_OFFERS` est suffisant

---

## 7. Plan d'Intégration

> **Statut :** ✅ Toutes les étapes terminées (Juillet 2026)

### Étape 1 — Shared Constants (Terminé)

Créer `frontend/lib/shared-configs.ts` (✅ fait) :

```typescript
export const LANGS = [
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'Arabe' },
  { value: 'en', label: 'Anglais' },
  { value: 'de', label: 'Allemand' },
  { value: 'it', label: 'Italien' },
  { value: 'es', label: 'Espagnol' },
];

export const SAISONS = [
  { value: 'printemps', label: 'Printemps' },
  { value: 'ete', label: 'Été' },
  { value: 'automne', label: 'Automne' },
  { value: 'hiver', label: 'Hiver' },
];

export const REGIMES = [
  { value: 'vegetarien', label: 'Végétarien' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'halal', label: 'Halal' },
  { value: 'sans_gluten', label: 'Sans gluten' },
  { value: 'sans_lactose', label: 'Sans lactose' },
];

export const NIVEAUX = [
  { value: 'facile', label: 'Facile' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'difficile', label: 'Difficile' },
];
```

**Impact** : Uniformité dans les 40+ schemas existants. Aucun risque.

### Étape 2 — CrossValidationRule (Terminé ✅)

Ajouter dans `offer-schema.ts` (✅ fait) :

### Étape 3 — Champs dynamiques + shared-configs (Terminé ✅)

Ajouter `repeater`, `dynamicOptions`, et importer `LANGS`, `REGIMES` dans les schemas (✅ fait).

### Étape 4 — Fix bugs circuits (Terminé ✅)

1. Brancher `externalRef` dans CircuitBuilderWizard — ✅ Résolu
2. Auto-lien offre du guide — ✅ Résolu
3. Unifier GuideSearchInline — ✅ Résolu

**Impact** : Complétude fonctionnelle.

---

## 8. Audit DDD — Points Critiques

Voir le document détaillé : [AUDIT_DDD_CIRCUITS.md](./AUDIT_DDD_CIRCUITS.md)

### Bugs critiques (tous résolus ✅)

| Bug | Résolution | Priorité 🔴→✅ |
|-----|-----------|----------------|
| `linked_offer_item_id` sans FK | Soft delete guard + circuit usage check (Sprint 3) | ✅ Résolu |
| CircuitReservation sans gestion capacité | CapacityService avec locking (Sprint 5) | ✅ Résolu |
| Booking FK sans `onDelete` | Cascade sur toutes les relations (Sprint 1) | ✅ Résolu |
| Pas d'optimistic/pessimistic locking | Version column sur Capacity (Sprint 5) | ✅ Résolu |
| Pas de price_history | Ajouté via `previousPrice` + historique (Sprint 6) | ✅ Résolu |

### Score DDD global : 9/10

✅ Tous les bugs critiques résolus via les Sprints 1–6.

### Plan d'action DDD (✅ Terminé)

1. **Semaine 1** : Sécurité (onDelete FK, vérif suppression Offer, capacité CircuitReservation, optimistic locking) — ✅
2. **Semaine 2** : Cohérence (état draft, price_history, validation linked_offer_item_id) — ✅

---

## 9. Endpoints API Complets

### Auth & Profils
| Méthode | Endpoint | Rôle |
|---------|----------|------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh` | Public |
| GET | `/api/auth/google` | Public |
| GET | `/api/eco-traveler/profile` | Voyageur |
| POST | `/api/eco-traveler/profile` | Voyageur |
| GET | `/api/guide/profile` | Guide |
| GET | `/api/project-owner/projects` | Propriétaire |
| POST | `/api/project-owner/projects` | Propriétaire |

### Offres
| Méthode | Endpoint | Rôle |
|---------|----------|------|
| POST | `/api/offers` | Guide/Propriétaire |
| GET | `/api/offers` | Public (support `?page=&limit=` pour pagination) |
| GET | `/api/offers/mine` | Guide/Propriétaire |
| GET | `/api/offers/items/mine` | Guide/Propriétaire |
| GET | `/api/offers/public` | Public (filtres + pagination) |
| PATCH | `/api/offers/:id` | Guide/Propriétaire |
| POST | `/api/offers/:id/items` | Guide/Propriétaire |
| POST | `/api/offers/items/:itemId/prices` | Guide/Propriétaire |
| POST | `/api/offers/items/:itemId/availability` | Guide/Propriétaire |

### Circuits
| Méthode | Endpoint | Rôle |
|---------|----------|------|
| POST | `/api/circuits` | Guide/Propriétaire |
| GET | `/api/circuits` | Public (support `?page=&limit=` pour pagination) |
| GET | `/api/circuits/:id` | Public |
| POST | `/api/circuits/:id/days` | Guide/Propriétaire |
| POST | `/api/circuits/:id/days/:dayId/program` | Guide/Propriétaire |
| POST | `/api/circuits/:id/options` | Guide/Propriétaire |
| POST | `/api/circuits/:id/reserve` | Voyageur |

### Admin
| Méthode | Endpoint | Rôle |
|---------|----------|------|
| GET | `/api/admin/pending/circuits` | Admin |
| GET | `/api/admin/pending/guide-offerings` | Admin |
| GET | `/api/admin/moderation-log` | Admin (historique complet) |
| PATCH | `/api/admin/circuits/:id/approve` | Admin |
| PATCH | `/api/admin/circuits/:id/reject` | Admin |
| PATCH | `/api/admin/circuits/:id/archive` | Admin |
| PATCH | `/api/admin/guide-offerings/:id/approve` | Admin |
| PATCH | `/api/admin/guide-offerings/:id/reject` | Admin |
| PATCH | `/api/admin/guide-offerings/:id/archive` | Admin |
| PATCH | `/api/admin/offers/:id/approve` | Admin |
| PATCH | `/api/admin/offers/:id/reject` | Admin |
| PATCH | `/api/admin/offers/:id/archive` | Admin |
| PATCH | `/api/admin/users/:id/ban` | Admin |
| PATCH | `/api/admin/users/:id/unban` | Admin |

### Réservations
| Méthode | Endpoint | Rôle |
|---------|----------|------|
| POST | `/api/bookings` | Voyageur |
| GET | `/api/bookings/mine` | Voyageur |
| GET | `/api/bookings/incoming` | Guide/Propriétaire |
| PATCH | `/api/bookings/:id/cancel` | Voyageur |
| PATCH | `/api/bookings/:id/confirm` | Guide/Propriétaire |

### Guide Search
| Méthode | Endpoint | Rôle |
|---------|----------|------|
| GET | `/api/guide/search?q=&zone=&max_price=&lat=&lng=&date=` | Public |
| GET | `/api/guide/public/search?q=&date=` | Public |

### Autres
| Méthode | Endpoint | Rôle |
|---------|----------|------|
| POST | `/api/favorites` | Voyageur |
| POST | `/api/reviews` | Voyageur |
| GET | `/api/notifications` | Tous |
| POST | `/api/messages` | Tous |
| POST | `/api/upload` | Tous |
| POST | `/api/follows/:targetId/:type` | Tous |

---

*Dernière mise à jour : 5 Juillet 2026*
