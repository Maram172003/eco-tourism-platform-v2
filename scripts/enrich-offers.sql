-- ============================================================================
-- Enrich Offers: add items, sessions, and local images
-- ============================================================================
BEGIN;

-- ============================================================================
-- 1. ADD ITEMS TO OFFERS WITH 0 ITEMS
-- ============================================================================

-- Atelier poterie de Guellala (sejour, no items)
INSERT INTO offer_items (id, offer_id, name, description, item_type, requires_confirmation, status) VALUES
  ('aa000000-0001-0000-0000-000000000001', '91a8a549-70f4-4571-9f95-96a31ec5c042', 'Atelier Poterie Adulte', 'Atelier de poterie traditionnelle avec les artisanes de Guellala. Durée 2h30.', 'workshop', false, 'active'),
  ('aa000000-0001-0000-0000-000000000002', '91a8a549-70f4-4571-9f95-96a31ec5c042', 'Atelier Poterie Enfant', 'Atelier adapté aux enfants à partir de 6 ans. Initiation douce à la poterie.', 'workshop', false, 'active')
ON CONFLICT (id) DO NOTHING;

-- Chambre Troglodyte Matmata (hebergement, no items)
INSERT INTO offer_items (id, offer_id, name, description, item_type, bed_count, nights, room_type, requires_confirmation, status) VALUES
  ('aa000000-0001-0000-0000-000000000003', '55000000-0001-0000-0000-000000000015', 'Chambre Troglodyte Standard', 'Chambre creusée dans la roche avec lit double. Fraîcheur naturelle garantie.', 'room', 2, 1, 'double', false, 'active'),
  ('aa000000-0001-0000-0000-000000000004', '55000000-0001-0000-0000-000000000015', 'Suite Familiale Troglodyte', 'Grande suite familiale avec 2 alcôves. Idéal pour familles.', 'room', 4, 1, 'family', true, 'active')
ON CONFLICT (id) DO NOTHING;

-- Circuit Vélo Éco Hammamet (activite, no items)
INSERT INTO offer_items (id, offer_id, name, description, item_type, requires_confirmation, status) VALUES
  ('aa000000-0001-0000-0000-000000000005', '55000000-0001-0000-0000-000000000013', 'Vélo Électrique', 'Location vélo électrique pour la journée. Casque inclus.', 'equipment', false, 'active'),
  ('aa000000-0001-0000-0000-000000000006', '55000000-0001-0000-0000-000000000013', 'Vélo Classique', 'Location vélo classique pour la journée. Casque inclus.', 'equipment', false, 'active'),
  ('aa000000-0001-0000-0000-000000000007', '55000000-0001-0000-0000-000000000013', 'Vélo Électrique + Guide', 'Vélo électrique avec guide accompagnateur pour découvrir les circuits.', 'guided_tour', true, 'active')
ON CONFLICT (id) DO NOTHING;

-- Kayak de Mer Korba (activite, no items)
INSERT INTO offer_items (id, offer_id, name, description, item_type, requires_confirmation, status) VALUES
  ('aa000000-0001-0000-0000-000000000008', '55000000-0001-0000-0000-000000000012', 'Kayak Solo', 'Kayak individuel pour 1 personne. Gilet et pagaie inclus.', 'activity', false, 'active'),
  ('aa000000-0001-0000-0000-000000000009', '55000000-0001-0000-0000-000000000012', 'Kayak Duo', 'Kayak pour 2 personnes. Idéal en couple ou entre amis.', 'activity', false, 'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. ADD PRICES FOR NEW ITEMS
-- ============================================================================
INSERT INTO offer_item_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default, status) VALUES
  -- Atelier poterie Guellala
  ('bb000000-0001-0000-0000-000000000001', 'aa000000-0001-0000-0000-000000000001', 'Adulte', 35.00, 'TND', 'per_person', true, 'active'),
  ('bb000000-0001-0000-0000-000000000002', 'aa000000-0001-0000-0000-000000000002', 'Enfant (6-12 ans)', 20.00, 'TND', 'per_person', true, 'active'),
  -- Chambre Troglodyte Matmata
  ('bb000000-0001-0000-0000-000000000003', 'aa000000-0001-0000-0000-000000000003', 'Adulte', 85.00, 'TND', 'per_night', true, 'active'),
  ('bb000000-0001-0000-0000-000000000004', 'aa000000-0001-0000-0000-000000000004', 'Famille (2adultes+2enfants)', 150.00, 'TND', 'per_night', true, 'active'),
  ('bb000000-0001-0000-0000-000000000005', 'aa000000-0001-0000-0000-000000000004', 'Enfant supplement', 25.00, 'TND', 'per_person', false, 'active'),
  -- Circuit Vélo Hammamet
  ('bb000000-0001-0000-0000-000000000006', 'aa000000-0001-0000-0000-000000000005', 'Journée', 40.00, 'TND', 'per_person', true, 'active'),
  ('bb000000-0001-0000-0000-000000000007', 'aa000000-0001-0000-0000-000000000006', 'Journée', 25.00, 'TND', 'per_person', true, 'active'),
  ('bb000000-0001-0000-0000-000000000008', 'aa000000-0001-0000-0000-000000000007', 'Journée + Guide', 65.00, 'TND', 'per_person', true, 'active'),
  -- Kayak Mer Korba
  ('bb000000-0001-0000-0000-000000000009', 'aa000000-0001-0000-0000-000000000008', 'Par personne', 45.00, 'TND', 'per_person', true, 'active'),
  ('bb000000-0001-0000-0000-000000000010', 'aa000000-0001-0000-0000-000000000009', 'Par kayak (2 pers.)', 70.00, 'TND', 'per_person', true, 'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. ADD SESSIONS (FUSEAUX HORAIRES) FOR NEW + EXISTING ITEMS
-- ============================================================================

-- Atelier poterie Guellala - sessions
INSERT INTO offer_item_sessions (id, offer_item_id, date, start_time, end_time, total_capacity, remaining_capacity, status) VALUES
  ('cc000000-0001-0000-0000-000000000001', 'aa000000-0001-0000-0000-000000000001', '2026-07-05', '10:00', '12:30', 8, 8, 'available'),
  ('cc000000-0001-0000-0000-000000000002', 'aa000000-0001-0000-0000-000000000001', '2026-07-06', '14:00', '16:30', 8, 8, 'available'),
  ('cc000000-0001-0000-0000-000000000003', 'aa000000-0001-0000-0000-000000000001', '2026-07-12', '10:00', '12:30', 8, 8, 'available'),
  ('cc000000-0001-0000-0000-000000000004', 'aa000000-0001-0000-0000-000000000002', '2026-07-05', '15:00', '16:30', 6, 6, 'available'),
  ('cc000000-0001-0000-0000-000000000005', 'aa000000-0001-0000-0000-000000000002', '2026-07-12', '15:00', '16:30', 6, 6, 'available')
ON CONFLICT (id) DO NOTHING;

-- Vélo Hammamet - sessions
INSERT INTO offer_item_sessions (id, offer_item_id, date, start_time, end_time, total_capacity, remaining_capacity, status) VALUES
  ('cc000000-0001-0000-0000-000000000006', 'aa000000-0001-0000-0000-000000000005', '2026-07-07', '08:00', '17:00', 20, 20, 'available'),
  ('cc000000-0001-0000-0000-000000000007', 'aa000000-0001-0000-0000-000000000005', '2026-07-14', '08:00', '17:00', 20, 20, 'available'),
  ('cc000000-0001-0000-0000-000000000008', 'aa000000-0001-0000-0000-000000000007', '2026-07-07', '08:00', '17:00', 10, 10, 'available'),
  ('cc000000-0001-0000-0000-000000000009', 'aa000000-0001-0000-0000-000000000007', '2026-07-14', '08:00', '17:00', 10, 10, 'available')
ON CONFLICT (id) DO NOTHING;

-- Kayak Mer Korba - sessions
INSERT INTO offer_item_sessions (id, offer_item_id, date, start_time, end_time, total_capacity, remaining_capacity, status) VALUES
  ('cc000000-0001-0000-0000-000000000010', 'aa000000-0001-0000-0000-000000000008', '2026-07-08', '07:00', '10:00', 15, 15, 'available'),
  ('cc000000-0001-0000-0000-000000000011', 'aa000000-0001-0000-0000-000000000008', '2026-07-08', '14:00', '17:00', 15, 15, 'available'),
  ('cc000000-0001-0000-0000-000000000012', 'aa000000-0001-0000-0000-000000000009', '2026-07-09', '07:00', '10:00', 10, 10, 'available'),
  ('cc000000-0001-0000-0000-000000000013', 'aa000000-0001-0000-0000-000000000009', '2026-07-09', '14:00', '17:00', 10, 10, 'available')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. ADD SESSIONS TO EXISTING ITEMS THAT HAVE 0 SESSIONS
-- ============================================================================

-- Camping Vert Djerba items (no sessions)
INSERT INTO offer_item_sessions (id, offer_item_id, date, start_time, end_time, total_capacity, remaining_capacity, status) VALUES
  ('cc000000-0001-0000-0000-000000000020', '6f3d73a5-728f-4a39-98ba-9ad1b3bb88fc', '2026-07-10', '14:00', '12:00', 4, 4, 'available'),
  ('cc000000-0001-0000-0000-000000000021', '6f3d73a5-728f-4a39-98ba-9ad1b3bb88fc', '2026-07-17', '14:00', '12:00', 4, 4, 'available'),
  ('cc000000-0001-0000-0000-000000000022', '9f4d8782-8079-4e34-ada8-b3683d429666', '2026-07-10', '14:00', '12:00', 6, 6, 'available'),
  ('cc000000-0001-0000-0000-000000000023', '7152993e-b5cc-460c-a11b-4185abf5a653', '2026-07-10', '14:00', '12:00', 8, 8, 'available'),
  ('cc000000-0001-0000-0000-000000000024', '7647a90f-734a-4ec3-a6f4-948efa95bb16', '2026-07-10', '14:00', '12:00', 10, 10, 'available')
ON CONFLICT (id) DO NOTHING;

-- Eco Lodge Sahara item (no sessions)
INSERT INTO offer_item_sessions (id, offer_item_id, date, start_time, end_time, total_capacity, remaining_capacity, status) VALUES
  ('cc000000-0001-0000-0000-000000000025', 'b7a3928b-c0be-4d1f-9d4a-8c5f9be4cd9a', '2026-07-15', '16:00', '10:00', 12, 12, 'available'),
  ('cc000000-0001-0000-0000-000000000026', 'b7a3928b-c0be-4d1f-9d4a-8c5f9be4cd9a', '2026-07-22', '16:00', '10:00', 12, 12, 'available')
ON CONFLICT (id) DO NOTHING;

-- Kayak côtier Djerba items (no sessions)
INSERT INTO offer_item_sessions (id, offer_item_id, date, start_time, end_time, total_capacity, remaining_capacity, status) VALUES
  ('cc000000-0001-0000-0000-000000000027', '5918b8ae-43a5-4ed4-8ec5-4782ad4977ef', '2026-07-11', '08:00', '11:00', 8, 8, 'available'),
  ('cc000000-0001-0000-0000-000000000028', '5918b8ae-43a5-4ed4-8ec5-4782ad4977ef', '2026-07-11', '14:00', '17:00', 8, 8, 'available'),
  ('cc000000-0001-0000-0000-000000000029', 'c9dda947-093e-4b85-acc6-4e4de09d9131', '2026-07-12', '08:00', '11:00', 6, 6, 'available'),
  ('cc000000-0001-0000-0000-000000000030', 'c9dda947-093e-4b85-acc6-4e4de09d9131', '2026-07-12', '14:00', '17:00', 6, 6, 'available')
ON CONFLICT (id) DO NOTHING;

-- Randonnée Matmata & Soumat items (no sessions)
INSERT INTO offer_item_sessions (id, offer_item_id, date, start_time, end_time, total_capacity, remaining_capacity, status) VALUES
  ('cc000000-0001-0000-0000-000000000031', 'b5419cb5-7200-46f7-9f84-56a450f12ee7', '2026-07-13', '08:00', '17:00', 15, 15, 'available'),
  ('cc000000-0001-0000-0000-000000000032', 'b5419cb5-7200-46f7-9f84-56a450f12ee7', '2026-07-20', '08:00', '17:00', 15, 15, 'available'),
  ('cc000000-0001-0000-0000-000000000033', '08ad39db-6836-4b63-bc20-b345ecebd7b2', '2026-07-13', '08:00', '12:00', 15, 15, 'available'),
  ('cc000000-0001-0000-0000-000000000034', '08ad39db-6836-4b63-bc20-b345ecebd7b2', '2026-07-20', '08:00', '12:00', 15, 15, 'available')
ON CONFLICT (id) DO NOTHING;

-- Safari désert Tozeur item (no sessions)
INSERT INTO offer_item_sessions (id, offer_item_id, date, start_time, end_time, total_capacity, remaining_capacity, status) VALUES
  ('cc000000-0001-0000-0000-000000000035', 'a5aaad81-9638-4db6-a342-f444fb0196fe', '2026-07-14', '09:00', '17:00', 10, 10, 'available'),
  ('cc000000-0001-0000-0000-000000000036', 'a5aaad81-9638-4db6-a342-f444fb0196fe', '2026-07-21', '09:00', '17:00', 10, 10, 'available')
ON CONFLICT (id) DO NOTHING;

-- Séjour Luxe Désert item (no sessions)
INSERT INTO offer_item_sessions (id, offer_item_id, date, start_time, end_time, total_capacity, remaining_capacity, status) VALUES
  ('cc000000-0001-0000-0000-000000000037', 'df984f1a-07f6-423e-a99f-1693ff3a9714', '2026-07-15', '14:00', '12:00', 2, 2, 'available'),
  ('cc000000-0001-0000-0000-000000000038', 'df984f1a-07f6-423e-a99f-1693ff3a9714', '2026-07-22', '14:00', '12:00', 2, 2, 'available')
ON CONFLICT (id) DO NOTHING;

-- Séjour éco-lodge 3 jours item (no sessions)
INSERT INTO offer_item_sessions (id, offer_item_id, date, start_time, end_time, total_capacity, remaining_capacity, status) VALUES
  ('cc000000-0001-0000-0000-000000000039', '25cf8b9b-ca94-4910-b122-5a2160bb8f96', '2026-07-16', '06:00', '10:00', 8, 8, 'available'),
  ('cc000000-0001-0000-0000-000000000040', '25cf8b9b-ca94-4910-b122-5a2160bb8f96', '2026-07-19', '06:00', '10:00', 8, 8, 'available')
ON CONFLICT (id) DO NOTHING;

-- Tour de l'île de Djerba items (no sessions)
INSERT INTO offer_item_sessions (id, offer_item_id, date, start_time, end_time, total_capacity, remaining_capacity, status) VALUES
  ('cc000000-0001-0000-0000-000000000041', 'd6706dc0-8acd-40fd-ac73-f72352d230dc', '2026-07-18', '08:00', '12:00', 6, 6, 'available'),
  ('cc000000-0001-0000-0000-000000000042', 'd6706dc0-8acd-40fd-ac73-f72352d230dc', '2026-07-25', '08:00', '12:00', 6, 6, 'available'),
  ('cc000000-0001-0000-0000-000000000043', 'ad4c8b57-b851-4e74-9b3b-89ce531bd1cb', '2026-07-18', '12:30', '14:00', 10, 10, 'available'),
  ('cc000000-0001-0000-0000-000000000044', 'ad4c8b57-b851-4e74-9b3b-89ce531bd1cb', '2026-07-25', '12:30', '14:00', 10, 10, 'available')
ON CONFLICT (id) DO NOTHING;

-- herbegement item (no sessions)
INSERT INTO offer_item_sessions (id, offer_item_id, date, start_time, end_time, total_capacity, remaining_capacity, status) VALUES
  ('cc000000-0001-0000-0000-000000000045', '632266f8-3220-4717-8f90-7fedc64f684d', '2026-07-19', '10:00', '12:00', 10, 10, 'available')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. UPDATE OFFER IMAGES WITH REAL UNSPLASH IMAGES
-- ============================================================================
UPDATE offers SET images = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80,https://images.unsplash.com/photo-1590595906931-81f04f0ccebb?w=800&q=80'
  WHERE id = 'f16e1dee-4290-44ff-9161-b9aedb2059a0';  -- Atelier Poterie Djerba

UPDATE offers SET images = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80,https://images.unsplash.com/photo-1590595906931-81f04f0ccebb?w=800&q=80'
  WHERE id = '55000000-0001-0000-0000-000000000014';  -- Atelier Poterie Traditionnelle

UPDATE offers SET images = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80,https://images.unsplash.com/photo-1590595906931-81f04f0ccebb?w=800&q=80'
  WHERE id = '91a8a549-70f4-4571-9f95-96a31ec5c042';  -- Atelier poterie de Guellala

UPDATE offers SET images = 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80,https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&q=80,https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80'
  WHERE id = '5db6c295-e655-452b-a758-22697e3a1f90';  -- Camping Vert Djerba

UPDATE offers SET images = 'https://images.unsplash.com/photo-1504457047772-27faf1c00561?w=800&q=80,https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80,https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80'
  WHERE id = '55000000-0001-0000-0000-000000000015';  -- Chambre Troglodyte Matmata

UPDATE offers SET images = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80,https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'
  WHERE id = '55000000-0001-0000-0000-000000000013';  -- Circuit Vélo Éco Hammamet

UPDATE offers SET images = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80,https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80,https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80'
  WHERE id = 'cf04faaf-b5f4-4200-ad68-2015deda136b';  -- Cours de Cuisine Djerbienne

UPDATE offers SET images = 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80,https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80,https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'
  WHERE id = '609a5dc8-2b00-4880-a336-44ca4a7c9ca6';  -- Dar El Jadid - Eco-lodge Djerba

UPDATE offers SET images = 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80,https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80,https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80'
  WHERE id = 'a09c3481-ca93-4ae6-9b5b-90bb5a7d4e1b';  -- Eco Lodge Sahara

UPDATE offers SET images = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80,https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800&q=80'
  WHERE id = 'e5feb3b8-1c3d-4f59-91b5-42a9742e8a4d';  -- Kayak côtier Djerba

UPDATE offers SET images = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80,https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800&q=80'
  WHERE id = '55000000-0001-0000-0000-000000000012';  -- Kayak de Mer Korba

UPDATE offers SET images = 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80,https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80,https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80'
  WHERE id = 'b37d6761-c98c-452d-b5a8-1076c9dac33d';  -- Nuit sous les Étoiles

UPDATE offers SET images = 'https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=800&q=80,https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80'
  WHERE id = 'c4b8ad00-9ee5-48cf-ae94-2eb03c5965b3';  -- Quad dans le Sahara

UPDATE offers SET images = 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80,https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80'
  WHERE id = 'a643b504-0360-432f-837b-2c0ce034867a';  -- Rando Côtière Djerba

UPDATE offers SET images = 'https://images.unsplash.com/photo-1504457047772-27faf1c00561?w=800&q=80,https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80,https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80'
  WHERE id = 'ba16f8a9-5654-4a24-a462-3874acb54f9d';  -- Randonnée Matmata & Soumat

UPDATE offers SET images = 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80,https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80,https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80'
  WHERE id = '83db1931-581d-44e4-b303-c72d48aefa93';  -- Safari désert Tozeur

UPDATE offers SET images = 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80,https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80'
  WHERE id = '980fae77-3b9d-4694-9bf1-e10b6674d9c5';  -- Séjour Luxe Désert

UPDATE offers SET images = 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80,https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80,https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80'
  WHERE id = 'fad430ba-e36c-4606-9d54-768693fa644a';  -- Séjour éco-lodge 3 jours

UPDATE offers SET images = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80,https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800&q=80,https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80'
  WHERE id = '689e885e-21bd-44cc-8066-d97a11af50ef';  -- Tour de l'île de Djerba

UPDATE offers SET images = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80'
  WHERE id = '57265bf7-87db-4e71-b30f-740922497f65';  -- actv kayak

UPDATE offers SET images = 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80,https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80'
  WHERE id = '7f721ade-5fda-482c-a732-130ba6bcd464';  -- herbegement

-- ============================================================================
-- 6. UPDATE CIRCUIT IMAGES WITH REAL UNSPLASH IMAGES
-- ============================================================================
UPDATE circuits SET images = 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80,https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80,https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80,https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80'
  WHERE id = 'fa77f9d8-1a7e-409e-be72-77db416d583b';  -- Aventure Sahara & Désert 5 jours

UPDATE circuits SET images = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80,https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800&q=80,https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80'
  WHERE id = 'a3dc5401-503f-4233-ab4a-dc65679938e9';  -- Djerba Éco-Trek

UPDATE circuits SET images = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80,https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80,https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80,https://images.unsplash.com/photo-1504457047772-27faf1c00561?w=800&q=80'
  WHERE id = '6286037d-107f-45ab-bedf-cf08c4adfe55';  -- Découverte de Djerba 4 jours

UPDATE circuits SET images = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80,https://images.unsplash.com/photo-1590595906931-81f04f0ccebb?w=800&q=80'
  WHERE id = '6131c1d2-89f7-4994-ba54-2abab31feac8';  -- Kairouan & Sousse Culturel

UPDATE circuits SET images = 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80,https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80,https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80,https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80'
  WHERE id = '2e3040ed-a410-4827-a8e2-c5a52cfa9a7d';  -- Sahara Authentique 4 jours

UPDATE circuits SET images = 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80,https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80,https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80'
  WHERE id = 'ddf645f5-8aa6-4753-8a93-b46fa6e12b61';  -- Sahara Luxe VIP

UPDATE circuits SET images = 'https://images.unsplash.com/photo-1504457047772-27faf1c00561?w=800&q=80,https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80,https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80'
  WHERE id = 'e76a73d9-db05-4e02-bcc6-10e8edf5defd';  -- circuit 1

DO $$
BEGIN
  RAISE NOTICE 'Enrichissement termine !';
  RAISE NOTICE 'Items ajoutes aux 4 offres sans elements';
  RAISE NOTICE 'Fuseaux horaires ajoutes aux items existants';
  RAISE NOTICE 'Images misees a jour pour toutes les offres et circuits';
END;
$$;

COMMIT;
