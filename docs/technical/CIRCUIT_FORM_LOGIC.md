# Logique des formulaires Circuit & Offre

## 1. Types d'activités et leurs champs dynamiques

Trois grands types d'activités (offer-schema.ts) :

### circuit_nature
- **Détails circuit** : nom, point départ/arrivée, distance_km, dénivelé, altitude max, type circuit, fichier GPX, programme jour par jour (répéteur avec titre_jour, description_jour)
- **Niveau & Groupe** : niveau difficulté, nb participants min/max
- **Inclus & Conditions** : inclus (multiselect hébergement/transport/guide/repas), non inclus, équipement obligatoire, restrictions médicales, annulation météo, points d'intérêt

### circuit_culturel
- **Détails visite** : nom lieu, type patrimoine, durée visite, langues disponibles, guide obligatoire
- **Groupes** : taille min/max
- **Inclus** : transport, entrées, guide, repas

### transport_service
- **Véhicule** : type, capacité, climatisation, accessible PMR
- **Parcours** : départ/arrivée, distance, durée estimée, péages inclus
- **Tarifs** : prix par personne/groupe, tarif nuit

### Champs communs
- `inclus` (multiselect: Hébergement, Transport, Guide, Repas, Équipement, Entrées)
- `non_inclus`
- `annulation_meteo`
- `points_interet`

## 2. Modes de disponibilité (5 modes)

Chaque mode change l'UI et les données envoyées :

| Mode | UI | Données envoyées |
|------|-----|-------------------|
| **Dates spécifiques** | Date picker → ajout tags | `specific_dates: ["2026-07-15", ...]` |
| **Récurrence hebdomadaire** | 7 boutons jours (Lun-Dim) + time picker | `weekdays: [0,2,5]`, `time_slot_start`, `time_slot_end` |
| **Période ouverte** | 2 date inputs début/fin | `avail_start`, `avail_end` |
| **Saison complète** | Select saison (Printemps/Été/Automne/Hiver) | `saison: "ete"` |
| **Sur demande** | Aucun champ date, juste un label | `mode: "on_demand"` |

### Règles métier
- Si `mode = specific` : au moins 1 date requise
- Si `mode = weekly` : au moins 1 jour requis
- Si `mode = period` : date début < date fin
- Si `mode = season` : saison requise
- `blocked_dates` (jours bloqués) disponible pour tous les modes sauf `on_demand`

## 3. Confirmation & Réservation

| Mode | Comportement | Champ supplémentaire |
|------|-------------|---------------------|
| **Instantanée** | Confirmé automatiquement | — |
| **Sur demande** | Provider valide manuellement | `delai_reponse_heures` (ex: 48h) |
| **Avec acompte** | Confirmé après versement | `deposit_percentage` (slider 10-100%) |

## 4. Hébergement

### Dans le circuit (JSONB `hebergement`)
```
{
  inclus: true/false,
  type: "same"/"per_day",
  accom_type: "chambre"/"dortoir"/"tente",
  nb_unites: number,
  nb_lits: number,
  price_source: "own"/"other"/"external",
  prix_nuit: number,
  prix_achat: number,        // si price_source = "other"
  prestataire: string         // si price_source = "external"
}
```
- `inclus: false` → pas d'hébergement, voyageur gère seul
- `inclus: true, type: "same"` → hébergement unique pour tout le séjour
- `inclus: true, type: "per_day"` → hébergement différent par jour (configurable par journée)
- `accom_type` → 3 types : **chambre** (lit privé), **dortoir** (lit partagé), **tente** (emplacement)
- `nb_unites` → nombre de chambres/lits/emplacements
- `nb_lits` → nombre de lits par unité (ou capacité pour tente)

### Tarification hébergement (3 scénarios)
| Source | UI | Logique |
|--------|-----|---------|
| **own** (mon hébergement) | Prix unité/nuit pré-rempli depuis mon offre catalogue (éditable) | *Mon offre catalogue = 50 TND → pré-rempli à 50 TND, je peux vendre 60 TND si je veux* |
| **other** (autre propriétaire) | Prix achat pré-rempli depuis son offre catalogue + prix revente à saisir | *Son offre catalogue = 40 TND → achat pré-rempli 40 TND, je saisis revente 55 TND, marge = 15 TND* |
| **external** (hors plateforme) | Prix estimé + prestataire | Saisie manuelle, tarif indicatif |

### Tarification des activités (Step 3 — nouveau)

Chaque activité (program item) a désormais :
- **`price`** : prix facturé au voyageur pour cette activité (éditable)
- **`guide_cost`** : coût interne du guide (pré-rempli depuis le catalogue du guide, éditable)

#### Pré-remplissage automatique

| Source sélectionnée | Champ pré-rempli | Valeur | Modifiable ? |
|---------------------|-----------------|--------|:-----------:|
| **Mon offre** (Tab 1) | `price` | Prix catalogue de mon offre | ✅ Oui |
| **Offre externe** (Tab 2) | `price` | Prix catalogue de l'offre | ✅ Oui |
| **Guide** (dans l'activité) | `guide_cost` | Prix du guide (offering.price) | ✅ Oui |
| **Aucune offre / Externe** | `price` | Vide (saisie manuelle) | ✅ Oui |

#### Logique économique

- **Coût guide** : ce que je paie au guide (ex: 100 TND/jour)
- **Prix activité** : ce que le voyageur paie pour cette activité (ex: 120 TND)
- **Ma marge** = Prix activité - Coût guide - Coût offre liée (si applicable)

*Exemple :*
```
Guide = 100 TND/jour  (coût)
Mon offre (repas) = 50 TND  (coût interne)
Prix activité = 200 TND  (facturé voyageur)
Marge = 200 - 100 - 50 = 50 TND
```

### Dans les activités (champ `inclus` multiselect)
Les sous-types `circuit_nature`, `circuit_montagne`, `agence_ecotourisme` ont `Hébergement` comme option dans leur liste `inclus`.

### Refuge conditionnel (`circuit_montagne`)
Section "Refuge" qui apparaît si `refuge_disponible = true` dans l'onboarding, avec :
- `refuge_inclus` (boolean) → si oui, affiche : nom_refuge, type_hebergement_refuge, repas_refuge

## 5. Configuration des jours

### Maram (via `programme_jours` répéteur)
```
programme_jours: [
  { titre_jour: "Arrivée à Djerba", description_jour: "Installation..." },
  { titre_jour: "Exploration Sud", description_jour: "..." }
]
```

### Tourisme (normalisé)
```
Circuit → CircuitDay (day_number, title, description, date, lat, lng)
        → CircuitProgramItem (title, start_time, end_time, category, subtypes, price, ...)
```
Les jours sont normalisés en entités plutôt qu'en JSONB, ce qui permet des relations plus riches (guide, offre liée, etc.)

## 6. Champs conditionnels

Utilisation du pattern `conditionalOn` :
```typescript
conditionalOn: { field: 'refuge_disponible', value: true }
```
- Si la condition n'est pas remplie → le champ est masqué
- Utile pour les chaînes de dépendances (ex: type hébergement → nom hébergement)

## 7. Sessions (OfferSession)

Pour les offres avec `fulfillment_mode = scheduled` ou `recurring` :
- Entité `offer_sessions` avec : date, start_time, end_time, capacity, spots_taken, guide_id, status
- Interface CRUD dédiée dans le dashboard provider
- Les sessions sont générées automatiquement depuis les règles de disponibilité

## 8. Validation croisée

`CrossValidationRule` :
```typescript
{ field: 'nb_participants_max', rule: 'lte', onboardingKey: 'groupe_max',
  message: 'Ne peut pas dépasser {value}' }
```
Règles : `lte`, `gte`, `in`, `subset`, `coherent`, `requiredIfTrue`, `requiredIfFalse`

## 9. Carte des lieux (Step 2)

Dans chaque journée du circuit, la localisation utilise désormais `MapPicker` **toujours visible** avec :
- Barre de recherche intégrée (Nominatim geocoding)
- Carte interactive (clic pour placer le marqueur)
- Le lieu s'affiche directement sans bouton de toggle

## 10. Recherche de guides (Step 3)

### GuideSearchInline amélioré
- Barre de recherche + filtre zone + filtre prix max
- Résultats avec photo, zone, rayon, langues, disponibilité, score éco
- Bouton bascule **Liste / 🗺️ Carte** → affiche un `MapPicker` avec les positions des guides
- Résultats de carte cliquables pour sélection rapide

### Page dédiée `/guide/search`
Page complète de recherche de guides avec :
- **Barre de recherche** centrale avec sélecteur de zone
- **Filtres avancés** : langue, prix max, spécialité, date de disponibilité, déplacement possible
- **3 vues** : grille, carte seule, partagé (liste + carte)
- **Cartes guides** : photo, nom, zone, bio, spécialités, rayon d'activité, langues, prix, contact
- **Carte interactive** (MapView) avec marqueurs guides + cercles de rayon d'activité
- Lien vers profil public de chaque guide

## 11. Circuit Map avec hébergement

`CircuitRouteMap` (Leaflet) :
- Marqueurs verts numérotés pour chaque jour (CircuitPoint)
- Polyligne verte pointillée pour le tracé
- Icône hôtel orange pour l'hébergement (HebergementPoint)
- Ajustement automatique du zoom (`fitBounds`)
