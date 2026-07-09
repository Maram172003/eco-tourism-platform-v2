# AUDIT COMPLET — Système de Création d'Offres Éco-Voyage

> **Date :** 24 Juin 2026
> **Rôle :** Product Owner Senior + Architecte Logiciel + UX Designer
> **Scope :** Formulaire de création d'offres — Catalogue Provider → Offer → OfferItem → Prices/Capacity/Availability/Sessions

---

## TABLE DES MATIÈRES

1. [État des lieux](#1-état-des-lieux)
2. [Audit par champ](#2-audit-par-champ)
3. [Analyse par catégorie d'offre](#3-analyse-par-catégorie-doffre)
4. [Analyse thématique](#4-analyse-thématique)
5. [Audit UX — Formulaire actuel](#5-audit-ux--formulaire-actuel)
6. [Incohérences Backend/Frontend](#6-incohérences-backendfrontend)
7. [Champs manquants pour un vrai produit touristique](#7-champs-manquants-pour-un-vrai-produit-touristique)
8. [Résumé exécutif et priorités](#8-résumé-exécutif-et-priorités)
9. [Vision produit — Booking + Airbnb Experiences + Eventbrite + GetYourGuide](#9-vision-produit--booking--airbnb-experiences--eventbrite--getyourguide)

---

## 1. État des lieux

### Architecture actuelle

```
Offer (12 colonnes nullable sur 24)
  ├── category_id → OfferCategory (10 seedés, 8 côté frontend = MISMATCH)
  ├── offer_type (déprécié mais encore envoyé par le frontend)
  │
  └── OfferItem (9 colonnes, 5 dans details_json)
        ├── OfferItemPrice (6 champs, pricing_unit = 5 valeurs)
        ├── OfferItemCapacity (6 champs = ENTITÉ MORTE, aucun CRUD)
        ├── OfferItemAvailabilityRule (8 champs = ENTITÉ MORTE, aucun update/delete)
        └── OfferItemSession (7 champs, liés au PREMIER item uniquement)
```

### Constats critiques

| Problème | Sévérité | Impact |
|----------|----------|--------|
| `offer_type` déprécié mais frontend l'envoie encore | 🔴 Critique | Données incohérentes, `category_id` jamais rempli |
| `OfferItemCapacity` = entité morte (aucun CRUD) | 🔴 Critique | Capacité inventaire impossible à gérer |
| Sessions liées au 1er item uniquement | 🔴 Critique | Offres multi-items = sessions inutilisables |
| Categories backend ≠ frontend (10 vs 8) | 🟠 Majeur | Types d'offres incohérents entre API et UI |
| `duration` = texte libre | 🟠 Majeur | Impossible de calculer, filtrer ou trier par durée |
| `min_group_size > max_group_size` non validé | 🟠 Majeur | Données absurdes acceptées |
| `details_json` = champ libre sans schéma | 🟡 Modéré | Données incohérentes entre providers |
| Aucune auth check sur `createItem`/`addPrice` | 🔴 Critique | Tout utilisateur authentifié peut modifier n'importe quelle offre |
| Formulaire = 15 champs en une étape | 🟠 Majeur | Abandon utilisateur probable |
| `availabilityRules` = pas d'update/delete | 🟡 Modéré | Règles devenues orphelines |

---

## 2. Audit par champ

### 2.1 Offre — Champs existants

| Champ | Actuel | Utile ? | Problème | Recommandation |
|-------|--------|---------|----------|----------------|
| `title` | varchar, requis | ✅ Oui | — | Garder |
| `description` | text, nullable | ✅ Oui | — | Garder |
| `price` | decimal, nullable | ⚠️ Redondant | Auto-calculé depuis items, mais jamais calculé | **Calculer automatiquement** au save (min des prix items) |
| `duration` | varchar, nullable | ❌ Inutile | Texte libre = "2h", "1 journée", "3 jours" — aucun calcul possible | **Supprimer.** La durée est un attribut de chaque OfferItem ou calculée depuis sessions |
| `offer_type` | varchar, nullable | ❌ Mort | Déprécié, remplacé par `category_id` mais frontend l'envoie encore | **Supprimer** après migration |
| `category_id` | uuid, nullable | ✅ Oui | Jamais envoyé par frontend | **Rendre obligatoire** côté backend |
| `images` | simple-array, nullable | ✅ Oui | — | Garder, max 10 |
| `inclusions` | text, nullable | ✅ Oui | Ambigu (inclusions/exclusions mélangées) | **Renommer** ou séparer inclusions/exclusions |
| `region` | varchar, nullable | ✅ Oui | — | Garder, idéalement list déroulant des 24 régions tunisiennes |
| `address` | varchar, nullable | ✅ Oui | — | Garder |
| `latitude/longitude` | decimal, nullable | ✅ Oui | — | Garder |
| `meeting_point` | varchar, nullable | ⚠️ Conditionnel | Utile activités, inutile hébergement | **Masquer** selon catégorie |
| `meeting_lat/meeting_lng` | decimal, nullable | ⚠️ Conditionnel | Idem | **Masquer** selon catégorie |
| `min_group_size` | int, nullable | ⚠️ Conditionnel | Inutile hébergement/restauration | **Masquer** sauf activités |
| `max_group_size` | int, nullable | ⚠️ Conditionnel | Idem | **Masquer** sauf activités |
| `min_age` | int, nullable | ⚠️ Conditionnel | Rarement utilisé | **Masquer** sauf activités spec |
| `cancellation_policy` | text, nullable | ✅ Oui | Texte libre | **Masquer** — Politique par défaut + override optionnel |
| `sustainability_score` | int, nullable | ✅ Oui | Auto-calculé, pas saisie | **Rendre lecture seule** |
| `confirmation_mode` | varchar, default 'automatic' | ✅ Oui | — | Garder |
| `status` | varchar, default 'pending' | ✅ Oui | — | Garder |
| `rejection_reason` | text, nullable | ✅ Oui | — | Garder |

### 2.2 OfferItem — Champs existants

| Champ | Utile ? | Problème | Recommandation |
|-------|---------|----------|----------------|
| `name` | ✅ Oui | — | Garder |
| `description` | ✅ Oui | — | Garder |
| `item_type` | ✅ Oui | — | Garder, mais valeurs manquantes |
| `details_json` | ⚠️ Partial | Libre, aucun schéma | **Définir un schéma par item_type** |
| `requires_confirmation` | ⚠️ Redondant | Redondant avec `confirmation_mode` | **Supprimer**, garder `confirmation_mode` seul |
| `confirmation_mode` | ✅ Oui | Hérite de l'offre par défaut | Garder |
| `booking_deadline_days` | ✅ Oui | — | Garder |
| `cancellation_deadline_days` | ✅ Oui | — | Garder |
| `production_delay_days` | ⚠️ Conditionnel | Utile artisanat only | **Masquer** sauf artisanat |

### 2.3 OfferItemPrice — Champs existants

| Champ | Utile ? | Problème | Recommandation |
|-------|---------|----------|----------------|
| `label` | ✅ Oui | "Adulte", "Enfant", "Étudiant" | Garder |
| `price` | ✅ Oui | — | Garder |
| `currency` | ✅ Oui | Default TND | Garder, masquer (devise fixe) |
| `pricing_unit` | ⚠️ Partial | 5 valeurs insuffisantes | **Étendre** (voir section Prix) |
| `min_quantity` | ⚠️ Rare | Rarement utilisé | Masquer, garder en DB |
| `max_quantity` | ⚠️ Rare | Rarement utilisé | Masquer, garder en DB |
| `is_default` | ✅ Oui | — | Garder, forcer un seul default |

### 2.4 OfferItemCapacity — ENTITÉ MORTE

| Champ | Utile ? | Problème | Recommandation |
|-------|---------|----------|----------------|
| `capacity_type` | ✅ Concept | Aucun CRUD | **Créer CRUD complet** |
| `total_quantity` | ✅ Oui | — | Garder |
| `remaining_quantity` | ✅ Oui | — | Auto-calculé (total - réservations) |
| `max_persons` | ⚠️ Redondant | Redondant avec `max_group_size` offer | **Supprimer**, utiliser offre |
| `min_participants` | ⚠️ Redondant | Redondant avec `min_group_size` offer | **Supprimer**, utiliser offre |
| `max_participants` | ⚠️ Redondant | Redondant avec `max_group_size` offer | **Supprimer**, utiliser offre |

### 2.5 OfferItemAvailabilityRule — ENTITÉ MORTE

| Champ | Utile ? | Problème | Recommandation |
|-------|---------|----------|----------------|
| `availability_type` | ✅ Concept | Aucun update/delete | **Créer CRUD complet** |
| `start_date/end_date` | ✅ Oui | — | Garder |
| `weekdays` | ✅ Oui | — | Garder |
| `start_time/end_time` | ✅ Oui | — | Garder |
| `recurrence_rule` | ⚠️ Avancé | RRULE = puissant mais complexe | Garder en DB, masquer en UI |
| `is_active` | ✅ Oui | — | Garder |

### 2.6 OfferItemSession — PARTIELLEMENT FONCTIONNEL

| Champ | Utile ? | Problème | Recommandation |
|-------|---------|----------|----------------|
| `date` | ✅ Oui | — | Garder |
| `start_time/end_time` | ✅ Oui | — | Garder |
| `total_capacity` | ✅ Oui | — | Garder |
| `remaining_capacity` | ✅ Oui | Auto-calculé | Garder |
| `price_override` | ✅ Oui | — | Garder |
| `status` | ✅ Oui | — | Garder, ajouter `expired` |

---

## 3. Analyse par catégorie d'offre

### 🏨 Hébergement

**Informations nécessaires :**
- Titre, description, région, adresse, GPS
- Type de chambre/lit/tente (Item)
- Nombre de lits, sous-type chambre (details_json)
- Prix par nuit (pricing_unit: per_night)
- Capacité (total_quantity = nombre de chambres)
- Disponibilité (calendrier jour par jour)
- Images (min 3, max 10)
- Politique d'annulation
- Check-in / Check-out (heure)

**Informations optionnelles :**
- Min/max pers. (si chambre familiale)
- Min age
- Inclusions (petit-déjeuner, Wi-Fi, parking)

**Informations à MASQUER :**
- Point de rendez-vous → inutile
- Meeting GPS → inutile
- Group size → inutile (c'est par chambre)

**Champs manquants :**
- `check_in_time` / `check_out_time` → **Ajouter** dans details_json
- `room_amenities` (Wi-Fi, clim, balcon) → **Ajouter** dans details_json
- `board_type` (demi-pension, tout inclus) → **Ajouter** dans details_json

---

### 🥾 Activité

**Informations nécessaires :**
- Titre, description, région, adresse, GPS
- Point de rendez-vous + meeting GPS
- Type d'activité (randonnée, kayak, visite...)
- Durée structurée (start_time + end_time ou duration_hours)
- Prix par personne (pricing_unit: per_person)
- Min/max participants
- Min age (optionnel)
- Sessions (dates + créneaux)
- Inclusions (matériel, guide, repas)

**Informations optionnelles :**
- Niveau de difficulté
- Distance (pour randonnée)

**Informations à MASQUER :**
- Room sub-type → inutile
- Bed count → inutile
- Tent capacity → inutile

**Champs manquants :**
- `difficulty_level` (facile, modéré, difficile, expert) → **Ajouter** dans details_json
- `distance_km` (pour randonnée) → **Ajouter** dans details_json
- `elevation_gain_m` → **Ajouter** dans details_json
- `activity_subtype` (randonnée, kayak, visite, observation...) → **Ajouter** comme item_type

---

### 🍽️ Restauration

**Informations nécessaires :**
- Title, description, région, adresse, GPS
- Type de plat ou menu (Item)
- Prix par personne ou par plat
- Horaires d'ouverture
- Capacité (nombre de couverts)
- Images

**Informations optionnelles :**
- Inclusions (boisson, dessert)
- Allergènes (details_json)

**Informations à MASQUER :**
- Point de rendez-vous → c'est l'adresse
- Meeting GPS → inutile
- Group size → inutile
- Sessions → inutile (ouvert tous les jours)

**Champs manquants :**
- `cuisine_type` (tunisienne, méditerranéenne, végétarienne) → **Ajouter** dans details_json
- `allergens` → **Ajouter** dans details_json
- `opening_hours` → **Ajouter** dans details_json ou AvailabilityRule

---

### 🎨 Artisanat / Atelier

**Informations nécessaires :**
- Title, description, région, adresse, GPS
- Type d'atelier (poterie, tissage, cuisine...)
- Durée (start_time + end_time)
- Prix par personne
- Min/max participants
- Sessions (dates + créneaux)
- Inclusions (matériel, fournitures)

**Informations optionnelles :**
- Niveau (débutant, confirmé)
- Âge minimum

**Informations à MASQUER :**
- Room sub-type → inutile
- Bed count → inutile

**Champs manquants :**
- `skill_level` (débutant, intermédiaire, confirmé) → **Ajouter** dans details_json
- `materials_included` (bool) → **Ajouter** dans details_json
- `take_home` (le participant repart avec sa création) → **Ajouter** dans details_json

---

### 🚌 Transport

**Informations nécessaires :**
- Titre, description, région
- Type de véhicule/service
- Prix (per_person, per_day, per_trip)
- Capacité (nombre de places)
- Horaires ou à la demande

**Informations optionnelles :**
- Distance/itinéraire

**Informations à MASQUER :**
- Meeting point → c'est l'adresse de départ
- Sessions → pas de sessions (service continu)
- Min age → inutile
- Group size → inutile (c'est la capacité véhicule)

**Champs manquants :**
- `vehicle_type` (van, bus, voiture, 4x4) → **Ajouter** dans details_json
- `capacity_seats` → **Ajouter** dans details_json
- `route_description` → **Ajouter** dans details_json
- `pickup_places` (liste de points de prise en charge) → **Ajouter** dans details_json

---

### 🎪 Événement

**Informations nécessaires :**
- Title, description, région, adresse, GPS
- Dates (multi-jours possible)
- Prix par personne
- Capacité max
- Inclusions

**Informations optionnelles :**
- Programme (détail jour par jour)
- Artistes/intervenants

**Champs manquants :**
- `event_dates` (start + end) → **Ajouter** dans details_json
- `program` → **Ajouter** dans details_json
- `organizer` → **Ajouter** dans details_json
- `ticket_types` → **Ajouter** comme OfferItemPrice multiples

---

## 4. Analyse thématique

### 4.1 Durée — Le problème du champ texte

**État actuel :** `duration` = varchar libre → "2h", "1 journée", "3 jours", "2 semaines"

**Problèmes :**
- Impossible de calculer (filtrage, tri, comparaison)
- Incohérent entre providers ("2h" vs "2 heures" vs "120 min")
- Ne correspond pas à la réalité (un hébergement n'a pas de "durée" au sens classique)

**Recommandation : SUPPRIMER le champ `duration` de l'offre.**

La durée se calcule différemment par catégorie :

| Catégorie | Comment calculer la durée |
|-----------|--------------------------|
| Hébergement | Nombre de nuits = (check-out - check-in). Pas de durée au sens classique |
| Activité | `start_time` → `end_time` de la session, OU `duration_hours` dans details_json |
| Atelier | Idem activité |
| Restauration | Durée du repas (1h-2h) → details_json |
| Transport | `duration_hours` OU calculé depuis distance |
| Événement | Date début → date fin |

**Pour les activités/ateliers :** Ajouter `duration_hours` (number) dans details_json. Le frontend affiche : "2h30", "1 journée", "2 jours" en formatage automatique.

---

### 4.2 Taxonomie des activités

**État actuel :**
```typescript
activity: [
  { value: 'activity', label: 'Activité' },        // ← NOM GÉNÉRIQUE, INUTILE
  { value: 'guided_tour', label: 'Visite guidée' },
  { value: 'hiking', label: 'Randonnée' },
  { value: 'water_sport', label: 'Sport nautique' },
]
```

**Problème :** "activity" comme sous-type est auto-référentiel. 4 types est insuffisant pour un vrai produit touristique.

**Taxonomie proposée (groupée) :**

| Groupe | Sous-types |
|--------|------------|
| **Outdoor** | `hiking`, `trekking`, `cycling`, `climbing`, `kayaking`, `paddle`, `zipline`, `caving`, `horseback` |
| **Nature** | `birdwatching`, `stargazing`, `photography`, `flora_tour` |
| **Culture** | `guided_tour`, `heritage_visit`, `cooking_class`, `music_workshop`, `calligraphy` |
| **Bien-être** | `yoga`, `meditation`, `spa`, `wellness_retreat` |
| **Sport** | `surfing`, `diving`, `paragliding`, `quad` |
| **Autre** | `other` → **champ "Nom de l'activité" obligatoire** |

**Si "other" sélectionné :** Afficher un champ texte obligatoire `activity_custom_name`.

---

### 4.3 Calendrier — Analyse du système actuel

**État actuel :**

| Fonctionnalité | Supportée ? | Comment |
|----------------|-------------|---------|
| Date unique | ✅ | Session avec une date |
| Plusieurs dates | ⚠️ | Plusieurs sessions, mais pas groupées |
| Chaque semaine | ❌ | `AvailabilityRule` existe mais pas utilisé |
| Samedi et dimanche | ❌ | `weekdays` dans AvailabilityRule mais pas utilisé |
| Période saisonnière | ❌ | `start_date/end_date` dans AvailabilityRule |
| Événement annuel | ❌ | `recurrence_rule` (RRULE) dans AvailabilityRule |
| Festival multi-jours | ❌ | Pas de concept "événement continuation" |
| RRULE personnalisé | ❌ | Champ existe mais pas généré |
| Génération auto sessions | ❌ | Pas de logique de génération |

**Problème fondamental :** Les `AvailabilityRules` existent en DB mais ne sont **jamais utilisées** côté frontend ni dans la logique métier. Le formulaire ne montre que des sessions manuelles.

**Architecture recommandée :**

```
┌─────────────────────────────────────────────────┐
│  SMART DATE PICKER (Frontend)                    │
│                                                  │
│  Mode 1: Date unique        → 1 session          │
│  Mode 2: Plusieurs dates    → N sessions         │
│  Mode 3: Chaque semaine     → AvailabilityRule   │
│  Mode 4: Période saisonnière → AvailabilityRule  │
│  Mode 5: Chaque année       → AvailabilityRule   │
│  Mode 6: Personnalisé (RRULE) → AvailabilityRule │
│                                                  │
│  → Les modes 3-6 génèrent automatiquement        │
│    les sessions pour les 90 prochains jours      │
└─────────────────────────────────────────────────┘
```

**Génération automatique des sessions :**
- Quand une AvailabilityRule est créée/validée
- Le backend génère les `OfferItemSession` pour les 90 prochains jours
- Les sessions passées sont automatiquement marquées `expired`
- Un cron job (quotidien) nettoie les sessions passées

---

### 4.4 Prix — Analyse du système actuel

**État actuel :**
```
pricing_unit: per_person | per_night | per_hour | per_half_day | per_day
```

**Problèmes :**
- Pas de `per_trip` (transport)
- Pas de `per_vehicle` (location véhicule)
- Pas de `per_group` (activité privée)
- Pas de `per_meal` (restauration)
- Pas de `per_stay` (hébergement = total, pas par nuit)

**Unités de tarification recommandées :**

| Unité | Usage | Exemple |
|-------|-------|---------|
| `per_person` | Activités, ateliers, restauration | 25 TND/personne |
| `per_night` | Hébergement | 80 TND/nuit |
| `per_hour` | Location, cours | 15 TND/heure |
| `per_half_day` | Activités 3-4h | 40 TND/demi-journée |
| `per_day` | Activités journée complète | 60 TND/journée |
| `per_trip` | Transport aller simple | 30 TND/trajet |
| `per_vehicle` | Location véhicule | 120 TND/véhicule |
| `per_group` | Activité privée (max N pers.) | 150 TND/groupe |
| `per_meal` | Restauration | 22 TND/repas |
| `per_stay` | Hébergement total | 250 TND/séjour |
| `per_item` | Artisanat (produit unitaire) | 35 TND/pièce |

---

### 4.5 Capacité — Champs manquants

**État actuel (entité morte) :**
```
capacity_type: rooms | beds | items | persons | seats | spaces | tents
total_quantity: int
remaining_quantity: int
max_persons: int        ← REDONDANT avec offer.max_group_size
min_participants: int   ← REDONDANT avec offer.min_group_size
max_participants: int   ← REDONDANT avec offer.max_group_size
```

**Recommandation :** Simplifier l'entité Capacité :

```
OfferItemCapacity (nouveau)
├── capacity_type: string (rooms | beds | items | persons | seats | spaces | tents)
├── total_quantity: int (stock total)
└── remaining_quantity: int (auto-calculé)
```

Supprimer `max_persons`, `min_participants`, `max_participants` → ils vivent sur l'offre.

---

### 4.6 Sessions — Système actuel

**Ce qui fonctionne :**
- Création manuelle de sessions (date + heure + capacité)
- `remaining_capacity` auto-décrémentée
- `price_override` pour tarification dynamique
- Statuts : available, full, cancelled

**Ce qui manque :**
- Statut `expired` (session passée)
- Génération automatique depuis AvailabilityRules
- Blocage automatique quand `remaining_capacity = 0`
- Annulation en cascade (quand offre annulée)
- Notification provider quand session complète

---

## 5. Audit UX — Formulaire actuel

### Structure actuelle (4 étapes)

```
Étape 1: Catégorie (grille de 8 boutons)
Étape 2: Informations générales (15+ champs d'un coup)
Étape 3: Items (nom, type, détails, prix)
Étape 4: Sessions (date, heure, capacité)
```

### Problèmes UX critiques

| Problème | Impact | Solution |
|----------|--------|----------|
| **Étape 2 = 15 champs** | Surcharge cognitive, abandon | Découper en 3 sous-étapes |
| **Pas de preview** | L'utilisateur ne voit pas le résultat | Ajouter une étape "Aperçu" |
| **Sessions = manuel only** | Impossible de définir "tous les lundis" | SmartDatePicker |
| **Pas de capacité** | Le stock n'est pas géré | Étape dédiée |
| **Pas de localisation carte** | GPS = champ texte | MapPicker toujours visible |
| **"Passer" pour skip items** | Permet de créer offre sans item | Obligatoire au moins 1 item |
| **Erreur globale en bas** | L'utilisateur ne la voit pas | Toast notification |
| **Pas de sauvegarde brouillon** | Si ferme = tout perdu | Auto-save |
| **Pas de validation en temps réel** | Erreures seulement au submit | Champs avec feedback |

---

### Wizard recommandé (9 étapes)

#### ÉTAPE 1 : Type d'offre

```
Grille de catégories (comme actuel)
+ Sélection du type d'item (room, activity, etc.)
+ Si "other" → champ nom obligatoire

→ Masquer les catégories non autorisées par le rôle
→ Afficher description + icône pour chaque catégorie
```

#### ÉTAPE 2 : Informations générales

```
Titre * (obligatoire)
Description (textarea, 500 chars max)
Région * (dropdown 24 régions tunisiennes)
Adresse * (texte + autocomplete Google)

→ 4 champs seulement, pas de surcharge
```

#### ÉTAPE 3 : Item(s) réservable(s)

```
Nom de l'item *
Type d'item (dropdown selon catégorie)
Description

CHAMPS CONDITIONNELS :
if accommodation + room:
  Sous-type chambre (dropdown) + Nombre de lits
if accommodation + camping:
  Capacité tente
if activity:
  Sous-type activité (dropdown groupé)
  Si "other" → champ nom activité obligatoire
  Durée estimée (heures)
  Niveau de difficulté
if restaurant:
  Type de cuisine + Allergènes
if transport:
  Type véhicule + Nombre de places
if workshop:
  Niveau + Matériel inclus (toggle)

→ Afficher uniquement les champs pertinents
→ Un seul item = par défaut, "Ajouter" = multi-items
```

#### ÉTAPE 4 : Prix

```
Tarif par défaut * (montant + unité)
Unité de tarification (dropdown selon type)

Tarifs optionnels :
+ Adulte / Enfant / Étudiant / Senior
+ Min/max quantité

→ Masquer unités non pertinentes (ex: per_night si atelier)
→ Un seul prix minimum, multi-tarifs optionnel
```

#### ÉTAPE 5 : Disponibilités et Calendrier

```
SMART DATE PICKER :
┌─────────────────────────────────────────────┐
│ 📅 Date unique                              │
│ 📆 Plusieurs dates                          │
│ 🔄 Chaque semaine (sélecteur weekday)       │
│ 🌊 Période saisonnière (range + weekdays)   │
│ 🎉 Chaque année                             │
│ ⚙️ Personnalisé (RRULE builder)             │
└─────────────────────────────────────────────┘

HÉBERGEMENT:
  Check-in time (dropdown 06:00-23:00)
  Check-out time (dropdown 06:00-23:00)

ACTIVITÉ/ATELIER:
  Heure de début + Heure de fin

→ Génération auto des sessions pour les 90 prochains jours
```

#### ÉTAPE 6 : Capacités

```
Type de capacité (dropdown):
- Chambres / Lits / Places / Couverts / Équipements

Stock total * (nombre)

ACTIVITÉ/ATELIER:
  Min participants (optionnel)
  Max participants (optionnel)

HÉBERGEMENT:
  Max personnes par chambre (optionnel)

→ Le stock restant est auto-calculé
```

#### ÉTAPE 7 : Localisation et Carte

```
Carte Leaflet pleine largeur
Cliquez pour placer le marqueur
Adresse reverse-geocodée automatiquement

ACTIVITÉS:
  Point de rendez-vous (séparé)
  Carte avec 2 marqueurs (lieu + RDV)

→ MapPicker toujours visible (pas toggle)
→ Default: centre Tunisie
```

#### ÉTAPE 8 : Images

```
Upload drag & drop
Min 3 images recommandées
Max 10 images
Preview avec suppression
Réorganisation par drag & drop

→ ImageUploader dédié (existe déjà)
```

#### ÉTAPE 9 : Aperçu et Confirmation

```
┌─ Aperçu carte (comme côté booking) ─────────────┐
│ [Image]  Titre de l'offre                       │
│          📍 Région, Tunisie                     │
│          ⭐ 4.8 (12 avis)                       │
│          💰 25 TND/personne                     │
│          ⏰ 2h30                                │
│          👥 8-15 participants                   │
└─────────────────────────────────────────────────┘

Options :
☑ Publication automatique (sinon brouillon)
☑ Notification aux voyageurs proches

[Sauvegarder brouillon]  [Publier]

→ Validation finale avant soumission
```

---

## 6. Incohérences Backend/Frontend

| Incohérence | Backend | Frontend | Impact |
|-------------|---------|----------|--------|
| **Catégories** | 10 (eco_tour, accommodation, activity, restaurant, craft, workshop, transfer, sejour, circuit, other) | 8 (accommodation, activity, restaurant, transport, workshop, guide_service, equipment_rental, event) | Types incohérents |
| **`offer_type`** | Champ déprécié | Envoyé comme `offer_type` | `category_id` jamais rempli |
| **Sessions** | Supportées sur tout item | Liées au 1er item only | Multi-items cassé |
| **Capacity** | Entité existe | Pas dans le formulaire | Stock non géré |
| **AvailabilityRules** | Entité existe, CRUD partiel | Pas dans le formulaire | Récurrence impossible |
| **`duration`** | Texte libre | Champ texte | Aucun calcul possible |

---

## 7. Champs manquants pour un vrai produit touristique

### Champs à AJOUTER côté Offer

| Champ | Type | Obligatoire | Usage |
|-------|------|-------------|-------|
| `short_description` | varchar(160) | Oui | SEO, cards, preview |
| `highlights` | text | Non | Points forts (liste à puces) |
| `what_to_bring` | text | Non | Activités/extérieur |
| `accessibility` | text | Non | Accessibilité PMR |
| `languages` | simple-array | Non | Langues parlées (guide) |
| `weather_dependent` | boolean | Non | Dépend de la météo |
| `instant_confirmation` | boolean | Non | Override par item |

### Champs à AJOUTER dans details_json par catégorie

#### Hébergement

```json
{
  "check_in_time": "14:00",
  "check_out_time": "11:00",
  "board_type": "breakfast",
  "room_amenities": ["wifi", "parking", "ac", "balcon"],
  "floor_level": 2,
  "square_meters": 35
}
```

| Champ | Type | Description |
|-------|------|-------------|
| `check_in_time` | time | Heure d'arrivée |
| `check_out_time` | time | Heure de départ |
| `board_type` | enum | room_only, breakfast, half_board, full_board, all_inclusive |
| `room_amenities` | string[] | wifi, parking, pool, ac, heating, kitchen, balcony, sea_view |
| `floor_level` | int | Étage |
| `square_meters` | int | Surface en m² |

#### Activité

```json
{
  "difficulty_level": "moderate",
  "distance_km": 12.5,
  "elevation_gain_m": 450,
  "duration_hours": 4.5,
  "min_fitness_level": "bonne condition physique",
  "weather_dependent": true
}
```

| Champ | Type | Description |
|-------|------|-------------|
| `difficulty_level` | enum | easy, moderate, hard, expert |
| `distance_km` | number | Distance en kilomètres |
| `elevation_gain_m` | number | Dénivelé positif |
| `duration_hours` | number | Durée estimée en heures |
| `min_fitness_level` | string | Condition physique requise |
| `weather_dependent` | boolean | Annulé si mauvais temps |

#### Restauration

```json
{
  "cuisine_type": "tunisienne",
  "allergens": ["gluten", "dairy"],
  "opening_hours": {
    "mon": "09:00-22:00",
    "tue": "09:00-22:00",
    "wed": "09:00-22:00",
    "thu": "09:00-22:00",
    "fri": "09:00-23:00",
    "sat": "09:00-23:00",
    "sun": "fermé"
  }
}
```

| Champ | Type | Description |
|-------|------|-------------|
| `cuisine_type` | string | tunisienne, mediterraneenne, vegetarienne, vegan, fusion |
| `allergens` | string[] | gluten, dairy, nuts, shellfish, eggs, soy |
| `opening_hours` | object | Horaires par jour de la semaine |

#### Artisanat / Atelier

```json
{
  "craft_type": "poterie",
  "materials_included": true,
  "take_home": true,
  "skill_level": "beginner"
}
```

| Champ | Type | Description |
|-------|------|-------------|
| `craft_type` | string | poterie, tissage, menuiserie, joaillerie, peinture |
| `materials_included` | boolean | Matériel fourni |
| `take_home` | boolean | Le participant repart avec sa création |
| `skill_level` | enum | beginner, intermediate, advanced |

#### Transport

```json
{
  "vehicle_type": "van",
  "capacity_seats": 8,
  "route_description": "Djerba → Matmata → Tozeur",
  "pickup_places": [
    { "name": "Aéroport Djerba", "lat": 33.875, "lng": 10.775 },
    { "name": "Centre-ville Djerba", "lat": 33.850, "lng": 10.730 }
  ],
  "luggage_allowed": true
}
```

| Champ | Type | Description |
|-------|------|-------------|
| `vehicle_type` | string | van, bus, car, 4x4, bike |
| `capacity_seats` | int | Nombre de places assises |
| `route_description` | text | Description de l'itinéraire |
| `pickup_places` | object[] | Points de prise en charge |
| `luggage_allowed` | boolean | Bagages autorisés |

#### Événement

```json
{
  "event_start_date": "2026-07-15",
  "event_end_date": "2026-07-17",
  "organizer_name": "Festival de Djerba",
  "program": [
    { "time": "10:00", "title": "Ouverture", "description": "Cérémonie d'ouverture" },
    { "time": "14:00", "title": "Atelier", "description": "Atelier poterie" }
  ]
}
```

| Champ | Type | Description |
|-------|------|-------------|
| `event_start_date` | date | Date de début |
| `event_end_date` | date | Date de fin |
| `organizer_name` | string | Nom de l'organisateur |
| `program` | object[] | Programme détaillé |

---

## 8. Résumé exécutif et priorités

### Priorité 1 — Blocants (à faire avant tout)

| # | Action | Impact |
|---|--------|--------|
| 1 | **Supprimer `offer_type`** du frontend, envoyer `category_id` uniquement | Données cohérentes |
| 2 | **Créer CRUD pour `OfferItemCapacity`** (controller + service) | Stock gérable |
| 3 | **Ajouter CRUD update/delete pour `AvailabilityRules`** | Récurrence possible |
| 4 | **Sécuriser `createItem`/`addPrice`/`createSession`** (vérifier ownership) | Sécurité |
| 5 | **Aligner catégories** backend = frontend (unifier les 2 listes) | Cohérence |

### Priorité 2 — Enrichissement produit

| # | Action | Impact |
|---|--------|--------|
| 6 | **Remplacer `duration`** par `duration_hours` dans details_json + calcul auto | Filtrage possible |
| 7 | **Ajouter `short_description`** (160 chars) pour SEO/cards | Visibilité |
| 8 | **Enrichir la taxonomie des activités** (25+ types groupés) | Couverture réelle |
| 9 | **Étendre les `pricing_unit`** (per_trip, per_group, per_vehicle, per_meal, per_stay, per_item) | Flexibilité tarifaire |
| 10 | **Ajouter `check_in_time`/`check_out_time`** pour hébergement | Standard hôtelier |

### Priorité 3 — UX

| # | Action | Impact |
|---|--------|--------|
| 11 | **Refactorer le wizard en 9 étapes** | Réduction abandon |
| 12 | **SmartDatePicker** pour les disponibilités (6 modes) | Récurrence |
| 13 | **Carte toujours visible** (pas toggle) | UX localisation |
| 14 | **Preview en temps réel** (étape 9) | Confiance utilisateur |
| 15 | **Auto-save brouillon** (localStorage + API) | Récupération données |

### Priorité 4 — Logique métier

| # | Action | Impact |
|---|--------|--------|
| 16 | **Génération auto des sessions** depuis AvailabilityRules | Automatisation |
| 17 | **Blocage auto** quand `remaining_capacity = 0` | Anti-double-réservation |
| 18 | **Statut `expired`** pour sessions passées | Intégrité données |
| 19 | **Calcul auto du prix indicatif** offer.price = min(items.prices) | Cohérence affichage |
| 20 | **Validation** min_group_size < max_group_size | Données valides |

---

## 9. Vision produit — Booking + Airbnb Experiences + Eventbrite + GetYourGuide

> **Philosophie :** Penser le système comme une plateforme professionnelle, pas comme un CRUD d'offres.

### 9.1 Durée structurée (pas supprimée)

**État actuel :** `duration` = texte libre → "2h", "1 journée", "3 jours"

**Solution :** Deux champs combinés :

```ts
duration_mode:
  - minutes
  - hours
  - half_day
  - full_day
  - multi_day
  - flexible

duration_value: number  // 30, 60, 120, 240, 1, 2, 3...
```

**Affichage frontend :**
- 30 min
- 2 h
- Demi-journée
- 1 journée
- 3 jours

**Avantages :**
- Filtrage par durée dans l'exploration
- Tri par durée
- Estimation du TripPlan (calcul auto du budget temps)
- Calcul automatique des horaires

---

### 9.2 AvailabilityRule = cœur du système

**Architecture actuelle (cassée) :**
```
Offer → Sessions (manuelles uniquement)
```

**Architecture cible :**
```
Offer → AvailabilityRule → SessionGenerator → Sessions
```

**Mapping AvailabilityRule → Sessions :**

| Mode | Input | Output |
|------|-------|--------|
| Date unique | 15 juin 2026 | 1 session |
| Plusieurs dates | 15, 18, 22 juin | 3 sessions |
| Hebdomadaire | Chaque samedi | Génération 1 an |
| Saisonnier | 15 mars → 15 juin, weekends | Sessions automatiques |
| Festival annuel | 15-18 mars, RRULE yearly | 2026, 2027, 2028... |
| Personnalisé | RRULE libre | Selon règle |

**Règle importante :** L'utilisateur ne crée PAS des sessions. Il crée une règle → le backend génère.

---

### 9.3 Type "event" natif

**Nouvelle catégorie :** `event`

**Champs spécifiques :**
```ts
event_start: Date
event_end: Date
program: Array<{
  time: string
  title: string
  description: string
}>
speakers: Array<{
  name: string
  role: string
  bio: string
}>
organizer: string
annual_event: boolean
max_attendees: number
```

**Exemple :** Festival Sahara Douz
- Pas une activité classique
- Multi-jours (15-18 mars)
- Programme détaillé
- Intervenants
- Récurrent annuellement

---

### 9.4 Difficulté et condition physique

**Nouveaux champs pour activités outdoor :**
```ts
difficulty_level:
  - easy       // Facile, tout public
  - moderate   // Modéré, bonne condition
  - hard       // Difficile, sportif
  - expert     // Expert, très sportif

physical_level:
  - low        // Sédentaire
  - medium     // Bonne condition
  - high       // Très bonne condition
```

**Usage :** Randonnée, VTT, kayak, escalade, trekking

---

### 9.5 Dépendance météo

**Champ :**
```ts
weather_dependent: boolean
```

**Logique :**
- Si `weather_dependent = true` et météo mauvaise → session status = `cancelled_weather`
- Notification automatique au provider et aux réservateurs
- Remboursement automatique si annulé pour météo

---

### 9.6 Langues du guide

**Champ :**
```ts
languages: string[]  // ["fr", "en", "ar", "de", "it", "es"]
```

**Affichage :** Badges langues sur la card et le détail

**Filtrage :** Touriste filtre par langue parlée

---

### 9.7 Accessibilité

**Champs :**
```ts
accessibility: {
  wheelchair: boolean      // Accessible PMR
  children: boolean        // Adapté enfants
  pets_allowed: boolean    // Animaux autorisés
}
```

**Affichage :** Icônes sur la card

---

### 9.8 Points de prise en charge multiples

**État actuel :**
```ts
meeting_point: string  // Un seul point
```

**État cible :**
```ts
pickup_points: Array<{
  name: string      // "Aéroport Djerba", "Centre-ville", "Hôtel"
  lat: number
  lng: number
  type: string      // "airport" | "hotel" | "downtown" | "custom"
}>
```

**Usage :** Transport, circuits, activités avec transfert

---

### 9.9 Circuits enrichis

**Modèle actuel :** `Circuit` → `CircuitDay` → `CircuitDayItem`

**Modèle cible :**
```
Circuit
├── days[]
├── route_polyline (encoded)
├── stops[]
├── difficulty
├── distance_total_km
├── elevation_total_m
├── map_bounds (south_west, north_east)
├── duration_days
├── participants (min/max)
├── start_city
├── end_city
├── circuit_type
```

**Nouveau champ `circuit_type` :**
```ts
circuit_type:
  - weekend       // Circuit weekend (2-3 jours)
  - seasonal      // Circuit saisonnier
  - festival      // Lié à un événement
  - on_demand     // Sur demande, pas de date fixe
  - annual        // Annuel, même dates chaque année
```

**Exemple : Circuit Désert Tunisien**
```
Jour 1 : Djerba → Matmata (120 km, 2h)
Jour 2 : Matmata → Douz (90 km, 1h30)
Jour 3 : Douz → Tozeur (150 km, 2h30)

Polyline : trace automatique sur Leaflet
Stops : chaque étape avec activité, repas, hébergement
```

---

### 9.10 TripPlan intelligent

**État actuel :** `Cart → TripPlan → Booking`

**Architecture cible :**
```
Explore → Cart → TripPlan → Timeline → Calendar → Booking
```

**Nouvelles fonctionnalités TripPlan :**

#### Timeline

```
Jour 1 — 15 juin 2026
  08h00  Départ Djerba
  10h00  Kayak côte ouest (2h)
  13h00  Déjeunerレストラン El Koubba
  15h00  Transfer vers Matmata
  17h00  Check-in éco-lodge
  20h00  Dîner + soirée traditionnelle

Jour 2 — 16 juin 2026
  08h00  Petit-déjeuner
  09h00  Visite Matmata troglodytes
  12h00  Déjeuner
  14h00  Route vers Douz
  ...
```

#### Budget

```
Activités     :  300 TND
Hébergement   :  500 TND
Transport     :  100 TND
Restauration  :  200 TND
────────────────────────
TOTAL         : 1 100 TND
```

#### Carte Leaflet

- Marqueurs pour chaque offre
- Polyline pour les circuits
- Itinéraire complet du voyage
- Heatmap des lieux populaires (optionnel)

#### Drag & Drop

- Déplacer une activité d'un jour à un autre
- Réordonner les activités dans la journée
- Conflits automatiques détectés (chevauchement horaires)

---

### 9.11 Explore enrichi

**Modes d'affichage :**

| Mode | Description |
|------|-------------|
| **Card** | Comme Airbnb — grille de cards |
| **Map** | Comme Booking — carte avec pins |
| **Split** | Carte + cards côte à côte |

**Filtres :**

| Filtre | Options |
|--------|---------|
| **Type** | Offres, Circuits, Expériences |
| **Prix** | 0-50 TND, 50-100, 100-300, 300+ |
| **Durée** | 30 min, 2 h, 1 jour, 3 jours |
| **Difficulté** | Facile, Modéré, Difficile |
| **Région** | Djerba, Tozeur, Douz, Kairouan... |
| **Activité** | Kayak, Yoga, Poterie, Randonnée... |

---

### 9.12 OfferTemplate — Le vrai game-changer

**Concept :** Chaque catégorie d'offre a un template qui pré-remplit les champs appropriés.

**Exemple Randonnée :**
```
Template auto-remplit :
  ✅ difficulty_level (modéré par défaut)
  ✅ distance_km (optionnel)
  ✅ elevation_gain_m (optionnel)
  ✅ duration_hours (calculé)
  ✅ equipment_needed (liste par défaut)
  ✅ weather_dependent (true)
  ✅ physical_level (medium)
```

**Exemple Kayak :**
```
Template auto-remplit :
  ✅ difficulty_level (facile par défaut)
  ✅ duration_hours (2h)
  ✅ equipment_included (true)
  ✅ weather_dependent (true)
  ✅ min_participants (2)
  ✅ max_participants (8)
```

**Exemple Hébergement :**
```
Template auto-remplit :
  ✅ check_in_time (14:00)
  ✅ check_out_time (11:00)
  ✅ board_type (breakfast)
  ✅ room_amenities (wifi, parking, ac)
```

**Avantage :** Le provider n'a pas 50 champs à remplir. Il remplit 5 champs, le reste est pré-rempli et modifiable.

---

### 9.13 Wizard Offer Form — 10 étapes

| Étape | Contenu | Champs conditionnels |
|-------|---------|---------------------|
| **1. Catégorie** | Grille dynamique (7 types) | Routing du formulaire |
| **2. Infos générales** | Titre, description courte/longue, région, adresse | — |
| **3. Localisation** | Map Leaflet, reverse geocoding | — |
| **4. Item intelligent** | Nom auto-rempli ou champ libre | Si "Autre" → input obligatoire |
| **5. Prix** | Base + unité + tarifs optionnels | Unités masquées selon type |
| **6. Disponibilité** | SmartDatePicker (6 modes) | Hébergement: check-in/out |
| **7. Capacité** | Min/max participants, stock | — |
| **8. Images** | Drag & drop, reorder | — |
| **9. Carte + Meeting** | Map 2 points (lieu + RDV) | Activités: meeting point |
| **10. Preview** | Aperçu carte, brouillon, publier | — |

---

### 9.14 Wizard Circuit Form — 9 étapes

| Étape | Contenu |
|-------|---------|
| **1. Infos circuit** | Nom, description, région, difficulté |
| **2. Structure jours** | Jour 1, Jour 2, Jour 3... |
| **3. Map Builder** | Leaflet avec points + polyline auto |
| **4. Stops** | Lieux avec type, durée, activité |
| **5. Type circuit** | Weekend, saisonnier, festival, annuel |
| **6. Durée auto** | Calculée depuis jours + stops |
| **7. Capacité** | Min/max participants, privé/groupe |
| **8. Prix** | Global ou par personne |
| **9. Preview** | Carte + timeline + budget |

---

### 9.15 Priorité réelle de développement

#### Phase 1 — Fondations (obligatoire)

| # | Action | Impact |
|---|--------|--------|
| 1 | Alignement catégories frontend/backend | Cohérence données |
| 2 | Sécurité ownership (createItem, addPrice, createSession) | Sécurité |
| 3 | CRUD AvailabilityRule complet | Récurrence |
| 4 | CRUD Capacity complet | Stock |
| 5 | SessionGenerator automatique | Automatisation |

#### Phase 2 — Enrichissement produit (très importante)

| # | Action | Impact |
|---|--------|--------|
| 6 | SmartDatePicker complet (6 modes) | UX calendrier |
| 7 | Wizard 10 étapes Offer | Réduction abandon |
| 8 | OfferTemplate par catégorie | Rapidité création |
| 9 | Taxonomie activités 30+ types | Couverture réelle |
| 10 | Durée structurée (mode + value) | Filtrage/tri |

#### Phase 3 — Expérience premium

| # | Action | Impact |
|---|--------|--------|
| 11 | Timeline TripPlan | Visualisation voyage |
| 12 | Calendar TripPlan | Planification |
| 13 | Carte Leaflet avancée + polylines | Expérience carte |
| 14 | Heatmap lieux populaires | Découverte |
| 15 | Recommandations IA | Personnalisation |
| 16 | Drag & drop TripPlan | Interaction |
| 17 | Circuit Builder avec Map | Création circuits |
| 18 | Événements natifs (event) | Couverture festivals |

---

> **Document mis à jour le 24/06/2026 — Audit complet du système de création d'offres Éco-Voyage**
> **Vision : Booking + Airbnb Experiences + Eventbrite + GetYourGuide + Komoot**
