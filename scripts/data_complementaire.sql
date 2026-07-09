-- ============================================================================
-- EcoVoyage — Script de données complémentaires
-- ============================================================================
-- Activités supplémentaires : vélo, artisanat, hébergement, guides divers
-- Exécution :
--   PGPASSWORD=Hermosa psql -h localhost -p 5433 -U marammejri -d tourism_db -f data_complementaire.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. NOUVEAU PROJET - VÉLO ÉCOLOGIQUE
-- ============================================================================
INSERT INTO projects (id, owner_id, name, project_type, description, region, address, lat, lng, opening_hours, status, sustainability_score, services, eco_labels, phone) VALUES
  ('55000000-0001-0000-0000-000000000009', '8148d448-9c88-4aa3-b2f1-7d71bc112f12', 'Cycles Éco Hammamet', 'activite,eco_tourisme', 'Location de vélos électriques et traditionnels éco-responsables. Circuits dans la région d''Hammamet avec guides spécialisés en tourisme durable.', 'Hammamet', 'Avenue Bourguiba, Hammamet 8050', 36.4020, 10.6300, '07:00 - 19:00', 'active', 90, 'velo_location,circuit_guidee,entretien_velo', 'velo_vert,eco_transport', '+216 98 765 432')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. NOUVEAU PROJET - ARTISANAT LOCAL
-- ============================================================================
INSERT INTO projects (id, owner_id, name, project_type, description, region, address, lat, lng, opening_hours, status, sustainability_score, services, eco_labels, phone) VALUES
  ('55000000-0001-0000-0000-000000000010', '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'Atelier Poterie Traditionnelle', 'artisanat', 'Atelier de poterie traditionnelle tunisienne. Cours pour touristes avec des maîtres artisans locaux. Techniques ancestrales et matériaux naturels.', 'Hammamet', 'Souk El Blat, Hammamet 8050', 36.4050, 10.6350, '09:00 - 17:00', 'active', 95, 'atelier,vente,visite_guidee', 'artisanat_local,commerce_equitable', '+216 71 345 678')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. NOUVEAU PROJET - HÉBERGEMENT ÉCOLOGIQUE
-- ============================================================================
INSERT INTO projects (id, owner_id, name, project_type, description, region, address, lat, lng, opening_hours, status, sustainability_score, services, eco_labels, phone) VALUES
  ('55000000-0001-0000-0000-000000000011', '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'Éco-Gîte Matmata', 'hebergement', 'Gîte écologique troglodytique traditionnel. Construction en matériaux locaux, énergie solaire, cuisine bio locale. Expérience authentique berbère.', 'Matmata', 'Route de Tataouine, Matmata 6070', 33.5444, 9.9671, '24h/24', 'active', 92, 'hebergement,restauration,visite_culturelle', 'eco_lodge,patrimoine', '+216 98 234 567')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. NOUVELLES OFFRES - ACTIVITÉS VÉLO
-- ============================================================================
INSERT INTO offers (id, author_id, author_type, project_id, category_id, title, description, price, duration, offer_type, images, inclusions, region, address, latitude, longitude, meeting_point, meeting_lat, meeting_lng, min_group_size, max_group_size, min_age, cancellation_policy, sustainability_score, confirmation_mode, status) VALUES
  ('55000000-0001-0000-0000-000000000013', '8148d448-9c88-4aa3-b2f1-7d71bc112f12', 'project_owner', '55000000-0001-0000-0000-000000000009', 'f8509a3c-747f-475b-b4a0-40a32c765bfb', 'Circuit Vélo Éco Hammamet', 'Cyclotourisme de 4h dans la région d''Hammamet. Parcours côtier et forêt, avec dégustation de produits bio locaux.', 40.00, '4h', 'activite', NULL, 'Vélo électrique, casque, guide, bouteille d''eau, dégustation', 'Hammamet', 'Avenue Bourguiba, Hammamet', 36.4020, 10.6300, 'Office de Tourisme', 36.4020, 10.6300, 2, 8, 12, 'Annulation gratuite 72h avant', 90, 'automatic', 'approved')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. NOUVELLES OFFRES - ARTISANAT
-- ============================================================================
INSERT INTO offers (id, author_id, author_type, project_id, category_id, title, description, price, duration, offer_type, images, inclusions, region, address, latitude, longitude, meeting_point, meeting_lat, meeting_lng, min_group_size, max_group_size, min_age, cancellation_policy, sustainability_score, confirmation_mode, status) VALUES
  ('55000000-0001-0000-0000-000000000014', '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'project_owner', '55000000-0001-0000-0000-000000000010', 'd8835649-c729-4625-9f46-820cc02a9d72', 'Atelier Poterie Traditionnelle', 'Apprenez les techniques traditionnelles de poterie tunisienne avec des maîtres artisans. Repartez avec votre propre création.', 35.00, '3h', 'artisanat', NULL, 'Matériel, outils, cuisson, emballage, certificat', 'Hammamet', 'Souk El Blat, Hammamet', 36.4050, 10.6350, NULL, NULL, NULL, 1, 8, 10, 'Non remboursable', 95, 'automatic', 'approved')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 6. NOUVELLES OFFRES - HÉBERGEMENT
-- ============================================================================
INSERT INTO offers (id, author_id, author_type, project_id, category_id, title, description, price, duration, offer_type, images, inclusions, region, address, latitude, longitude, meeting_point, meeting_lat, meeting_lng, min_group_size, max_group_size, min_age, cancellation_policy, sustainability_score, confirmation_mode, status) VALUES
  ('55000000-0001-0000-0000-000000000015', '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'project_owner', '55000000-0001-0000-0000-000000000011', 'a327acf4-6d42-4d5d-8ebc-8dfdc02c75de', 'Chambre Troglodyte Matmata', 'Dormez dans une chambre creusée dans la roche traditionnelle. Expérience authentique berbère avec confort moderne et petit-déjeuner bio.', 85.00, '1 nuit', 'hebergement', NULL, 'Chambre privée, petit-déjeuner bio, visite guidée', 'Matmata', 'Route de Tataouine, Matmata', 33.5444, 9.9671, NULL, NULL, NULL, 1, 4, NULL, 'Annulation gratuite 24h avant', 92, 'automatic', 'approved')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 7. NOUVEAU CIRCUIT - RANDONNÉE VTT
-- ============================================================================
INSERT INTO circuits (id, author_id, author_type, project_id, title, description, start_date, end_date, duration_days, duration_nights, region, base_price, currency, max_participants, confirmation_mode, inclusions, exclusions, lat, lng, address, status, images) VALUES
  ('55000000-0001-0000-0000-000000000021', '6fb2d1e7-39db-4152-b9b5-5b440f551cc9', 'guide', NULL, 'Aventure VTT : Hammamet à Korbous', 'Circuit de 2 jours à VTT dans les collines de la région d''Hammamet. Panoramas spectaculaires, visite d''oliviers bio et dégustation locale.', '2026-08-10', '2026-08-11', 2, 1, 'Cap Bon', 280.00, 'TND', 10, 'manual', 'VTT, casque, guide, transfert, collation, dégustation', 'Repas personnels, assurance', 36.4020, 10.6300, 'Hammamet', 'approved', NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 8. NOUVEAU CIRCUIT - ARTISANAT ET CULTURE
-- ============================================================================
INSERT INTO circuits (id, author_id, author_type, project_id, title, description, start_date, end_date, duration_days, duration_nights, region, base_price, currency, max_participants, confirmation_mode, inclusions, exclusions, lat, lng, address, status, images) VALUES
  ('55000000-0001-0000-0000-000000000022', '87a38946-9a54-4bb4-be4a-887be312af15', 'guide', NULL, 'Trésors Artisanaux de Tunisie', 'Circuit de 3 jours à la découverte des artisans tunisiens. Hammamet (poterie), Nabeul (céramique), Tunis (artisanat traditionnel).', '2026-09-05', '2026-09-07', 3, 2, 'Tunis', 450.00, 'TND', 12, 'automatic', 'Transport, hébergement, ateliers, guide, repas', 'Achats personnels, assurance', 36.4020, 10.6300, 'Hammamet', 'approved', NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 9. NOUVEAU TRIP PLAN - CIRCUIT PHOTOGRAPHIQUE
-- ============================================================================
INSERT INTO trip_plans (id, eco_traveler_id, title, description, start_date, end_date, status) VALUES
  ('55000000-0001-0000-0000-000000000024', 'b09808ee-30a9-4089-bbf7-698e73004ef4', 'Photo Tour : Trésors de Tunisie', 'Circuit photographique de 10 jours à travers les plus beaux sites de Tunisie. Hammamet, Matmata, Korba, Douz. Paysages culturels et naturels.', '2026-10-01', '2026-10-10', 'draft')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 10. NOUVEAU TRIP PLAN - AVENTURE ÉCOLOGIQUE
-- ============================================================================
INSERT INTO trip_plans (id, eco_traveler_id, title, description, start_date, end_date, status) VALUES
  ('55000000-0001-0000-0000-000000000025', 'a602737a-b07d-4a41-b9c3-cdf1be17036a', 'Aventure Éco : Hammamet à Korba', 'Séjour de 7 jours combinant activités nautiques et randonnées éco-responsables. Observation marine, vélo électrique, et gastronomie locale.', '2026-09-15', '2026-09-21', 'draft')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 11. MISE À JOUR DES IMAGES
-- ============================================================================
UPDATE offers SET images = '{"https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80","https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"}' WHERE id = '55000000-0001-0000-0000-000000000013';
UPDATE offers SET images = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80,https://images.unsplash.com/photo-1590595906931-81f04f0ccebb?w=800&q=80' WHERE id = '55000000-0001-0000-0000-000000000014';
UPDATE offers SET images = 'https://images.unsplash.com/photo-1504457047772-27faf1c00561?w=800&q=80,https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80' WHERE id = '55000000-0001-0000-0000-000000000015';

UPDATE circuits SET images = 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80,https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80' WHERE id = '55000000-0001-0000-0000-000000000021';
UPDATE circuits SET images = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80,https://images.unsplash.com/photo-1590595906931-81f04f0ccebb?w=800&q=80' WHERE id = '55000000-0001-0000-0000-000000000022';

COMMIT;