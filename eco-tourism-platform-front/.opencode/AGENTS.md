<!-- BEGIN:eco-voyage-context -->
# Éco-Voyage — Contexte pour l'Agent

## Architecture

### Backend (NestJS)
- Global prefix: `api` → `http://localhost:3001/api/...`
- TypeORM + PostgreSQL
- Token: `access_token` + `refresh_token` dans localStorage

### Entités principales et relations

| Entité | Table | Note |
|--------|-------|------|
| `Publication` | `publications` | Base polymorphique : `type` = `place` | `experience` | `eco_project`. Les **lieux** (Place) sont des `Publication` avec `type='place'` et `status='approved'`. |
| `Offer` | `offers` | A `region`, `latitude`, `longitude`. Lié à `Project` via `project_id`. |
| `Circuit` | `circuits` | A `region`, `lat`, `lng`. Statut: `pending` | `approved`. |
| `Review` | `reviews` | Lié à `Publication` via `target_type='publication'` + `target_id`. |
| `Photo` | `photos` | Lié à n'importe quelle entité via `entity_type` + `entity_id`. Score via votes. `is_hero` pour la photo principale. |
| `PubInteractions` | `pub_interactions` | Likes et commentaires sur les publications. |
| `PlaceContribution` | `place_contributions` | Contributions aux lieux par les éco-voyageurs. |

### Endpoints backend avec filtre région
- `GET /api/offers?region=...` — offres approuvées filtrées par région
- `GET /api/circuits?region=...&status=...` — circuits filtrés par région
- `GET /api/publications/places?region=...&limit=&offset=` — lieux filtrés par région
- `GET /api/publications/experiences?region=...` — expériences filtrées par région
- `GET /api/publications/:id` — détail d'une publication (lieu)
- `GET /api/places/:id/events` — événements d'un lieu
- `POST /api/places/:id/events` — créer un événement (auth requis)
- `GET /api/publications/:id/events` — événements d'une publication (lieu)
- `POST /api/publications/:id/events` — créer un événement pour une publication

### Entité Event
| Champ | Type | Note |
|-------|------|------|
| `id` | UUID | |
| `place_id` | UUID | FK vers Publication |
| `title` | string | |
| `description` | text | optionnel |
| `event_type` | enum | festival, concert, market, competition, exhibition, workshop, other |
| `start_date` | timestamp | |
| `end_date` | timestamp | optionnel |
| `images` | simple-array | URLs |
| `external_url` | string | optionnel |
| `status` | enum | pending, approved, rejected |
| `created_by` | UUID | FK vers User |

### Frontend (Next.js App Router)
- API client: `apiFetch<T>(endpoint)` dans `lib/api.ts`
- `API_BASE_URL` = `process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"`
- Authentification: token dans localStorage clés `token` / `access_token` / `user` (JSON.parse)

## Ce qui a été fait
### Backend
- ✅ Filtre `?region=` ajouté sur `GET /offers`, `GET /circuits`, `GET /publications/places`, `GET /publications/experiences`
- ✅ Publication controller/service mis à jour

### Frontend - Page lieu (/places/[id])
- ✅ Navigation par ancres : sidebar desktop (sticky) + tabs mobiles (scrollables)
- ✅ 10 sections : Aperçu, Galerie, Météo, Offres, Circuits, Expériences, Événements, Avis, Carte, À proximité
- ✅ IntersectionObserver pour highlight section active
- ✅ Récupération des données "à proximité" par région (offers, circuits, experiences, nearby places)
- ✅ Carte Leaflet avec marqueur stylé + popup (remplace iframe OSM)
- ✅ Galerie photos avec votes (like/dislike), upload, photo principale (hero)
- ✅ Système d'avis (reviews) complet
- ✅ Partage de lien
- ✅ Galerie triée : hero en premier, puis par score, puis par date
- ✅ Météo Open-Meteo (aujourd'hui + 5 jours)
- ✅ Événements : affichage des événements du lieu + formulaire d'ajout (modal)

### Frontend - Profil éco-voyageur
- ✅ Ajout d'événements à la création d'un lieu (section événements dans le formulaire)
- ✅ Affichage des événements dans le modal de détail d'une publication (vue lieu)
- ✅ Appel API POST `/publications/:id/events` après création du lieu pour chaque événement

### Backend
- ✅ Module Event complet : entity, DTO, service, controller, module
- ✅ CRUD événements : GET /api/places/:id/events, POST /api/places/:id/events

### Infrastructure
- ✅ `docs/ENRICHISSEMENT_PLATEFORME.md` — plan complet des 20 axes d'enrichissement priorisés avec suivi d'avancement
- ✅ Compilation TypeScript zéro erreur (`npx tsc --noEmit`)

### Hero Image automatique
- Le service `PhotoService.recalculateHero()` est appelé après chaque `upvote`, `downvote`, `create`, `remove`, `setHero`
- La photo avec le meilleur `score` devient `is_hero = true`, les autres passent à `false`
- En cas d'égalité, la plus récente l'emporte
- Le frontend trie la galerie : hero en premier, puis par score, puis par date

### Météo intégrée
- Composant `WeatherSection` dans `components/WeatherSection.tsx`
- Utilise Open-Meteo API (gratuite, sans clé) : `api.open-meteo.com/v1/forecast`
- Affiche la météo actuelle + prévisions 5 jours
- WMO weather codes → icônes émoji + labels en français
- Intégré dans la page lieu (section Météo, entre Carte et À proximité)

### Carte enrichie
- `PlaceMap` accepte un tableau `markers: NearbyMarker[]` avec `id`, `lat`, `lng`, `title`, `type` (place|offer|circuit), `href?`
- Marqueurs colorés : rouge (lieu consulté, 48px), vert (lieux), bleu (offres), violet (circuits) avec icônes SVG
- Popups cliquables avec lien vers la page détail
- `fitBounds` ajuste automatiquement le zoom pour voir tous les marqueurs
- Légende des couleurs affichée sous la carte
- Initialisation en 2 phases : `useEffect` pour la carte + `useEffect` séparé pour les marqueurs via `L.layerGroup`

### Galerie centralisée
- `mediaItems` agrège depuis 5 sources : Photos communauté (Photo entity), images du lieu, offres, circuits, expériences
- Déduplication par URL (`uniqueMedia`)
- Badges source colorés : 🟢 Communauté, 🔵 Offre, 🟣 Circuit, 🟠 Expérience, ⚫ Lieu
- Les photos communauté gardent les votes (like/dislike/hero)
- Les autres médias ont un lien cliquable vers la source

### Événements
- Module backend `Event` complet : entity, DTO, service, controller (NestJS), module `backend/src/event/`
- CRUD endpoints : `GET /api/places/:id/events` (liste publique), `POST /api/places/:id/events` (création auth)
- Types d'événements : festival, concert, marché, compétition, exposition, atelier
- Page lieu (`/places/[id]`) : section Événements avec affichage cartes + badge type coloré + dates
- Bouton "Ajouter" en haut de la section pour éco-voyageurs/guides/project_owners/admins connectés
- Modal d'ajout : titre*, description, type, dates*, lien externe
- Profil éco-voyageur : section événements dans formulaire "Recommander un lieu" (ajout en ligne avant publication, création en batch après)
- Modal détail publication : affichage des événements existants chargés depuis l'API

### Dashboard Analytics Guide
- Nouvel onglet "Statistiques" dans le profil guide (5e tab)
- Composant `GuideAnalytics` dans `components/GuideAnalytics.tsx`
- KPIs : nombre d'offres, circuits, note moyenne, réservations, abonnés, abonnements
- Graphiques à barres : répartition des offres par statut (approuvée/en attente/rejetée) et par type (Éco-Tour/Activité/Atelier/Transfert)
- Réservations entrantes : breakdown par statut (confirmées/en attente/annulées)
- Derniers avis reçus (5 derniers) avec étoiles et commentaire
- Données agrégées côté client depuis les endpoints existants : `/offers/mine`, `/circuits/mine`, `/reviews/average/guide/:id`, `/reviews/target/guide/:id`, `/bookings/incoming`, `/follows/count`

### Timeline des expériences
- Backend : entité `TimelineEntry` (`backend/src/timeline/`) avec `publication_id`, `step_order`, `emoji`, `time_label`, `title`, `description`, `duration_minutes`, `distance_km`, `transport_mode`, `lat`, `lng`
- Endpoints : `GET/POST /publications/:id/timeline`, `PUT /publications/:id/timeline` (remplacement batch), `PATCH/DELETE /timeline/:entryId`
- Frontend : `TimelineView.tsx` (affichage Polarsteps-style) + `TimelineEditor.tsx` (éditeur avec sélecteur émoji, durée, distance, transport)
- Intégré dans le profil éco-voyageur : création d'expérience (section timeline), détail publication (affichage timeline), édition publication (timeline éditable via PUT)

### Circuit Builder — Améliorations jour-par-jour
- Backend : `CircuitProgramItem` enrichi avec 4 colonnes : `emoji` (varchar 10), `duration_minutes` (int), `distance_km` (decimal 8,2), `transport_mode` (varchar 30)
- DTO : validation des nouveaux champs dans `CreateCircuitProgramItemDto`
- Frontend : modal "Ajouter une activité" enrichi avec sélecteur émoji, durée (min), distance (km), mode transport
- Affichage enrichi des activités dans l'itinéraire : émoji + badge temps + durée + distance + transport

### CircuitBuilderWizard enrichi
- Le composant `CircuitBuilderWizard.tsx` (assistant création circuit en 6 étapes) a été enrichi avec les 4 nouveaux champs : émoji, durée (min), distance (km), mode transport
- Interface `ProgramItemForm` mise à jour avec les champs `emoji`, `duration_minutes`, `distance_km`, `transport_mode`
- Sélecteur émoji (dropdown des 25 émojis) à côté du titre
- Champs durée et distance dans la grille 4 colonnes avec start/end time
- Sélecteur transport (dropdown avec émojis : Van, À pied, Vélo, Chameau, etc.)
- L'appel POST `/circuits/:id/days/:id/program` envoie les 4 nouveaux champs
- Compilation zéro erreur (frontend + backend)

### Circuits — Correction des données de seed
- **52 jours en double supprimés** : chaque circuit avait exactement 2 copies de chaque jour (bug de seed)
- **Coordonnées corrigées** : tous les jours pointent maintenant vers des lieux réels dans leur région (Djerba, Sahara, Kerkennah, Tataouine, Tozeur, Cap Bon, Tunis, Kairouan, Nabeul, Ain Draham)
- Les jours sont ordonnés géographiquement pour former un itinéraire logique sur la carte Leaflet

### TimelineView dans circuit detail
- `TimelineView` accepte un prop optionnel `renderActions` pour ajouter des boutons édition/suppression par entrée
- Le détail circuit (`/circuits/[id]`) utilise désormais `TimelineView` pour l'affichage des activités dans chaque jour, remplaçant la liste plate
- Style Polarsteps : ligne verticale, émoji, badge horaire, durée, distance, transport
- Compilation zéro erreur

### Niveau de difficulté circuits
- Backend : colonne `difficulty_level` (varchar, default 'moderate') sur l'entité Circuit + DTO
- CircuitBuilderWizard : sélecteur 🟢 Facile / 🟡 Modéré / 🔴 Difficile / ⚫ Expert dans Step 1
- Circuit detail : badge dans le header + modal d'édition
- Tous les affichages circuits (7 fichiers) : badge coloré sur chaque carte
- Compilation zéro erreur

### Onglet Circuits profil guide
- Nouveau tab "Circuits" dans `/profile/guide` (icône Route)
- Fetch via `GET /circuits/mine` en parallèle du profil
- Grille 2 colonnes : titre, statut, difficulté, durée, prix, boutons Détails/Modifier
- Aperçu des circuits dans le tab "Tout" (max 4)
- Compilation zéro erreur

## Commandes utiles
- Backend: `cd backend && npm run start:dev`
- Backend TS check: `cd backend && npx tsc --noEmit`
- Frontend: `cd frontend && pnpm dev`
- Frontend TS check: `cd frontend && npx tsc --noEmit`
<!-- END:eco-voyage-context -->
