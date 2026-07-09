# Sprint 5 — Amélioration Offres & Circuits

> **Version :** v2.2  
> **Date :** 3 juillet 2026  
> **Objectif :** Enrichir les offres (champs v2), ajouter les services externes dans les circuits, ajouter cover_image

---

## Résumé des 3 Phases

| Phase | Description | Backend | Frontend | DB |
|-------|-------------|---------|----------|----|
| **Phase 1** | Services externes dans circuits (hébergement, restauration, transport autres prestataires) | Endpoint public catégorie + exclude_author | CircuitOptionPicker avec recherche d'offres | Aucune |
| **Phase 2** | Nouveaux champs offre : deposit_percentage, production_delay_days, fulfillment_mode | Entity + DTO + Service | GuidedOfferWizard steps 4-5 | ALTER TABLE |
| **Phase 3** | cover_image sur les circuits | Entity + DTO + Service | TimelineView + cartes | ALTER TABLE |

---

## Phase 1 — Services Externes dans les Circuits

### Problème

Quand un **Project Owner** crée un circuit multi-jours, chaque jour peut inclure :
- Hébergement (dormir dans un hôtel, écolodge, etc.)
- Repas (restaurant, table d'hôtes)
- Transport (navette, taxi)
- Activités (gérées par un guide externe)

Si ces services appartiennent au **même Project Owner**, pas de problème. Mais si le PO veut réserver un **hôtel externe** ou un **restaurant tiers**, il faut pouvoir chercher dans le catalogue des AUTRES prestataires.

### Solution

La table `circuit_options` supporte déjà :
- `offer_item_id` (lien vers un OfferItem externe)
- `option_group` : `transport` | `accommodation` | `equipment` | `activity` | `food`
- `extra_price` (prix supplémentaire)

**Ce qui manquait :** La UI pour chercher et lier des offres externes.

### Backend

**Nouvel endpoint :** `GET /offers/public?category=accommodation&exclude_author={userId}`

```typescript
// offer.controller.ts
@Public()
@Get('public')
async findPublic(
  @Query('category') category?: string,
  @Query('exclude_author') excludeAuthor?: string,
  @Query('region') region?: string,
) {
  return this.service.findPublic(category, excludeAuthor, region);
}
```

**Nouvelle méthode service :** `findPublic(category, excludeAuthor, region)`

```typescript
async findPublic(category?: string, excludeAuthor?: string, region?: string): Promise<Offer[]> {
  const where: any = { status: 'approved' };
  if (category) where.offer_type = category;
  if (excludeAuthor) where.author_id = Not(excludeAuthor);
  if (region) where.region = region;
  return this.repo.find({
    where,
    relations: ['items', 'items.prices'],
    order: { created_at: 'DESC' },
  });
}
```

### Frontend

**Nouveau composant :** `ExternalOfferPicker` (intégré dans CircuitBuilderWizard step 5)

```typescript
// Intégré dans CircuitBuilderWizard
// Quand option_group = 'accommodation' ou 'food'
// Affiche un champ de recherche qui appelle GET /offers/public?category=accommodation
// Permet de sélectionner une offre et de lier offer_item_id à CircuitOption
```

**CircuitOption form enrichi :**
- Sélecteur de groupe (transport/accommodation/equipment/activity/food)
- Si accommodation ou food → afficher la recherche d'offres externes
- Champ `offer_item_id` lié à l'offre sélectionnée
- Prix pré-rempli depuis l'offre (éditable)
- Nom du prestataire affiché

### Flux utilisateur

```
1. PO crée un circuit de 3 jours
2. Étape Options → "Hébergement"
3. Clique "Chercher un hébergement externe"
4. Résultats : "Éco-Lodge Sahara - 120 TND/nuit" (offre d'un autre PO)
5. Sélectionne → lien offer_item_id créé
6. Voyageur réserve le circuit → peut voir l'hébergement et son prix
```

---

## Phase 2 — Nouveaux Champs Offre

### Champs ajoutés

| Champ | Type | Default | Description |
|-------|------|---------|-------------|
| `deposit_percentage` | int nullable | 0 | Acompte requis (0-100%) |
| `production_delay_days` | int nullable | null | Délai de préparation (artisanat) |
| `fulfillment_mode` | varchar nullable | null | `instant_stock`, `scheduled`, `recurring`, `on_request` |

### Backend

**Entity (`offer.entity.ts`) :**
```typescript
@Column({ type: 'int', nullable: true, default: 0 })
deposit_percentage!: number | null;

@Column({ type: 'int', nullable: true })
production_delay_days!: number | null;

@Column({ type: 'varchar', nullable: true })
fulfillment_mode!: string | null;
```

**Migration SQL :**
```sql
ALTER TABLE offers ADD COLUMN deposit_percentage INTEGER DEFAULT 0;
ALTER TABLE offers ADD COLUMN production_delay_days INTEGER;
ALTER TABLE offers ADD COLUMN fulfillment_mode VARCHAR;
```

**DTOs (`offer.dto.ts`) :**
- `CreateOfferDto` : + `deposit_percentage`, `production_delay_days`, `fulfillment_mode`
- `UpdateOfferDto` : + `deposit_percentage`, `production_delay_days`, `fulfillment_mode`

### Frontend

**GuidedOfferWizard :**
- Step 4 (Tarifs) : Ajouter `deposit_percentage` (slider ou input 0-100%)
- Step 6 (Capacité) : Ajouter `production_delay_days` (si catégorie artisanat)
- Step 6 (Capacité) : Ajouter `fulfillment_mode` (select)

---

## Phase 3 — cover_image sur les Circuits

### Problème

Les circuits ont un champ `images` (array, multiple URLs). Mais les cartes des circuits (page liste, home) n'ont pas d'image principale dédiée.

### Solution

Ajouter un champ `cover_image` (1 URL) pour l'image principale des cartes.

### Backend

**Entity (`circuit.entity.ts`) :**
```typescript
@Column({ type: 'varchar', nullable: true })
cover_image!: string | null;
```

**Migration SQL :**
```sql
ALTER TABLE circuits ADD COLUMN cover_image VARCHAR;
```

**DTOs :**
- `CreateCircuitDto` : + `cover_image`
- `UpdateCircuitDto` : + `cover_image`

**Service (`circuit.service.ts`) :**
- `create()` : handle `cover_image`
- `update()` : handle `cover_image`

### Frontend

**TimelineView.tsx :**
```typescript
// Afficher cover_image comme image principale
const mainImage = circuit.cover_image || circuit.images?.[0] || '/placeholder.svg';
```

**Circuit card (page liste circuits) :**
```typescript
// Utiliser cover_image en priorité
<img src={circuit.cover_image || circuit.images?.[0] || '/placeholder.svg'} />
```

---

## Fichiers modifiés

### Backend
| Fichier | Changement |
|---------|-----------|
| `src/offer/entities/offer.entity.ts` | + deposit_percentage, production_delay_days, fulfillment_mode |
| `src/offer/dto/offer.dto.ts` | + 3 nouveaux champs dans Create + Update DTO |
| `src/offer/offer.service.ts` | + findPublic(), handle new fields in create/update |
| `src/offer/offer.controller.ts` | + GET /offers/public endpoint |
| `src/circuit/entities/circuit.entity.ts` | + cover_image |
| `src/circuit/dto/create-circuit.dto.ts` | + cover_image |
| `src/circuit/dto/update-circuit.dto.ts` | + cover_image |
| `src/circuit/circuit.service.ts` | + handle cover_image in create/update |

### Frontend
| Fichier | Changement |
|---------|-----------|
| `components/CircuitBuilderWizard.tsx` | + ExternalOfferPicker, option offer_item_id |
| `components/GuidedOfferWizard.tsx` | + deposit_percentage, production_delay_days, fulfillment_mode |
| `components/TimelineView.tsx` | + cover_image as main image |
| `app/circuits/[id]/page.tsx` | + cover_image in header |

### DB Migration
| Fichier | Changement |
|---------|-----------|
| `scripts/migration.sql` | ALTER TABLE offers + circuits |

---

## Tests

```bash
# Backend typecheck
cd backend && npx tsc --noEmit

# Frontend typecheck
cd frontend && npx tsc --noEmit

# Seed data
docker exec -i tourisme-db-1 psql -U marammejri -d tourism_db < scripts/migration.sql

# Verify endpoints
curl http://localhost:3001/api/offers/public?category=accommodation
curl http://localhost:3001/api/circuits
```
