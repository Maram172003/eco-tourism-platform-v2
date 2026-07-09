# Plan de corrections — Tourisme

## Roadmap

- [x] **🔴 Phase 1** : Sécurité et cohérence ✅
- [x] **🟡 Phase 2** : Robustesse métier ✅
- [x] **🟢 Phase 3** : Industrialisation ✅

---

## 🔴 Phase 1 — Sécurité et cohérence

### 1.1 PricingDomainService (priorité absolue)

Le client ne doit jamais envoyer de prix. Le serveur calcule toujours.

**Fait :**
- [x] Créer `PricingDomainService` avec méthode `calculateCircuitPrice(circuit, participants, options)`
- [x] Supprimer `base_total` du `ReserveCircuitDto`
- [x] Remplacer par `circuit.base_price * participantsCount` dans `circuit.service.ts:reserve()`
- [x] Supprimer `unit_price` du `CircuitOptionSelectionDto`
- [x] Remplacer `opt.unit_price` par `optEntity.extra_price` dans `circuit.service.ts:reserve()`
- [x] Supprimer `total_price` du `CreateBookingDto`
- [x] Frontend : ne plus envoyer `base_total`, `unit_price`, `total_price`

**Règle :** Le client envoie uniquement `{ circuit_id, participants_count, options: [{ circuit_option_id, quantity }] }`.

---

### 1.2 CapacityDomainService

Service unique de gestion de capacité. Remplace la logique dupliquée dans BookingService, CircuitService et options.

**Fait :**
- [x] Créer `CapacityDomainService` avec méthodes :
  - [x] `checkAvailability(offerItemId, date, quantity)` → boolean
  - [x] `reserve(offerItemId, date, quantity)` → décrémente session OU stock global
  - [x] `release(offerItemId, date, quantity)` → restaure session OU stock global
  - [x] `restore(offerItemId, date, quantity)` → restaure avec reset status
- [x] Remplacer la boucle de capacité dans `circuit.service.ts:reserve()` par appel à `CapacityDomainService`
- [x] Remplacer la logique de capacité dans `booking.service.ts:create()` par appel à `CapacityDomainService`
- [x] Remplacer la restauration dans `circuit.service.ts:cancelReservation()` par `CapacityDomainService`
- [x] Remplacer la restauration dans `circuit.service.ts:rejectReservation()` par `CapacityDomainService`
- [x] Remplacer la restauration dans `booking.service.ts:cancel()` par `CapacityDomainService`
- [x] Remplacer `restoreBookingCapacity()` dans `booking.service.ts` par `CapacityDomainService`
- [x] Ajouter la vérification de capacité pour les options liées à un `offer_item_id` dans `circuit.service.ts:reserve()`
- [x] Assurer que tout est transactionnel (QueryRunner)
- [x] Créer `DomainModule` global pour centraliser les domain services

---

### 1.3 Protection des offres liées à des circuits

Une offre ne peut pas être supprimée/archivée si elle est référencée par un circuit publié.

**Fait :**
- [x] Dans `offer.service.ts:remove()` : ajout `assertNoPublishedCircuitLink()` avant la soft-delete
  - [x] Si circuit `approved` existe → **bloqué** avec message explicite
- [x] Dans `offer.service.ts:archive()` : idem
  - [x] Si circuit `approved` existe → **bloqué**
- [x] Dans `offer.service.ts:deactivate()` :
  - [x] Si circuit publié existe → **bloqué** (message invite à désactiver le circuit d'abord)

**Règle :**
```
DELETE  → interdit si circuit publié
ARCHIVE → interdit si circuit publié
INACTIVE → interdit si circuit publié
```

---

### 1.4 Sécurisation des options

**Fait :**
- [x] `unit_price` supprimé du DTO → calcul depuis `CircuitOption.extra_price`
- [x] Capacité vérifiée via `CapacityDomainService` pour chaque option avec `offer_item_id`
- [x] Options `is_included` : pas de prix ajouté (PricingDomainService ne les calcule pas)

---

## 🟡 Phase 2 — Robustesse métier

### 2.1 Auto-remplissage du prix catalogue

**Fait :**
- [x] Dans `circuit.service.ts:addProgramItem()` : si `linked_offer_item_id` fourni sans `price` explicite → cherche `OfferItemPrice` avec `is_default` et pré-remplit `CircuitProgramItem.price`
- [x] Le créateur peut modifier ensuite → le circuit garde sa copie indépendante

---

### 2.2 Protection des modifications structurelles des circuits

**Fait :**
- [x] Méthode `assertNoConfirmedReservations()` créée dans `circuit.service.ts`
- [x] `update()` : bloque modification de `base_price`, `start_date`/`end_date`, `duration_days`/`duration_nights`, `max_participants` si réservations confirmées
- [x] `addDay()` / `removeDay()` : bloqués si réservations confirmées
- [x] `addProgramItem()` / `removeProgramItem()` : bloqués si réservations confirmées
- [x] Modifications autorisées : titre, description, images, inclusions, exclusions, adresse

---

### 2.3 Validation des transitions de statut

**Fait :**
- [x] Grille de transitions ajoutée dans `circuit.service.ts:validateCircuitTransition()`
- [x] Transitions : `draft→pending`, `pending→approved|rejected`, `approved→archived`, `rejected→draft|archived`
- [x] `admin.service.ts:approveCircuit()` / `rejectCircuit()` / `archiveCircuit()` valident les transitions

---

### 2.4 Gestion améliorée des réservations en attente (pending)

**Fait :**
- [x] `CapacityDomainService.reserve()` et `restore()` maintiennent `remaining_capacity` correctement par construction
- [x] `checkExpiredBookings()` dans `booking.service.ts` gère déjà l'expiration des pending (48h)
- [x] `rejectReservation()` dans `circuit.service.ts` restaure la capacité au rejet
- [x] Le calcul `remaining = total - confirmed - pending` est prévu pour la Phase 3 (industrialisation) quand un `AvailabilityDomainService` centralisé sera créé

---

## 🟢 Phase 3 — Industrialisation

### 3.1 Snapshot complet des réservations

**Fait :**
- [x] Création de `CircuitReservationSnapshot` (JSONB column)
- [x] Enregistrement automatique après chaque réservation de circuit
- [x] Point d'API read-only `GET /circuits/reservations/:id/snapshot`
- [x] Contenu : circuit, programme complet, pricing, options sélectionnées, prestataires

---

### 3.2 ReservationApplicationService + ReservationDomainService

**Fait :**
- [x] Création de `ReservationDomainService` avec : transitions de statut unifiées, expiration (48h), validation délai annulation/réservation, détection session passée
- [x] Création de `ReservationApplicationService` avec : gestion transactionnelle, réservation/restauration de capacité (program items + options), notifications unifiées voyageur/provider/guide, snapshot circuit
- [x] `CircuitService.reserve()` 🇺→ utilise `ReservationApplicationService.createTransaction()`, `reserveProgramItemsCapacity()`, `reserveOptionsCapacity()`, `createCircuitSnapshot()`, `notifyTraveler()`, `notifyProvider()`, `notifyGuide()`
- [x] `CircuitService.confirmReservation()` → validation via `ReservationDomainService.validateTransition()`
- [x] `CircuitService.rejectReservation()` → transaction + restauration via `ReservationApplicationService`
- [x] `CircuitService.cancelReservation()` → transaction + restauration via `ReservationApplicationService`
- [x] `BookingService.confirm()` / `cancel()` → validation via `ReservationDomainService.validateTransition()`

---

### 3.3 Harmonisation complète des règles métier

**Fait :**
- [x] Expiration 48h : `CircuitService.checkExpiredReservations()` + endpoint admin `POST /circuits/reservations/check-expired`
- [x] `confirmed → completed` : `CircuitService.finalizeCompletedReservations()` + endpoint admin `POST /circuits/reservations/finalize-completed`
- [x] Notifications unifiées via `ReservationApplicationService.notifyTraveler()`, `notifyProvider()`, `notifyGuide()`
- [x] Transitions de statut unifiées via `ReservationDomainService.validateTransition()` avec table `RESERVATION_TRANSITIONS`
- [x] Mécanisme d'expiration commun : `ReservationDomainService.isExpired(createdAt, hours)`
- [x] Validation duplication code : `ReservationDomainService.calculateDaysUntil()`, `isWithinDeadline()`
- [x] `release()` supprimé (doublon de `restore()`) dans `CapacityDomainService`

---

## Résumé des dépendances

```
Phase 1 ─── 1.1 PricingDomainService ── indépendant
            1.2 CapacityDomainService  ── indépendant
            1.3 Protection offres      ── indépendant
            1.4 Sécurisation options   ── dépend de 1.1 + 1.2

Phase 2 ─── 2.1 Auto-remplissage      ── indépendant
            2.2 Protection modifications ── dépend de 1.2
            2.3 Transitions statut     ── indépendant
            2.4 Gestion pending        ── dépend de 1.2

Phase 3 ─── 3.1 Snapshot              ── indépendant
            3.2 ReservationService     ── dépend de 1.1 + 1.2
            3.3 Harmonisation          ── dépend de 3.2
```

**Ordre recommandé :** 1.1 → 1.2 → 1.3 → 1.4 → 2.1 → 2.2 → 2.3 → 2.4 → 3.1 → 3.2 → 3.3
