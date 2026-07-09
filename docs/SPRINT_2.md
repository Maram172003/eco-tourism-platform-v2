# Sprint 2 — Documentation

## Vue d'ensemble

Le Sprint 2 enrichit la **carte interactive** et l'**intelligence cartographique** de la plateforme : polylines, layer toggles, légende, popups cliquables, et persistance des coordonnées GPS sur les items du TripPlan.

---

## 2.1 – 2.4 : Carte interactive enrichie (Explore + MapView)

### 2.1 Polylines des circuits

**Où** : Tous les composants Leaflet (MapView, CircuitMap)

**Concept** : Les circuits ont une colonne `waypoints` (JSON string) contenant un tableau de coordonnées `[[lat,lng],...]`. Ces waypoints sont parsés et dessinés sous forme de polylignes (itinéraire) vertes en traitillé sur la carte.

```
Circuit.waypoints = '[[36.8065,10.1815],[36.8997,10.1898],[36.9143,10.3014]]'
                                     │
                                     ▼
Polylines = [[36.8065,10.1815], [36.8997,10.1898], [36.9143,10.3014]]
                                     │
                                     ▼
Dessiné sur la carte : ligne verte traitillée (#13ec49, dashArray "8 6")
```

**Modifications** :

| Fichier | Changement |
|---------|-----------|
| `components/map/MapView.tsx` | Nouveau prop `polylines?: [number, number][][]`, rendu avec `<Polyline>` |
| `components/map/CircuitMap.tsx` | Parsing des waypoints, polylines en traitillé vert |

### 2.2 Layer toggle (Offres / Circuits)

**Où** : Page Explore (`app/explore/page.tsx`)

**Concept** : Deux boutons dans l'en-tête pour afficher/masquer indépendamment les marqueurs d'offres et de circuits sur la carte.

**État** :
```
showOffers: boolean (default: true)
showCircuits: boolean (default: true)
```

**Comportement** :
- Les marqueurs sont filtrés avant d'être passés à `<MapView>`
- Les polylines sont également filtrées selon `showCircuits`
- Le layerVisibility est passé à MapView pour le filtrage côté carte aussi

**UI** :
```
[👁 Offres] [👁 Circuits]
  ✓ Visible           ✓ Visible
  ↓ clic              ↓ clic
  [👁 Offres]        [👁‍🗨 Circuits]
  ✗ Masqué           ✓ Visible
```

### 2.3 Légende interactive

**Où** : `components/map/MapView.tsx` — composant `<MapLegend>`

**Concept** : Une légende flottante (glassmorphism, fond blanc/translucide) en bas à gauche de la carte expliquant la signification des différents marqueurs et lignes.

```
┌──────────────────────┐
│  Légende             │
│                      │
│  ● Offres            │  ← pastille blanche bordée
│  ⚡ Circuits         │  ← pastille violette avec éclair
│  --- Itinéraire      │  ← ligne verte traitillée
│                      │
└──────────────────────┘
```

### 2.4 Liens "Voir détails" dans les popups

**Où** : `components/map/MapView.tsx` — popup des marqueurs

**Avant** : Les popups affichaient uniquement le label (nom du circuit/de l'offre).

**Après** : Chaque popup affiche :
- Le nom (label)
- Un lien "Voir détails →" pointant vers `/offers/[id]` ou `/circuits/[id]`

Le type `MarkerData` est enrichi avec un champ `id?: string` pour permettre la redirection.

---

## 2.5 Persistance des coordonnées MapPicker sur TripPlanItem

### Problème

Le MapPicker dans l'AddItemModal du TripPlan permettait à l'utilisateur de choisir une position GPS (lat/lng) pour chaque activité, mais ces coordonnées **n'étaient jamais sauvegardées** — elles n'étaient ni envoyées à l'API ni persistées en base.

### Flux corrigé

```
AddItemModal (TripPlan)
       │
       ├── L'utilisateur pick une position sur la carte
       │   → mapLat / mapLng mis à jour (state React)
       │
       ├── L'utilisateur clique "Ajouter"
       │   → POST /trip-plans/:planId/items
       │     Body: { offer_item_id, day_number, lat, lng, notes }
       │
       ▼
Backend : TripPlanService.addItem()
       │   → Crée TripPlanItem avec lat/lng
       │
       ▼
Base de données : trip_plan_items
       ├── lat: decimal(10,7)
       └── lng: decimal(10,7)
```

### Modifications backend

| Fichier | Changement |
|---------|-----------|
| `entities/trip-plan-item.entity.ts` | Ajout des colonnes `lat` et `lng` (decimal(10,7), nullable) |
| `dto/add-trip-plan-item.dto.ts` | Ajout des champs optionnels `lat` et `lng` (number) |
| `dto/add-trip-plan-item.dto.ts` | Ajout des champs optionnels `lat` et `lng` dans `UpdateTripPlanItemDto` |
| `trip-plan.service.ts` | Inclusion de `lat` et `lng` dans `addItem()` |

### Modifications frontend

| Fichier | Changement |
|---------|-----------|
| `trip-plans/[id]/page.tsx` | `handleAddItem()` envoie `mapLat` et `mapLng` dans le body du POST |

---

## 3. Fichiers modifiés

### Backend

| Fichier | Changements |
|---------|-------------|
| `entities/trip-plan-item.entity.ts` | Nouvelles colonnes `lat`, `lng` |
| `dto/add-trip-plan-item.dto.ts` | Nouveaux champs `lat`, `lng` dans les deux DTOs |
| `trip-plan.service.ts` | Inclusion de `lat`/`lng` dans `addItem()` |

### Frontend

| Fichier | Changements |
|---------|-------------|
| `components/map/MapView.tsx` | Polylines, popup links, légende, layerVisibility |
| `app/explore/page.tsx` | Layer toggles (offers/circuits), parsing waypoints en polylines |
| `app/trip-plans/[id]/page.tsx` | Envoi de `lat`/`lng` dans `handleAddItem()` |

---

## 4. Évolution du type MarkerData

```typescript
// Avant
interface MarkerData {
  lat: number;
  lng: number;
  label: string;
  type: "offer" | "circuit";
}

// Après
interface MarkerData {
  lat: number;
  lng: number;
  label: string;
  type: "offer" | "circuit";
  id?: string;  // ← nouveau : pour le lien "Voir détails"
}
```

---

## 5. Schéma relationnel mis à jour

```
trip_plans
  └── trip_plan_items
        ├── offer_item_id (FK → offer_items)
        ├── circuit_id (FK → circuits)
        ├── day_number
        ├── sort_order
        ├── lat (decimal(10,7))  ← nouveau
        ├── lng (decimal(10,7))  ← nouveau
        └── notes
```

---

# Sprint 3 — Documentation

## Vue d'ensemble

Le Sprint 3 finalise le cœur métier : budget visible, prix total dans la réservation, statut TripPlan automatique, calcul de distance Haversine, et amélioration de l'auto-assignation des jours.

---

## 3.1 Budget résumé — Page détail Circuit

**Où** : `frontend/app/circuits/[id]/page.tsx` (ligne ~796)

**Avant** : Le prix de base et les options étaient affichés mais sans section "budget" consolidée visible sur la page.

**Après** : Une nouvelle section **"Budget estimé"** apparaît entre les options et le bouton "Ajouter au panier" :

```
┌─────────────────────────────────────┐
│  Budget estimé                      │
│                                     │
│  Prix de base          1 200 TND    │
│  Hébergement premium   +300 TND     │  ← si sélectionné
│  ─────────────────────────────────  │
│  Total                 1 500 TND    │
└─────────────────────────────────────┘
```

**Détails** :
- Le prix de base est toujours affiché
- Les options sélectionnées (cases cochées) s'ajoutent dynamiquement
- Le total est calculé en temps réel avec `reduce()`
- La devise est celle du circuit

---

## 3.2 Prix total — BookModal TripPlan

**Où** : `frontend/app/trip-plans/[id]/page.tsx` — composant `BookModal` (ligne ~889)

**Avant** : Le BookModal affichait uniquement le formulaire participants + demandes spéciales, sans aucune information de prix.

**Après** : Une nouvelle section **"Récapitulatif des prix"** s'affiche entre les participants et les demandes spéciales :

```
┌──────────────────────────────────────┐
│  RÉCAPITULATIF DES PRIX              │
│                                      │
│  Kayak Djerba        450 TND         │
│  Nuit Matmata        200 TND         │
│  Randonnée Ichkeul   120 TND         │
│  ─────────────────────────────────── │
│  Total estimé         770 TND        │
└──────────────────────────────────────┘
```

**Logique de calcul** :
- Pour les **circuits** : `base_price × nombre_participants`
- Pour les **offres** : `defaultPrice.price × nombre_participants` (ou `unitPrice` si forfait fixe)
- La devise est détectée automatiquement (`planCurrency`) depuis le premier item
- **Mise à jour en temps réel** : le total change quand l'utilisateur ajoute des participants

**Interface `OfferItemPrice` enrichie** : ajout du champ `pricing_unit?: string`

---

## 3.3 Statut TripPlan → confirmed après réservation

**Où** : `backend/src/trip-plan/trip-plan.service.ts` — méthode `book()` (ligne ~300)

**Avant** : Après la réservation de tous les items d'un TripPlan, le statut du plan restait `'planning'` (ou `'draft'`).

**Après** : Ajout de 2 lignes dans la transaction, avant le `commitTransaction()` :

```typescript
fullPlan.status = 'confirmed';
await queryRunner.manager.save(fullPlan);
```

**Valeurs de statut possibles** :
| Statut | Signification |
|--------|-------------|
| `draft` | Brouillon (conversion Cart→TripPlan si items avec confirmation manuelle) |
| `planning` | En planification (conversion Cart→TripPlan si tout auto) |
| `confirmed` | **Confirmé** (après réservation réussie) |
| `completed` | Terminé |
| `cancelled` | Annulé |

**Labels affichés** (frontend) :
```typescript
const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  planning: "En planification",
  confirmed: "Confirmé",
  completed: "Terminé",
  cancelled: "Annulé",
};
```

---

## 3.4 Calcul de distance Haversine

**Où** : `frontend/lib/distance.ts` (nouveau fichier)

**Utilitaires créés** :

```typescript
// Distance entre 2 points GPS (en km)
haversineDistance(lat1, lng1, lat2, lng2): number

// Distance totale d'un polyline (tableau de waypoints)
totalPolylineDistance(waypoints): number
```

**Formule** :
```
R = 6371 km (rayon terrestre)
dLat = (lat2 - lat1) × π / 180
dLng = (lng2 - lng1) × π / 180
a = sin²(dLat/2) + cos(lat1) × cos(lat2) × sin²(dLng/2)
c = 2 × atan2(√a, √(1-a))
distance = R × c
```

**Utilité** : Mesurer la distance entre le point de rendez-vous et le lieu d'une activité, estimer la longueur d'un circuit, trier les résultats par proximité.

---

## 3.5 Auto-assign day_number — Conversion Cart → TripPlan

**État** : Déjà fonctionnel depuis Sprint 1.4 (travel-cart.service.ts — `convertToTripPlan()`).

**Logique existante** (inchangée) :

```
1. cart.start_date existe ?
   ├── OUI → item a session.date ou circuit.start_date ?
   │        ├── OUI → dayNumber = 1 + (itemDate - planStartDate) en jours
   │        └── NON → dayNumber = null (non assigné)
   └── NON → dayNumber = null (non assigné)
```

**Amélioration du AddItemModal** (frontend, déjà en place) : Suggère automatiquement `day_number = max(jours existants) + 1` quand l'utilisateur ajoute un item à un TripPlan existant.

---

## 6. Fichiers modifiés (Sprint 3)

### Backend

| Fichier | Changements |
|---------|-------------|
| `trip-plan/trip-plan.service.ts` | `fullPlan.status = 'confirmed'` après `book()` |

### Frontend

| Fichier | Changements |
|---------|-------------|
| `app/circuits/[id]/page.tsx` | Nouvelle section "Budget estimé" entre options et bouton panier |
| `app/trip-plans/[id]/page.tsx` | Ajout du champ `pricing_unit` dans `OfferItemPrice` ; section "Récapitulatif des prix" dans BookModal |
| `lib/distance.ts` | Nouveau fichier : `haversineDistance()`, `totalPolylineDistance()` |

---

# Sprint 4 — Documentation

## Vue d'ensemble

Le Sprint 4 enrichit le système de **Lieux** (Publication type='place') avec catégories, tags, popularité, et introduit une **entité Photo centralisée** avec scoring, vote, et hero. La heatmap est enrichie avec les données d'engagement (likes, commentaires, contributions).

---

## 4.1 Enrichissement de Publication (Place)

**Où** : `backend/src/publication/entities/publication.entity.ts`

### Nouveaux champs

| Champ | Type | Description | Exemple |
|-------|------|-------------|---------|
| `category` | varchar, nullable | Catégorie du lieu | `"restaurant"`, `"monument"`, `"nature"`, `"plage"`, `"musée"`, `"artisanat"`, `"aventure"`, `"hébergement"` |
| `tags` | simple-array, nullable | Tags libres | `["vue panoramique", "familial", "gratuit"]` |
| `popularity_score` | int, default: 0 | Score calculé automatiquement | 42 |

### DTO mis à jour

Les DTOs `CreatePublicationDto` et `UpdatePublicationDto` incluent maintenant les champs optionnels `category` et `tags`.

### Flux de création

```typescript
// POST /publications
{
  type: "place",
  title: "Plage de Sidi Bou Saïd",
  category: "plage",
  tags: ["vue panoramique", "coucher de soleil", "famille"],
  latitude: 36.8686,
  longitude: 10.3420,
  region: "Tunis"
}
```

---

## 4.2 Entité Photo centralisée

**Où** : `backend/src/photo/` (nouveau module complet)

### Entité

```typescript
@Entity('photos')
class Photo {
  id: string;            // UUID
  url: string;           // URL Cloudinary
  entity_type: string;   // 'publication' | 'offer' | 'circuit' | 'profile'
  entity_id: string;     // UUID de l'entité liée
  is_hero: boolean;      // Photo principale
  score: number;         // Score (upvotes - downvotes)
  uploaded_by: string;   // UUID de l'utilisateur
  created_at: Date;
}
```

### Endpoints

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/photos` | Bearer | Créer une entrée photo |
| `GET` | `/photos?entity_type=&entity_id=` | Public | Lister les photos d'une entité |
| `GET` | `/photos/hero?entity_type=&entity_id=` | Public | Récupérer la photo hero |
| `POST` | `/photos/:id/hero` | Bearer | Définir comme photo principale |
| `POST` | `/photos/:id/upvote` | Bearer | Upvoter (+1 score) |
| `POST` | `/photos/:id/downvote` | Bearer | Downvoter (-1 score) |
| `DELETE` | `/photos/:id` | Bearer | Supprimer une photo |

### Logique hero

Quand une photo est marquée `is_hero: true`, toutes les autres photos de la même entité sont automatiquement dé-héroïsées.

### Évolution vers un système unifié

```
Publication.images (simple-array) ──→ Photos (table dédiée)
  [url1, url2, url3]                   ├── url1 (is_hero=true, score=5)
                                       ├── url2 (is_hero=false, score=3)
                                       └── url3 (is_hero=false, score=1)
```

---

## 4.3 Heatmap enrichie

**Où** : `frontend/components/map/HeatmapLayer.tsx` + `backend/src/publication/publication.service.ts`

### Avant

La heatmap utilisait uniquement `/offers/popular-locations` avec un poids basé sur le nombre de prix des offres.

### Après

La heatmap combine **deux sources** :

```
HeatmapLayer
  ├── /offers/popular-locations (offres existantes)
  │
  └── /publications/heatmap (nouveau)
        ├── lat / lng du lieu
        ├── weight = likes + comments*2 + contributions*3
        ├── likes, comments, contributions (metadata)
        └── popularity_score
```

### Endpoint heatmap

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/publications/heatmap` | Retourne tous les lieux approuvés avec leurs métriques d'engagement |

**Données retournées** :
```json
[{
  "id": "uuid",
  "title": "Plage de Sidi Bou Saïd",
  "lat": 36.8686,
  "lng": 10.3420,
  "weight": 15,
  "likes": 5,
  "comments": 3,
  "contributions": 1,
  "popularity_score": 14
}]
```

### Calcul du poids heatmap

```typescript
// Pour les offres : min(1 + priceCount * 0.3, 3)
// Pour les lieux : min(likes * 0.3 + comments * 0.5 + contributions * 0.7, 1)
```

Le gradient de couleurs reste inchangé (vert → jaune → orange → rouge).

---

## 4.4 Popularité score + classements

### Calcul du score

**Où** : `PublicationService.recalculatePopularity(pubId)`

```typescript
score = likes + comments * 2 + contributions * 3
```

Déclenché automatiquement sur :
- `toggleLike()` → like ajouté/supprimé
- `addComment()` → commentaire ajouté
- `PlaceContributionService.create()` → contribution ajoutée
- `PlaceContributionService.toggleVote()` → vote changé
- `PlaceContributionService.remove()` → contribution supprimée

### Endpoints de classement

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/publications/places` | Tous les lieux approuvés (paginated) |
| `GET` | `/publications/places/trending` | Top lieux par popularité |
| `GET` | `/publications/places/category/:category` | Lieux filtrés par catégorie |

**Exemple** :
```
GET /publications/places/trending?limit=10
→ Top 10 lieux les plus populaires (popularité_score DESC)
```

```
GET /publications/places/category/plage?limit=5
→ Top 5 plages les plus populaires
```

---

## 5. Fichiers modifiés / créés (Sprint 4)

### Backend — Nouveaux fichiers

| Fichier | Description |
|---------|-------------|
| `src/photo/photo.module.ts` | Module Photo |
| `src/photo/photo.controller.ts` | Contrôleur Photo (7 endpoints) |
| `src/photo/photo.service.ts` | Service Photo (CRUD, votes, hero) |
| `src/photo/entities/photo.entity.ts` | Entité Photo |
| `src/photo/dto/photo.dto.ts` | DTOs Photo |

### Backend — Fichiers modifiés

| Fichier | Changements |
|---------|-------------|
| `publication/entities/publication.entity.ts` | Ajout `category`, `tags`, `popularity_score` |
| `publication/dto/publication.dto.ts` | Ajout `category`, `tags` |
| `publication/publication.service.ts` | `recalculatePopularity()`, `findTrending()`, `findByCategory()`, `findAllPlaces()`, `getHeatmapData()` ; injection `PlaceContribution` repo |
| `publication/publication.controller.ts` | Routes `/places`, `/places/trending`, `/places/category/:category`, `/heatmap` |
| `publication/publication.module.ts` | Import `PlaceContribution` |
| `place-contribution/place-contribution.service.ts` | Injection `PublicationService`, appel à `recalculatePopularity()` après create/vote/remove |
| `place-contribution/place-contribution.module.ts` | Import `PublicationModule` |
| `app.module.ts` | Import `PhotoModule` |

### Frontend

| Fichier | Changements |
|---------|-------------|
| `components/map/HeatmapLayer.tsx` | Double source : offres + lieux avec engagement data |

---

## 6. Schéma relationnel (Sprint 4)

```
publications
  ├── type: 'place' | 'experience'
  ├── category: varchar (nullable)       ← nouveau
  ├── tags: simple-array (nullable)       ← nouveau
  ├── popularity_score: int (default 0)   ← nouveau
  └── ... (existing fields)

photos
  ├── id: uuid
  ├── url: varchar
  ├── entity_type: varchar (publication|offer|circuit|profile)
  ├── entity_id: uuid
  ├── is_hero: boolean
  ├── score: int
  ├── uploaded_by: uuid (FK → users)
  └── created_at: timestamp
```
