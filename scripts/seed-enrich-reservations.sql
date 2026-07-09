-- ============================================================================
-- ENRICHISSEMENT : Réservations avec statuts variés pour les utilisateurs faker
-- Ajoute des réservations de circuits, bookings et participants réalistes
-- Toutes les insertions sont idempotentes (WHERE NOT EXISTS / ON CONFLICT)
-- ============================================================================
BEGIN;

DO $$
DECLARE
  -- IDs des utilisateurs faker
  v_proj        CONSTANT uuid := '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e';
  v_traveler    CONSTANT uuid := '7b83e87d-276d-4d89-bb00-ab8ea1243a14';
  v_guide       CONSTANT uuid := 'a3000000-0000-4000-8000-000000000001';
  v_other       CONSTANT uuid := 'a602737a-b07d-4a41-b9c3-cdf1be17036a';

  -- Circuits
  v_cir_djerba     CONSTANT uuid := '11000000-0001-0000-0000-000000000002';
  v_cir_trek       CONSTANT uuid := '11000000-0001-0000-0000-000000000003';
  v_cir_huiles     CONSTANT uuid := 'f1000000-0001-4000-8000-000000000106';
  v_cir_roadtrip   CONSTANT uuid := 'a5000000-0001-4000-8000-0000000000f5';

  -- Offres
  v_off_dar   CONSTANT uuid := 'f1000000-0001-4000-8000-000000000001';
  v_off_rest  CONSTANT uuid := 'f1000000-0001-4000-8000-000000000003';
  v_off_kayak CONSTANT uuid := '55000000-0001-0000-0000-000000000012';

  -- Items d'offres
  v_item_dar  CONSTANT uuid := 'f1000000-0002-4000-8000-000000000001';
  v_item_menu CONSTANT uuid := 'f1000000-0002-4000-8000-000000000004';
  v_item_kay  CONSTANT uuid := 'a2000000-0001-4000-8000-000000000012';

  -- Guide offerings
  v_go_jebel    CONSTANT uuid := 'f3000000-0001-4000-8000-000000000001';
  v_go_carthage CONSTANT uuid := 'f3000000-0001-4000-8000-000000000002';

  -- IDs constants pour les bookings (référencés par booking_participants)
  v_bk1 CONSTANT uuid := 'e0000000-0001-4000-8000-000000000001';
  v_bk2 CONSTANT uuid := 'e0000000-0001-4000-8000-000000000002';
  v_bk3 CONSTANT uuid := 'e0000000-0001-4000-8000-000000000003';
  v_bk4 CONSTANT uuid := 'e0000000-0001-4000-8000-000000000004';
  v_bk5 CONSTANT uuid := 'e0000000-0001-4000-8000-000000000005';
  v_bk6 CONSTANT uuid := 'e0000000-0001-4000-8000-000000000006';

  -- Variables pour les sessions
  v_sess1 uuid;
  v_sess2 uuid;
  v_sess3 uuid;
BEGIN

  -- ==========================================================================
  -- SECTION 1 : Mise à jour des réservations de circuit existantes
  -- ==========================================================================
  RAISE NOTICE '=== SECTION 1 : Mise à jour réservations existantes ===';

  -- Annuler la réservation confirmée de f.akerbennoomen sur Djerba Authentique
  UPDATE circuit_reservations
  SET status = 'cancelled'
  WHERE circuit_id = v_cir_djerba
    AND user_id = v_traveler
    AND status = 'confirmed';

  RAISE NOTICE '✓ Réservation Djerba Authentique passée à annulée';

  -- ==========================================================================
  -- SECTION 2 : Nouvelles réservations de circuit pour f.akerbennoomen
  -- ==========================================================================
  RAISE NOTICE '=== SECTION 2 : Nouvelles réservations circuit ===';

  -- 2a. Annulée : Trek Kroumirie, 1 participant, 350 TND
  INSERT INTO circuit_reservations (id, circuit_id, user_id, participants_count, base_total, options_total, final_total, status, created_at)
  SELECT gen_random_uuid(), v_cir_trek, v_traveler,
         1, 350.00, 0, 350.00, 'cancelled',
         NOW() - INTERVAL '10 days'
  WHERE NOT EXISTS (
    SELECT 1 FROM circuit_reservations
    WHERE circuit_id = v_cir_trek AND user_id = v_traveler AND status = 'cancelled'
  );

  RAISE NOTICE '✓ Réservation Trek Kroumirie annulée créée';

  -- 2b. Confirmée : Découverte Huiles Essentielles, 2 participants, 360 TND
  INSERT INTO circuit_reservations (id, circuit_id, user_id, participants_count, base_total, options_total, final_total, status, created_at)
  SELECT gen_random_uuid(), v_cir_huiles, v_traveler,
         2, 360.00, 0, 360.00, 'confirmed',
         NOW() - INTERVAL '3 days'
  WHERE NOT EXISTS (
    SELECT 1 FROM circuit_reservations
    WHERE circuit_id = v_cir_huiles AND user_id = v_traveler AND status = 'confirmed'
  );

  RAISE NOTICE '✓ Réservation Huiles Essentielles confirmée créée';

  -- 2c. En attente : Road Trip Sud Tunisien, 4 participants, 2400 TND
  INSERT INTO circuit_reservations (id, circuit_id, user_id, participants_count, base_total, options_total, final_total, status, created_at)
  SELECT gen_random_uuid(), v_cir_roadtrip, v_traveler,
         4, 2400.00, 0, 2400.00, 'pending',
         NOW() - INTERVAL '1 day'
  WHERE NOT EXISTS (
    SELECT 1 FROM circuit_reservations
    WHERE circuit_id = v_cir_roadtrip AND user_id = v_traveler AND status = 'pending'
  );

  RAISE NOTICE '✓ Réservation Road Trip Sud en attente créée';

  -- ==========================================================================
  -- SECTION 3 : Bookings sur les offres de fakerbennoomen
  -- ==========================================================================
  RAISE NOTICE '=== SECTION 3 : Bookings sur offres ===';

  -- 3a. Annulée : Éco-Lodge Dar Bouazza, Chambre Deluxe 220 TND
  INSERT INTO bookings (id, booking_ref, traveler_id, offer_id, offer_item_id, status, total_price, currency, special_requests, confirmation_mode, cancelled_at, cancel_reason, created_at, updated_at)
  VALUES (v_bk1, 'BK-ENR-001', v_traveler,
          v_off_dar, v_item_dar,
          'cancelled', 220.00, 'TND',
          'Souhaite une chambre avec vue sur la mer si possible',
          'manual',
          NOW() - INTERVAL '2 days',
          'Changement de planning, voyage reporté à octobre 2026',
          NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days')
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE '✓ Booking Dar Bouazza annulé créé';

  -- 3b. Confirmée : Restaurant Dar El Fellah, Menu Dégustation 120 TND
  INSERT INTO bookings (id, booking_ref, traveler_id, offer_id, offer_item_id, status, total_price, currency, special_requests, confirmation_mode, created_at, updated_at)
  VALUES (v_bk2, 'BK-ENR-002', v_traveler,
          v_off_rest, v_item_menu,
          'confirmed', 120.00, 'TND',
          '2 personnes, option sans gluten pour l une des personnes',
          'automatic',
          NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days')
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE '✓ Booking Restaurant Dar El Fellah confirmé créé';

  -- 3c. En attente : Kayak de Mer Korba, 55 TND
  INSERT INTO bookings (id, booking_ref, traveler_id, offer_id, offer_item_id, status, total_price, currency, special_requests, confirmation_mode, created_at, updated_at)
  VALUES (v_bk3, 'BK-ENR-003', v_traveler,
          v_off_kayak, v_item_kay,
          'pending', 55.00, 'TND',
          'Préfère le créneau matinal si disponible',
          'automatic',
          NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE '✓ Booking Kayak Korba en attente créé';

  -- ==========================================================================
  -- SECTION 4 : Sessions pour les guide offerings de fa.kerbennoomen
  -- ==========================================================================
  RAISE NOTICE '=== SECTION 4 : Sessions guide offerings ===';

  -- Session 1 : Randonnée Jebel Ressas - 19 juillet 2026
  INSERT INTO guide_offering_sessions (id, guide_offering_id, date, start_time, end_time, total_capacity, remaining_capacity, status, created_at)
  VALUES (gen_random_uuid(), v_go_jebel, '2026-07-19', '08:00', '16:00', 8, 5, 'available', NOW() - INTERVAL '10 days')
  ON CONFLICT (id) DO NOTHING;

  -- Session 2 : Visite Culturelle Carthage - 15 août 2026
  INSERT INTO guide_offering_sessions (id, guide_offering_id, date, start_time, end_time, total_capacity, remaining_capacity, status, created_at)
  VALUES (gen_random_uuid(), v_go_carthage, '2026-08-15', '09:00', '14:00', 12, 10, 'available', NOW() - INTERVAL '10 days')
  ON CONFLICT (id) DO NOTHING;

  -- Session 3 : Randonnée Jebel Ressas - 6 septembre 2026
  INSERT INTO guide_offering_sessions (id, guide_offering_id, date, start_time, end_time, total_capacity, remaining_capacity, status, created_at)
  VALUES (gen_random_uuid(), v_go_jebel, '2026-09-06', '08:00', '16:00', 8, 8, 'available', NOW() - INTERVAL '10 days')
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE '✓ 3 sessions guide offerings créées';

  -- ==========================================================================
  -- SECTION 5 : Bookings sur les guide offerings de fa.kerbennoomen
  -- ==========================================================================
  RAISE NOTICE '=== SECTION 5 : Bookings guide offerings ===';

  -- Récupérer les IDs des sessions
  SELECT id INTO v_sess1 FROM guide_offering_sessions
  WHERE guide_offering_id = v_go_jebel AND date = '2026-07-19' LIMIT 1;

  SELECT id INTO v_sess2 FROM guide_offering_sessions
  WHERE guide_offering_id = v_go_carthage AND date = '2026-08-15' LIMIT 1;

  SELECT id INTO v_sess3 FROM guide_offering_sessions
  WHERE guide_offering_id = v_go_jebel AND date = '2026-09-06' LIMIT 1;

  -- 5a. Confirmée : Randonnée Jebel Ressas, 3 participants, 135 TND
  INSERT INTO bookings (id, booking_ref, traveler_id, guide_offering_id, guide_offering_session_id, status, total_price, currency, special_requests, confirmation_mode, created_at, updated_at)
  VALUES (v_bk4, 'BK-ENR-004', v_traveler,
          v_go_jebel, v_sess1,
          'confirmed', 135.00, 'TND',
          '3 participants, prévoir un pique-nique végétarien svp',
          'manual',
          NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days')
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE '✓ Booking guide Jebel Ressas confirmé créé';

  -- Participants pour Jebel Ressas (5a)
  INSERT INTO booking_participants (id, booking_id, full_name, age, document_type, document_number, is_group_leader, created_at)
  VALUES
    (gen_random_uuid(), v_bk4, 'Mohamed Ali Ben Salem', 35, 'cin', '12345678', true,  NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), v_bk4, 'Samia Ben Mahmoud',     32, 'passport', '87654321', false, NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), v_bk4, 'Karim Jebali',          42, 'cin', '55667788', false, NOW() - INTERVAL '5 days')
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE '✓ 3 participants ajoutés au booking Jebel Ressas';

  -- 5b. En attente : Visite Culturelle Carthage, 2 participants, 70 TND, autre eco_traveler
  INSERT INTO bookings (id, booking_ref, traveler_id, guide_offering_id, guide_offering_session_id, status, total_price, currency, special_requests, confirmation_mode, created_at, updated_at)
  VALUES (v_bk5, 'BK-ENR-005', v_other,
          v_go_carthage, v_sess2,
          'pending', 70.00, 'TND',
          '2 personnes, intéressées par la mosaïque romaine et les thermes',
          'manual',
          NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE '✓ Booking guide Carthage en attente créé';

  -- 5c. Annulée : Randonnée Jebel Ressas, 1 personne, 45 TND
  INSERT INTO bookings (id, booking_ref, traveler_id, guide_offering_id, guide_offering_session_id, status, total_price, currency, special_requests, confirmation_mode, cancelled_at, cancel_reason, created_at, updated_at)
  VALUES (v_bk6, 'BK-ENR-006', v_traveler,
          v_go_jebel, v_sess3,
          'cancelled', 45.00, 'TND',
          'Seul, bonne condition physique',
          'manual',
          NOW() - INTERVAL '3 days',
          'Problème familial, doit annuler le séjour prévu',
          NOW() - INTERVAL '7 days', NOW() - INTERVAL '3 days')
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE '✓ Booking guide Jebel Ressas annulé créé';

  -- ==========================================================================
  -- SUMMARY
  -- ==========================================================================
  RAISE NOTICE '==============================================================';
  RAISE NOTICE '✅ Enrichissement réservations terminé avec succès !';
  RAISE NOTICE '   6 bookings créés, 3 réservations circuit, 3 participants';
  RAISE NOTICE '==============================================================';

END $$;

COMMIT;
