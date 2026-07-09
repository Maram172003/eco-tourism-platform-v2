-- ============================================================================
-- EcoVoyage — Script de seed avec données réalistes tunisiennes
-- ============================================================================
-- IMPORTANT : Ce script ne touche PAS la table "users".
--   Les utilisateurs doivent déjà exister (créés via l'app ou un seed séparé).
--   Remplacez les UUIDs usr_* ci-dessous par les vrais IDs de vos utilisateurs.
--
-- Exécution via Docker :
--   docker exec -i tourisme-db-1 psql -U marammejri -d tourism_db < scripts/seed.sql
--
-- Exécution directe :
--   psql -h localhost -p 5433 -U marammejri -d tourism_db -f scripts/seed.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 0. Variables : remplacez ces UUIDs par les vrais IDs de vos utilisateurs
-- ============================================================================
-- Astuce : récupérez-les avec :
--   SELECT id, email, role FROM users;

-- Utilisez DO $$ ... $$ pour déclarer des variables PL/pgSQL
DO $$
DECLARE
  -- ── Vrais UUIDs de vos utilisateurs ──
  v_admin_id       UUID := 'faf06ea0-3c4a-4cff-b180-5ff4bedab682';
  v_guide1_id      UUID := '87a38946-9a54-4bb4-be4a-887be312af15';
  v_guide2_id      UUID := '6fb2d1e7-39db-4152-b9b5-5b440f551cc9';
  v_owner1_id      UUID := '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e';
  v_owner2_id      UUID := '8148d448-9c88-4aa3-b2f1-7d71bc112f12';
  v_owner3_id      UUID := '3f8cb3e8-b8d1-4d27-a9ff-1b6699079b9f';
  v_traveler1_id   UUID := '7b83e87d-276d-4d89-bb00-ab8ea1243a14';
  v_traveler2_id   UUID := 'a602737a-b07d-4a41-b9c3-cdf1be17036a';
  v_traveler3_id   UUID := 'b09808ee-30a9-4089-bbf7-698e73004ef4';
  v_traveler4_id   UUID := '90b4c5bf-4a47-4737-b033-f7385e22a2e6';

  -- ── UUIDs générés pour les entités seedées ──
  -- Offer Categories (vrais IDs de la table offer_categories)
  v_cat_eco_tour    UUID := '450c9c0b-5a94-4372-8f84-6c548eb4ebce';
  v_cat_accom       UUID := 'a327acf4-6d42-4d5d-8ebc-8dfdc02c75de';
  v_cat_activity    UUID := 'f8509a3c-747f-475b-b4a0-40a32c765bfb';
  v_cat_restaurant  UUID := '4269fcff-40fe-478e-9214-17b2fcb01415';
  v_cat_craft       UUID := 'd8835649-c729-4625-9f46-820cc02a9d72';
  v_cat_workshop    UUID := '45dce784-1fdf-4619-9424-c04be2f62cdd';
  v_cat_transfer    UUID := '1a75c8ad-47b6-4661-87b1-eb5afdb3e397';
  v_cat_sejour      UUID := '339fb32c-58c0-4979-9bbf-e093a178ef57';
  v_cat_circuit     UUID := '74b459cf-8c7a-496e-941d-5f0cdd7356db';
  v_cat_other       UUID := 'cba60e4a-b070-426a-a7ba-0969b662bc69';

  -- Projects
  v_proj1  UUID := 'b1a2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
  v_proj2  UUID := 'b2a2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5e';
  v_proj3  UUID := 'b3a2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5f';
  v_proj4  UUID := 'b4a2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c60';
  v_proj5  UUID := 'b5a2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c61';
  v_proj6  UUID := 'b6a2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c62';

  -- Offers
  v_off1  UUID := 'b1000000-0001-0000-0000-000000000001';
  v_off2  UUID := 'b1000000-0001-0000-0000-000000000002';
  v_off3  UUID := 'b1000000-0001-0000-0000-000000000003';
  v_off4  UUID := 'b1000000-0001-0000-0000-000000000004';
  v_off5  UUID := 'b1000000-0001-0000-0000-000000000005';
  v_off6  UUID := 'b1000000-0001-0000-0000-000000000006';
  v_off7  UUID := 'b1000000-0001-0000-0000-000000000007';
  v_off8  UUID := 'b1000000-0001-0000-0000-000000000008';
  v_off9  UUID := 'b1000000-0001-0000-0000-000000000009';
  v_off10 UUID := 'b1000000-0001-0000-0000-000000000010';
  v_off11 UUID := 'b1000000-0001-0000-0000-000000000011';
  v_off12 UUID := 'b1000000-0001-0000-0000-000000000012';

  -- Offer Items
  v_item1  UUID := 'd1000000-0001-0000-0000-000000000001';
  v_item2  UUID := 'd1000000-0001-0000-0000-000000000002';
  v_item3  UUID := 'd1000000-0001-0000-0000-000000000003';
  v_item4  UUID := 'd1000000-0001-0000-0000-000000000004';
  v_item5  UUID := 'd1000000-0001-0000-0000-000000000005';
  v_item6  UUID := 'd1000000-0001-0000-0000-000000000006';
  v_item7  UUID := 'd1000000-0001-0000-0000-000000000007';
  v_item8  UUID := 'd1000000-0001-0000-0000-000000000008';
  v_item9  UUID := 'd1000000-0001-0000-0000-000000000009';
  v_item10 UUID := 'd1000000-0001-0000-0000-000000000010';
  v_item11 UUID := 'd1000000-0001-0000-0000-000000000011';
  v_item12 UUID := 'd1000000-0001-0000-0000-000000000012';
  v_item13 UUID := 'd1000000-0001-0000-0000-000000000013';
  v_item14 UUID := 'd1000000-0001-0000-0000-000000000014';

  -- Offer Item Prices
  v_price1  UUID := 'e1000000-0001-0000-0000-000000000001';
  v_price2  UUID := 'e1000000-0001-0000-0000-000000000002';
  v_price3  UUID := 'e1000000-0001-0000-0000-000000000003';
  v_price4  UUID := 'e1000000-0001-0000-0000-000000000004';
  v_price5  UUID := 'e1000000-0001-0000-0000-000000000005';
  v_price6  UUID := 'e1000000-0001-0000-0000-000000000006';
  v_price7  UUID := 'e1000000-0001-0000-0000-000000000007';
  v_price8  UUID := 'e1000000-0001-0000-0000-000000000008';
  v_price9  UUID := 'e1000000-0001-0000-0000-000000000009';
  v_price10 UUID := 'e1000000-0001-0000-0000-000000000010';
  v_price11 UUID := 'e1000000-0001-0000-0000-000000000011';
  v_price12 UUID := 'e1000000-0001-0000-0000-000000000012';
  v_price13 UUID := 'e1000000-0001-0000-0000-000000000013';
  v_price14 UUID := 'e1000000-0001-0000-0000-000000000014';
  v_price15 UUID := 'e1000000-0001-0000-0000-000000000015';
  v_price16 UUID := 'e1000000-0001-0000-0000-000000000016';

  -- Offer Item Sessions
  v_sess1  UUID := 'f1000000-0001-0000-0000-000000000001';
  v_sess2  UUID := 'f1000000-0001-0000-0000-000000000002';
  v_sess3  UUID := 'f1000000-0001-0000-0000-000000000003';
  v_sess4  UUID := 'f1000000-0001-0000-0000-000000000004';
  v_sess5  UUID := 'f1000000-0001-0000-0000-000000000005';
  v_sess6  UUID := 'f1000000-0001-0000-0000-000000000006';
  v_sess7  UUID := 'f1000000-0001-0000-0000-000000000007';
  v_sess8  UUID := 'f1000000-0001-0000-0000-000000000008';
  v_sess9  UUID := 'f1000000-0001-0000-0000-000000000009';

  -- Circuits
  v_cir1  UUID := '11000000-0001-0000-0000-000000000001';
  v_cir2  UUID := '11000000-0001-0000-0000-000000000002';
  v_cir3  UUID := '11000000-0001-0000-0000-000000000003';
  v_cir4  UUID := '11000000-0001-0000-0000-000000000004';
  v_cir5  UUID := '11000000-0001-0000-0000-000000000005';
  v_cir6  UUID := '11000000-0001-0000-0000-000000000006';

  -- Circuit Days
  v_cday1  UUID := '12000000-0001-0000-0000-000000000001';
  v_cday2  UUID := '12000000-0001-0000-0000-000000000002';
  v_cday3  UUID := '12000000-0001-0000-0000-000000000003';
  v_cday4  UUID := '12000000-0001-0000-0000-000000000004';
  v_cday5  UUID := '12000000-0001-0000-0000-000000000005';
  v_cday6  UUID := '12000000-0001-0000-0000-000000000006';
  v_cday7  UUID := '12000000-0001-0000-0000-000000000007';
  v_cday8  UUID := '12000000-0001-0000-0000-000000000008';
  v_cday9  UUID := '12000000-0001-0000-0000-000000000009';
  v_cday10 UUID := '12000000-0001-0000-0000-000000000010';
  v_cday11 UUID := '12000000-0001-0000-0000-000000000011';
  v_cday12 UUID := '12000000-0001-0000-0000-000000000012';
  v_cday13 UUID := '12000000-0001-0000-0000-000000000013';
  v_cday14 UUID := '12000000-0001-0000-0000-000000000014';
  v_cday15 UUID := '12000000-0001-0000-0000-000000000015';
  v_cday16 UUID := '12000000-0001-0000-0000-000000000016';
  v_cday17 UUID := '12000000-0001-0000-0000-000000000017';
  v_cday18 UUID := '12000000-0001-0000-0000-000000000018';
  v_cday19 UUID := '12000000-0001-0000-0000-000000000019';

  -- Circuit Program Items
  v_cprog1  UUID := '13000000-0001-0000-0000-000000000001';
  v_cprog2  UUID := '13000000-0001-0000-0000-000000000002';
  v_cprog3  UUID := '13000000-0001-0000-0000-000000000003';
  v_cprog4  UUID := '13000000-0001-0000-0000-000000000004';
  v_cprog5  UUID := '13000000-0001-0000-0000-000000000005';
  v_cprog6  UUID := '13000000-0001-0000-0000-000000000006';
  v_cprog7  UUID := '13000000-0001-0000-0000-000000000007';
  v_cprog8  UUID := '13000000-0001-0000-0000-000000000008';
  v_cprog9  UUID := '13000000-0001-0000-0000-000000000009';
  v_cprog10 UUID := '13000000-0001-0000-0000-000000000010';
  v_cprog11 UUID := '13000000-0001-0000-0000-000000000011';
  v_cprog12 UUID := '13000000-0001-0000-0000-000000000012';
  v_cprog13 UUID := '13000000-0001-0000-0000-000000000013';
  v_cprog14 UUID := '13000000-0001-0000-0000-000000000014';
  v_cprog15 UUID := '13000000-0001-0000-0000-000000000015';
  v_cprog16 UUID := '13000000-0001-0000-0000-000000000016';
  v_cprog17 UUID := '13000000-0001-0000-0000-000000000017';
  v_cprog18 UUID := '13000000-0001-0000-0000-000000000018';
  v_cprog19 UUID := '13000000-0001-0000-0000-000000000019';
  v_cprog20 UUID := '13000000-0001-0000-0000-000000000020';

  -- Circuit Options
  v_copt1  UUID := '14000000-0001-0000-0000-000000000001';
  v_copt2  UUID := '14000000-0001-0000-0000-000000000002';
  v_copt3  UUID := '14000000-0001-0000-0000-000000000003';
  v_copt4  UUID := '14000000-0001-0000-0000-000000000004';
  v_copt5  UUID := '14000000-0001-0000-0000-000000000005';
  v_copt6  UUID := '14000000-0001-0000-0000-000000000006';

  -- Bookings
  v_bk1  UUID := '15000000-0001-0000-0000-000000000001';
  v_bk2  UUID := '15000000-0001-0000-0000-000000000002';
  v_bk3  UUID := '15000000-0001-0000-0000-000000000003';
  v_bk4  UUID := '15000000-0001-0000-0000-000000000004';
  v_bk5  UUID := '15000000-0001-0000-0000-000000000005';
  v_bk6  UUID := '15000000-0001-0000-0000-000000000006';
  v_bk7  UUID := '15000000-0001-0000-0000-000000000007';
  v_bk8  UUID := '15000000-0001-0000-0000-000000000008';

  -- Booking Participants
  v_bp1  UUID := '16000000-0001-0000-0000-000000000001';
  v_bp2  UUID := '16000000-0001-0000-0000-000000000002';
  v_bp3  UUID := '16000000-0001-0000-0000-000000000003';
  v_bp4  UUID := '16000000-0001-0000-0000-000000000004';
  v_bp5  UUID := '16000000-0001-0000-0000-000000000005';
  v_bp6  UUID := '16000000-0001-0000-0000-000000000006';
  v_bp7  UUID := '16000000-0001-0000-0000-000000000007';
  v_bp8  UUID := '16000000-0001-0000-0000-000000000008';
  v_bp9  UUID := '16000000-0001-0000-0000-000000000009';
  v_bp10 UUID := '16000000-0001-0000-0000-000000000010';

  -- Circuit Reservations
  v_cres1  UUID := '17000000-0001-0000-0000-000000000001';
  v_cres2  UUID := '17000000-0001-0000-0000-000000000002';
  v_cres3  UUID := '17000000-0001-0000-0000-000000000003';
  v_cres4  UUID := '17000000-0001-0000-0000-000000000004';
  v_cres5  UUID := '17000000-0001-0000-0000-000000000005';
  v_cres6  UUID := '17000000-0001-0000-0000-000000000006';

  -- Notifications
  v_notif1  UUID := '18000000-0001-0000-0000-000000000001';
  v_notif2  UUID := '18000000-0001-0000-0000-000000000002';
  v_notif3  UUID := '18000000-0001-0000-0000-000000000003';
  v_notif4  UUID := '18000000-0001-0000-0000-000000000004';
  v_notif5  UUID := '18000000-0001-0000-0000-000000000005';
  v_notif6  UUID := '18000000-0001-0000-0000-000000000006';
  v_notif7  UUID := '18000000-0001-0000-0000-000000000007';
  v_notif8  UUID := '18000000-0001-0000-0000-000000000008';
  v_notif9  UUID := '18000000-0001-0000-0000-000000000009';

  -- Trip Plans
  v_tp1  UUID := '19000000-0001-0000-0000-000000000001';
  v_tp2  UUID := '19000000-0001-0000-0000-000000000002';
  v_tp3  UUID := '19000000-0001-0000-0000-000000000003';

  -- Trip Plan Items
  v_tpi1  UUID := '1a000000-0001-0000-0000-000000000001';
  v_tpi2  UUID := '1a000000-0001-0000-0000-000000000002';
  v_tpi3  UUID := '1a000000-0001-0000-0000-000000000003';
  v_tpi4  UUID := '1a000000-0001-0000-0000-000000000004';
  v_tpi5  UUID := '1a000000-0001-0000-0000-000000000005';
  v_tpi6  UUID := '1a000000-0001-0000-0000-000000000006';

BEGIN

-- ============================================================================
-- 1. OFFER CATEGORIES (10 catégories fixes — ON CONFLICT DO NOTHING)
-- ============================================================================
INSERT INTO offer_categories (id, slug, label, icon, sort_order) VALUES
  (v_cat_eco_tour,   'eco_tour',      'Éco-Tour',       'eco',    1),
  (v_cat_accom,      'accommodation', 'Hébergement',    'house',  2),
  (v_cat_activity,   'activity',      'Activité',       'target', 3),
  (v_cat_restaurant, 'restaurant',    'Restauration',   'food',   4),
  (v_cat_craft,      'craft',         'Artisanat',      'craft',  5),
  (v_cat_workshop,   'workshop',      'Atelier',        'tools',  6),
  (v_cat_transfer,   'transfer',      'Transfert',      'van',    7),
  (v_cat_sejour,     'sejour',        'Séjour',         'stay',   8),
  (v_cat_circuit,    'circuit',       'Circuit',        'route',  9),
  (v_cat_other,      'other',         'Autre',          'other', 10)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 2. GUIDES (profils guide liés aux users existants)
-- ============================================================================
INSERT INTO guides (user_id, full_name, guide_type, bio, country, language, zone, specialties, languages_spoken, years_experience, status, profile_completion, is_onboarded) VALUES
  (v_guide1_id, 'Ali Ben Salah',    'professionnel', 'Guide certifié spécialisé dans les randonnées en montagne et le désert tunisien. 8 ans d''expérience dans le Sahara et la Kroumirie.',                      'Tunisie', 'fr', 'Sud Tunisien',  'Randonnée,Désert,Trekking',          'Arabe,Français,Anglais',    8, 'active', 90, true),
  (v_guide2_id, 'Fatma Chaabane',   'local',         'Guide locale passionnée par l''histoire de Djerba et la culture berbère. Originaire de Houmt Souk, je partage les trésors cachés de mon île.',             'Tunisie', 'fr', 'Djerba',        'Culture,Histoire,Gastronomie',       'Arabe,Français,Allemand',   5, 'active', 85, true)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- 3. PROJECT OWNERS (profils porteur de projet)
-- ============================================================================
INSERT INTO project_owners (user_id, full_name, bio, country, language, organization, position, phone, profile_completion, is_onboarded) VALUES
  (v_owner1_id, 'Samir Kroumirie',   'Fondateur d''un éco-lodge au cœur de la forêt de chênes-lièges d''Ain Draham. Engagement fort pour la préservation de la biodiversité.',       'Tunisie', 'fr', 'Éco-Lodge Kroumirie',          'Fondateur',                '+216 98 123 456', 95, true),
  (v_owner2_id, 'Nadia Djerbi',      'Gérante d''une coopérative artisanale à Djerba. Promotion du tissage traditionnel et de la poterie de Guellala.',                              'Tunisie', 'fr', 'Coopérative Art Djerba',       'Directrice Générale',      '+216 97 654 321', 88, true)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- 4. ECO TRAVELERS (profils éco-voyageur)
-- ============================================================================
INSERT INTO eco_travelers (user_id, full_name, bio, country, language, traveler_types, motivations, sustainability_values, landscapes, travel_styles, profile_completion, is_onboarded) VALUES
  (v_traveler1_id, 'Maram Mejri',      'Passionnée de nature et de randonnées en Tunisie. J''adore découvrir les oasis et les villages berbères.',  'Tunisie', 'fr', 'aventurier,eco_conscious',        'nature,culture,decouverte',        'biodiversite,local,zero_dechet',   'montagne,desert,oasis',   'slow_travel,aventure',    90, true),
  (v_traveler2_id, 'Yassine Hammami',  'Photographe amateur, je voyage pour capturer la beauté du patrimoine tunisien.',                            'Tunisie', 'fr', 'photographe,culturel',            'photographie,patrimoine,histoire',  'patrimoine,artisanat_local',      'medina,plage,montagne',   'culturel,contemplation',  75, true),
  (v_traveler3_id, 'Sophie Martin',    'Française installée à Tunis, je cherche des expériences écologiques authentiques.',                         'France',  'fr', 'eco_conscious,gastronomique',     'gastronomie,nature,bien_etre',      'bio,commerce_equitable',          'plage,campagne,ile',      'slow_travel,gastronomie', 80, true)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- 5. PROJECTS (6 projets éco-touristiques réalistes)
-- ============================================================================
INSERT INTO projects (id, owner_id, name, project_type, description, region, address, lat, lng, opening_hours, status, sustainability_score, services, eco_labels, phone) VALUES
  (v_proj1, v_owner1_id, 'Éco-Lodge Forêt de Kroumirie',       'hebergement,eco_tourisme',   'Lodge écologique niché dans la forêt de chênes-lièges. Bungalows en bois, énergie solaire, cuisine locale bio.',                      'Ain Draham',       'Route de la Forêt, Ain Draham 8130',          36.7837, 8.6865,  '24h/24',        'active',  85, 'hebergement,restauration,randonnee,spa_naturel',     'label_vert,bio',                    '+216 78 655 001'),
  (v_proj2, v_owner2_id, 'Coopérative Artisanale de Guellala',  'artisanat',                  'Coopérative féminine de poterie et tissage. Ateliers participatifs pour touristes. Matières premières 100% locales.',                 'Djerba',           'Guellala, Djerba 4155',                       33.8000, 10.8500, '09:00 - 18:00', 'active',  90, 'atelier,vente,visite_guidee',                        'commerce_equitable,artisanat_local', '+216 75 612 345'),
  (v_proj3, v_owner3_id, 'Ferme Bio Oasis de Tozeur',           'agriculture,restauration',   'Ferme bio dans l''oasis de Tozeur. Dégustation de dattes, huile d''olive bio, repas traditionnels sous les palmiers.',                 'Tozeur',           'Route de l''Oasis, Tozeur 2200',               33.9197, 8.1335,  '08:00 - 20:00', 'active',  92, 'restauration,visite_guidee,vente_produits',           'bio,terroir',                       '+216 76 452 100'),
  (v_proj4, v_owner2_id, 'Centre de Plongée Éco Djerba',        'activite,eco_tourisme',      'Centre de plongée écoresponsable. Observation des herbiers de posidonie et des tortues marines. Zéro impact sur les récifs.',         'Djerba',           'Zone Touristique Midoun, Djerba 4116',        33.8300, 11.0100, '07:00 - 19:00', 'active',  88, 'plongee,snorkeling,formation,education_marine',      'blue_flag,eco_dive',                '+216 75 731 200'),
  (v_proj5, v_owner3_id, 'Maison d''Hôtes Berbère Matmata',      'hebergement',               'Maison d''hôtes troglodytique traditionnelle à Matmata. Architecture souterraine millénaire, cuisine berbère authentique.',            'Matmata',          'Matmata Ancienne, Matmata 6070',              33.5444, 9.9671,  '24h/24',        'active',  80, 'hebergement,restauration,visite_culturelle',         'patrimoine,authentique',             '+216 75 240 033'),
  (v_proj6, v_owner1_id, 'Kayak Mangrove Kerkennah',            'activite,eco_tourisme',      'Excursions en kayak dans la mangrove des îles Kerkennah. Observation des flamants roses et pêche traditionnelle à la charfia.',       'Kerkennah',        'Port de Sidi Youssef, Kerkennah 3070',        34.7100, 11.1400, '06:00 - 18:00', 'active',  87, 'kayak,observation_oiseaux,peche_traditionnelle',     'reserve_naturelle,eco_tourisme',    '+216 74 281 055')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 6. OFFERS (12 offres variées — hébergement, activités, restauration, artisanat)
-- ============================================================================
INSERT INTO offers (id, author_id, author_type, project_id, category_id, title, description, price, duration, offer_type, images, inclusions, region, address, latitude, longitude, meeting_point, meeting_lat, meeting_lng, min_group_size, max_group_size, min_age, cancellation_policy, sustainability_score, confirmation_mode, status) VALUES
  -- Hébergements
  (v_off1,  v_owner1_id, 'project_owner', v_proj1, v_cat_accom,    'Bungalow Forêt de Kroumirie',           'Bungalow en bois écologique avec vue sur la forêt de chênes-lièges. Panneaux solaires, eau chaude, terrasse privée.',                  120.00, '1 nuit',     'hebergement', NULL, 'Petit-déjeuner bio inclus, linge de lit, Wi-Fi',                    'Ain Draham',  'Route de la Forêt, Ain Draham',             36.7837, 8.6865,   NULL, NULL, NULL, 1, 6,  NULL, 'Annulation gratuite 48h avant',                   85, 'manual',    'approved'),
  (v_off2,  v_owner1_id, 'project_owner', v_proj5, v_cat_accom,    'Chambre Troglodyte Matmata',            'Dormez dans une chambre creusée dans la roche, comme les habitants berbères depuis des millénaires. Fraîcheur naturelle garantie.',     80.00,  '1 nuit',     'hebergement', NULL, 'Dîner berbère, petit-déjeuner, visite guidée du village',           'Matmata',     'Matmata Ancienne',                          33.5444, 9.9671,   NULL, NULL, NULL, 1, 4,  NULL, 'Annulation gratuite 24h avant',                   80, 'automatic', 'approved'),
  (v_off3,  v_owner1_id, 'project_owner', v_proj1, v_cat_sejour,   'Séjour 3 Nuits Éco-Lodge Kroumirie',    'Package 3 nuits tout inclus : hébergement, repas bio, 2 randonnées guidées, atelier cuisine locale.',                                  350.00, '3 jours',    'hebergement', NULL, 'Hébergement, repas, randonnées, transfert gare Jendouba',           'Ain Draham',  'Route de la Forêt, Ain Draham',             36.7837, 8.6865,   'Gare de Jendouba', 36.5012, 8.7807, 2, 8,  12, 'Annulation 50% remboursé 72h avant',              88, 'manual',    'approved'),

  -- Activités
  (v_off4,  v_guide1_id, 'guide',         NULL,    v_cat_activity, 'Randonnée Djebel Zaghouan',             'Randonnée de 6h au Djebel Zaghouan (1295m). Temple des Eaux romain, panorama sur le Cap Bon. Niveau intermédiaire.',                    45.00,  '6h',         'activite',    NULL, 'Guide certifié, eau, en-cas énergétiques',                          'Zaghouan',    'Temple des Eaux, Zaghouan',                 36.3980, 10.1430,  'Parking du Temple des Eaux', 36.3975, 10.1425, 4, 15, 12, 'Non remboursable sous 48h',                       75, 'automatic', 'approved'),
  (v_off5,  v_guide2_id, 'guide',         NULL,    v_cat_activity, 'Tour Culturel Houmt Souk',              'Visite guidée de la médina de Houmt Souk : fondouk, mosquées, marché aux poissons, synagogue de la Ghriba.',                           35.00,  '4h',         'activite',    NULL, 'Guide locale, entrées monuments',                                   'Djerba',      'Place Farhat Hached, Houmt Souk',           33.8750, 10.8570,  'Place Farhat Hached', 33.8750, 10.8570, 2, 20, NULL, 'Annulation gratuite 24h avant',                   70, 'automatic', 'approved'),
  (v_off6,  v_owner2_id, 'project_owner', v_proj4, v_cat_activity, 'Plongée Récif de Djerba',               'Plongée découverte dans les eaux cristallines de Djerba. Observation de la faune marine méditerranéenne.',                              75.00,  '3h',         'activite',    NULL, 'Équipement complet, moniteur PADI, photos sous-marines',            'Djerba',      'Zone Touristique Midoun',                   33.8300, 11.0100,  'Centre de plongée Midoun', 33.8300, 11.0100, 1, 8,  10, 'Annulation gratuite 72h avant',                   88, 'manual',    'approved'),
  (v_off7,  v_owner2_id, 'project_owner', v_proj6, v_cat_activity, 'Kayak Mangrove Kerkennah',              'Excursion en kayak dans la mangrove de Kerkennah. 3h de pagaie, observation flamants roses, pêche traditionnelle charfia.',             55.00,  '3h',         'activite',    NULL, 'Kayak, gilet, guide naturaliste, collation',                        'Kerkennah',   'Port de Sidi Youssef',                      34.7100, 11.1400,  'Port Sidi Youssef', 34.7100, 11.1400, 2, 10, 8,  'Remboursement intégral si météo défavorable',     90, 'automatic', 'approved'),

  -- Restauration
  (v_off8,  v_owner3_id, 'project_owner', v_proj3, v_cat_restaurant, 'Déjeuner sous les Palmiers',          'Repas traditionnel tunisien bio sous les palmiers de l''oasis de Tozeur. Couscous aux légumes du jardin, brick, salade mechouia.',       25.00,  '2h',         'restauration', NULL, 'Repas 4 plats, thé à la menthe, dattes fraîches',                  'Tozeur',      'Oasis de Tozeur',                           33.9197, 8.1335,   'Entrée de l''oasis', 33.9190, 8.1340, 2, 30, NULL, 'Annulation gratuite 24h avant',                   92, 'automatic', 'approved'),
  (v_off9,  v_owner3_id, 'project_owner', v_proj3, v_cat_restaurant, 'Atelier Cuisine Oasis',               'Apprenez à préparer le couscous tunisien, la harissa maison et les pâtisseries aux dattes avec nos cuisinières locales.',               40.00,  '3h',         'restauration', NULL, 'Ingrédients bio, tablier, recettes imprimées, dégustation',        'Tozeur',      'Ferme Bio, Route de l''Oasis',               33.9197, 8.1335,   NULL, NULL, NULL, 2, 12, 8,  'Annulation gratuite 48h avant',                   90, 'manual',    'approved'),

  -- Artisanat
  (v_off10, v_owner2_id, 'project_owner', v_proj2, v_cat_craft,    'Atelier Poterie de Guellala',           'Initiez-vous à la poterie traditionnelle de Guellala avec les artisanes de la coopérative. Repartez avec votre création.',              30.00,  '2h30',       'artisanat',   NULL, 'Matériel, cuisson, emballage de votre pièce',                       'Djerba',      'Guellala, Djerba',                          33.8000, 10.8500,  NULL, NULL, NULL, 1, 8,  6,  'Non remboursable',                                90, 'automatic', 'approved'),
  (v_off11, v_owner2_id, 'project_owner', v_proj2, v_cat_workshop, 'Stage Tissage Berbère 2 jours',         'Stage intensif de tissage berbère. Apprenez les techniques ancestrales du métier à tisser et créez votre propre tapis.',                180.00, '2 jours',    'artisanat',   NULL, 'Matériel, laine locale, repas, certificat',                         'Djerba',      'Guellala, Djerba',                          33.8000, 10.8500,  NULL, NULL, NULL, 1, 6,  14, 'Remboursement 50% si annulation 1 semaine avant', 92, 'manual',    'approved'),

  -- Éco-Tour
  (v_off12, v_guide1_id, 'guide',         NULL,    v_cat_eco_tour, 'Nuit sous les Étoiles du Sahara',       'Bivouac écologique dans les dunes de Douz. Dîner bédouin, observation des étoiles, balade à dos de dromadaire au lever du soleil.',      95.00,  '1 nuit',     'eco_tourisme', NULL, 'Tente bédouine, repas, dromadaire, guide astronome amateur',        'Douz',        'Porte du Sahara, Douz',                     33.4608, 8.9858,   'Place du marché Douz', 33.4600, 8.9850, 2, 12, 8,  'Annulation gratuite 72h avant',                   82, 'manual',    'approved')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 7. OFFER ITEMS (éléments réservables dans les offres)
-- ============================================================================
INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, requires_confirmation, status) VALUES
  -- Off1: Bungalow Kroumirie
  (v_item1,  v_off1,  'Bungalow Double',             'Bungalow 2 personnes avec terrasse privée',                'room',           '{"bed_count":2,"nights":1,"room_sub_type":"double"}',                    false, 'active'),
  (v_item2,  v_off1,  'Bungalow Familial',           'Bungalow 4 personnes avec mezzanine',                      'room',           '{"bed_count":4,"nights":1,"room_sub_type":"family"}',                    false, 'active'),
  -- Off2: Matmata
  (v_item3,  v_off2,  'Chambre Troglodyte Standard', 'Chambre creusée dans la roche, lit double',                'room',           '{"bed_count":2,"nights":1,"room_sub_type":"private"}',                   false, 'active'),
  -- Off3: Séjour 3 nuits Kroumirie
  (v_item4,  v_off3,  'Pack Séjour Solo',            'Séjour 3 nuits en chambre individuelle + activités',       'room',           '{"bed_count":1,"nights":3,"room_sub_type":"private"}',                   true,  'active'),
  (v_item5,  v_off3,  'Pack Séjour Couple',          'Séjour 3 nuits en bungalow double + activités',            'room',           '{"bed_count":2,"nights":3,"room_sub_type":"double"}',                    true,  'active'),
  -- Off4: Randonnée Zaghouan
  (v_item6,  v_off4,  'Place Randonnée',             'Participation à la randonnée guidée du Djebel Zaghouan',   'activity',       NULL,                                                                     false, 'active'),
  -- Off5: Tour Houmt Souk
  (v_item7,  v_off5,  'Place Tour Guidé',            'Place pour le tour culturel de Houmt Souk',                'activity',       NULL,                                                                     false, 'active'),
  -- Off6: Plongée Djerba
  (v_item8,  v_off6,  'Plongée Découverte',          'Plongée avec moniteur pour débutants',                     'activity',       NULL,                                                                     true,  'active'),
  (v_item9,  v_off6,  'Plongée Autonome',            'Plongée pour plongeurs certifiés (Niveau 1+)',             'activity',       NULL,                                                                     false, 'active'),
  -- Off8: Déjeuner Tozeur
  (v_item10, v_off8,  'Menu Traditionnel',           'Couscous + brick + salade mechouia + dessert',             'menu',           NULL,                                                                     false, 'active'),
  -- Off10: Poterie Guellala
  (v_item11, v_off10, 'Atelier Poterie Adulte',      'Atelier de 2h30 avec pièce à emporter',                    'workshop',       NULL,                                                                     false, 'active'),
  -- Off12: Bivouac Sahara
  (v_item12, v_off12, 'Tente Bédouine 2 pers.',      'Tente traditionnelle pour 2 personnes',                    'camping_space',  '{"tent_capacity":2,"nights":1}',                                         false, 'active'),
  (v_item13, v_off12, 'Tente Bédouine 4 pers.',      'Grande tente pour famille ou groupe',                      'camping_space',  '{"tent_capacity":4,"nights":1}',                                         false, 'active'),
  -- Off7: Kayak Kerkennah
  (v_item14, v_off7,  'Kayak Simple',                'Kayak individuel + gilet + pagaie',                        'equipment',      NULL,                                                                     false, 'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 8. OFFER ITEM PRICES (prix par catégorie de participant)
-- ============================================================================
INSERT INTO offer_item_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default, status) VALUES
  (v_price1,  v_item1,  'Adulte',                  120.00, 'TND', 'per_night',  true,  'active'),
  (v_price2,  v_item2,  'Adulte',                  180.00, 'TND', 'per_night',  true,  'active'),
  (v_price3,  v_item2,  'Enfant (4-12 ans)',        90.00,  'TND', 'per_night',  false, 'active'),
  (v_price4,  v_item3,  'Adulte',                   80.00, 'TND', 'per_night',  true,  'active'),
  (v_price5,  v_item4,  'Solo',                    280.00, 'TND', 'per_person', true,  'active'),
  (v_price6,  v_item5,  'Couple',                  500.00, 'TND', 'per_person', true,  'active'),
  (v_price7,  v_item6,  'Adulte',                   45.00, 'TND', 'per_person', true,  'active'),
  (v_price8,  v_item6,  'Étudiant',                 30.00, 'TND', 'per_person', false, 'active'),
  (v_price9,  v_item7,  'Adulte',                   35.00, 'TND', 'per_person', true,  'active'),
  (v_price10, v_item7,  'Enfant (6-12 ans)',        20.00, 'TND', 'per_person', false, 'active'),
  (v_price11, v_item8,  'Adulte',                   75.00, 'TND', 'per_person', true,  'active'),
  (v_price12, v_item9,  'Plongeur certifié',        55.00, 'TND', 'per_person', true,  'active'),
  (v_price13, v_item10, 'Adulte',                   25.00, 'TND', 'per_person', true,  'active'),
  (v_price14, v_item11, 'Adulte',                   30.00, 'TND', 'per_person', true,  'active'),
  (v_price15, v_item12, 'Par tente (2 pers.)',      95.00, 'TND', 'per_night',  true,  'active'),
  (v_price16, v_item14, 'Par kayak',                55.00, 'TND', 'per_person', true,  'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 9. OFFER ITEM SESSIONS (créneaux disponibles)
-- ============================================================================
INSERT INTO offer_item_sessions (id, offer_item_id, date, start_time, end_time, total_capacity, remaining_capacity, status) VALUES
  -- Randonnée Zaghouan — tous les samedis de juillet 2026
  (v_sess1, v_item6,  '2026-07-04', '07:00', '13:00', 15, 12, 'available'),
  (v_sess2, v_item6,  '2026-07-11', '07:00', '13:00', 15, 15, 'available'),
  (v_sess3, v_item6,  '2026-07-18', '07:00', '13:00', 15, 15, 'available'),
  -- Tour Houmt Souk — tous les jours
  (v_sess4, v_item7,  '2026-07-05', '09:00', '13:00', 20, 18, 'available'),
  (v_sess5, v_item7,  '2026-07-06', '09:00', '13:00', 20, 20, 'available'),
  -- Plongée Djerba — matin et après-midi
  (v_sess6, v_item8,  '2026-07-07', '08:00', '11:00',  8,  6, 'available'),
  (v_sess7, v_item8,  '2026-07-07', '14:00', '17:00',  8,  8, 'available'),
  -- Kayak Kerkennah — matinée
  (v_sess8, v_item14, '2026-07-08', '06:30', '09:30', 10, 10, 'available'),
  -- Poterie Guellala
  (v_sess9, v_item11, '2026-07-10', '10:00', '12:30',  8,  8, 'available')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 10. CIRCUITS (6 circuits multi-jours)
-- ============================================================================
INSERT INTO circuits (id, author_id, author_type, project_id, title, description, start_date, end_date, duration_days, duration_nights, region, base_price, currency, max_participants, confirmation_mode, inclusions, exclusions, lat, lng, address, status, images) VALUES
  (v_cir1, v_guide1_id, 'guide',         NULL,    'Magie du Sahara : Douz – Tozeur – Tataouine',
    'Circuit de 4 jours dans le Grand Sud tunisien. Dunes de sable, oasis, ksour berbères et nuits étoilées sous tente bédouine.',
    '2026-08-01', '2026-08-04', 4, 3, 'Sud Tunisien', 680.00, 'TND', 15, 'manual',
    'Transport 4x4, hébergement, repas, guide francophone, dromadaire',
    'Vols internationaux, assurance voyage, pourboires',
    33.4608, 8.9858, 'Douz, Kébili', 'approved',
    ARRAY['https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80', 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80', 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80']),

  (v_cir2, v_guide2_id, 'guide',         NULL,    'Djerba Authentique : Culture et Mer',
    'Circuit de 3 jours à Djerba hors des sentiers battus. Médina, Guellala, plages secrètes, pêche traditionnelle et cuisine djerbienne.',
    '2026-07-15', '2026-07-17', 3, 2, 'Djerba', 420.00, 'TND', 12, 'automatic',
    'Hébergement menzel traditionnel, repas, transferts, guide locale',
    'Billet de ferry, achats personnels',
    33.8750, 10.8570, 'Houmt Souk, Djerba', 'approved',
    ARRAY['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', 'https://images.unsplash.com/photo-1548018560-c7196e4f220b?w=800&q=80']),

  (v_cir3, v_guide1_id, 'guide',         NULL,    'Trek Kroumirie : Forêts et Cascades',
    'Trekking de 3 jours dans les forêts de la Kroumirie. Cascades de Beni Mtir, sources thermales d''Ain Draham, villages de montagne.',
    '2026-09-10', '2026-09-12', 3, 2, 'Ain Draham', 380.00, 'TND', 12, 'manual',
    'Hébergement éco-lodge, repas bio, guide de montagne, matériel trek',
    'Transport jusqu''à Ain Draham, assurance',
    36.7837, 8.6865, 'Ain Draham, Jendouba', 'approved',
    ARRAY['https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&q=80']),

  (v_cir4, v_owner1_id, 'project_owner', v_proj3, 'Oasis et Chott el Jerid : La Route des Dattes',
    'Circuit de 3 jours autour de Tozeur. Balade en calèche dans l''oasis, traversée du Chott el Jerid, gorges de Midès.',
    '2026-10-01', '2026-10-03', 3, 2, 'Tozeur', 350.00, 'TND', 20, 'automatic',
    'Transport, hébergement dar, repas oasis, calèche',
    'Boissons, souvenirs',
    33.9197, 8.1335, 'Tozeur', 'approved',
    ARRAY['https://images.unsplash.com/photo-1548018560-c7196e4f220b?w=800&q=80', 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80', 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80']),

  (v_cir5, v_guide1_id, 'guide',         NULL,    'Les Ksour de Tataouine et Chenini',
    'Circuit de 3 jours à la découverte des greniers fortifiés berbères (ksour), du village perché de Chenini et de Gharb el Kebbar.',
    '2026-08-20', '2026-08-22', 3, 2, 'Tataouine', 280.00, 'TND', 15, 'automatic',
    'Transport, hébergement chez l''habitant, repas, guide',
    'Assurance, pourboires',
    32.9296, 10.4518, 'Tataouine', 'approved',
    ARRAY['https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80', 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80', 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80']),

  (v_cir6, v_guide2_id, 'guide',         NULL,    'Île de Kerkennah : Nature et Traditions',
    'Séjour de 3 jours sur les îles Kerkennah. Pêche à la charfia, flamants roses, coucher de soleil, cuisine insulaire.',
    '2026-07-25', '2026-07-27', 3, 2, 'Kerkennah', 320.00, 'TND', 10, 'manual',
    'Ferry, hébergement, repas, kayak, guide naturaliste',
    'Transport jusqu''à Sfax, achats personnels',
    34.7100, 11.1400, 'Kerkennah, Sfax', 'approved',
    ARRAY['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80', 'https://images.unsplash.com/photo-1548018560-c7196e4f220b?w=800&q=80'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 11. CIRCUIT DAYS (jours de chaque circuit)
-- ============================================================================
INSERT INTO circuit_days (id, circuit_id, day_number, date, title, description, lat, lng, location_name) VALUES
  -- Circuit 1 : Sahara (4 jours)
  (v_cday1,  v_cir1, 1, '2026-08-01', 'Arrivée à Douz & Dunes',                'Accueil à Douz, installation au campement, première balade à dos de dromadaire dans les dunes du Grand Erg Oriental.',  33.4608, 8.9858,  'Douz'),
  (v_cday2,  v_cir1, 2, '2026-08-02', 'Traversée vers Tozeur',                  'Route panoramique via le Chott el Jerid. Arrivée à Tozeur, visite de l''oasis et de la médina.',                         33.9197, 8.1335,  'Tozeur'),
  (v_cday3,  v_cir1, 3, '2026-08-03', 'Tamerza & Gorges de Midès',              'Excursion aux cascades de Tamerza et aux gorges spectaculaires de Midès à la frontière algérienne.',                     34.0750, 7.9350,  'Tamerza'),
  (v_cday4,  v_cir1, 4, '2026-08-04', 'Ksour de Tataouine & Retour',            'Route vers Tataouine, visite des ksour de Ksar Ouled Soltane et Ksar Hadada (lieu de tournage Star Wars).',              32.9296, 10.4518, 'Tataouine'),

  -- Circuit 2 : Djerba (3 jours)
  (v_cday5,  v_cir2, 1, '2026-07-15', 'Houmt Souk & Patrimoine',                'Visite de la médina, du fondouk (caravansérail), de la synagogue de la Ghriba et du musée de Guellala.',                 33.8750, 10.8570, 'Houmt Souk'),
  (v_cday6,  v_cir2, 2, '2026-07-16', 'Plages Secrètes & Flamants Roses',       'Journée nature : plage de Sidi Jmour, observation des flamants dans la lagune, coucher de soleil à Ajim.',                33.7500, 10.7500, 'Sidi Jmour'),
  (v_cday7,  v_cir2, 3, '2026-07-17', 'Guellala & Gastronomie Djerbienne',       'Atelier poterie à Guellala, déjeuner de fruits de mer, temps libre pour le souk.',                                       33.8000, 10.8500, 'Guellala'),

  -- Circuit 3 : Kroumirie (3 jours)
  (v_cday8,  v_cir3, 1, '2026-09-10', 'Forêt de Chênes-Lièges',                 'Trek dans la forêt primaire, découverte de la faune (cerfs de Barbarie), pique-nique en forêt.',                        36.7837, 8.6865,  'Ain Draham'),
  (v_cday9,  v_cir3, 2, '2026-09-11', 'Cascades de Beni Mtir',                  'Randonnée vers le lac et les cascades de Beni Mtir. Baignade et déjeuner au bord de l''eau.',                            36.7500, 8.7300,  'Beni Mtir'),
  (v_cday10, v_cir3, 3, '2026-09-12', 'Sources Thermales & Village Berbère',     'Visite des sources chaudes naturelles et d''un village de montagne. Retour.',                                              36.7600, 8.7000,  'Hammam Bourguiba'),

  -- Circuit 4 : Route des Dattes (3 jours)
  (v_cday11, v_cir4, 1, '2026-10-01', 'Oasis de Tozeur en Calèche',             'Balade en calèche dans l''oasis (200 000 palmiers), visite de la ferme bio, dégustation de dattes.',                      33.9197, 8.1335,  'Tozeur'),
  (v_cday12, v_cir4, 2, '2026-10-02', 'Chott el Jerid & Tamerza',               'Traversée du plus grand lac salé d''Afrique. Cascades de Tamerza.',                                               34.0750, 7.9350,  'Chott el Jerid'),
  (v_cday16, v_cir4, 3, '2026-10-03', 'Gorges de Midès & Nefta',                'Excursion aux gorges spectaculaires de Midès et visite de Nefta, la ville sainte.',                               34.1000, 7.9000,  'Midès'),

  -- Circuit 5 : Ksour (3 jours)
  (v_cday13, v_cir5, 1, '2026-08-20', 'Ksour Fortifiés',                         'Visite de Ksar Ouled Soltane, Ksar Hadada et Ksar Joumaa. Déjeuner traditionnel.',                                      32.9296, 10.4518, 'Tataouine'),
  (v_cday14, v_cir5, 2, '2026-08-21', 'Village Perché de Chenini',               'Ascension du village troglodytique de Chenini. Mosquée des Sept Dormants.',                                     33.0200, 10.2700, 'Chenini'),
  (v_cday17, v_cir5, 3, '2026-08-22', 'Gharb el Kebbar & Retour',               'Découverte du grenier fortifié de Gharb el Kebbar et du village de Smâren. Retour.',                            32.9500, 10.3500, 'Gharb el Kebbar'),

  -- Circuit 6 : Kerkennah (3 jours)
  (v_cday15, v_cir6, 1, '2026-07-25', 'Ferry & Découverte de l''Archipel',        'Traversée en ferry depuis Sfax. Installation, tour de l''île à vélo, baignade.',                                         34.7100, 11.1400, 'Kerkennah'),
  (v_cday18, v_cir6, 2, '2026-07-26', 'Pêche à la Charfia & Flamants Roses',     'Matinée de pêche traditionnelle à la charfia. Observation des flamants roses dans la lagune de Guellala.',             34.7200, 11.1500, 'Guellala'),
  (v_cday19, v_cir6, 3, '2026-07-27', 'Coucher de Soleil & Gastronomie',          'Coucher de soleil depuis le phare de Kerkennah. Dîner de fruits de mer frais et cuisine insulaire traditionnelle.',    34.7000, 11.1300, 'El Alia')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 12. CIRCUIT PROGRAM ITEMS (activités détaillées par journée)
-- ============================================================================
INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required) VALUES
  -- Jour 1 du Sahara
  (v_cprog1,  v_cday1, 'Accueil et transfert au campement',          'Récupération à l''aéroport de Tozeur-Nefta ou au centre de Douz.',                    '10:00', '12:00', true, true),
  (v_cprog2,  v_cday1, 'Déjeuner au campement bédouin',              'Repas traditionnel sous la tente berbère.',                                            '12:30', '14:00', true, true),
  (v_cprog3,  v_cday1, 'Balade à dos de dromadaire dans les dunes',  'Excursion de 2h dans le Grand Erg Oriental avec coucher de soleil.',                   '16:00', '18:30', true, true),
  (v_cprog4,  v_cday1, 'Dîner bédouin et observation des étoiles',   'Repas sous les étoiles, initiation à l''astronomie du désert.',                        '20:00', '22:30', true, false),

  -- Jour 2 du Sahara
  (v_cprog5,  v_cday2, 'Traversée du Chott el Jerid',                'Route panoramique sur le plus grand lac salé d''Afrique du Nord (120 km).',             '08:00', '10:30', true, true),
  (v_cprog6,  v_cday2, 'Visite de l''Oasis de Tozeur',                'Découverte de l''oasis aux 200 000 palmiers en calèche.',                               '11:00', '13:00', true, true),

  -- Jour 1 de Djerba
  (v_cprog7,  v_cday5, 'Visite de la Synagogue de la Ghriba',        'Plus ancienne synagogue d''Afrique, pèlerinage millénaire.',                             '09:00', '10:30', true, true),
  (v_cprog8,  v_cday5, 'Tour de la Médina de Houmt Souk',            'Fondouk, souks, mosquées, marché aux poissons.',                                        '11:00', '13:00', true, true),

  -- Jour 1 Kroumirie
  (v_cprog9,  v_cday8, 'Trek en forêt de chênes-lièges',             'Randonnée de 4h dans la forêt primaire. Possibilité d''observer des cerfs de Barbarie.', '08:00', '12:00', true, true),
  (v_cprog10, v_cday8, 'Pique-nique en forêt',                       'Déjeuner avec produits locaux au milieu de la forêt.',                                   '12:30', '14:00', true, true),

  -- Jour 1 Route des Dattes
  (v_cprog11, v_cday11, 'Calèche dans l''Oasis de Tozeur',           'Balade de 2h en calèche à travers la plus grande oasis du pays.',                        '09:00', '11:00', true, true),
  (v_cprog12, v_cday11, 'Dégustation de Dattes et Huile d''Olive',    'Visite de la ferme bio, dégustation de 7 variétés de dattes et d''huile d''olive.',       '11:30', '13:00', true, true),

  -- Jour 3 Route des Dattes
  (v_cprog13, v_cday16, 'Gorges de Midès',                            'Excursion au sentier des gorges spectaculaires. Vue panoramique sur la frontière algérienne.', '08:00', '10:00', true, true),
  (v_cprog14, v_cday16, 'Visite de Nefta',                            'Découverte de la ville sainte, mosquées, souks et palmeraie.',                              '10:30', '12:30', true, true),

  -- Jour 3 Ksour
  (v_cprog15, v_cday17, 'Gharb el Kebbar',                           'Visite du grenier fortifié le plus préservé de la région. Histoire et architecture berbère.', '09:00', '11:00', true, true),
  (v_cprog16, v_cday17, 'Village de Smâren',                         'Promenade dans le village perché. Artisanat local et panorama sur les oliveraies.',          '11:30', '13:00', true, true),

  -- Jour 2 Kerkennah
  (v_cprog17, v_cday18, 'Pêche à la Charfia',                        'Participation à la pêche traditionnelle aux filets fixes. Dégustation du poisson pêché.',     '07:00', '11:00', true, true),
  (v_cprog18, v_cday18, 'Observation des Flamants Roses',             'Balade en bateau dans la lagune de Guellala. Observation de la faune sauvage.',               '14:00', '16:00', true, false),

  -- Jour 3 Kerkennah
  (v_cprog19, v_cday19, 'Phare de Kerkennah',                        'Montée au phare pour le coucher de soleil. Panorama à 360° sur l''archipel.',                 '17:00', '18:30', true, true),
  (v_cprog20, v_cday19, 'Dîner de Fruits de Mer',                    'Repas gastronomique avec les spécialités insulaires : poisson, poulpe, crustacés.',           '19:00', '21:00', true, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 13. CIRCUIT OPTIONS (options additionnelles)
-- ============================================================================
INSERT INTO circuit_options (id, circuit_id, option_group, option_type, is_required, is_included, extra_price, status) VALUES
  -- Sahara options
  (v_copt1, v_cir1, 'transport',     'single_choice', false, false, 80.00,  'active'),
  (v_copt2, v_cir1, 'accommodation', 'single_choice', false, false, 50.00,  'active'),
  -- Djerba options
  (v_copt3, v_cir2, 'activity',      'multiple_choice', false, false, 30.00, 'active'),
  (v_copt4, v_cir2, 'food',          'single_choice',   false, true,  0.00,  'active'),
  -- Kroumirie options
  (v_copt5, v_cir3, 'equipment',     'quantity',         false, false, 15.00, 'active'),
  -- Kerkennah options
  (v_copt6, v_cir6, 'activity',      'single_choice',   false, false, 25.00, 'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 14. BOOKINGS (8 réservations)
-- ============================================================================
INSERT INTO bookings (id, booking_ref, traveler_id, offer_id, offer_item_id, session_id, status, total_price, currency, special_requests, confirmation_mode) VALUES
  (v_bk1, 'BK-TUN-001', v_traveler1_id, v_off1, v_item1,  NULL,     'confirmed', 240.00,  'TND', 'Vue sur la forêt si possible',                      'manual'),
  (v_bk2, 'BK-TUN-002', v_traveler2_id, v_off4, v_item6,  v_sess1,  'confirmed',  90.00,  'TND', NULL,                                                 'automatic'),
  (v_bk3, 'BK-TUN-003', v_traveler3_id, v_off5, v_item7,  v_sess4,  'confirmed',  70.00,  'TND', 'Avec 2 enfants de 8 et 10 ans',                      'automatic'),
  (v_bk4, 'BK-TUN-004', v_traveler1_id, v_off6, v_item8,  v_sess6,  'pending',   150.00,  'TND', 'Première plongée, un peu anxieuse !',                'manual'),
  (v_bk5, 'BK-TUN-005', v_traveler2_id, v_off8, v_item10, NULL,     'confirmed',  50.00,  'TND', 'Végétarien',                                          'automatic'),
  (v_bk6, 'BK-TUN-006', v_traveler3_id, v_off10, v_item11, v_sess9, 'confirmed',  30.00,  'TND', NULL,                                                  'automatic'),
  (v_bk7, 'BK-TUN-007', v_traveler1_id, v_off12, v_item12, NULL,    'confirmed', 190.00,  'TND', 'Allergie aux arachides',                              'manual'),
  (v_bk8, 'BK-TUN-008', v_traveler2_id, v_off7, v_item14, v_sess8,  'pending',   110.00,  'TND', NULL,                                                  'automatic')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 15. BOOKING PARTICIPANTS
-- ============================================================================
INSERT INTO booking_participants (id, booking_id, full_name, age, document_type, document_number, is_group_leader) VALUES
  -- BK1: Maram + compagnon
  (v_bp1,  v_bk1, 'Maram Mejri',           26, 'id_card',  'TN12345678', true),
  (v_bp2,  v_bk1, 'Ahmed Mejri',           28, 'id_card',  'TN87654321', false),
  -- BK2: Yassine seul
  (v_bp3,  v_bk2, 'Yassine Hammami',       30, 'id_card',  'TN11223344', true),
  -- BK3: Sophie + 2 enfants
  (v_bp4,  v_bk3, 'Sophie Martin',         34, 'passport', 'FR1234567',  true),
  (v_bp5,  v_bk3, 'Léa Martin',            10, NULL,       NULL,         false),
  (v_bp6,  v_bk3, 'Hugo Martin',            8, NULL,       NULL,         false),
  -- BK4: Maram + amie
  (v_bp7,  v_bk4, 'Maram Mejri',           26, 'id_card',  'TN12345678', true),
  (v_bp8,  v_bk4, 'Ines Ben Amor',         25, 'id_card',  'TN55667788', false),
  -- BK7: Maram + compagnon
  (v_bp9,  v_bk7, 'Maram Mejri',           26, 'id_card',  'TN12345678', true),
  (v_bp10, v_bk7, 'Ahmed Mejri',           28, 'id_card',  'TN87654321', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 16. CIRCUIT RESERVATIONS (6 réservations de circuits)
-- ============================================================================
INSERT INTO circuit_reservations (id, circuit_id, user_id, participants_count, base_total, options_total, final_total, status) VALUES
  (v_cres1, v_cir1, v_traveler1_id, 2, 1360.00, 80.00,  1440.00, 'confirmed'),
  (v_cres2, v_cir2, v_traveler3_id, 1,  420.00,  0.00,   420.00, 'confirmed'),
  (v_cres3, v_cir3, v_traveler2_id, 3, 1140.00, 45.00,  1185.00, 'pending'),
  (v_cres4, v_cir4, v_traveler1_id, 2,  560.00,  0.00,   560.00, 'confirmed'),
  (v_cres5, v_cir5, v_traveler3_id, 2,  440.00,  0.00,   440.00, 'pending'),
  (v_cres6, v_cir6, v_traveler2_id, 1,  250.00, 25.00,   275.00, 'confirmed')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 17. NOTIFICATIONS (9 notifications variées)
-- ============================================================================
INSERT INTO notifications (id, user_id, type, title, body, link, is_read) VALUES
  (v_notif1, v_traveler1_id, 'booking_confirmed',  'Réservation confirmée',       'Votre réservation BK-TUN-001 au Bungalow Forêt de Kroumirie a été confirmée.',                              '/dashboard/reservations',  true),
  (v_notif2, v_owner1_id,    'booking_request',    'Nouvelle réservation',        'Maram Mejri a réservé le Bungalow Double (2 nuits). Confirmation manuelle requise.',                          '/dashboard/incoming',      false),
  (v_notif3, v_traveler2_id, 'booking_confirmed',  'Réservation confirmée',       'Votre place pour la Randonnée Djebel Zaghouan du 04/07/2026 est confirmée. Rendez-vous à 7h au Temple.',     '/dashboard/reservations',  true),
  (v_notif4, v_traveler3_id, 'booking_confirmed',  'Réservation confirmée',       'Votre tour culturel de Houmt Souk est confirmé pour le 05/07/2026.',                                          '/dashboard/reservations',  false),
  (v_notif5, v_guide1_id,    'booking_request',    'Nouvelle réservation circuit', 'Yassine Hammami a réservé le Trek Kroumirie (3 personnes). En attente de confirmation.',                      '/circuits/reservations/incoming', false),
  (v_notif6, v_traveler1_id, 'circuit_available',  'Nouveau circuit disponible',  'Le circuit "Magie du Sahara" (4 jours) est maintenant ouvert aux réservations.',                               '/circuits/' || v_cir1::text, false),
  (v_notif7, v_owner2_id,    'offer_approved',     'Offre approuvée',              'Votre offre "Atelier Poterie de Guellala" a été approuvée par l''administrateur.',                            '/offers/' || v_off10::text,   true),
  (v_notif8, v_traveler1_id, 'booking_confirmed',  'Réservation Sahara confirmée','Votre réservation pour le circuit "Magie du Sahara" (2 personnes) est confirmée.',                             '/circuits/' || v_cir1::text,  true),
  (v_notif9, v_guide2_id,    'new_message',        'Nouveau message',              'Sophie Martin vous a envoyé un message concernant le Tour Culturel Houmt Souk.',                              '/messagerie',               false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 18. TRIP PLANS (3 plans de voyage)
-- ============================================================================
INSERT INTO trip_plans (id, eco_traveler_id, title, description, start_date, end_date, status) VALUES
  (v_tp1, v_traveler1_id, 'Aventure Sud Tunisien — Été 2026',
    'Plan de 7 jours combinant désert, oasis et mer. Douz → Tozeur → Djerba.',
    '2026-08-01', '2026-08-07', 'draft'),
  (v_tp2, v_traveler3_id, 'Découverte Culturelle Djerba-Kerkennah',
    'Séjour de 5 jours entre Djerba et Kerkennah. Art, cuisine et nature.',
    '2026-07-15', '2026-07-19', 'draft'),
  (v_tp3, v_traveler2_id, 'Photo Trip : Paysages de Tunisie',
    'Circuit photo de 6 jours : Matmata, Tataouine, Douz, Tozeur. Lever et coucher de soleil garantis.',
    '2026-09-01', '2026-09-06', 'draft')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 19. TRIP PLAN ITEMS
-- ============================================================================
INSERT INTO trip_plan_items (id, trip_plan_id, offer_item_id, day_number, sort_order, notes) VALUES
  -- Plan 1 : Aventure Sud
  (v_tpi1, v_tp1, v_item12, 1, 1, 'Bivouac dans le Sahara — tente 2 personnes'),
  (v_tpi2, v_tp1, v_item10, 2, 1, 'Déjeuner sous les palmiers de Tozeur'),
  -- Plan 2 : Djerba-Kerkennah
  (v_tpi3, v_tp2, v_item7,  1, 1, 'Tour guidé de Houmt Souk le matin'),
  (v_tpi4, v_tp2, v_item11, 2, 1, 'Atelier poterie à Guellala'),
  (v_tpi5, v_tp2, v_item14, 4, 1, 'Kayak dans la mangrove de Kerkennah'),
  -- Plan 3 : Photo Trip
  (v_tpi6, v_tp3, v_item3,  1, 1, 'Nuit dans une chambre troglodyte à Matmata — photo au lever du soleil')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- UPDATE SESSION REMAINING CAPACITY (reflect bookings above)
-- ============================================================================
UPDATE offer_item_sessions SET remaining_capacity = remaining_capacity - 1 WHERE id = v_sess1; -- Yassine randonnée
UPDATE offer_item_sessions SET remaining_capacity = remaining_capacity - 1 WHERE id = v_sess4; -- Sophie tour
UPDATE offer_item_sessions SET remaining_capacity = remaining_capacity - 1 WHERE id = v_sess6; -- Maram plongée
UPDATE offer_item_sessions SET remaining_capacity = remaining_capacity - 1 WHERE id = v_sess9; -- Sophie poterie
UPDATE offer_item_sessions SET remaining_capacity = remaining_capacity - 1 WHERE id = v_sess8; -- Yassine kayak

RAISE NOTICE '✅ Seed EcoVoyage terminé avec succès !';
RAISE NOTICE '   📊 10 catégories, 6 projets, 12 offres, 14 items, 9 sessions';
RAISE NOTICE '   🏔️  6 circuits, 15 jours, 12 activités, 6 options';
RAISE NOTICE '   📋 8 réservations, 10 participants, 6 réservations circuits';
RAISE NOTICE '   🔔 9 notifications, 3 plans de voyage, 6 items de plan';
RAISE NOTICE '';
RAISE NOTICE '⚠️  N''oubliez pas de remplacer les UUIDs v_guide1_id, v_owner1_id, etc.';
RAISE NOTICE '   par les vrais IDs de vos utilisateurs (SELECT id, email, role FROM users;)';

END;
$$;

COMMIT;
