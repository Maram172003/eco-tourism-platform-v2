-- ============================================================================
-- EcoVoyage — Seed complet (version adaptée schéma actuel)
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. USERS
-- ============================================================================
INSERT INTO users (id, email, password, auth_method, role, status, email_verified_at, created_at, updated_at)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'fakerbennomen-fcomp@gmail.com',  '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'project',       'active',  NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000002', 'f.akerbennomen-fcomp@gmail.com', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'project',       'active',  NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000003', 'fa.kerbennomen-fcomp@gmail.com', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'guide',         'active',  NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000010', 'admin-fcomp@ecovoyage.tn',       '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'admin',         'active',  NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000011', 'amir.guide-fcomp@ecovoyage.tn',   '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'guide',         'active',  NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000012', 'leila.guide-fcomp@ecovoyage.tn',  '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'guide',         'pending', NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000013', 'sami-owner-fcomp@ecovoyage.tn',  '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'project',       'active',  NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000014', 'ines.voyageur-fcomp@ecovoyage.tn', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'eco_traveler',  'active',  NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000015', 'karim.voyageur-fcomp@ecovoyage.tn','$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'eco_traveler',  'active',  NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 2. GUIDES
-- ============================================================================
INSERT INTO guides (user_id, full_name, guide_type, bio, country, zone, specialties, languages_spoken, years_experience, status, profile_completion, is_onboarded, sustainability_score, created_at, updated_at)
VALUES
  ('f0000000-0000-0000-0000-000000000003', 'Faker Bennomen', 'guide_montagne', 'Guide passionné de la montagne et des randonnées', 'Tunisie', 'Bizerte', ARRAY['Randonnée','Trekking','VTT'], ARRAY['Arabe','Français','Anglais'], 8, 'active', 100, true, 85, NOW()),
  ('f0000000-0000-0000-0000-000000000011', 'Amir Mansouri',   'guide_nature',    'Spécialiste en écotourisme et observation', 'Tunisie', 'Djerba', ARRAY['Observation','Photographie','Kayak'], ARRAY['Arabe','Français','Anglais','Italien'], 12, 'active', 100, true, 92, NOW()),
  ('f0000000-0000-0000-0000-000000000012', 'Leila Ben Ali',   'guide_culture',   'Guide culturelle des médinas et sites historiques', 'Tunisie', 'Tunis', ARRAY['Culture','Gastronomie','Artisanat'], ARRAY['Arabe','Français','Anglais','Allemand'], 5, 'pending', 60, false, NULL, NOW())
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- 3. GUIDE OFFERINGS
-- ============================================================================
INSERT INTO guide_offerings (id, guide_id, title, description, languages, price, pricing_unit, min_travelers, max_travelers, service_zone_type, lat, lng, radius_km, zone_governorate, displacement_allowed, displacement_max_km, status, confirmation_mode, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000011', 'Randonnée guidée à Djerba', 'Découvrez les paysages uniques de Djerba avec un guide local', ARRAY['Arabe','Français','Anglais'], 75, 'per_person', 2, 12, 'point', 33.875, 10.865, 30, 'Djerba', true, 50, 'active', 'automatic', NOW()),
  (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000003', 'Trekking Monts de Bizerte', 'Randonnée en montagne avec nuit en refuge', ARRAY['Arabe','Français'], 120, 'per_person', 3, 10, 'zone', 37.274, 9.872, 25, 'Bizerte', true, 80, 'active', 'manual', NOW()),
  (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000011', 'Kayak aux îles Kerkennah', 'Excursion en kayak au coucher du soleil', ARRAY['Arabe','Français','Anglais','Italien'], 90, 'per_person', 2, 8, 'point', 34.711, 11.184, 20, 'Sfax', true, 40, 'active', 'automatic', NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. OFFERS
-- ============================================================================
INSERT INTO offers (id, author_id, author_type, category_id, title, description, price, offer_type, images, region, address, latitude, longitude, location_type, status, confirmation_mode, created_at, updated_at)
VALUES
  ('f1000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'project_owner', 'a327acf4-6d42-4d5d-8ebc-8dfdc02c75de', 'Éco-gîte Djerba', 'Gîte écologique avec chambres, dortoir et espace tente', 150, 'accommodation', ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'], 'Djerba', 'Houmt Souk, Djerba', 33.861, 10.942, 'fixed', 'approved', 'automatic', NOW()),
  ('f1000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'project_owner', '1a75c8ad-47b6-4661-87b1-eb5afdb3e397', 'Navette Djerba - Tunis', 'Service de navette confortable', 250, 'transport', ARRAY['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'], 'Djerba', 'Aéroport Djerba-Zarzis', 33.875, 10.775, 'fixed', 'pending', 'manual', NOW()),
  ('f1000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 'project_owner', 'd8835649-c729-4625-9f46-820cc02a9d72', 'Atelier poterie traditionnelle', 'Apprenez la poterie avec des artisans locaux', 60, 'workshop', ARRAY['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800'], 'Nabeul', 'Nabeul Médina', 36.452, 10.735, 'fixed', 'rejected', 'automatic', NOW()),
  ('f1000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000013', 'project_owner', 'f8509a3c-747f-475b-b4a0-40a32c765bfb', 'Randonnée Jebel Zaghouan', 'Randonnée guidée au sommet', 45, 'activity', ARRAY['https://images.unsplash.com/photo-1551632811-561732d1e306?w=800'], 'Zaghouan', 'Jebel Zaghouan', 36.384, 10.127, 'fixed', 'approved', 'automatic', NOW()),
  ('f1000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000002', 'project_owner', 'd8835649-c729-4625-9f46-820cc02a9d72', 'Tapis traditionnel Kairouanais', 'Atelier de tissage de tapis', 120, 'workshop', ARRAY['https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800'], 'Kairouan', 'Médina de Kairouan', 35.678, 10.096, 'fixed', 'approved', 'automatic', NOW()),
  ('f1000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000002', 'project_owner', '4269fcff-40fe-478e-9214-17b2fcb01415', 'Couscous traditionnel', 'Dégustation de couscous', 35, 'meal', ARRAY['https://images.unsplash.com/photo-1543352634-9f23070d59d9?w=800'], 'Kairouan', 'Maison d hôte Kairouan', 35.68, 10.095, 'fixed', 'pending', 'automatic', NOW()),
  ('f1000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000011', 'guide', 'activity', 'Excursion Kerkennah', 'Découverte des îles Kerkennah en bateau + kayak', 150, 'activity', ARRAY['https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800'], 'Sfax', 33.875, 10.942, 'fixed', 'approved', 'automatic', NOW()),
  ('f1000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000002', 'project_owner', 'f8509a3c-747f-475b-b4a0-40a32c765bfb', 'Kayak Djerba Plage', 'Balade en kayak le long des côtes de Djerba', 55, 'activity', ARRAY['https://images.unsplash.com/photo-1551703595-39ec2b328497?w=800'], 'Djerba', 33.875, 10.942, 'fixed', 'approved', 'automatic', NOW())
ON CONFLICT (id) DO NOTHING;

-- Offer items
INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status, created_at, updated_at)
VALUES
  ('f2000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'Chambre double éco', 'Chambre avec vue sur le jardin', 'room', '{"room_sub_type":"double","bed_count":2}', 'active', NOW()),
  ('f2000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000001', 'Dortoir 4 lits', 'Dortoir partagé style auberge', 'bed', '{"bed_count":4}', 'active', NOW()),
  ('f2000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000001', 'Emplacement tente', 'Espace pour tente 4 personnes', 'camping_space', '{"tent_capacity":4}', 'active', NOW()),
  ('f2000000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000002', 'Van 8 places', 'Van climatisé 8 places', 'transport_service', '{"vehicle_type":"van","capacity":8,"ac":true}', 'active', NOW()),
  ('f2000000-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000003', 'Atelier 2h', 'Initiation à la poterie', 'workshop', '{"duration_minutes":120,"max_participants":8}', 'active', NOW()),
  ('f2000000-0000-0000-0000-000000000006', 'f1000000-0000-0000-0000-000000000004', 'Randonnée demi-journée', 'Randonnée de 4h avec guide', 'activity', '{"duration_minutes":240,"difficulty":"moderate","max_participants":15}', 'active', NOW()),
  ('f2000000-0000-0000-0000-000000000007', 'f1000000-0000-0000-0000-000000000005', 'Atelier tissage 3h', 'Initiation au tissage traditionnel', 'workshop', '{"duration_minutes":180,"max_participants":6}', 'active', NOW()),
  ('f2000000-0000-0000-0000-000000000008', 'f1000000-0000-0000-0000-000000000006', 'Menu couscous', 'Couscous + dessert + thé', 'meal', '{"meal_type":"lunch","serves":1}', 'active', NOW())
ON CONFLICT (id) DO NOTHING;

-- Offer item prices
INSERT INTO offer_item_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default, status)
VALUES
  (gen_random_uuid(), 'f2000000-0000-0000-0000-000000000001', 'Nuitée standard', 80, 'TND', 'per_room_per_night', true, 'active'),
  (gen_random_uuid(), 'f2000000-0000-0000-0000-000000000002', 'Lit dortoir', 25, 'TND', 'per_bed', true, 'active'),
  (gen_random_uuid(), 'f2000000-0000-0000-0000-000000000004', 'Trajet simple', 250, 'TND', 'per_vehicle', true, 'active'),
  (gen_random_uuid(), 'f2000000-0000-0000-0000-000000000006', 'Adulte', 45, 'TND', 'per_person', true, 'active'),
  (gen_random_uuid(), 'f2000000-0000-0000-0000-000000000007', 'Par personne', 120, 'TND', 'per_person', true, 'active'),
  (gen_random_uuid(), 'f2000000-0000-0000-0000-000000000008', 'Par personne', 35, 'TND', 'per_person', true, 'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. CIRCUITS
-- ============================================================================
INSERT INTO circuits (id, author_id, author_type, title, description, duration_days, duration_nights, region, base_price, currency, max_participants, difficulty_level, status, lat, lng, address, cover_image, images, hebergement, availability, created_at, updated_at)
VALUES
  ('f3000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'project_owner', 'Circuit Djerba & Kerkennah', 'Un circuit de 5 jours pour découvrir les îles du Sud', 5, 4, 'Djerba', 1200, 'TND', 12, 'easy', 'approved', 33.875, 10.860, 'Houmt Souk, Djerba', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'], '{"inclus":true,"type":"same","accom_type":"chambre"}'::jsonb, '{"mode":"specific"}'::jsonb, NOW(), NOW()),
  ('f3000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002', 'project_owner', 'Circuit Nord Tunisie', 'Découverte du Nord entre médinas et montagnes', 3, 2, 'Tunis', 800, 'TND', 10, 'moderate', 'approved', 36.806, 10.181, 'Tunis Centre', 'https://images.unsplash.com/photo-1590075766080-4d3264ba7cb9?w=800', ARRAY['https://images.unsplash.com/photo-1590075766080-4d3264ba7cb9?w=800'], '{"inclus":true,"type":"per_day","accom_type":"dortoir"}'::jsonb, '{"mode":"weekly"}'::jsonb, NOW(), NOW()),
  ('f3000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 'project_owner', 'Circuit Sud : Tozeur', '3 jours dans le désert', 3, 2, 'Tozeur', 600, 'TND', 12, 'hard', 'pending', 34.433, 8.116, 'Tozeur Centre', NULL, ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'], '{"inclus":true,"type":"same","accom_type":"tente"}'::jsonb, '{"mode":"season"}'::jsonb, NOW(), NOW()),
  ('f3000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000013', 'project_owner', 'Circuit Culturel Kairouan', 'Découverte de la médina et des ateliers artisanaux', 2, 1, 'Kairouan', 350, 'TND', 12, 'easy', 'approved', 35.678, 10.096, 'Kairouan Médina', 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800', ARRAY['https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800'], '{"inclus":false}'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Circuit days
INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name, created_at)
VALUES
  (gen_random_uuid(), 'f3000000-0000-0000-0000-000000000001', 1, 'Arrivée à Djerba', 'Installation à l éco-gîte', 33.875, 10.860, 'Houmt Souk', NOW()),
  (gen_random_uuid(), 'f3000000-0000-0000-0000-000000000001', 2, 'Exploration du Sud', 'Visite et balade', 33.850, 10.880, 'Midoun', NOW()),
  (gen_random_uuid(), 'f3000000-0000-0000-0000-000000000001', 3, 'Excursion Kerkennah', 'Traversée en bateau', 34.700, 11.200, 'Kerkennah', NOW()),
  (gen_random_uuid(), 'f3000000-0000-0000-0000-000000000002', 1, 'Arrivée à Tunis', 'Visite de la médina', 36.800, 10.180, 'Tunis', NOW()),
  (gen_random_uuid(), 'f3000000-0000-0000-0000-000000000002', 2, 'Journée Bizerte', 'Randonnée et plage', 37.274, 9.872, 'Bizerte', NOW())
ON CONFLICT DO NOTHING;

COMMIT;

\echo '✅ Seed comprehensive terminé avec succès !';