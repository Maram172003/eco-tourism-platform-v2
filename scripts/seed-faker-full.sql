-- ============================================================================
-- Seed Faker Full — Données de test pour 3 utilisateurs faker
-- (fakerbennoomen, f.akerbennoomen, fa.kerbennoomen)
-- Toutes les insertions sont idempotentes (WHERE NOT EXISTS / ON CONFLICT)
-- ============================================================================
BEGIN;

-- ============================================================================
-- CONSTANTES : IDs des utilisateurs faker existants
-- ============================================================================
DO $$
DECLARE
  v_faker_owner    CONSTANT uuid := '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e';
  v_faker_traveler CONSTANT uuid := '7b83e87d-276d-4d89-bb00-ab8ea1243a14';
  v_faker_guide    uuid;

  -- Nouveaux IDs
  v_new_guide_user CONSTANT uuid := 'a3000000-0000-4000-8000-000000000001';

  -- Offers
  v_offer1 CONSTANT uuid := 'f1000000-0001-4000-8000-000000000001';
  v_offer2 CONSTANT uuid := 'f1000000-0001-4000-8000-000000000002';
  v_offer3 CONSTANT uuid := 'f1000000-0001-4000-8000-000000000003';
  v_offer4 CONSTANT uuid := 'f1000000-0001-4000-8000-000000000004';

  -- Offer items
  v_item1 CONSTANT uuid := 'f1000000-0002-4000-8000-000000000001';
  v_item2 CONSTANT uuid := 'f1000000-0002-4000-8000-000000000002';
  v_item3 CONSTANT uuid := 'f1000000-0002-4000-8000-000000000003';
  v_item4 CONSTANT uuid := 'f1000000-0002-4000-8000-000000000004';
  v_item5 CONSTANT uuid := 'f1000000-0002-4000-8000-000000000005';

  -- Offer item prices
  v_price1 CONSTANT uuid := 'f1000000-0003-4000-8000-000000000001';
  v_price2 CONSTANT uuid := 'f1000000-0003-4000-8000-000000000002';
  v_price3 CONSTANT uuid := 'f1000000-0003-4000-8000-000000000003';
  v_price4 CONSTANT uuid := 'f1000000-0003-4000-8000-000000000004';
  v_price5 CONSTANT uuid := 'f1000000-0003-4000-8000-000000000005';
  v_price6 CONSTANT uuid := 'f1000000-0003-4000-8000-000000000006';
  v_price7 CONSTANT uuid := 'f1000000-0003-4000-8000-000000000007';

  -- Circuits
  v_cir1 CONSTANT uuid := 'f1000000-0001-4000-8000-000000000101';
  v_cir2 CONSTANT uuid := 'f1000000-0001-4000-8000-000000000103';
  v_cir3 CONSTANT uuid := 'f1000000-0001-4000-8000-000000000106';

  -- Circuit days
  v_cday1 CONSTANT uuid := 'f1000000-0001-4000-8000-000000000102';
  v_cday2 CONSTANT uuid := 'f1000000-0001-4000-8000-000000000104';
  v_cday3 CONSTANT uuid := 'f1000000-0001-4000-8000-000000000105';
  v_cday4 CONSTANT uuid := 'f1000000-0001-4000-8000-000000000107';

  -- Circuit program items
  v_prog1  CONSTANT uuid := 'f1000000-0001-4000-8000-000000000110';
  v_prog2  CONSTANT uuid := 'f1000000-0001-4000-8000-000000000111';
  v_prog3  CONSTANT uuid := 'f1000000-0001-4000-8000-000000000112';
  v_prog4  CONSTANT uuid := 'f1000000-0001-4000-8000-000000000113';
  v_prog5  CONSTANT uuid := 'f1000000-0001-4000-8000-000000000114';
  v_prog6  CONSTANT uuid := 'f1000000-0001-4000-8000-000000000115';
  v_prog7  CONSTANT uuid := 'f1000000-0001-4000-8000-000000000116';

  -- Publications
  v_pub1 CONSTANT uuid := 'f1000000-0001-4000-8000-000000000201';
  v_pub2 CONSTANT uuid := 'f1000000-0001-4000-8000-000000000202';

  -- Trip plans
  v_tp1 CONSTANT uuid := 'f2000000-0001-4000-8000-000000000001';
  v_tp2 CONSTANT uuid := 'f2000000-0001-4000-8000-000000000002';

  -- Trip plan items
  v_tpi1 CONSTANT uuid := 'f2000000-0001-4000-8000-000000000010';
  v_tpi2 CONSTANT uuid := 'f2000000-0001-4000-8000-000000000011';
  v_tpi3 CONSTANT uuid := 'f2000000-0001-4000-8000-000000000012';

  -- Guide offerings
  v_go1 CONSTANT uuid := 'f3000000-0001-4000-8000-000000000001';
  v_go2 CONSTANT uuid := 'f3000000-0001-4000-8000-000000000002';

  -- Guide offering prices
  v_gop1 CONSTANT uuid := 'f3000000-0002-4000-8000-000000000001';
  v_gop2 CONSTANT uuid := 'f3000000-0002-4000-8000-000000000002';

BEGIN
  -- ==========================================================================
  -- Récupérer l'ID du guide fa.kerbennoomen (existe déjà ou on le crée)
  -- ==========================================================================
  SELECT id INTO v_faker_guide FROM users WHERE email = 'fa.kerbennoomen@gmail.com';

  IF v_faker_guide IS NULL THEN
    INSERT INTO users (id, email, password, auth_method, role, status, email_verified_at, created_at, updated_at)
    VALUES (v_new_guide_user, 'fa.kerbennoomen@gmail.com',
            '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC',
            'email', 'guide', 'active', NOW(), NOW(), NOW());
    v_faker_guide := v_new_guide_user;
  END IF;

  RAISE NOTICE '✓ Guide user ID = %', v_faker_guide;

  -- ==========================================================================
  -- SECTION 1: Guide profile for fa.kerbennoomen
  -- ==========================================================================
  INSERT INTO guides (user_id, full_name, guide_type, bio, country, zone, specialties, languages_spoken, years_experience, status, profile_completion, is_onboarded)
  SELECT v_faker_guide, 'Fakher Ben Nomen', 'professionnel',
         'Guide professionnel spécialisé dans les randonnées en montagne et le patrimoine culturel tunisien',
         'Tunisie', 'Tunis',
         '["randonnee","montagne","culture","patrimoine"]',
         '["Arabe","Francais","Anglais"]',
         8, 'active', 100, true
  WHERE NOT EXISTS (SELECT 1 FROM guides WHERE user_id = v_faker_guide);

  RAISE NOTICE '✓ Section 1: Guide profile created';

  -- ==========================================================================
  -- SECTION 2: New offers for fakerbennoomen (project_owner)
  -- ==========================================================================

  -- OFFER 1: Éco-Lodge Dar Bouazza (approved, hebergement)
  INSERT INTO offers (id, author_id, author_type, category_id, title, description, offer_type, price, images, inclusions, region, address, latitude, longitude, location_type, confirmation_mode, status, created_at, updated_at)
  SELECT v_offer1, v_faker_owner, 'project_owner',
         (SELECT id FROM offer_categories WHERE slug = 'accommodation'),
         'Éco-Lodge Dar Bouazza',
         'Éco-lodge traditionnel tunisien avec vue imprenable sur la mer Méditerranée. Chambres confortables et dortoir écologique. Alimenté par panneaux solaires, produits bio locaux.',
         'hebergement', 220.00,
         'https://res.cloudinary.com/depzhocsd/image/upload/v1712345678/tourisme/eco-lodge-dar-bouazza-1.jpg,https://res.cloudinary.com/depzhocsd/image/upload/v1712345679/tourisme/eco-lodge-dar-bouazza-2.jpg',
         'Petit-déjeuner bio inclus, linge de lit, Wi-Fi, serviettes',
         'Tunis', 'Dar Bouazza, banlieue nord de Tunis', 36.8500, 10.3000, 'fixed', 'manual', 'approved',
         NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'
  WHERE NOT EXISTS (SELECT 1 FROM offers WHERE id = v_offer1);

  -- Item 1: Chambre Deluxe Vue Mer
  INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status, created_at, updated_at)
  SELECT v_item1, v_offer1,
         'Chambre Deluxe Vue Mer',
         'Chambre spacieuse avec balcon panoramique sur la mer Méditerranée. Lit double, salle de bain privative, climatisation.',
         'room', '{"room_sub_type":"double","bed_count":2,"nights":1}'::json, 'active',
         NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'
  WHERE NOT EXISTS (SELECT 1 FROM offer_items WHERE id = v_item1);

  -- Price 1: Plein tarif 220 TND
  INSERT INTO offer_item_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default, status)
  SELECT v_price1, v_item1, 'Plein tarif', 220.00, 'TND', 'per_night', true, 'active'
  WHERE NOT EXISTS (SELECT 1 FROM offer_item_prices WHERE id = v_price1);

  -- Price 2: Tarif réduit 180 TND
  INSERT INTO offer_item_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default, status)
  SELECT v_price2, v_item1, 'Tarif réduit', 180.00, 'TND', 'per_night', false, 'active'
  WHERE NOT EXISTS (SELECT 1 FROM offer_item_prices WHERE id = v_price2);

  -- Capacity: room capacity
  INSERT INTO offer_item_capacity (id, offer_item_id, capacity_type, total_quantity, remaining_quantity, max_persons)
  SELECT gen_random_uuid(), v_item1, 'room', 5, 3, 2
  WHERE NOT EXISTS (
    SELECT 1 FROM offer_item_capacity WHERE offer_item_id = v_item1
  );

  -- Session: 2026-08-15
  INSERT INTO offer_item_sessions (id, offer_item_id, date, start_time, end_time, total_capacity, remaining_capacity, status)
  SELECT gen_random_uuid(), v_item1, '2026-08-15'::date, '14:00'::time, '12:00'::time, 5, 3, 'available'
  WHERE NOT EXISTS (
    SELECT 1 FROM offer_item_sessions
    WHERE offer_item_id = v_item1 AND date = '2026-08-15'::date
  );

  -- Availability rule: weekly
  INSERT INTO offer_item_availability_rules (id, offer_item_id, availability_type, weekdays)
  SELECT gen_random_uuid(), v_item1, 'weekly', '["monday","tuesday","wednesday","thursday","friday"]'
  WHERE NOT EXISTS (
    SELECT 1 FROM offer_item_availability_rules WHERE offer_item_id = v_item1
  );

  -- Item 2: Dortoir 6 Places
  INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status, created_at, updated_at)
  SELECT v_item2, v_offer1,
         'Dortoir 6 Places',
         'Dortoir confortable de 6 lits superposés en bois massif. Casiers individuels, salle de bain partagée, terrasse commune.',
         'room', '{"room_sub_type":"dortoir","bed_count":6,"nights":1}'::json, 'active',
         NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'
  WHERE NOT EXISTS (SELECT 1 FROM offer_items WHERE id = v_item2);

  -- Price: Par personne 55 TND
  INSERT INTO offer_item_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default, status)
  SELECT v_price3, v_item2, 'Par personne', 55.00, 'TND', 'per_person', true, 'active'
  WHERE NOT EXISTS (SELECT 1 FROM offer_item_prices WHERE id = v_price3);

  RAISE NOTICE '✓ Offer 1: Éco-Lodge Dar Bouazza';

  -- OFFER 2: Parapente au Cap Bon (rejected, activite)
  INSERT INTO offers (id, author_id, author_type, category_id, title, description, offer_type, price, images, inclusions, region, address, latitude, longitude, location_type, confirmation_mode, status, rejection_reason, created_at, updated_at)
  SELECT v_offer2, v_faker_owner, 'project_owner',
         (SELECT id FROM offer_categories WHERE slug = 'activity'),
         'Parapente au Cap Bon',
         'Vol en parapente biplace au-dessus des falaises du Cap Bon. Sensations fortes garanties avec vue panoramique sur la mer et les îles Zembra.',
         'activite', 150.00,
         'https://res.cloudinary.com/depzhocsd/image/upload/v1712345680/tourisme/parapente-cap-bon-1.jpg',
         'Équipement complet, instructeur diplômé, assurance, navette retour',
         'Cap Bon', 'Route touristique, Haouaria', 37.0500, 11.0167, 'fixed', 'manual', 'rejected',
         'Assurance non fournie',
         NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days'
  WHERE NOT EXISTS (SELECT 1 FROM offers WHERE id = v_offer2);

  -- Item 1: Vol Parapente 30min
  INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status, created_at, updated_at)
  SELECT v_item3, v_offer2,
         'Vol Parapente 30min',
         'Vol biplace de 30 minutes avec instructeur certifié. Départ depuis les falaises de Haouaria.',
         'activity', '{"duration_minutes":30,"max_participants":1}'::json, 'active',
         NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'
  WHERE NOT EXISTS (SELECT 1 FROM offer_items WHERE id = v_item3);

  -- Price: Adulte 150 TND
  INSERT INTO offer_item_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default, status)
  SELECT v_price4, v_item3, 'Adulte', 150.00, 'TND', 'per_person', true, 'active'
  WHERE NOT EXISTS (SELECT 1 FROM offer_item_prices WHERE id = v_price4);

  RAISE NOTICE '✓ Offer 2: Parapente au Cap Bon';

  -- OFFER 3: Restaurant Éco-local Dar El Fellah (draft, restauration)
  INSERT INTO offers (id, author_id, author_type, category_id, title, description, offer_type, price, images, inclusions, region, address, latitude, longitude, location_type, confirmation_mode, status, created_at, updated_at)
  SELECT v_offer3, v_faker_owner, 'project_owner',
         (SELECT id FROM offer_categories WHERE slug = 'restaurant'),
         'Restaurant Éco-local Dar El Fellah',
         'Restaurant gastronomique éco-responsable proposant une cuisine tunisienne revisitée avec des produits bio locaux. Terrasse ombragée, vue sur les champs.',
         'restauration', 120.00,
         'https://res.cloudinary.com/depzhocsd/image/upload/v1712345681/tourisme/dar-el-fellah-1.jpg,https://res.cloudinary.com/depzhocsd/image/upload/v1712345682/tourisme/dar-el-fellah-2.jpg',
         'Entrée + plat + dessert, thé à la menthe, pain traditionnel bio',
         'Tunis', 'Route de la Plaine, Ariana', 36.8667, 10.1833, 'fixed', 'automatic', 'draft',
         NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
  WHERE NOT EXISTS (SELECT 1 FROM offers WHERE id = v_offer3);

  -- Item 1: Menu Dégustation 5 Services
  INSERT INTO offer_items (id, offer_id, name, description, item_type, status, created_at, updated_at)
  SELECT v_item4, v_offer3,
         'Menu Dégustation 5 Services',
         'Menu découverte de 5 plats : bricks, couscous, tajine, pâtisseries orientales, café.',
         'menu', 'active',
         NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
  WHERE NOT EXISTS (SELECT 1 FROM offer_items WHERE id = v_item4);

  -- Price: Menu 120 TND
  INSERT INTO offer_item_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default, status)
  SELECT v_price5, v_item4, 'Menu', 120.00, 'TND', 'per_person', true, 'active'
  WHERE NOT EXISTS (SELECT 1 FROM offer_item_prices WHERE id = v_price5);

  RAISE NOTICE '✓ Offer 3: Restaurant Dar El Fellah';

  -- OFFER 4: Atelier Mosaïque Carthage (pending, artisanat)
  INSERT INTO offers (id, author_id, author_type, category_id, title, description, offer_type, price, images, inclusions, region, address, latitude, longitude, location_type, confirmation_mode, status, created_at, updated_at)
  SELECT v_offer4, v_faker_owner, 'project_owner',
         (SELECT id FROM offer_categories WHERE slug = 'craft'),
         'Atelier Mosaïque Carthage',
         'Initiation à l''art de la mosaïque traditionnelle tunisienne dans un atelier authentique au cœur de Carthage. Repartez avec votre œuvre.',
         'artisanat', 90.00,
         'https://res.cloudinary.com/depzhocsd/image/upload/v1712345683/tourisme/mosaique-carthage-1.jpg',
         'Matériel complet, encadrement par un maître mosaïste, pièce à emporter',
         'Carthage', 'Rue des Thermes d''Antonin, Carthage', 36.8525, 10.3347, 'fixed', 'manual', 'pending',
         NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'
  WHERE NOT EXISTS (SELECT 1 FROM offers WHERE id = v_offer4);

  -- Item 1: Initiation Mosaïque 3h
  INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status, created_at, updated_at)
  SELECT v_item5, v_offer4,
         'Initiation Mosaïque 3h',
         'Atelier de 3 heures pour apprendre les techniques de la mosaïque antique. Tous niveaux bienvenus.',
         'workshop', '{"duration_minutes":180,"max_participants":8}'::json, 'active',
         NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'
  WHERE NOT EXISTS (SELECT 1 FROM offer_items WHERE id = v_item5);

  -- Price: Adulte 90 TND
  INSERT INTO offer_item_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default, status)
  SELECT v_price6, v_item5, 'Adulte', 90.00, 'TND', 'per_person', true, 'active'
  WHERE NOT EXISTS (SELECT 1 FROM offer_item_prices WHERE id = v_price6);

  RAISE NOTICE '✓ Offer 4: Atelier Mosaïque Carthage';

  -- ==========================================================================
  -- SECTION 3: New circuits for fakerbennoomen
  -- ==========================================================================

  -- CIRCUIT 1: Randonnée des Lacs Bleus (approved)
  INSERT INTO circuits (id, author_id, author_type, title, description, status, base_price, duration_days, duration_nights, difficulty_level, region, currency, lat, lng, hebergement, images, created_at, updated_at)
  SELECT v_cir1, v_faker_owner, 'project_owner',
         'Randonnée des Lacs Bleus',
         'Magnifique randonnée à travers les lacs de montagne du Nord-Ouest tunisien. Forêts de chênes-lièges, cascades et paysages à couper le souffle.',
         'approved', 320.00, 2, 1, 'moderate', 'Jendouba', 'TND',
         36.7500, 8.1120,
         '{"inclus": true, "type": "same", "accom_type": "chambre", "nb_unites": 1, "nb_lits": 2, "price_source": "own", "prix_nuit": 80}'::jsonb,
         'https://res.cloudinary.com/depzhocsd/image/upload/v1712345684/tourisme/lacs-bleus-1.jpg,https://res.cloudinary.com/depzhocsd/image/upload/v1712345685/tourisme/lacs-bleus-2.jpg',
         NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'
  WHERE NOT EXISTS (SELECT 1 FROM circuits WHERE id = v_cir1);

  -- Circuit 1 - Day 1
  INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name, created_at)
  SELECT v_cday1, v_cir1, 1,
         'Lac de Bouhertma',
         'Randonnée autour du magnifique Lac de Bouhertma. Pique-nique en forêt et baignade dans le lac.',
         36.7500, 8.1120, 'Ain Draham', NOW() - INTERVAL '12 days'
  WHERE NOT EXISTS (SELECT 1 FROM circuit_days WHERE id = v_cday1);

  -- Circuit 1 - Program Item 1
  INSERT INTO circuit_program_items (id, circuit_day_id, title, category, start_time, end_time, price, is_included, is_required, transport_mode, emoji, duration_minutes, distance_km, created_at)
  SELECT v_prog1, v_cday1,
         'Randonnée Lac Bouhertma',
         'activite', '09:00'::time, '15:00'::time, 0, true, true, 'A pied', '🥾',
         360, 12, NOW() - INTERVAL '12 days'
  WHERE NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE id = v_prog1);

  RAISE NOTICE '✓ Circuit 1: Randonnée des Lacs Bleus';

  -- CIRCUIT 2: Séjour Yoga et Méditation à Dougga (draft)
  INSERT INTO circuits (id, author_id, author_type, title, description, status, base_price, duration_days, duration_nights, difficulty_level, region, currency, lat, lng, hebergement, images, created_at, updated_at)
  SELECT v_cir2, v_faker_owner, 'project_owner',
         'Séjour Yoga et Méditation à Dougga',
         'Retraite bien-être au cœur du site historique de Dougga. Sessions de yoga au lever du soleil, méditation guidée au milieu des ruines romaines.',
         'draft', 450.00, 3, 2, 'easy', 'Béja', 'TND',
         36.4233, 9.2183,
         '{"inclus": true, "type": "per_day", "accom_type": "chambre", "nb_unites": 1, "nb_lits": 1}'::jsonb,
         'https://res.cloudinary.com/depzhocsd/image/upload/v1712345686/tourisme/yoga-dougga-1.jpg',
         NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
  WHERE NOT EXISTS (SELECT 1 FROM circuits WHERE id = v_cir2);

  -- Circuit 2 - Day 1
  INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name, created_at)
  SELECT v_cday2, v_cir2, 1,
         'Yoga Matinal et Découverte',
         'Première journée dédiée à la pratique du yoga au lever du soleil et à la découverte du site archéologique.',
         36.4233, 9.2183, 'Dougga', NOW() - INTERVAL '5 days'
  WHERE NOT EXISTS (SELECT 1 FROM circuit_days WHERE id = v_cday2);

  -- Circuit 2 - Day 1 - Program 1: Yoga
  INSERT INTO circuit_program_items (id, circuit_day_id, title, category, start_time, end_time, price, is_included, is_required, transport_mode, emoji, duration_minutes, created_at)
  SELECT v_prog2, v_cday2,
         'Séance Yoga Dougga',
         'activite', '06:00'::time, '08:00'::time, 0, true, true, 'A pied', '🧘',
         120, NOW() - INTERVAL '5 days'
  WHERE NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE id = v_prog2);

  -- Circuit 2 - Day 1 - Program 2: Petit déjeuner
  INSERT INTO circuit_program_items (id, circuit_day_id, title, category, start_time, end_time, price, is_included, is_required, created_at)
  SELECT v_prog3, v_cday2,
         'Petit Déjeuner Bio',
         'restauration', '08:00'::time, '09:00'::time, 0, true, true, NOW() - INTERVAL '5 days'
  WHERE NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE id = v_prog3);

  -- Circuit 2 - Day 2
  INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name, created_at)
  SELECT v_cday3, v_cir2, 2,
         'Méditation et Patrimoine',
         'Journée consacrée à la méditation en pleine nature et à la visite guidée des temples romains.',
         36.4200, 9.2200, 'Dougga', NOW() - INTERVAL '5 days'
  WHERE NOT EXISTS (SELECT 1 FROM circuit_days WHERE id = v_cday3);

  -- Circuit 2 - Day 2 - Program 1: Méditation
  INSERT INTO circuit_program_items (id, circuit_day_id, title, category, start_time, end_time, price, is_included, is_required, emoji, duration_minutes, created_at)
  SELECT v_prog4, v_cday3,
         'Méditation Site Archéologique',
         'activite', '07:00'::time, '08:30'::time, 0, true, true, '🧘',
         90, NOW() - INTERVAL '5 days'
  WHERE NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE id = v_prog4);

  -- Circuit 2 - Day 2 - Program 2: Visite
  INSERT INTO circuit_program_items (id, circuit_day_id, title, category, start_time, end_time, price, is_included, is_required, transport_mode, emoji, duration_minutes, created_at)
  SELECT v_prog5, v_cday3,
         'Visite Guidée Dougga',
         'activite', '09:00'::time, '12:00'::time, 0, true, true, 'A pied', '🏛️',
         180, NOW() - INTERVAL '5 days'
  WHERE NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE id = v_prog5);

  RAISE NOTICE '✓ Circuit 2: Séjour Yoga Dougga';

  -- CIRCUIT 3: Découverte des Huiles Essentielles (pending)
  INSERT INTO circuits (id, author_id, author_type, title, description, status, base_price, duration_days, duration_nights, difficulty_level, region, currency, lat, lng, hebergement, images, created_at, updated_at)
  SELECT v_cir3, v_faker_owner, 'project_owner',
         'Découverte des Huiles Essentielles',
         'Circuit olfactif à travers les distilleries du Cap Bon. Découvrez les secrets de la fabrication des huiles essentielles de néroli, jasmin et bigaradier.',
         'pending', 180.00, 1, 0, 'easy', 'Nabeul', 'TND',
         36.6167, 10.8667,
         '{"inclus": false}'::jsonb,
         'https://res.cloudinary.com/depzhocsd/image/upload/v1712345687/tourisme/huiles-essentielles-1.jpg',
         NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'
  WHERE NOT EXISTS (SELECT 1 FROM circuits WHERE id = v_cir3);

  -- Circuit 3 - Day 1
  INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name, created_at)
  SELECT v_cday4, v_cir3, 1,
         'Route des Arômes du Cap Bon',
         'Visite des distilleries artisanales et atelier de création de parfum personnalisé.',
         36.6167, 10.8667, 'Nabeul', NOW() - INTERVAL '8 days'
  WHERE NOT EXISTS (SELECT 1 FROM circuit_days WHERE id = v_cday4);

  -- Circuit 3 - Day 1 - Program 1: Visite distillerie
  INSERT INTO circuit_program_items (id, circuit_day_id, title, category, start_time, end_time, price, is_included, is_required, transport_mode, emoji, duration_minutes, created_at)
  SELECT v_prog6, v_cday4,
         'Visite Distillerie Huiles Essentielles',
         'activite', '09:00'::time, '11:30'::time, 0, true, true, 'A pied', '🌿',
         150, NOW() - INTERVAL '8 days'
  WHERE NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE id = v_prog6);

  -- Circuit 3 - Day 1 - Program 2: Atelier création parfum
  INSERT INTO circuit_program_items (id, circuit_day_id, title, category, start_time, end_time, price, is_included, is_required, transport_mode, emoji, duration_minutes, created_at)
  SELECT v_prog7, v_cday4,
         'Atelier Création Parfum',
         'artisanat', '13:00'::time, '15:30'::time, 30, false, false, 'A pied', '🧪',
         150, NOW() - INTERVAL '8 days'
  WHERE NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE id = v_prog7);

  RAISE NOTICE '✓ Circuit 3: Huiles Essentielles';

  -- ==========================================================================
  -- SECTION 4: Publications for fakerbennoomen
  -- ==========================================================================

  INSERT INTO publications (id, author_id, type, title, description, status, tags, region, latitude, longitude, popularity_score, created_at, updated_at)
  SELECT v_pub1, v_faker_owner, 'experience',
         'Mon séjour inoubliable à Djerba',
         'Durant mon voyage à Djerba, j''ai découvert des plages magnifiques, une culture riche et des habitants accueillants. Je recommande la visite de Guellala et la dégustation de fruits de mer au port de Houmt Souk.',
         'published', 'djerba,plage,culture',
         'Djerba', 33.8750, 10.8650, 12,
         NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE id = v_pub1);

  INSERT INTO publications (id, author_id, type, title, description, status, tags, popularity_score, created_at, updated_at)
  SELECT v_pub2, v_faker_owner, 'article',
         'Guide des meilleurs éco-lodges en Tunisie',
         'Découvrez notre sélection des meilleurs hébergements écologiques en Tunisie : éco-lodges, gîtes ruraux, maisons d''hôtes bio. Des adresses authentiques pour un tourisme responsable.',
         'published', 'ecotourisme,hebergement,guide',
         25,
         NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE id = v_pub2);

  RAISE NOTICE '✓ Section 4: Publications';

  -- ==========================================================================
  -- SECTION 5: Reviews from multiple users (target_type = 'offer')
  -- ==========================================================================

  -- From f.akerbennoomen (eco_traveler) on Bungalow Forêt de Kroumirie
  INSERT INTO reviews (id, author_id, target_type, target_id, rating, comment, created_at, updated_at)
  SELECT gen_random_uuid(), v_faker_traveler, 'offer',
         'b1000000-0001-0000-0000-000000000001',
         4, 'Très beau bungalow au cœur de la forêt. Le calme et la beauté du lieu sont exceptionnels. Petit-déjeuner bio délicieux. Seul bémol : la connexion Wi-Fi est instable.',
         NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'
  WHERE NOT EXISTS (
    SELECT 1 FROM reviews
    WHERE author_id = v_faker_traveler
      AND target_type = 'offer'
      AND target_id = 'b1000000-0001-0000-0000-000000000001'
  );

  -- From f.akerbennoomen on Chambre Troglodyte Matmata
  INSERT INTO reviews (id, author_id, target_type, target_id, rating, comment, created_at, updated_at)
  SELECT gen_random_uuid(), v_faker_traveler, 'offer',
         'b1000000-0001-0000-0000-000000000002',
         5, 'Expérience unique ! Dormir dans une chambre troglodyte est incroyable. La fraîcheur naturelle est surprenante en plein été. Le dîner berbère était délicieux et l''accueil très chaleureux.',
         NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'
  WHERE NOT EXISTS (
    SELECT 1 FROM reviews
    WHERE author_id = v_faker_traveler
      AND target_type = 'offer'
      AND target_id = 'b1000000-0001-0000-0000-000000000002'
  );

  -- From fa.kerbennoomen (guide) on Séjour Éco-Lodge
  INSERT INTO reviews (id, author_id, target_type, target_id, rating, comment, created_at, updated_at)
  SELECT gen_random_uuid(), v_faker_guide, 'offer',
         'b1000000-0001-0000-0000-000000000003',
         4, 'Excellent séjour dans cet éco-lodge. Les randonnées guidées étaient très bien organisées et la cuisine locale est savoureuse. Je recommande pour les amoureux de la nature.',
         NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'
  WHERE NOT EXISTS (
    SELECT 1 FROM reviews
    WHERE author_id = v_faker_guide
      AND target_type = 'offer'
      AND target_id = 'b1000000-0001-0000-0000-000000000003'
  );

  -- From fakerbennoomen on Restaurant Le Dauphin Djerba
  INSERT INTO reviews (id, author_id, target_type, target_id, rating, comment, created_at, updated_at)
  SELECT gen_random_uuid(), v_faker_owner, 'offer',
         'a0000000-0001-4000-8000-000000000005',
         4, 'Excellent restaurant les pieds dans l eau. Les poissons sont frais et bien préparés. Service attentionné. Le prix est raisonnable pour la qualité.',
         NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'
  WHERE NOT EXISTS (
    SELECT 1 FROM reviews
    WHERE author_id = v_faker_owner
      AND target_type = 'offer'
      AND target_id = 'a0000000-0001-4000-8000-000000000005'
  );

  -- From fakerbennoomen on Randonnée Forêt des Kroumiries
  INSERT INTO reviews (id, author_id, target_type, target_id, rating, comment, created_at, updated_at)
  SELECT gen_random_uuid(), v_faker_owner, 'offer',
         'a0000000-0001-4000-8000-000000000006',
         5, 'Magnifique randonnée en forêt. Le guide naturaliste était très compétent et passionné. Les paysages étaient à couper le souffle. Pique-nique bio délicieux.',
         NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'
  WHERE NOT EXISTS (
    SELECT 1 FROM reviews
    WHERE author_id = v_faker_owner
      AND target_type = 'offer'
      AND target_id = 'a0000000-0001-4000-8000-000000000006'
  );

  RAISE NOTICE '✓ Section 5: Reviews on offers';

  -- ==========================================================================
  -- SECTION 6: Reviews for guide fa.kerbennoomen (target_type = 'guide')
  -- ==========================================================================

  -- From f.akerbennoomen
  INSERT INTO reviews (id, author_id, target_type, target_id, rating, comment, created_at, updated_at)
  SELECT gen_random_uuid(), v_faker_traveler, 'guide',
         v_faker_guide::text,
         5, 'Guide exceptionnel, très professionnel et sympathique. Il connaît parfaitement la région et nous a fait découvrir des endroits magnifiques. Je recommande vivement !',
         NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'
  WHERE NOT EXISTS (
    SELECT 1 FROM reviews
    WHERE author_id = v_faker_traveler
      AND target_type = 'guide'
      AND target_id = v_faker_guide::text
  );

  -- From fakerbennoomen
  INSERT INTO reviews (id, author_id, target_type, target_id, rating, comment, created_at, updated_at)
  SELECT gen_random_uuid(), v_faker_owner, 'guide',
         v_faker_guide::text,
         4, 'Bon guide, ponctuel et sympathique. La randonnée était bien organisée. Les explications sur la faune et la flore étaient très intéressantes.',
         NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
  WHERE NOT EXISTS (
    SELECT 1 FROM reviews
    WHERE author_id = v_faker_owner
      AND target_type = 'guide'
      AND target_id = v_faker_guide::text
  );

  RAISE NOTICE '✓ Section 6: Reviews for guide';

  -- ==========================================================================
  -- SECTION 7: Comments on publications (publication_comments)
  -- ==========================================================================

  -- From f.akerbennoomen on publication 1
  INSERT INTO publication_comments (id, publication_id, author_id, author_role, content, created_at)
  SELECT gen_random_uuid(), v_pub1, v_faker_traveler, 'eco_traveler',
         'Superbe article, merci pour le partage ! Djerba est vraiment une île magnifique, tu donnes envie d''y aller.',
         NOW() - INTERVAL '15 days'
  WHERE NOT EXISTS (
    SELECT 1 FROM publication_comments
    WHERE publication_id = v_pub1 AND author_id = v_faker_traveler
  );

  -- From fa.kerbennoomen on publication 1
  INSERT INTO publication_comments (id, publication_id, author_id, author_role, content, created_at)
  SELECT gen_random_uuid(), v_pub1, v_faker_guide, 'guide',
         'J''ai visité Djerba l''année dernière, c''était magnifique ! Les plages de Sidi Jmour sont à couper le souffle. Bel article !',
         NOW() - INTERVAL '14 days'
  WHERE NOT EXISTS (
    SELECT 1 FROM publication_comments
    WHERE publication_id = v_pub1 AND author_id = v_faker_guide
  );

  -- From f.akerbennoomen on publication 2
  INSERT INTO publication_comments (id, publication_id, author_id, author_role, content, created_at)
  SELECT gen_random_uuid(), v_pub2, v_faker_traveler, 'eco_traveler',
         'Très utile ce guide, j''ai réservé l''éco-lodge ! Merci pour ces bonnes adresses.',
         NOW() - INTERVAL '12 days'
  WHERE NOT EXISTS (
    SELECT 1 FROM publication_comments
    WHERE publication_id = v_pub2 AND author_id = v_faker_traveler
  );

  RAISE NOTICE '✓ Section 7: Comments on publications';

  -- ==========================================================================
  -- SECTION 8: Likes (publication_likes, item_likes)
  -- ==========================================================================

  -- From f.akerbennoomen: like on offer Bungalow (item_likes)
  INSERT INTO item_likes (id, target_type, target_id, user_id, user_role, created_at)
  SELECT gen_random_uuid(), 'offer',
         'b1000000-0001-0000-0000-000000000001'::uuid,
         v_faker_traveler, 'eco_traveler',
         NOW() - INTERVAL '14 days'
  WHERE NOT EXISTS (
    SELECT 1 FROM item_likes
    WHERE target_type = 'offer'
      AND target_id = 'b1000000-0001-0000-0000-000000000001'::uuid
      AND user_id = v_faker_traveler
  );

  -- From fakerbennoomen: like on publication 1 (publication_likes)
  INSERT INTO publication_likes (id, publication_id, user_id, user_role, created_at)
  SELECT gen_random_uuid(), v_pub1, v_faker_owner, 'project_owner', NOW() - INTERVAL '10 days'
  WHERE NOT EXISTS (
    SELECT 1 FROM publication_likes
    WHERE publication_id = v_pub1 AND user_id = v_faker_owner
  );

  RAISE NOTICE '✓ Section 8: Likes';

  -- ==========================================================================
  -- SECTION 9: Trip plans for f.akerbennoomen (eco_traveler)
  -- ==========================================================================

  -- Trip plan 1: Week-end Nature à Ain Draham (published)
  INSERT INTO trip_plans (id, eco_traveler_id, title, description, start_date, end_date, status, created_at, updated_at)
  SELECT v_tp1, v_faker_traveler,
         'Week-end Nature à Ain Draham',
         'Plan de 2 jours pour explorer les forêts d''Ain Draham et les lacs de montagne. Randonnée et détente.',
         '2026-09-15'::date, '2026-09-17'::date, 'published',
         NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
  WHERE NOT EXISTS (SELECT 1 FROM trip_plans WHERE id = v_tp1);

  -- Item 1: linked to circuit 1 day 1
  INSERT INTO trip_plan_items (id, trip_plan_id, circuit_id, day_number, sort_order, notes, created_at)
  SELECT v_tpi1, v_tp1, v_cir1, 1, 1,
         'Randonnée autour du Lac de Bouhertma',
         NOW() - INTERVAL '3 days'
  WHERE NOT EXISTS (SELECT 1 FROM trip_plan_items WHERE id = v_tpi1);

  -- Item 2: linked to existing circuit 11000000-...002 day 2
  INSERT INTO trip_plan_items (id, trip_plan_id, circuit_id, day_number, sort_order, notes, created_at)
  SELECT v_tpi2, v_tp1,
         '11000000-0001-0000-0000-000000000002'::uuid,
         2, 2,
         'Deuxième jour du circuit Djerba Authentique',
         NOW() - INTERVAL '3 days'
  WHERE NOT EXISTS (SELECT 1 FROM trip_plan_items WHERE id = v_tpi2);

  -- Trip plan 2: Road Trip Sud 2026 (draft)
  INSERT INTO trip_plans (id, eco_traveler_id, title, description, start_date, end_date, status, created_at, updated_at)
  SELECT v_tp2, v_faker_traveler,
         'Road Trip Sud 2026',
         'Plan de 7 jours pour explorer le Sud tunisien : désert, oasis, ksour et plages sauvages.',
         '2026-11-01'::date, '2026-11-07'::date, 'draft',
         NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
  WHERE NOT EXISTS (SELECT 1 FROM trip_plans WHERE id = v_tp2);

  -- Item 1: linked to circuit a5000000-...0f5
  INSERT INTO trip_plan_items (id, trip_plan_id, circuit_id, day_number, sort_order, created_at)
  SELECT v_tpi3, v_tp2,
         'a5000000-0001-4000-8000-0000000000f5'::uuid,
         1, 1, NOW() - INTERVAL '1 day'
  WHERE NOT EXISTS (SELECT 1 FROM trip_plan_items WHERE id = v_tpi3);

  RAISE NOTICE '✓ Section 9: Trip plans';

  -- ==========================================================================
  -- SECTION 10: Circuit reservations by f.akerbennoomen
  -- ==========================================================================

  -- Reservation on circuit 1: 2 participants, 640 TND
  INSERT INTO circuit_reservations (id, circuit_id, user_id, participants_count, base_total, options_total, final_total, status, created_at)
  SELECT gen_random_uuid(), v_cir1, v_faker_traveler,
         2, 640.00, 0, 640.00, 'pending',
         NOW() - INTERVAL '2 days'
  WHERE NOT EXISTS (
    SELECT 1 FROM circuit_reservations
    WHERE circuit_id = v_cir1 AND user_id = v_faker_traveler
  );

  -- Reservation on circuit 11000000-...002 (Djerba Authentique): 3 participants, 1260 TND
  INSERT INTO circuit_reservations (id, circuit_id, user_id, participants_count, base_total, options_total, final_total, status, created_at)
  SELECT gen_random_uuid(),
         '11000000-0001-0000-0000-000000000002'::uuid,
         v_faker_traveler,
         3, 1260.00, 0, 1260.00, 'confirmed',
         NOW() - INTERVAL '4 days'
  WHERE NOT EXISTS (
    SELECT 1 FROM circuit_reservations
    WHERE circuit_id = '11000000-0001-0000-0000-000000000002'::uuid
      AND user_id = v_faker_traveler
  );

  RAISE NOTICE '✓ Section 10: Circuit reservations';

  -- ==========================================================================
  -- SECTION 11: Guide offerings for fa.kerbennoomen
  -- ==========================================================================

  -- Offering 1: Randonnée Jebel Ressas
  INSERT INTO guide_offerings (id, guide_id, title, description, languages, pricing_unit, price, min_travelers, max_travelers, service_zone_type, lat, lng, radius_km, zone_governorate, displacement_allowed, displacement_max_km, status, confirmation_mode, created_at, updated_at)
  SELECT v_go1, v_faker_guide,
         'Randonnée Jebel Ressas',
         'Ascension du Jebel Ressas (795m) avec guide expérimenté. Vue panoramique sur Tunis et le golfe de Carthage. Pique-nique au sommet.',
         '["Arabe","Francais"]',
         'per_person', 45, 2, 8, 'zone',
         36.5830, 10.3330, 20, 'Ben Arous',
         true, 30, 'active', 'manual',
         NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'
  WHERE NOT EXISTS (SELECT 1 FROM guide_offerings WHERE id = v_go1);

  -- Price: Plein tarif 45 TND
  INSERT INTO guide_offering_prices (id, guide_offering_id, label, price, is_default)
  SELECT v_gop1, v_go1, 'Plein tarif', 45, true
  WHERE NOT EXISTS (SELECT 1 FROM guide_offering_prices WHERE id = v_gop1);

  -- Availability rule: weekly, weekends 08:00-16:00
  INSERT INTO guide_offering_availability_rules (id, guide_offering_id, availability_type, weekdays, start_time, end_time)
  SELECT gen_random_uuid(), v_go1, 'weekly',
         '["saturday","sunday"]',
         '08:00'::time, '16:00'::time
  WHERE NOT EXISTS (
    SELECT 1 FROM guide_offering_availability_rules
    WHERE guide_offering_id = v_go1
  );

  -- Offering 2: Visite Culturelle Carthage
  INSERT INTO guide_offerings (id, guide_id, title, description, languages, pricing_unit, price, min_travelers, max_travelers, service_zone_type, lat, lng, radius_km, displacement_allowed, displacement_max_km, status, confirmation_mode, created_at, updated_at)
  SELECT v_go2, v_faker_guide,
         'Visite Culturelle Carthage',
         'Découverte des sites archéologiques de Carthage et Sidi Bou Saïd. Parcours guidé à travers l''histoire punique, romaine et arabe.',
         '["Arabe","Francais","Anglais"]',
         'per_person', 35, 1, 12, 'point',
         36.8530, 10.3230, 5,
         true, 10, 'active', 'automatic',
         NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'
  WHERE NOT EXISTS (SELECT 1 FROM guide_offerings WHERE id = v_go2);

  -- Price: Plein tarif 35 TND
  INSERT INTO guide_offering_prices (id, guide_offering_id, label, price, is_default)
  SELECT v_gop2, v_go2, 'Plein tarif', 35, true
  WHERE NOT EXISTS (SELECT 1 FROM guide_offering_prices WHERE id = v_gop2);

  RAISE NOTICE '✓ Section 11: Guide offerings';

  -- ==========================================================================
  -- SECTION 12: Notifications
  -- ==========================================================================

  -- For fakerbennoomen: offer rejected
  INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at)
  SELECT gen_random_uuid(), v_faker_owner, 'offer_rejected',
         'Offre refusée',
         'Votre offre "Parapente au Cap Bon" a été refusée. Motif : Assurance non fournie.',
         '/offers/' || v_offer2::text, false,
         NOW() - INTERVAL '5 days'
  WHERE NOT EXISTS (
    SELECT 1 FROM notifications
    WHERE user_id = v_faker_owner
      AND type = 'offer_rejected'
      AND title = 'Offre refusée'
  );

  -- For f.akerbennoomen: welcome
  INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at)
  SELECT gen_random_uuid(), v_faker_traveler, 'welcome',
         'Bienvenue',
         'Bienvenue sur Éco-Voyage ! Découvrez des circuits et offres écotouristiques à travers toute la Tunisie.',
         '/explorer', true,
         NOW() - INTERVAL '30 days'
  WHERE NOT EXISTS (
    SELECT 1 FROM notifications
    WHERE user_id = v_faker_traveler
      AND type = 'welcome'
  );

  -- For fa.kerbennoomen: guide approved
  INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at)
  SELECT gen_random_uuid(), v_faker_guide, 'guide_approved',
         'Profil guide approuvé',
         'Votre profil guide a été approuvé. Vous pouvez maintenant proposer vos services sur la plateforme.',
         '/guide/dashboard', true,
         NOW() - INTERVAL '25 days'
  WHERE NOT EXISTS (
    SELECT 1 FROM notifications
    WHERE user_id = v_faker_guide
      AND type = 'guide_approved'
  );

  RAISE NOTICE '✓ Section 12: Notifications';

  -- ==========================================================================
  -- SECTION 13: Update images for new offers (Cloudinary URLs)
  -- ==========================================================================
  -- Already set during insert above.

  -- ==========================================================================
  -- SUMMARY
  -- ==========================================================================
  RAISE NOTICE '====================================================';
  RAISE NOTICE '✅ Seed Faker Full terminé avec succès !';
  RAISE NOTICE '   User IDs:';
  RAISE NOTICE '   - fakerbennoomen@gmail.com (project_owner): %', v_faker_owner;
  RAISE NOTICE '   - f.akerbennoomen@gmail.com (eco_traveler): %', v_faker_traveler;
  RAISE NOTICE '   - fa.kerbennoomen@gmail.com (guide):        %', v_faker_guide;
  RAISE NOTICE '====================================================';

END $$;

COMMIT;
