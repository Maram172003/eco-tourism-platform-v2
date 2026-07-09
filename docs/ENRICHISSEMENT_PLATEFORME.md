# Analyse & Enrichissement — Éco-Voyage

> **Constat :** La plateforme dépasse déjà un simple site de réservation. Elle se positionne comme un **écosystème touristique complet**, mélange de Google Maps, TripAdvisor, Airbnb Experiences, Booking, Komoot, Polarsteps et Instagram.

---

## État d'avancement

| Statut | Fonctionnalité | Détail |
|--------|---------------|--------|
| ✅ | Filtre `region` backend | `GET /offers?region=`, `GET /circuits?region=`, `GET /publications/places?region=`, `GET /publications/experiences?region=` |
| ✅ | Page Place enrichie | Navigation par ancres (sidebar desktop + tabs mobile), 8 sections : Aperçu, Galerie, Offres, Circuits, Expériences, Avis, Carte, À proximité |
| ✅ | Carte Leaflet | Remplacement iframe OSM par Leaflet avec marqueur stylé + popup |
| ✅ | Carte enrichie | Marqueurs pour lieux (vert), offres (bleu) et circuits (violet) à proximité. Légende + popups cliquables. Ajustement auto du zoom. |
| ✅ | Hero Image automatique | Recalcul auto après chaque vote/upload. La photo avec le meilleur score devient la couverture. |
| ✅ | Météo intégrée | Open-Meteo (gratuit, sans clé). Météo du jour + 5 jours sur chaque lieu. |
| ✅ | Carte enrichie | Marqueurs lieux/offres/circuits avec popups cliquables + légende |
| ✅ | Galerie centralisée Photo/Media | Galerie unifiée : photos communauté + images lieu/offres/circuits/expériences. Badges source colorés + hover voter/lien. |
| ✅ | Timeline visuelle du voyage | Nouveau module TimelineEntry (backend) + composants TimelineEditor/TimelineView (frontend). Intégré dans création, édition et détail des expériences du profil éco-voyageur. |
| ✅ | Dashboard analytics complet | Nouvel onglet "Statistiques" dans le profil guide. KPIs, graphiques offres par statut/type, réservations, derniers avis. |
| ✅ | Événements dynamiques | Nouveau module Event + section dans page lieu. Types : Festival, Concert, Marché, Compétition, Exposition, Atelier. |
| ✅ | Circuit Builder enrichi | `CircuitProgramItem` enrichi : emoji, durée (min), distance (km), mode transport + sélecteur émoji et champs dans modal "Ajouter une activité" + affichage enrichi dans l'itinéraire. Coordonnées GPS réelles pour tous les circuits. |
| ✅ | Correction data circuits | 52 jours en double supprimés de 14 circuits. Coordonnées GPS corrigées vers 52 localisations réelles (Djerba, Sahara, Tataouine, Tozeur, Kerkennah, Cap Bon, Kairouan, Tunis, Nabeul, Ain Draham). |
| ✅ | Circuit Builder Wizard enrichi | Assistant création circuit (CircuitBuilderWizard) enrichi avec émoji, durée (min), distance (km), mode transport. Création API inclut les 4 nouveaux champs. |
| ✅ | Onglet Circuits profil guide | Nouveau tab "Circuits" dans /profile/guide avec grille, statut, difficulté, durée, prix. Aperçu dans le tab "Tout". |
| ✅ | TimelineView dans circuit detail | Affichage Polarsteps-style des activités dans l'itinéraire. TimelineView enrichi avec prop renderActions pour édition/suppression hover. |
| ✅ | Niveau difficulté visuel | 🟢 Facile / 🟡 Modéré / 🔴 Difficile / ⚫ Expert sur tous les affichages circuits (7 fichiers). Backend : colonne difficulty_level. CircuitBuilderWizard + edit modal. |
| ⬜ | Q&R communautaire | |
| ⬜ | Wishlist & Collections | |
| ⬜ | Assistant IA | |

---

## 1. Les Lieux deviennent le cœur de l'application ⭐⭐⭐⭐⭐

**Aujourd'hui :** les entités sont parallèles (`Offer`, `Circuit`, `Project`, `Experience`, `Review`).

**Demain :** `Place` devient le hub central :

```
Place
│
├── Offers
├── Circuits
├── Projects
├── Experiences
├── Reviews
├── Photos
├── Videos
├── Events
├── Questions
├── Statistics
├── Weather
└── Nearby Places
```

**Exemple — Fiche Sidi Bou Saïd :**
- ★★★★☆ 4.8
- 3200 photos · 187 expériences · 24 offres · 9 circuits
- 12 restaurants · 4 hébergements · 7 projets écologiques
- 38 questions · Météo · Affluence · Carte · Historique

---

## 2. Galerie intelligente centralisée ⭐⭐⭐⭐⭐

**Aujourd'hui :** chaque entité a son propre champ `images` (`Offer.images`, `Circuit.images`, etc.).

**Demain :** une seule entité `Photo`/`Media` :

```
Photo
│
├── id
├── target_type (place|circuit|offer|experience|project|review)
├── target_id
├── author_id
├── url
├── caption
├── taken_at
├── lat / lng
├── likes / views / favorites / shares
├── hero_score
├── ai_tags
└── verified
```

Une photo peut appartenir à : lieu, circuit, offre, expérience, projet, review.

---

## 3. Hero Image automatique ⭐⭐⭐⭐⭐

Google Maps, TripAdvisor, Booking le font. Le système calcule :

```
Hero Score = likes + views + bookings + reviews + resolution + recent + verified
```

La meilleure photo devient automatiquement la couverture, sans intervention manuelle.

---

## 4. Photos communautaires ⭐⭐⭐⭐

Sur une offre aujourd'hui : photos du guide uniquement.

Demain, toutes les sources mélangées :
- **Guide** · **Voyageurs** · **Propriétaire** · **Administrateur**

Avec filtres : Toutes · Guide · Voyageurs · Récentes · Populaires · Vidéos

---

## 5. Vidéos & Médias immersifs ⭐⭐⭐⭐

Ajouter le support :
- `type: image | video | 360° | drone`
- Les voyageurs partagent des clips de 30s à 1min
- Galerie unifiée photos + vidéos

---

## 6. Expériences → Histoires de voyage ⭐⭐⭐⭐

**Aujourd'hui :** titre + description.

**Demain :**

```
Mon expérience
├── Date / Avec qui / Budget réel
├── Photos / Vidéos / Conseils
├── Ce que j'ai aimé / Ce que je referais
├── Durée réelle / Niveau difficulté / Note
└── Timeline embarquée (J'ai commencé → Marché → Mangé → Photo → Conseil)
```

Comme Polarsteps.

---

## 7. Timeline visuelle du voyage ⭐⭐⭐⭐

Au lieu d'une liste d'offres par jour :

```
08:00  🚐 Départ
        ↓ 45 min · 12 km
09:30  🛶 Kayak (🌤️ 28°C)
        ↓ 30 min
13:00  🍽️ Restaurant
        ↓
15:00  🏛️ Musée
        ↓
18:00  ⛺ Camping
```

Avec : distance · budget cumulé · météo par étape · transport · durée réelle

---

## 8. Routes & Itinéraires ⭐⭐⭐

**Aujourd'hui :** waypoints dans les circuits.

**Demain :** entité `Route` avec :
- Distance · Temps voiture/vélo/marche
- Altitude · Difficulté
- Intégration OSRM / GraphHopper / Valhalla

---

## 9. Points d'intérêt & Proximité ⭐⭐⭐

Une offre peut être proche de :
- Musée · Plage · Restaurant · Hôtel
- Projet écologique · Camping · Marché · Forêt

Affichage : "Autour de vous · 500m · 1km · 5km · 10km"

---

## 10. Carte vivante façon Google Maps ⭐⭐⭐⭐⭐

**Aujourd'hui :** marker simple.

**Demain :** chaque marqueur affiche :
- Photo hero · Prix · Note · Popularité
- Disponibilité · Ouvert/fermé · Distance
- Clustering intelligent · Filtres visuels

---

## 11. Disponibilité intelligente ⭐⭐⭐⭐

**Aujourd'hui :** disponible/non disponible.

**Demain :**
- ✅ Disponible · ⚠️ Dernières places · ❌ Complet
- 🔄 Annulé · 📅 Ouverture prochaine · 🔜 Bientôt disponible

---

## 12. Météo intégrée ⭐⭐⭐⭐

Sur chaque activité et lieu :
- Aujourd'hui · Demain · Week-end
- Alerte : "⚠️ Vent fort demain — Kayak déconseillé"
- Suggestion de date alternative

---

## 13. Affluence en temps réel ⭐⭐⭐

Basée sur les réservations et vues :
- 🔴 Très fréquenté · 🟡 Calme · 🟢 Heure idéale
- Meilleur moment pour visiter

---

## 14. Événements dynamiques ⭐⭐⭐⭐

Chaque lieu possède une section Événements :
- Festival · Concert · Marché · Compétition · Exposition
- Filtres : Aujourd'hui · Cette semaine · Ce mois
- Réservation intégrée

---

## 15. Dashboard Guide — Analytics ⭐⭐⭐⭐

**Aujourd'hui :** réservations.

**Demain :**
- Photos vues · Images populaires · Offres populaires
- Temps moyen passé · Nombre de clics
- Origine visiteurs · Revenus · Calendrier
- Taux remplissage · Avis · Classement
- Taux de conversion · Abandons réservation

---

## 16. Dashboard Voyageur ⭐⭐⭐⭐

- Pays visités · Régions explorées
- Budget total · CO₂ économisé
- Kilomètres parcourus · Photos partagées
- Badges · Favoris · Wishlist · Expériences vécues

---

## 17. Wishlist & Collections ⭐⭐⭐

**Wishlist** (différente des favoris) :
- "Je veux faire" · "Cet été" · "L'année prochaine" · "Voyage de rêve"

**Collections** (comme Pinterest) :
- Voyage désert · Voyage famille · Voyage romantique
- Voyage randonnée · Voyage culturel

Chaque collection contient : Offres · Circuits · Lieux · Restaurants · Hôtels

---

## 18. Comparateur ⭐⭐⭐

Comparer 2 offres / circuits / hébergements :
- Prix · Durée · Distance · Avis
- Disponibilité · Éco-score · Inclus
- Tableau côte-à-côte

---

## 19. Q&R communautaire ⭐⭐⭐

Comme Google Maps "Questions & Réponses" :
- Les voyageurs posent des questions sur un lieu
- Guides/propriétaires/voyageurs répondent
- Upvote des réponses utiles
- Notification au propriétaire

---

## 20. Assistant IA (en dernier) ⭐⭐⭐

**À implémenter après le cœur métier.**

L'utilisateur écrit :
> "4 jours · 600 TND · famille · nature · kayak · sans voiture"

L'IA génère :
- TripPlan complet (jour par jour)
- Réservations possibles
- Budget estimé
- Calendrier · Itinéraires · Offres adaptées

---

## Matrice de priorité

| Priorité | Fonctionnalité | Effort | Impact |
|----------|---------------|--------|--------|
| ⭐⭐⭐⭐⭐ | Entité **Place** centrale | Moyen | Très élevé |
| ⭐⭐⭐⭐⭐ | Galerie centralisée **Photo/Media** | Moyen | Très élevé |
| ⭐⭐⭐⭐⭐ | **Hero Image** automatique | Faible | Très élevé |
| ⭐⭐⭐⭐⭐ | **Carte enrichie** façon Google Maps | Moyen | Très élevé |
| ⭐⭐⭐⭐ | **Timeline** visuelle du voyage | Moyen | Élevé |
| ⭐⭐⭐⭐ | **Dashboard analytics** complet | Faible | Élevé |
| ⭐⭐⭐⭐ | Disponibilités et événements intelligents | Moyen | Élevé |
| ⭐⭐⭐⭐ | **Météo** intégrée | Faible | Moyen |
| ⭐⭐⭐⭐ | **Vidéos** et médias | Moyen | Élevé |
| ⭐⭐⭐ | Collections, Wishlist, Comparaison | Faible | Moyen |
| ⭐⭐⭐ | **Q&R** communautaire | Moyen | Moyen |
| ⭐⭐⭐ | **Routes** et itinéraires | Moyen | Moyen |
| ⭐⭐⭐ | Assistant IA | Élevé | Très élevé |

---

## Conclusion

Si ces éléments sont réalisés, **Éco-Voyage ne sera plus une plateforme de réservation**, mais un véritable **écosystème de découverte, de planification, de partage et de gestion du tourisme durable**, où :

- Les **lieux** sont au centre de tout
- Les **offres, circuits, expériences et projets** sont interconnectés
- La **communauté** contribue (photos, avis, questions, histoires)
- Les **données** (météo, affluence, popularité) enrichissent l'expérience
- L'**analytics** guide les décisions des guides et propriétaires
- L'**IA** assiste (et non remplace) la planification

C'est ce type d'intégration qui différencie un produit complet d'une simple application.

Prêt pour la prochaine étape. Suggestions :
1. **Onglet Circuits dans profil guide** — lister les circuits créés par le guide dans `/profile/guide`
2. **Intégrer TimelineView dans circuits** — affichage Polarsteps-style dans le détail public d'un circuit
3. **Niveau de difficulté visuel** — 🟢 Facile / 🟡 Modéré / 🔴 Difficile / ⚫ Expert sur les cartes circuits
4. **Q&R communautaire** — questions/réponses sur les lieux (comme Google Maps)
5. **Wishlist & Collections** — listes de souhaits + collections type Pinterest
6. **Autre** (précise)