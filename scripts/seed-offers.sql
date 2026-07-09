-- ============================================================================
-- Seed: Offres touristiques pour Djerba et Fernana
-- Projet: EcoVoyage
-- Date: Juillet 2026
-- ============================================================================
-- Ces offres sont destinées à être référencées par les program items
-- des circuits (circuit_program_items.linked_offer_item_id).
--
-- Catégories (offer_categories) — IDs provenant de seed.sql :
--   accommodation: a327acf4-6d42-4d5d-8ebc-8dfdc02c75de
--   activity:      f8509a3c-747f-475b-b4a0-40a32c765bfb
--   restaurant:    4269fcff-40fe-478e-9214-17b2fcb01415
--   craft:         d8835649-c729-4625-9f46-820cc02a9d72
--   transfer:      1a75c8ad-47b6-4661-87b1-eb5afdb3e397
--
-- Project owners (author_ids) : a0000000-0000-4000-8000-000000000020 à 000027
-- Offer UUIDs                : a0000000-0001-4000-8000-000000000001 à 000008
-- Offer item UUIDs           : a0000000-0002-4000-8000-000000000001 à 000020
-- Offer item price UUIDs     : a0000000-0003-4000-8000-000000000001 à 000020
-- ============================================================================

BEGIN;

-- ============================================================================
-- OFFRES - DJERBA (~33.8667, 10.8500)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Hôtel Djerba (Hébergement)
-- ---------------------------------------------------------------------------
INSERT INTO offers (
  id, author_id, author_type, project_id, category_id,
  title, description, price, duration, offer_type,
  images, inclusions, region, address,
  latitude, longitude,
  meeting_point, meeting_lat, meeting_lng,
  location_type, min_group_size, max_group_size, min_age,
  cancellation_policy, sustainability_score,
  deposit_percentage, production_delay_days,
  fulfillment_mode, confirmation_mode, status
) VALUES (
  'a0000000-0001-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000020',
  'project_owner', NULL,
  'a327acf4-6d42-4d5d-8ebc-8dfdc02c75de',
  'Hôtel Éco-Plage Djerba',
  'Hôtel écologique en bord de mer avec piscine naturelle, panneaux solaires et cuisine bio. Chambres vue mer et accès direct à la plage.',
  150.00, '1 nuit', 'hebergement',
  NULL, 'Petit-déjeuner bio, Wi-Fi, piscine, parking, serviettes de plage',
  'Djerba', 'Zone Touristique Midoun, Djerba 4116',
  33.8667, 10.8500,
  'Réception Hôtel Éco-Plage', 33.8667, 10.8500,
  'fixed', 1, 4, NULL,
  'Annulation gratuite 48h avant, remboursement 50% sous 24h', 88,
  20, NULL,
  'instant_stock', 'automatic', 'approved'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, requires_confirmation, status)
VALUES
  ('a0000000-0002-4000-8000-000000000001', 'a0000000-0001-4000-8000-000000000001',
   'Chambre Double Vue Mer', 'Chambre double climatisée avec balcon vue mer', 'room',
   '{"bed_count":2,"nights":1,"room_sub_type":"double"}', false, 'active'),
  ('a0000000-0002-4000-8000-000000000002', 'a0000000-0001-4000-8000-000000000001',
   'Suite Familiale 4 Pers.', 'Suite familiale avec chambre parentale, lits superposés enfants, salon et terrasse', 'room',
   '{"bed_count":4,"nights":1,"room_sub_type":"family"}', false, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO offer_item_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default, status)
VALUES
  ('a0000000-0003-4000-8000-000000000001', 'a0000000-0002-4000-8000-000000000001',
   'Adulte', 150.00, 'TND', 'per_night', true, 'active'),
  ('a0000000-0003-4000-8000-000000000002', 'a0000000-0002-4000-8000-000000000002',
   'Adulte', 250.00, 'TND', 'per_night', true, 'active')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. Atelier Poterie Guellala (Artisanat)
-- ---------------------------------------------------------------------------
INSERT INTO offers (
  id, author_id, author_type, project_id, category_id,
  title, description, price, duration, offer_type,
  images, inclusions, region, address,
  latitude, longitude,
  meeting_point, meeting_lat, meeting_lng,
  location_type, min_group_size, max_group_size, min_age,
  cancellation_policy, sustainability_score,
  deposit_percentage, production_delay_days,
  fulfillment_mode, confirmation_mode, status
) VALUES (
  'a0000000-0001-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000021',
  'project_owner', NULL,
  'd8835649-c729-4625-9f46-820cc02a9d72',
  'Atelier Poterie Traditionnelle Guellala',
  'Initiez-vous à la poterie traditionnelle de Guellala avec les artisanes de la coopérative. Argile locale, tour de potier, décoration et cuisson. Repartez avec votre création unique.',
  35.00, '2h30', 'artisanat',
  NULL, 'Argile, outils, cuisson, emballage de votre pièce, certificat',
  'Djerba', 'Guellala, Djerba 4155',
  33.7800, 10.9200,
  'Coopérative Artisanale Guellala', 33.7800, 10.9200,
  'fixed', 1, 10, 6,
  'Non remboursable', 92,
  50, 1,
  'on_request', 'manual', 'approved'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, requires_confirmation, status)
VALUES
  ('a0000000-0002-4000-8000-000000000003', 'a0000000-0001-4000-8000-000000000002',
   'Initiation Poterie 2h30', 'Cours d initiation aux techniques de poterie traditionnelle', 'workshop',
   '{"duration_minutes":150,"level":"debutant","materials_included":true}', false, 'active'),
  ('a0000000-0002-4000-8000-000000000004', 'a0000000-0001-4000-8000-000000000002',
   'Atelier Poterie Demi-Journée', 'Atelier complet création, décoration et cuisson avec déjeuner traditionnel inclus', 'workshop',
   '{"duration_minutes":240,"level":"debutant","materials_included":true,"meal_included":true}', true, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO offer_item_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default, status)
VALUES
  ('a0000000-0003-4000-8000-000000000003', 'a0000000-0002-4000-8000-000000000003',
   'Adulte', 35.00, 'TND', 'per_person', true, 'active'),
  ('a0000000-0003-4000-8000-000000000004', 'a0000000-0002-4000-8000-000000000003',
   'Enfant (6-12 ans)', 20.00, 'TND', 'per_person', false, 'active'),
  ('a0000000-0003-4000-8000-000000000005', 'a0000000-0002-4000-8000-000000000004',
   'Adulte', 75.00, 'TND', 'per_person', true, 'active')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. Activité Plage Djerba (Activité)
-- ---------------------------------------------------------------------------
INSERT INTO offers (
  id, author_id, author_type, project_id, category_id,
  title, description, price, duration, offer_type,
  images, inclusions, region, address,
  latitude, longitude,
  meeting_point, meeting_lat, meeting_lng,
  location_type, min_group_size, max_group_size, min_age,
  cancellation_policy, sustainability_score,
  deposit_percentage, production_delay_days,
  fulfillment_mode, confirmation_mode, status
) VALUES (
  'a0000000-0001-4000-8000-000000000003',
  'a0000000-0000-4000-8000-000000000022',
  'project_owner', NULL,
  'f8509a3c-747f-475b-b4a0-40a32c765bfb',
  'Plage & Sports Nautiques Djerba',
  'Journée complète à la plage avec activités nautiques écoresponsables : kayak, paddle, snorkeling. Encadrement par des moniteurs certifiés. Équipements respectueux de l environnement.',
  60.00, '1 journée', 'activite',
  NULL, 'Kayak, paddle, masque-tuba, moniteur, lunch bio, crème solaire bio',
  'Djerba', 'Plage de Midoun, Djerba 4116',
  33.8600, 10.8550,
  'Plage Publique Midoun - Poste de secours', 33.8600, 10.8550,
  'fixed', 1, 12, 6,
  'Annulation gratuite 48h avant, remboursement si météo défavorable', 85,
  0, NULL,
  'scheduled', 'automatic', 'approved'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, requires_confirmation, status)
VALUES
  ('a0000000-0002-4000-8000-000000000005', 'a0000000-0001-4000-8000-000000000003',
   'Kayak de Mer 2h', 'Balade en kayak le long de la côte avec arrêt snorkeling', 'activity',
   '{"duration_minutes":120,"level":"debutant","equipment_included":true}', false, 'active'),
  ('a0000000-0002-4000-8000-000000000006', 'a0000000-0001-4000-8000-000000000003',
   'Paddle Board 1h', 'Stand-up paddle dans les eaux calmes du littoral djerbien', 'activity',
   '{"duration_minutes":60,"level":"debutant","equipment_included":true}', false, 'active'),
  ('a0000000-0002-4000-8000-000000000007', 'a0000000-0001-4000-8000-000000000003',
   'Pack Plage Demi-Journée', 'Kayak + paddle + snorkeling + déjeuner bio', 'activity',
   '{"duration_minutes":240,"level":"debutant","equipment_included":true,"meal_included":true}', true, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO offer_item_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default, status)
VALUES
  ('a0000000-0003-4000-8000-000000000006', 'a0000000-0002-4000-8000-000000000005',
   'Adulte', 30.00, 'TND', 'per_person', true, 'active'),
  ('a0000000-0003-4000-8000-000000000007', 'a0000000-0002-4000-8000-000000000006',
   'Adulte', 20.00, 'TND', 'per_person', true, 'active'),
  ('a0000000-0003-4000-8000-000000000008', 'a0000000-0002-4000-8000-000000000007',
   'Adulte', 60.00, 'TND', 'per_person', true, 'active')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4. Transport Djerba (Transfert)
-- ---------------------------------------------------------------------------
INSERT INTO offers (
  id, author_id, author_type, project_id, category_id,
  title, description, price, duration, offer_type,
  images, inclusions, region, address,
  latitude, longitude,
  meeting_point, meeting_lat, meeting_lng,
  location_type, min_group_size, max_group_size, min_age,
  cancellation_policy, sustainability_score,
  deposit_percentage, production_delay_days,
  fulfillment_mode, confirmation_mode, status
) VALUES (
  'a0000000-0001-4000-8000-000000000004',
  'a0000000-0000-4000-8000-000000000023',
  'project_owner', NULL,
  '1a75c8ad-47b6-4661-87b1-eb5afdb3e397',
  'Navette Éco Djerba',
  'Service de navette électrique ou hybride pour découvrir Djerba. Prise en charge à l aéroport / port et transferts vers tous les sites touristiques de l île. Véhicules basse émission.',
  25.00, 'trajet', 'transport',
  NULL, 'Prise en charge, climatisation, guide conducteur, eau fraîche',
  'Djerba', 'Aéroport Djerba-Zarzis, Djerba 4116',
  33.8750, 10.7750,
  'Sortie Aéroport Djerba', 33.8750, 10.7750,
  'mobile', 1, 7, NULL,
  'Annulation gratuite 4h avant', 78,
  0, NULL,
  'instant_stock', 'automatic', 'approved'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, requires_confirmation, status)
VALUES
  ('a0000000-0002-4000-8000-000000000008', 'a0000000-0001-4000-8000-000000000004',
   'Transfert Aéroport → Hôtel', 'Trajet direct de l aéroport vers tout hôtel à Djerba', 'transport_service',
   '{"distance_km":25,"vehicle_type":"electric_car","max_passengers":4}', true, 'active'),
  ('a0000000-0002-4000-8000-000000000009', 'a0000000-0001-4000-8000-000000000004',
   'Tour Demi-Journée Djerba', 'Circuit découverte des principaux sites de Djerba en véhicule électrique (Houmt Souk, Guellala, El Ghriba)', 'transport_service',
   '{"duration_hours":4,"vehicle_type":"electric_minibus","max_passengers":7}', true, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO offer_item_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default, status)
VALUES
  ('a0000000-0003-4000-8000-000000000009', 'a0000000-0002-4000-8000-000000000008',
   'Par personne', 25.00, 'TND', 'per_person', true, 'active'),
  ('a0000000-0003-4000-8000-000000000010', 'a0000000-0002-4000-8000-000000000009',
   'Adulte', 80.00, 'TND', 'per_person', true, 'active'),
  ('a0000000-0003-4000-8000-000000000011', 'a0000000-0002-4000-8000-000000000009',
   'Enfant (4-12 ans)', 45.00, 'TND', 'per_person', false, 'active')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 5. Restaurant Djerba (Restauration)
-- ---------------------------------------------------------------------------
INSERT INTO offers (
  id, author_id, author_type, project_id, category_id,
  title, description, price, duration, offer_type,
  images, inclusions, region, address,
  latitude, longitude,
  meeting_point, meeting_lat, meeting_lng,
  location_type, min_group_size, max_group_size, min_age,
  cancellation_policy, sustainability_score,
  deposit_percentage, production_delay_days,
  fulfillment_mode, confirmation_mode, status
) VALUES (
  'a0000000-0001-4000-8000-000000000005',
  'a0000000-0000-4000-8000-000000000024',
  'project_owner', NULL,
  '4269fcff-40fe-478e-9214-17b2fcb01415',
  'Restaurant Le Dauphin Djerba',
  'Restaurant de fruits de mer frais avec terrasse vue mer. Cuisine tunisienne traditionnelle revisitée avec des produits locaux et bio. Pêche responsable certifiée.',
  45.00, 'repas', 'restauration',
  NULL, 'Entrée + plat principal + dessert, thé à la menthe, pain traditionnel',
  'Djerba', 'Bord de Mer, Houmt Souk, Djerba 4180',
  33.8680, 10.8490,
  'Restaurant Le Dauphin - Corniche', 33.8680, 10.8490,
  'fixed', 1, 8, NULL,
  'Annulation gratuite 24h avant', 80,
  0, NULL,
  'on_request', 'manual', 'approved'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, requires_confirmation, status)
VALUES
  ('a0000000-0002-4000-8000-00000000000a', 'a0000000-0001-4000-8000-000000000005',
   'Menu Fruit de Mer', 'Entrée : brick au thon / Plat : couscous poisson grillé / Dessert : makroud', 'menu',
   '{"courses":3,"type":"seafood","drink_included":false}', false, 'active'),
  ('a0000000-0002-4000-8000-00000000000b', 'a0000000-0001-4000-8000-000000000005',
   'Menu Traditionnel Tunisien', 'Entrée : salade mechouia / Plat : couscous aux légumes et mouton / Dessert : baklava', 'menu',
   '{"courses":3,"type":"traditional","drink_included":false}', false, 'active'),
  ('a0000000-0002-4000-8000-00000000000c', 'a0000000-0001-4000-8000-000000000005',
   'Dîner Gastronomique 5 Services', 'Dîner dégustation complet avec accord de thés et pâtisseries', 'menu',
   '{"courses":5,"type":"degustation","drink_included":true}', true, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO offer_item_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default, status)
VALUES
  ('a0000000-0003-4000-8000-000000000012', 'a0000000-0002-4000-8000-00000000000a',
   'Adulte', 45.00, 'TND', 'per_person', true, 'active'),
  ('a0000000-0003-4000-8000-000000000013', 'a0000000-0002-4000-8000-00000000000b',
   'Adulte', 35.00, 'TND', 'per_person', true, 'active'),
  ('a0000000-0003-4000-8000-000000000014', 'a0000000-0002-4000-8000-00000000000c',
   'Adulte', 85.00, 'TND', 'per_person', true, 'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- OFFRES - FERNANA (~36.6500, 8.7000)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 6. Randonnée Fernana (Activité)
-- ---------------------------------------------------------------------------
INSERT INTO offers (
  id, author_id, author_type, project_id, category_id,
  title, description, price, duration, offer_type,
  images, inclusions, region, address,
  latitude, longitude,
  meeting_point, meeting_lat, meeting_lng,
  location_type, min_group_size, max_group_size, min_age,
  cancellation_policy, sustainability_score,
  deposit_percentage, production_delay_days,
  fulfillment_mode, confirmation_mode, status
) VALUES (
  'a0000000-0001-4000-8000-000000000006',
  'a0000000-0000-4000-8000-000000000025',
  'project_owner', NULL,
  'f8509a3c-747f-475b-b4a0-40a32c765bfb',
  'Randonnée Forêt des Kroumiries',
  'Randonnée guidée dans la forêt de chênes-lièges de Fernana. Découverte de la biodiversité, sources naturelles et points de vue panoramiques sur les montagnes des Kroumiries. Pique-nique bio inclus.',
  120.00, '1 journée', 'activite',
  NULL, 'Guide naturaliste, pique-nique bio, eau, bâtons de marche',
  'Fernana', 'Centre Ville, Fernana 8114',
  36.6594, 8.6949,
  'Place Principale de Fernana', 36.6594, 8.6949,
  'fixed', 2, 10, 8,
  'Annulation gratuite 72h avant', 90,
  30, NULL,
  'scheduled', 'manual', 'approved'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, requires_confirmation, status)
VALUES
  ('a0000000-0002-4000-8000-00000000000d', 'a0000000-0001-4000-8000-000000000006',
   'Randonnée Demi-Journée', 'Randonnée de 4h dans la forêt avec guide', 'activity',
   '{"duration_minutes":240,"level":"facile","distance_km":8}', false, 'active'),
  ('a0000000-0002-4000-8000-00000000000e', 'a0000000-0001-4000-8000-000000000006',
   'Randonnée Journée Complète', 'Randonnée de 6h avec pique-nique et baignade aux sources', 'activity',
   '{"duration_minutes":360,"level":"modere","distance_km":14,"meal_included":true}', false, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO offer_item_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default, status)
VALUES
  ('a0000000-0003-4000-8000-000000000015', 'a0000000-0002-4000-8000-00000000000d',
   'Adulte', 60.00, 'TND', 'per_person', true, 'active'),
  ('a0000000-0003-4000-8000-000000000016', 'a0000000-0002-4000-8000-00000000000e',
   'Adulte', 120.00, 'TND', 'per_person', true, 'active')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 7. Hébergement Fernana (Hébergement)
-- ---------------------------------------------------------------------------
INSERT INTO offers (
  id, author_id, author_type, project_id, category_id,
  title, description, price, duration, offer_type,
  images, inclusions, region, address,
  latitude, longitude,
  meeting_point, meeting_lat, meeting_lng,
  location_type, min_group_size, max_group_size, min_age,
  cancellation_policy, sustainability_score,
  deposit_percentage, production_delay_days,
  fulfillment_mode, confirmation_mode, status
) VALUES (
  'a0000000-0001-4000-8000-000000000007',
  'a0000000-0000-4000-8000-000000000026',
  'project_owner', NULL,
  'a327acf4-6d42-4d5d-8ebc-8dfdc02c75de',
  'Éco-Gîte Fernana',
  'Gîte rural écologique niché dans la forêt de Fernana. Construction en matériaux locaux, chauffage au bois, jardin potager bio. Vue imprenable sur les montagnes.',
  70.00, '1 nuit', 'hebergement',
  NULL, 'Petit-déjeuner bio, chauffage, eau chaude solaire, linge de lit',
  'Fernana', 'Route de la Forêt, Fernana 8114',
  36.6530, 8.6900,
  'Entrée du Gîte - Route Forestière', 36.6530, 8.6900,
  'fixed', 1, 8, NULL,
  'Annulation gratuite 48h avant', 95,
  25, NULL,
  'instant_stock', 'automatic', 'approved'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, requires_confirmation, status)
VALUES
  ('a0000000-0002-4000-8000-00000000000f', 'a0000000-0001-4000-8000-000000000007',
   'Chambre Double Forestière', 'Chambre double avec vue sur la forêt, poêle à bois', 'room',
   '{"bed_count":2,"nights":1,"room_sub_type":"double"}', false, 'active'),
  ('a0000000-0002-4000-8000-000000000010', 'a0000000-0001-4000-8000-000000000007',
   'Dortoir 4 Places', 'Dortoir confortable pour groupe ou famille', 'room',
   '{"bed_count":4,"nights":1,"room_sub_type":"dormitory"}', false, 'active'),
  ('a0000000-0002-4000-8000-000000000011', 'a0000000-0001-4000-8000-000000000007',
   'Pack Rando + Nuitée', 'Randonnée guidée demi-journée + nuit + petit-déjeuner + dîner', 'room',
   '{"bed_count":2,"nights":1,"room_sub_type":"double","guided_tour":true,"meal_included":true}', true, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO offer_item_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default, status)
VALUES
  ('a0000000-0003-4000-8000-000000000017', 'a0000000-0002-4000-8000-00000000000f',
   'Adulte', 70.00, 'TND', 'per_night', true, 'active'),
  ('a0000000-0003-4000-8000-000000000018', 'a0000000-0002-4000-8000-000000000010',
   'Par personne', 35.00, 'TND', 'per_night', true, 'active'),
  ('a0000000-0003-4000-8000-000000000019', 'a0000000-0002-4000-8000-000000000011',
   'Par personne', 140.00, 'TND', 'per_person', true, 'active')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 8. Artisanat Fernana (Artisanat)
-- ---------------------------------------------------------------------------
INSERT INTO offers (
  id, author_id, author_type, project_id, category_id,
  title, description, price, duration, offer_type,
  images, inclusions, region, address,
  latitude, longitude,
  meeting_point, meeting_lat, meeting_lng,
  location_type, min_group_size, max_group_size, min_age,
  cancellation_policy, sustainability_score,
  deposit_percentage, production_delay_days,
  fulfillment_mode, confirmation_mode, status
) VALUES (
  'a0000000-0001-4000-8000-000000000008',
  'a0000000-0000-4000-8000-000000000027',
  'project_owner', NULL,
  'd8835649-c729-4625-9f46-820cc02a9d72',
  'Atelier Tissage et Vannerie Fernana',
  'Découvrez l artisanat traditionnel des Kroumiries : tissage de la laine, vannerie en roseau et broderie. Ateliers animés par des artisanes locales dans leur atelier familial.',
  25.00, '2h', 'artisanat',
  NULL, 'Matériel fourni, création à emporter, thé traditionnel',
  'Fernana', 'Village Artisanal, Fernana 8114',
  36.6500, 8.7000,
  'Atelier Artisanal - Centre Village', 36.6500, 8.7000,
  'fixed', 1, 6, 8,
  'Non remboursable', 90,
  50, 2,
  'on_request', 'manual', 'approved'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, requires_confirmation, status)
VALUES
  ('a0000000-0002-4000-8000-000000000012', 'a0000000-0001-4000-8000-000000000008',
   'Initiation Tissage 2h', 'Apprenez les bases du tissage sur métier traditionnel', 'workshop',
   '{"duration_minutes":120,"level":"debutant","materials_included":true}', false, 'active'),
  ('a0000000-0002-4000-8000-000000000013', 'a0000000-0001-4000-8000-000000000008',
   'Atelier Vannerie 3h', 'Confectionnez un panier en roseau tressé', 'workshop',
   '{"duration_minutes":180,"level":"debutant","materials_included":true}', false, 'active'),
  ('a0000000-0002-4000-8000-000000000014', 'a0000000-0001-4000-8000-000000000008',
   'Stage Tissage Complet 2 Jours', 'Stage intensif de tissage avec création d un tapis berbère', 'workshop',
   '{"duration_hours":12,"level":"intermediaire","materials_included":true,"meal_included":true}', true, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO offer_item_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default, status)
VALUES
  ('a0000000-0003-4000-8000-00000000001a', 'a0000000-0002-4000-8000-000000000012',
   'Adulte', 25.00, 'TND', 'per_person', true, 'active'),
  ('a0000000-0003-4000-8000-00000000001b', 'a0000000-0002-4000-8000-000000000013',
   'Adulte', 40.00, 'TND', 'per_person', true, 'active'),
  ('a0000000-0003-4000-8000-00000000001c', 'a0000000-0002-4000-8000-000000000014',
   'Adulte', 180.00, 'TND', 'per_person', true, 'active')
ON CONFLICT (id) DO NOTHING;

COMMIT;
