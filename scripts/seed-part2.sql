-- PARTIE 2 : Expériences, Commentaires, Likes

-- 3. Expériences
INSERT INTO publications (id, author_id, type, title, description, images, category, tags, popularity_score, status, created_at, updated_at) VALUES

('b1000001-0001-0000-0000-000000000001'::uuid, '7b83e87d-276d-4d89-bb00-ab8ea1243a14'::uuid, 'experience',
 'Nuit magique dans le désert de Tozeur',
 'Une expérience inoubliable ! Nuit dans un campement berbère au cœur du Sahara. Dîner sous un ciel étoilé magique, balade à dos de dromadaire au lever du soleil.',
 ARRAY['https://images.unsplash.com/photo-1547234935-80c7145ec969?w=800', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'],
 NULL, ARRAY['desert', 'etoiles', 'dromadaire', 'campement', 'sahara', 'magique'],
 33, 'approved', NOW(), NOW()),

('b1000001-0001-0000-0000-000000000002'::uuid, 'a602737a-b07d-4a41-b9c3-cdf1be17036a'::uuid, 'experience',
 'Kayak au lever du soleil à Korba',
 'Réveil à 5h30 pour une sortie kayak. Le spectacle du soleil se levant sur la mer était à couper le souffle. Eau calme et transparente.',
 ARRAY['https://images.unsplash.com/photo-1574646272156-f6245aa32266?w=800'],
 NULL, ARRAY['kayak', 'lever-du-soleil', 'mer', 'crique', 'aventure', 'corba'],
 27, 'approved', NOW(), NOW()),

('b1000001-0001-0000-0000-000000000003'::uuid, 'b09808ee-30a9-4089-bbf7-698e73004ef4'::uuid, 'experience',
 'Atelier poterie en famille à Guellala',
 'Après-midi merveilleux en famille à l''atelier de poterie. Le maître potier nous a appris à tourner l''argile. Souvenirs précieux.',
 ARRAY['https://images.unsplash.com/photo-1565193566173-7fc51e6c6443?w=800', 'https://images.unsplash.com/photo-1491914096647-d1e8cc96ee66?w=800'],
 NULL, ARRAY['poterie', 'famille', 'atelier', 'artisanat', 'guellala', 'djerba'],
 21, 'approved', NOW(), NOW()),

('b1000001-0001-0000-0000-000000000004'::uuid, '90b4c5bf-4a47-4737-b033-f7385e22a2e6'::uuid, 'experience',
 'Randonnée dans les gorges de la Medjerda',
 'Randonnée de 6 heures à travers gorges sauvages, forêts de chênes-lièges et villages perchés. Paysages à couper le souffle.',
 ARRAY['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800'],
 NULL, ARRAY['randonnee', 'gorge', 'cascade', 'foret', 'nature', 'medjerda'],
 19, 'approved', NOW(), NOW()),

('b1000001-0001-0000-0000-000000000005'::uuid, '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'::uuid, 'experience',
 'Cours de cuisine djerbienne chez l''habitant',
 'Fatma nous a appris les secrets de la cuisine traditionnelle. Couscous au poisson, bricks et mesfouf. Repas partagé inoubliable.',
 ARRAY['https://images.unsplash.com/photo-1556911220-bffb3bedd9b0?w=800', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'],
 NULL, ARRAY['cuisine', 'tradition', 'djerba', 'poisson', 'famille', 'partage'],
 38, 'approved', NOW(), NOW()),

('b1000001-0001-0000-0000-000000000006'::uuid, '8148d448-9c88-4aa3-b2f1-7d71bc112f12'::uuid, 'experience',
 'Plongée sous-marine au large de Tabarka',
 'Fonds marins exceptionnels avec grottes, gorgones et faune abondante : mérous, murènes, barracudas et tortue.',
 ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', 'https://images.unsplash.com/photo-1506968430777-bf7784a4f23e?w=800'],
 NULL, ARRAY['plongee', 'sous-marin', 'tabarka', 'poissons', 'grotte', 'decouverte'],
 24, 'approved', NOW(), NOW());

-- 4. Commentaires sur les publications
INSERT INTO publication_comments (id, publication_id, author_id, author_role, content, created_at) VALUES

(gen_random_uuid(), 'a1000001-0001-0000-0000-000000000001'::uuid, '7b83e87d-276d-4d89-bb00-ab8ea1243a14'::uuid, 'eco_traveler', 'Le meilleur endroit pour admirer le coucher de soleil ! Le thé aux pignons est incontournable.', NOW() - interval '3 days'),
(gen_random_uuid(), 'a1000001-0001-0000-0000-000000000002'::uuid, 'a602737a-b07d-4a41-b9c3-cdf1be17036a'::uuid, 'eco_traveler', 'Prévoyez au moins 3 heures pour tout voir. Les thermes d''Antonin sont impressionnants.', NOW() - interval '5 days'),
(gen_random_uuid(), 'a1000001-0001-0000-0000-000000000003'::uuid, 'b09808ee-30a9-4089-bbf7-698e73004ef4'::uuid, 'eco_traveler', 'Eau magnifique et sable fin. Attention le week-end c''est très fréquenté.', NOW() - interval '2 days'),
(gen_random_uuid(), 'a1000001-0001-0000-0000-000000000004'::uuid, '90b4c5bf-4a47-4737-b033-f7385e22a2e6'::uuid, 'eco_traveler', 'À couper le souffle ! Mieux conservé que le Colisée de Rome.', NOW() - interval '7 days'),
(gen_random_uuid(), 'a1000001-0001-0000-0000-000000000005'::uuid, '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'::uuid, 'project', 'Le meilleur poisson que j''ai mangé de toute ma vie !', NOW() - interval '1 day'),
(gen_random_uuid(), 'a1000001-0001-0000-0000-000000000006'::uuid, '87a38946-9a54-4bb4-be4a-887be312af15'::uuid, 'guide', 'L''eau est fraîche et transparente. Un vrai paradis au milieu du désert.', NOW() - interval '4 days'),
(gen_random_uuid(), 'a1000001-0001-0000-0000-000000000007'::uuid, '6fb2d1e7-39db-4152-b9b5-5b440f551cc9'::uuid, 'guide', 'Les mosaïques sont exceptionnelles, prévoyez une demi-journée.', NOW() - interval '6 days'),
(gen_random_uuid(), 'a1000001-0001-0000-0000-000000000008'::uuid, 'a602737a-b07d-4a41-b9c3-cdf1be17036a'::uuid, 'eco_traveler', 'Les potiers sont très accueillants et expliquent bien leur art.', NOW() - interval '8 days'),
(gen_random_uuid(), 'a1000001-0001-0000-0000-000000000009'::uuid, '7b83e87d-276d-4d89-bb00-ab8ea1243a14'::uuid, 'eco_traveler', 'Belle randonnée mais prévoyez de bonnes chaussures et beaucoup d''eau !', NOW() - interval '10 days'),
(gen_random_uuid(), 'a1000001-0001-0000-0000-000000000010'::uuid, 'b09808ee-30a9-4089-bbf7-698e73004ef4'::uuid, 'eco_traveler', 'Nuit inoubliable sous les étoiles. Le dîner autour du feu est magique.', NOW() - interval '2 days'),
(gen_random_uuid(), 'a1000001-0001-0000-0000-000000000011'::uuid, '90b4c5bf-4a47-4737-b033-f7385e22a2e6'::uuid, 'eco_traveler', 'Calme et préservée, parfaite pour les familles avec enfants.', NOW() - interval '12 days'),
(gen_random_uuid(), 'a1000001-0001-0000-0000-000000000012'::uuid, '7b83e87d-276d-4d89-bb00-ab8ea1243a14'::uuid, 'eco_traveler', 'Le bain dans la source chaude après la piste est incroyablement relaxant.', NOW() - interval '3 days'),
(gen_random_uuid(), 'a1000001-0001-0000-0000-000000000013'::uuid, '3f8cb3e8-b8d1-4d27-a9ff-1b6699079b9f'::uuid, 'project', 'Le cadre est magnifique et la cuisine est un véritable voyage gustatif.', NOW() - interval '9 days'),
(gen_random_uuid(), 'a1000001-0001-0000-0000-000000000014'::uuid, 'a602737a-b07d-4a41-b9c3-cdf1be17036a'::uuid, 'eco_traveler', 'Le train du Lézard Rouge traverse des paysages lunaires uniques au monde.', NOW() - interval '15 days'),
(gen_random_uuid(), 'a1000001-0001-0000-0000-000000000015'::uuid, '87a38946-9a54-4bb4-be4a-887be312af15'::uuid, 'guide', 'Faire le plein d''air pur et admirer la vue sur la Méditerranée.', NOW() - interval '11 days'),

-- Commentaires sur les publications existantes
(gen_random_uuid(), '92322472-e0c2-44f2-8046-803cdb45e2c8'::uuid, 'a602737a-b07d-4a41-b9c3-cdf1be17036a'::uuid, 'eco_traveler', 'Magnifique forêt, idéale pour une randonnée en famille.', NOW() - interval '6 days'),
(gen_random_uuid(), '92322472-e0c2-44f2-8046-803cdb45e2c8'::uuid, 'b09808ee-30a9-4089-bbf7-698e73004ef4'::uuid, 'eco_traveler', 'Les chênes-lièges sont centenaires, l''air est pur. Un vrai bol d''air.', NOW() - interval '4 days'),
(gen_random_uuid(), '165a72fb-e0c4-482f-aae0-147c87e7e214'::uuid, '87a38946-9a54-4bb4-be4a-887be312af15'::uuid, 'guide', 'Béja est une ville sous-estimée. Dougga à côté est un site UNESCO magnifique.', NOW() - interval '14 days'),
(gen_random_uuid(), '165a72fb-e0c4-482f-aae0-147c87e7e214'::uuid, '6fb2d1e7-39db-4152-b9b5-5b440f551cc9'::uuid, 'guide', 'Les collines verdoyantes autour de Béja rappellent la Toscane !', NOW() - interval '8 days'),

-- Commentaires sur les expériences
(gen_random_uuid(), 'b1000001-0001-0000-0000-000000000001'::uuid, 'a602737a-b07d-4a41-b9c3-cdf1be17036a'::uuid, 'eco_traveler', 'Cette nuit dans le désert a changé ma vie. Le ciel étoilé était incroyable.', NOW() - interval '5 days'),
(gen_random_uuid(), 'b1000001-0001-0000-0000-000000000002'::uuid, '7b83e87d-276d-4d89-bb00-ab8ea1243a14'::uuid, 'eco_traveler', 'Le kayak au lever du soleil est une expérience magique à faire absolument.', NOW() - interval '3 days'),
(gen_random_uuid(), 'b1000001-0001-0000-0000-000000000005'::uuid, '3f8cb3e8-b8d1-4d27-a9ff-1b6699079b9f'::uuid, 'project', 'La cuisine djerbienne est un délice, merci pour ce partage !', NOW() - interval '2 days');

-- 5. Likes sur les publications
INSERT INTO publication_likes (id, publication_id, user_id, user_role, created_at)
SELECT gen_random_uuid(), p.id::uuid, u.user_id::uuid, u.role,
  NOW() - (random() * interval '20 days')
FROM (VALUES
  ('a1000001-0001-0000-0000-000000000001'::uuid),
  ('a1000001-0001-0000-0000-000000000002'::uuid),
  ('a1000001-0001-0000-0000-000000000003'::uuid),
  ('a1000001-0001-0000-0000-000000000004'::uuid),
  ('a1000001-0001-0000-0000-000000000005'::uuid),
  ('a1000001-0001-0000-0000-000000000006'::uuid),
  ('a1000001-0001-0000-0000-000000000007'::uuid),
  ('a1000001-0001-0000-0000-000000000008'::uuid),
  ('a1000001-0001-0000-0000-000000000009'::uuid),
  ('a1000001-0001-0000-0000-000000000010'::uuid),
  ('a1000001-0001-0000-0000-000000000011'::uuid),
  ('a1000001-0001-0000-0000-000000000012'::uuid),
  ('a1000001-0001-0000-0000-000000000013'::uuid),
  ('a1000001-0001-0000-0000-000000000014'::uuid),
  ('a1000001-0001-0000-0000-000000000015'::uuid),
  ('92322472-e0c2-44f2-8046-803cdb45e2c8'::uuid),
  ('165a72fb-e0c4-482f-aae0-147c87e7e214'::uuid),
  ('b1000001-0001-0000-0000-000000000001'::uuid),
  ('b1000001-0001-0000-0000-000000000002'::uuid),
  ('b1000001-0001-0000-0000-000000000003'::uuid),
  ('b1000001-0001-0000-0000-000000000004'::uuid),
  ('b1000001-0001-0000-0000-000000000005'::uuid),
  ('b1000001-0001-0000-0000-000000000006'::uuid)
) AS p(id)
CROSS JOIN (VALUES
  ('7b83e87d-276d-4d89-bb00-ab8ea1243a14'::uuid, 'eco_traveler'),
  ('a602737a-b07d-4a41-b9c3-cdf1be17036a'::uuid, 'eco_traveler'),
  ('b09808ee-30a9-4089-bbf7-698e73004ef4'::uuid, 'eco_traveler'),
  ('90b4c5bf-4a47-4737-b033-f7385e22a2e6'::uuid, 'eco_traveler'),
  ('92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'::uuid, 'project'),
  ('3f8cb3e8-b8d1-4d27-a9ff-1b6699079b9f'::uuid, 'project'),
  ('87a38946-9a54-4bb4-be4a-887be312af15'::uuid, 'guide'),
  ('6fb2d1e7-39db-4152-b9b5-5b440f551cc9'::uuid, 'guide')
) AS u(user_id, role)
WHERE random() < 0.6
ON CONFLICT (publication_id, user_id) DO NOTHING;
