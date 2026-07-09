# TripPlan — Plans de Voyage

> **Module :** `TripPlan` (backend) + 3 pages (frontend)  
> **Ajoute :** Sprint 5-6 — Plans de voyage avec cartes Leaflet et verification des limites  
> **Role :** Permettre aux eco-voyageurs de creer des plans multi-activites et de reserver en groupe

---

## 1. Presentation

Un **TripPlan** (plan de voyage) est un conteneur d'activites cree par un eco-voyageur. Il permet de :

1. Regrouper des offres/activites dans un meme plan
2. Organiser par jour avec des notes
3. Verifier les limites de participants et d'age
4. Reserver toutes les activities en une seule action
5. Suivre le statut (brouillon → planification → confirme → termine)

### Exemple

```
"Weekend a Djerba" (TripPlan)
├── Jour 1
│   ├── Randonee guidee (OfferItem)
│   └── Diner traditionnel (OfferItem)
├── Jour 2
│   ├── Kayak en mer (OfferItem)
│   └── Camping (OfferItem)
└── [Reserver tout] → 4 reservations creees
```

---

## 2. Architecture 3-tiers

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION TIER (Frontend)                               │
│                                                             │
│  Next.js 16 · App Router · Tailwind CSS v4                  │
│  Leaflet/react-leaflet · apiFetch<T>() · localStorage Auth  │
│                                                             │
│  Pages : /trip-plans · /new · /[id]                         │
│         AddItemModal · BookModal · TripMap                  │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP (fetch) + JWT Bearer
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  LOGIC TIER (Backend)                                       │
│                                                             │
│  NestJS · TypeORM · PostgreSQL                              │
│                                                             │
│  TripPlanController (9 endpoints)                           │
│  TripPlanService (CRUD + items + book)                      │
│  @Roles(ECO_TRAVELER) guard                                 │
│  Verification max_group_size + min_age                      │
│  Notification provider pour confirmation manuelle           │
└───────────────────────┬─────────────────────────────────────┘
                        │ TypeORM Repository
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  DATA TIER (PostgreSQL)                                     │
│                                                             │
│  trip_plans · trip_plan_items                               │
│  Relations : User → TripPlan, TripPlan → TripPlanItem,      │
│              TripPlanItem → OfferItem                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Backend — NestJS / TypeORM

### Structure du module

```
backend/src/trip-plan/
├── trip-plan.controller.ts       ← 9 endpoints REST
├── trip-plan.service.ts           ← CRUD + items + book()
├── trip-plan.module.ts            ← NestJS module
├── entities/
│   ├── trip-plan.entity.ts        ← TripPlan (table trip_plans)
│   └── trip-plan-item.entity.ts   ← TripPlanItem (table trip_plan_items)
└── dto/
    ├── create-trip-plan.dto.ts
    ├── update-trip-plan.dto.ts
    ├── add-trip-plan-item.dto.ts
    └── book-trip-plan.dto.ts
```

### Entites

#### TripPlan (`trip_plans`)

| Champ | Type | TypeORM |
|-------|------|---------|
| `id` | UUID (PK) | `@PrimaryGeneratedColumn('uuid')` |
| `ecoTraveler` | Relation → User | `@ManyToOne(() => User)` |
| `title` | varchar | `@Column()` |
| `description` | text nullable | `@Column({ type: 'text', nullable: true })` |
| `start_date` | date nullable | `@Column({ type: 'date', nullable: true })` |
| `end_date` | date nullable | `@Column({ type: 'date', nullable: true })` |
| `status` | varchar default `draft` | `@Column({ default: 'draft' })` |
| `items` | OneToMany → TripPlanItem | `@OneToMany(() => TripPlanItem, ...)` |
| `created_at` | timestamp | `@CreateDateColumn()` |
| `updated_at` | timestamp | `@UpdateDateColumn()` |

#### TripPlanItem (`trip_plan_items`)

| Champ | Type | TypeORM |
|-------|------|---------|
| `id` | UUID (PK) | `@PrimaryGeneratedColumn('uuid')` |
| `tripPlan` | Relation → TripPlan (CASCADE) | `@ManyToOne(() => TripPlan, { onDelete: 'CASCADE' })` |
| `offerItem` | Relation → OfferItem (SET NULL) | `@ManyToOne(() => OfferItem, { onDelete: 'SET NULL' })` |
| `day_number` | int nullable | `@Column({ type: 'int', nullable: true })` |
| `sort_order` | int default 0 | `@Column({ default: 0 })` |
| `notes` | text nullable | `@Column({ type: 'text', nullable: true })` |
| `created_at` | timestamp | `@CreateDateColumn()` |

### Service — Logique metier

```typescript
class TripPlanService {
  // CRUD
  create(ecoTravelerId, dto): TripPlan
  findByTraveler(ecoTravelerId): TripPlan[]
  findByIdForOwner(id, ecoTravelerId): TripPlan  // owner check
  update(id, ecoTravelerId, dto): TripPlan
  remove(id, ecoTravelerId): void

  // Items
  addItem(tripPlanId, ecoTravelerId, dto): TripPlanItem
  updateItem(tripPlanId, itemId, ecoTravelerId, dto): TripPlanItem
  removeItem(tripPlanId, itemId, ecoTravelerId): void

  // Booking
  book(tripPlanId, ecoTravelerId, dto): Booking[]
  // → Verification max_group_size + min_age
  // → Notification provider si confirmation manuelle
  // → Transaction (QueryRunner)
}
```

---

## 4. Frontend — Next.js 16

### Pages

| Route | Fichier | Description |
|-------|---------|-------------|
| `/trip-plans` | `app/trip-plans/page.tsx` | Liste des plans avec status et nb d'elements |
| `/trip-plans/new` | `app/trip-plans/new/page.tsx` | Formulaire de creation (titre, dates) |
| `/trip-plans/[id]` | `app/trip-plans/[id]/page.tsx` | Detail + gestion items + reservation + carte TripMap |

### Composants

- **AddItemModal** : Recherche d'offres, affichage des items, ajout au plan
- **BookModal** : Formulaire participants, soumission reservation groupee
- **TripMap** : Carte Leaflet avec les positions GPS des items du plan

### Pattern d'appel API

```typescript
import { apiFetch } from "@/lib/api";

// Liste des plans
const plans = await apiFetch<TripPlan[]>("/trip-plans/mine");

// Creation
const plan = await apiFetch<TripPlan>("/trip-plans", {
  method: "POST",
  body: JSON.stringify({ title, description, start_date, end_date }),
});

// Ajout d'item
await apiFetch(`/trip-plans/${id}/items`, {
  method: "POST",
  body: JSON.stringify({ offer_item_id, day_number, notes }),
});

// Reservation groupee
const bookings = await apiFetch(`/trip-plans/${id}/book`, {
  method: "POST",
  body: JSON.stringify({ participants, special_requests }),
});
```

---

## 5. API Endpoints

| Methode | Endpoint | Auth | Body | Retour |
|---------|----------|------|------|--------|
| `POST` | `/trip-plans` | Eco-voyageur | `{ title, description?, start_date?, end_date? }` | `TripPlan` |
| `GET` | `/trip-plans/mine` | Eco-voyageur | — | `TripPlan[]` |
| `GET` | `/trip-plans/:id` | Proprietaire | — | `TripPlan` (avec items) |
| `PATCH` | `/trip-plans/:id` | Proprietaire | `{ title?, description?, start_date?, end_date? }` | `TripPlan` |
| `DELETE` | `/trip-plans/:id` | Proprietaire | — | `void` |
| `POST` | `/trip-plans/:id/items` | Proprietaire | `{ offer_item_id, day_number?, sort_order?, notes? }` | `TripPlanItem` |
| `PATCH` | `/trip-plans/:id/items/:itemId` | Proprietaire | `{ day_number?, sort_order?, notes? }` | `TripPlanItem` |
| `DELETE` | `/trip-plans/:id/items/:itemId` | Proprietaire | — | `void` |
| `POST` | `/trip-plans/:id/book` | Proprietaire | `{ participants: ParticipantDto[], special_requests? }` | `Booking[]` |

### ParticipantDto

```typescript
{
  full_name: string;        // Nom complet
  age?: number;             // Age (optionnel)
  document_type: string;    // "none" | "passport" | "id_card"
  document_number?: string; // N° document
  is_group_leader: boolean; // Chef de groupe ?
}
```

---

## 6. Flux de reservation groupee

```
[Voyageur]
    │
    ├── 1. Cree un plan POST /trip-plans
    │
    ├── 2. Ajoute des items POST /trip-plans/:id/items
    │       ├── offer_item_id = UUID de l'OfferItem
    │       └── day_number, notes (optionnels)
    │
    ├── 3. [Optionnel] Navigue vers /offers pour decouvrir
    │         d'autres activities a ajouter
    │
    └── 4. Reserve tout POST /trip-plans/:id/book
            │
            ▼
    [TripPlanService.book()]
            │
            ├── Verification propriete du plan
            ├── Charge items + offerItems + offers + prices
            │
            ├── Pour chaque item :
            │   ├── Verifie max_group_size
            │   ├── Verifie min_age
            │   ├── Prend le prix par defaut (is_default)
            │   ├── Cree un Booking :
            │   │   ├── offer_id    ← de l'Offer de l'OfferItem
            │   │   ├── offer_item_id
            │   │   ├── total_price ← prix par defaut
            │   │   ├── status     ← "confirmed" ou "pending"
            │   │   └── booking_ref ← "BK-" + aleatoire
            │   └── Copie les participants dans booking_participants
            │
            ├── Notifie le provider si confirmation manuelle
            │
            └── Retourne Booking[] (avec offer, offerItem, participants)
```

---

## 7. Regles metier

| Regle | Implementation |
|-------|---------------|
| **Propriete exclusive** | `findByIdForOwner()` verifie `plan.ecoTraveler.id === userId` |
| **Statut par defaut** | Nouveau plan → `draft` |
| **CASCADE delete** | Supprimer un plan → supprime tous ses items (TypeORM CASCADE) |
| **Item sans offre** | `SET NULL` sur `offer_item_id` si l'OfferItem est supprime |
| **Reservation sans item** | `book()` echoue si le plan n'a aucun item |
| **Prix par defaut** | Prend `prices.find(p => p.is_default)` ou `prices[0]` |
| **Booking ref** | Format `BK-XXXXXX` (aleatoire) |
| **Participants copies** | Mêmes participants pour tous les bookings crees |
| **Verification participants** | Verifie `max_group_size` et `min_age` de chaque offre |
| **Notification provider** | Notifie le provider pour confirmation manuelle |
| **Transaction** | QueryRunner avec startTransaction/commit/rollback |
| **Sessions ignorees** | V1 : pas de selection de session (sera ajoute en v2) |
| **Pas de conflit** | Aucune verification de conflit horaire (v2) |

---

## 8. Carte Leaflet

La page detail du plan de voyage affiche une **carte Leaflet** montrant les positions GPS des items du plan.

### Composants

| Composant | Description |
|-----------|-------------|
| `TripMap.tsx` | Wrapper dynamique (evite les erreurs SSR) |
| `TripMapInner.tsx` | Composant Leaflet interne avec markers |

### Donnees GPS

Les coordonnees GPS proviennent de l'`OfferItem` lie via `offer_lat`, `offer_lng`, ou de l'`Offer` parent via `latitude`, `longitude`.

---

## 9. Fichiers crees (backend)

| Fichier | Description |
|---------|-------------|
| `backend/src/trip-plan/trip-plan.controller.ts` | 9 endpoints REST |
| `backend/src/trip-plan/trip-plan.service.ts` | CRUD + items + booking groupe + verification limites |
| `backend/src/trip-plan/trip-plan.module.ts` | Module NestJS |
| `backend/src/trip-plan/entities/trip-plan.entity.ts` | Entite TripPlan |
| `backend/src/trip-plan/entities/trip-plan-item.entity.ts` | Entite TripPlanItem |
| `backend/src/trip-plan/dto/create-trip-plan.dto.ts` | DTO creation |
| `backend/src/trip-plan/dto/update-trip-plan.dto.ts` | DTO mise a jour |
| `backend/src/trip-plan/dto/add-trip-plan-item.dto.ts` | DTO ajout item |
| `backend/src/trip-plan/dto/book-trip-plan.dto.ts` | DTO reservation groupee |

## 10. Fichiers crees (frontend)

| Fichier | Description |
|---------|-------------|
| `frontend/app/trip-plans/page.tsx` | Liste des plans de voyage |
| `frontend/app/trip-plans/new/page.tsx` | Creation d'un plan |
| `frontend/app/trip-plans/[id]/page.tsx` | Detail + items + reservation + carte |

## 11. Schéma relationnel

```
users (1) ──→ trip_plans (*)
trip_plans (1) ──→ trip_plan_items (*)
offer_items (1) ──→ trip_plan_items (*)
trip_plans (1) ──→ bookings (*)  ← via book()
```
