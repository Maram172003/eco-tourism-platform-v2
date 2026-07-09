# TODO & Progression — Tourisme Platform

> Dernière mise à jour : 3 juillet 2026  
> Version : **v2.1** — Plateforme complète avec circuits, guides, réservations + fix images

---

## ✅ Hautes priorités — Terminé

### 1. Détail offre : sous-types + details_json
- [x] Afficher les sous-types (TV, douche, lavabo, etc.) dans la page détail offre
- [x] Backfill les offres existantes (`seed:backfill-details-json → details_json = '{}'`)
- [x] UI pour éditer/saisir les sous-types (GuidedOfferWizard)
- [x] `offer-schema.ts` : 18+ schémas (hébergement, activité, atelier, transport, location, guide service)
- [x] `offer-rules.ts` : needsLocation, canHaveGuide, guideRequirement, hasDifficulty, hasItemTypesWithoutLocation

### 2. Circuit : amélioration sélection guide
- [x] Recherche guide par nom + filtres (disponibilité, zone)
- [x] Afficher infos guide (zone, rayon, langues, prix) dans la sélection
- [x] Filtre automatique selon la date du jour et la localisation (via `/guide/search`)
- [x] Intégration dans `CircuitBuilderWizard`

### 3. CircuitActivity → relation offre
- [x] Chaque activité de circuit référence une offre existante (`linked_offer_item_id`)
- [x] UI : sélection offre obligatoire + auto-fill titre depuis l'offre
- [x] Validation : blocage submit si activité sans `linked_offer_item_id`
- [x] Backend : `linked_offer_item_id` envoyé dans le POST program
- [x] Respect du modèle UML (Offer ← CircuitActivity ← CircuitDay ← Circuit)
- [x] Supprimé le mauvais script de migration

---

## ✅ Priorités moyennes — Terminé

### 4. Offre → projet obligatoire
- [x] Validation backend (`offer.service.ts` ligne 57-61)
- [x] Message "Créez un projet" quand `userProjects` est vide
- [x] Validation frontend (`selectedProjectId` requis avant submit)
- [x] Bouton "Créer un projet" dans le message d'alerte
- [x] Fetch automatique des projets via `GET /project-owner/projects`

### 5. Localisation : héritée vs propre
- [x] Offres fixes (hébergement, resto, etc.) → héritent du projet
- [x] Offres mobiles (kayak, randonnée, etc.) → propre localisation
- [x] UI : masquer/afficher champs selon type
- [x] Step 2 utilise `hasItemTypesWithoutLocation(cat, itemTypes)`
- [x] `ITEMS_WITHOUT_LOCATION` ajouté dans `offer-rules.ts`

### 6. GuideOffering — Module complet
- [x] Modèle `GuideOffering` (titre, description, langues, prix, capacité, zone, rayon, déplacement)
- [x] API CRUD `/guide-offerings` (backend)
- [x] Règles de disponibilité (`on_demand`, `date_range`, `weekly`, `daily`)
- [x] Recherche guide avancée (spatiale, date, prix, langue)
- [x] UI frontend : créer/gérer les GuideOfferings (dashboard guide)
- [x] **Sessions** : entité `GuideOfferingSession` + génération + UI calendrier
- [x] **Booking** : intégration GuideOffering dans Booking entity + `createGuideBooking` + endpoint
- [x] Bouton Réserver sur profil guide public (sélection session, participants)
- [x] `generateSessions()` ne supprime plus les sessions avec réservations
- [x] `GuideOfferingBlock` entity + API (jours bloqués)
- [x] `GuideOfferingPrice` entity + API (grilles tarifaires)
- [x] `GuideSearchService` : filtrage spatial en SQL (haversine) + statut actif
- [x] `POST /bookings/guide` dans `BookingController`

### 7. Map : afficher rayon cercle
- [x] `<Circle>` implémenté dans `MapView.tsx` et `MapPicker.tsx`
- [x] Rayon affiché depuis `radius_km` pour les guides dans la page Explore
- [x] Utilisé aussi pour les offres mobiles

### 8. Moteur recherche guide
- [x] Backend filters (date, zone, distance, langue, prix, capacité)
- [x] Exclusion automatique des guides indisponibles (quand une date est fournie)
- [x] Frontend dédié : UI de filtres guide dans la page Explore
- [x] Filtrage spatial déporté en SQL (haversine)

---

## ✅ Faible priorité — Terminé

### 9. Trip Planner pour écovoyageur
- [x] Constructeur de voyage (jours → activités) : CRUD complet
- [x] Réservation directe : bouton "Réserver" + modal
- [x] Recherche guide intégrée + ajout direct de GuideOffering dans TripPlan
- [x] `AddTripPlanItemDto` : champ `guide_offering_id`
- [x] `TripPlanService.book()` : crée guide bookings (session auto si non spécifiée)

---

## 🔧 Corrections récentes (juillet 2026)

### Fixes
- [x] `form.lat.toFixed is not a function` — wrappé avec `Number()` + fallback coords
- [x] Projet selector : fetch automatique via `GET /project-owner/projects` si `userProjects` undefined
- [x] `project_id must be a UUID` — UUIDs seeds corrigés au format v4
- [x] `@IsUUID()` valide uniquement UUID v4 — UUIDs `a1000000-...` → `b1a2c3d4-...`
- [x] `generateSessions()` safe : vérifie les réservations existantes avant suppression
- [x] Dashboard profile guard : `profile &&` avant d'afficher GuidedOfferWizard
- [x] `.gitignore` : node_modules/, .next/, dist/, build/
- [x] `placeholder.svg` créé pour images manquantes

### Seed Data
- [x] 6 circuits avec 3+ lieux chacun (jours enrichis)
- [x] Images Unsplash ajoutées aux circuits (ARRAY URLs)
- [x] Program items détaillés pour chaque journée
- [x] Variables UUID v4 pour tous les projets seed

---

## 📊 Résumé des entités

| Module | Entités | Endpoints |
|--------|---------|-----------|
| **Offer** | Offer, OfferItem, OfferItemPrice, OfferItemSession, OfferCategory | CRUD + search |
| **Circuit** | Circuit, CircuitDay, CircuitProgramItem, CircuitOption | CRUD + reserve |
| **Guide** | GuideProfile, GuideOffering, GuideOfferingSession, GuideOfferingBlock, GuideOfferingPrice | CRUD + search + booking |
| **Booking** | Booking, BookingParticipant, GuideBooking | create + status |
| **TripPlan** | TripPlan, TripPlanItem | CRUD + book |
| **Project** | Project, ProjectOwner | CRUD + profile |
| **Publication** | Publication, Place | CRUD + contributions |

---

## 🗂️ Architecture technique

```
frontend/                    backend/
├── app/                     ├── src/
│   ├── explore/             │   ├── offer/
│   ├── circuits/            │   ├── circuit/
│   ├── trip-plans/          │   ├── guide/
│   ├── dashboard/           │   ├── booking/
│   └── profile/             │   ├── trip-plan/
├── components/              │   ├── project/
│   ├── GuidedOfferWizard    │   ├── publication/
│   ├── CircuitBuilderWizard │   └── common/
│   ├── TripPlanBuilder      ├── database/
│   └── map/                 │   └── seeds/
└── lib/                     └── scripts/
    ├── api.ts
    ├── offer-rules.ts
    └── offer-schema.ts
```

---

## 🚀 Commandes utiles

```bash
# Backend
yarn start:dev          # Développement
yarn build              # Production

# Frontend  
yarn dev                # Développement
yarn build              # Production

# Database
docker exec -i tourisme-db-1 psql -U marammejri -d tourism_db < scripts/seed.sql
docker exec -i tourisme-db-1 psql -U marammejri -d tourism_db < scripts/data_complementaire.sql
```
