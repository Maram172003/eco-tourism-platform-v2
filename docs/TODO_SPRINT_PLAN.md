# Plan d'Action & Sprints — Éco-Voyage (v3 — 10/10)

**Date :** 2026-07-05
**Version :** 3.0 — Roadmap officielle
**Basé sur :** Audit DDD, Audit Circuits/Activités/Tarification, Review binôme v2

---

## Principes directeurs

1. **Séparer bugs / architecture / fonctionnalités / tests**
2. **Soft Delete > SET NULL** — préserver l'historique des réservations
3. **Pas d'optimisation premature** — locking, price_history, analytics viendront plus tard
4. **Maram = source d'inspiration** — récupérer constantes, validations, pas le modèle d'architecture
5. **Le guide vend sa DISPONIBILITÉ, pas une offre** — distinction fondamentale
6. **Vérifier la chaîne catalogue** avant d'ajouter des fonctionnalités
7. **Tests métier de bout en bout** avant la mise en production

---

## 🧠 Le modèle guide : disponibilité ≠ offre

**Point critique :** Un guide ne vend pas un "produit" stockable. Il vend des **créneaux horaires** (disponibilités). C'est un modèle fondamentalement différent du `Offer → OfferItem → Price`.

```
Guide
  └── GuideOffering (prestation de guidage)
        ├── title, description, price, pricing_unit
        ├── zone (point/radius/governorate/all_tunisia)
        ├── languages[], displacement_allowed
        │
        ├── GuideOfferingAvailabilityRule  ← QUAND je suis disponible
        │   ├── availability_type: 'weekly' | 'date_range' | 'on_demand' | 'specific'
        │   ├── weekdays[] (si weekly)
        │   ├── start_date / end_date (si date_range)
        │   └── start_time / end_time
        │
        ├── GuideOfferingSession           ← CRÉNEAUX générés
        │   ├── date, start_time, end_time
        │   ├── total_capacity / remaining_capacity
        │   ├── price_override (prix saisonnier)
        │   └── status: 'available' | 'full' | 'cancelled'
        │
        ├── GuideOfferingBlock             ← BLOQUAGES
        │   ├── start_date / end_date
        │   └── reason (vacances, indisponible)
        │
        └── GuideOfferingPrice             ← TARIFS
            ├── label (1 personne, 2 personnes, groupe)
            └── price
```

**Contrairement au project_owner :**

- `ProjectOwner → Offer → OfferItem → Price → Session → Capacity` = **inventaire stockable**
- `Guide → GuideOffering → AvailabilityRule → Session → Block` = **temps disponible**

---

## Vue d'ensemble

| Sprint | Thème | Type | Durée | Priorité |
|--------|-------|------|-------|----------|
| **1** | Data Integrity & Sécurité | 🐛 Bugs | 3j | 🔴 Critique |
| **2** | Audit Métier Catalogue | 🔍 Audit | 3j | 🔴 Haute |
| **3** | Circuits — Fix bugs métier | 🐛 Bugs | 2j | 🔴 Haute |
| **4** | Réservation Booking classique | 🔧 Architecture | 2j | 🟡 Moyenne |
| **5** | Réservation Circuit | 🔧 Architecture | 2j | 🟡 Moyenne |
| **6** | DDD — Lifecycle & Invariants | 🔧 Architecture | 2j | 🟡 Moyenne |
| **7** | Workflow Admin & Modération | ✨ Fonctionnalités | 2j | 🟡 Moyenne |
| **8** | Moteur de Configuration | ✨ Fonctionnalités | 2j | 🟡 Moyenne |
| **9** | Search Engine & Explorer | ✨ Fonctionnalités | 3j | 🟢 Basse |
| **10** | API & Performance | ⚡ Optimisation | 2j | 🟢 Basse |
| **11** | Tests Métier Bout en Bout | 🧪 Tests | 3j | 🔴 Haute |
| **12** | Documentation Finale | 📄 Docs | 1j | 🟢 Basse |

---

## Sprint 1 — Data Integrity & Sécurité 🐛

> **Objectif :** Éviter les données orphelines, les surréservations et les UUID dangling.
> **Type :** Corrections de bugs critiques.

### Task 1.1 : Soft Delete sur Offer

**Fichiers :** `offer.entity.ts`, `offer.service.ts`, `offer.controller.ts`

**Problème :** Supprimer une offre avec SET NULL sur le Booking perd l'historique de réservation. Une réservation = un historique métier qu'il faut préserver.

**Solution :** Soft delete (is_deleted + deleted_at) + interdire la suppression physique si réservations actives.

```typescript
// offer.entity.ts
@Column({ type: 'boolean', default: false })
is_deleted!: boolean;

@Column({ type: 'timestamp', nullable: true })
deleted_at!: Date | null;
```

```typescript
// offer.service.ts
async remove(authorId: string, offerId: string) {
  const offer = await this.findOne(offerId);
  if (offer.author_id !== authorId) throw new ForbiddenException();

  const activeBookings = await this.bookingRepo.count({
    where: { offer: { id: offerId }, status: Not('cancelled') }
  });
  if (activeBookings > 0) {
    throw new BadRequestException(
      `${activeBookings} réservation(s) active(s). Utilisez l'archivage.`
    );
  }

  offer.is_deleted = true;
  offer.deleted_at = new Date();
  await this.offerRepo.save(offer);
}
```

**Status :** ✅ Terminé

---

### Task 1.2 : Options Archive / Désactiver / Voir circuits liés

**Fichiers :** `offer.controller.ts`, `offer.service.ts`, dashboard page

```typescript
// offer.controller.ts
@Patch(':id/archive')
async archive(@Param('id') id: string) { return this.offerService.archive(id); }

@Patch(':id/deactivate')
async deactivate(@Param('id') id: string) { return this.offerService.deactivate(id); }

@Get(':id/linked-circuits')
async getLinkedCircuits(@Param('id') id: string) { return this.offerService.findLinkedCircuits(id); }
```

**Frontend — Modal de remplacement du bouton "Supprimer" :**

```
┌──────────────────────────────────────────┐
│  Que souhaitez-vous faire ?              │
│                                          │
│  📦 Archiver                             │
│     Masquer sans supprimer.              │
│     Les réservations restent intactes.   │
│                                          │
│  ⏸️  Désactiver                          │
│     Masquer temporairement.              │
│     Réactivable à tout moment.           │
│                                          │
│  🔗 Voir les circuits concernés          │
│     X circuit(s) utilisent cette offre.  │
│                                          │
│  ❌ Supprimer                            │
│     Impossible si réservations actives.  │
└──────────────────────────────────────────┘
```

**Status :** ✅ Terminé

---

### Task 1.3 : Gestion capacité dans CircuitReservation

**Fichier :** `circuit.service.ts`

**Problème :** CircuitReservation ne décrémente PAS remaining_capacity → surréservation.

```typescript
// circuit.service.ts — reserveCircuit()
async reserveCircuit(circuitId: string, dto: CreateCircuitReservationDto) {
  const circuit = await this.findOne(circuitId);

  for (const day of circuit.days ?? []) {
    for (const prog of day.programItems ?? []) {
      if (prog.linked_offer_item_id) {
        const session = await this.findSessionForDate(prog.linked_offer_item_id, dto.date);
        if (session?.remaining_capacity !== null) {
          if (session.remaining_capacity < dto.participants_count) {
            throw new BadRequestException(
              `Capacité insuffisante pour "${prog.title}" : ${session.remaining_capacity} place(s)`
            );
          }
          session.remaining_capacity -= dto.participants_count;
          if (session.remaining_capacity <= 0) session.status = 'full';
          await this.sessionRepo.save(session);
        }
      }
    }
  }
  // ... créer la réservation
}
```

**Status :** ✅ Terminé

---

### Task 1.4 : Restaurer capacité à l'annulation

**Fichier :** `circuit.service.ts`

```typescript
async cancelCircuitReservation(reservationId: string) {
  const reservation = await this.circuitReservationRepo.findOne({
    where: { id: reservationId },
    relations: ['circuit', 'circuit.days', 'circuit.days.programItems']
  });

  for (const day of reservation.circuit.days ?? []) {
    for (const prog of day.programItems ?? []) {
      if (prog.linked_offer_item_id) {
        const session = await this.findSessionForDate(prog.linked_offer_item_id, reservation.date);
        if (session) {
          session.remaining_capacity += reservation.participants_count;
          if (session.status === 'full') session.status = 'active';
          await this.sessionRepo.save(session);
        }
      }
    }
  }
  reservation.status = 'cancelled';
  await this.circuitReservationRepo.save(reservation);
}
```

**Status :** ✅ Terminé

---

### Task 1.5 : Valider linked_offer_item_id à la création

**Fichier :** `circuit.service.ts`

```typescript
async addItem(circuitId: string, dayId: string, dto: CreateProgramItemDto, authorId: string) {
  const circuit = await this.findOne(circuitId);
  if (circuit.author_id !== authorId) throw new ForbiddenException('Circuit non autorisé');

  const day = circuit.days?.find(d => d.id === dayId);
  if (!day) throw new NotFoundException('Jour non trouvé');

  if (dto.linked_offer_item_id) {
    const item = await this.offerItemRepo.findOne({ where: { id: dto.linked_offer_item_id } });
    if (!item) throw new NotFoundException('OfferItem référencé introuvable');
  }
  // ... créer l'activité
}
```

**Status :** ✅ Terminé

---

## Sprint 2 — Audit Métier Catalogue 🔍

> **Objectif :** Vérifier la chaîne complète Offer → OfferItem → Price → Session → Capacity → Availability → Booking avec la logique métier, pas seulement technique.
> **Type :** Audit fonctionnel + tests manuels.

### Task 2.1 : Audit — Création d'offre par rôle

| Scénario | Rôle | Vérification |
|----------|------|-------------|
| Créer une offre hébergement | project_owner | L'offre est liée au bon projet ? project_id correct ? |
| Créer une offre activité | project_owner | project_type du projet correspond-il à la catégorie d'offre ? |
| Créer une prestation guide | guide | guide_id automatique ? Pas de project_id ? |
| Modifier une offre existante | owner | Tous les champs modifiables ? Les items sont bien mis à jour ? |

**Status :** ✅ Terminé

---

### Task 2.2 : Audit — Chaîne OfferItem → Price → Session → Capacity

| Étape | Vérification |
|-------|-------------|
| Créer un OfferItem | item_type, details_json persistés ? |
| Ajouter un prix | price, pricing_unit, is_default ? Deux prix possibles ? |
| Ajouter une session | date, start_time, end_time ? Capacité créée automatiquement ? |
| Ajouter une capacité | remaining_quantity = total ? Décrémenté à la réservation ? |
| Récupérer via API | `GET /offers/items/mine` retourne les prix ? `GET /offers/public` filtre correctement ? |

**Status :** ✅ Terminé

---

### Task 2.3 : Audit — Les 4 types d'activités dans un circuit

| Type | Vérification |
|------|-------------|
| **own** | Sélection "Mes offres" → prix catalogue récupéré ? linked_offer_item_id = mon item ? Prix modifiable ? |
| **other** | Sélection "Offres externes" → prix catalogue de l'autre propriétaire ? linked_offer_item_id = item tiers ? |
| **guide** | Sélection guide → guide_id lié ? guide_cost récupéré ? Offre du guide auto-liée ? |
| **external** | Référence externe → external_reference JSONB sauvegardé ? Aucune offre requise ? |

**Status :** ✅ Terminé

---

### Task 2.4 : Audit — Prix du circuit indépendant du catalogue

| Scénario | Résultat attendu |
|----------|-----------------|
| Offre à 50 TND → Circuit copie 50 TND | ✅ Prix circuit = copie indépendante |
| Modifier prix offre à 75 TND | Le prix du circuit reste 50 TND |
| Badge "Offre à 75 TND" affiche le prix actuel | ✅ Le badge montre le prix catalogue ACTUEL |
| Prix circuit modifiable manuellement | ✅ Le champ reste éditable |

**Status :** ✅ Terminé

---

### Task 2.5 : Audit — Disponibilité guide vs offre

| Concept | Guide | Project Owner |
|---------|-------|---------------|
| **Ce qui est vendu** | Temps disponible (créneaux) | Produit stockable (chambre, plat, activité) |
| **Disponibilité** | `GuideOfferingAvailabilityRule` (weekly, date_range, on_demand, specific) | `OfferItemAvailabilityRule` (similar) |
| **Sessions** | `GuideOfferingSession` (date, start_time, end_time, capacity) | `OfferItemSession` (date, start_time, end_time) |
| **Blocages** | `GuideOfferingBlock` (date range + reason) | Pas de blocage (utiliser availability rules) |
| **Capacité** | `remaining_capacity` sur la session | `remaining_capacity` sur la session OU `remaining_quantity` sur l'item |

**Vérification :** Quand un guide est sélectionné dans un circuit, est-ce que le wizard cherche dans `GuideOfferingSession` (pas dans `OfferItemSession`) ?

**Status :** ✅ Terminé

---

## Sprint 3 — Circuits — Fix bugs métier 🐛

> **Objectif :** Corriger les bugs identifiés dans l'audit circuits/activités/tarification.

### Task 3.1 : Brancher externalRef dans CircuitBuilderWizard

**Fichier :** `CircuitBuilderWizard.tsx`

```typescript
// Ajouter dans ProgramItemForm :
external_reference: Record<string, any> | null;
is_external_reference: boolean;

// Dans le callback :
onExternalRefChange={(ref) => {
  if (externalModalDayId && externalModalProgId) {
    updateProgramItem(externalModalDayId, externalModalProgId, {
      external_reference: ref,
      is_external_reference: !!ref,
    });
  }
}}
```

**Status :** ✅ Terminé

---

### Task 3.2 : Auto-lien offre du guide

**Fichier :** `CircuitBuilderWizard.tsx`

```typescript
onSelect={async (id, name, price) => {
  // Récupérer la prestation du guide
  const guideOffering = await apiFetch(`/guide/${id}/offering`).catch(() => null);
  updateProgramItem(day.id, prog.id, {
    guide_id: id,
    guide_name: name,
    guide_cost: price || "",
    linked_offer_item_id: guideOffering?.offer_item_id ?? null,
  });
}}
```

**Status :** ✅ Terminé

---

### Task 3.3 : Structurer guide_cost dans l'entité backend

**Fichier :** `circuit-program-item.entity.ts`

```typescript
@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
guide_cost!: number | null;
```

**Status :** ✅ Terminé

---

### Task 3.4 : Unifier GuideSearchInline

**Fichier :** `CircuitBuilderWizard.tsx`

Remplacer la version inline (lignes 72-230) par le composant exporté `GuideSearchInline`.

**Status :** ✅ Terminé

---

### Task 3.5 : Badge visuel pour "Référence externe"

**Fichier :** `CircuitBuilderWizard.tsx`

```tsx
{prog.is_external_reference && prog.external_reference && (
  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
    <span className="w-2 h-2 rounded-full bg-amber-500" />
    <span className="text-[11px] font-medium text-amber-700 truncate max-w-[160px]">
      {prog.external_reference.provider_name || "Référence externe"}
    </span>
  </div>
)}
```

**Status :** ✅ Terminé

---

## Sprint 4 — Réservation Booking classique 🔧

> **Objectif :** Compléter le cycle de vie des réservations classiques (Offer → Booking).
> **Type :** Architecture métier.

### Task 4.1 : État `expired` pour Booking

**Fichier :** `booking.service.ts`

```typescript
async checkExpiredBookings() {
  const expired = await this.bookingRepo.find({
    where: {
      status: 'pending',
      created_at: LessThan(new Date(Date.now() - 48 * 60 * 60 * 1000)),
    },
  });
  for (const booking of expired) {
    booking.status = 'expired';
    await this.bookingRepo.save(booking);
    await this.restoreCapacity(booking);
  }
}
```

**Status :** ✅ Terminé

---

### Task 4.2 : Transition `confirmed → completed` automatique

**Fichier :** `booking.service.ts`

```typescript
async finalizeCompletedBookings() {
  const completed = await this.bookingRepo.find({
    where: { status: 'confirmed' },
    relations: ['session']
  });
  for (const booking of completed) {
    if (booking.session && new Date(booking.session.date) < new Date()) {
      booking.status = 'completed';
      await this.bookingRepo.save(booking);
    }
  }
}
```

**Status :** ✅ Terminé

---

### Task 4.3 : Vérifier annulation avec délai

**Fichier :** `booking.service.ts`

```typescript
async cancel(bookingId: string, userId: string) {
  const booking = await this.findOne(bookingId);
  const daysUntilSession = differenceInDays(new Date(booking.session.date), new Date());
  if (daysUntilSession < booking.cancellation_deadline_days) {
    throw new BadRequestException(
      `Délai d'annulation dépassé. Annulation possible jusqu'à ${booking.cancellation_deadline_days} jours avant.`
    );
  }
  // ... annuler et restaurer capacité
}
```

**Status :** ✅ Terminé

---

### Task 4.4 : Vérifier double réservation

**Fichier :** `booking.service.ts`

```typescript
const existing = await this.bookingRepo.findOne({
  where: { traveler_id: userId, session_id: dto.session_id, status: Not('cancelled') }
});
if (existing) throw new BadRequestException('Vous avez déjà réservé cette session');
```

**Status :** ✅ Terminé

---

## Sprint 5 — Réservation Circuit 🔧

> **Objectif :** Vérifier le workflow CircuitReservation de bout en bout.
> **Type :** Architecture métier — séparé du Booking classique car c'est un Aggregate Root différent.

### Task 5.1 : Vérifier la création de CircuitReservation

| Étape | Vérification |
|-------|-------------|
| Créer une réservation | Circuit existant ? Dates valides ? |
| Vérifier capacité | Chaque activité liée a assez de places ? |
| Décrémenter capacité | remaining_capacity -= participants_count ? |
| Calculer le prix | Prix circuit × participants + options ? |
| Créer les bookings sous-jacents | Un Booking par activité liée ? |

**Status :** ✅ Terminé

---

### Task 5.2 : Vérifier l'annulation de CircuitReservation

| Étape | Vérification |
|-------|-------------|
| Annuler | Capacité restaurée pour chaque activité ? |
| Annuler les bookings liés | Chaque Booking sous-jacent est annulé ? |
| Notifications | Le guide est notifié ? Le propriétaire est notifié ? |

**Status :** ✅ Terminé

---

### Task 5.3 : Vérifier les notifications Circuit

| Événement | Notification |
|-----------|-------------|
| Nouvelle réservation circuit | Propriétaire notifié + guides concernés notifiés |
| Annulation circuit | Guides + propriétaires notifiés |
| Modification circuit | Participants notifiés ? |

**Status :** ✅ Terminé

---

### Task 5.4 : Vérifier CircuitReservation vs Booking

| Critère | CircuitReservation | Booking classique |
|---------|-------------------|-------------------|
| Aggregate Root | Circuit | Offer |
| Capacité | Décrémentée via linked_offer_item_id | Décrémentée via session |
| Prix | Prix circuit (copie indépendante) | Prix catalogue (calcul serveur) |
| Annulation | Restaure capacité + annule bookings | Restaure capacité session |
| Notifications | Guides + propriétaires | Propriétaire uniquement |

**Status :** ✅ Terminé

---

## Sprint 6 — DDD — Lifecycle & Invariants 🔧

> **Objectif :** Documenter et implémenter les Aggregate Roots, lifecycle et invariants.

### Task 6.1 : Lifecycle Offer

```
draft → pending → approved → inactive → archived
                ↘ rejected
```

| Transition | Guard | Action |
|-----------|-------|--------|
| draft → pending | Wizard soumis | Envoyer pour validation |
| pending → approved | Admin ou Ambassadeur | Visible publiquement |
| pending → rejected | Admin avec raison | Notifier l'auteur |
| approved → inactive | Owner | Masquer temporairement |
| approved → archived | Owner | Masquer définitivement |
| inactive → approved | Owner | Réactiver |

```typescript
// offer.entity.ts
@Column({ default: 'draft' })
status!: string;
```

**Status :** ✅ Terminé

---

### Task 6.2 : Lifecycle Circuit

```
draft → pending → approved → archived
                ↘ rejected
```

**Status :** ✅ Terminé

---

### Task 6.3 : Lifecycle Booking

```
pending → confirmed → completed
pending → expired
confirmed → cancelled
pending → cancelled
```

**Status :** ✅ Terminé

---

### Task 6.4 : Lifecycle GuideOffering

```
pending → active → archived
pending → rejected
active → inactive
```

**Status :** ✅ Terminé

---

### Task 6.5 : Documenter les invariants

**Fichier :** `docs/AUDIT_DDD_CIRCUITS.md`

| Invariant | Règle | Priorité |
|-----------|-------|----------|
| Offre supprimée → Circuit intact | Soft delete ou interdire | 🔴 |
| CircuitReservation → Capacité OfferItem | Décrémenter/Restaurer | 🔴 |
| CircuitProgramItem → OfferItem existe | Vérifier à la création | 🔴 |
| Offer modifiée → Prix circuit préservé | Prix = copie indépendante | 🟡 |
| Guide indisponible → Circuit affected | Vérifier disponibilité | 🟡 |
| Session expirée → Booking finalized | Transition auto | 🟢 |

**Status :** ✅ Terminé

---

## Sprint 7 — Workflow Admin & Modération ✨

> **Objectif :** Implémenter le workflow de modération (validation, rejet, archivage).

### Task 7.1 : Page Admin — Liste des offres à valider

```
GET /api/admin/offers?status=pending&page=1&limit=20
```

Afficher : titre, auteur, catégorie, date de soumission, boutons Approuver/Rejeter.

**Status :** ✅ Terminé

---

### Task 7.2 : Validation / Rejet avec commentaire

```
PATCH /api/admin/offers/:id/approve
PATCH /api/admin/offers/:id/reject  { reason: "..." }
```

Notifier l'auteur par email + notification in-app.

**Status :** ✅ Terminé

---

### Task 7.3 : Validation Ambassadeur (auto-approve)

Si l'auteur est Ambassadeur (score ≥ 80), l'offre est automatiquement approuvée.

```typescript
// offer.service.ts
if (author.eco_score >= 80) {
  offer.status = 'approved';
} else {
  offer.status = 'pending';
}
```

**Status :** ✅ Terminé

---

### Task 7.4 : Historique de modération

```typescript
@Entity('moderation_logs')
export class ModerationLog {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column('uuid') entity_id!: string;
  @Column() entity_type!: string; // 'offer' | 'circuit' | 'guide_offering'
  @Column() action!: string; // 'approved' | 'rejected' | 'archived'
  @Column({ type: 'text', nullable: true }) reason!: string | null;
  @Column('uuid') moderator_id!: string;
  @CreateDateColumn() created_at!: Date;
}
```

**Status :** ✅ Terminé

---

## Sprint 8 — Moteur de Configuration ✨

> **Objectif :** Améliorer le système de schemas avec des constantes partagées, validations croisées et types dynamiques.
> **Inspiré de Maram, adapté à notre architecture.**

### Task 8.1 : Créer shared-configs.ts

**Fichier :** `frontend/lib/shared-configs.ts` (nouveau)

```typescript
export const LANGS = [
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'Arabe' },
  { value: 'en', label: 'Anglais' },
  { value: 'de', label: 'Allemand' },
  { value: 'it', label: 'Italien' },
  { value: 'es', label: 'Espagnol' },
];

export const SAISONS = [
  { value: 'printemps', label: 'Printemps' },
  { value: 'ete', label: 'Été' },
  { value: 'automne', label: 'Automne' },
  { value: 'hiver', label: 'Hiver' },
];

export const REGIMES = [
  { value: 'vegetarien', label: 'Végétarien' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'halal', label: 'Halal' },
  { value: 'sans_gluten', label: 'Sans gluten' },
  { value: 'sans_lactose', label: 'Sans lactose' },
];

export const NIVEAUX = [
  { value: 'facile', label: 'Facile' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'difficile', label: 'Difficile' },
  { value: 'expert', label: 'Expert' },
];

export const DUREES = [
  { value: '30min', label: '30 minutes' },
  { value: '1h', label: '1 heure' },
  { value: '2h', label: '2 heures' },
  { value: 'demi_journee', label: 'Demi-journée' },
  { value: 'journee', label: 'Journée complète' },
  { value: '2jours', label: '2 jours' },
  { value: '3jours', label: '3 jours' },
  { value: 'semaine', label: '1 semaine' },
];
```

**Status :** ✅ Terminé

---

### Task 8.2 : Ajouter CrossValidationRule

**Fichier :** `frontend/lib/offer-schema.ts`

```typescript
export interface CrossValidationRule {
  field: string;
  rule: 'lte' | 'gte' | 'in' | 'subset' | 'coherent' | 'requiredIfTrue' | 'requiredIfFalse';
  onboardingKey: string;
  message: string;
}
```

**Status :** ✅ Terminé

---

### Task 8.3 : Ajouter types `repeater` et `dynamicOptions`

**Fichier :** `frontend/lib/offer-schema.ts`

```typescript
export interface SchemaField {
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'time' | 'file' | 'textarea' | 'hierarchy' | 'repeater';
  dynamicOptions?: { endpoint: string; labelField: string; valueField: string };
  repeaterConfig?: { addLabel: string; fields: string[]; minItems?: number; maxItems?: number };
}
```

**Status :** ✅ Terminé

---

### Task 8.4 : Mettre à jour les schemas avec shared constants

**Fichier :** `frontend/lib/offer-schema.ts`

Remplacer les options hardcodées par les constantes importées.

**Status :** ✅ Terminé

---

## Sprint 9 — Search Engine & Explorer ✨

> **Objectif :** Améliorer la recherche et la page Explorer (vitriene de la plateforme).

### Task 9.1 : Audit de la recherche multi-entités

| Recherche | Endpoint actuel | Amélioration |
|-----------|----------------|-------------|
| Offres | `GET /offers/public` | Filtres avancés (prix, catégorie, disponibilité) |
| Guides | `GET /guide/search` | Recherche par disponibilité + zone + langue |
| Circuits | `GET /circuits` | Filtres (région, durée, difficulté, prix) |
| Projets | `GET /projects` | Recherche par type, région |

**Status :** ✅ Terminé

---

### Task 9.2 : Page Explorer — Améliorations

| Composant | Amélioration |
|-----------|-------------|
| Carte | Clustering marqueurs, couches toggle (offres/guides/circuits) |
| Filtres | Prix, catégorie, disponibilité date, distance |
| Pagination | Scroll infini ou pagination classique |
| Favoris | Bouton favori sur chaque carte |
| Tri | Pertinence, prix, distance, note |

**Status :** ✅ Terminé

---

### Task 9.3 : Recherche de disponibilité guide

```typescript
// guide-search.service.ts
async searchAvailableGuides(date: Date, zone: string) {
  return this.guideRepo
    .createQueryBuilder('g')
    .innerJoin('g.offerings', 'o')
    .innerJoin('o.sessions', 's', 's.date = :date AND s.status = :status', {
      date, status: 'available'
    })
    .where('s.remaining_capacity > 0')
    .andWhere('LOWER(g.zone) LIKE :zone', { zone: `%${zone}%` })
    .getMany();
}
```

**Status :** ✅ Terminé

---

### Task 9.4 : Recherche d'hébergement dans le Circuit Builder

Vérifier que la recherche d'hébergement dans Step 5 du wizard fonctionne :

1. Mes offres (propre) → `GET /offers/items/mine?item_type=room`
2. Autre propriétaire → `GET /offers/public?region=X&category=hebergement`
3. Référence externe → formulaire manuel

**Status :** ✅ Terminé

---

### Task 9.5 : Tests de recherche combinée

Vérifier que les combinaisons de filtres et la recherche multi-entités fonctionnent correctement.

**Status :** ✅ Terminé

---

## Sprint 10 — API & Performance ⚡

> **Objectif :** Vérifier la qualité API avant la mise en production.

### Task 10.1 : Pagination sur tous les endpoints liste

```
GET /offers?page=1&limit=20     → { data, total, page, limit, totalPages }
GET /circuits?page=1&limit=20
GET /guide/search?page=1&limit=20
GET /bookings/mine?page=1&limit=20
```

**Status :** ✅ Terminé

---

### Task 10.2 : Index SQL

```sql
CREATE INDEX IF NOT EXISTS idx_offers_author ON offers(author_id);
CREATE INDEX IF NOT EXISTS idx_offers_region ON offers(region);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offer_items_offer ON offer_items(offer_id);
CREATE INDEX IF NOT EXISTS idx_circuits_author ON circuits(author_id);
CREATE INDEX IF NOT EXISTS idx_bookings_traveler ON bookings(traveler_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_guide_sessions_date ON guide_offering_sessions(date);
```

**Status :** ✅ Terminé

---

### Task 10.3 : Vérifier les N+1 Queries

Vérifier dans `offer.service.ts`, `circuit.service.ts`, `booking.service.ts` :

```typescript
// ❌ N+1
for (const item of items) {
  const prices = await this.priceRepo.find({ where: { offer_item_id: item.id } });
}

// ✅ Correct
const items = await this.offerItemRepo.find({
  relations: ['prices', 'sessions', 'capacity'],
  where: { offer_id: offerId }
});
```

**Status :** ✅ Terminé

---

### Task 10.4 : Vérifier l'eager loading

Vérifier pas de `eagle: true` sur les relations non nécessaires.

**Status :** ✅ Terminé

---

### Task 10.5 : Filtres et recherche

Vérifier que les combinaisons de filtres fonctionnent :

```
GET /offers/public?region=Djerba&category=hebergement&min_price=50&max_price=200
GET /circuits?region=Sahara&difficulty=modere&duration_min=2&duration_max=5
GET /guide/search?q=randonnee&zone=Djerba&max_price=200&date=2026-07-15
```

**Status :** ✅ Terminé

---

## Sprint 11 — Tests Métier Bout en Bout 🧪

> **Objectif :** Valider tous les scénarios métier avant la mise en production.
> **Type :** Tests manuels documentés + scripts de validation.

### Task 11.1 : Scénarios — Création d'offre

| # | Scénario | Résultat attendu |
|---|----------|-----------------|
| 1 | Project owner crée offre hébergement | Offer créée avec project_id, status=draft |
| 2 | Guide crée prestation randonnée | GuideOffering créée avec guide_id, availability rules |
| 3 | Propriétaire modifie prix offre | Prix mis à jour, circuits existants inchangés |
| 4 | Propriétaire ajoute OfferItem + Price | Item créé, prix visible dans le catalogue |
| 5 | Propriétaire ajoute Session + Capacity | Session créée, capacité décrémentable |

**Status :** ✅ Terminé

---

### Task 11.2 : Scénarios — Réservation

| # | Scénario | Résultat attendu |
|---|----------|-----------------|
| 1 | Réservation simple (1 personne) | Booking créé, capacité décrémentée, notification envoyée |
| 2 | Réservation circuit (3 personnes) | CircuitReservation créée, capacité décrémentée pour chaque activité |
| 3 | Réservation session complète | Erreur "Capacité insuffisante" |
| 4 | Annulation avant délai | Capacité restaurée, notifications envoyées |
| 5 | Annulation après délai | Erreur "Délai d'annulation dépassé" |
| 6 | Double réservation même session | Erreur "Vous avez déjà réservé" |
| 7 | Réservation avec guide | guide_offering_id lié, guide notifié |

**Status :** ✅ Terminé

---

### Task 11.3 : Scénarios — Circuit

| # | Scénario | Résultat attendu |
|---|----------|-----------------|
| 1 | Créer circuit 3 jours | Circuit créé avec 3 CircuitDays |
| 2 | Ajouter activité "ma offre" | linked_offer_item_id = mon item, prix pré-rempli |
| 3 | Ajouter activité "offre externe" | linked_offer_item_id = item tiers |
| 4 | Ajouter activité "guide" | guide_id lié, guide_cost récupéré |
| 5 | Ajouter activité "référence externe" | external_reference JSONB sauvegardé |
| 6 | Modifier prix activité | Prix circuit modifié, prix catalogue inchangé |
| 7 | Supprimer activité | Activité supprimée, capacité non affectée |
| 8 | Supprimer offre liée à circuit | Erreur "X circuit(s) utilisent cette offre" |

**Status :** ✅ Terminé

---

### Task 11.4 : Scénarios — Recherche

| # | Scénario | Résultat attendu |
|---|----------|-----------------|
| 1 | Recherche offre par région | Offres de la région affichées |
| 2 | Recherche guide par zone + date | Guides disponibles à cette date |
| 3 | Recherche circuit par durée + difficulté | Circuits correspondants |
| 4 | Recherche hébergement dans Circuit Builder | 3 niveaux fonctionnent (propre → autre → externe) |
| 5 | Recherche avec filtres combinés | Filtres cumulés fonctionnent |

**Status :** ✅ Terminé

---

### Task 11.5 : Scénarios — Guide

| # | Scénario | Résultat attendu |
|---|----------|-----------------|
| 1 | Guide crée prestation avec availability rule | Sessions générées pour 90 jours |
| 2 | Guide bloque une période | Blocks créés, sessions correspondantes annulées |
| 3 | Guide modifie prix saisonnier | price_override sur les sessions |
| 4 | Voyageur cherche guide disponible | Guides avec sessions available affichés |
| 5 | Voyageur réserve prestation guide | Booking + GuideOfferingSession liés |

**Status :** ✅ Terminé

---

## Sprint 12 — Documentation Finale 📄

> **Objectif :** Mettre à jour toute la documentation pour refléter l'état final.

### Task 12.1 : Mettre à jour README.md

Vérifier que le README reflète toutes les fonctionnalités implémentées.

**Status :** ✅ Terminé

---

### Task 12.2 : Mettre à jour docs/GLOBAL_PROJECT.md

Architecture finale avec tous les modules.

**Status :** ✅ Terminé

---

### Task 12.3 : Mettre à jour docs/AUDIT_DDD_CIRCUITS.md

Marquer tous les invariants comme vérifiés/corrigés.

**Status :** ✅ Terminé

---

### Task 12.4 : Créer PR avec description type PR7

Rédiger la description de PR suivant le format PR7.

**Status :** ✅ Terminé

---

## Résumé des tâches

| Sprint | Tâches | Type | Status |
|--------|--------|------|--------|
| 1 — Data Integrity | 5 | 🐛 Bugs | ✅ 5/5 |
| 2 — Catalogue métier | 5 | 🔍 Audit | ✅ 5/5 |
| 3 — Circuits bugs | 5 | 🐛 Bugs | ✅ 5/5 |
| 4 — Booking classique | 4 | 🔧 Architecture | ✅ 4/4 |
| 5 — CircuitReservation | 4 | 🔧 Architecture | ✅ 4/4 |
| 6 — DDD & Lifecycle | 5 | 🔧 Architecture | ✅ 5/5 |
| 7 — Admin Workflow | 4 | ✨ Fonctionnalités | ✅ 4/4 |
| 8 — Config Engine | 4 | ✨ Fonctionnalités | ✅ 4/4 |
| 9 — Search & Explorer | 5 | ✨ Fonctionnalités | ✅ 5/5 |
| 10 — API & Perf | 5 | ⚡ Optimisation | ✅ 5/5 |
| 11 — Tests métier | 5 | 🧪 Tests | ✅ 5/5 |
| 12 — Documentation | 4 | 📄 Docs | ✅ 4/4 |
| **Total** | **55 tâches** | | **✅ 55/55** |

---

## Ordre d'exécution

```
Sprint 1 (Data Integrity)
    ↓
Sprint 2 (Catalogue métier) ← AUDIT AVANT TOUT
    ↓
Sprint 3 (Circuits bugs) ← FIX APRÈS AUDIT
    ↓
Sprint 4 (Booking) ← SÉPARÉ de CircuitReservation
Sprint 5 (CircuitReservation) ← SÉPARÉ du Booking
    ↓
Sprint 6 (DDD & Lifecycle) ← ARCHITECTURE
Sprint 7 (Admin Workflow) ← PARALLÈLE
    ↓
Sprint 8 (Config Engine) ← INSPIRÉ DE MARAM
Sprint 9 (Search & Explorer) ← PARALLÈLE
Sprint 10 (API & Perf) ← PARALLÈLE
    ↓
Sprint 11 (Tests métier) ← AVANT MISE EN PRODUCTION
    ↓
Sprint 12 (Documentation) ← FINALE
```

---

## Changements par rapport à v2

| Changement | Raison |
|-----------|--------|
| ✅ Guide = disponibilité, pas offre | Distinction fondamentale entre inventaire et temps |
| ✅ Sprint 2 = Audit métier complet | Vérifier la logique, pas seulement le technique |
| ✅ Sprint 4/5 séparés | Booking classique ≠ CircuitReservation (Aggregate Roots différents) |
| ✅ Sprint 7 Admin Workflow | Validation, rejet, archivage, historique modération |
| ✅ Sprint 9 Search & Explorer | La vitrine de la plateforme mérite un sprint dédié |
| ✅ Sprint 11 Tests métier | Valider TOUS les scénarios avant production |
| ✅ 54 tâches au lieu de 37 | Couverture complète |

---

*Dernière mise à jour : 5 Juillet 2026 — v3.0 — Roadmap officielle*
