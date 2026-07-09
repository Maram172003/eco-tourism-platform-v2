# Analyse Métier — Éco-Voyage Tourisme

## Résumé Exécutif

Audit du modèle métier réalisé le 06/07/2026.
**16 problèmes critiques**, **11 problèmes fonctionnels**, **4 redondances**, **7 champs inutiles/sous-utilisés** identifiés.

---

## 🔴 CRITIQUE — Intégrité des données

### 1. CircuitProgramItem.linked_offer_item_id — Référence morte
- **Fichier :** `circuit-program-item.entity.ts:46`
- **Problème :** UUID stocké **sans clé étrangère**. Si l'OfferItem lié est supprimé, la référence devient un UUID mort (pointeur vers rien).
- **Impact :** Un circuit peut référencer un item qui n'existe plus → plan de voyage cassé.
- **Correctif :** Ajouter `@ManyToOne(() => OfferItem)` avec `onDelete: 'SET NULL'`.

### 2. Booking TOCTOU — Sur-réservation garantie en concurrence
- **Fichier :** `booking.service.ts:196-205`
- **Problème :** Lecture de `remaining_capacity` puis décrémentation **sans verrouillage**. Deux requêtes simultanées réservent la même place.
- **Impact :** Perte financière, clients mécontents.

### 3. Booking — Aucun `onDelete` sur les relations FK
- **Fichier :** `booking.entity.ts:33-55`
- **Problème :** Les relations `@ManyToOne` (traveler, offer, offerItem, session) n'ont pas de `onDelete`. Supprimer un utilisateur ou une offre → violation de clé étrangère.
- **Impact :** Impossible de supprimer des données sans cascade manuelle.

### 4. TripPlan.book() — Ne décrémente pas la capacité des sessions OfferItem
- **Fichier :** `trip-plan.service.ts:397-507`
- **Problème :** Quand un trip plan inclut des OfferItems (ni circuit ni guide offering), la réservation ne décrémente **jamais** `remaining_capacity`. Sur-réservation garantie.
- **Impact :** 3ème source de sur-réservation.

### 5. Google Login — User non sanitized dans la réponse
- **Fichier :** `auth.service.ts:277`
- **Problème :** `googleLogin()` retourne `user` brut (avec `password: ''`, tokens). Pas de `sanitizeUser()`.
- **Impact :** Le hash vide et les tokens de l'utilisateur Google sont exposés dans la réponse API.

### 6. getPopularLocations() — Propriétés inexistantes
- **Fichier :** `offer.service.ts:997-998`
- **Problème :** `(item as any).lat` et `(item as any).lng` n'existent pas sur OfferItem (les coordonnées sont sur Offer). Retourne `null` pour tout.
- **Impact :** La fonctionnalité "destinations populaires" ne fonctionne **pas du tout**.

### 7. findPublic() — Utilise `offer_type` au lieu de `category_id`
- **Fichier :** `offer.service.ts:198`
- **Problème :** Le champ `offer_type` est marqué "déprécié, migrer vers category_id" dans le commentaire, mais la requête publique filtre encore sur `offer_type`.
- **Impact :** Les catégories ne fonctionnent pas pour la recherche. Le champ `category_id` est décoratif.

### 8. Données PII en clair — Aucun chiffrement
- **Fichier :** `booking-participant.entity.ts:36`
- **Problème :** `document_number` (numéro de passeport/CIN) stocké en clair dans la base.
- **Impact :** RGPD / données personnelles non protégées.

---

## 🟠 FONCTIONNEL — Logique métier

### 9. Devise incohérente : TND vs XAF
- **Fichiers :** `booking.entity.ts:63` vs `circuit.service.ts:80`
- **Problème :** Le booking utilise `TND` par défaut, le circuit service utilise `XAF`. Aucune configuration centrale.
- **Impact :** Un booking de circuit peut mélanger les devises → prix incohérents.

### 10. `@Column({ select: false })` absent sur les champs sensibles User
- **Fichier :** `user.entity.ts` (password, verification_token, refresh_token, reset_password_token, failed_login_attempts, locked_until)
- **Problème :** Tout `find()` ou `findOne()` charge ces champs en mémoire même s'ils ne sont pas utilisés. Defense-in-depth manquante.
- **Correctif :** Ajouter `@Column({ select: false })` pour éviter les fuites accidentelles.

### 11. simple-array utilisé 15+ fois — Vulnérabilité à la virgule
- **Fichiers :** `Offer.images`, `Circuit.images`, `Review.photos`, `Publication.images`, `Publication.tags`, `Guide.specialties`, `Guide.languages_spoken`, `Project.eco_labels`, etc.
- **Problème :** TypeORM `simple-array` stocke en CSV dans une colonne texte. Une virgule dans une URL (`https://ex.com/img?w=800,400`) coupe la donnée.
- **Impact :** URLs et tags corrompus silencieusement.

### 12. Aucune contrainte d'unicité — Doublons possibles
| Table | Champs concernés | Impact |
|---|---|---|
| `Review` | `(author_id, target_type, target_id)` | Un user peut noter 10× le même circuit |
| `Follow` | `(follower_id, following_id)` | Follows en double |
| `Friendship` | `(requester_id, receiver_id)` | Demandes d'ami en double |
| `Conversation` | `(participant_a_id, participant_b_id)` | Conversations en double |

### 13. `null` = capacité illimitée — Pas géré uniformément
- **Fichier :** `booking.service.ts:638`
- **Problème :** Quand `remaining_capacity` et `total_capacity` sont null → la formule `?? 0` bloque toute réservation au lieu de laisser passer (illimité).
- **Impact :** Un guide qui ne configure pas de capacité voit ses réservations bloquées.

### 14. price_override sur les sessions — Jamais utilisé
- **Fichier :** `offer-item-session.entity.ts:43`
- **Problème :** `price_override` existe dans l'entité mais n'est jamais lu dans la logique de pricing (`booking.service.ts:121-174`).
- **Impact :** Champ mort, développeur piégé.

### 15. Guide.language redondant avec languages_spoken
- **Fichier :** `guide.entity.ts:34`
- **Problème :** `language` (singulier) ET `languages_spoken` (tableau). Le singulier ne sert à rien.

### 16. Circuit.author_id et Event.place_id — Pas de FK
- **Fichiers :** `circuit.entity.ts:24`, `event.entity.ts:14`
- **Impact :** Suppression d'un auteur → circuits orphelins, events pointing vers rien.

---

## 🟡 UX / CONCEPTION

### 17. Français/Anglais mélangé dans le code
| Emplacement | Termes FR | Problème |
|---|---|---|
| `circuit.entity.ts:111-122` | `saisons`, `heure_debut`, `heure_fin`, `delai_reponse` | Clés JSONB en français |
| `circuit.entity.ts:126` | `hebergement` | Nom de champ d'entité en français |
| `circuit.entity.ts:128` | `inclus` | Clé JSONB en français |
| `circuit-program-item.entity.ts:73` | `'hebergement'`, `'activite'`, `'restauration'` | Valeurs de catégorie en français |
| `publication.entity.ts:47` | `'plage'`, `'musee'`, `'artisanat'` | Valeurs de catégorie en français |

**Recommandation :** L'anglais pour le code, le français uniquement pour les messages utilisateur.

### 18. Absence d'index sur les colonnes fréquemment requêtées
| Table | Colonne | Requête typique |
|---|---|---|
| `booking` | `traveler_id` | `findByTraveler()` |
| `booking` | `status` | Filtrage par statut |
| `offer` | `author_id` | `findByAuthor()` |
| `offer` | `status` | `findAllPublic()` |
| `review` | `target_type + target_id` | `findByTarget()` |
| `notification` | `user_id` | Notifications utilisateur |

### 19. DTOs sans validation d'enum
| DTO | Champ | Valeurs possibles |
|---|---|---|
| `CreateOfferDto` | `confirmation_mode`, `fulfillment_mode`, `location_type` | Aucune validation `@IsIn()` |
| `CreateOfferItemDto` | `item_type`, `confirmation_mode` | Aucune validation d'enum |
| `CreateAvailabilityRuleDto` | `availability_type` | Aucune validation |
| `CreateCircuitDto` | `difficulty_level`, `confirmation_mode` | Aucune validation |

### 20. Password — Aucune politique de force
- **Fichier :** `register.dto.ts`
- **Problème :** Seulement `@MinLength(6)`. Pas d'exigence de majuscule, chiffre, caractère spécial.
- **Impact :** `"123456"` est accepté comme mot de passe.

---

## 🔵 CHAMPS INUTILES / REDONDANTS

| Champ | Raison | Action |
|---|---|---|
| `Offer.price` | Redondant avec `OfferItemPrice.price` (le commentaire dit "indicatif") | Supprimer ou rendre calculé |
| `Guide.language` | Redondant avec `Guide.languages_sponsored` | Supprimer |
| `Photo.score` | Redondant avec `Photo.is_hero` (héro = score plus élevé) | Unifier |
| `CircuitProgramItem.is_external_reference` | Redondant avec `external_reference !== null` | Supprimer |
| `CircuitReservation.final_total` | Devrait être calculé de `base_total + options_total` | Rendre calculé |
| `CircuitReservationOption.total_price` | Devrait être calculé de `unit_price * quantity` | Rendre calculé |
| `Publication.popularity_score` | Stocké mais pourrait être calculé (`likes + comments*2`) | Vue calculée |
| `Booking.confirmation_mode` | Redondant avec `Offer.confirmation_mode` | Supprimer |
| `OfferItemCapacity` | Traité comme 1:1 mais modélisé en 1:N (premier enregistrement gagne) | Forcer 1:1 ou gérer multi |

---

## 📋 PLAN D'ACTION RECOMMANDÉ

### Priorité 1 — Semaine 1
1. Ajouter verrouillage pessimiste (`FOR UPDATE`) sur les 4 flux de réservation
2. Ajouter `onDelete` sur toutes les FK de Booking
3. Ajouter FK sur `CircuitProgramItem.linked_offer_item_id`
4. Décrémenter la capacité session dans `trip-plan.service.ts:book()`
5. Fixer `getPopularLocations()` pour lire les coordonnées depuis Offer
6. Sanitizer la réponse de `googleLogin()`

### Priorité 2 — Semaine 2
7. Remplacer `simple-array` par JSONB sur toutes les entités
8. Ajouter les index manquants
9. Ajouter `@Column({ select: false })` sur les champs sensibles User
10. Ajouter contraintes d'unicité sur Review, Follow, Friendship
11. Unifier la devise (TND) ou la rendre configurable

### Priorité 3 — Semaine 3
12. Ajouter validation `@IsIn()` sur tous les champs enum dans les DTOs
13. Supprimer les champs redondants
14. Standardiser langue (anglais pour code, français pour UI)
15. Ajouter politique de mot de passe fort
16. Remplacer `Math.random()` par `crypto.randomUUID()` pour les références
