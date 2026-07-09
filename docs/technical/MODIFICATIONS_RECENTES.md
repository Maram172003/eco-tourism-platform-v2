# Modifications récentes

## 1. Migration BDD — colonnes `offers`

Fichier : `backend/src/migrations/1740607200000-AddOfferFields.ts`

| Colonne | Type | Défaut | Description |
|---|---|---|---|
| `location_type` | `varchar` | `'fixed'` | `fixed` = lieu fixe, `mobile` = déplacement |
| `project_id` | `uuid` | nullable | FK → `projects.id` |
| `latitude` | `double precision` | nullable | Lat centre périmètre (mobile) |
| `longitude` | `double precision` | nullable | Lng centre périmètre (mobile) |
| `radius_km` | `double precision` | `10` | Rayon du périmètre (mobile) |

## 2. Entités / API

- **`Offer` entity** : ajout `project_id`, `project` (ManyToOne), `location_type`, `latitude`, `longitude`, `radius_km`.
- **`POST /offers`** : accepte et persiste ces champs.
- **`PATCH /offers/:id`** : accepte et persiste ces champs.
- **`GET /offers/mine`** : renvoie `location_type`.
- **`GET /offers/:id`** : renvoie tous les nouveaux champs.

## 3. Interface création offre

| Composant | Fichier | Changement |
|---|---|---|
| `GuidedOfferWizard` | `frontend/components/GuidedOfferWizard.tsx` | Ajout prop `userProjects` + sélecteur déroulant de projet dans l'étape 2 pour les `project_owner`. `selectedProjectId` initialisé depuis `editOffer.project_id` ou `userProjectId`. |

## 4. Interface modification offre

- **Bouton Modifier** (dashboard + page détail) → ouvre `GuidedOfferWizard` avec `editOffer`.
- Le wizard initialise tous les champs (dont `locationType`, `selectedProjectId`) depuis les données de l'offre.
- La soumission (POST / PATCH) envoie `project_id` via `selectedProjectId`.

## 5. Dashboard (`frontend/app/dashboard/page.tsx`)

- Passe `userProjects={profile.projects}` au `GuidedOfferWizard`.
- Type `Offer` étendu avec `location_type`.
- Affiche l'icône 📍/🚐 dans chaque carte offre.

## 6. Page détail offre (`frontend/app/offers/[id]/page.tsx`)

- Interface `Offer` étendue avec `location_type`, `project_id`, `project?: { id, name }`, `author_id`, `author_type`.
- Badge `location_type` (📍 Lieu fixe / 🚐 Mobile).
- Badge `project.name` si l'offre est liée à un projet.

## 7. Backend (`backend/src/offer/offer.service.ts`)

- Ajout de `'project'` dans les `relations` des requêtes `findByAuthor`, `findById`, `findAllPublic`.
- L'API renvoie désormais l'objet `project` dans les réponses offre.

## 8. Carte et périmètre

- **`MapView`** : ajout cercle radius si `location_type === "mobile"`.
- **`ManageEventForm`** / **`CircuitEditor`** : affichent cercle si l'offre sélectionnée est mobile.
- **Guide search** (CircuitEditor) : bouton pour localiser les guides à proximité avec le rayon.

## 9. Guide associé aux activités d'un circuit

### Dans la page détail circuit (`frontend/app/circuits/[id]/page.tsx`)

- Les modales **Ajouter / Modifier une activité** ont un toggle *"Cette activité nécessite un guide"* (checkbox).
- Quand activé, un champ de recherche de guide apparaît **dans le même formulaire** (plus de modal séparée).
- Résultats de la recherche (`GET /guide/public/search?q=...`) affichés inline.
- Guide sélectionné : `progGuideId` / `progGuideName`. Bouton *Retirer* pour désassocier.
- Envoi de `guide_id` / `guide_name` dans le body des appels `POST` / `PATCH` program item.
- Interface `CircuitProgramItem` étendue avec `guide_id`, `guide_name`.

### Backend (déjà existant)

- `CircuitProgramItem` entity : `guide_id` (uuid, nullable), `guide_name` (varchar, nullable).
- `CreateCircuitProgramItemDto` / `UpdateCircuitProgramItemDto` : `guide_id`, `guide_name`.
- Le service passe ces champs à la création/modification.

## 10. Correction des données existantes

Un script de correction a été exécuté directement sur la base existante.

### Actions effectuées

| Action | Détail |
|---|---|
| **Anciennes offres guide supprimées** | 5 offres avec `author_type = 'guide'` supprimées (avec leurs items et bookings liés) |
| **Anciens circuits supprimés** | 15 circuits + 52 jours + 156 activités + 28 options + 12 réservations supprimés |
| **Offres orphelines** | 3 offres `project_owner` sans `project_id` ont été liées au premier projet actif de leur auteur |
| **Guide offerings créées** | 5 prestations de guide avec règles de disponibilité (`weekly`, `date_range`, `on_demand`) |
| **Guides status** | Passé de `approved` → `active` pour la recherche publique |
| **Profils guides** | Zones et spécialités mises à jour pour correspondre aux guide_offerings |

### Guide offerings créées

| Guide | Offre | Type zone | Prix | Disponibilité |
|---|---|---|---|---|
| **Youssef Meslek** | Guidage Randonnée Pédestre | Point (Djerba) | 100 DT/jour | Lun-Ven 08-17 + Juil-Sept WE |
| **Youssef Meslek** | Visite Culturelle Houmt Souk | Point (Djerba) | 60 DT/½j | Mar/Jeu/Sam 09-12 |
| **Youssef Meslek** | Guidage VTT Montagnes | Rayon 30 km | 150 DT/jour | Sur demande |
| **Karim Bouazizi** | Guidage Trekking Désert | Rayon 50 km | 200 DT/jour | Oct-Avr + Lun/Mer/Ven |
| **Karim Bouazizi** | Photo Nature & Paysages | Toute la Tunisie | 250 DT/jour | Sur demande |

### Guides (profils mis à jour)

| Guide | Zone | Spécialités | Langues |
|---|---|---|---|
| Youssef Meslek | Djerba, Zaghouan, Tunis | hiking, trekking, mtb, cultural, history | fr, ar, en |
| Karim Bouazizi | Djerba, Tozeur, Sahara | trekking, desert, photography, nature | fr, ar, en, es |

## 11. Dashboard guide — nettoyage

### Changements frontend (`frontend/app/dashboard/page.tsx`)

- **Menu guide** : retrait de "Mes Offres". Les guides n'ont que "Mes Prestations".
- **Bouton "Ajouter une offre"** : affiché uniquement pour les `project_owner`.
- **Modal `GuidedOfferWizard`** : supprimé pour les guides (ils utilisent `/dashboard/guide-offerings`).

### Architecture rôles

| Rôle | Crée des offres classiques ? | Utilise |
|---|---|---|
| **Project owner** | Oui (liées à ses projets) | `GuidedOfferWizard` / "Mes Offres" |
| **Guide** | Non | `/dashboard/guide-offerings` / "Mes Prestations" |

### Pages

| Page | Usage |
|---|---|
| `/dashboard` | Interface de gestion privée |
| `/dashboard/guide-offerings` | Gestion des prestations de guidage (disponibilités, zones, prix) |
| `/profile/guide` | Profil public du guide (visible par les voyageurs) |

## 11. Points de vigilance

- Les guides n'ont pas de `project_id` ; leur offre est toujours personnelle (pas de sélecteur projet).
- Le `confirmation_mode` n'est pas modifié par ces changements.
- La suppression d'offre (`DELETE /offers/:id`) reste inchangée et fonctionne avec les nouveaux champs.
- Le guide dans les activités de circuit est **optionnel** : si l'activité n'a pas besoin de guide (kayak, repas, hébergement, vélo...), on laisse la checkbox décochée.

## 12. Améliorations Explore, Destinations, Circuits, Guide offerings

### 12.1 Destinations — projet sur les cartes offre (`frontend/app/destinations/page.tsx`)
- Interface `Offer` étendue : `project`, `latitude`, `longitude`, `location_type`, `project_id`.
- Carte offre : badge nom du projet (si `author_type === "project_owner"`) + badge "🚐 Mobile" (si `location_type === "mobile"`).

### 12.2 Circuits — guide dans TimelineView (`frontend/components/TimelineView.tsx`)
- Type `TimelineEntryData` étendu avec `guide_name?: string | null`.
- Affichage du nom du guide (`🧑‍🏫 Guide: ...`) sous la description de chaque étape.

### 12.3 Circuit detail — envoi guide_id/guide_name au TimelineView (`frontend/app/circuits/[id]/page.tsx`)
- `guide_name` ajouté aux props de `TimelineView` entries.

### 12.4 Explore — guides et rayons sur la carte (`frontend/app/explore/page.tsx`)
- Nouvel état `guides` (fetch `/guide/public/search`) + `showGuides`.
- Marqueurs guides (icône 🧑‍🏫 orange) sur la carte quand `showGuides` activé.
- Cercles de rayon (dashArray) pour les zones de service des guides.
- Bouton toggle "Guides" dans les contrôles de couches.

### 12.5 MapView — support type "guide" (`frontend/components/map/MapView.tsx`)
- Nouveau type `"guide"` dans `MarkerData`.
- Icône `guideIcon` (fond orange #f59e0b, emoji 🧑‍🏫).
- Légende : ligne "Guide" + "Zone service".
- Popup guide → lien vers `/profile/guide/{id}`.
- `layerVisibility` étendu avec `guides?: boolean`.

### 12.6 Guide-offerings — correctif et améliorations (`frontend/app/dashboard/guide-offerings/page.tsx`)
- **Bugfix** : `lat`/`lng` parsés via `Number()` pour éviter l'erreur `lat.toFixed is not a function` (type décimal PostgreSQL).
- **Nouveau** : Bouton "Voir profil public" → `/profile/guide/{userId}`.
- **Nouveau** : Extraction de `userId` depuis le token JWT.

### 12.7 Dashboard sidebar — navigation directe (`frontend/app/dashboard/page.tsx`)
- "Mes Prestations" redirige directement vers `/dashboard/guide-offerings` (au lieu d'attendre un clic secondaire).

## 13. Seed données réalistes

Fichier : `backend/src/database/seeds/sql/005-seed-data.sql`

Exécution : `PGPASSWORD=Hermosa psql -h localhost -p 5433 -U marammejri -d tourism_db -f backend/src/database/seeds/sql/005-seed-data.sql`

### Guide Offerings créées

| Guide | Offre | Zone | Prix | Disponibilité |
|---|---|---|---|---|
| **Karim Bouazizi** | Randonnée Ksour du Sud | all_tunisia | 180 DT/jour | On demand, déplacement 200 km |
| **Karim Bouazizi** | Safari Photo Désert 2 jours | Point Djerba (rayon 80 km) | 350 DT/voyage | Sep-Nov, déplacement 150 km |
| **Youssef Meslek** | Tour Guidé Djerba Insolite | Point Djerba | 80 DT/½j | Lun/Mer/Ven matin + Mar/Jeu après-midi, déplacement 30 km |
| **Youssef Meslek** | Expédition VTT Forêt de Kroumirie | Radius 40 km | 130 DT/jour | On demand, déplacement 80 km |
| **Youssef Meslek** | Initiation Spéléologie Djerba | Point fixe | 70 DT/½j | Mer/Sam 8h-12h |

### Offres mobiles créées (fakerbennoomen@gmail.com, project_owner)

| Offre | Type | Prix | Projet |
|---|---|---|---|
| Randonnée Guidée Ksour du Sud | mobile, guided_tour | 250 TND/pers | Coopérative Artisanale Tataouine |
| Atelier Poterie Mobile Tataouine | mobile, workshop | 60 TND/pers | Coopérative Artisanale Tataouine |
| Séjour Immersion Tataouine | fixed, sejour | 750 TND/pers | Coopérative Artisanale Tataouine |

Chaque offre a des items + prices associés.

### Trip Plans créés

| Titre | Voyageur | Statut | Contenu |
|---|---|---|---|
| Road Trip Sud Tunisien — Juillet 2026 | f.akerbennoomen@gmail.com | planning | Randonnée Ksour (j1) → Karim guide (j2) → Atelier poterie (j3) → Youssef guide (j5) |
| Week-end Art & Nature Djerba | sarah.b.aker... | planning | Visite guidée Youssef (j1) |
| Aventure Photo Désert & Ksour | l.eila.faker... | planning | Safari Photo Karim (j2) |

### Reviews créées

| Auteur | Cible | Note | Type |
|---|---|---|---|
| Ahmed | Karim Bouazizi | 5★ | guide |
| Ahmed | Randonnée Ksour (Karim) | 5★ | guide_offering |
| Ahmed | fakerbennoomen (project_owner) | 4★ | project_owner |
| Sarah | Youssef Meslek | 5★ | guide |
| Sarah | Tour Guidé Djerba (Youssef) | 4★ | guide_offering |
| Leila | Randonnée Guidée Ksour (offre) | 5★ | offer |
| Leila | Safari Photo Désert (Karim) | 5★ | guide_offering |

### Notifications créées

- Karim : "Nouvel avis 5★" → lien profil public
- Youssef : "Nouvel avis 5★" → lien profil public
- fakerbennoomen : "Nouvel avis 4★" → lien profil

### Idempotence

Toutes les INSERT utilisent `WHERE NOT EXISTS` — le script peut être relancé sans duplication.

---

## 14. Correctifs explore, profile guide, form prestation & circuits seed (006)

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `frontend/app/explore/page.tsx` | Endpoint API changé de `/guide/public/search` → `/guide/search` (retourne tous les guides actifs avec leurs offres). `lat`/`lng`/`radiusKm` parsés via `Number()` car le backend les renvoie en string. |
| `frontend/app/profile/guide/page.tsx` | Bouton "Publier une offre" remplacé par lien "Gérer mes prestations" → `/dashboard/guide-offerings`. Boutons "+ Publier une offre" supprimés des tabs "Offres" et "Tout". |
| `frontend/components/map/MapPicker.tsx` | Nouveau prop optionnel `radiusKm`. Quand présent, un cercle orange pointillé est dessiné autour du marqueur (utile pour visualiser le rayon de service). |
| `frontend/app/dashboard/guide-offerings/page.tsx` | Passage de `radiusKm` au `MapPicker` dans le cas radius. Boutons de zone de service passés en vert (`bg-emerald-50 border-emerald-400`) avec badge "✓ Sélectionné". |

### Nouveau fichier

| Fichier | Description |
|---|---|
| `backend/src/database/seeds/sql/006-seed-circuits.sql` | Seed idempotent créant 4 circuits, notifications et trip plans. |

### Circuits créés (seed 006)

| Circuit | Auteur | Jours | Difficulté | Activités | Guide associé |
|---|---|---|---|---|---|
| Circuit Djerba Culture & Nature | fakerbennoomen (project) | 4 | Facile | 11 | Youssef (jour 1,3,4) |
| Safari Désert & Oasis Tozeur | fakerbennoomen (project) | 3 | Modéré | 10 | Karim (tous les jours) |
| Circuit Kroumirie & Côte Nord | me.d.fakerbennoomen (project) | 3 | Modéré | 10 | Aucun (activités internes) |
| Circuit Vélo Éco Hammamet | n.our.fakerbennoomen (project) | 2 | Facile | 6 | Youssef (jour 1) |

### Notifications créées (seed 006)

- Guides Karim et Youssef : notifications de bienvenue + affectation sur circuits
- fakerbennoomen : notification circuit approuvé + nouvelle réservation
- me.d.fakerbennoomen / n.our.fakerbennoomen : notification circuit approuvé

### Trip Plans créés (seed 006)

| Titre | Voyageur | Status |
|---|---|---|
| Week-end Découverte Djerba | f.akerbennoomen | Publié |
| Aventure Désert Tozeur | l.eila.fakerbennoomen | Brouillon |
| Escapade Forêt Kroumirie | ah.m.edfakerbennoomen | Publié |
| Circuit Culturel Djerba 4 Jours | sarah.b.akerbennoomen | Brouillon |
| Journée Vélo Hammamet | f.a.k.e.r.b.e.n.n.o.o.m.e.n | Publié |

### Notifications (existantes, vérifiées)

Le système envoie déjà des notifications aux **guides** et **propriétaires de projets** pour :
- Nouvelles réservations (booking.service.ts, circuit.service.ts, trip-plan.service.ts)
- Annulations
- Approbation/refus admin (admin.service.ts)
- Nouveaux messages (messages.service.ts)

---

## 15. Guide search + descriptions dans le modal "Ajouter une activité" (Trip Plan)

### Fichier modifié

| Fichier | Changement |
|---|---|
| `frontend/app/trip-plans/[id]/page.tsx` | Deux améliorations dans `AddItemModal` : |

### 1. Onglet "Guides" dans le modal

Un système d'onglets ("Offres" / "Guides") permet maintenant de :
- Chercher un guide par nom via `/guide/search?q=...`
- Voir la liste des guides avec leur zone, score, nombre de prestations
- Cliquer sur un guide pour voir son profil + ses prestations
- Contacter le guide directement via la messagerie
- Voir le profil public du guide

### 2. Description des activités

Les descriptions des `offer_items` (champ `description`) sont maintenant affichées sous le nom de chaque activité dans le modal, tronquées à 2 lignes (`line-clamp-2`).

---

## 16. Correctifs trip plan, guide search, guide profile & seed 007

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `frontend/app/trip-plans/[id]/page.tsx` | Au lieu de "Élément supprimé" quand `offerItem` et `circuit` sont null, on affiche `item.notes` comme titre. Les notes en italique ne sont plus doublonnées quand elles servent déjà de titre. |
| `frontend/app/profile/guide/[userId]/page.tsx` | Le type `GuideProfile.offers` renommé en `offerings` (le backend renvoie `offerings`). Toutes les références `profile.offers` → `profile.offerings`. |
| `backend/src/guide/guide.service.ts` | `searchGuides` modifié : cherche aussi par zone (`LOWER(g.zone) LIKE :q`) en plus du nom. N'importe quelle requête vide retourne tous les guides (limité à 20). |

### Nouveau fichier

| Fichier | Description |
|---|---|
| `backend/src/database/seeds/sql/007-seed-comprehensive-data.sql` | Seed idempotent ajoutant des données pour **tous les utilisateurs** : active les comptes en attente, crée profils eco_traveler/project_owner, 3 nouvelles offres (Kairouan, Sousse, Tozeur) avec items, relie 21+ trip_plan_items aux offer_items, crée réservations + participants + notifications + reviews + circuits pour les nouveaux utilisateurs. |

### Résumé des données créées (seed 007)

| Donnée | Quantité |
|---|---|
| Utilisateurs activés (pending → active) | 4 |
| Profils eco_traveler créés | 3 (Sami, Mariam, Omar) |
| Profil project_owner créé | 1 (Amira) |
| Nouvelles offres créées | 3 (Kairouan, Sousse, Sahara) |
| Nouveaux offer_items créés | 9 |
| Trip_plan_items liés à des offer_items | +21 (38/58 liés maintenant) |
| Nouvelles réservations créées | 3 (Faker, Sarah, Leila) |
| Participants ajoutés | 3 |
| Nouvelles notifications | 10+ (bienvenue, réservation, admin) |
| Nouvelles reviews | 2 (Faker → Youssef, Karim) |
| Nouveaux trip_plans créés | 3 (Sami, Mariam, Omar) |
| Nouveaux circuits créés | 1 (Amira — Sahel) |

### Fichiers impactés

- `frontend/app/trip-plans/[id]/page.tsx` : `notes` comme fallback pour le titre
- `frontend/app/profile/guide/[userId]/page.tsx` : `offerings` au lieu de `offers`
- `backend/src/guide/guide.service.ts` : recherche par zone + tous les guides si requête vide
- `backend/src/database/seeds/sql/007-seed-comprehensive-data.sql` : seed complet
