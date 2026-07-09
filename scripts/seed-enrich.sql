-- ============================================================
-- ECO-VOYAGE : Enrichissement complet de la base de données
-- ============================================================
-- Utilisateurs existants (IDs de référence) :
-- 92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e | fakerbennoomen@gmail.com       | project
-- 7b83e87d-276d-4d89-bb00-ab8ea1243a14 | f.akerbennoomen@gmail.com      | eco_traveler
-- faf06ea0-3c4a-4cff-b180-5ff4bedab682 | admin@gmail.com                | admin
-- a602737a-b07d-4a41-b9c3-cdf1be17036a | l.eila.fakerbennoomen@gmail.com| eco_traveler
-- b09808ee-30a9-4089-bbf7-698e73004ef4 | ah.m.edfakerbennoomen@gmail.com| eco_traveler
-- 90b4c5bf-4a47-4737-b033-f7385e22a2e6 | sarah.b.akerbennoomen@gmail.com| eco_traveler
-- 3f8cb3e8-b8d1-4d27-a9ff-1b6699079b9f | me.d.fakerbennoomen@gmail.com  | project
-- 8148d448-9c88-4aa3-b2f1-7d71bc112f12 | n.our.fakerbennoomen@gmail.com | project
-- 87a38946-9a54-4bb4-be4a-887be312af15 | y.m.eslek.amirbennoomen@gmail.com | guide
-- 6fb2d1e7-39db-4152-b9b5-5b440f551cc9 | k.arim.amirbennoomen@gmail.com | guide

BEGIN;

-- ============================================================
-- 1. ENRICHIR LES PUBLICATIONS EXISTANTES
-- ============================================================

UPDATE publications SET
  description = 'La forêt de Fernana est un joyau naturel du nord-ouest de la Tunisie. Avec ses chênes-lièges centenaires, ses ruisseaux cristallins et sa biodiversité exceptionnelle, elle offre des randonnées inoubliables au cœur de la Kroumirie. Observez les oiseaux migrateurs, respirez l''air pur et découvrez la flore méditerranéenne dans son plus bel écrin.',
  images = ARRAY['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', 'https://images.unsplash.com/photo-1470071459604-7c47ec0c3e67?w=800', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'],
  category = 'nature',
  tags = ARRAY['foret', 'randonnee', 'kroumirie', 'nature', 'oiseaux', 'chenes'],
  popularity_score = 42,
  place_name = 'Forêt de Fernana',
  region = 'Jendouba'
WHERE id = '92322472-e0c2-44f2-8046-803cdb45e2c8';

UPDATE publications SET
  description = 'Béja, ville historique du nord de la Tunisie, est un écrin de verdure au pied du Djebel Ammar. Ses vestiges romains, sa médina authentique et ses paysages de collines verdoyantes en font une destination idéale pour les amateurs d''histoire et de nature. Ne manquez pas le site archéologique de Dougga, classé UNESCO, à quelques kilomètres de là.',
  images = ARRAY['https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=800', 'https://images.unsplash.com/photo-1599751449128-eb724f1ea60b?w=800'],
  category = 'monument',
  tags = ARRAY['histoire', 'romain', 'medina', 'dougga', 'unesco', 'culture'],
  popularity_score = 28,
  place_name = 'Béja Ville',
  region = 'Beja'
WHERE id = '165a72fb-e0c4-482f-aae0-147c87e7e214';

-- ============================================================
-- 2. AJOUTER DE NOUVEAUX LIEUX (type='place')
-- ============================================================

INSERT INTO publications (id, author_id, type, title, description, images, latitude, longitude, place_name, region, category, tags, popularity_score, status, created_at, updated_at) VALUES

-- 2.1 Sidi Bou Said
(gen_random_uuid(), '7b83e87d-276d-4d89-bb00-ab8ea1243a14', 'place',
 'Sidi Bou Saïd',
 'Perché sur une falaise surplombant la mer Méditerranée, Sidi Bou Saïd est le village bleu et blanc le plus emblématique de Tunisie. Ses ruelles pavées, ses portes ornées et ses jasmins parfumés ont inspiré artistes et écrivains du monde entier. Dégustez un thé aux pignons au Café des Délices face au coucher de soleil.',
 ARRAY['https://images.unsplash.com/photo-1590132989126-f7bcad5b0dba?w=800', 'https://images.unsplash.com/photo-1603954520848-0e2db2e94555?w=800', 'https://images.unsplash.com/photo-1581285653450-3b1e9a20555e?w=800'],
 36.8687, 10.3414, 'Sidi Bou Saïd', 'Tunis', 'monument',
 ARRAY['village', 'bleu-et-blanc', 'cafe', 'coucher-de-soleil', 'art', 'mediterranee'],
 85, 'approved', NOW(), NOW()),

-- 2.2 Carthage
(gen_random_uuid(), 'a602737a-b07d-4a41-b9c3-cdf1be17036a', 'place',
 'Site Archéologique de Carthage',
 'Carthage, l''une des plus grandes civilisations de l''Antiquité, offre aujourd''hui aux visiteurs des thermes d''Antonin aux ports puniques en passant par le quartier des villas romaines. Classé au patrimoine mondial de l''UNESCO, ce site immense se visite à pied ou en petit train touristique.',
 ARRAY['https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800', 'https://images.unsplash.com/photo-1590868309234-5ce5e0cd6b6f?w=800'],
 36.8522, 10.3312, 'Carthage', 'Tunis', 'monument',
 ARRAY['unesco', 'histoire', 'romain', 'punique', 'antiquite', 'thermes'],
 72, 'approved', NOW(), NOW()),

-- 2.3 Plage de Hammamet
(gen_random_uuid(), 'b09808ee-30a9-4089-bbf7-698e73004ef4', 'place',
 'Plage de Hammamet',
 'Les plages de sable fin de Hammamet s''étendent sur des kilomètres le long de la côte turquoise. Avec ses clubs de plage animés, ses sports nautiques et ses restaurants de poissons grillés, c''est la destination balnéaire par excellence. Le fort de Hammamet et sa médina ajoutent une touche culturelle à votre séjour.',
 ARRAY['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', 'https://images.unsplash.com/photo-1590523277543-94b0e8c3e1b0?w=800'],
 36.4000, 10.6167, 'Hammamet Plage', 'Nabeul', 'plage',
 ARRAY['plage', 'baignade', 'sports-nautiques', 'fort', 'medina', 'soleil'],
 58, 'approved', NOW(), NOW()),

-- 2.4 Amphithéâtre d'El Jem
(gen_random_uuid(), '90b4c5bf-4a47-4737-b033-f7385e22a2e6', 'place',
 'Amphithéâtre d''El Jem',
 'L''amphithéâtre d''El Jem est le troisième plus grand colisée du monde après Rome et Capoue. Avec ses 35 000 places, ce monument romain du IIIe siècle est d''une conservation exceptionnelle. Montez au sommet des gradins pour une vue panoramique sur la ville et imaginez les combats de gladiateurs d''antan.',
 ARRAY['https://images.unsplash.com/photo-1558624218-1a4c0b8429e4?w=800', 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800'],
 35.2967, 10.7067, 'El Jem', 'Mahdia', 'monument',
 ARRAY['colisee', 'romain', 'unesco', 'gladiateur', 'histoire', 'monument'],
 65, 'approved', NOW(), NOW()),

-- 2.5 Restaurant Le Pirate (Djerba)
(gen_random_uuid(), '7b83e87d-276d-4d89-bb00-ab8ea1243a14', 'place',
 'Restaurant Le Pirate - Djerba',
 'Le Pirate est le restaurant emblématique de l''île de Djerba, perché sur les hauteurs d''Houmt Souk avec une vue imprenable sur la mer. Spécialisé dans les fruits de mer frais et la cuisine tunisienne revisitée, il est réputé pour son couscous poisson, ses bricks et son ambiance unique au coucher du soleil.',
 ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', 'https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=800'],
 33.8680, 10.8490, 'Houmt Souk', 'Djerba', 'restaurant',
 ARRAY['cuisine', 'poisson', 'fruits-de-mer', 'coucher-de-soleil', 'gastronomie', 'djerba'],
 44, 'approved', NOW(), NOW()),

-- 2.6 Oasis de Chebika
(gen_random_uuid(), '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'place',
 'Oasis de Chebika',
 'Chebika est l''une des plus belles oasis de montagne de Tunisie. Située au pied du Djebel El Negueb, cette oasis aux eaux cristallines offre un contraste saisissant entre le vert des palmiers et le rouge des falaises. Une cascade naturelle jaillit des rochers, créant un bassin où il fait bon se rafraîchir. Lieu de tournage du film "Le Patient Anglais".',
 ARRAY['https://images.unsplash.com/photo-1567607686044-aef63c7e53bc?w=800', 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800'],
 34.3167, 7.9333, 'Chebika', 'Tozeur', 'nature',
 ARRAY['oasis', 'cascade', 'palmiers', 'desert', 'montagne', 'film'],
 55, 'approved', NOW(), NOW()),

-- 2.7 Musée du Bardo
(gen_random_uuid(), '3f8cb3e8-b8d1-4d27-a9ff-1b6699079b9f', 'place',
 'Musée National du Bardo',
 'Le Musée du Bardo est le plus grand musée de Tunisie et l''un des plus importants musées d''art romain et de mosaïques au monde. Installé dans un palais beylical du XIXe siècle, il abrite des collections exceptionnelles de mosaïques romaines, d''art islamique et de vestiges puniques. La salle des mosaïques de Virgile est à couper le souffle.',
 ARRAY['https://images.unsplash.com/photo-1566127444979-b0af05ccef63?w=800', 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800'],
 36.8097, 10.1344, 'Le Bardo', 'Tunis', 'musee',
 ARRAY['mosaique', 'romain', 'musee', 'art', 'histoire', 'palais'],
 48, 'approved', NOW(), NOW()),

-- 2.8 Atelier Artisanat de Guellala
(gen_random_uuid(), '8148d448-9c88-4aa3-b2f1-7d71bc112f12', 'place',
 'Atelier de Poterie de Guellala',
 'Guellala est le village des potiers de Djerba. Depuis des siècles, ses artisans façonnent l''argile locale pour créer des poteries traditionnelles aux formes et motifs uniques. Visitez les ateliers, observez les artisans au travail et repartez avec des souvenirs authentiques : tajines, jarres, plats décoratifs ou lampes en terre cuite.',
 ARRAY['https://images.unsplash.com/photo-1565193566173-7fc51e6c6443?w=800', 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800'],
 33.7800, 10.9200, 'Guellala', 'Djerba', 'artisanat',
 ARRAY['poterie', 'artisanat', 'argile', 'tradition', 'souvenir', 'djerba'],
 36, 'approved', NOW(), NOW()),

-- 2.9 Randonnée Djebel Zaghouan
(gen_random_uuid(), '87a38946-9a54-4bb4-be4a-887be312af15', 'place',
 'Djebel Zaghouan',
 'Le Djebel Zaghouan est le sommet emblématique du nord-est de la Tunisie culminant à 1295 mètres. C''est le paradis des randonneurs avec ses sentiers à travers forêts de pins d''Alep et de chênes verts. Au sommet, le temple des Eaux, vestige romain dédié à Neptune, offre une vue à 360° sur la plaine jusqu''à la mer.',
 ARRAY['https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800'],
 36.4000, 10.1500, 'Djebel Zaghouan', 'Zaghouan', 'aventure',
 ARRAY['randonnee', 'sommet', 'foret', 'romain', 'vue', 'nature'],
 39, 'approved', NOW(), NOW()),

-- 2.10 Hébergement - Campement Sahara
(gen_random_uuid(), '6fb2d1e7-39db-4152-b9b5-5b440f551cc9', 'place',
 'Campement Berbère du Sahara',
 'Vivez l''expérience unique d''une nuit en plein désert du Sahara dans un campement berbère traditionnel. Tentes caïdales confortables, dîner sous les étoiles, musique touareg autour du feu et lever de soleil sur les dunes de sable. Une immersion totale dans la culture nomade du sud tunisien, à proximité de Douz, la porte du Sahara.',
 ARRAY['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800'],
 33.4618, 9.0299, 'Douz', 'Kebili', 'hebergement',
 ARRAY['desert', 'nomade', 'berbere', 'etoiles', 'tente', 'sahara'],
 52, 'approved', NOW(), NOW()),

-- 2.11 Plage de Sidi Mansour (Kerkennah)
(gen_random_uuid(), 'a602737a-b07d-4a41-b9c3-cdf1be17036a', 'place',
 'Plage de Sidi Mansour - Kerkennah',
 'Les plages préservées de l''archipel de Kerkennah offrent un cadre idyllique loin du tourisme de masse. Sidi Mansour est la plus belle plage de l''île, avec son sable blanc et ses eaux turquoise peu profondes. Idéal pour les familles, le snorkeling et la contemplation des voiliers traditionnels.',
 ARRAY['https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800', 'https://images.unsplash.com/photo-1552083375-1447ce886485?w=800'],
 34.7167, 11.2000, 'Sidi Mansour', 'Kerkennah', 'plage',
 ARRAY['plage', 'saul', 'snorkeling', 'famille', 'calme', 'archipel'],
 34, 'approved', NOW(), NOW()),

-- 2.12 Ksar Ghilane - oasis de la passion
(gen_random_uuid(), 'b09808ee-30a9-4089-bbf7-698e73004ef4', 'place',
 'Ksar Ghilane',
 'Ksar Ghilane est la plus méridionale des oasis tunisiennes, accessible après 40 km de piste à travers le désert. Une source d''eau chaude naturelle jaillit au cœur des palmiers, créant une piscine naturelle où se baigner après une journée de désert. Les dunes alentour offrent des balades à dos de dromadaire inoubliables.',
 ARRAY['https://images.unsplash.com/photo-1462362645004-0d1c72a854e6?w=800', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'],
 32.9833, 9.6333, 'Ksar Ghilane', 'Tataouine', 'nature',
 ARRAY['oasis', 'source-chaude', 'dune', 'dromadaire', 'desert', 'detente'],
 46, 'approved', NOW(), NOW()),

-- 2.13 Restaurant Dar El Jeld (Tunis)
(gen_random_uuid(), '90b4c5bf-4a47-4737-b033-f7385e22a2e6', 'place',
 'Dar El Jeld - Restaurant Gastronomique',
 'Installé dans une magnifique demeure du XVIIIe siècle au cœur de la médina de Tunis, Dar El Jeld est le temple de la gastronomie tunisienne haut de gamme. Son patio andalou, ses salons richement décorés et sa cuisine raffinée en font une expérience culinaire inoubliable. Dégustez le couscous royal ou la mesfouf aux fruits secs.',
 ARRAY['https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', 'https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?w=800'],
 36.7986, 10.1694, 'Médina de Tunis', 'Tunis', 'restaurant',
 ARRAY['gastronomie', 'tradition', 'patio', 'medina', 'cuisine', 'luxe'],
 62, 'approved', NOW(), NOW()),

-- 2.14 Aventure - Canyon d'Oued Selja
(gen_random_uuid(), '7b83e87d-276d-4d89-bb00-ab8ea1243a14', 'place',
 'Canyon d''Oued Selja',
 'Le canyon d''Oued Selja, près de Métlaoui, est un site géologique spectaculaire où les eaux ont creusé des gorges vertigineuses dans la roche calcaire. Les parois ocre et rouges atteignent 200 mètres de hauteur. Le train du Lézard Rouge traverse ce décor lunaire, offrant l''un des plus beaux paysages ferroviaires du monde.',
 ARRAY['https://images.unsplash.com/photo-1586607629075-0c80f7187697?w=800', 'https://images.unsplash.com/photo-1585409788173-0ae7c9376a43?w=800'],
 34.2833, 8.4000, 'Oued Selja', 'Gafsa', 'aventure',
 ARRAY['canyon', 'geologie', 'train', 'lezard-rouge', 'gorge', 'photographie'],
 40, 'approved', NOW(), NOW()),

-- 2.15 Plage de Ras Angela (Bizerte)
(gen_random_uuid(), '3f8cb3e8-b8d1-4d27-a9ff-1b6699079b9f', 'place',
 'Ras Angela - Cap Blanc',
 'Ras Angela, ou Cap Blanc, est le point le plus septentrional de l''Afrique continentale. Ses falaises blanches plongeant dans la Méditerranée offrent un spectacle grandiose. La plage sauvage en contrebas est un havre de paix pour les amoureux de nature préservée. Observation des oiseaux migrateurs et pêche à la ligne sont les activités phares.',
 ARRAY['https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800', 'https://images.unsplash.com/photo-1534008897995-27a23e2e0e12?w=800'],
 37.3458, 9.7417, 'Ras Angela', 'Bizerte', 'plage',
 ARRAY['cap', 'afrique', 'falaise', 'phare', 'nature', 'sauvage'],
 31, 'approved', NOW(), NOW());

-- ============================================================
-- 3. AJOUTER DES EXPÉRIENCES (type='experience')
-- ============================================================

INSERT INTO publications (id, author_id, type, title, description, images, category, tags, popularity_score, status, created_at, updated_at) VALUES

(gen_random_uuid(), '7b83e87d-276d-4d89-bb00-ab8ea1243a14', 'experience',
 'Nuit magique dans le désert de Tozeur',
 'Une expérience inoubliable ! Nous avons passé une nuit dans un campement berbère au cœur du Sahara. Le dîner traditionnel sous un ciel étoilé était tout simplement magique. Le lendemain, nous avons fait une balade à dos de dromadaire au lever du soleil sur les dunes. Les hôtes étaient adorables et la nourriture délicieuse. Recommandé à 100% !',
 ARRAY['https://images.unsplash.com/photo-1547234935-80c7145ec969?w=800', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'],
 NULL, ARRAY['desert', 'etoiles', 'dromadaire', 'campement', 'sahara', 'magique'],
 33, 'approved', NOW(), NOW()),

(gen_random_uuid(), 'a602737a-b07d-4a41-b9c3-cdf1be17036a', 'experience',
 'Kayak au lever du soleil à Korba',
 'Réveil à 5h30 pour une sortie kayak sur la côte de Korba. Le spectacle du soleil se levant sur la mer était à couper le souffle. L''eau était calme et transparente, on voyait les poissons sous nos pagaies. Notre guide Jamel nous a montré des criques secrètes accessibles seulement par la mer. Un moment de pure connexion avec la nature.',
 ARRAY['https://images.unsplash.com/photo-1574646272156-f6245aa32266?w=800'],
 NULL, ARRAY['kayak', 'lever-du-soleil', 'mer', 'crique', 'aventure', 'corba'],
 27, 'approved', NOW(), NOW()),

(gen_random_uuid(), 'b09808ee-30a9-4089-bbf7-698e73004ef4', 'experience',
 'Atelier poterie en famille à Guellala',
 'Nous avons passé un après-midi merveilleux en famille à l''atelier de poterie de Guellala. Le maître potier nous a appris à tourner l''argile, et les enfants ont adoré créer leurs propres petites œuvres (bien que très maladroites !). Repartis avec nos créations séchées et émaillées, c''est un souvenir précieux de notre séjour à Djerba.',
 ARRAY['https://images.unsplash.com/photo-1565193566173-7fc51e6c6443?w=800', 'https://images.unsplash.com/photo-1491914096647-d1e8cc96ee66?w=800'],
 NULL, ARRAY['poterie', 'famille', 'atelier', 'artisanat', 'guellala', 'djerba'],
 21, 'approved', NOW(), NOW()),

(gen_random_uuid(), '90b4c5bf-4a47-4737-b033-f7385e22a2e6', 'experience',
 'Randonnée inoubliable dans les gorges de la Medjerda',
 'Une randonnée de 6 heures à travers les gorges sauvages de la Medjerda, le plus long fleuve de Tunisie. Paysages à couper le souffle entre canyons, forêts de chênes-lièges et villages perchés. Nous avons croisé des sangliers et des aigles. Le pique-nique préparé par notre guide au bord d''une cascade était délicieux. Un must pour les amoureux de la nature.',
 ARRAY['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800'],
 NULL, ARRAY['randonnee', 'gorge', 'cascade', 'foret', 'nature', 'medjerda'],
 19, 'approved', NOW(), NOW()),

(gen_random_uuid(), '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'experience',
 'Cours de cuisine djerbienne chez l''habitant',
 'Une expérience authentique et chaleureuse ! Fatma, une dame djerbienne de 70 ans, nous a accueillis chez elle pour nous apprendre les secrets de la cuisine traditionnelle. Nous avons préparé un couscous au poisson, des bricks et un mesfouf. Elle nous a transmis ses recettes de famille avec passion. Le repas partagé ensemble restera gravé dans ma mémoire.',
 ARRAY['https://images.unsplash.com/photo-1556911220-bffb3bedd9b0?w=800', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'],
 NULL, ARRAY['cuisine', 'tradition', 'djerba', 'poisson', 'famille', 'partage'],
 38, 'approved', NOW(), NOW()),

(gen_random_uuid(), '8148d448-9c88-4aa3-b2f1-7d71bc112f12', 'experience',
 'Plongée sous-marine au large de Tabarka',
 'Première plongée sous-marine de ma vie et quelle expérience ! Les fonds marins de Tabarka sont exceptionnels avec leurs grottes, leurs gorgones et une faune abondante : mérous, murènes, barracudas et même une tortue. Le centre de plongée est très professionnel, moniteur patient et rassurant. Je recommande la plongée de jour comme de nuit !',
 ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', 'https://images.unsplash.com/photo-1506968430777-bf7784a4f23e?w=800'],
 NULL, ARRAY['plongee', 'sous-marin', 'tabarka', 'poissons', 'grotte', 'decouverte'],
 24, 'approved', NOW(), NOW());

-- ============================================================
-- 4. COMMENTAIRES SUR LES PUBLICATIONS
-- ============================================================

-- On récupère les IDs des publications récemment insérées
-- On utilise une astuce WITH pour référencer les nouveaux IDs

WITH place_ids AS (
  SELECT id, title FROM publications WHERE type = 'place' AND created_at >= NOW() - interval '1 minute'
)
INSERT INTO publication_comments (id, publication_id, author_id, author_role, content, created_at)
SELECT gen_random_uuid(), p.id, '7b83e87d-276d-4d89-bb00-ab8ea1243a14', 'eco_traveler',
  CASE p.title
    WHEN 'Sidi Bou Saïd' THEN 'Le meilleur endroit pour admirer le coucher de soleil ! Le thé aux pignons est incontournable.'
    WHEN 'Site Archéologique de Carthage' THEN 'Prévoyez au moins 3 heures pour tout voir. Les thermes d''Antonin sont impressionnants.'
    WHEN 'Plage de Hammamet' THEN 'Eau magnifique et sable fin. Attention le week-end c''est très fréquenté.'
    WHEN 'Amphithéâtre d''El Jem' THEN 'À couper le souffle ! Mieux conservé que le Colisée de Rome.'
    WHEN 'Restaurant Le Pirate - Djerba' THEN 'Le meilleur poisson que j''ai mangé de toute ma vie !'
    WHEN 'Oasis de Chebika' THEN 'L''eau est fraîche et transparente. Un vrai paradis au milieu du désert.'
    WHEN 'Musée National du Bardo' THEN 'Les mosaïques sont exceptionnelles, prévoyez une demi-journée.'
    WHEN 'Atelier de Poterie de Guellala' THEN 'Les potiers sont très accueillants et expliquent bien leur art.'
    WHEN 'Djebel Zaghouan' THEN 'Belle randonnée mais prévoyez de bonnes chaussures et beaucoup d''eau !'
    WHEN 'Campement Berbère du Sahara' THEN 'Nuit inoubliable sous les étoiles. Le dîner autour du feu est magique.'
    WHEN 'Plage de Sidi Mansour - Kerkennah' THEN 'Calme et préservée, parfaite pour les familles avec enfants.'
    WHEN 'Ksar Ghilane' THEN 'Le bain dans la source chaude après la piste est incroyablement relaxant.'
    WHEN 'Dar El Jeld - Restaurant Gastronomique' THEN 'Le cadre est magnifique et la cuisine est un véritable voyage gustatif.'
    WHEN 'Canyon d''Oued Selja' THEN 'Le train du Lézard Rouge traverse des paysages lunaires uniques au monde.'
    WHEN 'Ras Angela - Cap Blanc' THEN 'Faire le plein d''air pur et admirer la vue sur la Méditerranée.'
    ELSE 'Superbe endroit, je recommande vivement !'
  END,
  NOW() - (random() * interval '15 days')
FROM place_ids p;

-- Plus de commentaires d'autres utilisateurs
INSERT INTO publication_comments (id, publication_id, author_id, author_role, content, created_at)
SELECT gen_random_uuid(), p.id, u.user_id::uuid, u.role,
  CASE floor(random() * 5)::int
    WHEN 0 THEN 'Magnifique endroit, j''y retournerai avec plaisir !'
    WHEN 1 THEN 'Les photos ne rendent pas justice à la beauté du lieu.'
    WHEN 2 THEN 'Un guide est recommandé pour profiter pleinement de la visite.'
    WHEN 3 THEN 'Accès facile et bien indiqué. À ne pas manquer !'
    ELSE 'Superbe découverte, merci pour le partage !'
  END,
  NOW() - (random() * interval '20 days')
FROM publications p
CROSS JOIN (
  VALUES
    ('a602737a-b07d-4a41-b9c3-cdf1be17036a', 'eco_traveler'),
    ('b09808ee-30a9-4089-bbf7-698e73004ef4', 'eco_traveler'),
    ('90b4c5bf-4a47-4737-b033-f7385e22a2e6', 'eco_traveler'),
    ('87a38946-9a54-4bb4-be4a-887be312af15', 'guide')
) AS u(user_id, role)
WHERE p.status = 'approved' AND p.type = 'place'
AND NOT EXISTS (
  SELECT 1 FROM publication_comments pc
  WHERE pc.publication_id = p.id AND pc.author_id = u.user_id::uuid
)
LIMIT 40;

-- Réponses aux commentaires
INSERT INTO publication_comments (id, publication_id, author_id, author_role, parent_id, content, created_at)
SELECT gen_random_uuid(), c.publication_id, '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'project',
  c.id, 'Merci pour votre retour ! Nous sommes ravis que vous ayez apprécié.',
  c.created_at + interval '1 day'
FROM publication_comments c
WHERE c.author_id != '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'::uuid
AND c.parent_id IS NULL
AND random() < 0.3
LIMIT 10;

-- ============================================================
-- 5. LIKES SUR LES PUBLICATIONS
-- ============================================================

INSERT INTO publication_likes (id, publication_id, user_id, user_role, created_at)
SELECT gen_random_uuid(), p.id, u.user_id::uuid, u.role,
  NOW() - (random() * interval '20 days')
FROM publications p
CROSS JOIN (
  VALUES
    ('7b83e87d-276d-4d89-bb00-ab8ea1243a14', 'eco_traveler'),
    ('a602737a-b07d-4a41-b9c3-cdf1be17036a', 'eco_traveler'),
    ('b09808ee-30a9-4089-bbf7-698e73004ef4', 'eco_traveler'),
    ('90b4c5bf-4a47-4737-b033-f7385e22a2e6', 'eco_traveler'),
    ('92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'project'),
    ('3f8cb3e8-b8d1-4d27-a9ff-1b6699079b9f', 'project'),
    ('87a38946-9a54-4bb4-be4a-887be312af15', 'guide'),
    ('6fb2d1e7-39db-4152-b9b5-5b440f551cc9', 'guide')
) AS u(user_id, role)
WHERE p.status = 'approved'
AND random() < 0.7
ON CONFLICT (publication_id, user_id) DO NOTHING;

-- ============================================================
-- 6. AVIS / REVIEWS
-- ============================================================

INSERT INTO reviews (id, author_id, target_type, target_id, rating, comment, created_at, updated_at)
SELECT gen_random_uuid(), '7b83e87d-276d-4d89-bb00-ab8ea1243a14', 'offer', o.id,
  5, 'Super activité ! Le guide était très professionnel et passionné. Je recommande vivement.',
  NOW() - (random() * interval '30 days'), NOW()
FROM offers o
WHERE o.status = 'approved'
LIMIT 5;

INSERT INTO reviews (id, author_id, target_type, target_id, rating, comment, created_at, updated_at)
SELECT gen_random_uuid(), 'a602737a-b07d-4a41-b9c3-cdf1be17036a', 'offer', o.id,
  4 + floor(random() * 2)::int,
  CASE floor(random() * 4)::int
    WHEN 0 THEN 'Très belle expérience, cadre magnifique.'
    WHEN 1 THEN 'Bon rapport qualité-prix, à refaire.'
    WHEN 2 THEN 'Activité intéressante mais prévoir plus de temps.'
    ELSE 'Excellente organisation, tout était parfait.'
  END,
  NOW() - (random() * interval '25 days'), NOW()
FROM offers o
WHERE o.status = 'approved'
LIMIT 5;

INSERT INTO reviews (id, author_id, target_type, target_id, rating, comment, created_at, updated_at)
SELECT gen_random_uuid(), 'b09808ee-30a9-4089-bbf7-698e73004ef4', 'circuit', c.id,
  4 + floor(random() * 2)::int,
  CASE floor(random() * 3)::int
    WHEN 0 THEN 'Circuit magnifique, paysages variés et guide excellent.'
    WHEN 1 THEN 'Très beau voyage, organisation parfaite.'
    ELSE 'À faire absolument, une expérience unique en Tunisie.'
  END,
  NOW() - (random() * interval '20 days'), NOW()
FROM circuits c
WHERE c.status = 'approved'
LIMIT 5;

-- ============================================================
-- 7. FAVORIS
-- ============================================================

INSERT INTO favorites (id, user_id, target_type, target_id, created_at)
SELECT gen_random_uuid(), u.user_id::uuid, 'offer', o.id, NOW() - (random() * interval '30 days')
FROM (VALUES
  ('7b83e87d-276d-4d89-bb00-ab8ea1243a14'),
  ('a602737a-b07d-4a41-b9c3-cdf1be17036a'),
  ('b09808ee-30a9-4089-bbf7-698e73004ef4'),
  ('90b4c5bf-4a47-4737-b033-f7385e22a2e6')
) AS u(user_id)
CROSS JOIN (
  SELECT id FROM offers WHERE status = 'approved' ORDER BY random() LIMIT 3
) AS o
ON CONFLICT (user_id, target_type, target_id) DO NOTHING;

INSERT INTO favorites (id, user_id, target_type, target_id, created_at)
SELECT gen_random_uuid(), u.user_id::uuid, 'circuit', c.id, NOW() - (random() * interval '25 days')
FROM (VALUES
  ('7b83e87d-276d-4d89-bb00-ab8ea1243a14'),
  ('a602737a-b07d-4a41-b9c3-cdf1be17036a'),
  ('90b4c5bf-4a47-4737-b033-f7385e22a2e6')
) AS u(user_id)
CROSS JOIN (
  SELECT id FROM circuits WHERE status = 'approved' ORDER BY random() LIMIT 2
) AS c
ON CONFLICT (user_id, target_type, target_id) DO NOTHING;

-- ============================================================
-- 8. JOURS DE CIRCUIT + PROGRAMMES
-- ============================================================

-- Ajouter des jours pour les circuits qui n'en ont pas
DO $$
DECLARE
  circ RECORD;
  day_id UUID;
  i INT;
BEGIN
  FOR circ IN SELECT id, title, duration_days, start_date FROM circuits WHERE status = 'approved' LOOP
    IF circ.duration_days IS NOT NULL AND circ.duration_days > 0 THEN
      FOR i IN 1..circ.duration_days LOOP
        INSERT INTO circuit_days (id, circuit_id, day_number, date, title, description, lat, lng, location_name, created_at)
        VALUES (
          gen_random_uuid(), circ.id, i,
          CASE WHEN circ.start_date IS NOT NULL THEN circ.start_date + (i - 1) ELSE NULL END,
          CASE i
            WHEN 1 THEN 'Jour ' || i || ' : Arrivée et découverte'
            WHEN circ.duration_days THEN 'Jour ' || i || ' : Dernier jour et départ'
            ELSE 'Jour ' || i || ' : Exploration'
          END,
          CASE
            WHEN circ.title LIKE '%Sahara%' OR circ.title LIKE '%Sahara%' THEN
              CASE i
                WHEN 1 THEN 'Accueil à votre hébergement, briefing du circuit et première exploration des environs.'
                WHEN 2 THEN 'Départ matinal pour une journée d''aventure dans le désert. Découverte des paysages lunaires.'
                WHEN 3 THEN 'Excursion aux oasis et sites remarquables. Déjeuner typique chez l''habitant.'
                WHEN 4 THEN 'Randonnée dans les étendues désertiques. Nuit en campement berbère.'
                ELSE 'Retour et fin du circuit. Transfert vers l''aéroport ou la gare.'
              END
            WHEN circ.title LIKE '%Djerba%' OR circ.title LIKE '%djerba%' THEN
              CASE i
                WHEN 1 THEN 'Arrivée sur l''île de Djerba. Installation et découverte d''Houmt Souk.'
                WHEN 2 THEN 'Visite des ateliers de poterie de Guellala et de la mosquée des Strangers.'
                WHEN 3 THEN 'Journée plage et sports nautiques ou excursion à l''île de Flamingo.'
                ELSE 'Dernière journée : shopping de souvenirs et départ.'
              END
            WHEN circ.title LIKE '%Kroumirie%' OR circ.title LIKE '%Ain Draham%' OR circ.title LIKE '%Kroumirie%' THEN
              CASE i
                WHEN 1 THEN 'Arrivée à Ain Draham. Installation au chalet et balade en forêt.'
                WHEN 2 THEN 'Randonnée guidée dans la forêt de Kroumirie. Cascade et pique-nique.'
                WHEN 3 THEN 'Visite des villages avoisinants et découverte de l''artisanat local. Départ.'
                ELSE 'Activités libres et départ.'
              END
            WHEN circ.title LIKE '%VTT%' OR circ.title LIKE '%Cycliste%' OR circ.title LIKE '%vélo%' THEN
              CASE i
                WHEN 1 THEN 'Accueil et préparation des VTT. Première sortie d''échauffement sur le littoral.'
                WHEN 2 THEN 'Étape principale à travers les sentiers côtiers et les forêts.'
                WHEN 3 THEN 'Dernière étape et retour. Partage des souvenirs de l''aventure.'
                ELSE 'Fin du circuit.'
              END
            ELSE
              CASE i
                WHEN 1 THEN 'Début du circuit. Accueil et présentation du programme.'
                WHEN 2 THEN 'Journée principale de découverte et d''activités.'
                WHEN 3 THEN 'Suite des explorations et visites.'
                WHEN 4 THEN 'Avant-dernier jour : activités complémentaires.'
                ELSE 'Dernier jour : clôture du circuit et départ.'
              END
          END,
          CASE i
            WHEN 1 THEN 36.8000 + (random() * 0.5)
            WHEN 2 THEN 36.0000 + (random() * 1.0)
            WHEN 3 THEN 35.5000 + (random() * 1.0)
            ELSE 34.8000 + (random() * 1.0)
          END,
          CASE i
            WHEN 1 THEN 10.2000 + (random() * 0.5)
            WHEN 2 THEN 9.8000 + (random() * 1.0)
            WHEN 3 THEN 9.2000 + (random() * 1.0)
            ELSE 8.8000 + (random() * 1.0)
          END,
          CASE i
            WHEN 1 THEN 'Point de départ du circuit'
            WHEN circ.duration_days THEN 'Point de fin du circuit'
            ELSE 'Étape du circuit'
          END,
          NOW()
        ) RETURNING id INTO day_id;

        -- Ajouter 2-3 programme items par jour
        INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, created_at)
        VALUES
          (gen_random_uuid(), day_id,
           CASE i
             WHEN 1 THEN 'Accueil et briefing'
             WHEN circ.duration_days THEN 'Petit-déjeuner et départ'
             ELSE 'Petit-déjeuner'
           END,
           CASE i
             WHEN 1 THEN 'Présentation du circuit, rencontre avec le guide, remise des documents.'
             WHEN circ.duration_days THEN 'Dernier petit-déjeuner ensemble, échange des contacts, transfert.'
             ELSE 'Buffet petit-déjeuner avec produits locaux et bio.'
           END,
           (CASE i WHEN 1 THEN '09:00' WHEN circ.duration_days THEN '08:00' ELSE '08:00' END)::time,
           (CASE i WHEN 1 THEN '10:00' WHEN circ.duration_days THEN '09:30' ELSE '09:00' END)::time,
           true, true, NOW());

         INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, created_at)
         VALUES
           (gen_random_uuid(), day_id,
            CASE
              WHEN i = 1 THEN 'Visite guidée'
              WHEN i = circ.duration_days THEN 'Temps libre'
              ELSE 'Activité principale'
            END,
            CASE
              WHEN i = 1 THEN 'Première exploration du site avec un guide local passionné.'
              WHEN i = circ.duration_days THEN 'Derniers achats et promenade libre avant le départ.'
              ELSE 'Activité phare de la journée : randonnée, visite ou atelier.'
            END,
            '10:00'::time, '12:30'::time,
            true, false, NOW());

         INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, created_at)
         VALUES
           (gen_random_uuid(), day_id,
            CASE
              WHEN i = circ.duration_days THEN 'Cérémonie de clôture'
              ELSE 'Déjeuner'
            END,
            CASE
              WHEN i = circ.duration_days THEN 'Remise des diplômes souvenirs et verre de l''amitié.'
              ELSE 'Déjeuner typique dans un restaurant local ou chez l''habitant.'
            END,
            '12:30'::time, '14:00'::time,
            true, false, NOW());
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- 9. OPTIONS DE CIRCUIT
-- ============================================================

INSERT INTO circuit_options (id, circuit_id, offer_item_id, option_group, option_type, is_required, is_included, extra_price, selection_mode, status, created_at)
SELECT gen_random_uuid(), c.id, oi.id,
  CASE floor(random() * 5)::int
    WHEN 0 THEN 'transport' WHEN 1 THEN 'accommodation'
    WHEN 2 THEN 'equipment' WHEN 3 THEN 'activity'
    ELSE 'food'
  END,
  CASE floor(random() * 3)::int
    WHEN 0 THEN 'single_choice' WHEN 1 THEN 'multiple_choice' ELSE 'quantity'
  END,
  random() < 0.2, random() < 0.15,
  (floor(random() * 200) + 20)::decimal,
  'optional', 'active', NOW()
FROM circuits c
CROSS JOIN LATERAL (
  SELECT id FROM offer_items ORDER BY random() LIMIT 1
) oi
WHERE c.status = 'approved'
LIMIT 20;

-- ============================================================
-- 10. CONTRIBUTIONS + VOTES
-- ============================================================

INSERT INTO place_contributions (id, publication_id, user_id, user_role, type, content, vote_count, created_at)
SELECT gen_random_uuid(), p.id, u.user_id::uuid, u.role,
  CASE floor(random() * 2)::int WHEN 0 THEN 'description'::place_contributions_type_enum ELSE 'images'::place_contributions_type_enum END,
  CASE floor(random() * 3)::int
    WHEN 0 THEN 'Ce lieu est magnifique en automne quand les feuilles changent de couleur.'
    WHEN 1 THEN 'Le coucher du soleil depuis ce point de vue est à couper le souffle. Arrivez vers 17h.'
    ELSE 'Petit conseil : apportez de l''eau et des chaussures confortables. Le site est vaste.'
  END,
  floor(random() * 12)::int, NOW() - (random() * interval '15 days')
FROM publications p
CROSS JOIN (
  VALUES
    ('7b83e87d-276d-4d89-bb00-ab8ea1243a14', 'eco_traveler'),
    ('a602737a-b07d-4a41-b9c3-cdf1be17036a', 'eco_traveler'),
    ('b09808ee-30a9-4089-bbf7-698e73004ef4', 'eco_traveler')
) AS u(user_id, role)
WHERE p.type = 'place' AND p.status = 'approved'
AND random() < 0.5
LIMIT 15;

-- Votes sur les contributions
INSERT INTO contribution_votes (id, contribution_id, user_id, created_at)
SELECT gen_random_uuid(), pc.id, u.user_id::uuid, NOW() - (random() * interval '10 days')
FROM place_contributions pc
CROSS JOIN (
  SELECT user_id FROM (VALUES
    ('7b83e87d-276d-4d89-bb00-ab8ea1243a14'),
    ('a602737a-b07d-4a41-b9c3-cdf1be17036a'),
    ('90b4c5bf-4a47-4737-b033-f7385e22a2e6'),
    ('87a38946-9a54-4bb4-be4a-887be312af15')
  ) AS u(user_id)
) u
WHERE random() < 0.4
LIMIT 20;

-- ============================================================
-- 11. RECALCUL DES POPULARITY SCORES
-- ============================================================

UPDATE publications p SET popularity_score = (
  SELECT COALESCE(COUNT(DISTINCT pl.id), 0)
    + COALESCE(COUNT(DISTINCT pc.id), 0) * 2
    + COALESCE(COUNT(DISTINCT pcc.id), 0) * 3
  FROM publications p2
  LEFT JOIN publication_likes pl ON pl.publication_id = p2.id
  LEFT JOIN publication_comments pc ON pc.publication_id = p2.id
  LEFT JOIN place_contributions pcc ON pcc.publication_id = p2.id
  WHERE p2.id = p.id
  GROUP BY p2.id
)
WHERE p.type = 'place' AND p.status = 'approved';

-- ============================================================
-- 12. PEUPLER LA TABLE photos DEPUIS publications.images
-- ============================================================

-- Strip curly braces from simple-array columns (TypeORM compatibility)
UPDATE publications SET images = trim(BOTH '{}' FROM images) WHERE images LIKE '{%';
UPDATE publications SET tags = trim(BOTH '{}' FROM tags) WHERE tags LIKE '{%';

-- Populate photos table from publication images
DO $$
DECLARE
  pub RECORD;
  img_urls TEXT[];
  img_url TEXT;
  hero BOOLEAN;
  idx INT;
  existing_photos INT;
BEGIN
  FOR pub IN SELECT id, images, author_id FROM publications WHERE images IS NOT NULL AND images != ''
  LOOP
    SELECT COUNT(*) INTO existing_photos FROM photos WHERE entity_type = 'publication' AND entity_id = pub.id;
    IF existing_photos = 0 THEN
      img_urls := string_to_array(pub.images, ',');
      idx := 0;
      FOREACH img_url IN ARRAY img_urls
      LOOP
        hero := (idx = 0);
        INSERT INTO photos (id, url, entity_type, entity_id, is_hero, score, uploaded_by, created_at)
        VALUES (gen_random_uuid(), trim(img_url), 'publication', pub.id, hero, 0, pub.author_id, NOW());
        idx := idx + 1;
      END LOOP;
    END IF;
  END LOOP;
END $$;

COMMIT;
