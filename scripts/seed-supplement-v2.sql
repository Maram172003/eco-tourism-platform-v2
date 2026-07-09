-- ============================================================================
-- SUPPLEMENT SEED v2 — Ajoute les cas manquants pour les tests
-- Schéma corrigé pour correspondre à la base réelle
-- ============================================================================
-- Users existants de référence :
--   92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e (fakerbennoomen@gmail.com - project_owner)
--   a602737a-b07d-4a41-b9c3-cdf1be17036a (leila.trabelsi@gmail.com - eco_traveler)
--   b09808ee-30a9-4089-bbf7-698e73004ef4 (ahmed.jridi@gmail.com - eco_traveler)
--   90b4c5bf-4a47-4737-b033-f7385e22a2e6 (sami.benali@ecovoyage.tn - project_owner)
--   e962bcc1-d022-41dd-9720-ee2e97d51fb7 (imen.belhassen@ecovoyage.tn - eco_traveler)
-- ============================================================================

-- ==========================================================================
-- 1. OFFRE REJETÉE + NOTIFICATION
-- ==========================================================================
INSERT INTO offers (id, title, description, offer_type, author_id, author_type, category_id, status, created_at, updated_at)
SELECT
  'a0000000-0001-4000-8000-0000000000f0',
  'Campement Bivouac Dunes de Douz',
  'Nuit sous les étoiles dans les dunes du Sahara avec repas traditionnel et feu de camp',
  'hebergement',
  '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e',
  'project_owner',
  id, 'rejected',
  NOW() - INTERVAL '5 days', NOW()
FROM offer_categories WHERE slug = 'accommodation';

INSERT INTO offer_items (id, name, item_type, offer_id)
SELECT
  'a0000000-0002-4000-8000-0000000000f0',
  'Tente Berbère Double',
  'camping_space',
  'a0000000-0001-4000-8000-0000000000f0'
WHERE NOT EXISTS (SELECT 1 FROM offer_items WHERE id = 'a0000000-0002-4000-8000-0000000000f0');

INSERT INTO offer_item_prices (id, label, price, currency, pricing_unit, is_default, offer_item_id, status)
SELECT gen_random_uuid(), 'Adulte', 120, 'TND', 'per_night', true,
  'a0000000-0002-4000-8000-0000000000f0', 'active'
WHERE EXISTS (SELECT 1 FROM offer_items WHERE id = 'a0000000-0002-4000-8000-0000000000f0');

-- Notification de rejet pour fakerbennoomen
INSERT INTO notifications (id, user_id, type, title, body, is_read, created_at)
SELECT gen_random_uuid(),
  '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e',
  'offer_rejected',
  'Offre refusée',
  'Votre offre "Campement Bivouac Dunes de Douz" a été refusée. Motif : Les informations de sécurité ne sont pas complètes.',
  false,
  NOW() - INTERVAL '4 days'
WHERE EXISTS (SELECT 1 FROM offers WHERE id = 'a0000000-0001-4000-8000-0000000000f0');

-- ==========================================================================
-- 2. OFFRE BROUILLON
-- ==========================================================================
INSERT INTO offers (id, title, description, offer_type, author_id, author_type, category_id, status, created_at, updated_at)
SELECT
  'a0000000-0001-4000-8000-0000000000f1',
  'Randonnée Chameau Tozeur - Chebika',
  'Balade à dos de chameau à travers les oasis et les canyons de la région de Tozeur',
  'activite',
  '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e',
  'project_owner',
  id, 'draft',
  NOW() - INTERVAL '2 days', NOW()
FROM offer_categories WHERE slug = 'activity';

INSERT INTO offer_items (id, name, item_type, offer_id)
SELECT
  'a0000000-0002-4000-8000-0000000000f1',
  'Balade Chameau Demi-Journée',
  'activity',
  'a0000000-0001-4000-8000-0000000000f1'
WHERE NOT EXISTS (SELECT 1 FROM offer_items WHERE id = 'a0000000-0002-4000-8000-0000000000f1');

INSERT INTO offer_item_prices (id, label, price, currency, pricing_unit, is_default, offer_item_id, status)
SELECT gen_random_uuid(), 'Adulte', 85, 'TND', 'per_person', true,
  'a0000000-0002-4000-8000-0000000000f1', 'active'
WHERE EXISTS (SELECT 1 FROM offer_items WHERE id = 'a0000000-0002-4000-8000-0000000000f1');

-- ==========================================================================
-- 3. OFFRE EN ATTENTE (pending)
-- ==========================================================================
INSERT INTO offers (id, title, description, offer_type, author_id, author_type, category_id, status, created_at, updated_at)
SELECT
  'a0000000-0001-4000-8000-0000000000f2',
  'Atelier Cuisine Tunisienne Médina Tunis',
  'Apprenez à préparer les plats traditionnels tunisiens dans une maison d hôte de la médina',
  'restauration',
  '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e',
  'project_owner',
  id, 'pending',
  NOW() - INTERVAL '1 day', NOW()
FROM offer_categories WHERE slug = 'workshop';

INSERT INTO offer_items (id, name, item_type, offer_id)
SELECT
  'a0000000-0002-4000-8000-0000000000f2',
  'Atelier Cuisine 4h',
  'workshop',
  'a0000000-0001-4000-8000-0000000000f2'
WHERE NOT EXISTS (SELECT 1 FROM offer_items WHERE id = 'a0000000-0002-4000-8000-0000000000f2');

INSERT INTO offer_item_prices (id, label, price, currency, pricing_unit, is_default, offer_item_id, status)
SELECT gen_random_uuid(), 'Adulte', 150, 'TND', 'per_person', true,
  'a0000000-0002-4000-8000-0000000000f2', 'active'
WHERE EXISTS (SELECT 1 FROM offer_items WHERE id = 'a0000000-0002-4000-8000-0000000000f2');

-- ==========================================================================
-- 4. CIRCUIT AVEC MES OFFRES LIÉES (My Offers)
-- Circuit "Djerba Plongée et Découverte" utilisant les offres existantes de Djerba
-- ==========================================================================
INSERT INTO circuits (id, title, description, status, base_price, author_id, author_type, duration_days, duration_nights, created_at, updated_at)
SELECT
  'a5000000-0001-4000-8000-0000000000f3',
  'Djerba Plongée et Saveurs',
  'Week-end plongée et gastronomie à Djerba avec hébergement en éco-lodge',
  'approved', 550, '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'project_owner', 3, 2, NOW() - INTERVAL '3 days', NOW()
WHERE NOT EXISTS (SELECT 1 FROM circuits WHERE id = 'a5000000-0001-4000-8000-0000000000f3');

INSERT INTO circuit_days (id, circuit_id, day_number, title, description, date, lat, lng, location_name, created_at)
SELECT * FROM (VALUES
  ('a5000000-0002-4000-8000-0000000000d1'::uuid, 'a5000000-0001-4000-8000-0000000000f3'::uuid, 1, 'Arrivée et Installation', 'Accueil à l aéroport, installation à l hôtel', '2026-08-15'::date, 33.875, 10.865, 'Aéroport Djerba', NOW()),
  ('a5000000-0002-4000-8000-0000000000d2'::uuid, 'a5000000-0001-4000-8000-0000000000f3'::uuid, 2, 'Plongée et Découverte', 'Matin plongée, déjeuner poisson, après-midi libre', NULL::date, 33.872, 10.860, 'Plage Sidi Mahrez', NOW()),
  ('a5000000-0002-4000-8000-0000000000d3'::uuid, 'a5000000-0001-4000-8000-0000000000f3'::uuid, 3, 'Départ', 'Petit-déjeuner et transfert aéroport', NULL::date, 33.875, 10.865, 'Djerba', NOW())
) AS v
WHERE EXISTS (SELECT 1 FROM circuits WHERE id = 'a5000000-0001-4000-8000-0000000000f3')
  AND NOT EXISTS (SELECT 1 FROM circuit_days WHERE circuit_id = 'a5000000-0001-4000-8000-0000000000f3');

-- Jour 1: Transfert aéroport (offre existante: Navette Éco Djerba)
INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, price, is_included, is_required, linked_offer_item_id, category, transport_mode, created_at)
SELECT gen_random_uuid(), cd.id, 'Transfert Aéroport → Hôtel', 'Prise en charge à l aéroport',
  '14:00', '15:00', 25, true, true,
  'a0000000-0002-4000-8000-000000000008', 'transport', 'Van', NOW()
FROM circuit_days cd
WHERE cd.id = 'a5000000-0002-4000-8000-0000000000d1'
  AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Transfert Aéroport → Hôtel');

-- Jour 2: Plongée découverte
INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, price, is_included, is_required, linked_offer_item_id, category, created_at)
SELECT gen_random_uuid(), cd.id, 'Plongée Découverte', 'Initiation plongée avec moniteur',
  '09:00', '12:00', 120, true, false,
  'd1000000-0001-0000-0000-000000000008', 'activite', NOW()
FROM circuit_days cd
WHERE cd.id = 'a5000000-0002-4000-8000-0000000000d2'
  AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Plongée Découverte');

-- Jour 2: Déjeuner
INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, price, is_included, is_required, linked_offer_item_id, category, created_at)
SELECT gen_random_uuid(), cd.id, 'Déjeuner Fruit de Mer', 'Menu fruit de mer au Restaurant Le Dauphin',
  '12:30', '14:00', 45, true, false,
  'a0000000-0002-4000-8000-00000000000a', 'restauration', NOW()
FROM circuit_days cd
WHERE cd.id = 'a5000000-0002-4000-8000-0000000000d2'
  AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Déjeuner Fruit de Mer');

-- ==========================================================================
-- 5. CIRCUIT AVEC OFFRES D'AUTRES PROPRIÉTAIRES
-- ==========================================================================
INSERT INTO circuits (id, title, description, status, base_price, author_id, author_type, duration_days, duration_nights, created_at, updated_at)
SELECT
  'a5000000-0001-4000-8000-0000000000f4',
  'Fernana Nature et Artisanat',
  'Séjour nature dans les forêts des Kroumiries avec ateliers artisanaux',
  'pending', 380, '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'project_owner', 2, 1, NOW() - INTERVAL '1 day', NOW()
WHERE NOT EXISTS (SELECT 1 FROM circuits WHERE id = 'a5000000-0001-4000-8000-0000000000f4');

INSERT INTO circuit_days (id, circuit_id, day_number, title, description, date, lat, lng, location_name, created_at)
SELECT * FROM (VALUES
  ('a5000000-0002-4000-8000-0000000000d4'::uuid, 'a5000000-0001-4000-8000-0000000000f4'::uuid, 1, 'Randonnée et Gîte', 'Randonnée en forêt, nuit au gîte', '2026-09-10'::date, 36.823, 8.698, 'Fernana', NOW()),
  ('a5000000-0002-4000-8000-0000000000d5'::uuid, 'a5000000-0001-4000-8000-0000000000f4'::uuid, 2, 'Atelier Tissage', 'Atelier tissage traditionnel', NULL::date, 36.820, 8.695, 'Fernana Centre', NOW())
) AS v
WHERE EXISTS (SELECT 1 FROM circuits WHERE id = 'a5000000-0001-4000-8000-0000000000f4')
  AND NOT EXISTS (SELECT 1 FROM circuit_days WHERE circuit_id = 'a5000000-0001-4000-8000-0000000000f4');

-- Jour 1: Randonnée (offre d'un autre: fernana.rando)
INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, price, is_included, is_required, linked_offer_item_id, category, created_at)
SELECT gen_random_uuid(), cd.id, 'Randonnée Forêt des Kroumiries', 'Randonnée accompagnée par un guide local',
  '08:00', '12:00', 55, true, true,
  'a0000000-0002-4000-8000-00000000000d', 'activite', NOW()
FROM circuit_days cd
WHERE cd.id = 'a5000000-0002-4000-8000-0000000000d4'
  AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Randonnée Forêt des Kroumiries');

-- Jour 1: Hébergement (offre d'un autre: fernana.gite) avec fields pricing
INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, price, is_included, is_required, linked_offer_item_id, category, created_at, fields)
SELECT gen_random_uuid(), cd.id, 'Nuit à l Éco-Gîte Fernana', 'Nuit en chambre double à l Éco-Gîte',
  '18:00', '10:00', 80, true, true,
  'a0000000-0002-4000-8000-00000000000f', 'hebergement', NOW(),
  '{"price_source": "other", "prix_achat": 60, "prix_revente": 80}'::jsonb
FROM circuit_days cd
WHERE cd.id = 'a5000000-0002-4000-8000-0000000000d4'
  AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Nuit à l Éco-Gîte Fernana');

-- Jour 2: Atelier Tissage (offre d'un autre: fernana.artisanat)
INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, price, is_included, is_required, linked_offer_item_id, category, created_at)
SELECT gen_random_uuid(), cd.id, 'Atelier Tissage Traditionnel', 'Initiation au tissage traditionnel',
  '09:00', '12:00', 45, true, true,
  'a0000000-0002-4000-8000-000000000012', 'workshop', NOW()
FROM circuit_days cd
WHERE cd.id = 'a5000000-0002-4000-8000-0000000000d5'
  AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Atelier Tissage Traditionnel');

-- ==========================================================================
-- 6. CIRCUIT AVEC RÉFÉRENCE EXTERNE (hors plateforme)
-- ==========================================================================
INSERT INTO circuits (id, title, description, status, base_price, author_id, author_type, duration_days, duration_nights, created_at, updated_at)
SELECT
  'a5000000-0001-4000-8000-0000000000f5',
  'Road Trip Sud Tunisien',
  'Circuit en 4x4 à travers le sud tunisien avec hébergement chez l habitant',
  'approved', 890, '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'project_owner', 5, 4, NOW() - INTERVAL '7 days', NOW()
WHERE NOT EXISTS (SELECT 1 FROM circuits WHERE id = 'a5000000-0001-4000-8000-0000000000f5');

INSERT INTO circuit_days (id, circuit_id, day_number, title, description, date, lat, lng, location_name, created_at)
SELECT * FROM (VALUES
  ('a5000000-0002-4000-8000-0000000000d6'::uuid, 'a5000000-0001-4000-8000-0000000000f5'::uuid, 1, 'Départ Tunis → Kairouan', 'Visite de Kairouan, nuit à Sousse', NULL::date, 35.678, 10.101, 'Kairouan', NOW()),
  ('a5000000-0002-4000-8000-0000000000d7'::uuid, 'a5000000-0001-4000-8000-0000000000f5'::uuid, 2, 'Sousse → Gabès', 'Route côtière, arrêt à Monastir et Sfax', NULL::date, 34.737, 10.761, 'Gabès', NOW()),
  ('a5000000-0002-4000-8000-0000000000d8'::uuid, 'a5000000-0001-4000-8000-0000000000f5'::uuid, 3, 'Gabès → Douz', 'Désert et oasis, nuit chez l habitant', NULL::date, 33.458, 9.028, 'Douz', NOW()),
  ('a5000000-0002-4000-8000-0000000000d9'::uuid, 'a5000000-0001-4000-8000-0000000000f5'::uuid, 4, 'Douz → Tozeur', 'Chott El Jerid, oasis de Chebika', NULL::date, 33.925, 8.134, 'Tozeur', NOW()),
  ('a5000000-0002-4000-8000-0000000000da'::uuid, 'a5000000-0001-4000-8000-0000000000f5'::uuid, 5, 'Tozeur → Tunis', 'Vol retour', NULL::date, 36.849, 10.159, 'Tunis', NOW())
) AS v
WHERE EXISTS (SELECT 1 FROM circuits WHERE id = 'a5000000-0001-4000-8000-0000000000f5')
  AND NOT EXISTS (SELECT 1 FROM circuit_days WHERE circuit_id = 'a5000000-0001-4000-8000-0000000000f5');

-- Jour 2: Transport externe (location 4x4 hors plateforme)
INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, price, is_included, is_required, category, is_external_reference, external_reference, created_at)
SELECT gen_random_uuid(), cd.id, 'Location 4x4 Jour 2', 'Véhicule tout-terrain avec chauffeur',
  '08:00', '18:00', 250, true, true, 'transport', true,
  '{"type": "transport", "provider_name": "Agence Location Sud Tunisie", "contact_name": "Mohamed Trabelsi", "phone": "+216 98 765 432", "estimated_price": 250, "currency": "TND"}'::jsonb, NOW()
FROM circuit_days cd
WHERE cd.id = 'a5000000-0002-4000-8000-0000000000d7'
  AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Location 4x4 Jour 2');

-- Jour 3: Hébergement externe
INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, price, is_included, is_required, category, is_external_reference, external_reference, created_at)
SELECT gen_random_uuid(), cd.id, 'Nuit chez l habitant Douz', 'Hébergement traditionnel chez une famille bédouine',
  '18:00', '08:00', 60, true, true, 'hebergement', true,
  '{"type": "hebergement", "provider_name": "Famille Ben Ali - Douz", "phone": "+216 99 123 456", "estimated_price": 60, "currency": "TND"}'::jsonb, NOW()
FROM circuit_days cd
WHERE cd.id = 'a5000000-0002-4000-8000-0000000000d8'
  AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Nuit chez l habitant Douz');

-- ==========================================================================
-- 7. AVIS (REVIEWS) sur les offres
-- NOTE: reviews table uses author_id + target_type/target_id
-- ==========================================================================
INSERT INTO reviews (id, author_id, target_type, target_id, rating, comment, created_at)
SELECT gen_random_uuid(), 'a602737a-b07d-4a41-b9c3-cdf1be17036a', 'offer', 'a0000000-0001-4000-8000-000000000001',
  5, 'Superbe hôtel éco-responsable, personnel accueillant, plage magnifique. Petit-déjeuner copieux avec produits locaux.',
  NOW() - INTERVAL '10 days'
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE target_type = 'offer' AND target_id = 'a0000000-0001-4000-8000-000000000001' AND author_id = 'a602737a-b07d-4a41-b9c3-cdf1be17036a');

INSERT INTO reviews (id, author_id, target_type, target_id, rating, comment, created_at)
SELECT gen_random_uuid(), 'b09808ee-30a9-4089-bbf7-698e73004ef4', 'offer', 'a0000000-0001-4000-8000-000000000001',
  4, 'Très bon séjour, chambre confortable. Seul bémol : pas de piscine.',
  NOW() - INTERVAL '8 days'
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE target_type = 'offer' AND target_id = 'a0000000-0001-4000-8000-000000000001' AND author_id = 'b09808ee-30a9-4089-bbf7-698e73004ef4');

INSERT INTO reviews (id, author_id, target_type, target_id, rating, comment, created_at)
SELECT gen_random_uuid(), 'a602737a-b07d-4a41-b9c3-cdf1be17036a', 'offer', 'a0000000-0001-4000-8000-000000000002',
  5, 'Atelier incroyable ! Le potier nous a appris les techniques traditionnelles. Je recommande vivement.',
  NOW() - INTERVAL '6 days'
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE target_type = 'offer' AND target_id = 'a0000000-0001-4000-8000-000000000002' AND author_id = 'a602737a-b07d-4a41-b9c3-cdf1be17036a');

INSERT INTO reviews (id, author_id, target_type, target_id, rating, comment, created_at)
SELECT gen_random_uuid(), 'b09808ee-30a9-4089-bbf7-698e73004ef4', 'offer', 'a0000000-0001-4000-8000-000000000003',
  3, 'Activité sympa mais un peu chère pour ce que c est. Le matériel était correct.',
  NOW() - INTERVAL '5 days'
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE target_type = 'offer' AND target_id = 'a0000000-0001-4000-8000-000000000003' AND author_id = 'b09808ee-30a9-4089-bbf7-698e73004ef4');

INSERT INTO reviews (id, author_id, target_type, target_id, rating, comment, created_at)
SELECT gen_random_uuid(), '90b4c5bf-4a47-4737-b033-f7385e22a2e6', 'offer', 'a0000000-0001-4000-8000-000000000006',
  5, 'Randonnée magnifique dans les Kroumiries ! Guide passionné et paysages à couper le souffle.',
  NOW() - INTERVAL '3 days'
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE target_type = 'offer' AND target_id = 'a0000000-0001-4000-8000-000000000006' AND author_id = '90b4c5bf-4a47-4737-b033-f7385e22a2e6');

INSERT INTO reviews (id, author_id, target_type, target_id, rating, comment, created_at)
SELECT gen_random_uuid(), '90b4c5bf-4a47-4737-b033-f7385e22a2e6', 'offer', 'a0000000-0001-4000-8000-000000000005',
  4, 'Restaurant typique avec vue sur la mer. Les fruits de mer sont excellents ! Service un peu lent.',
  NOW() - INTERVAL '2 days'
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE target_type = 'offer' AND target_id = 'a0000000-0001-4000-8000-000000000005' AND author_id = '90b4c5bf-4a47-4737-b033-f7385e22a2e6');

-- ==========================================================================
-- 8. NOTIFICATIONS SUPPLÉMENTAIRES (pour les nouveaux circuits)
-- ==========================================================================
INSERT INTO notifications (id, user_id, type, title, body, is_read, created_at)
SELECT gen_random_uuid(), '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'circuit_approved',
  'Circuit approuvé',
  'Votre circuit "Djerba Plongée et Saveurs" a été approuvé et est maintenant visible par les voyageurs.',
  true, NOW() - INTERVAL '2 days'
WHERE EXISTS (SELECT 1 FROM circuits WHERE id = 'a5000000-0001-4000-8000-0000000000f3')
  AND NOT EXISTS (SELECT 1 FROM notifications WHERE type = 'circuit_approved' AND user_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e' AND title = 'Circuit approuvé');

INSERT INTO notifications (id, user_id, type, title, body, is_read, created_at)
SELECT gen_random_uuid(), '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'circuit_pending',
  'Circuit en attente de validation',
  'Votre circuit "Fernana Nature et Artisanat" a été soumis et est en attente de validation par l administrateur.',
  false, NOW() - INTERVAL '1 day'
WHERE EXISTS (SELECT 1 FROM circuits WHERE id = 'a5000000-0001-4000-8000-0000000000f4')
  AND NOT EXISTS (SELECT 1 FROM notifications WHERE type = 'circuit_pending' AND user_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e');

-- ==========================================================================
-- 9. RÉSERVATIONS CIRCUITS (via circuit_reservations)
-- ==========================================================================
INSERT INTO circuit_reservations (id, user_id, circuit_id, participants_count, base_total, options_total, final_total, status, created_at)
SELECT gen_random_uuid(), 'a602737a-b07d-4a41-b9c3-cdf1be17036a',
  '11000000-0001-0000-0000-000000000002', 2, 840, 0, 840, 'confirmed', NOW() - INTERVAL '12 days'
WHERE NOT EXISTS (SELECT 1 FROM circuit_reservations WHERE circuit_id = '11000000-0001-0000-0000-000000000002' AND user_id = 'a602737a-b07d-4a41-b9c3-cdf1be17036a');

INSERT INTO circuit_reservations (id, user_id, circuit_id, participants_count, base_total, options_total, final_total, status, created_at)
SELECT gen_random_uuid(), 'b09808ee-30a9-4089-bbf7-698e73004ef4',
  '11000000-0001-0000-0000-000000000003', 1, 380, 0, 380, 'pending', NOW() - INTERVAL '4 days'
WHERE NOT EXISTS (SELECT 1 FROM circuit_reservations WHERE circuit_id = '11000000-0001-0000-0000-000000000003' AND user_id = 'b09808ee-30a9-4089-bbf7-698e73004ef4');

INSERT INTO circuit_reservations (id, user_id, circuit_id, participants_count, base_total, options_total, final_total, status, created_at)
SELECT gen_random_uuid(), 'e962bcc1-d022-41dd-9720-ee2e97d51fb7',
  '11000000-0001-0000-0000-000000000005', 3, 660, 0, 660, 'cancelled', NOW() - INTERVAL '15 days'
WHERE NOT EXISTS (SELECT 1 FROM circuit_reservations WHERE circuit_id = '11000000-0001-0000-0000-000000000005' AND user_id = 'e962bcc1-d022-41dd-9720-ee2e97d51fb7');

-- ==========================================================================
-- 10. BONS PLANS (trip_plans) — différents statuts
-- ==========================================================================
INSERT INTO trip_plans (id, title, description, eco_traveler_id, status, start_date, end_date, created_at, updated_at)
SELECT
  'a6000000-0001-0000-0000-000000000001',
  'Week-end Djerba en Éco-mode',
  'Un week-end parfait pour découvrir Djerba de manière éco-responsable : plage, culture et gastronomie',
  'a602737a-b07d-4a41-b9c3-cdf1be17036a',
  'published', '2026-08-15', '2026-08-17', NOW() - INTERVAL '7 days', NOW()
WHERE NOT EXISTS (SELECT 1 FROM trip_plans WHERE id = 'a6000000-0001-0000-0000-000000000001');

INSERT INTO trip_plan_items (id, trip_plan_id, circuit_id, day_number, notes, created_at)
SELECT gen_random_uuid(), 'a6000000-0001-0000-0000-000000000001',
  '11000000-0001-0000-0000-000000000002', 1, 'Jour 1-2: Arrivée et plongée', NOW()
WHERE EXISTS (SELECT 1 FROM trip_plans WHERE id = 'a6000000-0001-0000-0000-000000000001')
  AND NOT EXISTS (SELECT 1 FROM trip_plan_items WHERE trip_plan_id = 'a6000000-0001-0000-0000-000000000001' AND day_number = 1);

INSERT INTO trip_plan_items (id, trip_plan_id, circuit_id, day_number, notes, created_at)
SELECT gen_random_uuid(), 'a6000000-0001-0000-0000-000000000001',
  '55000000-0001-0000-0000-000000000021', 2, 'Jour 3: Vélo à Hammamet', NOW()
WHERE EXISTS (SELECT 1 FROM trip_plans WHERE id = 'a6000000-0001-0000-0000-000000000001')
  AND NOT EXISTS (SELECT 1 FROM trip_plan_items WHERE trip_plan_id = 'a6000000-0001-0000-0000-000000000001' AND day_number = 2);

-- Bon plan en brouillon
INSERT INTO trip_plans (id, title, description, eco_traveler_id, status, start_date, end_date, created_at, updated_at)
SELECT
  'a6000000-0001-0000-0000-000000000002',
  'Aventure Sud Tunisien 10 jours',
  'Un grand voyage à travers le sud : Sfax, Gabès, Douz, Tozeur, Tataouine',
  'b09808ee-30a9-4089-bbf7-698e73004ef4',
  'draft', '2026-10-01', '2026-10-10', NOW() - INTERVAL '3 days', NOW()
WHERE NOT EXISTS (SELECT 1 FROM trip_plans WHERE id = 'a6000000-0001-0000-0000-000000000002');

-- ==========================================================================
-- 11. CONVERSATIONS SUPPLÉMENTAIRES
-- ==========================================================================
INSERT INTO conversations (id, participant_a_id, participant_a_role, participant_b_id, participant_b_role, created_at)
SELECT gen_random_uuid(), '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'project_owner',
  'a602737a-b07d-4a41-b9c3-cdf1be17036a', 'eco_traveler', NOW() - INTERVAL '5 days'
WHERE NOT EXISTS (
  SELECT 1 FROM conversations WHERE
  (participant_a_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e' AND participant_b_id = 'a602737a-b07d-4a41-b9c3-cdf1be17036a')
  OR
  (participant_a_id = 'a602737a-b07d-4a41-b9c3-cdf1be17036a' AND participant_b_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e')
);

INSERT INTO messages (id, conversation_id, sender_id, sender_role, content, created_at)
SELECT gen_random_uuid(), c.id, 'a602737a-b07d-4a41-b9c3-cdf1be17036a', 'eco_traveler',
  'Bonjour ! Je suis intéressée par le circuit Djerba Plongée. Est-ce que les dates d août sont disponibles ?',
  NOW() - INTERVAL '5 days'
FROM conversations c
WHERE (c.participant_a_id = 'a602737a-b07d-4a41-b9c3-cdf1be17036a' OR c.participant_b_id = 'a602737a-b07d-4a41-b9c3-cdf1be17036a')
  AND (c.participant_a_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e' OR c.participant_b_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e')
  AND NOT EXISTS (SELECT 1 FROM messages WHERE conversation_id = c.id);

-- ==========================================================================
-- 12. MISES À JOUR : images réalistes (Cloudinary) sur les offres sans image
-- ==========================================================================
UPDATE offers SET images = 'https://res.cloudinary.com/depzhocsd/image/upload/v1712345678/tourisme/djerba-plage.jpg'
WHERE id = 'a0000000-0001-4000-8000-000000000001' AND images IS NULL;

UPDATE offers SET images = 'https://res.cloudinary.com/depzhocsd/image/upload/v1712345679/tourisme/poterie-guellala.jpg'
WHERE id = 'a0000000-0001-4000-8000-000000000002' AND images IS NULL;

UPDATE offers SET images = 'https://res.cloudinary.com/depzhocsd/image/upload/v1712345680/tourisme/kayak-djerba.jpg'
WHERE id = 'a0000000-0001-4000-8000-000000000003' AND images IS NULL;

UPDATE offers SET images = 'https://res.cloudinary.com/depzhocsd/image/upload/v1712345681/tourisme/randonnee-kroumirie.jpg'
WHERE id = 'a0000000-0001-4000-8000-000000000006' AND images IS NULL;

UPDATE offers SET images = 'https://res.cloudinary.com/depzhocsd/image/upload/v1712345682/tourisme/eco-gite-fernana.jpg'
WHERE id = 'a0000000-0001-4000-8000-000000000007' AND images IS NULL;

UPDATE offers SET images = 'https://res.cloudinary.com/depzhocsd/image/upload/v1712345683/tourisme/tissage-fernana.jpg'
WHERE id = 'a0000000-0001-4000-8000-000000000008' AND images IS NULL;

-- ==========================================================================
-- 13. GUIDE OFFERING — Ajout d'offres de guide plus variées
-- ==========================================================================
INSERT INTO guide_offerings (id, guide_id, title, description, languages, price, pricing_unit, min_travelers, max_travelers, service_zone_type, lat, lng, radius_km, displacement_allowed, displacement_max_km, status, confirmation_mode, created_at, updated_at)
SELECT gen_random_uuid(), g.user_id,
  'Visite Guidée Médina de Tunis',
  'Découverte des secrets de la médina de Tunis : souks, monuments, gastronomie de rue',
  ARRAY['Arabe','Français','Anglais','Italien'],
  50, 'per_person', 1, 8, 'point', 36.799, 10.180, 5, true, 20, 'active', 'automatic',
  NOW() - INTERVAL '3 days', NOW()
FROM guides g
WHERE (g.full_name LIKE '%Yasmine%' OR g.full_name LIKE '%Bouassida%')
  AND NOT EXISTS (SELECT 1 FROM guide_offerings WHERE guide_id = g.user_id AND title = 'Visite Guidée Médina de Tunis');

INSERT INTO guide_offerings (id, guide_id, title, description, languages, price, pricing_unit, min_travelers, max_travelers, service_zone_type, lat, lng, radius_km, zone_governorate, displacement_allowed, displacement_max_km, status, confirmation_mode, created_at, updated_at)
SELECT gen_random_uuid(), g.user_id,
  'Randonnée Jebel Zaghouan',
  'Randonnée d une journée au Jebel Zaghouan avec pique-nique et baignade',
  ARRAY['Arabe','Français'],
  35, 'per_person', 2, 10, 'zone', 36.365, 10.126, 30, 'Zaghouan', true, 50, 'active', 'manual',
  NOW() - INTERVAL '2 days', NOW()
FROM guides g
WHERE (g.full_name LIKE '%Mehdi%' OR g.full_name LIKE '%Sassi%')
  AND NOT EXISTS (SELECT 1 FROM guide_offerings WHERE guide_id = g.user_id AND title = 'Randonnée Jebel Zaghouan');

-- ==========================================================================
-- RÉCAPITULATIF
-- ==========================================================================
-- Nouveaux cas ajoutés :
--   ✓ Offre rejetée + notification de rejet
--   ✓ Offre en brouillon (draft)
--   ✓ Offre en attente (pending)
--   ✓ Circuit avec MES offres liées (transport, plongée, repas)
--   ✓ Circuit avec OFFRES D'AUTRES propriétaires (randonnée, hébergement, artisanat)
--   ✓ Circuit avec RÉFÉRENCE EXTERNE (location 4x4, hébergement chez l'habitant)
--   ✓ Avis (reviews) avec notes et commentaires réels
--   ✓ Réservations circuits (confirmée, pending, annulée)
--   ✓ Bons plans (publié, brouillon)
--   ✓ Messages / conversations
--   ✓ Images réelles (Cloudinary)
--   ✓ Nouvelles offres de guides
-- ===========================================================================
