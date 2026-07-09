# Catalogue & Reservation — Feature Complete

> **Sprint 4-6** — Catalogue, reservation, circuits, notifications, trip plans, maps, onboarding  
> **Pour Maram :** Tout le systeme de catalogue avance, les reservations, les circuits multi-jours, les notifications, les plans de voyage, les cartes Leaflet, et les correctifs de bugs.

---

## Table des matieres

1. [Architecture globale](#1-architecture-globale)
2. [Catalogue Simple](#2-catalogue-simple)
3. [Catalogue Complexe](#3-catalogue-complexe)
4. [Reservations](#4-reservations)
5. [Circuits / Packages](#5-circuits--packages)
6. [Notifications](#6-notifications)
7. [TripPlan (Plans de voyage)](#7-tripplan-plans-de-voyage)
8. [API Endpoints](#8-api-endpoints)
9. [Seed offer_categories](#9-seed-offer_categories)
10. [Fichiers modifies/crees](#10-fichiers-modifiescrees)
11. [Bug fixes](#11-bug-fixes)
12. [Resume PR pour Maram](#12-resume-pr-pour-maram)

---

## 1. Architecture globale

```
Provider (Guide | ProjectOwner)
│
├── Offers (catalogue)
│   ├── OfferCategories (lookup — 10 lignes seedees)
│   └── OfferItems (elements vendables)
│       ├── OfferItemPrices (prix par categorie)
│       ├── OfferItemCapacity (stock / capacite)
│       ├── OfferItemAvailabilityRules (recurrence)
│       └── OfferItemSessions (creneaux concrets)
│
├── Bookings (reservations)
│   ├── BookingParticipants (individus)
│   └── → Notifications
│
├── Circuits (packages multi-jours)
│   ├── CircuitDays (journees)
│   ├── CircuitProgramItems (activites du jour)
│   ├── CircuitOptions (options additionnelles)
│   ├── CircuitReservations (resas circuits)
│   │   └── CircuitReservationOptions (options choisies)
│   └── → Notifications
│
└── TripPlans (plans de voyage — eco-voyageur)
    ├── TripPlanItems (activites / offres ajoutees au plan)
    └── → Booking (reservation en lot du plan complet)
```

### Regles metier

| Concept | Regle |
|---------|-------|
| **author_id + author_type** | Polymorphisme : un guide OU un project_owner cree des offres et circuits |
| **Offer vs Circuit** | Offer = unitaire (ex: plat, nuitee) ; Circuit = package multi-jours avec programme |
| **Catalogue Simple** | Items avec stock global, pas de dates. Ideal : hebergement, artisanat, transport |
| **Catalogue Complexe** | Items avec sessions datees, capacite journaliere. Ideal : activites, ateliers |
| **Confirmation** | `automatic` = resa confirmee immediatement ; `manual` = le provider valide |
| **TripPlan** | Regroupe plusieurs offres dans un plan, reserve en groupe avec verification des limites |

---

## 2. Catalogue Simple

### Tables

#### `offer_categories` — Lookup (10 lignes seedees)

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | |
| `slug` | varchar(50) UNIQUE | `eco_tour`, `accommodation`, `activity`, `restaurant`, `craft`, `workshop`, `transfer`, `sejour`, `circuit`, `other` |
| `label` | varchar(100) | `Eco-Tour`, `Hebergement`, etc. |
| `icon` | varchar(50) nullable | Identifiant icone |
| `sort_order` | int (default 0) | Ordre d'affichage |

#### `offers` — Colonnes ajoutees a la table existante

| Colonne ajoutee | Type | Description |
|-----------------|------|-------------|
| `category_id` | UUID (FK → offer_categories) nullable | Categorie (remplace progressivement `offer_type`) |
| `address` | varchar nullable | Adresse postale complete |
| `latitude` | decimal(10,7) nullable | GPS latitude |
| `longitude` | decimal(10,7) nullable | GPS longitude |
| `confirmation_mode` | varchar default `automatic` | `automatic` \| `manual` |
| `images` | simple-array nullable | URLs des images |

#### `offer_items` — Nouvelle table

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | |
| `offer_id` | UUID (FK → offers) CASCADE | Offre parente |
| `name` | varchar | "Couscous", "Tente 2 places", "Velo VTT" |
| `description` | text nullable | |
| `item_type` | varchar nullable | `room`, `bed`, `dish`, `menu`, `equipment`, `activity`, `workshop`... |
| `details_json` | json nullable | Infos libres |
| `bed_count` | int nullable | Nombre de lits (hebergement) |
| `nights` | int nullable | Nombre de nuits (hebergement) |
| `tent_capacity` | int nullable | Capacite en personnes (camping) |
| `room_type` | varchar nullable | Type de chambre |
| `requires_confirmation` | boolean default false | |
| `confirmation_mode` | varchar nullable | `automatic` \| `manual` |
| `booking_deadline_days` | int nullable | Resa X jours avant max |
| `cancellation_deadline_days` | int nullable | Annulation gratuite X jours avant |
| `production_delay_days` | int nullable | Delai de preparation |
| `status` | varchar default `active` | `active` \| `inactive` |

#### `offer_item_prices` — Nouvelle table

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | |
| `offer_item_id` | UUID (FK → offer_items) CASCADE | |
| `label` | varchar | "Adulte", "Enfant", "Etudiant" |
| `price` | decimal(10,2) | |
| `currency` | varchar default `TND` | Tunisian Dinar |
| `pricing_unit` | varchar default `per_person` | `per_person`, `per_night`, `per_hour`... |
| `min_quantity` | int nullable | |
| `max_quantity` | int nullable | |
| `is_default` | boolean default false | |
| `status` | varchar default `active` | |

---

## 3. Catalogue Complexe

#### `offer_item_capacity` — Stock / Capacite

| Champ | Type |
|-------|------|
| `id` | UUID (PK) |
| `offer_item_id` | UUID (FK → offer_items) CASCADE |
| `capacity_type` | varchar : `rooms`, `beds`, `items`, `persons`, `seats` |
| `total_quantity` | int nullable — Stock total |
| `max_persons` | int nullable |
| `min_participants` | int nullable |
| `max_participants` | int nullable |

#### `offer_item_availability_rules` — Regles de recurrence

| Champ | Type |
|-------|------|
| `id` | UUID (PK) |
| `offer_item_id` | UUID (FK → offer_items) CASCADE |
| `availability_type` | varchar : `weekly`, `daily`, `date_range`, `weekend_only`, `custom` |
| `start_date` | date nullable |
| `end_date` | date nullable |
| `weekdays` | simple-array nullable : `[1,2,3,4,5]` = semaine |
| `start_time` | time nullable |
| `end_time` | time nullable |
| `recurrence_rule` | varchar nullable : `FREQ=WEEKLY;BYDAY=MO,WE,FR` |
| `is_active` | boolean default true |

#### `offer_item_sessions` — Creneaux concrets

| Champ | Type |
|-------|------|
| `id` | UUID (PK) |
| `offer_item_id` | UUID (FK → offer_items) CASCADE |
| `date` | date |
| `start_time` | time |
| `end_time` | time |
| `total_capacity` | int nullable |
| `remaining_capacity` | int nullable |
| `price_override` | decimal(10,2) nullable |
| `status` | varchar default `available` |

---

## 4. Reservations

#### `bookings` — Nouvelle table

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | |
| `booking_ref` | varchar UNIQUE | `BK-` + aleatoire (lisible) |
| `traveler_id` | UUID (FK → users) | Qui reserve |
| `offer_id` | UUID (FK → offers) | Offre reservee |
| `offer_item_id` | UUID (FK → offer_items) nullable | Item specifique |
| `session_id` | UUID (FK → offer_item_sessions) nullable | Creneau choisi |
| `status` | varchar default `pending` | `pending`, `confirmed`, `cancelled`, `completed`, `refunded` |
| `total_price` | decimal(10,2) | |
| `currency` | varchar default `TND` | |
| `special_requests` | text nullable | |
| `confirmation_mode` | varchar nullable | Copie de l'offre a la resa |
| `cancelled_at` | timestamp nullable | |
| `cancel_reason` | text nullable | |

#### `booking_participants` — Nouvelle table

| Champ | Type |
|-------|------|
| `id` | UUID (PK) |
| `booking_id` | UUID (FK → bookings) CASCADE |
| `full_name` | varchar |
| `age` | int nullable |
| `document_type` | varchar nullable : `passport`, `id_card`, `none` |
| `document_number` | varchar nullable |
| `is_group_leader` | boolean default false |

---

## 5. Circuits / Packages

#### `circuits` — Nouvelle table

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | |
| `author_id` | UUID | Guide ou Project Owner |
| `author_type` | varchar | `guide` \| `project_owner` |
| `project_id` | UUID nullable | |
| `title` | varchar | |
| `description` | text nullable | |
| `start_date` | date nullable | |
| `end_date` | date nullable | |
| `duration_days` | int nullable | |
| `duration_nights` | int nullable | |
| `region` | varchar nullable | |
| `base_price` | decimal(10,2) nullable | |
| `currency` | varchar default `TND` | |
| `max_participants` | int nullable | |
| `booking_deadline_days` | int nullable | |
| `confirmation_mode` | varchar nullable | |
| `status` | varchar default `pending` | `pending`, `approved`, `rejected`, `archived` |
| `rejection_reason` | text nullable | |
| `inclusions` | text nullable | |
| `exclusions` | text nullable | |
| `images` | simple-array nullable | URLs des images |
| `address` | varchar nullable | Adresse du point de depart |
| `lat` | decimal nullable | GPS latitude |
| `lng` | decimal nullable | GPS longitude |

#### `circuit_days` — Nouvelle table

| Champ | Type |
|-------|------|
| `id` | UUID (PK) |
| `circuit_id` | UUID (FK → circuits) CASCADE |
| `day_number` | int |
| `date` | date nullable |
| `title` | varchar |
| `description` | text nullable |
| `lat` | decimal nullable |
| `lng` | decimal nullable |
| `address` | varchar nullable |
| `location_name` | varchar nullable |

#### `circuit_program_items` — Nouvelle table

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | |
| `circuit_day_id` | UUID (FK → circuit_days) CASCADE | |
| `title` | varchar | |
| `description` | text nullable | |
| `start_time` | time nullable | Format HH:MM |
| `end_time` | time nullable | Format HH:MM |
| `is_included` | boolean default true | Inclus dans le prix de base |
| `is_required` | boolean default true | Obligatoire ou optionnel |
| `linked_offer_item_id` | UUID nullable | Lien vers un OfferItem |
| `linked_location_id` | UUID nullable | Lien vers un lieu |

#### `circuit_options` — Nouvelle table

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | |
| `circuit_id` | UUID (FK → circuits) CASCADE | |
| `offer_item_id` | UUID nullable | Lien vers un OfferItem |
| `option_group` | varchar nullable | `transport`, `accommodation`, `equipment`, `activity`, `food` |
| `option_type` | varchar | `single_choice`, `multiple_choice`, `quantity`, `time_slot` |
| `is_required` | boolean default false | |
| `is_included` | boolean default false | Inclus dans le prix de base |
| `extra_price` | decimal(10,2) nullable | |
| `selection_mode` | varchar nullable | |
| `min_quantity` | int nullable | |
| `max_quantity` | int nullable | |
| `status` | varchar default `active` | |

#### `circuit_reservations` — Nouvelle table

| Champ | Type |
|-------|------|
| `id` | UUID (PK) |
| `circuit_id` | UUID (FK → circuits) |
| `user_id` | UUID (FK → users) |
| `participants_count` | int nullable |
| `base_total` | decimal(10,2) nullable |
| `options_total` | decimal(10,2) default 0 |
| `final_total` | decimal(10,2) |
| `status` | varchar default `pending` |

---

## 6. Notifications

#### `notifications` — Nouvelle table

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | |
| `user_id` | UUID (FK → users) | Destinataire |
| `type` | varchar | `booking_confirmed`, `booking_cancelled`, `booking_request`, `offer_approved`, `offer_rejected`, `new_message`, `circuit_available` |
| `title` | varchar | |
| `body` | text nullable | |
| `link` | varchar nullable | Lien profond vers la page |
| `is_read` | boolean default false | |

---

## 7. TripPlan (Plans de voyage)

Un **TripPlan** permet a un eco-voyageur de rassembler plusieurs offres/activites dans un meme plan, puis de toutes reserver en une seule action.

### Tables

#### `trip_plans`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | |
| `eco_traveler_id` | UUID (FK → users) | Proprietaire du plan |
| `title` | varchar | Nom du plan |
| `description` | text nullable | |
| `start_date` | date nullable | Date de debut |
| `end_date` | date nullable | Date de fin |
| `status` | varchar default `draft` | `draft`, `planning`, `confirmed`, `completed`, `cancelled` |

#### `trip_plan_items`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | |
| `trip_plan_id` | UUID (FK → trip_plans) CASCADE | Plan parent |
| `offer_item_id` | UUID (FK → offer_items) SET NULL | Item d'offre ajoute |
| `day_number` | int nullable | Jour dans le plan |
| `sort_order` | int default 0 | Ordre d'affichage |
| `notes` | text nullable | Note personnelle |
| `created_at` | timestamp | |

### Regles metier

| Regle | Description |
|-------|-------------|
| **Propriete** | Un plan appartient a un seul eco-voyageur |
| **Item lie a OfferItem** | Chaque item est lie a un `OfferItem` (pas directement a une `Offer`) |
| **Verification participants** | `book()` verifie `max_group_size` et `min_age` de chaque offre |
| **Notification provider** | Notifie le provider pour confirmation manuelle si applicable |
| **CASCADE delete** | Supprimer un plan supprime ses items |

---

## 8. API Endpoints

### Catalogue

| Methode | Endpoint | Role |
|---------|----------|------|
| GET | `/offers` | Public — toutes les offres approuvees |
| GET | `/offers/:id` | Public — detail avec items, prix, sessions |
| POST | `/offers` | Guide/Project — creer offre |
| PATCH | `/offers/:id` | Owner — modifier |
| DELETE | `/offers/:id` | Owner — supprimer |
| GET | `/offers/:offerId/items` | Public — items d'une offre |
| POST | `/offers/:offerId/items` | Guide/Project — creer item |
| GET | `/offers/items/:itemId` | Public — detail item |
| PATCH | `/offers/items/:itemId` | Owner — modifier item |
| DELETE | `/offers/items/:itemId` | Owner — supprimer item |
| POST | `/offers/items/:itemId/prices` | Owner — ajouter prix |
| PATCH | `/offers/items/prices/:priceId` | Owner — modifier prix |
| DELETE | `/offers/items/prices/:priceId` | Owner — supprimer prix |
| POST | `/offers/items/:itemId/sessions` | Owner — creer session |
| PATCH | `/offers/items/sessions/:sessionId` | Owner — modifier session |
| DELETE | `/offers/items/sessions/:sessionId` | Owner — supprimer session |
| GET | `/offers/items/:itemId/sessions` | Public — sessions dispo |

### Reservations

| Methode | Endpoint | Role |
|---------|----------|------|
| POST | `/bookings` | Eco-voyageur |
| GET | `/bookings/mine` | Eco-voyageur |
| GET | `/bookings/incoming` | Provider — resas recues |
| GET | `/bookings/:id` | Tous (si concerne) |
| PATCH | `/bookings/:id/cancel` | Eco-voyageur |
| PATCH | `/bookings/:id/confirm` | Provider (manual mode) |

### Circuits

| Methode | Endpoint | Role |
|---------|----------|------|
| POST | `/circuits` | Guide/Project |
| GET | `/circuits` | Public |
| GET | `/circuits/mine` | Owner |
| GET | `/circuits/:id` | Public — avec jours, programme, options |
| PATCH | `/circuits/:id` | Owner |
| POST | `/circuits/:circuitId/days` | Owner |
| PATCH | `/circuits/days/:dayId` | Owner |
| DELETE | `/circuits/days/:dayId` | Owner |
| POST | `/circuits/:circuitId/program` | Owner |
| PATCH | `/circuits/program/:programId` | Owner |
| DELETE | `/circuits/program/:programId` | Owner |
| POST | `/circuits/:circuitId/reserve` | Eco-voyageur |
| GET | `/circuits/reservations/mine` | Eco-voyageur |
| GET | `/circuits/reservations/incoming` | Provider |
| PATCH | `/circuits/reservations/:id/confirm` | Provider |
| PATCH | `/circuits/reservations/:id` | Eco-voyageur (modifier) |
| DELETE | `/circuits/reservations/:id` | Eco-voyageur (supprimer) |

### Notifications

| Methode | Endpoint | Role |
|---------|----------|------|
| GET | `/notifications` | Tous — ses notifications |
| PATCH | `/notifications/:id/read` | Tous |
| PATCH | `/notifications/read-all` | Tous |
| GET | `/notifications/unread` | Tous — compteur |

### Trip Plans

| Methode | Endpoint | Role |
|---------|----------|------|
| POST | `/trip-plans` | Eco-voyageur — creer un plan |
| GET | `/trip-plans/mine` | Eco-voyageur — mes plans |
| GET | `/trip-plans/:id` | Proprietaire — detail du plan |
| PATCH | `/trip-plans/:id` | Proprietaire — modifier |
| DELETE | `/trip-plans/:id` | Proprietaire — supprimer |
| POST | `/trip-plans/:id/items` | Proprietaire — ajouter un item |
| PATCH | `/trip-plans/:id/items/:itemId` | Proprietaire — modifier un item |
| DELETE | `/trip-plans/:id/items/:itemId` | Proprietaire — supprimer un item |
| POST | `/trip-plans/:id/book` | Proprietaire — reserver tout le plan |

---

## 9. Seed `offer_categories`

```bash
cd backend && npm run seed:offer-categories
```

Le script est idempotent : si une categorie existe deja (même slug), elle est ignoree.

---

## 10. Fichiers modifies/crees

### Pages Frontend creees

| Fichier | Description |
|---------|-------------|
| `frontend/app/offers/[id]/page.tsx` | Detail offre : items, prix, sessions, images, carte, bouton Reserver |
| `frontend/app/reservations/new/page.tsx` | Formulaire reservation : item, session, participants, montant |
| `frontend/app/dashboard/reservations/page.tsx` | Mes resas voyageur : liste, statut, annulation |
| `frontend/app/dashboard/incoming/page.tsx` | Resas recues provider : confirmer/refuser |
| `frontend/app/circuits/page.tsx` | Liste publique circuits : filtres region, grille cartes |
| `frontend/app/circuits/[id]/page.tsx` | Detail circuit : itineraire jours, images, options, reservation, carte |
| `frontend/app/notifications/page.tsx` | Notifications : liste, marquer lue, tout marquer lu |
| `frontend/app/trip-plans/page.tsx` | Liste des plans |
| `frontend/app/trip-plans/new/page.tsx` | Creation plan |
| `frontend/app/trip-plans/[id]/page.tsx` | Detail + items + reservation groupee |

### Fichiers modifies (backend)

| Fichier | Modifications |
|---------|---------------|
| `backend/src/app.module.ts` | +imports BookingModule, CircuitModule, NotificationModule, TripPlanModule |
| `backend/src/offer/entities/offer.entity.ts` | +category_id, address, latitude, longitude, confirmation_mode |
| `backend/src/offer/entities/offer-item.entity.ts` | +bed_count, nights, tent_capacity, room_type |
| `backend/src/offer/offer.service.ts` | +updatePrice, updateSession, removePrice, removeSession, PATCH returns JSON |
| `backend/src/offer/offer.controller.ts` | +PATCH/DELETE endpoints prices, sessions |
| `backend/src/circuit/entities/circuit.entity.ts` | +images (simple-array) |
| `backend/src/circuit/dto/create-circuit.dto.ts` | +images field |
| `backend/src/circuit/circuit.service.ts` | +images handling, findAll(status?) |
| `backend/src/eco-traveler/eco-traveler.service.ts` | Imports Booking + CircuitReservation, counts reelles |
| `backend/src/eco-traveler/eco-traveler.module.ts` | +Booking, CircuitReservation imports |

### Fichiers crees (backend)

| Fichier | Description |
|---------|-------------|
| `backend/src/booking/` | Module complet (entite, service, controller, DTO) |
| `backend/src/circuit/` | Module complet (6 entites, service, controller, DTOs) |
| `backend/src/notification/` | Module complet |
| `backend/src/trip-plan/` | Module complet (2 entites, 4 DTOs, service, controller) |

### Fichiers crees (frontend)

| Fichier | Description |
|---------|-------------|
| `frontend/components/GuidedOfferWizard.tsx` | Wizard 4 etapes + edit mode + image URL manager |
| `frontend/components/map/CircuitMap.tsx` | Carte Leaflet pour circuits |
| `frontend/components/map/CircuitMapInner.tsx` | Inner map component |
| `frontend/components/map/TripMap.tsx` | Carte Leaflet pour trip plans |
| `frontend/components/map/TripMapInner.tsx` | Inner map component |
| `frontend/components/home/DestinationsSection.tsx` | Real circuits from API |
| `frontend/components/home/FeaturedExperiences.tsx` | Real offers from API |
| `frontend/components/home/CircuitsSection.tsx` | Circuits on homepage |
| `frontend/lib/offer-config.ts` | PROJECT_TYPES, OFFER_CATEGORIES, CATEGORY_FORM_FIELDS |

---

## 11. Bug fixes

| Bug | Correction |
|-----|------------|
| **Onboarding redirect loop** | `traveler_id` corrige en `traveler: { id }` dans eco-traveler.service.ts |
| **Reservation page loading** | `setLoading(false)` maintenant appele sur le chemin de succes |
| **Offer detail Reserver button** | Bouton toujours affiche pour les eco-voyageurs |
| **Circuit modal scroll** | Tous les modals ont `max-h-[90vh] overflow-y-auto` |
| **Circuit edit map position** | MapPicker deplace avant le bouton sauvegarder |
| **Messagerie useSearchParams** | Wrappe dans un `<Suspense>` boundary |
| **apiFetch 204 handling** | Retourne null pour les reponses 204/vide |
| **Double reservation prevention** | Offres et circuits verifient les reservations non-annulees |
| **Provider notifications** | Notifie l'auteur lors d'une reservation |
| **Capacity check** | Verifie `remaining_capacity` sur les sessions |
| **Circuit capacity verification** | Verifie `max_participants` avant reservation |
| **Transaction for TripPlan.book()** | Utilise QueryRunner avec startTransaction/commit/rollback |
| **Input validation login/register** | Email regex, password strength, erreurs inline |
| **Reservation modification** | PATCH/DELETE sur les reservations pending |
| **Notification badge** | Compteur reel sur l'icone |
| **Circuit confirmation_mode** | reserve() utilise `circuit.confirmation_mode` |
| **GPS fields** | Circuit et CircuitDay ont lat, lng, address |
| **Accommodation fields** | offer_items a bed_count, nights, tent_capacity, room_type |

---

## 12. Resume PR pour Maram

### Ce qu'il faut faire pour merger :

1. Copier les fichiers modifies/crees (voir §10)
2. Lancer le backend : `cd backend && npm install && npm run start:dev`
3. Seeder les categories : `npm run seed:offer-categories`
4. Verifier : `curl http://localhost:3001/api/offers`
5. Lancer le frontend : `cd frontend && npm install && npm run dev`
