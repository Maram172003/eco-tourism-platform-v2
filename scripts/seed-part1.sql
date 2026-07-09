-- ============================================================
-- ECO-VOYAGE : ENRICHISSEMENT PARTIE 1
-- ============================================================

-- 1. Enrichir publications existantes
UPDATE publications SET
  description = 'La forêt de Fernana est un joyau naturel du nord-ouest de la Tunisie. Avec ses chênes-lièges centenaires, ses ruisseaux cristallins et sa biodiversité exceptionnelle, elle offre des randonnées inoubliables au cœur de la Kroumirie.',
  images = ARRAY['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', 'https://images.unsplash.com/photo-1470071459604-7c47ec0c3e67?w=800', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'],
  category = 'nature',
  tags = ARRAY['foret', 'randonnee', 'kroumirie', 'nature', 'oiseaux', 'chenes'],
  popularity_score = 42,
  place_name = 'Forêt de Fernana',
  region = 'Jendouba'
WHERE id = '92322472-e0c2-44f2-8046-803cdb45e2c8'::uuid;

UPDATE publications SET
  description = 'Béja, ville historique du nord de la Tunisie, est un écrin de verdure au pied du Djebel Ammar. Ses vestiges romains, sa médina authentique et ses paysages de collines verdoyantes en font une destination idéale.',
  images = ARRAY['https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=800', 'https://images.unsplash.com/photo-1599751449128-eb724f1ea60b?w=800'],
  category = 'monument',
  tags = ARRAY['histoire', 'romain', 'medina', 'dougga', 'unesco', 'culture'],
  popularity_score = 28,
  place_name = 'Béja Ville',
  region = 'Beja'
WHERE id = '165a72fb-e0c4-482f-aae0-147c87e7e214'::uuid;

-- 2. Nouveaux lieux
INSERT INTO publications (id, author_id, type, title, description, images, latitude, longitude, place_name, region, category, tags, popularity_score, status, created_at, updated_at) VALUES

('a1000001-0001-0000-0000-000000000001'::uuid, '7b83e87d-276d-4d89-bb00-ab8ea1243a14'::uuid, 'place',
 'Sidi Bou Saïd',
 'Perché sur une falaise surplombant la mer Méditerranée, Sidi Bou Saïd est le village bleu et blanc le plus emblématique de Tunisie.',
 ARRAY['https://images.unsplash.com/photo-1590132989126-f7bcad5b0dba?w=800', 'https://images.unsplash.com/photo-1603954520848-0e2db2e94555?w=800'],
 36.8687, 10.3414, 'Sidi Bou Saïd', 'Tunis', 'monument',
 ARRAY['village', 'bleu-et-blanc', 'cafe', 'coucher-de-soleil', 'art', 'mediterranee'],
 85, 'approved', NOW(), NOW()),

('a1000001-0001-0000-0000-000000000002'::uuid, 'a602737a-b07d-4a41-b9c3-cdf1be17036a'::uuid, 'place',
 'Site Archéologique de Carthage',
 'Carthage offre aujourd''hui aux visiteurs des thermes d''Antonin aux ports puniques en passant par le quartier des villas romaines. Classé UNESCO.',
 ARRAY['https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800', 'https://images.unsplash.com/photo-1590868309234-5ce5e0cd6b6f?w=800'],
 36.8522, 10.3312, 'Carthage', 'Tunis', 'monument',
 ARRAY['unesco', 'histoire', 'romain', 'punique', 'antiquite', 'thermes'],
 72, 'approved', NOW(), NOW()),

('a1000001-0001-0000-0000-000000000003'::uuid, 'b09808ee-30a9-4089-bbf7-698e73004ef4'::uuid, 'place',
 'Plage de Hammamet',
 'Les plages de sable fin de Hammamet s''étendent sur des kilomètres le long de la côte turquoise.',
 ARRAY['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', 'https://images.unsplash.com/photo-1590523277543-94b0e8c3e1b0?w=800'],
 36.4000, 10.6167, 'Hammamet Plage', 'Nabeul', 'plage',
 ARRAY['plage', 'baignade', 'sports-nautiques', 'fort', 'medina', 'soleil'],
 58, 'approved', NOW(), NOW()),

('a1000001-0001-0000-0000-000000000004'::uuid, '90b4c5bf-4a47-4737-b033-f7385e22a2e6'::uuid, 'place',
 'Amphithéâtre d''El Jem',
 'Troisième plus grand colisée du monde après Rome et Capoue. 35 000 places, conservation exceptionnelle.',
 ARRAY['https://images.unsplash.com/photo-1558624218-1a4c0b8429e4?w=800', 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800'],
 35.2967, 10.7067, 'El Jem', 'Mahdia', 'monument',
 ARRAY['colisee', 'romain', 'unesco', 'gladiateur', 'histoire', 'monument'],
 65, 'approved', NOW(), NOW()),

('a1000001-0001-0000-0000-000000000005'::uuid, '7b83e87d-276d-4d89-bb00-ab8ea1243a14'::uuid, 'place',
 'Restaurant Le Pirate - Djerba',
 'Restaurant emblématique de Djerba perché sur les hauteurs d''Houmt Souk avec vue imprenable sur la mer. Fruits de mer frais.',
 ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', 'https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=800'],
 33.8680, 10.8490, 'Houmt Souk', 'Djerba', 'restaurant',
 ARRAY['cuisine', 'poisson', 'fruits-de-mer', 'coucher-de-soleil', 'gastronomie', 'djerba'],
 44, 'approved', NOW(), NOW()),

('a1000001-0001-0000-0000-000000000006'::uuid, '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'::uuid, 'place',
 'Oasis de Chebika',
 'Une des plus belles oasis de montagne de Tunisie. Cascade naturelle jaillissant des rochers. Lieu de tournage du film "Le Patient Anglais".',
 ARRAY['https://images.unsplash.com/photo-1567607686044-aef63c7e53bc?w=800', 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800'],
 34.3167, 7.9333, 'Chebika', 'Tozeur', 'nature',
 ARRAY['oasis', 'cascade', 'palmiers', 'desert', 'montagne', 'film'],
 55, 'approved', NOW(), NOW()),

('a1000001-0001-0000-0000-000000000007'::uuid, '3f8cb3e8-b8d1-4d27-a9ff-1b6699079b9f'::uuid, 'place',
 'Musée National du Bardo',
 'Plus grand musée de Tunisie, l''un des plus importants musées d''art romain et de mosaïques au monde.',
 ARRAY['https://images.unsplash.com/photo-1566127444979-b0af05ccef63?w=800', 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800'],
 36.8097, 10.1344, 'Le Bardo', 'Tunis', 'musee',
 ARRAY['mosaique', 'romain', 'musee', 'art', 'histoire', 'palais'],
 48, 'approved', NOW(), NOW()),

('a1000001-0001-0000-0000-000000000008'::uuid, '8148d448-9c88-4aa3-b2f1-7d71bc112f12'::uuid, 'place',
 'Atelier de Poterie de Guellala',
 'Guellala est le village des potiers de Djerba. Artisans façonnant l''argile locale depuis des siècles.',
 ARRAY['https://images.unsplash.com/photo-1565193566173-7fc51e6c6443?w=800', 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800'],
 33.7800, 10.9200, 'Guellala', 'Djerba', 'artisanat',
 ARRAY['poterie', 'artisanat', 'argile', 'tradition', 'souvenir', 'djerba'],
 36, 'approved', NOW(), NOW()),

('a1000001-0001-0000-0000-000000000009'::uuid, '87a38946-9a54-4bb4-be4a-887be312af15'::uuid, 'place',
 'Djebel Zaghouan',
 'Sommet emblématique du nord-est culminant à 1295 mètres. Paradis des randonneurs, temple des Eaux au sommet.',
 ARRAY['https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800'],
 36.4000, 10.1500, 'Djebel Zaghouan', 'Zaghouan', 'aventure',
 ARRAY['randonnee', 'sommet', 'foret', 'romain', 'vue', 'nature'],
 39, 'approved', NOW(), NOW()),

('a1000001-0001-0000-0000-000000000010'::uuid, '6fb2d1e7-39db-4152-b9b5-5b440f551cc9'::uuid, 'place',
 'Campement Berbère du Sahara',
 'Nuit en plein désert dans un campement berbère traditionnel. Dîner sous les étoiles, musique touareg.',
 ARRAY['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800'],
 33.4618, 9.0299, 'Douz', 'Kebili', 'hebergement',
 ARRAY['desert', 'nomade', 'berbere', 'etoiles', 'tente', 'sahara'],
 52, 'approved', NOW(), NOW()),

('a1000001-0001-0000-0000-000000000011'::uuid, 'a602737a-b07d-4a41-b9c3-cdf1be17036a'::uuid, 'place',
 'Plage de Sidi Mansour - Kerkennah',
 'Plus belle plage de l''archipel de Kerkennah, sable blanc et eaux turquoise peu profondes. Idéal familles.',
 ARRAY['https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800', 'https://images.unsplash.com/photo-1552083375-1447ce886485?w=800'],
 34.7167, 11.2000, 'Sidi Mansour', 'Kerkennah', 'plage',
 ARRAY['plage', 'sable', 'snorkeling', 'famille', 'calme', 'archipel'],
 34, 'approved', NOW(), NOW()),

('a1000001-0001-0000-0000-000000000012'::uuid, 'b09808ee-30a9-4089-bbf7-698e73004ef4'::uuid, 'place',
 'Ksar Ghilane',
 'Oasis la plus méridionale de Tunisie. Source d''eau chaude naturelle au cœur des palmiers. Balades à dos de dromadaire.',
 ARRAY['https://images.unsplash.com/photo-1462362645004-0d1c72a854e6?w=800', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'],
 32.9833, 9.6333, 'Ksar Ghilane', 'Tataouine', 'nature',
 ARRAY['oasis', 'source-chaude', 'dune', 'dromadaire', 'desert', 'detente'],
 46, 'approved', NOW(), NOW()),

('a1000001-0001-0000-0000-000000000013'::uuid, '90b4c5bf-4a47-4737-b033-f7385e22a2e6'::uuid, 'place',
 'Dar El Jeld - Restaurant Gastronomique',
 'Demeure du XVIIIe siècle au cœur de la médina de Tunis. Temple de la gastronomie tunisienne haut de gamme.',
 ARRAY['https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', 'https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?w=800'],
 36.7986, 10.1694, 'Médina de Tunis', 'Tunis', 'restaurant',
 ARRAY['gastronomie', 'tradition', 'patio', 'medina', 'cuisine', 'luxe'],
 62, 'approved', NOW(), NOW()),

('a1000001-0001-0000-0000-000000000014'::uuid, '7b83e87d-276d-4d89-bb00-ab8ea1243a14'::uuid, 'place',
 'Canyon d''Oued Selja',
 'Canyon spectaculaire où les eaux ont creusé des gorges vertigineuses. Le train du Lézard Rouge traverse ce décor lunaire.',
 ARRAY['https://images.unsplash.com/photo-1586607629075-0c80f7187697?w=800', 'https://images.unsplash.com/photo-1585409788173-0ae7c9376a43?w=800'],
 34.2833, 8.4000, 'Oued Selja', 'Gafsa', 'aventure',
 ARRAY['canyon', 'geologie', 'train', 'lezard-rouge', 'gorge', 'photographie'],
 40, 'approved', NOW(), NOW()),

('a1000001-0001-0000-0000-000000000015'::uuid, '3f8cb3e8-b8d1-4d27-a9ff-1b6699079b9f'::uuid, 'place',
 'Ras Angela - Cap Blanc',
 'Point le plus septentrional de l''Afrique continentale. Falaises blanches plongeant dans la Méditerranée.',
 ARRAY['https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800', 'https://images.unsplash.com/photo-1534008897995-27a23e2e0e12?w=800'],
 37.3458, 9.7417, 'Ras Angela', 'Bizerte', 'plage',
 ARRAY['cap', 'afrique', 'falaise', 'phare', 'nature', 'sauvage'],
 31, 'approved', NOW(), NOW());
