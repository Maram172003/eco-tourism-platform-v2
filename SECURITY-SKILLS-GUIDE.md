# Guide des Skills Security — mn-youssef/security-skills

## Installation

```bash
# Depuis la racine du projet
npx skills add mn-youssef/security-skills --yes
```

Les 16 skills sont installés dans `.agents/skills/` et automatiquement disponibles pour OpenCode.

> **Pour réinstaller après `git clean`** : relance la commande ci-dessus.

---

## C'est quoi ?

Un framework complet de **test de sécurité** pour applications web. Chaque skill est un fichier `SKILL.md` qui donne des instructions précises à l'agent OpenCode pour auditer, tester et corriger un aspect spécifique de la sécurité.

L'approche suit un cycle de vie : **RECON → PLAN → FIND → EXPLOIT → FIX → REPORT**.

---

## Les 16 Skills

| Skill | Rôle |
|---|---|
| `security-testing` | **Orchestrateur** — point d'entrée, vérifie l'autorisation, route vers les autres skills |
| `recon-and-osint` | Découvrir la surface d'attaque réelle |
| `threat-modeling` | Prioriser les risques (crown jewels) |
| `access-control-testing` | Contrôle d'accès / IDOR / escalade de privilèges (OWASP #1) |
| `authentication-testing` | Login / sessions / OAuth / JWT / MFA |
| `business-logic-testing` | Workflow / pricing / race conditions / abus |
| `api-security-testing` | REST / GraphQL / gRPC / WebSocket (OWASP API Top 10) |
| `injection-testing` | SQL/NoSQLi, command injection, SSTI, XXE |
| `client-side-exploitation` | XSS, CSP/CORS, prototype pollution, smuggling |
| `file-upload-and-ssrf` | File upload, SSRF, désérialisation |
| `secrets-management-audit` | Fuite de clés/tokens dans code, git, logs, config |
| `security-code-audit` | Revue statique (white-box) — lire le code, chercher les patterns vulnérables |
| `active-pentest` | Harness d'exécution — setup lab/proxy/scanner, exécuter des attaques |
| `vulnerability-chaining` | Chaîner plusieurs vulnérabilités en une attaque critique |
| `security-hardening` | Corriger et durcir |
| `pentest-reporting` | Score, documenter, suivre la fermeture |

---

## Comment utiliser avec OpenCode

### 1. Lancer l'orchestrateur (point d'entrée)

Dans la conversation OpenCode, demande :

```
@security-testing  Je veux auditer la sécurité de mon app
```

Ou plus simplement, commence à parler de test de sécurité et OpenCode détectera automatiquement le skill.

### 2. Invoquer un skill spécifique

Si tu veux tester un aspect précis :

```
@api-security-testing  Teste les endpoints API de /api/offers
@access-control-testing  Vérifie les permissions sur les offres
@authentication-testing  Teste le flux OAuth Google
```

### 3. Utiliser le `Skill` tool dans OpenCode

Quand tu travailles avec OpenCode, les skills se chargent automatiquement via l'outil `Skill` dans le bandeau du haut ou via la palette de commandes (`Cmd+P` → `Load Skill`).

### 4. Workflow complet typique

```
1. @security-testing → autorisation vérifiée
2.   → recommande @recon-and-osint → cartographie
3.   → recommande @threat-modeling → priorisation
4.   → @access-control-testing (OWASP #1)
5.   → @injection-testing
6.   → @api-security-testing
7.   → @vulnerability-chaining
8.   → @security-hardening
9.   → @pentest-reporting
```

---

## Connexion avec le projet (Tourisme)

Les skills sont utiles pour auditer :

- **Contrôle d'accès** : un admin ne doit pas voir les offres d'un autre, un project_owner ne doit pas approuver ses propres offres
- **API testing** : les endpoints `/offers`, `/bookings`, `/admin/offers`
- **Authentication** : le flux Google OAuth, JWT, refresh tokens
- **Injection** : les requêtes TypeORM, les entrées utilisateur
- **Business logic** : les transitions de statut des offres, les réservations, la capacité

---

## Notes importantes

- **Ne pas tester sur la prod sans autorisation écrite** → le skill exige une vérification avant chaque run
- Les skills sont en lecture seule : ils guident l'agent mais ne modifient pas le code sans ton approbation
- Un skill marqué `✓` signifie que l'agent a utilisé l'outil `Skill` pour le charger, pas seulement lu son résumé
