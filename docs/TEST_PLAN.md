# Plan de Tests Métier — Éco-Voyage

> **Dernière mise à jour :** 5 Juillet 2026

## Sprint 11 — Tests Bout en Bout

### 11.1 Création d'offre

| # | Scénario | Résultat attendu | Statut |
|---|----------|------------------|--------|
| 1 | Project owner crée offre hébergement | Offer créée avec project_id, status=pending | ✅ |
| 2 | Guide crée prestation randonnée | GuideOffering créée avec guide_id, availability rules | ✅ |
| 3 | Propriétaire modifie prix offre | Prix mis à jour, circuits existants inchangés | ✅ |
| 4 | Propriétaire ajoute OfferItem + Price | Item créé, prix visible dans le catalogue | ✅ |
| 5 | Propriétaire ajoute Session + Capacity | Session créée, capacité décrémentable | ✅ |

### 11.2 Réservation

| # | Scénario | Résultat attendu | Statut |
|---|----------|------------------|--------|
| 1 | Réservation simple (1 personne) | Booking créé, capacité décrémentée, notification envoyée | ✅ |
| 2 | Réservation circuit (3 personnes) | CircuitReservation créée, capacité décrémentée pour chaque activité | ✅ |
| 3 | Réservation session complète | Erreur "Capacité insuffisante" | ✅ |
| 4 | Annulation avant délai | Capacité restaurée, notifications envoyées | ✅ |
| 5 | Annulation après délai | Erreur "Délai d'annulation dépassé" | ✅ |
| 6 | Double réservation même session | Erreur "Vous avez déjà réservé" | ✅ |
| 7 | Réservation avec guide | guide_offering_id lié, guide notifié | ✅ |

### 11.3 Circuit

| # | Scénario | Résultat attendu | Statut |
|---|----------|------------------|--------|
| 1 | Créer circuit 3 jours | Circuit créé avec 3 CircuitDays | ✅ |
| 2 | Ajouter activité "ma offre" | linked_offer_item_id = mon item, prix pré-rempli | ✅ |
| 3 | Ajouter activité "offre externe" | linked_offer_item_id = item tiers | ✅ |
| 4 | Ajouter activité "guide" | guide_id lié, guide_cost récupéré | ✅ |
| 5 | Ajouter activité "référence externe" | external_reference JSONB sauvegardé | ✅ |
| 6 | Modifier prix activité | Prix circuit modifié, prix catalogue inchangé | ✅ |
| 7 | Supprimer activité | Activité supprimée, capacité non affectée | ✅ |
| 8 | Supprimer offre liée à circuit | Erreur "X circuit(s) utilisent cette offre" | ✅ |

### 11.4 Recherche

| # | Scénario | Résultat attendu | Statut |
|---|----------|------------------|--------|
| 1 | Recherche offre par région | Offres de la région affichées | ✅ |
| 2 | Recherche guide par zone + date | Guides disponibles à cette date | ✅ |
| 3 | Recherche circuit par durée + difficulté | Circuits correspondants | ✅ |
| 4 | Recherche hébergement dans Circuit Builder | 3 niveaux fonctionnent (propre → autre → externe) | ✅ |
| 5 | Recherche avec filtres combinés | Filtres cumulés fonctionnent | ✅ |

### 11.5 Guide

| # | Scénario | Résultat attendu | Statut |
|---|----------|------------------|--------|
| 1 | Guide crée prestation avec availability rule | Sessions générées pour 90 jours | ✅ |
| 2 | Guide bloque une période | Blocks créés, sessions correspondantes annulées | ✅ |
| 3 | Guide modifie prix saisonnier | price_override sur les sessions | ✅ |
| 4 | Voyageur cherche guide disponible | Guides avec sessions available affichés | ✅ |
| 5 | Voyageur réserve prestation guide | Booking + GuideOfferingSession liés | ✅ |
