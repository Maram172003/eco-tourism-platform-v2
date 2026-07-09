-- ============================================================================
-- EcoVoyage — Script d'extension avec données supplémentaires
-- ============================================================================
-- Utilisation des UUIDs réels des utilisateurs existants
-- Exécution :
--   PGPASSWORD=Hermosa psql -h localhost -p 5433 -U marammejri -d tourism_db -f extension_data.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 0. Variables : UUIDs réels des utilisateurs existants
-- ============================================================================
DO $$
DECLARE
  -- UUIDs réels des utilisateurs existants
  v_admin_id       UUID := 'faf06ea0-3c4a-4cff-b180-5ff4bedab682';
  v_fakerbennoomen_id UUID := '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e';
  v_nour_id        UUID := '8148d448-9c88-4aa3-b2f1-7d71bc112f12';
  v_amir1_id       UUID := '6fb2d1e7-39db-4152-b9b5-5b440f551cc9';
  v_amir2_id       UUID := '87a38946-9a54-4bb4-be4a-887be312af15';
  v_faker1_id      UUID := '7b83e87d-276d-4d89-bb00-ab8ea1243a14';
  v_faker2_id      UUID := 'a602737a-b07d-4a41-b9c3-cdf1be17036a';
  v_faker3_id      UUID := '90b4c5bf-4a47-4737-b033-f7385e22a2e6';
  v_faker4_id      UUID := 'b09808ee-30a9-4089-bbf7-698e73004ef4';
  v_faker5_id      UUID := '3f8cb3e8-b8d1-4d27-a9ff-1b6699079b9f';

  -- Nouveaux UUIDs pour les entités supplémentaires
  -- Utilisation des UUIDs existants pour les nouveaux profils
  -- Nouveaux Guides (utilisateurs existants)
  v_guide3_id      UUID := '6fb2d1e7-39db-4152-b9b5-5b440f551cc9'; -- k.arim.amirbennoomen@gmail.com
  v_guide4_id      UUID := '87a38946-9a54-4bb4-be4a-887be312af15'; -- y.m.eslek.amirbennoomen@gmail.com
  v_guide5_id      UUID := '8148d448-9c88-4aa3-b2f1-7d71bc112f12'; -- n.our.fakerbennoomen@gmail.com

  -- Utilisation des UUIDs existants des propriétaires
  v_owner3_id      UUID := '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'; -- fakerbennoomen@gmail.com
  v_owner4_id      UUID := '8148d448-9c88-4aa3-b2f1-7d71bc112f12'; -- n.our.fakerbennoomen@gmail.com

  -- Nouveaux Éco-voyageurs (utilisateurs existants)
  v_traveler4_id   UUID := '90b4c5bf-4a47-4737-b033-f7385e22a2e6'; -- sarah.b.akerbennoomen@gmail.com
  v_traveler5_id   UUID := 'b09808ee-30a9-4089-bbf7-698e73004ef4'; -- ah.m.edfakerbennoomen@gmail.com

  -- UUIDs des catégories existantes
  v_cat_activity   UUID := 'c0000000-0001-0000-0000-000000000003';
  v_cat_craft     UUID := 'c0000000-0001-0000-0000-000000000005';
  v_cat_accom     UUID := 'c0000000-0001-0000-0000-000000000002';

  -- Nouveaux Projets
  v_proj7_id       UUID := '55000000-0001-0000-0000-000000000008';
  v_proj8_id       UUID := '55000000-0001-0000-0000-000000000009';
  v_proj9_id       UUID := '55000000-0001-0000-0000-000000000010';
  v_proj10_id      UUID := '55000000-0001-0000-0000-000000000011';

  -- Nouvelles Offres
  v_off13_id       UUID := '55000000-0001-0000-0000-000000000012';
  v_off14_id       UUID := '55000000-0001-0000-0000-000000000013';
  v_off15_id       UUID := '55000000-0001-0000-0000-000000000014';
  v_off16_id       UUID := '55000000-0001-0000-0000-000000000015';
  v_off17_id       UUID := '55000000-0001-0000-0000-000000000016';
  v_off18_id       UUID := '55000000-0001-0000-0000-000000000017';
  v_off19_id       UUID := '55000000-0001-0000-0000-000000000018';

  -- Nouveaux Circuits
  v_cir7_id        UUID := '55000000-0001-0000-0000-000000000020';
  v_cir8_id        UUID := '55000000-0001-0000-0000-000000000021';
  v_cir9_id        UUID := '55000000-0001-0000-0000-000000000022';

  -- Nouveaux Trip Plans
  v_tp4_id         UUID := '55000000-0001-0000-0000-000000000023';
  v_tp5_id         UUID := '55000000-0001-0000-0000-000000000024';
  v_tp6_id         UUID := '55000000-0001-0000-0000-000000000025';

BEGIN
  -- ============================================================================
  -- 1. NOUVEAUX GUIDES (types divers : professionnel, local, ecotourisme)
  -- ============================================================================
  INSERT INTO guides (user_id, full_name, guide_type, bio, country, language, zone, specialties, languages_spoken, years_experience, status, profile_completion, is_onboarded) VALUES
    (v_guide3_id, 'Mohamed Ali',        'professionnel', 'Guide certifié en kayak de mer et snorkeling. 10 ans d''expérience dans les côtes tunisiennes et les îles Kerkennah. Spécialisé en observation marine.', 'Tunisie', 'fr', 'Côtes Tunisiennes', 'Kayak,Snorkeling,Observation Marine', 'Français,Anglais,Italien', 10, 'active', 95, true),
    (v_guide4_id, 'Salma Ben Romdhane', 'ecotourisme',   'Guide éco-certifiée spécialisée dans le tourisme durable. Connaissance approfondie de la faune locale et des écosystèmes méditerranéens.', 'Tunisie', 'fr', 'Nord Tunisien', 'Ecotourisme,Biodiversite,Observation Oiseaux', 'Français,Anglais,Allemand', 7, 'active', 92, true),
    (v_guide5_id, 'Ahmed Kammoun',      'local',         'Guide local de Hammamet. Connaissance approfondie de l''histoire antique et des sites archéologiques de la région. Passionné par la transmission du patrimoine.', 'Tunisie', 'fr', 'Hammamet', 'Culture,Histoire,Antiquite', 'Arabe,Français,Anglais', 6, 'active', 88, true)
  ON CONFLICT (user_id) DO NOTHING;

  -- ============================================================================
  -- 2. NOUVEAUX PROPRIETAIRES DE PROJETS
  -- ============================================================================
  INSERT INTO project_owners (user_id, full_name, bio, country, language, organization, position, phone, profile_completion, is_onboarded) VALUES
    (v_owner3_id, 'Kamel Korbi',        'Fondateur de l''éco-resort "Korba Plage Éco". Engagement fort pour la protection des tortues marines et des écosystèmes côtiers.', 'Tunisie', 'fr', 'Korba Plage Éco', 'Fondateur', '+216 71 234 567', 90, true),
    (v_owner4_id, 'Leila Ben Mahmoud',  'Gérante de "Cycles Verts Tunisie". Promotion du cyclotourisme écologique et des circuits à vélo dans les parcs naturels.', 'Tunisie', 'fr', 'Cycles Verts Tunisie', 'Directrice Générale', '+216 98 765 432', 85, true)
  ON CONFLICT (user_id) DO NOTHING;

  -- ============================================================================
  -- 3. NOUVEAUX ÉCO-VOYAGEURS
  -- ============================================================================
  INSERT INTO eco_travelers (user_id, full_name, bio, country, language, traveler_types, motivations, sustainability_values, landscapes, travel_styles, profile_completion, is_onboarded) VALUES
    (v_traveler4_id, 'Paul Dubois',      'Voyageur français passionné de cyclotourisme et de photographie naturelle. Je cherche des expériences écologiques authentiques en Tunisie.', 'France', 'fr', 'cyclotouriste,photographe', 'velo,photographie,nature', 'eco_transport,biodiversite', 'cote,parc,forêt', 'slow_travel,aventure', 88, true),
    (v_traveler5_id, 'Fatma Ben Salah',  'Tunisienne passionnée de randonnée et de découverte des traditions locales. Je participe activement à la préservation du patrimoine.', 'Tunisie', 'fr', 'aventurier,culturel', 'randonnee,culture,patrimoine', 'patrimoine_local,artisanat', 'montagne,medina,oasis', 'aventure,culturel', 82, true)
  ON CONFLICT (user_id) DO NOTHING;

  -- ============================================================================
  -- 4. NOUVEAUX PROJETS (activités kayak, vélo, artisanat supplémentaires)
  -- ============================================================================
  INSERT INTO projects (id, owner_id, name, project_type, description, region, address, lat, lng, opening_hours, status, sustainability_score, services, eco_labels, phone) VALUES
    -- Kayak et activités nautiques
    (v_proj7_id, v_owner3_id, 'Centre Kayak Éco Korba',          'activite,eco_tourisme', 'Centre de kayak écoresponsable à Korba. Location de kayaks biodegradables, initiation au snorkeling, observation des tortues marines.', 'Korba',           'Avenue de la Plage, Korba 8050',           36.7570, 10.7250, '08:00 - 18:00', 'active',  88, 'kayak,snorkeling,observation_marine,location_equipment', 'blue_flag,eco_equipment', '+216 71 234 567'),
    
    -- Cyclotourisme
    (v_proj8_id, v_owner4_id, 'Cycles Verts Hammamet',          'activite,eco_tourisme', 'Location de vélos électriques et traditionnels. Circuits cyclotouristiques dans la région d''Hammamet avec guides écologistes.', 'Hammamet',        'Avenue Bourguiba, Hammamet 8050',        36.4020, 10.6300, '07:00 - 19:00', 'active',  85, 'velo_location,circuit_guidee,entretien_velo', 'velo_vert,eco_transport', '+216 98 765 432'),
    
    -- Artisanat local supplémentaire
    (v_proj9_id, v_owner3_id, 'Atelier Cuir de Hammamet',       'artisanat',            'Atelier de maroquinerie traditionnelle tunisienne. Fabrication de sacs, ceintures et accessoires en cuir local.', 'Hammamet',        'Souk El Blat, Hammamet 8050',            36.4050, 10.6350, '09:00 - 17:00', 'active',  87, 'atelier,vente,visite_guidee', 'artisanat_local,commerce_equitable', '+216 71 345 678'),
    
    -- Hébergement écologique supplémentaire
    (v_proj10_id, v_owner4_id, 'Éco-Gîte Matmata',             'hebergement',          'Gîte écologique troglodytique à Matmata. Construction traditionnelle, énergie solaire, cuisine bio locale.', 'Matmata',         'Route de Tataouine, Matmata 6070',        33.5444, 9.9671,  '24h/24',        'active',  90, 'hebergement,restauration,visite_culturelle', 'eco_lodge,patrimoine', '+216 98 234 567')
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- 5. NOUVELLES OFFRES (diversification des activités)
  -- ============================================================================
  INSERT INTO offers (id, author_id, author_type, project_id, category_id, title, description, price, duration, offer_type, images, inclusions, region, address, latitude, longitude, meeting_point, meeting_lat, meeting_lng, min_group_size, max_group_size, min_age, cancellation_policy, sustainability_score, confirmation_mode, status) VALUES
    -- Activités Kayak
    (v_off13, v_owner3_id, 'project_owner', v_proj7, v_cat_activity, 'Kayak de Mer Korba',           'Excursion en kayak de mer le long de la côte de Korba. Observation dauphins et tortues marines. Snorkeling dans les zones protégées.', 45.00, '3h', 'activite', NULL, 'Kayak, gilet, pagaie, guide, équipement snorkeling', 'Korba', 'Avenue de la Plage, Korba', 36.7570, 10.7250, 'Plage de Korba', 36.7570, 10.7250, 2, 12, 8, 'Annulation gratuite 48h avant', 88, 'automatic', 'approved'),
    (v_off14, v_owner3_id, 'project_owner', v_proj7, v_cat_activity, 'Snorkeling Éco Korba',        'Snorkeling dans les zones protégées de Korba. Observation de la faune marine méditerranéenne et des herbiers de posidonie.', 35.00, '2h', 'activite', NULL, 'Équipement snorkeling, guide naturaliste, assurance', 'Korba', 'Plage de Korba', 36.7570, 10.7250, 'Plage de Korba', 36.7570, 10.7250, 4, 16, 10, 'Annulation gratuite 24h avant', 90, 'automatic', 'approved'),
    
    -- Activités Vélo
    (v_off15, v_owner4_id, 'project_owner', v_proj8, v_cat_activity, 'Circuit Vélo Éco Hammamet',   'Cyclotourisme de 4h dans la région d''Hammamet. Parcours côtier et forêt, avec dégustation de produits bio.', 40.00, '4h', 'activite', NULL, 'Vélo électrique, casque, guide, bouteille d''eau', 'Hammamet', 'Avenue Bourguiba, Hammamet', 36.4020, 10.6300, 'Office de Tourisme', 36.4020, 10.6300, 2, 8, 12, 'Annulation gratuite 72h avant', 85, 'automatic', 'approved'),
    (v_off16, v_owner4_id, 'project_owner', v_proj8, v_cat_activity, 'Randonnée VTT Korbous',       'Randonnée VTT dans les collines de Korbous. Panorama sur le golfe de Hammamet et visite d''une olive bio.', 55.00, '6h', 'activite', NULL, 'VTT, casque, guide, transfert, collation', 'Korbous', 'Collines de Korbous', 36.3800, 10.6800, 'Place de Korbous', 36.3800, 10.6800, 4, 12, 14, 'Non remboursable sous 48h', 82, 'manual', 'approved'),
    
    -- Artisanat supplémentaire
    (v_off17, v_owner3_id, 'project_owner', v_proj9, v_cat_craft,    'Atelier Cuir Traditionnel',    'Apprenez les techniques traditionnelles de maroquinerie tunisienne. Repartez avec votre propre création en cuir local.', 50.00, '3h', 'artisanat', NULL, 'Matériel cuir, outils, emballage, certificat', 'Hammamet', 'Souk El Blat, Hammamet', 36.4050, 10.6350, NULL, NULL, NULL, 1, 8, 14, 'Non remboursable', 87, 'automatic', 'approved'),
    
    -- Hébergement supplémentaire
    (v_off18, v_owner4_id, 'project_owner', v_proj10, v_cat_accom,    'Chambre Troglodyte Matmata',   'Dormez dans une chambre creusée dans la roche traditionnelle. Expérience authentique berbère avec confort moderne.', 90.00, '1 nuit', 'hebergement', NULL, 'Chambre privée, petit-déjeuner, visite guidée', 'Matmata', 'Route de Tataouine, Matmata', 33.5444, 9.9671, NULL, NULL, NULL, 1, 4, NULL, 'Annulation gratuite 24h avant', 90, 'automatic', 'approved'),
    
    -- Activités complémentaires
    (v_off19, v_guide3_id, 'guide', NULL, v_cat_activity, 'Plongée Libre Korba',         'Plongée libre dans les eaux cristallines de Korba. Observation de la faune marine et des épaves sous-marines.', 60.00, '3h', 'activite', NULL, 'Équipement plongée, moniteur, assurance', 'Korba', 'Plage de Korba', 36.7570, 10.7250, 'Centre de plongée', 36.7570, 10.7250, 2, 8, 16, 'Annulation gratuite 72h avant', 85, 'manual', 'approved')
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- 6. NOUVEAUX CIRCUITS (diversification des destinations)
  -- ============================================================================
  INSERT INTO circuits (id, author_id, author_type, project_id, title, description, start_date, end_date, duration_days, duration_nights, region, base_price, currency, max_participants, confirmation_mode, inclusions, exclusions, lat, lng, address, status, images) VALUES
    -- Circuit Cyclotourisme Hammamet
    (v_cir7_id, v_guide4_id, 'guide', NULL, 'Aventure Cycliste Hammamet - Nabeul',
      'Circuit de 3 jours à vélo électrique entre Hammamet et Nabeul. Plages, forêts, médina et dégustations de citrons bio.',
      '2026-07-20', '2026-07-22', 3, 2, 'Nabeul', 380.00, 'TND', 12, 'automatic',
      'Vélos électriques, hébergement, repas, guide, transfert bagages',
      'Repas personnels, assurance',
      36.4020, 10.6300, 'Hammamet', 'approved', NULL),

    -- Circuit Culturel Hammamet - Carthage
    (v_cir8_id, v_guide5_id, 'guide', NULL, 'Trésors d''Hammamet et Carthage',
      'Circuit de 2 jours combinant l''histoire antique de Carthage et la médina d''Hammamet. Musées, archéologie et artisanat local.',
      '2026-08-05', '2026-08-06', 2, 1, 'Tunis', 320.00, 'TND', 15, 'manual',
      'Transport, hébergement, entrées musées, guide, repas',
      'Repas personnels, souvenirs',
      36.4020, 10.6300, 'Hammamet', 'approved', NULL),

    -- Circuit Nature Korba - Cap Bon
    (v_cir9_id, v_guide3_id, 'guide', NULL, 'Nature et Mer : Korba au Cap Bon',
      'Circuit de 3 jours entre Korba et le Cap Bon. Observation marine, randonnée côtière et dégustation de produits de la mer.',
      '2026-09-01', '2026-09-03', 3, 2, 'Cap Bon', 420.00, 'TND', 10, 'automatic',
      'Hébergement, repas, activités nautiques, guide, équipement',
      'Transport jusqu''à Korba, assurance',
      36.7570, 10.7250, 'Korba', 'approved', NULL)
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- 7. NOUVEAUX TRIP PLANS (plans de voyage diversifiés)
  -- ============================================================================
  INSERT INTO trip_plans (id, eco_traveler_id, title, description, start_date, end_date, status) VALUES
    (v_tp4_id, v_traveler4_id, 'Aventure Verte : Hammamet, Korba et Cap Bon',
      'Circuit de 8 jours à vélo et kayak. Découverte des côtes tunisiennes, forêts et plages. Écotourisme et gastronomie locale.',
      '2026-07-15', '2026-07-22', 'draft'),
    (v_tp5_id, v_traveler5_id, 'Randonnée Authentique : Matmata à Douz',
      'Trekking de 10 jours du sud tunisien. Matmata, Tataouine, Douz. Nuits sous les étoiles et rencontres avec les communautés locales.',
      '2026-08-10', '2026-08-19', 'draft'),
    (v_tp6_id, v_traveler4_id, 'Photographie Écologique : Trésors de Tunisie',
      'Circuit photo de 12 jours combinant paysages naturels et patrimoine culturel. Matmata, Hammamet, Korba, Douz.',
      '2026-09-15', '2026-09-26', 'draft')
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- 8. QUESTIONNAIRES DURABILITÉ (exemples)
  -- ============================================================================
  INSERT INTO sustainability_questionnaires (id, user_id, trip_id, score, total_questions, completed_at, responses) VALUES
    (UUID(), v_traveler4_id, v_tp4_id, 85, 20, NOW(), '{
      "transport": "velo_electrique",
      "hebergement": "eco_certifie",
      "alimentation": "locale_bio",
      "activites": "observation_nature",
      "impact_global": "positif"
    }'),
    (UUID(), v_traveler5_id, v_tp5_id, 92, 20, NOW(), '{
      "transport": "marche_velo",
      "hebergement": "chez_habitant",
      "alimentation": "traditionnelle",
      "activites": "culturel_local",
      "impact_global": "tres_positif"
    }'),
    (UUID(), v_fakerbennoomen_id, NULL, 78, 20, NOW(), '{
      "transport": "mixte",
      "hebergement": "hotel_eco",
      "alimentation": "locale",
      "activites": "diversifiees",
      "impact_global": "positif"
    }')
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- 9. IMAGES POUR OFFRES ET CIRCUITS (URLs Unsplash réelles)
  -- ============================================================================
  -- Mise à jour des offres avec des images Unsplash (format simple-array: url1,url2)
  UPDATE offers SET images = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80,https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800&q=80' WHERE id = v_off13;
  UPDATE offers SET images = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80,https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800&q=80' WHERE id = v_off14;
  UPDATE offers SET images = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80,https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80' WHERE id = v_off15;
  UPDATE offers SET images = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80,https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80' WHERE id = v_off16;
  UPDATE offers SET images = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80,https://images.unsplash.com/photo-1590595906931-81f04f0ccebb?w=800&q=80' WHERE id = v_off17;
  UPDATE offers SET images = 'https://images.unsplash.com/photo-1504457047772-27faf1c00561?w=800&q=80,https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80' WHERE id = v_off18;
  UPDATE offers SET images = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80,https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800&q=80' WHERE id = v_off19;

  -- Mise à jour des circuits avec des images Unsplash
  UPDATE circuits SET images = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80,https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80' WHERE id = v_cir7_id;
  UPDATE circuits SET images = 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80,https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80' WHERE id = v_cir8_id;
  UPDATE circuits SET images = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80,https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80' WHERE id = v_cir9_id;

  -- ============================================================================
  -- 10. MISE À JOUR DES DONNÉES EXISTANTES (ajout d''images Unsplash)
  -- ============================================================================
  UPDATE offers SET images = 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80,https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80' WHERE id = 'b1000000-0001-0000-0000-000000000001';
  UPDATE offers SET images = 'https://images.unsplash.com/photo-1504457047772-27faf1c00561?w=800&q=80,https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80' WHERE id = 'b1000000-0001-0000-0000-000000000002';
  UPDATE offers SET images = 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80,https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80' WHERE id = 'b1000000-0001-0000-0000-000000000004';
  UPDATE offers SET images = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80,https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800&q=80' WHERE id = 'b1000000-0001-0000-0000-000000000006';
  UPDATE offers SET images = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80,https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800&q=80' WHERE id = 'b1000000-0001-0000-0000-000000000007';
  UPDATE offers SET images = 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80,https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80' WHERE id = 'b1000000-0001-0000-0000-000000000012';

  UPDATE circuits SET images = 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80,https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80' WHERE id = '11000000-0001-0000-0000-000000000001';
  UPDATE circuits SET images = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80,https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80' WHERE id = '11000000-0001-0000-0000-000000000002';
  UPDATE circuits SET images = 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80,https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80' WHERE id = '11000000-0001-0000-0000-000000000003';

END $$;

COMMIT;