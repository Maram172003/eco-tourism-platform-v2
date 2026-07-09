# PR #7 — Intégration Complète : Circuits Multi-Jours, Offres, Activités, Hébergement & Tarification

## Résumé

Cette PR apporte les fonctionnalités majeures suivantes :

1. **Circuits multi-jours avec programme jour par jour**
2. **Système d'offres enrichi** (items, sessions, capacités, tarification)
3. **3 types d'activités dans un circuit** (propre offre, offre externe, guide)
4. **Recherche d'hébergement intelligent** (propre → autre propriétaire → externe)
5. **Tarification à 3 sources** avec pré-remplissage automatique

---

## 1. Circuits Multi-Jours

### Structure
Un circuit est un itinéraire complet composé de plusieurs jours, chacun contenant plusieurs activités.

```
Circuit
├── Jour 1 (CircuitDay)
│   ├── Activité 1 : Mon offre (proprio)
│   ├── Activité 2 : Activité externe (autre propriétaire)
│   └── Activité 3 : Guide local
├── Jour 2
│   ├── Activité 1 : ...
│   └── Activité 2 : ...
└── ...
```

### Entités backend
| Entité | Rôle |
|--------|------|
| `Circuit` | Conteneur global (auteur, dates, prix, statut) |
| `CircuitDay` | Une journée (numéro, titre, localisation GPS) |
| `CircuitProgramItem` | **Une activité** dans un jour (horaires, offre liée, guide, emoji) |
| `CircuitOption` | Options supplémentaires (transport, hébergement, équipement) |
| `CircuitReservation` | Réservation globale du circuit |

### Endpoints
- `POST /api/circuits` — Créer un circuit
- `POST /api/circuits/:id/days` — Ajouter un jour
- `POST /api/circuits/:id/days/:dayId/program` — Ajouter une activité
- `PATCH /api/circuits/:id/days/:dayId/program/:itemId` — Modifier une activité
- `DELETE /api/circuits/:id/days/:dayId/program/:itemId` — Supprimer une activité

---

## 2. Les 3 Types d'Activités dans un Circuit

Chaque jour du circuit peut contenir 3 types d'activités :

### Type A — Mon offre (own)
> L'activité est liée à **ma propre offre** sur la plateforme

| Champ | Valeur |
|-------|--------|
| `linked_offer_item_id` | ID de mon OfferItem |
| `guide_id` | null |
| `price` | Pré-rempli depuis mon prix catalogue (modifiable) |
| **Exemple** | "Nuit dans ma chambre troglodyte" — mon hébergement |

### Type B — Offre d'un autre propriétaire (other)
> Je loue une activité/offre d'un **autre propriétaire** de la plateforme

| Champ | Valeur |
|-------|--------|
| `linked_offer_item_id` | ID de l'OfferItem d'un autre propriétaire |
| `guide_id` | null |
| `price` | Prix catalogue de l'autre propriétaire (pré-rempli, modifiable) |
| **Exemple** | "Nuit dans l'éco-gîte de Tata Yasmine" — hébergement externe |

### Type C — Activité avec guide (guide)
> L'activité est encadrée par un **guide local** (randonnée, visite guidée, etc.)

| Champ | Valeur |
|-------|--------|
| `linked_offer_item_id` | ID de l'offre du guide (ou null si juste guide) |
| `guide_id` | ID du guide |
| `guide_name` | Nom du guide |
| `guide_cost` | Coût interne du guide (pré-rempli depuis son offre) |
| `price` | Prix facturé au voyageur (saisie manuelle) |
| **Exemple** | "Randonnée au Cap Bon avec guide" — guide + offre activité |

---

## 3. Recherche d'Hébergement Intelligent (3 niveaux)

Quand un propriétaire crée un circuit et se déplace vers une nouvelle région, il doit trouver un hébergement pour ses voyageurs.

### Niveau 1 — Mon hébergement (propre)
> Si **j'ai déjà une offre d'hébergement** dans la région de destination

- Recherche automatique dans mes offres par `item_type` (room, bed, camping_space)
- Pré-remplissage auto du prix catalogue
- `linked_offer_item_id` = mon item
- **Avantage** : Pas de coût externe, je garde les revenus

### Niveau 2 — Autre propriétaire (recherche sur la plateforme)
> Si **je n'ai pas d'hébergement** dans cette région, je cherche un autre propriétaire

- Recherche géolocalisée via `GET /api/offers/public?region=X&category=hebergement`
- Filtrage par type (room, bed, camping_space) et distance
- Sélection d'un OfferItem tiers
- `linked_offer_item_id` = item d'un autre propriétaire
- **Coût** = prix catalogue du propriétaire (pré-rempli, modifiable)
- **Avantage** : Réservation atomique, commission plateforme, avis, sécurité

### Niveau 3 — Hôtel/Agence externe (référence externe)
> Si **aucun propriétaire** n'est inscrit dans cette région

- Formulaire de saisie manuelle (nom, téléphone, adresse, prix estimé)
- Stocké dans `external_reference` (JSONB sur CircuitProgramItem)
- **Pas de réservation atomique** — juste une note documentaire
- **À éviter** : Incite à recruter le prestataire sur la plateforme

### Schéma de décision
```
Activité d'hébergement dans un jour de circuit
                    │
                    ▼
    ┌───────────────────────────────┐
    │ Ai-je mon propre hébergement │
    │ dans cette région ?           │
    └───────────┬───────────────────┘
                │
      ┌─────────┴─────────┐
      ▼                   ▼
    OUI                  NON
      │                   │
      ▼                   ▼
 Mon offre          Recherche sur la
 (linké auto)       plateforme (rayon X km)
                          │
                ┌─────────┴─────────┐
                ▼                   ▼
            TROUVÉ              RIEN
                │                   │
                ▼                   ▼
         Offre tiers         Référence externe
         (linké auto)        (hôtel/agence hors plateforme)
```

---

## 4. Tarification à 3 Sources

### A. Mon offre (own)
| Champ | Comportement |
|-------|-------------|
| Prix catalogue | 50 TND (mon offre) |
| Prix facturé voyageur | **Pré-rempli à 50 TND** — modifiable |
| Logique | Je peux vendre à 50 TND (prix catalogue) ou 60 TND (marge) |

### B. Offre d'un autre propriétaire (other)
| Champ | Comportement |
|-------|-------------|
| Prix catalogue autre | 40 TND |
| Prix achat (ce que je paie) | **Pré-rempli à 40 TND** — modifiable |
| Prix revente (ce que je facture) | Saisie manuelle |
| Ma marge | Revente - Achat |

### C. Prestataire externe (external)
| Champ | Comportement |
|-------|-------------|
| Prix estimé | Saisie manuelle |
| Prestataire | Saisie manuelle |

### D. Guide
| Champ | Comportement |
|-------|-------------|
| Coût guide | **Pré-rempli** depuis guide_offering.price |
| Prix activité | Saisie manuelle |
| Ma marge | Prix activité - Coût guide - Coût offre liée |

---

## 5. Logique des Offres

### Structure d'une offre
```
Offer (conteneur commercial)
├── author_id + author_type ('guide' | 'project_owner')
├── category_id → OfferCategory
├── region, latitude, longitude, address
├── status (pending → approved → rejected)
│
└── OfferItems (produits réservables)
    ├── item_type (room | bed | camping_space | dish | menu | equipment | activity | workshop | transport_service)
    ├── details_json (flexible)
    ├── confirmation_mode
    │
    ├── OfferItemPrice (tarification par catégorie)
    ├── OfferItemSession (créneaux datés)
    ├── OfferItemCapacity (stock disponible)
    └── OfferItemAvailabilityRule (récurrence)
```

### Catalogue Simple vs Complexe
- **Simple** : Quantité en stock globale (hébergement, location matériel)
- **Complexe** : Sessions datées avec capacité fluctuante (activités guidées)

---

## 6. Frontend — Composants Modifiés

### CircuitBuilderWizard (6 étapes)
| Étape | Contenu |
|-------|---------|
| Step 1 | Informations générales (titre, dates, prix) |
| Step 2 | **Localisation** — MapPicker par jour + recherche offres externes à proximité |
| Step 3 | **Activités** — Sélection offre (mes offres / offres externes / guide) + tarification |
| Step 4 | Waypoints sur carte + auto-calcul distance |
| Step 5 | **Hébergement** — Recherche intelligente (propre → autre → externe) |
| Step 6 | Résumé + soumission |

### ExternalOfferModal (3 onglets)
| Onglet | Contenu |
|--------|---------|
| Mes offres | Liste de mes offres avec prix catalogue |
| Offres externes | Recherche géolocalisée (lat/lng/radius) |
| Référence externe | Formulaire (nom, téléphone, adresse, prix) |

### GuideSearchInline
- Recherche par nom + zone + prix max
- Vue liste / carte toggle
- Disponibilité par date
- Sélection → `onSelect(id, price?)`

### OfferItemSearchInline
- Recherche d'offres par région/type
- Affichage du prix catalogue
- Sélection → passe le prix

---

## 7. Backend — Fichiers Modifiés

### Nouveaux modules
| Module | Fichiers |
|--------|----------|
| `circuit/` | entity, service, controller, DTOs (6 entités) |
| `booking/` | entity, service, controller, DTOs |
| `notification/` | entity, service, controller |
| `trip-plan/` | entity, service, controller |
| `favorite/` | entity, service, controller |
| `review/` | entity, service, controller |

### Modules modifiés
| Module | Changement |
|--------|-----------|
| `offer/` | Items enrichis (prices[], sessions, availability) |
| `guide/` | Recherche géolocalisée + filtre zone/prix |
| `app.module.ts` | Import des 6 nouveaux modules |

---

## 8. Seed Data

### Projets
- 4 projets éco-touristiques (hébergement, restauration, artisanat, transport)

### Offres
- 12+ offres couvrant : hébergement, restauration, activités, ateliers

### Circuits
- 3 circuits thématiques multi-jours

### Guides
- 15 guides avec profils complets (zone, langues, spécialités, tarifs)

---

## 9. Comment Tester

### Circuit multi-jours
1. Créer un circuit → ajouter 2-3 jours
2. Pour chaque jour, ajouter des activités

### Type A — Mon offre
1. Sélectionner "Mes offres" → choisir un item
2. Vérifier le prix pré-rempli (modifiable)

### Type B — Offre externe
1. Sélectionner "Offres externes" → chercher par région
2. Sélectionner une offre tiers → prix achat pré-rempli

### Type C — Guide
1. Rechercher un guide (nom, zone, prix)
2. Sélectionner → coût guide affiché
3. Saisir le prix activité

### Hébergement
1. Dans Step 5, choisir "Mon hébergement" → prix pré-rempli
2. Ou "Autre propriétaire" → chercher → sélectionner
3. Ou "Référence externe" → saisir manuellement

---

## 10. Fichiers Inclus

### Backend (complet)
```
backend/src/
├── booking/          # Système de réservations
├── circuit/          # Circuits multi-jours (6 entités)
├── notification/     # Notifications
├── trip-plan/        # Plans de voyage
├── favorite/         # Favoris
├── review/           # Avis
├── offer/            # Offres enrichies
├── guide/            # Guides (recherche avancée)
├── users/            # Utilisateurs
├── auth/             # Authentification
└── database/         # Seeds
```

### Frontend (complet)
```
frontend/
├── app/
│   ├── circuits/     # Pages circuits
│   ├── reservations/ # Pages réservations
│   ├── trip-plans/   # Plans de voyage
│   └── notifications/# Notifications
├── components/
│   ├── CircuitBuilderWizard.tsx  # Wizard création circuit
│   ├── ExternalOfferModal.tsx    # Modal offres externes
│   ├── ExternalOfferItemSearch.tsx # Recherche offres
│   ├── OfferItemSearchInline.tsx # Recherche items
│   ├── GuideSearchInline.tsx     # Recherche guides
│   ├── CartWidget.tsx            # Widget panier
│   └── map/                      # Composants Leaflet
└── lib/
    ├── api.ts
    └── distance.ts
```
