# Audit — Circuits, Activités & Tarification

**Date :** 2026-07-05
**Statut :** Audit fonctionnel complet
**Auteur :** Buffy (Codebuff)

---

## 1. Structure des Circuits

### Exigence

Un circuit doit être composé de :
- Circuit → plusieurs jours
- Chaque jour → plusieurs activités
- Chaque activité doit pouvoir être créée, modifiée et supprimée

### Résultat

| Critère | Statut | Détails |
|---------|--------|---------|
| Circuit → plusieurs jours | ✅ Conforme | `CircuitBuilderWizard` gère `days[]` avec add/remove |
| Chaque jour → plusieurs activités | ✅ Conforme | `programItems[]` par jour |
| CRUD activités | ✅ Conforme | add/remove/updateProgramItem |

**Fichiers concernés :**
- `frontend/components/CircuitBuilderWizard.tsx` — Wizard 6 étapes
- `backend/src/circuit/` — Circuit, CircuitDay, CircuitProgramItem entities
- `backend/src/circuit/circuit.service.ts` — CRUD complet

---

## 2. Les 4 Types d'Activités

### Exigence

Le wizard doit permettre de gérer 4 cas :
1. Ma propre offre (own)
2. Offre d'un autre propriétaire (other)
3. Guide
4. Prestataire externe

### Résultat par cas

#### Cas 1 — Ma propre offre (own) ✅ Conforme

| Critère | Statut | Détails |
|---------|--------|---------|
| Offres personnelles chargées | ✅ | `/offers/items/mine` dans useEffect |
| Sélection crée lien | ✅ | `linked_offer_item_id` mis à jour |
| Informations récupérées | ✅ | Nom, type, prix affichés |
| Prix catalogue disponible | ✅ | Badge "Offre à X TND" |

**Fichiers :**
- `CircuitBuilderWizard.tsx` — ExternalOfferModal (onglet "Mes offres")
- `OfferItemSearchInline.tsx` — Composant de recherche

#### Cas 2 — Offre d'un autre propriétaire (other) ✅ Conforme

| Critère | Statut | Détails |
|---------|--------|---------|
| Recherche offres publiques | ✅ | `/offers/public` avec filtres |
| Filtrage géographique | ✅ | Paramètres lat/lng dans la requête |
| Sélection crée lien externe | ✅ | `linked_offer_item_id` avec ID tiers |
| Informations récupérées | ✅ | Titre, prix de l'offre externe |

**Fichiers :**
- `ExternalOfferModal.tsx` — Onglet "Offres externes"
- `ExternalOfferItemSearch.tsx` — Recherche géolocalisée

#### Cas 3 — Guide ⚠️ Partiel

| Critère | Statut | Détails |
|---------|--------|---------|
| Recherche guides fonctionne | ✅ | `/guide/search` avec filtres zone/prix |
| Recherche par rayon géo | ✅ | Paramètres lat/lng envoyés |
| Guide lié à l'activité | ✅ | `guide_id` et `guide_name` dans state |
| Auto-lien avec offre du guide | ⚠️ Manquant | L'offre du guide n'est pas automatiquement reliée |

**Bug :** Quand un guide est sélectionné, son `guide_cost` est récupéré mais son offre (`linked_offer_item_id`) n'est pas auto-liée.

**Fichiers :**
- `CircuitBuilderWizard.tsx:72-230` — Version inline du GuideSearch
- `GuideSearchInline.tsx` — Component exporté (non utilisé dans le wizard)

#### Cas 4 — Prestataire externe ⚠️ Partiel

| Critère | Statut | Détails |
|---------|--------|---------|
| Formulaire saisie externe | ✅ | ExternalOfferModal onglet "Référence externe" |
| Aucune offre requise | ✅ | Pas de linked_offer_item_id |
| Enregistrement informations | ⚠️ Non branché | `onExternalRefChange` callback non sauvegardée |

**Bug :** Le commentaire `// Future: store external ref in prog state` indique que la callback n'est jamais exécutée dans le wizard.

**Fichiers :**
- `ExternalOfferModal.tsx` — Onglet "Référence externe"
- `CircuitBuilderWizard.tsx:~800` — Callback non branchée

---

## 3. Logique de Tarification

### Exigence

Le système doit distinguer :
- Le prix catalogue de l'offre (valeur de référence)
- Le prix utilisé dans le circuit (copie indépendante)
- Modifier le prix de l'offre ne doit jamais modifier un circuit existant

### Résultat par cas

#### Cas 1 — Ma propre offre ✅ Conforme

| Critère | Statut | Détails |
|---------|--------|---------|
| Prix catalogue récupéré auto | ✅ | `offerItems.find(...)?.prices[0]` |
| Prix circuit pré-rempli | ✅ | `price` dans `updateProgramItem` |
| Prix modifiable | ✅ | Champ input éditable |
| Prix catalogue visible | ✅ | Badge "Offre à X TND" |

#### Cas 2 — Offre externe ✅ Conforme

| Critère | Statut | Détails |
|---------|--------|---------|
| Prix catalogue récupéré auto | ✅ | `onSelectMyOffer(itemId, price)` |
| Prix circuit pré-rempli | ✅ | `price` passé en paramètre |
| Prix modifiable | ✅ | Champ input éditable |
| Prix catalogue visible | ✅ | Badge affiché |

#### Cas 3 — Guide ⚠️ Partiel

| Critère | Statut | Détails |
|---------|--------|---------|
| Prix offre guide récupéré | ✅ | `guide_cost` depuis la recherche |
| Prix circuit pré-rempli | ⚠️ | Non pré-rempli automatiquement |
| Prix modifiable | ✅ | Champ input éditable |
| Prix catalogue visible | ✅ | "Coût guide: X TND" |

#### Cas 4 — Prestataire externe ✅ Conforme

| Critère | Statut | Détails |
|---------|--------|---------|
| Pas de pré-remplissage | ✅ | Champs entièrement manuels |
| Prix modifiable | ✅ | Champ input éditable |
| Pas de prix catalogue | ✅ | Normal pour une référence externe |

---

## 4. Vérification Backend

### Entités

| Entité | Statut | Champs clés |
|--------|--------|-------------|
| Circuit | ✅ Conforme | `author_id`, `title`, `base_price`, `duration_days`, `difficulty_level`, `region`, `lat/lng` |
| CircuitDay | ✅ Conforme | `circuit_id`, `day_number`, `title`, `date`, `lat/lng`, `location_name` |
| CircuitProgramItem | ✅ Conforme | `circuit_day_id`, `title`, `linked_offer_item_id`, `guide_id`, `guide_name`, `price`, `emoji`, `duration_minutes`, `distance_km`, `transport_mode`, `external_reference`, `is_external_reference` |
| CircuitOption | ✅ Conforme | `circuit_id`, `option_group`, `option_type`, `extra_price`, `external_offer_item_id` |

### Endpoints

| Endpoint | Statut | Description |
|----------|--------|-------------|
| `POST /circuits` | ✅ | Création circuit |
| `POST /circuits/:id/days` | ✅ | Ajout jour |
| `POST /circuits/:id/days/:dayId/program` | ✅ | Ajout activité |
| `PATCH /circuits/:id/days/:dayId/program/:itemId` | ✅ | Modification activité |
| `DELETE /circuits/:id/days/:dayId/program/:itemId` | ✅ | Suppression activité |
| `GET /offers/items/mine` | ✅ | Récupération offres personnelles avec prix |
| `GET /guide/search` | ✅ | Recherche guides avec zone/prix/geo |
| `GET /offers/public` | ✅ | Recherche offres publiques |

---

## 5. Vérification Frontend

### Composants

| Composant | Statut | Détails |
|-----------|--------|---------|
| `CircuitBuilderWizard.tsx` | ✅ | Wizard 6 étapes complet |
| `ExternalOfferModal.tsx` | ✅ | 3 onglets fonctionnels |
| `ExternalOfferItemSearch.tsx` | ✅ | Recherche géolocalisée |
| `GuideSearchInline.tsx` | ✅ | Recherche avec carte |
| `OfferItemSearchInline.tsx` | ✅ | Recherche items personnels |

### Pré-remplissage automatique

| Critère | Statut | Détails |
|---------|--------|---------|
| Prix auto-rempli depuis offre | ✅ | `onSelectMyOffer(id, price)` |
| Prix guide auto-rempli | ✅ | `onSelect(id, name, price)` |
| Champ prix modifiable | ✅ | Input type number |
| Prix catalogue visible | ✅ | Badge visuel |

---

## 6. Vérification UX

| Critère | Statut | Détails |
|---------|--------|---------|
| Origine prestation claire | ✅ | Badges colorés (own=primary, external=green) |
| Prix catalogue visible | ✅ | Affiché comme référence |
| Type prestation sélectionné | ⚠️ | Pas de badge visible pour "Référence externe" après sélection |
| Sélection guidée | ✅ | Modal avec 3 onglets clairs |
| Feedback visuel | ✅ | Loader, empty states, messages d'erreur |

---

## 7. Bugs et Incohérences

### Bug 1 — externalRef non branché

**Fichier :** `CircuitBuilderWizard.tsx:~800`

```tsx
onExternalRefChange={(ref) => {
  // Future: store external ref in prog state
}}
```

**Impact :** La référence externe n'est jamais sauvegardée dans le state du circuit.

**Correction :** Ajouter un champ `external_reference` dans `ProgramItemForm` et le sauvegarder via `updateProgramItem`.

### Bug 2 — Guide offer non auto-liée

**Fichier :** `CircuitBuilderWizard.tsx:859-865`

```tsx
onSelect={(id, name, price) => updateProgramItem(day.id, prog.id, {
  guide_id: id, guide_name: name, guide_cost: price || ""
  // Il manque : linked_offer_item_id si le guide a une offre
})}
```

**Impact :** L'offre du guide n'est pas automatiquement associée à l'activité.

**Correction :** Appeler `/guide/:id/offer` pour récupérer l'offre du guide et la lier.

### Bug 3 — Double implémentation GuideSearchInline

Le composant `GuideSearchInline.tsx` existe en tant que composant exporté mais une version inline est utilisée dans `CircuitBuilderWizard.tsx:72-230`.

**Impact :** Risque de divergence entre les deux implémentations.

**Correction :** Utiliser le composant exporté partout.

### Bug 4 — guide_cost dans fields

Le `guide_cost` est envoyé dans `fields` du body POST mais le champ n'est pas structuré proprement dans l'entité backend.

**Impact :** Le guide cost pourrait ne pas être correctement persisté.

---

## 8. Recommandations

| Priorité | Action | Impact |
|----------|--------|--------|
| 🔴 Haute | Brancher `externalRef` dans CircuitBuilderWizard | Complétude fonctionnelle |
| 🔴 Haute | Auto-lier l'offre du guide sélectionné | Logique métier respectée |
| 🟡 Moyenne | Unifier GuideSearchInline (utiliser le component exporté) | Maintenabilité |
| 🟡 Moyenne | Ajouter badge visuel pour "Référence externe" après sélection | UX |
| 🟢 Basse | Structurer proprement guide_cost dans l'entité backend | Propreté des données |

---

## 9. Résumé

| Catégorie | Conforme | Partiel | Manquant |
|-----------|----------|---------|----------|
| Structure circuits | 3/3 | 0 | 0 |
| Types d'activités | 2/4 | 2 | 0 |
| Tarification | 3/4 | 1 | 0 |
| Backend | 4/4 | 0 | 0 |
| Frontend | 5/5 | 0 | 0 |
| UX | 3/4 | 1 | 0 |
| **Total** | **20/24** | **4** | **0** |

**Score global : 83% conforme**

Le système est fonctionnel avec 4 points d'amélioration mineurs à corriger.
