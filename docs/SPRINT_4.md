# Sprint 4 — Refactor Offres / Guides / Circuits

**Date :** 28 Juin 2026
**Commit :** 3aa46c5

---

## Sommaire

1. [Refactor Offres → Projets](#1-refactor-offres--projets)
2. [Localisation des offres](#2-localisation-des-offres)
3. [Nouveau modèle : Offre de guidage](#3-nouveau-modèle--offre-de-guidage)
4. [Circuit : ajout d'un guide aux activités](#4-circuit--ajout-dun-guide-aux-activités)
5. [Trip Planner : guide sur les items](#5-trip-planner--guide-sur-les-items)
6. [Architecture finale](#6-architecture-finale)
7. [Fichiers modifiés/créés](#7-fichiers-modifiécréés)
8. [Commandes utiles](#8-commandes-utiles)

---

## 1. Refactor Offres → Projets

### Avant
```
Propriétaire
    ├── Projet A
    └── Projet B
          ↑
Offres (indépendantes)
    - Kayak
    - Hébergement
    - Restaurant
```

### Après
```
Propriétaire
    ├── Projet A
    │     ├── Hébergement
    │     ├── Restaurant
    │     └── Kayak
    └── Projet B
          ├── Camping
          └── Vélo
```

### Changements

**Offer entity** — `project_id` devient obligatoire pour `author_type = 'project_owner'` :

```
offers
├── project_id UUID NOT NULL (project_owner) │ FK → projects
├── location_type VARCHAR default 'fixed'     │ 'fixed' | 'mobile'
└── ...
```

**OfferService.create()** — valide que le projet existe et est actif, `project_id` requis pour project_owner.

**OfferController** — toutes les routes sont maintenant `@Roles(Role.PROJECT)` uniquement (plus de création par les guides).

---

## 2. Localisation des offres

### Catégorie A — Offres fixes
Hébergement, Restaurant, Cabane, Camping, Espace tente, Ferme, Musée, Boutique

- `location_type = 'fixed'`
- La localisation est **héritée automatiquement** du projet
- L'utilisateur ne peut pas définir de lat/lng/address
- Afficher "Localisation héritée du projet" dans l'UI

```typescript
// offer.service.ts
const locationType = dto.location_type ?? 'fixed';
const isFixed = locationType === 'fixed';

region:     isFixed ? projectRegion : (dto.region ?? null),
address:    isFixed ? projectAddress : (dto.address ?? null),
latitude:   isFixed ? projectLat : (dto.latitude ?? null),
longitude:  isFixed ? projectLng : (dto.longitude ?? null),
```

### Catégorie B — Offres mobiles
Kayak, Randonnée, Trek, Balade VTT, Excursion, Observation oiseaux, Circuit nature

- `location_type = 'mobile'`
- L'offre possède **sa propre localisation** (lat/lng, point de départ, rayon)
- Peut commencer ailleurs que le projet

---

## 3. Nouveau modèle : Offre de guidage

Le **guide ne vend plus d'activités** (kayak, randonnée, etc.).  
Le guide vend **sa disponibilité** via des **offres de guidage**.

### Entité `GuideOffering`

```typescript
@Entity('guide_offerings')
class GuideOffering {
  id: uuid
  guide_id: uuid           // FK → guides
  title: string            // "Guide Nature Fernana"
  description: text?
  languages: string[]?
  price: decimal
  pricing_unit: string     // 'hour' | 'half_day' | 'day'
  min_travelers: int?
  max_travelers: int?

  // Zone de service
  service_zone_type: string // 'point' | 'radius' | 'governorate' | 'municipality' | 'all_tunisia' | 'custom'
  lat: decimal?
  lng: decimal?
  radius_km: decimal?
  zone_governorate: string?
  zone_municipality: string?

  // Déplacement
  displacement_allowed: boolean
  displacement_max_km: decimal?
  displacement_type: string? // 'limited' | 'all_tunisia' | 'quote'

  status: string            // 'pending' | 'active' | 'suspended'
  created_at: Date
  updated_at: Date
}
```

### Calendrier — `GuideOfferingAvailabilityRule`

Réutilise le même pattern que `OfferItemAvailabilityRule` :

```typescript
@Entity('guide_offering_availability_rules')
class GuideOfferingAvailabilityRule {
  guide_offering_id: uuid   // FK → guide_offerings
  availability_type: string // 'weekly' | 'daily' | 'date_range' | 'weekend_only' | 'custom' | 'on_demand'
  start_date: Date?
  end_date: Date?
  weekdays: number[]?
  start_time: time?
  end_time: time?
  recurrence_rule: string?  // RRULE
  is_active: boolean
}
```

### Modes de disponibilité

| Mode | Description |
|------|-------------|
| Tous les jours | `date_range` avec une période (1 juin → 30 septembre) |
| Chaque semaine | `weekly` avec jours sélectionnés (Lun, Mer, Ven) |
| Dates perso | `date_range` avec dates spécifiques |
| Sur demande | `on_demand` — le voyageur propose, le guide accepte |

### API

| Méthode | Endpoint | Rôle |
|---------|----------|------|
| POST | `/guide-offerings` | GUIDE |
| GET | `/guide-offerings/mine` | GUIDE |
| GET | `/guide-offerings` | Public |
| GET | `/guide-offerings/:id` | Public |
| PATCH | `/guide-offerings/:id` | GUIDE |
| DELETE | `/guide-offerings/:id` | GUIDE |
| POST | `/guide-offerings/:id/availability` | GUIDE |
| GET | `/guide-offerings/:id/availability` | Public |
| DELETE | `/guide-offerings/availability/:ruleId` | GUIDE |

---

## 4. Circuit : ajout d'un guide aux activités

### Changement dans `CircuitProgramItem`

```
circuit_program_items
├── guide_id UUID?        │ FK → guides (user_id)
└── guide_name VARCHAR?   │ Dénormalisé pour l'affichage
```

Le propriétaire peut cliquer "Choisir un guide" sur une activité et le moteur filtre automatiquement :
- guides disponibles ce jour
- guides dont la zone couvre la localisation de l'activité
- guides pouvant se déplacer selon leur rayon

### API

| Méthode | Endpoint | Changement |
|---------|----------|------------|
| POST | `/circuits/:circuitId/days/:dayId/program` | Accepte `guide_id`, `guide_name` |
| PATCH | `/circuits/days/program/:itemId` | Accepte `guide_id`, `guide_name` |

---

## 5. Trip Planner : guide sur les items

### Changement dans `TripPlanItem`

```
trip_plan_items
└── guide_id UUID?        │ FK → guides (user_id)
```

Le voyageur peut chercher un guide depuis son planning :
- filtrage par date, zone, disponibilité
- réservation directe du guide

---

## 6. Architecture finale

```
Propriétaire
    └── Projet
          └── Offres (fixed | mobile)
                └── OfferItems
                      ├── Prices
                      ├── Capacity
                      ├── AvailabilityRules
                      └── Sessions

Guide
    └── Offres de guidage
          └── AvailabilityRules

Circuit
    └── Jours
          └── Activités
                └── Guide (optionnel)

Trip Planner
    └── Jours
          └── Items (offre | circuit)
                └── Guide (optionnel)
```

### Relations clés

```
offers.project_id           → projects.id (nullable pour migration, required en logique)
guide_offerings.guide_id    → guides.user_id
circuit_program_items.guide_id → guides.user_id
trip_plan_items.guide_id    → guides.user_id
```

---

## 7. Fichiers modifiés/créés

### Créés

| Fichier | Description |
|---------|-------------|
| `backend/src/guide/entities/guide-offering.entity.ts` | Entité Offre de guidage |
| `backend/src/guide/entities/guide-offering-availability-rule.entity.ts` | Règles de dispo |
| `backend/src/guide/dto/guide-offering.dto.ts` | DTOs création/update/règle |
| `backend/src/guide/guide-offering.service.ts` | Service CRUD + availability |
| `backend/src/guide/guide-offering.controller.ts` | Endpoints REST |
| `docs/SPRINT_4.md` | Cette documentation |

### Modifiés

| Fichier | Changement |
|---------|------------|
| `backend/src/offer/entities/offer.entity.ts` | +`location_type` |
| `backend/src/offer/offer.service.ts` | `project_id` required, héritage localisation |
| `backend/src/offer/offer.controller.ts` | `GUIDE` retiré, `PROJECT` only |
| `backend/src/offer/offer.module.ts` | `GuideModule` retiré des imports |
| `backend/src/offer/dto/offer.dto.ts` | +`location_type` dans Create/Update |
| `backend/src/guide/guide.service.ts` | `getPublicProfile` retourne `offerings` |
| `backend/src/guide/guide.module.ts` | +GuideOffering, -Offer |
| `backend/src/circuit/entities/circuit-program-item.entity.ts` | +`guide_id`, `guide_name` |
| `backend/src/circuit/dto/create-circuit-program-item.dto.ts` | +`guide_id`, `guide_name` |
| `backend/src/circuit/circuit.service.ts` | Guide dans add/updateProgramItem |
| `backend/src/trip-plan/entities/trip-plan-item.entity.ts` | +`guide_id` |

---

## 8. Commandes utiles

```bash
# Backend
cd backend

# Build
npx nest build

# Tests
npx jest --no-coverage

# Lint
yarn lint

# Migration (après création)
npx typeorm migration:generate -d src/database/typeorm.config.ts src/database/migrations/Sprint4Refactor
npx typeorm migration:run -d src/database/typeorm.config.ts

# Frontend
cd frontend
yarn dev
```

### Tester le nouveau modèle

```bash
# Créer une offre de guidage
curl -X POST http://localhost:3000/guide-offerings \
  -H "Authorization: Bearer <token_guide>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Guide Nature Fernana",
    "price": 50,
    "pricing_unit": "half_day",
    "languages": ["fr", "en"],
    "service_zone_type": "radius",
    "lat": 36.8065,
    "lng": 10.1815,
    "radius_km": 15,
    "displacement_allowed": true,
    "displacement_max_km": 50
  }'

# Ajouter une règle de disponibilité
curl -X POST http://localhost:3000/guide-offerings/<id>/availability \
  -H "Authorization: Bearer <token_guide>" \
  -H "Content-Type: application/json" \
  -d '{
    "availability_type": "weekly",
    "weekdays": [1, 3, 5],
    "start_time": "09:00",
    "end_time": "17:00"
  }'
```
