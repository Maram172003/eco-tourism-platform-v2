# Architecture Travel Cart — Panier de Voyage

> Système complet : Explorer → Panier → Trip Plan → Réservation

---

## 1. Vision générale

Le flux utilisateur suit 4 étapes :

```
1. Explorer (Map + Catalogue)
        ↓
2. Panier temporaire (TravelCart)
        ↓
3. Trip Plan structuré (planification dates/programme)
        ↓
4. Réservation finale (Booking)
```

---

## 2. Workflow complet

```
┌─────────────────────────────────────────────────────────┐
│                    VISITEUR / ECO-VOYAGEUR               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐      │
│  │ Explorer  │───▶│  Panier  │───▶│  Trip Plan   │      │
│  │ (Map +    │    │ (Cart)   │    │  (structuré) │      │
│  │ Catalogue)│    └──────────┘    └──────┬───────┘      │
│  └──────────┘                            │              │
│                                          ▼              │
│                                   ┌──────────────┐      │
│                                   │  Réservation  │      │
│                                   │  (Booking)    │      │
│                                   └──────────────┘      │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Tables

### 3.1 TravelCart (Panier temporaire)

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | |
| `user_id` | UUID (FK → users) | Propriétaire du panier |
| `title` | varchar | "Mon panier", "Voyage Djerba" |
| `description` | text nullable | Notes personnelles |
| `start_date` | date nullable | Date début souhaitée |
| `end_date` | date nullable | Date fin souhaitée |
| `participant_count` | int nullable | Nombre de participants |
| `estimated_total` | decimal nullable | Total auto-calculé |
| `currency` | varchar (default 'TND') | Devise |
| `status` | varchar (default 'active') | `active` \| `converted` \| `abandoned` |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

### 3.2 TravelCartItem (Éléments du panier)

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | |
| `cart_id` | UUID (FK → travel_carts) CASCADE | Panier parent |
| `offer_item_id` | UUID (FK → offer_items) nullable | OFFRE (XOR avec circuit) |
| `circuit_id` | UUID (FK → circuits) nullable | CIRCUIT (XOR avec offer) |
| `session_id` | UUID (FK → offer_item_sessions) nullable | Créneau sélectionné |
| `selected_date` | date nullable | Date choisie |
| `quantity` | int (default 1) | Nombre de personnes/unités |
| `selected_options` | json nullable | Options circuit choisies |
| `unit_price` | decimal nullable | Prix unitaire estimé |
| `line_total` | decimal nullable | Total ligne (prix × qty) |
| `notes` | text nullable | Notes utilisateur |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

## 4. API Endpoints

### Panier

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/travel-carts/me` | Récupérer ou créer le panier actif |
| `GET` | `/travel-carts/:id` | Détail du panier avec items |
| `PATCH` | `/travel-carts/:id` | Modifier le panier (dates, titre) |
| `DELETE` | `/travel-carts/:id` | Supprimer le panier |

### Éléments du panier

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/travel-carts/:id/items` | Ajouter un OfferItem ou Circuit |
| `PATCH` | `/travel-carts/:id/items/:itemId` | Modifier (qty, date, session) |
| `DELETE` | `/travel-carts/:id/items/:itemId` | Supprimer un élément |

### Conversion

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/travel-carts/:id/convert` | Convertir le panier en TripPlan |

---

## 5. Règles métier

| Concept | Règle |
|---------|-------|
| **Un seul panier actif** | Chaque utilisateur a UN panier actif à la fois |
| **XOR offer_item / circuit** | Un item du panier contient soit un OfferItem soit un Circuit |
| **Prix auto-calculé** | `line_total` = `unit_price × quantity` (calculé côté serveur) |
| **Conversion** | Le panier "converted" ne peut plus être modifié |
| **Session** | Si une session est sélectionnée, vérifie la capacité restante |

---

## 6. Frontend — Pages et composants

### Pages

| Page | Route | Description |
|------|-------|-------------|
| `ExplorePage` | `/explore` | Carte Leaflet + catalogue + bouton "Ajouter au panier" |
| `CartPage` | `/cart` | Vue complète du panier, modification, conversion |
| `TripPlanPage` | `/trip-plans/[id]` | Plan structuré post-conversion |

### Composants

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `CartWidget` | `components/CartWidget.tsx` | Bouton flottant + tiroir latéral |
| `MapView` | `components/map/MapView.tsx` | Carte Leaflet avec markers (offres + circuits) |

---

## 7. Mapping Cart → TripPlan

```
TravelCart
  ├── title ──────────────▶ TripPlan.title
  ├── description ────────▶ TripPlan.description
  ├── start_date ─────────▶ TripPlan.start_date
  ├── end_date ───────────▶ TripPlan.end_date
  └── TravelCartItems
        ├── offerItem ────▶ TripPlanItem.offerItem
        └── circuit ──────▶ TripPlanItem.circuit

TravelCart.status = "converted"
```

---

## 8. Architecture Backend

```
backend/src/
├── travel-cart/
│   ├── entities/
│   │   ├── travel-cart.entity.ts
│   │   └── travel-cart-item.entity.ts
│   ├── dto/
│   │   └── cart.dto.ts
│   ├── travel-cart.service.ts
│   ├── travel-cart.controller.ts
│   └── travel-cart.module.ts
```

---

## 9. Système de calendrier (disponibilités)

Les disponibilités des OfferItems sont gérées par 3 entités :

### OfferItemAvailabilityRules (règles récurrentes)

```
Exemples :
- Tous les samedis et dimanches (weekend_only)
- Du 15 mars au 15 juin chaque année (seasonal)
- Lun-Mer-Ven de 9h à 12h (weekly + time)
```

### OfferItemSessions (créneaux concrets)

```
Générés à partir des rules ou créés manuellement.
Chaque session = date + heure + capacité.
```

### Types de disponibilité

| Type | Description | Exemple |
|------|-------------|---------|
| `always` | Toujours disponible | Hébergement全年 |
| `weekly` | Jours spécifiques | Sam + Dim |
| `date_range` | Période définie | 15/03 → 15/06 |
| `weekend_only` | Week-ends uniquement | Sam + Dim |
| `custom` | Règle RRULE | FREQ=WEEKLY;BYDAY=SA,SU |
