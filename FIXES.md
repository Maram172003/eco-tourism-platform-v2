# Correctifs de Sécurité — Tourisme

## 🔴 CRITIQUE

### 1. `DELETE /photos/:id` — Propriété non vérifiée
- **Fichier :** `photo.controller.ts:78-81` → `photo.service.ts:57-63`
- **Problème :** N'importe quel utilisateur authentifié pouvait supprimer **n'importe quelle photo** sans vérifier qu'il en est le propriétaire (`uploaded_by`)
- **Correctif :** Ajout du paramètre `userId` + vérification `if (photo.uploaded_by !== userId) throw ForbiddenException`

### 2. Excessive Data Exposure — Réponses API contenant des champs sensibles
- **Fichier :** `auth.service.ts` (login + verifyEmail)
- **Problème :** Le `user` complet était retourné incluant `password` (hash), `verification_token`, `reset_password_token`, `refresh_token`, `failed_login_attempts`, `locked_until`
- **Correctif :** Ajout de `sanitizeUser()` qui extrait ces champs avant réponse

### 3. JWT_SECRET loggé dans la console
- **Fichier :** `jwt.strategy.ts:21`
- **Problème :** `console.log('JWT_SECRET =', configService.get('JWT_SECRET'))` — le secret JWT imprimé en clair dans les logs serveur
- **Correctif :** Ligne supprimée

### 4. User Enumeration via forgot-password
- **Fichier :** `auth.service.ts:204-219`
- **Problème :** L'API `POST /auth/forgot-password` retournait une erreur `NotFoundException` si l'email n'existait pas, permettant d'énumérer les utilisateurs inscrits
- **Correctif :** Retourne le même message de succès que l'email existe ou non

### 5. OAuth Google — CSRF via state manquant
- **Fichier :** `google.strategy.ts`, `main.ts`
- **Problème :** Le flux OAuth Google n'utilisait pas de paramètre `state` pour la protection CSRF
- **Correctif :** Ajout de `state: true` dans la stratégie + middleware `express-session` configuré dans `main.ts`

### 6. `verifyEmail` — Exposition du hash du mot de passe dans la réponse
- **Fichier :** `auth.service.ts:174`
- **Problème :** `verifyEmail` retournait l'utilisateur brut incluant le hash bcrypt du mot de passe (`password`), les tokens de vérification/rafraîchissement/réinitialisation, et les compteurs de verrouillage
- **Correctif :** Remplacé `user` par `this.sanitizeUser(user)` (comme `login`)

### 7. Role auto-assignable — Inscription en tant qu'admin
- **Fichier :** `auth.service.ts:39`
- **Problème :** Le DTO d'inscription permet de choisir `Role.ADMIN`, ouvrant une escalade de privilèges
- **Correctif :** Ajout d'une vérification `if (dto.role === Role.ADMIN) throw ForbiddenException` dans `register()`

### 8. Authorization manquante sur OfferItem/Prices/Rules — 6 endpoints
- **Fichiers :** `offer.controller.ts`, `offer.service.ts`
- **Problème :** Les endpoints suivants ne vérifiaient pas que l'item/prix/règle appartient à l'utilisateur (tout PROJECT utilisateur pouvait modifier n'importe quelle ressource) :
  - `PATCH /offers/items/:itemId` (updateItem)
  - `DELETE /offers/items/:itemId` (removeItem)
  - `POST /offers/items/:itemId/prices` (addPrice)
  - `PATCH /offers/items/prices/:priceId` (updatePrice)
  - `DELETE /offers/items/prices/:priceId` (removePrice)
  - `POST /offers/items/:itemId/availability` (addAvailabilityRule)
  - `DELETE /offers/availability/:ruleId` (removeAvailabilityRule)
  - `DELETE /offers/items/:itemId/availability/delete-all` (removeAllAvailabilityRules)
- **Correctif :** Ajout de `verifyItemOwnership()`, `verifyPriceOwnership()`, `verifyRuleOwnership()` avec chaînage `item → offer → author_id`, et passage de `req.user.sub` depuis le contrôleur

---

## 🟡 MOYEN

### 9. Endpoints sans restriction de rôle (`@Roles()` manquant)
- **Fichiers :** `favorite.controller.ts`, `notification.controller.ts`, `review.controller.ts`
- **Problème :** Plusieurs endpoints étaient protégés par JWT mais accessibles à **n'importe quel rôle authentifié**
- **Correctif :** Ajout de `@Roles(ECO_TRAVELER, GUIDE, PROJECT)` sur les contrôleurs concernés
- **Fichiers modifiés :**
  - `favorite.controller.ts` — `@Roles(ECO_TRAVELER, GUIDE, PROJECT)` au niveau classe
  - `notification.controller.ts` — `@Roles(ECO_TRAVELER, GUIDE, PROJECT, ADMIN)` au niveau classe
  - `review.controller.ts` — `@Roles(ECO_TRAVELER, GUIDE, PROJECT)` sur `POST /`, `GET /mine`, `PATCH /:id`, `DELETE /:id`

### 10. PhotoController — Validation d'entrée manquante
- **Fichier :** `photo.controller.ts:25-36`
- **Problème :** Le body était typé avec une interface TypeScript inline (pas de class-validator), donc `whitelist: true` ne fonctionnait pas
- **Correctif :** Remplacé par `CreatePhotoDto` (déjà existant avec `@IsString()`, `@IsIn()`, `@IsUUID()`)

### 11. Rate limiting — Renforcé sur tous les endpoints d'auth
- **Fichier :** `auth.controller.ts`
- **Correctif :** Ajouté `@Throttle()` sur `verify-email` (10/min), `refresh` (10/min), `reset-password` (5/min)
- **Étaient déjà limités :** `register` (3/min), `login` (5/min), `forgot-password` (3/min)

### 12. CSP & Security Headers manquants
- **Fichier :** `main.ts`
- **Problème :** Aucun en-tête de sécurité HTTP (CSP, X-Frame-Options, X-Content-Type-Options)
- **Correctif :** Ajout de middleware définissant `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`

---

## 🔴 Domaine métier — Nouveaux bugs corrigés (analyse métier)

| # | Problème | Correctif |
|---|----------|-----------|
| 1 | `CircuitProgramItem.linked_offer_item_id` — pas de FK (ref mortes) | ✅ `@ManyToOne(() => OfferItem, { onDelete: 'SET NULL' })` |
| 2 | `Booking` — pas de `onDelete` sur les 6 relations FK | ✅ `onDelete: 'SET NULL'` sur traveler, offer, offerItem, session, guideOffering, guideOfferingSession |
| 3 | `googleLogin()` — user non sanitized (password: '' + tokens dans la réponse) | ✅ `this.sanitizeUser(user)` ajouté |
| 4 | `getPopularLocations()` — lisait `lat/lng` sur OfferItem au lieu de Offer | ✅ Chargement de la relation `offer` + `offer.latitude/longitude` |
| 5 | `findPublic()` — filtrait par `offer_type` (déprécié) au lieu de `category_id` | ✅ `offer.category_id` utilisé |
| 6 | `createGuideBooking()` — capacité `null` traitée comme 0 (bloquait réservation illimitée) | ✅ Traitement `null` = illimité |
| 7 | `price_override` sur session — jamais utilisé dans le calcul de prix | ✅ `session.price_override` prioritaire si présent |
| 8 | `Circuit.author_id` — pas de relation FK | ✅ `@ManyToOne(() => User, { onDelete: 'SET NULL' })` |
| 9 | `Event.place_id` + `created_by` — pas de FK | ✅ `@ManyToOne` vers PlaceContribution + User |
| 10 | `Review` — pas de `@Unique(['author_id', 'target_type', 'target_id'])` | ✅ Unicité ajoutée |
| 11 | `Follow` — pas de `@Unique(['follower_id', 'following_id'])` | ✅ Unicité ajoutée |
| 12 | `Friendship` — pas de `@Unique(['requester_id', 'receiver_id'])` | ✅ Unicité ajoutée |
| 13 | `Conversation` — pas de `@Unique(['participant_a_id', 'participant_b_id'])` | ✅ Unicité ajoutée |
| 14 | Password — seulement `@MinLength(6)`, pas de politique forte | ✅ `@MinLength(8)` + `@Matches()` majuscule/chiffre/spécial |
| 15 | DTOs — validation `@IsIn()` manquante sur les champs enum | ✅ Ajoutée sur 10+ champs dans 4 DTOs |

## 🔵 RESTANT (non appliqué)

| # | Problème | Sévérité | Correctif |
|---|----------|----------|-----------|
| 1 | Race conditions booking — TOCTOU (4 flux) | **HAUT** | Ajouter `SELECT ... FOR UPDATE` dans les transactions |
| 2 | Pagination absente — énumération données (6 endpoints) | **MOYEN** | Imposer `page`/`limit` ou `take: 100` par défaut |
| 3 | Swagger exposé sans restriction | **MOYEN** | Désactiver si `NODE_ENV !== 'development'` |
| 4 | Validation MIME par en-tête uniquement | **MOYEN** | Utiliser `file-type` pour détection par contenu réel |
| 5 | N+1 queries performance (publication likers, admin bans) | **BAS** | Optimiser les requêtes |
| 6 | `@Column({ select: false })` sur champs sensibles User | **MOYEN** | Ajouter sur password, tokens, failed_login_attempts (nécessite refactor des queries) |
| 7 | `simple-array` → JSONB (15+ champs) | **MOYEN** | Migration des colonnes CSV vers JSONB |
| 8 | Chiffrement PII (passeport) | **HAUT** | Chiffrer `document_number` dans BookingParticipant |

---

## 🟢 À SURVEILLER

| Problème | Détail |
|---|---|
| `.env` non commité | Déjà dans `.gitignore` — vérifier qu'il ne soit jamais ajouté |
| Upload 10MB | Limite correcte, stockage mémoire → Cloudinary (externe) |
| CORS | Allowlist d'origines configurée |
| `Math.random()` pour refs booking | Crypto faible mais usage non-sécuritaire (display ref) |

---

## Chaînes d'attaque identifiées et corrigées

| Ancienne chaîne | Impact | Break |
|---|---|---|
| Register as admin → admin JWT → full control | **CRITIQUE** | ✅ Vérification du rôle dans `register()` |
| Login → password hash leak → offline cracking → ATO | **CRITIQUE** | ✅ `sanitizeUser()` sur login + verifyEmail |
| forgot-password → énumération emails → brute-force | **HAUT** | ✅ Réponse unifiée |
| IDOR photo → supprimer photo autre utilisateur | **HAUT** | ✅ Ownership check |
| IDOR offer items → modifier prix/items d'autrui | **HAUT** | ✅ Ownership checks via chaînage `item → offer → author_id` |
| OAuth Google → CSRF → lien de compte | **HAUT** | ✅ `state: true` + express-session |

---

## Tests

- `npm test` : 7 suites, 44 tests — tous passent
- Tests actif : `register admin (403) ✓`, `login (sans leak) ✓`, `forgot-password (anti-enum) ✓`
