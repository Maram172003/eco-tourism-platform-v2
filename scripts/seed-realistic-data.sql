-- ============================================================================
-- SEED : Données réalistes pour fakerbennoomen, f.akerbennoomen, fa.kerbennoomen
-- Date : 3 juillet 2026
-- ============================================================================
BEGIN;

-- ============================================================================
-- IDENTIFIANTS
-- ============================================================================
-- Guide  : fa.kerbennoomen@gmail.com → 87a38946-9a54-4bb4-be4a-887be312af15
-- Eco    : f.akerbennoomen@gmail.com  → 7b83e87d-276d-4d89-bb00-ab8ea1243a14
-- Projet : fakerbennoomen@gmail.com   → 92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e

-- Projets du project owner
-- 4726b852-4e38-44b0-af57-473591a01099 → Projet Eco Tataouine (Chenini)
-- b1a2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d → Éco-Lodge Forêt de Kroumirie (Ain Draham)
-- c3a2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c65 → Atelier Poterie Traditionnelle (Hammamet)
-- c4a2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c66 → Éco-Gîte Matmata
-- c1a2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c63 → Centre Kayak Éco Korba

-- Autres guides
-- 6fb2d1e7-39db-4152-b9b5-5b440f551cc9 → Karim Bouazizi (Douz)
-- faa9c369-1141-4730-b573-0551c8341ab9 → Yasmine Bouassida (Mahdia)
-- 6f51888f-7128-4294-8586-5c349eef66d8 → Mehdi Sassi (Djerba)
-- 361d089f-142f-4e4f-b114-137f072d3326 → Ines Gharbi (Gabès)
-- 9ff1490e-0b03-4bcb-9180-e67d1c3b372a → Biber (Gabès)

-- ============================================================================
-- 1. METTRE À JOUR LE GUIDE : Zone → Fernana (Jendouba)
-- ============================================================================
UPDATE guides
SET
  zone = 'Fernana',
  specialties = ARRAY['nature','randonnee','foret','bien-etre','ecotourisme'],
  languages_spoken = ARRAY['ar','fr','en'],
  bio = 'Guide passionné par les forêts des Kroumiries. Spécialiste des randonnées à Fernana et Ain Draham. Accompagnateur certifié en éco-tourisme.'
WHERE user_id = '87a38946-9a54-4bb4-be4a-887be312af15';

-- ============================================================================
-- 2. CRÉER LES GUIDE OFFERINGS AVEC RAYON 10KM À FERNANA
-- ============================================================================

-- 2a. Prestation : Randonnée Fernana (point central)
INSERT INTO guide_offerings (id, guide_id, title, description, languages, price, pricing_unit, min_travelers, max_travelers, service_zone_type, lat, lng, radius_km, zone_governorate, zone_municipality, displacement_allowed, displacement_max_km, status, confirmation_mode)
VALUES
  ('a1b00000-0001-4000-8000-000000000001', '87a38946-9a54-4bb4-be4a-887be312af15',
   'Randonnée Forêt de Fernana',
   'Exploration des forêts de chênes-lièges et des sources naturelles autour de Fernana. Parcours adapté à tous niveaux avec pauses paysages et pique-nique en pleine nature.',
   ARRAY['ar','fr','en'], 120.00, 'hour', 1, 8,
   'radius', 36.6594, 8.6949, 10.00,
   'Jendouba', 'Fernana', true, 10.00,
   'active', 'automatic')
ON CONFLICT (id) DO NOTHING;

-- Règle disponibilité : quotidienne
INSERT INTO guide_offering_availability_rules (id, guide_offering_id, availability_type, start_time, end_time, is_active)
VALUES
  ('b1b00000-0001-4000-8000-000000000001', 'a1b00000-0001-4000-8000-000000000001', 'daily', '08:00', '17:00', true)
ON CONFLICT (id) DO NOTHING;

-- 2b. Prestation : Visite Sources Thermales
INSERT INTO guide_offerings (id, guide_id, title, description, languages, price, pricing_unit, min_travelers, max_travelers, service_zone_type, lat, lng, radius_km, zone_governorate, zone_municipality, displacement_allowed, displacement_max_km, status, confirmation_mode)
VALUES
  ('a1b00000-0001-4000-8000-000000000002', '87a38946-9a54-4bb4-be4a-887be312af15',
   'Visite des Sources Thermales de Hammam Bourguiba',
   'Découverte des sources chaudes naturelles nichées dans la forêt. Baignade, détente et histoire des thermes romains de la région.',
   ARRAY['fr','ar'], 80.00, 'hour', 1, 10,
   'radius', 36.6500, 8.5800, 10.00,
   'Jendouba', 'Fernana', true, 8.00,
   'active', 'automatic')
ON CONFLICT (id) DO NOTHING;

INSERT INTO guide_offering_availability_rules (id, guide_offering_id, availability_type, start_time, end_time, is_active)
VALUES
  ('b1b00000-0001-4000-8000-000000000002', 'a1b00000-0001-4000-8000-000000000002', 'weekly', '09:00', '16:00', true)
ON CONFLICT (id) DO NOTHING;

-- Mise à jour de la règle weekly pour préciser les weekdays (mercredi, samedi, dimanche)
UPDATE guide_offering_availability_rules
SET weekdays = ARRAY[0,3,6]
WHERE id = 'b1b00000-0001-4000-8000-000000000002';

-- 2c. Prestation : Découverte Artisanat Fernana
INSERT INTO guide_offerings (id, guide_id, title, description, languages, price, pricing_unit, min_travelers, max_travelers, service_zone_type, lat, lng, radius_km, zone_governorate, zone_municipality, displacement_allowed, displacement_max_km, status, confirmation_mode)
VALUES
  ('a1b00000-0001-4000-8000-000000000003', '87a38946-9a54-4bb4-be4a-887be312af15',
   'Tour Artisanat et Culture Fernana',
   'Visite des ateliers d''artisans locaux : poterie traditionnelle, tissage et vannerie. Rencontre avec les familles locales et démonstration de savoir-faire ancestraux.',
   ARRAY['fr','ar','en'], 100.00, 'hour', 2, 8,
   'radius', 36.6650, 8.7000, 10.00,
   'Jendouba', 'Fernana', true, 5.00,
   'active', 'automatic')
ON CONFLICT (id) DO NOTHING;

INSERT INTO guide_offering_availability_rules (id, guide_offering_id, availability_type, start_time, end_time, is_active, weekdays)
VALUES
  ('b1b00000-0001-4000-8000-000000000003', 'a1b00000-0001-4000-8000-000000000003', 'weekly', '09:00', '14:00', true, ARRAY[1,2,4,5])
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. CRÉER DES OFFRES POUR LE PROJECT OWNER (fakerbennoomen@gmail.com)
-- ============================================================================

-- 3a. Ajouter des items à "Atelier Poterie Traditionnelle" (55000000-0001-0000-0000-000000000014)
INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status)
VALUES
  ('a2000000-0001-4000-8000-000000000001', '55000000-0001-0000-0000-000000000014',
   'Initiation Poterie 2h',
   'Initiation aux techniques de poterie traditionnelle avec un maître artisan. Argile locale, tour de potier, cuisson traditionnelle.',
   'workshop', '{"duration_minutes": 120, "level": "debutant", "materials_included": true}', 'active'),
  ('a2000000-0001-4000-8000-000000000002', '55000000-0001-0000-0000-000000000014',
   'Atelier Poterie Demi-Journée',
   'Atelier complet de poterie : création, décoration et cuisson. Repartez avec vos créations !',
   'workshop', '{"duration_minutes": 240, "level": "debutant", "materials_included": true, "meal_included": true}', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO offer_item_prices (id, offer_item_id, label, price, pricing_unit, is_default)
VALUES
  ('a3000000-0001-4000-8000-000000000001', 'a2000000-0001-4000-8000-000000000001', 'Initiation Poterie 2h', 45.00, 'per_person', true),
  ('a3000000-0001-4000-8000-000000000002', 'a2000000-0001-4000-8000-000000000002', 'Atelier Poterie Demi-Journée', 85.00, 'per_person', true)
ON CONFLICT (id) DO NOTHING;

-- 3b. Ajouter des items à "Kayak de Mer Korba" (55000000-0001-0000-0000-000000000012)
INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status)
VALUES
  ('a2000000-0001-4000-8000-000000000011', '55000000-0001-0000-0000-000000000012',
   'Kayak 2h Côte Korba',
   'Balade en kayak le long de la côte de Korba. Découverte des criques et falaises. Matériel inclus.',
   'activity', '{"duration_minutes": 120, "level": "debutant", "equipment_included": true}', 'active'),
  ('a2000000-0001-4000-8000-000000000012', '55000000-0001-0000-0000-000000000012',
   'Kayak + Snorkeling Demi-Journée',
   'Kayak vers les spots de snorkeling de Korba. Observation des tortues marines et poissons multicolores.',
   'activity', '{"duration_minutes": 240, "level": "debutant", "equipment_included": true, "snorkeling_included": true}', 'active'),
  ('a2000000-0001-4000-8000-000000000013', '55000000-0001-0000-0000-000000000012',
   'Location Kayak Journée',
   'Location libre d''un kayak pour la journée.',
   'equipment', '{"duration_hours": 8, "equipment_included": true}', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO offer_item_prices (id, offer_item_id, label, price, pricing_unit, is_default)
VALUES
  ('a3000000-0001-4000-8000-000000000011', 'a2000000-0001-4000-8000-000000000011', 'Kayak 2h Côte Korba', 35.00, 'per_person', true),
  ('a3000000-0001-4000-8000-000000000012', 'a2000000-0001-4000-8000-000000000012', 'Kayak + Snorkeling Demi-Journée', 65.00, 'per_person', true),
  ('a3000000-0001-4000-8000-000000000013', 'a2000000-0001-4000-8000-000000000013', 'Location Kayak Journée', 50.00, 'per_person', true)
ON CONFLICT (id) DO NOTHING;

-- 3c. Ajouter des items à "Chambre Troglodyte Matmata" (55000000-0001-0000-0000-000000000015)
INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status)
VALUES
  ('a2000000-0001-4000-8000-000000000021', '55000000-0001-0000-0000-000000000015',
   'Nuitée Chambre Troglodyte',
   'Nuit dans une chambre troglodyte authentique. Petit-déjeuner berbère inclus.',
   'room', '{"bed_count": 2, "nights": 1, "room_sub_type": "private"}', 'active'),
  ('a2000000-0001-4000-8000-000000000022', '55000000-0001-0000-0000-000000000015',
   'Pack Découverte 2 Nuits',
   '2 nuits en chambre troglodyte + visite guidée du village + dîner traditionnel.',
   'room', '{"bed_count": 2, "nights": 2, "room_sub_type": "private", "guided_tour": true}', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO offer_item_prices (id, offer_item_id, label, price, pricing_unit, is_default)
VALUES
  ('a3000000-0001-4000-8000-000000000021', 'a2000000-0001-4000-8000-000000000021', 'Nuitée Chambre Troglodyte', 55.00, 'per_night', true),
  ('a3000000-0001-4000-8000-000000000022', 'a2000000-0001-4000-8000-000000000022', 'Pack Découverte 2 Nuits', 150.00, 'per_person', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. CRÉER 2 NOUVEAUX CIRCUITS POUR LE PROJECT OWNER (min 3 jours chacun)
-- ============================================================================

-- 4a. Circuit 1 : "Circuit Forêt et Cascades d'Ain Draham"
INSERT INTO circuits (id, author_id, author_type, project_id, title, description, start_date, end_date, duration_days, duration_nights, region, base_price, currency, max_participants, confirmation_mode, difficulty_level, inclusions, exclusions, lat, lng, address, status, images)
VALUES
  ('a5000000-0001-4000-8000-000000000030', '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'project_owner', 'b1a2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
   'Circuit Forêt et Cascades d''Ain Draham',
   'Un circuit de 3 jours au cœur de la forêt des Kroumiries. Randonnées en forêt de chênes-lièges, cascades de Beni Mtir, sources thermales de Hammam Bourguiba et hébergement à l''Éco-Lodge Kroumirie.',
   '2026-08-01', '2026-08-03', 3, 2, 'Ain Draham', 590.00, 'TND', 10, 'manual', 'moderate',
   'Hébergement 2 nuits, petits-déjeuners, déjeuners, guide accompagnateur, entrée sites, transport local',
   'Dîners, boissons, assurance annulation, pourboires',
   36.7837, 8.6865, 'Route de la Forêt, Ain Draham 8130, Tunisie',
   'approved',
   '{"https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80","https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80"}')
ON CONFLICT (id) DO NOTHING;

-- Jour 1 : Arrivée et découverte
INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name)
VALUES
  ('b5000000-0001-4000-8000-000000000001', 'a5000000-0001-4000-8000-000000000030', 1,
   'Arrivée à l''Éco-Lodge et découverte de la forêt',
   'Installation à l''Éco-Lodge, déjeuner, puis randonnée guidée dans la forêt de chênes-lièges.',
   36.7837, 8.6865, 'Ain Draham')
ON CONFLICT (id) DO NOTHING;

-- Activités Jour 1
INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, linked_offer_item_id, duration_minutes, distance_km, transport_mode, guide_id, guide_name)
VALUES
  ('c6000000-0001-4000-8000-000000000001', 'b5000000-0001-4000-8000-000000000001',
   'Arrivée et Installation Bungalow',
   'Accueil à l''Éco-Lodge et check-in. Découverte des lieux et briefing du séjour.',
   '14:00', '15:00', true, true,
   'd1000000-0001-0000-0000-000000000001', 60, null, null, null, null),

  ('c6000000-0001-4000-8000-000000000002', 'b5000000-0001-4000-8000-000000000001',
   'Randonnée Forêt de Chênes-Lièges',
   'Randonnée guidée à travers la forêt millénaire. Observation de la faune et flore.',
   '15:30', '18:00', true, true,
   null, 150, 6, 'walking', '87a38946-9a54-4bb4-be4a-887be312af15', 'Fa Ker Bennoomen'),

  ('c6000000-0001-4000-8000-000000000003', 'b5000000-0001-4000-8000-000000000001',
   'Dîner à l''Éco-Lodge',
   'Dîner bio préparé avec les produits locaux de la région.',
   '19:30', '21:00', true, false,
   null, 90, null, null, null, null)
ON CONFLICT (id) DO NOTHING;

-- Jour 2 : Cascades de Beni Mtir
INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name)
VALUES
  ('b5000000-0001-4000-8000-000000000002', 'a5000000-0001-4000-8000-000000000030', 2,
   'Cascades de Beni Mtir et Pique-nique',
   'Excursion vers les cascades de Beni Mtir. Randonnée, baignade et pique-nique en pleine nature.',
   36.7450, 8.7250, 'Beni Mtir')
ON CONFLICT (id) DO NOTHING;

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, linked_offer_item_id, duration_minutes, distance_km, transport_mode, guide_id, guide_name)
VALUES
  ('c6000000-0001-4000-8000-000000000004', 'b5000000-0001-4000-8000-000000000002',
   'Départ et Transport vers Beni Mtir',
   'Trajet en minibus vers le départ de la randonnée.',
   '08:00', '08:45', true, true,
   null, 45, 15, 'car', null, null),

  ('c6000000-0001-4000-8000-000000000005', 'b5000000-0001-4000-8000-000000000002',
   'Randonnée aux Cascades de Beni Mtir',
   'Randonnée jusqu''aux cascades. Passage par les sources et points de vue panoramiques.',
   '09:00', '12:00', true, true,
   null, 180, 8, 'walking', '87a38946-9a54-4bb4-be4a-887be312af15', 'Fa Ker Bennoomen'),

  ('c6000000-0001-4000-8000-000000000006', 'b5000000-0001-4000-8000-000000000002',
   'Pique-nique et Baignade',
   'Pique-nique près des cascades. Baignade dans les bassins naturels.',
   '12:00', '14:00', true, true,
   null, 120, 0, null, null, null),

  ('c6000000-0001-4000-8000-000000000007', 'b5000000-0001-4000-8000-000000000002',
   'Retour à l''Éco-Lodge et Temps Libre',
   'Retour à l''hébergement. Temps libre pour se reposer ou explorer les environs.',
   '14:00', '17:00', true, false,
   null, 180, null, 'car', null, null),

  ('c6000000-0001-4000-8000-000000000008', 'b5000000-0001-4000-8000-000000000002',
   'Dîner et Veillée',
   'Dîner traditionnel et soirée autour du feu avec contes locaux.',
   '19:00', '22:00', true, false,
   null, 180, null, null, null, null)
ON CONFLICT (id) DO NOTHING;

-- Jour 3 : Sources Thermales et Départ
INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name)
VALUES
  ('b5000000-0001-4000-8000-000000000003', 'a5000000-0001-4000-8000-000000000030', 3,
   'Sources Thermales et Retour',
   'Visite matinale des sources thermales de Hammam Bourguiba, déjeuner et départ.',
   36.6500, 8.5800, 'Hammam Bourguiba')
ON CONFLICT (id) DO NOTHING;

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, linked_offer_item_id, duration_minutes, distance_km, transport_mode, guide_id, guide_name)
VALUES
  ('c6000000-0001-4000-8000-000000000009', 'b5000000-0001-4000-8000-000000000003',
   'Petit-Déjeuner et Check-out',
   'Petit-déjeuner à l''Éco-Lodge et prepare du départ.',
   '07:00', '08:00', true, true,
   null, 60, null, null, null, null),

  ('c6000000-0001-4000-8000-000000000010', 'b5000000-0001-4000-8000-000000000003',
   'Visite des Sources Thermales',
   'Découverte des sources chaudes naturelles de Hammam Bourguiba. Baignade bien-être.',
   '08:30', '11:00', true, true,
   null, 150, 3, 'walking', '87a38946-9a54-4bb4-be4a-887be312af15', 'Fa Ker Bennoomen'),

  ('c6000000-0001-4000-8000-000000000011', 'b5000000-0001-4000-8000-000000000003',
   'Déjeuner de Clôture',
   'Déjeuner traditionnel à l''Éco-Lodge avant le départ.',
   '12:00', '13:30', true, true,
   null, 90, null, null, null, null),

  ('c6000000-0001-4000-8000-000000000012', 'b5000000-0001-4000-8000-000000000003',
   'Départ et Transfert',
   'Transfert vers la gare ou l''aéroport selon les besoins.',
   '14:00', '15:00', true, true,
   null, 60, null, 'car', null, null)
ON CONFLICT (id) DO NOTHING;

-- 4b. Circuit 2 : "Circuit Matmata et Ksour du Sud"
INSERT INTO circuits (id, author_id, author_type, project_id, title, description, start_date, end_date, duration_days, duration_nights, region, base_price, currency, max_participants, confirmation_mode, difficulty_level, inclusions, exclusions, lat, lng, address, status, images)
VALUES
  ('a5000000-0001-4000-8000-000000000031', '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'project_owner', 'c4a2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c66',
   'Circuit Matmata Troglodyte et Ksour du Sud',
   'Plongée dans l''habitat troglodytique de Matmata et découverte des ksour fortifiés de Tataouine. Hébergement authentique, cuisine berbère et traditions ancestrales.',
   '2026-09-15', '2026-09-17', 3, 2, 'Matmata', 490.00, 'TND', 8, 'manual', 'easy',
   'Hébergement 2 nuits en chambre troglodyte, petits-déjeuners, déjeuners, dîner traditionnel, guide, transport',
   'Boissons, assurance, pourboires',
   33.5444, 9.9671, 'Route de Tataouine, Matmata 6070, Tunisie',
   'approved',
   '{"https://images.unsplash.com/photo-1504457047772-27faf1c00561?w=800&q=80","https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80","https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80"}')
ON CONFLICT (id) DO NOTHING;

-- Jour 1 : Arrivée Matmata
INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name)
VALUES
  ('b5000000-0001-4000-8000-000000000011', 'a5000000-0001-4000-8000-000000000031', 1,
   'Arrivée à Matmata et Vie Troglodytique',
   'Installation à l''Éco-Gîte troglodyte, déjeuner, découverte du village troglodyte traditionnel.',
   33.5444, 9.9671, 'Matmata')
ON CONFLICT (id) DO NOTHING;

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, linked_offer_item_id, duration_minutes, distance_km, transport_mode, guide_id, guide_name)
VALUES
  ('c6000000-0001-4000-8000-000000000021', 'b5000000-0001-4000-8000-000000000011',
   'Accueil et Installation',
   'Arrivée à l''Éco-Gîte Matmata. Installation dans les chambres troglodytes typiques.',
   '13:00', '14:00', true, true,
   'd2000000-0001-0000-0000-000000000021', 60, null, null, null, null),

  ('c6000000-0001-4000-8000-000000000022', 'b5000000-0001-4000-8000-000000000011',
   'Déjeuner Berbère',
   'Déjeuner traditionnel berbère dans le gîte.',
   '14:00', '15:00', true, true,
   null, 60, null, null, null, null),

  ('c6000000-0001-4000-8000-000000000023', 'b5000000-0001-4000-8000-000000000011',
   'Visite du Village Troglodyte',
   'Visite guidée des habitations troglodytes de Matmata. Découverte de l''histoire et du mode de vie berbère.',
   '15:30', '17:30', true, true,
   null, 120, 2, 'walking', '87a38946-9a54-4bb4-be4a-887be312af15', 'Fa Ker Bennoomen'),

  ('c6000000-0001-4000-8000-000000000024', 'b5000000-0001-4000-8000-000000000011',
   'Dîner et Soirée Berbère',
   'Dîner traditionnel avec musique et chants berbères.',
   '19:00', '21:30', true, true,
   null, 150, null, null, null, null)
ON CONFLICT (id) DO NOTHING;

-- Jour 2 : Ksour de Tataouine
INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name)
VALUES
  ('b5000000-0001-4000-8000-000000000012', 'a5000000-0001-4000-8000-000000000031', 2,
   'Ksour de Tataouine et Chenini',
   'Excursion vers les ksour fortifiés de Tataouine et le village perché de Chenini. Plongée dans l''histoire des greniers collectifs.',
   32.9275, 10.4430, 'Tataouine')
ON CONFLICT (id) DO NOTHING;

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, linked_offer_item_id, duration_minutes, distance_km, transport_mode, guide_id, guide_name)
VALUES
  ('c6000000-0001-4000-8000-000000000025', 'b5000000-0001-4000-8000-000000000012',
   'Départ pour Tataouine',
   'Trajet vers Tataouine à travers les paysages du Sud tunisien.',
   '07:00', '09:00', true, true,
   null, 120, 80, 'car', '87a38946-9a54-4bb4-be4a-887be312af15', 'Fa Ker Bennoomen'),

  ('c6000000-0001-4000-8000-000000000026', 'b5000000-0001-4000-8000-000000000012',
   'Visite du Ksar Gharb el Kebbar',
   'Exploration du plus grand ksar de Tunisie. Greniers fortifiés et architecture traditionnelle.',
   '09:30', '11:00', true, true,
   null, 90, 1, 'walking', null, null),

  ('c6000000-0001-4000-8000-000000000027', 'b5000000-0001-4000-8000-000000000012',
   'Découverte du Village Perché de Chenini',
   'Visite du village berbère perché de Chenini. Mosquée troglodyte et panorama exceptionnel.',
   '11:30', '13:00', true, true,
   null, 90, 1.5, 'walking', '87a38946-9a54-4bb4-be4a-887be312af15', 'Fa Ker Bennoomen'),

  ('c6000000-0001-4000-8000-000000000028', 'b5000000-0001-4000-8000-000000000012',
   'Déjeuner Local',
   'Déjeuner chez l''habitant à Chenini.',
   '13:00', '14:30', true, true,
   null, 90, null, null, null, null),

  ('c6000000-0001-4000-8000-000000000029', 'b5000000-0001-4000-8000-000000000012',
   'Retour à Matmata et Détente',
   'Retour à l''hébergement. Détente et découverte des environs.',
   '15:00', '18:00', true, false,
   null, 180, null, 'car', null, null),

  ('c6000000-0001-4000-8000-000000000030', 'b5000000-0001-4000-8000-000000000012',
   'Atelier Cuisine Berbère',
   'Atelier participatif de cuisine berbère : préparation du couscous et des bricks.',
   '18:00', '20:00', true, false,
   null, 120, 0, null, null, null)
ON CONFLICT (id) DO NOTHING;

-- Jour 3 : Atelier poterie et Départ
INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name)
VALUES
  ('b5000000-0001-4000-8000-000000000013', 'a5000000-0001-4000-8000-000000000031', 3,
   'Atelier Poterie et Départ',
   'Initiation à la poterie traditionnelle, déjeuner de clôture et départ.',
   33.5444, 9.9671, 'Matmata')
ON CONFLICT (id) DO NOTHING;

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, linked_offer_item_id, duration_minutes, distance_km, transport_mode, guide_id, guide_name)
VALUES
  ('c6000000-0001-4000-8000-000000000031', 'b5000000-0001-4000-8000-000000000013',
   'Atelier Poterie Traditionnelle',
   'Initiation à la poterie traditionnelle avec un artisan local. Créez votre propre poterie.',
   '09:00', '11:30', true, true,
   'd2000000-0001-0000-0000-000000000001', 150, 0, 'walking', null, null),

  ('c6000000-0001-4000-8000-000000000032', 'b5000000-0001-4000-8000-000000000013',
   'Déjeuner de Clôture',
   'Grand déjeuner berbère de clôture avec spécialités locales.',
   '12:00', '13:30', true, true,
   null, 90, null, null, null, null),

  ('c6000000-0001-4000-8000-000000000033', 'b5000000-0001-4000-8000-000000000013',
   'Départ et Transfert',
   'Fin du circuit. Transfert vers la gare.',
   '14:00', '15:00', true, true,
   null, 60, null, 'car', null, null)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. METTRE À JOUR LE CIRCUIT EXISTANT AVEC DES ASSOCIATIONS GUIDES
-- Circuit Oasis et Chott el Jerid (11000000-0001-0000-0000-000000000004)
-- ============================================================================

-- Jour 1 (12000000-0001-0000-0000-000000000011) : Associer guide karim à la calèche
UPDATE circuit_program_items
SET guide_id = '6fb2d1e7-39db-4152-b9b5-5b440f551cc9',
    guide_name = 'Karim Bouazizi'
WHERE id = '13000000-0001-0000-0000-000000000011';

-- Jour 2 (12000000-0001-0000-0000-000000000012) : Chott el Jerid - guide biber
-- On lie la dégustation de dattes à un offer item (menu traditionnel)
UPDATE circuit_program_items
SET linked_offer_item_id = 'd1000000-0001-0000-0000-000000000010'
WHERE id = '13000000-0001-0000-0000-000000000012';

-- Jour 3 (12000000-0001-0000-0000-000000000016) : Gorges de Midès - ajouter un item
INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, linked_offer_item_id, duration_minutes, distance_km, transport_mode, guide_id, guide_name)
VALUES
  ('c6000000-0001-4000-8000-000000000040', '12000000-0001-0000-0000-000000000016',
   'Déjeuner Oasis de Nefta',
   'Déjeuner typique dans une oasis de Nefta.',
   '12:30', '14:00', true, true,
   'd1000000-0001-0000-0000-000000000010', 90, null, null, null, null)
ON CONFLICT (id) DO NOTHING;

-- Changer le titre de l'activité Visite de Nefta
UPDATE circuit_program_items
SET guide_id = '361d089f-142f-4e4f-b114-137f072d3326',
    guide_name = 'Ines Gharbi',
    linked_offer_item_id = '387c5e6f-6b72-4897-bd98-84c6f34963be'
WHERE id = '13000000-0001-0000-0000-000000000014';

-- ============================================================================
-- 6. CRÉER DES TRIP PLANS POUR L'ÉCO-VOYAGEUR
-- ============================================================================

-- 6a. Trip Plan 2 : "Découverte des Kroumiries"
INSERT INTO trip_plans (id, eco_traveler_id, title, description, start_date, end_date, status)
VALUES
  ('a7000000-0001-4000-8000-000000000002', '7b83e87d-276d-4d89-bb00-ab8ea1243a14',
   'Découverte des Kroumiries',
   'Circuit de 3 jours à Ain Draham et Fernana. Forêts, cascades et artisanat local.',
   '2026-08-15', '2026-08-17', 'draft')
ON CONFLICT (id) DO NOTHING;

-- Items du Trip Plan 2
INSERT INTO trip_plan_items (id, trip_plan_id, offer_item_id, day_number, sort_order, notes)
VALUES
  ('b8000000-0001-4000-8000-000000000011', 'a7000000-0001-4000-8000-000000000002',
   'd1000000-0001-0000-0000-000000000001', 1, 1, 'Bungalow double pour le premier soir'),
  ('b8000000-0001-4000-8000-000000000012', 'a7000000-0001-4000-8000-000000000002',
   'd1000000-0001-0000-0000-000000000010', 1, 2, 'Déjeuner à l''arrivée'),
  ('b8000000-0001-4000-8000-000000000013', 'a7000000-0001-4000-8000-000000000002',
   null, 2, 1, 'Randonnée aux Cascades de Beni Mtir')
ON CONFLICT (id) DO NOTHING;

-- Ajout du circuit complet en tant qu'item
INSERT INTO trip_plan_items (id, trip_plan_id, circuit_id, day_number, sort_order, notes)
VALUES
  ('b8000000-0001-4000-8000-000000000014', 'a7000000-0001-4000-8000-000000000002',
   'a5000000-0001-4000-8000-000000000030', null, 0,
   'Circuit Forêt et Cascades d''Ain Draham complet')
ON CONFLICT (id) DO NOTHING;

-- 6b. Trip Plan 3 : "Sud Tunisien Authentique"
INSERT INTO trip_plans (id, eco_traveler_id, title, description, start_date, end_date, status)
VALUES
  ('a7000000-0001-4000-8000-000000000003', '7b83e87d-276d-4d89-bb00-ab8ea1243a14',
   'Sud Tunisien Authentique',
   'Voyage dans le Sud : Matmata, Tataouine et Tozeur. Découverte des traditions berbères et des paysages désertiques.',
   '2026-10-01', '2026-10-05', 'draft')
ON CONFLICT (id) DO NOTHING;

-- Items du Trip Plan 3 (circuit, puis offer_item, puis notes-only)
INSERT INTO trip_plan_items (id, trip_plan_id, circuit_id, day_number, sort_order, notes)
VALUES
  ('b8000000-0001-4000-8000-000000000021', 'a7000000-0001-4000-8000-000000000003',
   'a5000000-0001-4000-8000-000000000031', 1, 1,
   'Circuit Matmata Troglodyte et Ksour du Sud')
ON CONFLICT (id) DO NOTHING;

INSERT INTO trip_plan_items (id, trip_plan_id, offer_item_id, day_number, sort_order, notes)
VALUES
  ('b8000000-0001-4000-8000-000000000022', 'a7000000-0001-4000-8000-000000000003',
   'd1000000-0001-0000-0000-000000000012', 4, 1,
   'Nuit sous les étoiles après le circuit Matmata'),
  ('b8000000-0001-4000-8000-000000000023', 'a7000000-0001-4000-8000-000000000003',
   null, 5, 1,
   'Journée libre à Tozeur - Visite de l''oasis')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 7. CRÉER DES RÉSERVATIONS DE CIRCUIT POUR L'ÉCO-VOYAGEUR
-- ============================================================================

-- Réserver le nouveau circuit Forêt d'Ain Draham
INSERT INTO circuit_reservations (id, circuit_id, user_id, participants_count, base_total, options_total, final_total, status)
VALUES
  ('c7000000-0001-4000-8000-000000000011', 'a5000000-0001-4000-8000-000000000030',
   '7b83e87d-276d-4d89-bb00-ab8ea1243a14', 2, 590.00, 0, 590.00, 'confirmed')
ON CONFLICT (id) DO NOTHING;

-- Réserver le circuit Trek Kroumirie du guide fa.kerbennoomen
INSERT INTO circuit_reservations (id, circuit_id, user_id, participants_count, base_total, options_total, final_total, status)
VALUES
  ('c7000000-0001-4000-8000-000000000012', '11000000-0001-0000-0000-000000000003',
   '7b83e87d-276d-4d89-bb00-ab8ea1243a14', 1, 350.00, 0, 350.00, 'confirmed')
ON CONFLICT (id) DO NOTHING;

-- Réserver le nouveau circuit Matmata
INSERT INTO circuit_reservations (id, circuit_id, user_id, participants_count, base_total, options_total, final_total, status)
VALUES
  ('c7000000-0001-4000-8000-000000000013', 'a5000000-0001-4000-8000-000000000031',
   '7b83e87d-276d-4d89-bb00-ab8ea1243a14', 2, 490.00, 80.00, 570.00, 'pending')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 8. CRÉER DES BOOKINGS POUR L'ÉCO-VOYAGEUR
-- ============================================================================

INSERT INTO bookings (id, booking_ref, traveler_id, offer_id, offer_item_id, status, total_price, currency, special_requests, confirmation_mode)
VALUES
  ('d8000000-0001-4000-8000-000000000011', 'BK-BEN-011', '7b83e87d-276d-4d89-bb00-ab8ea1243a14',
   '55000000-0001-0000-0000-000000000014', 'a2000000-0001-4000-8000-000000000002',
   'confirmed', 170.00, 'TND', 'Nous sommes débutants en poterie', 'automatic'),
  ('d8000000-0001-4000-8000-000000000012', 'BK-BEN-012', '7b83e87d-276d-4d89-bb00-ab8ea1243a14',
   '55000000-0001-0000-0000-000000000012', 'a2000000-0001-4000-8000-000000000012',
   'confirmed', 130.00, 'TND', '2 personnes, avec snorkeling', 'automatic')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 9. CRÉER DES PUBLICATIONS POUR L'ÉCO-VOYAGEUR
-- ============================================================================

-- Nouvelles expériences
INSERT INTO publications (id, author_id, type, title, description, images, latitude, longitude, place_name, region, category, tags, status)
VALUES
  ('e9000000-0001-4000-8000-000000000010', '7b83e87d-276d-4d89-bb00-ab8ea1243a14', 'experience',
   'Randonnée inoubliable à Fernana',
   'Une magnifique randonnée dans la forêt de Fernana. L''odeur des chênes-lièges, les sources cristallines et l''accueil chaleureux des habitants. Guide exceptionnel, je recommande à 100% !',
   '{"https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80"}',
   36.6594, 8.6949, 'Fernana', 'Jendouba', 'nature',
   ARRAY['randonnee','foret','fernana','ecotourisme'],
   'approved'),
  ('e9000000-0001-4000-8000-000000000011', '7b83e87d-276d-4d89-bb00-ab8ea1243a14', 'experience',
   'Nuit chez l''habitant à Matmata',
   'Une expérience unique ! Dormir dans une maison troglodyte, partager le dîner avec une famille berbère, découvrir leur quotidien. Le meilleur souvenir de mon voyage en Tunisie.',
   '{"https://images.unsplash.com/photo-1504457047772-27faf1c00561?w=800&q=80","https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80"}',
   33.5444, 9.9671, 'Matmata', 'Matmata', 'hebergement',
   ARRAY['matmata','troglodyte','berbere','authentique'],
   'approved'),
  ('e9000000-0001-4000-8000-000000000012', '7b83e87d-276d-4d89-bb00-ab8ea1243a14', 'experience',
   'Cascades de Beni Mtir - Coin de paradis',
   'Les cascades de Beni Mtir sont un véritable havre de paix. Eau fraîche, verdure luxuriante, chant des oiseaux. Parfait pour une journée détente en pleine nature.',
   '{"https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80"}',
   36.7450, 8.7250, 'Beni Mtir', 'Jendouba', 'nature',
   ARRAY['cascades','beni-mtir','nature','baignade'],
   'approved')
ON CONFLICT (id) DO NOTHING;

-- Nouveaux lieux partagés
INSERT INTO publications (id, author_id, type, title, description, images, latitude, longitude, place_name, region, category, tags, status)
VALUES
  ('f0000000-0001-4000-8000-000000000020', '7b83e87d-276d-4d89-bb00-ab8ea1243a14', 'place',
   'Source Thermale Hammam Bourguiba',
   'Source d''eau chaude naturelle au milieu de la forêt. Idéal pour se détendre après une randonnée. Entrée gratuite.',
   '{"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"}',
   36.6500, 8.5800, 'Hammam Bourguiba', 'Jendouba', 'nature',
   ARRAY['source-thermale','bien-etre','gratuit'],
   'approved'),
  ('f0000000-0001-4000-8000-000000000021', '7b83e87d-276d-4d89-bb00-ab8ea1243a14', 'place',
   'Ksar Gharb el Kebbar',
   'Le plus grand ksar de Tunisie. Architecture berbère impressionnante avec ses greniers fortifiés. À voir absolument !',
   '{"https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80"}',
   32.9275, 10.4430, 'Tataouine', 'Tataouine', 'monument',
   ARRAY['ksar','tataouine','berbere','histoire'],
   'approved'),
  ('f0000000-0001-4000-8000-000000000022', '7b83e87d-276d-4d89-bb00-ab8ea1243a14', 'place',
   'Éco-Lodge Kroumirie',
   'Superbe éco-lodge au cœur de la forêt. Bungalows en bois, énergie solaire, cuisine bio. Le paradis des amoureux de la nature.',
   '{"https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80","https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80"}',
   36.7837, 8.6865, 'Ain Draham', 'Jendouba', 'hébergement',
   ARRAY['eco-lodge','foret','ain-draham','nature'],
   'approved')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 10. AJOUTER DES LIKES ET COMMENTAIRES SUR LES PUBLICATIONS
-- ============================================================================

-- Liker les publications existantes
INSERT INTO publication_likes (id, publication_id, user_id, user_role)
VALUES
  ('f1000000-0001-4000-8000-000000000001', 'b1000001-0001-0000-0000-000000000001', '7b83e87d-276d-4d89-bb00-ab8ea1243a14', 'eco_traveler'),
  ('f1000000-0001-4000-8000-000000000002', 'e9000000-0001-4000-8000-000000000010', '7b83e87d-276d-4d89-bb00-ab8ea1243a14', 'eco_traveler'),
  ('f1000000-0001-4000-8000-000000000003', 'f0000000-0001-4000-8000-000000000021', '7b83e87d-276d-4d89-bb00-ab8ea1243a14', 'eco_traveler')
ON CONFLICT (publication_id, user_id) DO NOTHING;

-- Ajouter des commentaires
INSERT INTO publication_comments (id, publication_id, author_id, author_role, content, parent_id)
VALUES
  ('f2000000-0001-4000-8000-000000000001', 'b1000001-0001-0000-0000-000000000001', '7b83e87d-276d-4d89-bb00-ab8ea1243a14', 'eco_traveler',
   'Ce désert est magique ! J''y retournerai sans hésiter.', NULL),
  ('f2000000-0001-4000-8000-000000000002', 'e9000000-0001-4000-8000-000000000010', '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'project',
   'Merci pour ce gentil retour ! La forêt de Fernana est préservée grâce aux voyageurs écoresponsables.', NULL),
  ('f2000000-0001-4000-8000-000000000003', 'f0000000-0001-4000-8000-000000000022', '87a38946-9a54-4bb4-be4a-887be312af15', 'guide',
   'Superbe endroit ! Je recommande la randonnée aux cascades le matin.', NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 11. AJOUTER DES FOLLOWS
-- ============================================================================

-- L'éco-voyageur suit le guide
INSERT INTO follows (id, follower_id, follower_type, following_id, following_type)
VALUES
  ('f3000000-0001-4000-8000-000000000001', '7b83e87d-276d-4d89-bb00-ab8ea1243a14', 'eco_traveler',
   '87a38946-9a54-4bb4-be4a-887be312af15', 'guide'),
  -- L'éco-voyageur suit le project owner
  ('f3000000-0001-4000-8000-000000000002', '7b83e87d-276d-4d89-bb00-ab8ea1243a14', 'eco_traveler',
   '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'project'),
  -- Le guide suit le project owner
  ('f3000000-0001-4000-8000-000000000003', '87a38946-9a54-4bb4-be4a-887be312af15', 'guide',
   '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'project'),
  -- Le project owner suit le guide
  ('f3000000-0001-4000-8000-000000000004', '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'project',
   '87a38946-9a54-4bb4-be4a-887be312af15', 'guide')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 12. METTRE À JOUR LES SCORES DE L'ÉCO-VOYAGEUR
-- ============================================================================
UPDATE eco_travelers
SET
  score_partages = 80,
  score_reservations = 75,
  sustainability_score = ROUND(score_questionnaire * 0.20 + 75 * 0.40 + score_feedbacks * 0.20 + 80 * 0.20)
WHERE user_id = '7b83e87d-276d-4d89-bb00-ab8ea1243a14';

-- ============================================================================
-- 13. RECALCULER LA POPULARITÉ DES PUBLICATIONS MISES À JOUR
-- ============================================================================
UPDATE publications SET popularity_score = (popularity_score + 5)
WHERE id IN ('b1000001-0001-0000-0000-000000000001', 'e9000000-0001-4000-8000-000000000010', 'f0000000-0001-4000-8000-000000000022');

-- ============================================================================
-- 14. GÉNÉRER DES SESSIONS POUR LES GUIDE OFFERINGS
-- ============================================================================
-- Ces sessions seront créées automatiquement par l'API generateSessions,
-- mais on en crée quelques-unes manuellement pour avoir des données immédiates
INSERT INTO guide_offering_sessions (id, guide_offering_id, date, start_time, end_time, total_capacity, remaining_capacity, status)
VALUES
  ('f4000000-0001-4000-8000-000000000001', 'a1b00000-0001-4000-8000-000000000001', '2026-07-10', '08:00', '17:00', 8, 7, 'available'),
  ('f4000000-0001-4000-8000-000000000002', 'a1b00000-0001-4000-8000-000000000001', '2026-07-12', '08:00', '17:00', 8, 5, 'available'),
  ('f4000000-0001-4000-8000-000000000003', 'a1b00000-0001-4000-8000-000000000001', '2026-07-15', '08:00', '17:00', 8, 8, 'available'),
  ('f4000000-0001-4000-8000-000000000004', 'a1b00000-0001-4000-8000-000000000001', '2026-07-18', '08:00', '17:00', 8, 3, 'available'),
  ('f4000000-0001-4000-8000-000000000005', 'a1b00000-0001-4000-8000-000000000002', '2026-07-11', '09:00', '16:00', 10, 10, 'available'),
  ('f4000000-0001-4000-8000-000000000006', 'a1b00000-0001-4000-8000-000000000003', '2026-07-14', '09:00', '14:00', 8, 6, 'available')
ON CONFLICT (id) DO NOTHING;

COMMIT;
