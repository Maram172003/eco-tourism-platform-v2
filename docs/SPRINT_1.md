# Sprint 1 — Documentation

## Vue d'ensemble

Le Sprint 1 vise à **finir le cœur métier touristique** avant d'ajouter des fonctionnalités sociales ou de découverte. L'objectif est de corriger les bugs critiques et de compléter les flux partiels existants.

---

## Guide complet : Création d'offre → Règles → Sessions

### Définitions

| Terme | Définition | Exemple |
|-------|-----------|---------|
| **Offre** | Le produit touristique global (ex: "Randonnée Ichkeul") | Titre, description, images, région |
| **Item** | Le détail réservable de l'offre (ex: "Place adulte", "Chambre double") | Prix, type, description |
| **Règle de disponibilité** | Quand l'offre est ouverte à la réservation | "Tous les samedis de 09h à 17h" |
| **Session** | Un créneau concret qu'un client peut réserver | "12 Juillet 2026, 09h-17h, 20 places restantes" |
| **Capacité** | Le stock global de places disponibles | "20 personnes au total" |

### Relation entre ces concepts

```
UNE OFFRE (ex: "Randonnée Ichkeul")
  └── UN ITEM (ex: "Place adulte")
        ├── PRIX : 45 TND
        ├── CAPACITÉ : 20 personnes (stock global)
        ├── RÈGLES DE DISPONIBILITÉ :
        │     ├── Règle 1 : "Tous les samedis, 09h-17h"
        │     └── Règle 2 : "Tous les dimanches, 10h-16h"
        └── SESSIONS (générées automatiquement) :
              ├── Session 1 : 12 Juillet 2026 (sam), 09h-17h, 20 places
              ├── Session 2 : 13 Juillet 2026 (dim), 10h-16h, 20 places
              ├── Session 3 : 19 Juillet 2026 (sam), 09h-17h, 20 places
              └── ... (pour 90 jours)
```

---

### Étape par étape : Créer une offre et générer les sessions

#### ÉTAPE 1 — Créer l'offre (Wizard, Steps 1-4)

**Page** : `/offers/new` → Wizard GuidedOfferWizard

| Step | Nom | Ce que fait l'utilisateur | API appelée |
|------|-----|--------------------------|-------------|
| 1 | Catégorie | Choix du type (activité, hébergement, etc.) | Aucune |
| 2 | Informations | Titre, description, région, adresse | Aucune |
| 3 | Activité | Type d'activité, difficulté, durée | Aucune |
| 4 | Tarifs | Prix, label, devise | Aucune |

À ce stade, **rien n'est sauvegardé en base**. Tout est dans le state React du wizard.

#### ÉTAPE 2 — Définir les règles de disponibilité (Wizard Step 5 : Calendrier)

**Page** : Wizard Step 5 — `SmartDatePicker`

L'utilisateur choisit un preset dans SmartDatePicker :

| Preset | Règle créée | Exemple |
|--------|-------------|---------|
| "Date unique" | `date_range` avec start=end | 12 Juillet 2026 |
| "Dates multiples" | Plusieurs `date_range` | 12 + 19 + 26 Juillet |
| "Chaque semaine" | `weekly` avec jours cochés | Tous les samedis |
| "Saisonnier" | `date_range` + `weekdays` | Juin-Sept, weekends |
| "Annuel" | `yearly` avec RRULE | Chaque 14 Juillet |
| "Avancé" | `custom` avec RRULE libre | `FREQ=WEEKLY;BYDAY=MO,WE` |

**Résultat** : les règles sont stockées dans `availabilityRules[]` (state React). **Rien n'est en base encore.**

#### ÉTAPE 3 — Configurer la capacité et les délais (Wizard Step 6)

**Page** : Wizard Step 6 — Capacité

| Champ | Valeur | Où stocké |
|-------|--------|-----------|
| Type de capacité | "persons" | `OfferItemCapacity.capacity_type` |
| Quantité totale | 20 | `OfferItemCapacity.total_quantity` |
| Délai réservation | 2 jours | `OfferItem.booking_deadline_days` |
| Délai annulation | 1 jour | `OfferItem.cancellation_deadline_days` |

#### ÉTAPE 4 — Publier l'offre (Wizard Step 9 → "Publier")

**Page** : Wizard Step 9 — `handleSubmit()` (GuidedOfferWizard.tsx)

Quand l'utilisateur clique "Publier l'offre", voici l'enchaînement **exact** des appels API :

```
1. POST /offers                    → Crée l'offre en base
   │
2. POST /offers/:id/items          → Crée l'item (nom, type, prix, délais)
   │
3. POST /offers/items/:id/prices   → Crée les tarifs
   │
4. [Si édition] DELETE /offers/items/:id/availability/delete-all
   │             → Supprime les ANCIENNES règles (pour éviter les doublons)
   │
5. POST /offers/items/:id/availability   (pour CHAQUE règle)
   │             → Sauvegarde les règles en base
   │
6. POST /offers/items/:id/availability/generate   ← SI il y a des règles
   │             → GÉNÈRE LES SESSIONS automatiquement
   │
7. POST /offers/items/:id/capacity       → Sauvegarde la capacité
```

**Point clé** : La génération des sessions (étape 6) ne se fait que si `availabilityRules.length > 0`. Si l'utilisateur n'a créé aucune règle, **aucune session n'est générée**.

#### ÉTAPE 5 — Ce que fait `generateSessions()` en détail

**Backend** : `offer.service.ts` — `generateSessions(itemId, daysAhead=90)`

```
1. CHARGER les règles actives depuis la base
   │
   ├── Si 0 règle → ERREUR : "Aucune règle de disponibilité trouvée.
   │                           Créez d'abord une règle."
   │
   └── Sinon → continuer
   │
2. RÉCUPÉRER la capacité de l'item
   │  (total_quantity depuis OfferItemCapacity)
   │
3. SUPPRIMER les anciennes sessions (SAUF celles avec des réservations)
   │
   │  Recherche : sessions liées à des bookings non-annulés
   │  → Ces sessions sont PROTÉGÉES (pas supprimées)
   │  → Les autres sessions sont supprimées
   │
4. GÉNÉRER de nouvelles sessions pour chaque règle
   │
   │  Pour la règle "Tous les samedis de 09h à 17h" :
   │  ├── 12 Juillet 2026 (sam) → Session créée
   │  ├── 19 Juillet 2026 (sam) → Session créée
   │  ├── 26 Juillet 2026 (sam) → Session créée
   │  └── ... jusqu'à 90 jours
   │
   │  Chaque session a :
   │  ├── date : "2026-07-12"
   │  ├── start_time : "09:00" (de la règle, ou "09:00" par défaut)
   │  ├── end_time : "17:00" (de la règle, ou "17:00" par défaut)
   │  ├── total_capacity : 20 (de la capacité de l'item)
   │  └── remaining_capacity : 20 (début = total)
   │
5. SAUVEGARDER toutes les sessions en base
```

---

### Le bouton "Régénérer les sessions"

**Où** : Wizard Step 5 (Calendrier), **uniquement en mode édition**

**Condition d'affichage** : `isEdit && editOffer?.items?.[0]?.id`

**Ce que fait le bouton** :

```
Utilisateur clique "Régénérer les sessions"
        │
        ▼
POST /offers/items/:id/availability/generate
        │
        ▼
Backend : generateSessions(itemId, 90)
        ├── Charge les règles DE LA BASE (pas du wizard !)
        ├── Supprime les sessions sans réservations
        └── Régénère les sessions depuis les règles de la base
```

**Important** : Le bouton régénère depuis les règles **déjà sauvegardées en base**, pas depuis les modifications non-sauvegardées dans le wizard. Si l'utilisateur a modifié des règles dans le wizard mais n'a pas cliqué "Publier", la régénération utilise les **anciennes** règles.

**Erreur "Aucune règle de disponibilité trouvée"** : Cette erreur apparaît quand :
- L'offre n'a **aucune règle** en base
- L'utilisateur clique sur "Régénérer les sessions"
- Le backend trouve 0 règle active → lève une `BadRequestException`

**Solution** : D'abord créer/sauvegarder des règles (Step 5 du wizard), puis publier l'offre (Step 9), puis utiliser le bouton régénérer.

---

### Les 2 endpoints liés aux règles

| Endpoint | Méthode | Quand | Rôle |
|----------|---------|-------|------|
| `/offers/items/:itemId/availability` | POST | Étape 5 du publish | Crée UNE règle |
| `/offers/items/:itemId/availability/delete-all` | DELETE | Étape 4 du publish (édition seulement) | Supprime TOUTES les règles |
| `/offers/items/:itemId/availability/generate` | POST | Étape 6 du publish OU bouton régénérer | Génère les sessions depuis les règles |

---

### Synthèse visuelle du flux complet

```
┌──────────────────────────────────────────────────────────┐
│                    WIZARD (Frontend)                      │
│                                                          │
│  Step 1-4 : Catégorie, Infos, Activité, Tarifs          │
│     └── Tout en state React, rien en base                │
│                                                          │
│  Step 5 : Calendrier (SmartDatePicker)                   │
│     └── availabilityRules[] en state React               │
│         (ex: [{type:"weekly", weekdays:[6],              │
│                start_time:"09:00", end_time:"17:00"}])   │
│                                                          │
│  Step 6 : Capacité, Délais                               │
│     └── capacity_type, total_quantity, deadlines         │
│         en state React                                   │
│                                                          │
│  Step 9 : "Publier l'offre"                              │
│     └── handleSubmit() déclenche tout :                  │
│                                                          │
│        ┌─ POST /offers ──────────────→ OFFRE en base     │
│        ├─ POST /offers/:id/items ───→ ITEM en base       │
│        ├─ POST /offers/items/:id/prices → PRIX en base   │
│        ├─ [edit] DELETE .../delete-all → nettoyage       │
│        ├─ POST .../availability (×N) → RÈGLES en base    │
│        ├─ POST .../availability/generate → SESSIONS      │
│        └─ POST .../capacity → CAPACITÉ en base           │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                    BASE DE DONNÉES                        │
│                                                          │
│  offers ──< offer_items ──< offer_item_sessions          │
│              │              ├── date                      │
│              │              ├── start_time                │
│              │              ├── end_time                  │
│              │              ├── remaining_capacity        │
│              │              │                            │
│              ├──< offer_item_availability_rules           │
│              │     ├── availability_type                  │
│              │     ├── weekdays                          │
│              │     └── start_time / end_time              │
│              │                                           │
│              └──< offer_item_capacity                    │
│                    ├── capacity_type                     │
│                    └── total_quantity / remaining_qty     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

### Types de règles supportés

| Type | Exemple | Génère |
|------|---------|--------|
| `date_range` | Du 1er juin au 30 septembre, weekends | 1 session par weekend dans la période |
| `weekly` | Tous les lundis et mercredis | 1 session par jour cible par semaine |
| `daily` | Tous les jours | 1 session par jour |
| `weekend_only` | Samedis et dimanches | 1 session par weekend |
| `yearly` | Chaque 14 juillet | 1 session par an |
| `custom` | RRULE `FREQ=WEEKLY;BYDAY=MO,WE,FR` | Selon la règle RRULE |

---

### Améliorations UI

- **Estimation en temps réel** : affiche "~12 sessions seront générées" pendant la configuration
- **Résumé lisible** : "Chaque samedi de 09h à 17h" au lieu du brut technique
- **Feedback clair** : les sessions sont générées automatiquement à la publication
- **Régénération** : en mode édition, bouton pour recréer les sessions (protège celles avec réservations)

### Bug corrigé : doublons de règles

**Avant** : Chaque edit-save créait de nouvelles règles sans supprimer les anciennes → doublons.

**Après** : En mode édition, les anciennes règles sont supprimées avant la création des nouvelles (`DELETE /offers/items/:id/availability/delete-all`).

### Bug corrigé : suppression de sessions réservées

**Avant** : `generateSessions()` supprimait TOUTES les sessions, y compris celles avec des réservations actives → FK violation.

**Après** : Seules les sessions **sans réservations actives** sont supprimées. Les sessions bookées sont préservées.

---

## 2. Capacité (OfferItemCapacity)

### Problème

L'entité `OfferItemCapacity` existait dans le backend mais n'était **jamais utilisée** :
- `remaining_quantity` était initialisé une fois et jamais modifié
- Aucune vérification de stock lors de la réservation
- Aucune décrémentation lors d'un booking

### Concept

```
OfferItemCapacity
├── capacity_type: "persons" | "rooms" | "beds" | "tents" | ...
├── total_quantity: 20        (stock initial)
├── remaining_quantity: 15    (stock après 5 réservations)
```

**Deux mécanismes de capacité coexistent :**

| Mécanisme | Entité | Quand | Cas d'usage |
|-----------|--------|-------|-------------|
| **Session** | `OfferItemSession.remaining_capacity` | Par créneau | Atelier le 15/07 à 14h, 12 places |
| **Stock global** | `OfferItemCapacity.remaining_quantity` | Global | 20 vélos disponibles au total |

### Flux implémenté

```
Réservation créée
       │
       ├── Session existe ? → décrémente session.remaining_capacity
       │
       └── Pas de session ? → décrémente capacity.remaining_quantity
                               + vérifie stock suffisant
```

```
Réservation annulée
       │
       ├── Session existe ? → restaure session.remaining_capacity
       │
       └── Pas de session ? → restaure capacity.remaining_quantity
```

### Nouveaux champs dans le wizard

Step 6 (Capacité) du wizard :
- **Type de capacité** : personnes, chambres, lits, places, tentes, articles, espaces
- **Quantité totale** : stock global disponible

---

## 3. Délais de réservation et d'annulation

### Problème

Les champs `booking_deadline_days` et `cancellation_deadline_days` existaient sur l'entité `OfferItem` mais n'étaient ni remplis ni vérifiés.

### Concept

```
booking_deadline_days: 2
→ Le client doit réserver au moins 2 jours avant la session

cancellation_deadline_days: 1
→ Le client peut annuler jusqu'à 1 jour avant la session
```

### Implémentation

**Frontend** : Champs number dans Step 6 du wizard avec explication.

**Backend** (`booking.service.ts`) :
- `create()` : vérifie `booking_deadline_days` par rapport à `session.date`
- `cancel()` : vérifie `cancellation_deadline_days` par rapport à `session.date`
- Les deux lèvent une `BadRequestException` si le délai n'est pas respecté

---

## 4. Waypoints des circuits

### Problème

Les waypoints (points de passage sur la carte) pouvaient être définis lors de la création d'un circuit mais **pas modifiés** par la suite. Le `PATCH /circuits/:id` ignorait le champ `waypoints`.

### Fix

Ajout dans `circuit.service.ts` :
```typescript
if (dto.waypoints !== undefined) circuit.waypoints = dto.waypoints ?? null;
```

---

## 5. TripPlan — Regroupement par jour

### Problème

Les items du TripPlan étaient affichés en liste plate, sans regroupement par jour. Tous les items convertis depuis le panier avaient `day_number: null`.

### Avant

```
Timeline
  1. Kayak Djerba
  2. Nuit troglodyte Matmata
  3. Randonnée Ichkeul
  4. Restaurant local
```

### Après

```
Itinéraire jour par jour

Jour 1 (2 activités)
  • Kayak Djerba
  • Restaurant local

Jour 2 (1 activité)
  • Nuit troglodyte Matmata

Jour 3 (1 activité)
  • Randonnée Ichkeul
```

### Auto-assignation du day_number

**Conversion Cart → TripPlan** (`travel-cart.service.ts`) :
```
day_number = 1 + (date_item - date_début_plan) en jours
```

Sources de date :
- `session.date` pour les offres avec session
- `circuit.start_date` pour les circuits

**AddItemModal** (frontend) :
- Suggère automatiquement `day_number = max(jours existants) + 1`

---

## 6. Fichiers modifiés

### Backend

| Fichier | Changements |
|---------|-------------|
| `offer.service.ts` | `removeAllAvailabilityRules()`, protection des sessions réservées dans `generateSessions()` |
| `offer.controller.ts` | Endpoint `DELETE /offers/items/:itemId/availability/delete-all` |
| `booking.service.ts` | Vérification des délais, décrémentation/restauration de `OfferItemCapacity.remaining_quantity` |
| `booking.module.ts` | Import de `OfferItemCapacity` |
| `circuit.service.ts` | Ajout de `waypoints` dans `update()` |
| `travel-cart.service.ts` | Auto-assignation de `day_number` et `sort_order` dans `convertToTripPlan()` |

### Frontend

| Fichier | Changements |
|---------|-------------|
| `GuidedOfferWizard.tsx` | Champs capacité/délais, suppression des règles avant recréation, génération auto des sessions, bouton régénération |
| `SmartDatePicker.tsx` | Estimation du nombre de sessions, résumé lisible des règles, UI améliorée |
| `trip-plans/[id]/page.tsx` | Timeline regroupée par jour, auto-suggestion du day_number dans AddItemModal |

---

## 7. Endpoints ajoutés

| Méthode | Route | Description |
|---------|-------|-------------|
| `DELETE` | `/offers/items/:itemId/availability/delete-all` | Supprime toutes les règles de disponibilité d'un item |

---

## 8. Bugs corrigés

| Bug | Sévérité | Fix |
|-----|----------|-----|
| Doublons de règles à chaque edit-save | Haute | Suppression des anciennes règles avant création |
| Suppression de sessions réservées (FK violation) | Critique | Protection des sessions avec réservations actives |
| `OfferItemCapacity.remaining_quantity` jamais décrémenté | Haute | Décrémentation dans `create()`, restauration dans `cancel()` |
| Délais de réservation/annulation non vérifiés | Haute | Vérification dans `BookingService.create()` et `cancel()` |
| Waypoints non modifiables après création | Moyenne | Ajout dans `circuit.service.update()` |
| TripPlan: items tous en "Non assigné" | Moyenne | Auto-assignation depuis `session.date` / `circuit.start_date` |

---

## 9. Processus de développement

```
1. Analyse du code existant
   ├── Lecture des entités, services, contrôleurs
   ├── Identification des bugs et manques
   └── Priorisation par impact

2. Implémentation (par priorité)
   ├── Sprint 1.1-1.5 : Features manquantes
   └── Corrections bugs critiques

3. Vérification
   ├── TypeScript check (frontend + backend)
   └── Compilation sans erreur

4. Documentation
   └── Ce fichier (SPRINT_1.md)
```


