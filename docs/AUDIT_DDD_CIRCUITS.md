# Audit DDD — Chaîne Project → Offer → OfferItem → Circuit → Reservation

**Date :** 2026-07-05
**Statut :** Audit DDD profond (Domain-Driven Design)
**Auteur :** Buffy (Codebuff)

---

## 1. Vue d'ensemble de la Chaîne Métier

```
ProjectOwner (1:N) → Project (1:N) → Offer (1:N) → OfferItem
                                                  ├── Prices (1:N)
                                                  ├── Sessions (1:N)
                                                  └── Capacity (1:1)

Circuit (indépendant)
  ├── CircuitDay (1:N)
  │   └── CircuitProgramItem (1:N)
  │       ├── linked_offer_item_id → OfferItem (référence UUID, pas de FK)
  │       ├── guide_id → Guide
  │       └── external_reference (JSONB)
  └── CircuitReservation (1:N)

Booking
  ├── offer_id → Offer (FK)
  ├── offer_item_id → OfferItem (FK)
  ├── session_id → OfferItemSession (FK)
  ├── guideOffering → GuideOffering (FK)
  └── participants (1:N)
```

---

## 2. Aggregate Roots

| Aggregate Root | Enfants | Cross-aggregate refs |
|---|---|---|
| **Project** | Offers | — |
| **Offer** | OfferItems → Prices, Sessions, Capacity, AvailabilityRules | project_id (nullable, SET NULL) |
| **Circuit** | CircuitDays → CircuitProgramItems, CircuitOptions, CircuitReservations | linked_offer_item_id (UUID sans FK) |
| **Booking** | BookingParticipants | offer_id, offer_item_id, session_id, guideOffering, guideOfferingSession |

---

## 3. Ownership — Qui possède quoi ?

```
ProjectOwner
  └── Project (owner_id)
        └── Offer (project_id, author_id)
              └── OfferItem (offer_id, CASCADE)
                    ├── OfferItemPrice (offer_item_id, CASCADE)
                    ├── OfferItemSession (offer_item_id, CASCADE)
                    ├── OfferItemCapacity (offer_item_id, CASCADE)
                    └── OfferItemAvailabilityRule (offer_item_id, CASCADE)

Guide
  └── GuideOffering (guide_id, CASCADE)
        ├── GuideOfferingPrice (CASCADE)
        ├── GuideOfferingSession (CASCADE)
        └── GuideOfferingBlock (CASCADE)

User (any role)
  └── Circuit (author_id — sans FK vers user !)
        ├── CircuitDay (circuit_id, CASCADE)
        │   └── CircuitProgramItem (circuit_day_id, CASCADE)
        ├── CircuitOption (circuit_id, CASCADE)
        └── CircuitReservation (circuit_id, CASCADE)
              └── CircuitReservationOption (CASCADE)

User (traveler)
  └── Booking (traveler_id — FK vers user)
        └── BookingParticipant (booking_id, CASCADE)
```

---

## 4. Cascade Deletes — Analyse Critique

### 4.1 Ce qui fonctionne bien ✅

| Chaîne | Cascade | Comportement |
|--------|---------|-------------|
| Offer → OfferItem | `onDelete: 'CASCADE'` | Supprimer une offre supprime ses items |
| OfferItem → Price | `onDelete: 'CASCADE'` | Supprimer un item supprime ses prix |
| OfferItem → Session | `onDelete: 'CASCADE'` | Supprimer un item supprime ses sessions |
| OfferItem → Capacity | `onDelete: 'CASCADE'` | Supprimer un item supprime sa capacité |
| Circuit → Day | `onDelete: 'CASCADE'` | Supprimer un circuit supprime ses jours |
| Day → ProgramItem | `onDelete: 'CASCADE'` | Supprimer un jour supprime ses activités |
| Circuit → Reservation | `onDelete: 'CASCADE'` | Supprimer un circuit supprime ses réservations |
| Project → Offer | `onDelete: 'SET NULL'` | Supprimer un projet met project_id à null |

### 4.2 BUG CRITIQUE : linked_offer_item_id sans FK ⚠️

**Problème :** `CircuitProgramItem.linked_offer_item_id` est une simple colonne UUID sans clé étrangère :

```typescript
// circuit-program-item.entity.ts
@Column({ type: 'uuid', nullable: true })
linked_offer_item_id!: string | null;
// PAS de @ManyToOne → PAS de onDelete
```

**Scénario de crash :**
```
1. User crée Circuit "Aventure Tunisie"
   └── Jour 2 : "Nuit à l'éco-gîte"
       └── linked_offer_item_id = "abc-123" (chambre chez Yasmine)

2. Yasmine supprime son offre
   └── Offer supprimée → OfferItem supprimé (CASCADE)

3. Circuit "Aventure Tunisie" existe toujours
   └── Jour 2 : linked_offer_item_id = "abc-123" ← UUID DANGLING

4. Résultat : le circuit affiche une activité qui n'existe plus
   → Pas d'erreur côté serveur (pas de FK)
   → Erreur silencieuse côté frontend
```

**Impact :** Données corrompues, erreurs 404 au chargement du circuit.

**Correction recommandée :**
```typescript
// Option 1 : Soft delete sur Offer (au lieu de CASCADE)
@Column({ type: 'boolean', default: false })
is_deleted!: boolean;

// Option 2 : Vérification avant suppression dans offer.service.ts
async remove(authorId: string, offerId: string) {
  // Vérifier si des circuits référencent cette offre
  const linkedCircuits = await this.circuitRepo
    .createQueryBuilder('c')
    .innerJoin('circuit_program_items', 'cpi', 'cpi.circuit_day_id IN (SELECT id FROM circuit_days WHERE circuit_id = c.id)')
    .where('cpi.linked_offer_item_id IN (SELECT id FROM offer_items WHERE offer_id = :offerId)', { offerId })
    .getCount();
  
  if (linkedCircuits > 0) {
    throw new BadRequestException(
      `Impossible de supprimer : ${linkedCircuits} circuit(s) utilisent encore cette offre.`
    );
  }
  // ... supprimer
}
```

### 4.3 BUG CRITIQUE : Booking sans protection CASCADE ⚠️

**Problème :** `Booking` a des FK vers `Offer`, `OfferItem`, `OfferItemSession` mais **aucun `onDelete`** spécifié. Par défaut TypeORM utilise `RESTRICT` (ou rien dans ce cas).

```typescript
// booking.entity.ts
@ManyToOne(() => Offer, { nullable: true })
@JoinColumn({ name: 'offer_id' })
offer!: Offer | null;
// Pas de onDelete → comportement indéfini avec TypeORM synchronize
```

**Scénario problématique :**
```
1. User réserve une offre → Booking créé
2. Owner supprime l'offre
3. Booking existe toujours avec offer_id pointant vers rien
4. La réservation est orpheline
```

**Correction :** Ajouter `onDelete: 'SET NULL'` sur les FK du Booking, ou empêcher la suppression d'offres avec réservations actives.

### 4.4 BUG CRITIQUE : TripPlanItem et TravelCartItem sans protection

```typescript
// trip-plan-item.entity.ts
@ManyToOne(() => OfferItem, { onDelete: 'SET NULL', nullable: true })
offerItem!: OfferItem | null;

@ManyToOne(() => Circuit, { onDelete: 'SET NULL', nullable: true })
circuit!: Circuit | null;
```

Ces relations utilisent `SET NULL` — c'est mieux que rien, mais un TripPlan avec tous ses items à null est inutile.

---

## 5. Price History — Analyse Critique

### 5.1 Comment le prix est calculé

**Côté Booking (offer classique) :**
```typescript
// booking.service.ts — Ligne 148-165
const priceRow = offerItem.prices.find((p) => p.is_default) ?? offerItem.prices[0];
const unitPrice = Number(priceRow.price);
// ... calcul selon pricingUnit ...
totalPrice = unitPrice * participantCount;
// Sauvegardé dans Booking.total_price
```

**Côté Circuit :**
```typescript
// circuit.service.ts — Ligne 366
total_price: lineTotal, // Prix au moment de la création du circuit
```

### 5.2 Ce qui est bien ✅

| Point | Statut | Détail |
|-------|--------|--------|
| Prix calculé côté serveur | ✅ | Anti-fraude : le client n'envoie jamais total_price |
| Prix copié dans Booking | ✅ | Les réservations existantes gardent leur prix |
| 3 fallbacks de calcul | ✅ | Session → Item → Offer → Somme items |
| Circuit.price = snapshot | ✅ | Prix du circuit figé à la création |

### 5.3 Ce qui manque ⚠️

| Problème | Impact | Priorité |
|----------|--------|----------|
| Pas de table d'historique des prix | Pas d'audit trail si un prix est modifié | Moyenne |
| Pas de `price_snapshot` dans CircuitProgramItem | Le circuit affiche le prix ACTUEL de l'offre liée, pas le prix au moment de la création | Haute |
| `session.price_override` non utilisé dans le wizard | Possibilité de pricing saisonnier non exploitée | Basse |

**Scénario problématique :**
```
1. Offre "Chambre" : prix catalogue = 50 TND
2. Circuit "Aventure" : CircuitProgramItem.price = 50 TND (copié à la création)
3. Owner modifie le prix de l'offre à 75 TND
4. Le circuit affiche toujours "50 TND" (son propre prix)
5. Mais le badge "Offre à 75 TND" montre le prix ACTUEL
6. Confusion pour l'utilisateur
```

---

## 6. Availability & Stock — Analyse Critique

### 6.1 Ce qui fonctionne ✅

| Mécanisme | Statut | Détail |
|-----------|--------|--------|
| Session.remaining_capacity décrémenté | ✅ | `booking.service.ts:166` |
| Session.remaining_capacity restauré | ✅ | `booking.service.ts:265` (annulation) |
| Session.status = 'full' | ✅ | Quand remaining = 0 |
| OfferItemCapacity.remaining_quantity | ✅ | Items sans sessions (hébergement) |
| Vérification capacité avant réservation | ✅ | `booking.service.ts:53` |
| Vérification délai de réservation | ✅ | `booking.service.ts:59` |
| Vérification délai d'annulation | ✅ | `booking.service.ts:238` |

### 6.2 BUG CRITIQUE : CircuitReservation ne gère PAS le stock ⚠️

**Problème :** `CircuitReservation` stocke `participants_count` mais ne touche PAS à la capacité des `OfferItem` liés via `CircuitProgramItem.linked_offer_item_id`.

```typescript
// circuit-reservation.entity.ts
@Column({ type: 'int', nullable: true })
participants_count!: number | null;

@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
options_total!: number;

@Column({ type: 'decimal', precision: 10, scale: 2 })
final_total!: number;
// PAS de lien avec OfferItemSession.remaining_capacity
```

**Scénario de surréservation :**
```
1. Activité "Kayak" : 10 places disponibles
2. Circuit "Aventure Sud" réserve 8 places (linked_offer_item_id = kayak)
   → CircuitReservation créée, MAIS AUCUNE décrémentation
3. Circuit "Randonnée Nord" réserve 5 places (même linked_offer_item_id)
   → CircuitReservation créée, AUCUNE décrémentation
4. Booking direct pour 4 personnes sur la même session
   → remaining_capacity décrémenté (10 - 4 = 6)
5. Résultat : 8 + 5 + 4 = 17 réservations pour 10 places
```

**Correction recommandée :**
```typescript
// circuit.service.ts — dans la méthode reserve()
async reserveCircuit(circuitId: string, dto: CreateCircuitReservationDto) {
  // Pour chaque CircuitProgramItem lié à un OfferItem :
  for (const prog of circuit.programItems) {
    if (prog.linked_offer_item_id) {
      // Trouver la session correspondante
      const session = await this.findSessionForProgramItem(prog, dto.date);
      if (session?.remaining_capacity !== null) {
        if (session.remaining_capacity < dto.participants_count) {
          throw new BadRequestException(
            `Capacité insuffisante pour "${prog.title}" : ${session.remaining_capacity} place(s)`
          );
        }
        // Décrémenter
        session.remaining_capacity -= dto.participants_count;
        await this.sessionRepo.save(session);
      }
    }
  }
}
```

### 6.3 Pas de locking pessimiste ⚠️

**Problème :** Aucun mécanisme de locking n'est visible dans le code. En cas de réservation simultanée, deux requêtes peuvent lire la même `remaining_capacity` et la décrémenter, créant une surréservation.

```typescript
// booking.service.ts — Pas de transaction avec lock
session.remaining_capacity = Math.max(0, session.remaining_capacity - participantCount);
await this.sessionRepo.save(session);
// ← Deux requêtes simultanées peuvent lire la même valeur
```

**Correction :** Utiliser une transaction avec `SELECT ... FOR UPDATE` ou un optimistic locking (version field).

---

## 7. Lifecycle — Cycle de Vie des Entités

### 7.1 Offer

```
pending ──→ approved (auto si Ambassadeur, sinon Admin)
   │              │
   │              ├──→ inactive (Owner, désactivation temporaire)
   │              │       └──→ approved (Owner, réactivation)
   │              │
   │              └──→ archived (Owner, soft-delete définitif)
   │
   └──→ rejected (Admin avec raison) ──→ (aucune sortie)
```

| État | Transitions | Guard |
|------|------------|-------|
| `pending` | → approved | Author est Ambassadeur OU Admin approuve |
| `pending` | → rejected | Admin rejette avec raison, `rejection_reason` requis |
| `pending` | → archived | Owner archive |
| `approved` | → inactive | Owner désactive (temporaire) |
| `approved` | → archived | Owner archive (définitif) |
| `inactive` | → approved | Owner réactive |
| `rejected` | — | Aucune transition possible |
| `archived` | — | Aucune transition possible |

**Transition guard :** `isValidOfferTransition()` dans `offer.service.ts` valide toutes les transitions.
**Update DTO :** `status` supprimé de `UpdateOfferDto` — le statut change uniquement via endpoints dédiés (`archive`, `deactivate`, `reactivate`, admin `approve`/`reject`).

### 7.2 Circuit

```
pending ──→ approved (Admin, nouveau endpoint admin)
   │
   ├──→ rejected (Admin, avec raison)
   │
   └──→ archived (Admin)
```

| État | Transitions | Guard |
|------|------------|-------|
| `pending` | → approved | Admin approuve via `PATCH admin/circuits/:id/approve` |
| `pending` | → rejected | Admin rejette via `PATCH admin/circuits/:id/reject` |
| `pending` | → archived | Admin archive via `PATCH admin/circuits/:id/archive` |
| `approved` | → archived | Admin archive |
| `rejected` | — | Aucune transition possible |
| `archived` | — | Aucune transition possible |

**Nouveaux endpoints :**
- `GET admin/circuits/pending` — liste des circuits en attente
- `PATCH admin/circuits/:id/approve` — approuver (débloque la réservation)
- `PATCH admin/circuits/:id/reject` — rejeter avec motif
- `PATCH admin/circuits/:id/archive` — archiver

### 7.3 Booking

```
pending ──→ confirmed (Provider en mode manual, avec guard)
   │
   ├──→ cancelled (Voyageur, avec délai)
   │
   └──→ expired (automatique, > 48h sans confirmation)
   
confirmed ──→ completed (automatique, session passée)
   │
   └──→ cancelled (avec délai)

expired ──→ (aucune sortie)
completed ──→ (aucune sortie)
```

| État | Transitions | Guard |
|------|------------|-------|
| `pending` | → confirmed | Provider confirme, vérifié `status === 'pending'` |
| `pending` | → cancelled | Voyageur annule, vérifié délai d'annulation |
| `pending` | → expired | Automatique via `checkExpiredBookings()` (CRON / admin) |
| `confirmed` | → completed | Automatique via `finalizeCompletedBookings()` |
| `confirmed` | → cancelled | Voyageur annule, avec délai |
| `expired` | — | Aucune transition possible |
| `completed` | — | Aucune transition possible |

**Implémenté dans Sprint 4 + 6 :**
- `checkExpiredBookings()` : pending > 48h → expired + capacité restaurée + notification
- `finalizeCompletedBookings()` : confirmed + session passée → completed
- Endpoints admin : `POST /bookings/check-expired`, `POST /bookings/finalize-completed`

### 7.4 GuideOffering

```
pending ──→ active (Admin approuve)
   │
   ├──→ rejected (Admin, avec raison)
   │
   └──→ archived (Admin)
```

| État | Transitions | Guard |
|------|------------|-------|
| `pending` | → active | Admin approuve via `PATCH admin/guide-offerings/:id/approve` |
| `pending` | → rejected | Admin rejette via `PATCH admin/guide-offerings/:id/reject` |
| `pending` | → archived | Admin archive |
| `active` | → archived | Admin archive |
| `rejected` | — | Aucune transition possible |
| `archived` | — | Aucune transition possible |

**Nouveaux endpoints :**
- `GET admin/guide-offerings/pending`
- `PATCH admin/guide-offerings/:id/approve`
- `PATCH admin/guide-offerings/:id/reject`
- `PATCH admin/guide-offerings/:id/archive`

**Update DTO :** `status` supprimé de `UpdateGuideOfferingDto` — le guide ne peut pas modifier son propre statut.

### 7.5 CircuitReservation

```
pending ──→ confirmed
   │
   └──→ cancelled
```

**Manquant :** Pas de lien avec le lifecycle des CircuitProgramItems.

---

## 8. Invariants — Règles Métier

### 8.1 Invariants vérifiés ✅

| Invariant | Vérification | Fichier |
|-----------|-------------|---------|
| Session complète → pas de réservation | `session.remaining_capacity <= 0` | booking.service.ts:53 |
| Délai de réservation respecté | `daysUntilSession < booking_deadline_days` | booking.service.ts:59 |
| Délai d'annulation respecté | `daysUntilSession < cancellation_deadline_days` | booking.service.ts:238 |
| Pas de double réservation | `findOne(where: { status: Not('cancelled') })` | booking.service.ts:76 |
| Prix calculé côté serveur | `totalPrice = unitPrice * count` | booking.service.ts:148 |
| Capacité restaurée à l'annulation | `session.remaining_capacity + participantCount` | booking.service.ts:265 |

### 8.2 Invariants NON vérifiés ❌

| Invariant | Risque | Priorité |
|-----------|--------|----------|
| Offer supprimée → Circuit référenciel intact | Données orphelines | 🔴 Haute |
| CircuitReservation → Capacité OfferItem | Surréservation | 🔴 Haute |
| CircuitProgramItem → OfferItem existe | UUID dangling | 🔴 Haute |
| Offer modifiée → Circuit notified | Prix incohérent | 🟡 Moyenne |
| Project supprimé → Offers gérées | SET NULL (correct mais surprenant) | 🟡 Moyenne |
| Guide indisponible → Circuit affected | Activité sans guide | 🟡 Moyenne |
| Session expirée → Booking finalized | Pas de finalisation auto | 🟢 Basse |

### 8.3 Invariants DDD manquants

**Règle :** Une activité doit appartenir à un jour, qui appartient à un circuit, qui appartient à un propriétaire.

```typescript
// Vérification manquante dans circuit.service.ts
async addItem(circuitId: string, dayId: string, dto: CreateProgramItemDto, authorId: string) {
  const circuit = await this.findOne(circuitId);
  
  // INVARIANT : l'auteur du circuit est bien le propriétaire
  if (circuit.author_id !== authorId) {
    throw new ForbiddenException('Vous ne pouvez modifier que vos propres circuits');
  }
  
  // INVARIANT : le jour appartient bien au circuit
  const day = circuit.days?.find(d => d.id === dayId);
  if (!day) {
    throw new NotFoundException('Jour non trouvé dans ce circuit');
  }
  
  // INVARIANT : si linked_offer_item_id, l'item existe bien
  if (dto.linked_offer_item_id) {
    const item = await this.offerItemRepo.findOne({ where: { id: dto.linked_offer_item_id } });
    if (!item) {
      throw new NotFoundException('OfferItem référencé introuvable');
    }
  }
  
  // ... créer l'activité
}
```

---

## 9. Recommandations DDD

### 9.1 Priorité Haute — Sécurité données

| # | Action | Effort |
|---|--------|--------|
| 1 | Ajouter `onDelete: 'SET NULL'` sur les FK de Booking (offer, offerItem, session) | Faible |
| 2 | Vérifier linked circuits avant suppression d'Offer | Moyen |
| 3 | Ajouter gestion capacité dans CircuitReservation | Moyen |
| 4 | Ajouter optimistic locking (version field) sur Session | Faible |

### 9.2 Priorité Moyenne — Cohérence

| # | Action | Effort |
|---|--------|--------|
| 5 | Ajouter état `draft` pour Offer et Circuit | Faible |
| 6 | ~~Ajouter transition automatique `pending → expired`~~ | ✅ Fait (Sprint 4) |
| 7 | Ajouter table d'historique des prix (price_history) | Moyen |
| 8 | Valider linked_offer_item_id lors de la création d'activité | Faible |

### 9.3 Priorité Basse — Évolution

| # | Action | Effort |
|---|--------|--------|
| 9 | ~~Ajouter état `archived` pour Offer~~ | ✅ Fait (Sprint 6) |
| 10 | ~~Ajouter `completed` automatique après date de session~~ | ✅ Fait (Sprint 4) |
| 11 | Notification quand offre liée est modifiée | Moyen |
| 12 | Gestion `no_show` pour les réservations | Faible |

---

## 10. Score DDD (Sprint 6)

| Critère | Note | Commentaire |
|---------|------|-------------|
| Aggregate Roots | 8/10 | Clairs et bien séparés |
| Ownership | 6/10 | linked_offer_item_id = référence sans FK |
| Lifecycle | 8/10 | Transitions complètes : Offer (6 états), Circuit (3 états), Booking (5 états), GuideOffering (4 états) |
| Invariants | 5/10 | Transition guards ajoutés, booking correct, linked_offer_item_id sans FK |
| Cascade Safety | 3/10 | Risque de données orphelines persiste |
| Price Integrity | 7/10 | Copié au bon moment, mais pas d'historique |
| Stock Management | 5/10 | Fonctionne pour Booking direct, pas pour CircuitReservation |
| Concurrency | 3/10 | Pas de locking |
| **Global** | **6/10** | Nette amélioration lifecycle ; invariants et stock restent fragiles |

---

## 11. Plan d'Action Recommandé

### Semaine 1 : Sécurité (Priorité Haute)

1. **Ajouter `onDelete: 'SET NULL'` sur Booking FK** (1h)
   ```typescript
   @ManyToOne(() => Offer, { nullable: true, onDelete: 'SET NULL' })
   @ManyToOne(() => OfferItem, { nullable: true, onDelete: 'SET NULL' })
   @ManyToOne(() => OfferItemSession, { nullable: true, onDelete: 'SET NULL' })
   ```

2. **Vérifier linked circuits avant suppression d'Offer** (2h)
   ```typescript
   async remove(authorId: string, offerId: string) {
     const linked = await this.checkLinkedCircuits(offerId);
     if (linked > 0) throw new BadRequestException(`${linked} circuit(s) liés`);
     // ...
   }
   ```

3. **Ajouter gestion capacité dans CircuitReservation** (4h)
   - Décrémenter `remaining_capacity` des sessions liées
   - Vérifier la capacité avant création
   - Restaurer à l'annulation

### Semaine 2 : Cohérence (Priorité Moyenne)

4. **Ajouter état `draft`** (2h)
5. **Ajouter optimistic locking** (2h)
6. **Valider linked_offer_item_id** (1h)
7. **Ajouter table price_history** (4h)

---

## Changelog

| Date | Sprint | Changements |
|------|--------|-------------|
| 2026-07-05 | Sprint 6 | Ajout approve/reject/archive pour Circuit + GuideOffering dans admin service/controller |
| | | Ajout transition guards pour Offer (`isValidOfferTransition`) |
| | | Ajout `reactivate()` pour Offer (transition `inactive` → `approved`) |
| | | Suppression de `status` de `UpdateOfferDto` et `UpdateGuideOfferingDto` |
| | | Remplacement de `Object.assign(offering, dto)` par assignation explicite |
| | | Documentation lifecycle complète dans ce fichier |

*Dernière mise à jour : 5 Juillet 2026 (Sprint 6)*
