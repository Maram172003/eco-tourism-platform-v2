# Logique Métier - Circuits Multi-Jours

## Structure Hiérarchique

```
Circuit
├── plusieurs Jours (CircuitDay)
│   └── plusieurs Activités (CircuitProgramItem)
└── Options (CircuitOption)
```

### Entities

| Entité | Relation | Description |
|--------|----------|-------------|
| `circuits` | 1 → N `circuit_days` | Circuit multi-jours avec titre, description, prix de base |
| `circuit_days` | N → 1 `circuits` + N → N `circuit_program_items` | Journée avec date, titre, localisation |
| `circuit_program_items` | N → 1 `circuit_days` | Activité avec lien `linked_offer_item_id` ou `guide_id` ou `external_reference` |
| `circuit_options` | N → 1 `circuits` | Options additionnelles (hébergement, transport, etc.) |

---

## Les 4 Types d'Activités

### Cas 1 — Ma propre offre (own)

**Composants :** `ExternalOfferModal` (onglet "Mes offres") + `OfferItemSearchInline`

- ✅ Les offres personnelles sont chargées via `/offers/items/mine`
- ✅ La sélection crée un lien avec `linked_offer_item_id`
- ✅ Les informations de l'offre (prix, description) sont récupérées
- ✅ Le prix catalogue est affiché comme référence

**Code :** `Circuits.tsx:789-802`

```tsx
{prog.linked_offer_item_id && offerItems.some((it) => it.id === prog.linked_offer_item_id) && (
  <div className="flex items-center gap-1.5 bg-primary/5 border border-primary/20 rounded-lg px-2 py-1.5">
    <span className="w-2 h-2 rounded-full bg-primary" />
    <span className="text-[11px] font-medium text-primary truncate max-w-[160px]">
      {offerItems.find((it) => it.id === prog.linked_offer_item_id)?.name}
    </span>
  </div>
)}
```

### Cas 2 — Offre d'un autre propriétaire (other)

**Composants :** `ExternalOfferModal` (onglet "Offres externes") + `ExternalOfferItemSearch`

- ✅ La recherche des offres publiques fonctionne via `/offers/public`
- ✅ Le filtrage géographique fonctionne (paramètres lat/lng)
- ✅ La sélection crée un lien avec `linked_offer_item_id` externe
- ✅ Les informations de l'offre sont récupérées (titre, prix)

**Code :** `ExternalOfferItemSearch.tsx`

```tsx
const res = await apiFetch<any[]>(`/offers/public?${params.toString()}`);
const filtered = Array.isArray(res) ? res.filter((o: any) =>
  o.title?.toLowerCase().includes(query.toLowerCase()) ||
  o.items?.some((it: any) => it.name?.toLowerCase().includes(query.toLowerCase()))
) : [];
```

### Cas 3 — Guide

**Composants :** `GuideSearchInline` (intégré dans `CircuitBuilderWizard.tsx:72-230`)

- ⚠️ La recherche fonctionne via `/guide/search`
- ⚠️ Filtre par zone et prix max disponible
- ⚠️ Le guide est lié via `guide_id` et `guide_name`
- ⚠️ Si le guide possède une offre, elle n'est pas auto-ligatée

**BUG IDENTIFIÉ :** L'offre du guide n'est pas automatiquement reliée à l'activité.

**Code :** `CircuitBuilderWizard.tsx:859-865`

```tsx
<GuideSearchInline
  onSelect={(id, name, price) => updateProgramItem(day.id, prog.id, { guide_id: id, guide_name: name, guide_cost: price || "" })}
  dayDate={day.date || undefined}
  dayLat={day.lat}
  dayLng={day.lng}
  dayLocation={day.location_name}
/>
```

### Cas 4 — Prestataire externe

**Composants :** `ExternalOfferModal` (onglet "Référence externe")

- ⚠️ Il est possible de saisir un prestataire externe
- ⚠️ Aucune offre n'est requise
- ⚠️ **BUG :** `onExternalRefChange` n'est pas correctement branché dans le wizard

**Code :** `ExternalOfferModal.tsx:176-180` (la callback est appelée mais pas stockée)

```tsx
onExternalRefChange({ ...(externalRef || {} as ExternalRef), 
  type: e.target.value as ExternalRef['type'] 
})
```

---

## Logique de Tarification

### Principe Général

- **Prix catalogue** : Valeur de référence dans l'offre (immuable depuis le circuit)
- **Prix circuit** : Copie indépendante, modifiable

### Cas 1 — Ma propre offre

- ✅ Le prix catalogue est récupéré automatiquement
- ✅ Le champ du prix dans le circuit est pré-rempli
- ✅ Le champ reste modifiable
- ✅ Le prix catalogue reste visible comme référence

**Code :** `CircuitBuilderWizard.tsx:884-888`

```tsx
{prog.linked_offer_item_id && offerItems.find((it) => it.id === prog.linked_offer_item_id)?.prices?.[0] && (
  <div className="text-[10px] text-emerald-600 bg-emerald-50 rounded-lg px-2 py-1.5 shrink-0">
    Offre à {Number(offerItems.find((it) => it.id === prog.linked_offer_item_id)!.prices![0].price).toLocaleString()} TND
  </div>
)}
```

### Cas 2 — Offre externe

- ✅ Le prix catalogue est récupéré automatiquement
- ✅ Le prix du circuit est pré-rempli
- ✅ Il reste modifiable

**Code :** `ExternalOfferModal.tsx:176-179`

```tsx
onSelect={(itemId, title, providerName, price) => {
  onSelectMyOffer(itemId, price);
  onClose();
}}
```

### Cas 3 — Guide

- ✅ Le prix de l'offre du guide est récupéré (via `guide_cost`)
- ⚠️ Le prix du circuit n'est pas pré-rempli depuis l'offre du guide

### Cas 4 — Prestataire externe

- ✅ Aucun prix n'est pré-rempli
- ✅ Les champs sont entièrement manuels

---

## Bugs Identifiés

### 1. externalRef non branché dans CircuitBuilderWizard

**Fichier :** `CircuitBuilderWizard.tsx:777-780`

```tsx
setExternalModalDayId(day.id);
setExternalModalProgId(prog.id);
// onExternalRefChange n'est jamais appelé
```

**Impact :** Les références externes ne sont jamais sauvegardées dans le state.

### 2. Guide offer auto-link manquant

**Fichier :** `CircuitBuilderWizard.tsx:860`

```tsx
onSelect={(id, name, price) => {
  // L'offre du guide (price) n'est pas liée à linked_offer_item_id
  updateProgramItem(day.id, prog.id, { guide_id: id, guide_name: name, guide_cost: price || "" })
}}
```

### 3. Double implémentation GuideSearchInline

Le composant `GuideSearchInline.tsx` existe en tant que composant exporté mais une version inline est utilisée dans `CircuitBuilderWizard.tsx:72-230`.

---

## Recommandations

1. **Priorité Haute :** Brancher `onExternalRefChange` dans le wizard pour sauvegarder la référence externe
2. **Priorité Haute :** Auto-ligaturer l'offre du guide sélectionné
3. **Priorité Moyenne :** Unifier les implémentations de `GuideSearchInline`
4. **Priorité Moyenne :** Ajouter des badges visuels pour indiquer le type de prestation
5. **Priorité Basse :** Intégrer le système de Provider Schema de Maram (12 catégories configurables)