# Analyse Comparative — Frontend Circuit & Recherche d'Hébergement Externe

**Date :** 2026-07-04
**Projets comparés :**
- **Projet principal :** `/home/himawari/workSpace/tourisme` (le tien)
- **Projet Maram v2 :** `/home/himawari/workSpace/eco-tourism-platform-v2` (référence circuit)

---

## 1. Comparaison des deux projets

### 1.1 Backend — Module `circuit`

| Aspect | **Ton projet (`tourisme`)** | **Maram v2** |
|---|---|---|
| **Entité Circuit** | `circuit.entity.ts` (3.0K) — riche : `author_id`, `author_type` polymorphe, `project_id`, `region`, `lat`, `lng`, `address`, `difficulty_level`, `waypoints`, `cover_image`, `images[]`, `start_date`, `end_date`, `duration_days`, `duration_nights`, `base_price`, `max_participants`, `confirmation_mode`, `status` | `circuit.entity.ts` (820B) — minimaliste : `provider_id`, `title`, `description`, `nb_jours`, `cover_image`, **`etapes` (jsonb)**, **`hebergement` (jsonb)**, **`availability` (jsonb)** |
| **Entités liées** | 5 entités : `Circuit`, `CircuitDay`, `CircuitProgramItem`, `CircuitOption`, `CircuitReservation`, `CircuitReservationOption` | 1 entité : `Circuit` (tout en jsonb) |
| **Jours du circuit** | Table `circuit_days` avec `day_number`, `date`, `title`, `lat`, `lng`, `location_name` | Stocké dans `etapes` jsonb |
| **Activités (program items)** | Table `circuit_program_items` avec FK vers `linked_offer_item_id`, `linked_location_id`, `guide_id`, `guide_name`, `emoji`, `duration_minutes`, `distance_km`, `transport_mode`, `is_included`, `is_required` | Stocké dans `etapes` jsonb |
| **Recherche de guides** | `GET /api/guide/search?q=&date=&lat=&lng=` — service dédié `GuideSearchService` | Aucun service de recherche de guides |
| **Recherche d'offres externes** | `GET /api/offers/public?category=&exclude_author=&region=` (existe mais limité) | Aucun |

**Verdict :** Ton backend est **considérablement plus avancé** que celui de Maram. La structure relationnelle (jour/activité séparés) est la bonne approche ; elle permet des requêtes SQL propres, des jointures, des index et une évolutivité bien meilleure que du jsonb.

### 1.2 Frontend — Composants Circuit

| Composant | **Ton projet** | **Maram v2** |
|---|---|---|
| **Wizard de création** | `CircuitBuilderWizard.tsx` (6 étapes : Général, Jours, Activités, Itinéraire, Tarifs & Options, Aperçu) — riche, multi-step, avec recherche guides intégrée | Aucun wizard dédié |
| **Carte circuit** | `CircuitMap.tsx` + `CircuitMapInner.tsx` — Leaflet avec tracé GPS | `CircuitRouteMap.tsx` — Leaflet avec markers numérotés + polyline + hébergement séparé |
| **Page liste circuits** | **MANQUANTE** (`/circuits` n'existe pas — le navbar pointe vers une 404) | `/destinations` affiche "circuits" comme catégorie d'offres |
| **Page détail circuit** | **MANQUANTE** (`/circuits/[id]` n'existe pas) | `/offers/[id]` affiche les détails (un circuit est juste un offer) |
| **Timeline style Polarsteps** | Prévue (TimelineView) mais à intégrer dans le détail | Pas de timeline |
| **Recherche guide inline** | `GuideSearchInline` (déjà implémenté avec date + lat/lng) | Aucun |
| **Recherche offre inline** | `OfferItemSearchInline` mais **limité aux items du circuit lui-même** | Aucun |
| **Section "Mes circuits" guide dashboard** | Existe (mais circuits s'affichent via API) | Section "Spécialités & Circuits" mais purement informationnelle |

**Verdict frontend :** Ton projet a un **wizard de création puissant** mais **il manque la partie consommation** (pages publiques `/circuits` et `/circuits/[id]`). Le composant carte est basique comparé à celui de Maram qui a un design visuel plus soigné.

---

## 2. Ce qui est déjà implémenté dans ton projet pour ton cas d'usage

Bonne nouvelle : **les fondations existent**. Il ne manque que la brique de recherche d'offres tierces géolocalisée.

### 2.1 Recherche de guides ✅ DÉJÀ FAIT

- Backend : `GET /api/guide/search?q=&date=&lat=&lng=` (paramètres tous supportés)
- Frontend : `GuideSearchInline` dans le wizard de circuit, accepte `dayDate`, `dayLat`, `dayLng`, `dayLocation`
- Workflow : dans l'étape « Activités » du wizard, l'auteur du circuit peut chercher un guide disponible à la date et au lieu du jour → associer `guide_id` au `CircuitProgramItem`

**Tu n'as rien à coder ici** — c'est opérationnel.

### 2.2 Liaison à une offre (hébergement, restaurant) du même auteur ✅ DÉJÀ FAIT

- Backend : `CircuitProgramItem.linked_offer_item_id` accepte n'importe quel UUID d'`OfferItem`
- Frontend : `OfferItemSearchInline` permet de chercher parmi les items du wizard

**Workflow :** dans l'étape « Activités », tu lies une activité à un de tes `OfferItem` (hébergement/restauration).

### 2.3 Liaison à une offre d'UN AUTRE project-owner ⚠️ PARTIELLEMENT PRÉPARÉ

- Backend : `GET /api/offers/public?category=&exclude_author=&region=` existe, **explicitement commenté pour « services externes circuits »**
- **MAIS** : pas de filtre par géolocalisation (`lat`/`lng`/`radius`)
- **MAIS** : le frontend `OfferItemSearchInline` ne consomme pas cet endpoint — il filtre uniquement dans la liste d'items passée en props (donc uniquement les items de l'auteur du circuit)

**C'est précisément le point qui te bloque.** Il faut :

1. Enrichir `/api/offers/public` avec paramètres `lat`, `lng`, `radius_km`, `item_type`
2. Créer un composant `ExternalOfferItemSearch` qui consomme cet endpoint
3. L'afficher dans le wizard à côté de l'`OfferItemSearchInline` actuel

---

## 3. Réponse à ta question : « si aucun project-owner n'a d'hébergement ici, est-ce que je crée une activité indépendante type hôtel externe ? »

### 3.1 Réponse courte

**Non.** Ne crée pas de type « activité externe » ou « hôtel externe » indépendant. Voici pourquoi et quoi faire.

### 3.2 Pourquoi pas une entité séparée

| Problème | Impact concret |
|---|---|
| Duplication du modèle | Tu aurais deux représentations d'une chambre : `OfferItem` (interne, réservable) vs `HôtelExterne` (juste informatif). Tout le code de réservation/calendrier/prix devrait être dupliqué. |
| Pas de réservation atomique | Comment savoir s'il reste de la place dans l'hôtel externe ? Comment bloquer la chambre le temps de la transaction ? |
| Pas de revenus plateforme | Une activité externe contourne le système de réservation et de paiement. |
| Pas de garantie qualité | Pas de `sustainability_score`, pas d'avis, pas de modération. |
| Incohérence avec la donnée | Tu perds le lien entre la chambre et son fournisseur (avis, contact, fiabilité). |

### 3.3 La bonne architecture : trois niveaux de résolution

```
CRÉATION D'UNE ACTIVITÉ D'UN JOUR DE CIRCUIT (ex : nuit du Jour 2 à Tataouine)
                                  │
                                  ▼
                ┌─────────────────────────────────────┐
                │  ÉTAPE 1 — L'auteur du circuit a-t-│
                │  il une offre d'hébergement ici ?   │
                └──────────────┬──────────────────────┘
                               │
                  ┌────────────┴────────────┐
                  ▼                         ▼
                OUI                       NON
                  │                         │
                  ▼                         ▼
        linked_offer_item_id        ÉTAPE 2 — Recherche d'offres
        (sa propre chambre)         d'hébergement TIERS dans la
                                    région (rayon X km)
                                              │
                                ┌─────────────┴─────────────┐
                                ▼                           ▼
                            TROUVÉ                      RIEN
                                │                           │
                                ▼                           ▼
                      linked_offer_item_id        ÉTAPE 3 — Référence
                      (chambre d'un autre         externe (fallback)
                       owner de la plateforme)        │
                                                    ▼
                                          Champ `external_reference`
                                          (nom, tél, adresse, prix,
                                           notes — sans réservation)
```

### 3.4 Implémentation recommandée (par priorité)

#### Priorité 1 — Étape 2 : recherche d'offres tierces géolocalisée

**Backend** : enrichir `/api/offers/public` :

```typescript
// backend/src/offer/offer.controller.ts
@Public()
@Get('public')
async findPublic(
  @Query('category') category?: string,
  @Query('exclude_author') excludeAuthor?: string,
  @Query('region') region?: string,
  @Query('lat') lat?: string,        // ← AJOUT
  @Query('lng') lng?: string,        // ← AJOUT
  @Query('radius_km') radiusKm?: string,  // ← AJOUT
  @Query('item_type') itemType?: string,  // ← AJOUT (room, bed, dish...)
) {
  return this.service.findPublic(category, excludeAuthor, region, {
    lat: lat ? Number(lat) : undefined,
    lng: lng ? Number(lng) : undefined,
    radiusKm: radiusKm ? Number(radiusKm) : undefined,
    itemType,
  });
}
```

Et dans `OfferService.findPublic`, ajouter un `QueryBuilder` avec jointure sur `offer_items` :

```typescript
const qb = this.offerRepo
  .createQueryBuilder('offer')
  .leftJoinAndSelect('offer.items', 'item')
  .where('offer.status = :status', { status: 'approved' });

if (excludeAuthor) qb.andWhere('offer.author_id != :ex', { ex: excludeAuthor });
if (region) qb.andWhere('offer.region = :region', { region });
if (itemType) qb.andWhere('item.item_type = :it', { it: itemType });

if (lat && lng && radiusKm) {
  qb.andWhere(`ST_DWithin(
    ST_MakePoint(offer.longitude, offer.latitude)::geography,
    ST_MakePoint(:lng, :lat)::geography,
    :radius
  )`, { lng, lat, radius: radiusKm * 1000 });
}
```

⚠️ Pour activer `ST_DWithin`, installer PostGIS :

```bash
# docker-compose.yml — ajouter au service postgres
image: postgis/postgis:15-3.4
```

```sql
-- Migration initiale
CREATE EXTENSION IF NOT EXISTS postgis;
ALTER TABLE offers ADD COLUMN location geography(Point, 4326);
UPDATE offers SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography;
CREATE INDEX idx_offers_location ON offers USING GIST (location);
```

**Frontend** : nouveau composant `ExternalOfferItemSearch.tsx` :

```tsx
// frontend/components/ExternalOfferItemSearch.tsx
"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

type Props = {
  lat: number | null;
  lng: number | null;
  itemType?: "room" | "bed" | "dish" | "menu" | "activity";
  excludeAuthorId: string;
  onSelect: (offerItemId: string, label: string) => void;
};

export default function ExternalOfferItemSearch({ lat, lng, itemType = "room", excludeAuthorId, onSelect }: Props) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lat == null || lng == null) return;
    setLoading(true);
    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      radius_km: "30",
      item_type: itemType,
      exclude_author: excludeAuthorId,
    });
    apiFetch<any[]>(`/offers/public?${params}`)
      .then(setResults)
      .finally(() => setLoading(false));
  }, [lat, lng, itemType, excludeAuthorId]);

  if (lat == null || lng == null) {
    return <p className="text-xs text-slate-400">Définis la position du jour pour chercher un hébergement à proximité.</p>;
  }
  if (loading) return <p className="text-xs text-slate-400">Recherche d'hébergements à proximité…</p>;
  if (results.length === 0) {
    return <p className="text-xs text-amber-600">Aucun hébergement trouvé dans un rayon de 30 km. Tu peux ajouter une référence externe ci-dessous.</p>;
  }
  return (
    <ul className="space-y-2">
      {results.map((item) => (
        <li key={item.id} className="border rounded-xl p-3 hover:bg-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-slate-500">{item.offer_title}</p>
            </div>
            <button onClick={() => onSelect(item.id, item.name)} className="text-xs font-bold text-primary">Lier</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
```

#### Priorité 2 — Étape 3 : référence externe (fallback)

Ajouter 2 colonnes à `circuit_program_items` :

```typescript
@Column({ type: 'jsonb', nullable: true })
external_reference!: {
  name?: string;
  phone?: string;
  address?: string;
  url?: string;
  estimated_price?: number;
  currency?: string;
  notes?: string;
} | null;

@Column({ type: 'boolean', default: false })
is_external_reference!: boolean;
```

Et exposer via le DTO `CreateCircuitProgramItemDto`. Côté frontend, dans l'étape « Activités » du wizard, ajouter un petit formulaire « Référence externe » qui s'affiche si la recherche prioritaire 1+2 n'a rien donné.

#### Priorité 3 — Inviter les hôteliers à s'inscrire (moyen terme)

Bouton dans le wizard « Inviter cet hébergeur à rejoindre la plateforme » qui envoie un email d'invitation partenaire avec lien d'onboarding simplifié.

---

## 4. Récapitulatif : ce qui est amélioré vs ce qui manque

### ✅ Ce qui est bien fait (à conserver)

| Élément | Statut |
|---|---|
| Modèle `Circuit` polymorphe (guide OU project-owner) | ✅ |
| Entités `CircuitDay` + `CircuitProgramItem` séparées (vs jsonb chez Maram) | ✅ |
| Recherche de guides avec date + lat/lng | ✅ |
| Liaison `CircuitProgramItem` ↔ `OfferItem` interne | ✅ |
| Wizard 6 étapes avec recherche guides intégrée | ✅ |
| Statut `pending/approved/rejected` côté circuit | ✅ |
| `difficulty_level` enum (easy/moderate/hard/expert) | ✅ |
| Champs `emoji`, `duration_minutes`, `distance_km`, `transport_mode` | ✅ |
| Endpoint `/api/offers/public` (catégorie + exclude_author + region) | ✅ (à enrichir) |

### ❌ Ce qui manque (à corriger)

| Élément manquant | Impact | Priorité |
|---|---|---|
| Page `/circuits` (liste publique) | Navbar pointe vers une 404 | **HAUTE** |
| Page `/circuits/[id]` (détail public) | Pas de visualisation d'un circuit par un écovoyageur | **HAUTE** |
| Recherche géolocalisée d'offres (`/offers/public?lat&lng&radius_km`) | Impossible de trouver un hébergement tiers dans la région du jour | **HAUTE** |
| Composant `ExternalOfferItemSearch` | Le wizard ne propose pas la recherche d'offres tierces | **HAUTE** |
| Champ `external_reference` jsonb sur `CircuitProgramItem` | Pas de fallback quand aucun owner n'est inscrit | MOYENNE |
| PostGIS activé sur PostgreSQL | Bloque la recherche géo | **HAUTE** (prérequis) |
| Carte circuit avec markers numérotés par jour (style Maram) | Le `CircuitMap` actuel est basique | BASSE |

### 💡 Améliorations visuelles à reprendre de Maram

| Élément | Source Maram | À intégrer |
|---|---|---|
| Markers numérotés par jour sur la carte | `CircuitRouteMap.tsx` ligne 14-31 | Améliorer `CircuitMapInner` |
| Marqueur hébergement distinct (🏨) non relié au tracé | `CircuitRouteMap.tsx` ligne 48 | Idem |
| Style polyline pointillée (dashArray) | `CircuitRouteMap.tsx` ligne 87 | Idem |
| Heatmap des lieux populaires (Offres + Publications) | README mentionne | Existe backend (`/api/offers/popular-locations`) — vérifier intégration frontend |

---

## 5. Plan d'action concret (par ordre d'exécution)

```
PHASE 1 — Activer la recherche géolocalisée (2-3 jours)
  ├─ Activer PostGIS dans docker-compose
  ├─ Migration : ajouter colonne geography + index GIST
  ├─ Enrichir /api/offers/public avec lat/lng/radius_km/item_type
  ├─ Créer composant ExternalOfferItemSearch.tsx
  └─ L'ajouter dans CircuitBuilderWizard, étape "Activités"

PHASE 2 — Pages publiques circuit (2-3 jours)
  ├─ Créer /app/circuits/page.tsx (liste avec carte)
  ├─ Créer /app/circuits/[id]/page.tsx (détail + itinéraire + réservation)
  ├─ Améliorer CircuitMapInner avec markers numérotés
  └─ Tester bout-en-bout (créer → voir → réserver)

PHASE 3 — Référence externe (1-2 jours)
  ├─ Ajouter colonnes external_reference + is_external_reference
  ├─ Mettre à jour DTO et service
  ├─ Formulaire fallback dans le wizard
  └─ Migration TypeORM

PHASE 4 — Polish (2-3 jours)
  ├─ Système d'invitation partenaires
  ├─ Affichage des external_reference dans le détail circuit
  ├─ Notation et avis sur hébergement tiers
  └─ Tests E2E
```

---

## 6. Résumé exécutif

| Question | Réponse |
|---|---|
| Qu'est-ce qui existe déjà ? | Tout le modèle backend circuit (relational), wizard frontend 6 étapes, recherche de guides géolocalisée, liaison à offre interne |
| Qu'est-ce qui est mieux que Maram ? | Modèle relationnel propre, recherche guides par localisation, polymorphisme auteur, wizard structuré |
| Qu'est-ce qui manque ? | Recherche d'offres tierces géolocalisée (priorité 1), pages publiques `/circuits` (priorité 1), référence externe en fallback (priorité 2) |
| Faut-il créer une entité « hôtel externe » ? | **NON.** Référencer plutôt des `OfferItem` d'autres owners de la plateforme ; en dernier recours, un simple champ JSON `external_reference` |
| Prochaine action concrète ? | Activer PostGIS + enrichir `/api/offers/public` avec lat/lng/radius_km, créer `ExternalOfferItemSearch`, l'intégrer au wizard |

**Tu n'as pas besoin d'une nouvelle entité « hôtel externe ». Le modèle actuel suffit — il faut juste (a) activer la recherche géolocalisée et (b) brancher la recherche d'offres tierces dans le wizard de circuit.**
