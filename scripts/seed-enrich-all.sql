-- ============================================================================
-- ENRICHISSEMENT COMPLET : Circuits, images, guides
-- 1. Transférer les circuits des guides → fakerbennoomen@gmail.com
-- 2. Corriger le format des images (simple-array)
-- 3. Ajouter des jours/activités aux circuits incomplets
-- 4. Associer des guides aux activités
-- ============================================================================
BEGIN;

-- ============================================================================
-- CONSTANTES
-- ============================================================================
-- Project owner
DO $$
DECLARE
  v_proj_id CONSTANT uuid := '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e';
  -- Guides disponibles
  v_guide_fa   CONSTANT uuid := '87a38946-9a54-4bb4-be4a-887be312af15';
  v_guide_kari CONSTANT uuid := '6fb2d1e7-39db-4152-b9b5-5b440f551cc9';
  v_guide_yasm CONSTANT uuid := 'faa9c369-1141-4730-b573-0551c8341ab9';
  v_guide_mehd CONSTANT uuid := '6f51888f-7128-4294-8586-5c349eef66d8';
  v_guide_ines CONSTANT uuid := '361d089f-142f-4e4f-b114-137f072d3326';
  v_guide_bibe CONSTANT uuid := '9ff1490e-0b03-4bcb-9180-e67d1c3b372a';

  -- Circuits IDs (guides à transférer)
  v_cir_aventure_cycliste CONSTANT uuid := '55000000-0001-0000-0000-000000000020';
  v_cir_vtt              CONSTANT uuid := '55000000-0001-0000-0000-000000000021';
  v_cir_tresors          CONSTANT uuid := '55000000-0001-0000-0000-000000000022';
  v_cir_magie_sahara     CONSTANT uuid := '11000000-0001-0000-0000-000000000001';
  v_cir_djerba           CONSTANT uuid := '11000000-0001-0000-0000-000000000002';
  v_cir_trek_kroumirie   CONSTANT uuid := '11000000-0001-0000-0000-000000000003';
  v_cir_oasis            CONSTANT uuid := '11000000-0001-0000-0000-000000000004';
  v_cir_ksour            CONSTANT uuid := '11000000-0001-0000-0000-000000000005';
  v_cir_kerkennah        CONSTANT uuid := '11000000-0001-0000-0000-000000000006';
BEGIN

  -- ============================================================================
  -- 1. TRANSFÉRER TOUS LES CIRCUITS DES GUIDES AU PROJECT OWNER
  -- ============================================================================
  UPDATE circuits SET author_id = v_proj_id, author_type = 'project_owner'
  WHERE author_id IN (v_guide_fa, v_guide_kari, v_guide_yasm, v_guide_mehd, v_guide_ines, v_guide_bibe)
    AND author_type = 'guide';

  -- ============================================================================
  -- 2. CORRIGER LE FORMAT DES IMAGES (simple-array = CSV sans guillemets)
  -- ============================================================================
  -- Circuits : enlever les guillemets et accolades
  UPDATE circuits SET images = regexp_replace(images::text, '["{}]', '', 'g')
  WHERE images IS NOT NULL AND images::text LIKE '{"%';

  -- Places : enlever les guillemets et accolades
  UPDATE publications SET images = regexp_replace(images::text, '["{}]', '', 'g')
  WHERE images IS NOT NULL AND images::text LIKE '{"%' AND type = 'place';

  -- ============================================================================
  -- 3. CRÉER LES JOURS ET ACTIVITÉS MANQUANTS
  -- ============================================================================

  -- ==========================================
  -- Circuit Aventure Cycliste Hammamet - Nabeul (3 jours)
  -- ==========================================
  UPDATE circuits SET duration_days = 3, duration_nights = 2
  WHERE id = v_cir_aventure_cycliste;

  -- Jour 1
  INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name)
  VALUES ('d1000000-0002-4000-8000-000000000001', v_cir_aventure_cycliste, 1,
   'Parcours Côtier Hammamet - Nabeul',
   'Balade à vélo le long de la côte entre Hammamet et Nabeul. Découverte des plages, criques et ports de pêche.',
   36.4000, 10.6200, 'Hammamet')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, duration_minutes, distance_km, transport_mode, guide_id, guide_name)
  VALUES
    ('d2000000-0002-4000-8000-000000000001', 'd1000000-0002-4000-8000-000000000001',
     'Accueil et location des vélos', 'Distribution des VTT électriques, briefing sécurité et remise du roadbook.',
     '08:00', '09:00', true, true, 60, 0, null, null, null),
    ('d2000000-0002-4000-8000-000000000002', 'd1000000-0002-4000-8000-000000000001',
     'Piste Cyclable Hammamet - Yasmine', 'Parcours sécurisé le long de la baie d''Hammamet avec vues panoramiques.',
     '09:00', '11:00', true, true, 120, 18, '🚲 Vélo', v_guide_fa, 'Fa Ker Bennoomen'),
    ('d2000000-0002-4000-8000-000000000003', 'd1000000-0002-4000-8000-000000000001',
     'Pause Plage et Rafraîchissement', 'Arrêt à la plage de Yasmine pour une baignade et un thé à la menthe.',
     '11:00', '12:30', true, true, 90, 0, null, null, null)
  ON CONFLICT (id) DO NOTHING;

  -- Jour 2
  INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name)
  VALUES ('d1000000-0002-4000-8000-000000000002', v_cir_aventure_cycliste, 2,
   'Korbous et Sources Thermales',
   'Parcours plus exigeant vers Korbous avec ses sources chaudes et ses paysages de falaises.',
   36.8160, 10.5700, 'Korbous')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, duration_minutes, distance_km, transport_mode, guide_id, guide_name)
  VALUES
    ('d2000000-0002-4000-8000-000000000004', 'd1000000-0002-4000-8000-000000000002',
     'Départ VTT vers Korbous', 'Montée progressive à travers les collines avec vue sur le Cap Bon.',
     '07:30', '10:00', true, true, 150, 22, '🚲 Vélo', v_guide_fa, 'Fa Ker Bennoomen'),
    ('d2000000-0002-4000-8000-000000000005', 'd1000000-0002-4000-8000-000000000002',
     'Baignade Sources Thermales', 'Détente aux sources chaudes naturelles de Korbous en bord de mer.',
     '10:30', '12:00', true, true, 90, 0, null, null, null),
    ('d2000000-0002-4000-8000-000000000006', 'd1000000-0002-4000-8000-000000000002',
     'Déjeuner Poisson Grillé', 'Déjeuner de poissons frais au port de pêche de Korbous.',
     '12:00', '13:30', true, false, 90, 0, null, null, null)
  ON CONFLICT (id) DO NOTHING;

  -- Jour 3
  INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name)
  VALUES ('d1000000-0002-4000-8000-000000000003', v_cir_aventure_cycliste, 3,
   'Retour par l''Arrière-Pays',
   'Retour vers Hammamet par les routes de campagne et les villages agricoles.',
   36.5550, 10.5750, 'Menzel Bouzelfa')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, duration_minutes, distance_km, transport_mode, guide_id, guide_name)
  VALUES
    ('d2000000-0002-4000-8000-000000000007', 'd1000000-0002-4000-8000-000000000003',
     'Traversée Vergers de Menzel Bouzelfa', 'Balade à vélo à travers les orangeraies et oliveraies.',
     '08:00', '10:00', true, true, 120, 15, '🚲 Vélo', v_guide_fa, 'Fa Ker Bennoomen'),
    ('d2000000-0002-4000-8000-000000000008', 'd1000000-0002-4000-8000-000000000003',
     'Dégustation Produits Locaux', 'Dégustation d''huile d''olive, miel et agrumes chez un producteur local.',
     '10:00', '11:30', true, true, 90, 0, null, null, null),
    ('d2000000-0002-4000-8000-000000000009', 'd1000000-0002-4000-8000-000000000003',
     'Retour à Hammamet et Clôture', 'Descente vers Hammamet. Rangement des vélos et pot de clôture.',
     '11:30', '13:00', true, true, 90, 12, '🚲 Vélo', null, null)
  ON CONFLICT (id) DO NOTHING;

  -- ==========================================
  -- Circuit Aventure VTT : Hammamet à Korbous (3 jours)
  -- ==========================================
  UPDATE circuits SET duration_days = 3, duration_nights = 2
  WHERE id = v_cir_vtt;

  -- Jour 1
  INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name)
  VALUES ('d1000000-0002-4000-8000-000000000011', v_cir_vtt, 1,
   'Single Tracks et Forêts de Hammamet',
   'Premier jour sur les sentiers VTT autour d''Hammamet. Forêts de pins et descentes techniques.',
   36.3800, 10.5800, 'Hammamet')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, duration_minutes, distance_km, transport_mode, guide_id, guide_name)
  VALUES
    ('d2000000-0002-4000-8000-000000000011', 'd1000000-0002-4000-8000-000000000011',
     'Briefing et Équipement', 'Accueil, vérification des VTT et équipement de protection.',
     '08:00', '09:00', true, true, 60, 0, null, null, null),
    ('d2000000-0002-4000-8000-000000000012', 'd1000000-0002-4000-8000-000000000011',
     'Descente Forêt de Pinède', 'Single tracks en sous-bois. Descentes techniques et virages serrés.',
     '09:00', '12:00', true, true, 180, 20, '🚲 Vélo', v_guide_kari, 'Karim Bouazizi'),
    ('d2000000-0002-4000-8000-000000000013', 'd1000000-0002-4000-8000-000000000011',
     'Déjeuner Pique-nique Forêt', 'Pique-nique en forêt préparé par un traiteur local.',
     '12:00', '13:30', true, true, 90, 0, null, null, null)
  ON CONFLICT (id) DO NOTHING;

  -- Jour 2
  INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name)
  VALUES ('d1000000-0002-4000-8000-000000000012', v_cir_vtt, 2,
   'Traversée des Collines du Cap Bon',
   'Journée intense à travers les collines du Cap Bon avec des montées exigeantes et des descentes techniques.',
   36.6500, 10.6000, 'Cap Bon')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, duration_minutes, distance_km, transport_mode, guide_id, guide_name)
  VALUES
    ('d2000000-0002-4000-8000-000000000014', 'd1000000-0002-4000-8000-000000000012',
     'Montée vers le Djebel Sidi Abdallah', 'Montée technique avec passages rocailleux. Vue panoramique au sommet.',
     '07:30', '10:30', true, true, 180, 15, '🚲 Vélo', v_guide_kari, 'Karim Bouazizi'),
    ('d2000000-0002-4000-8000-000000000015', 'd1000000-0002-4000-8000-000000000012',
     'Descente sur Korbous', 'Longue descente rapide à travers les vignobles et oliveraies.',
     '10:30', '12:00', true, true, 90, 12, '🚲 Vélo', null, null),
    ('d2000000-0002-4000-8000-000000000016', 'd1000000-0002-4000-8000-000000000012',
     'Déjeuner et Détente', 'Déjeuner réparateur et baignade optionnelle à Korbous.',
     '12:00', '14:00', true, true, 120, 0, null, null, null)
  ON CONFLICT (id) DO NOTHING;

  -- Jour 3
  INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name)
  VALUES ('d1000000-0002-4000-8000-000000000013', v_cir_vtt, 3,
   'Boucle Côtière et Retour',
   'Dernière journée en VTT le long de la côte. Retour vers le point de départ avec arrêts baignade.',
   36.4000, 10.6200, 'Hammamet')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, duration_minutes, distance_km, transport_mode, guide_id, guide_name)
  VALUES
    ('d2000000-0002-4000-8000-000000000017', 'd1000000-0002-4000-8000-000000000013',
     'Boucle Côtière Korbous - Hammamet', 'Dernière session VTT le long du littoral. Vues imprenables sur la mer.',
     '08:00', '10:30', true, true, 150, 20, '🚲 Vélo', v_guide_fa, 'Fa Ker Bennoomen'),
    ('d2000000-0002-4000-8000-000000000018', 'd1000000-0002-4000-8000-000000000013',
     'Cascade de Sidi M''hamed', 'Découverte de la petite cascade et baignade rafraîchissante.',
     '10:30', '12:00', true, true, 90, 0, '🥾 À pied', null, null),
    ('d2000000-0002-4000-8000-000000000019', 'd1000000-0002-4000-8000-000000000013',
     'Déjeuner de Clôture', 'Déjeuner barbecue sur la plage avec produits locaux grillés.',
     '12:00', '13:30', true, true, 90, 0, null, null, null)
  ON CONFLICT (id) DO NOTHING;

  -- ==========================================
  -- Circuit Trésors Artisanaux de Tunisie (3 jours)
  -- ==========================================
  UPDATE circuits SET duration_days = 3, duration_nights = 2
  WHERE id = v_cir_tresors;

  -- Jour 1
  INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name)
  VALUES ('d1000000-0002-4000-8000-000000000021', v_cir_tresors, 1,
   'Médina de Tunis et Souks',
   'Exploration des souks artisanaux de la Médina de Tunis. Découverte des métiers traditionnels.',
   36.7990, 10.1680, 'Tunis')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, duration_minutes, distance_km, transport_mode, guide_id, guide_name)
  VALUES
    ('d2000000-0002-4000-8000-000000000021', 'd1000000-0002-4000-8000-000000000021',
     'Visite des Souks de la Médina', 'Parcours guidé à travers les souks : cuivre, bijoux, tissage, parfums.',
     '09:00', '12:00', true, true, 180, 2, '🥾 À pied', v_guide_yasm, 'Yasmine Bouassida'),
    ('d2000000-0002-4000-8000-000000000022', 'd1000000-0002-4000-8000-000000000021',
     'Atelier Tissage Traditionnel', 'Démonstration de tissage traditionnel et initiation au métier à tisser.',
     '12:00', '14:00', true, true, 120, 0, null, null, null),
    ('d2000000-0002-4000-8000-000000000023', 'd1000000-0002-4000-8000-000000000021',
     'Déjeuner au Dar El Jeld', 'Déjeuner gastronomique dans un palais de la médina.',
     '14:00', '15:30', true, true, 90, 0, null, null, null)
  ON CONFLICT (id) DO NOTHING;

  -- Jour 2
  INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name)
  VALUES ('d1000000-0002-4000-8000-000000000022', v_cir_tresors, 2,
   'Poterie et Céramique de Nabeul',
   'Journée dédiée à la poterie et la céramique dans la ville de Nabeul. Visite d''ateliers et pratique.',
   36.4560, 10.7340, 'Nabeul')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, duration_minutes, distance_km, transport_mode, guide_id, guide_name)
  VALUES
    ('d2000000-0002-4000-8000-000000000024', 'd1000000-0002-4000-8000-000000000022',
     'Atelier Poterie Traditionnelle', 'Initiation à la poterie de Nabeul avec un maître artisan.',
     '09:00', '12:00', true, true, 180, 0, null, v_guide_yasm, 'Yasmine Bouassida'),
    ('d2000000-0002-4000-8000-000000000025', 'd1000000-0002-4000-8000-000000000022',
     'Visite du Marché de Nabeul', 'Marché hebdomadaire de l''artisanat : poteries, paniers, tapis.',
     '12:00', '13:00', true, true, 60, 0, '🥾 À pied', null, null),
    ('d2000000-0002-4000-8000-000000000026', 'd1000000-0002-4000-8000-000000000022',
     'Déjeuner au Port de Pêche', 'Déjeuner de spécialités marines au port de pêche de Nabeul.',
     '13:00', '14:30', true, true, 90, 0, null, null, null)
  ON CONFLICT (id) DO NOTHING;

  -- Jour 3
  INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name)
  VALUES ('d1000000-0002-4000-8000-000000000023', v_cir_tresors, 3,
   'Maroquinerie et Parfums',
   'Découverte du travail du cuir à Tunis et des parfumeries artisanales.',
   36.7990, 10.1680, 'Tunis')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, duration_minutes, distance_km, transport_mode, guide_id, guide_name)
  VALUES
    ('d2000000-0002-4000-8000-000000000027', 'd1000000-0002-4000-8000-000000000023',
     'Atelier Maroquinerie', 'Visite d''un atelier de maroquinerie artisanale. Initiation à la gravure sur cuir.',
     '09:00', '11:00', true, true, 120, 0, null, v_guide_yasm, 'Yasmine Bouassida'),
    ('d2000000-0002-4000-8000-000000000028', 'd1000000-0002-4000-8000-000000000023',
     'Parfumerie Artisanale', 'Découverte des parfums traditionnels tunisiens. Création de votre parfum.',
     '11:00', '12:30', true, true, 90, 0, null, null, null),
    ('d2000000-0002-4000-8000-000000000029', 'd1000000-0002-4000-8000-000000000023',
     'Déjeuner et fin du circuit', 'Déjeuner de clôture dans un restaurant typique. Remise des certificats.',
     '12:30', '14:00', true, true, 90, 0, null, null, null)
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- 4. ENRICHIR LES CIRCUITS EXISTANTS AVEC MOINS DE 3 ACTIVITÉS PAR JOUR
  -- ============================================================================

  -- ==========================================
  -- Circuit Magie du Sahara (4 jours)
  -- Day 2 : ajouter activités manquantes
  -- ==========================================
  INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, duration_minutes, distance_km, transport_mode, guide_id, guide_name)
  VALUES
    -- Day 2 (Tozeur) - already has 2 items, need 1 more
    ('d2000000-0002-4000-8000-000000000031', '12000000-0001-0000-0000-000000000002',
     'Visite du Village Artisanal', 'Découverte des ateliers d''artisans de Tozeur et des métiers traditionnels.',
     '14:00', '16:00', true, true, 120, 0, '🥾 À pied', v_guide_bibe, 'Biber'),
    -- Day 3 (Tamerza) - 0 items, create 3
    ('d2000000-0002-4000-8000-000000000032', '12000000-0001-0000-0000-000000000003',
     'Randonnée Gorges de Tamerza', 'Randonnée dans les gorges de Tamerza. Cascades et oasis.',
     '08:00', '11:00', true, true, 180, 6, '🥾 À pied', v_guide_kari, 'Karim Bouazizi'),
    ('d2000000-0002-4000-8000-000000000033', '12000000-0001-0000-0000-000000000003',
     'Déjeuner à Tamerza', 'Déjeuner typique dans une oasis de montagne.',
     '11:00', '12:30', true, true, 90, 0, null, null, null),
    ('d2000000-0002-4000-8000-000000000034', '12000000-0001-0000-0000-000000000003',
     'Piscine Naturelle et Détente', 'Baignade dans les vasques naturelles formées par la cascade.',
     '12:30', '14:00', true, false, 90, 0, null, null, null),
    -- Day 4 (Tataouine) - 0 items, create 3
    ('d2000000-0002-4000-8000-000000000035', '12000000-0001-0000-0000-000000000004',
     'Visite des Ksour de Tataouine', 'Découverte des ksour et greniers fortifiés de la région.',
     '08:00', '11:00', true, true, 180, 3, '🥾 À pied', v_guide_bibe, 'Biber'),
    ('d2000000-0002-4000-8000-000000000036', '12000000-0001-0000-0000-000000000004',
     'Déjeuner chez l''Habitant', 'Repas traditionnel chez une famille berbère.',
     '11:00', '12:30', true, true, 90, 0, null, null, null),
    ('d2000000-0002-4000-8000-000000000037', '12000000-0001-0000-0000-000000000004',
     'Retour vers le point de départ', 'Transfert retour avec arrêts photos dans les paysages du désert.',
     '12:30', '15:00', true, true, 150, 0, '🚐 Van', null, null)
  ON CONFLICT (id) DO NOTHING;

  -- ==========================================
  -- Circuit Djerba Authentique (3 jours)
  -- ==========================================
  -- Day 1 (Houmt Souk) - 2 items, need 1+ more
  INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, duration_minutes, distance_km, transport_mode, guide_id, guide_name)
  VALUES
    ('d2000000-0002-4000-8000-000000000041', '12000000-0001-0000-0000-000000000005',
     'Marché de Houmt Souk', 'Découverte du marché couvert de Houmt Souk : épices, artisanat, poissons séchés.',
     '09:00', '10:30', true, true, 90, 0, '🥾 À pied', v_guide_mehd, 'Mehdi Sassi'),
    -- Day 2 (Plages Secrètes) - 0 items
    ('d2000000-0002-4000-8000-000000000042', '12000000-0001-0000-0000-000000000006',
     'Kayak dans la Mangrove', 'Balade en kayak dans la mangrove de Sidi Jmour. Observation des flamants roses.',
     '08:00', '11:00', true, true, 180, 5, '🛶 Kayak', v_guide_mehd, 'Mehdi Sassi'),
    ('d2000000-0002-4000-8000-000000000043', '12000000-0001-0000-0000-000000000006',
     'Plage Secrète et Snorkeling', 'Détente sur une plage sauvage. Snorkeling dans les eaux cristallines.',
     '11:00', '13:00', true, true, 120, 0, null, null, null),
    ('d2000000-0002-4000-8000-000000000044', '12000000-0001-0000-0000-000000000006',
     'Déjeuner Plage', 'Déjeuner pique-nique les pieds dans l''eau.',
     '13:00', '14:00', true, true, 60, 0, null, null, null),
    -- Day 3 (Guellala) - 0 items
    ('d2000000-0002-4000-8000-000000000045', '12000000-0001-0000-0000-000000000007',
     'Musée de la Poterie Guellala', 'Visite du musée de la poterie et démonstration d''un maître potier.',
     '09:00', '11:00', true, true, 120, 0, '🥾 À pied', v_guide_mehd, 'Mehdi Sassi'),
    ('d2000000-0002-4000-8000-000000000046', '12000000-0001-0000-0000-000000000007',
     'Atelier Poterie', 'Initiation au tour de potier avec les artisans locaux.',
     '11:00', '12:30', true, true, 90, 0, null, null, null),
    ('d2000000-0002-4000-8000-000000000047', '12000000-0001-0000-0000-000000000007',
     'Déjeuner Gastronomique Djerbien', 'Déjeuner traditionnel djerbien dans un restaurant typique.',
     '12:30', '14:00', true, true, 90, 0, null, null, null)
  ON CONFLICT (id) DO NOTHING;

  -- ==========================================
  -- Circuit Trek Kroumirie (3 jours)
  -- ==========================================
  INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, duration_minutes, distance_km, transport_mode, guide_id, guide_name)
  VALUES
    -- Day 1 (Forêt) - 2 items
    ('d2000000-0002-4000-8000-000000000051', '12000000-0001-0000-0000-000000000008',
     'Randonnée Chênes-Lièges', 'Randonnée guidée dans la forêt millénaire avec un garde forestier.',
     '09:00', '12:00', true, true, 180, 8, '🥾 À pied', v_guide_fa, 'Fa Ker Bennoomen'),
    -- Day 2 (Beni Mtir) - 0 items
    ('d2000000-0002-4000-8000-000000000052', '12000000-0001-0000-0000-000000000009',
     'Randonnée aux Cascades', 'Randonnée jusqu''aux cascades de Beni Mtir. Baignade et pique-nique.',
     '08:00', '12:00', true, true, 240, 10, '🥾 À pied', v_guide_fa, 'Fa Ker Bennoomen'),
    ('d2000000-0002-4000-8000-000000000053', '12000000-0001-0000-0000-000000000009',
     'Pique-nique aux Cascades', 'Déjeuner pique-nique au pied des cascades.',
     '12:00', '13:30', true, true, 90, 0, null, null, null),
    ('d2000000-0002-4000-8000-000000000054', '12000000-0001-0000-0000-000000000009',
     'Retour à l''Éco-Lodge', 'Descente tranquille vers l''hébergement. Détente.',
     '13:30', '15:00', true, false, 90, 4, '🥾 À pied', null, null),
    -- Day 3 (Sources Thermales) - 0 items
    ('d2000000-0002-4000-8000-000000000055', '12000000-0001-0000-0000-000000000010',
     'Bain Thermal Hammam Bourguiba', 'Baignade dans les sources d''eau chaude naturelles.',
     '09:00', '11:00', true, true, 120, 0, null, v_guide_fa, 'Fa Ker Bennoomen'),
    ('d2000000-0002-4000-8000-000000000056', '12000000-0001-0000-0000-000000000010',
     'Visite Village Berbère', 'Découverte du village berbère traditionnel et rencontre avec les habitants.',
     '11:00', '12:30', true, true, 90, 1, '🥾 À pied', null, null),
    ('d2000000-0002-4000-8000-000000000057', '12000000-0001-0000-0000-000000000010',
     'Déjeuner et Clôture', 'Déjeuner traditionnel et fin du circuit.',
     '12:30', '14:00', true, true, 90, 0, null, null, null)
  ON CONFLICT (id) DO NOTHING;

  -- ==========================================
  -- Circuit Ksour de Tataouine (3 jours)
  -- Day 1 (Ksour Fortifiés) - 0 items
  -- ==========================================
  INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, duration_minutes, distance_km, transport_mode, guide_id, guide_name)
  VALUES
    ('d2000000-0002-4000-8000-000000000061', '12000000-0001-0000-0000-000000000013',
     'Visite Ksar Ouled Soltane', 'Le plus beau ksar de Tunisie. Greniers à grains superposés. Architecture unique.',
     '09:00', '11:00', true, true, 120, 1, '🥾 À pied', v_guide_fa, 'Fa Ker Bennoomen'),
    ('d2000000-0002-4000-8000-000000000062', '12000000-0001-0000-0000-000000000013',
     'Visite Ksar Hadada', 'Ksar Hadada, célèbre pour avoir servi de décor à Star Wars. Musée du film.',
     '11:00', '12:30', true, true, 90, 0, '🥾 À pied', null, null),
    ('d2000000-0002-4000-8000-000000000063', '12000000-0001-0000-0000-000000000013',
     'Déjeuner à Tataouine', 'Déjeuner en ville. Spécialités locales.',
     '12:30', '14:00', true, true, 90, 0, null, null, null),
    -- Day 2 (Chenini) - 0 items. day_number=2 → id=12000000-0001-0000-0000-000000000014
    ('d2000000-0002-4000-8000-000000000064', '12000000-0001-0000-0000-000000000014',
     'Randonnée Village de Chenini', 'Montée au village perché de Chenini. Mosquée troglodyte et panorama.',
     '09:00', '12:00', true, true, 180, 3, '🥾 À pied', v_guide_fa, 'Fa Ker Bennoomen'),
    ('d2000000-0002-4000-8000-000000000065', '12000000-0001-0000-0000-000000000014',
     'Rencontre Famille Berbère', 'Thé et pâtisseries chez une famille berbère. Histoires et traditions.',
     '12:00', '13:30', true, true, 90, 0, null, null, null),
    ('d2000000-0002-4000-8000-000000000066', '12000000-0001-0000-0000-000000000014',
     'Déjeuner Panorama', 'Déjeuner avec vue imprenable sur la plaine de Tataouine.',
     '13:30', '14:30', true, true, 60, 0, null, null, null)
  ON CONFLICT (id) DO NOTHING;

  -- ==========================================
  -- Circuit Île de Kerkennah (3 jours)
  -- ==========================================
  INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, duration_minutes, distance_km, transport_mode, guide_id, guide_name)
  VALUES
    -- Day 1 (Ferry & Découverte) - 0 items. id=12000000-0001-0000-0000-000000000015
    ('d2000000-0002-4000-8000-000000000071', '12000000-0001-0000-0000-000000000015',
     'Traversée en Ferry Sfax-Kerkennah', 'Traversée matinale vers l''archipel. Observation des oiseaux marins.',
     '07:00', '09:30', true, true, 150, 0, '🚢 Ferry', null, null),
    ('d2000000-0002-4000-8000-000000000072', '12000000-0001-0000-0000-000000000015',
     'Tour de l''Île en Calèche', 'Découverte de l''île en calèche traditionnelle. Palmeraies et plages sauvages.',
     '09:30', '12:30', true, true, 180, 15, '🐴 Calèche', v_guide_ines, 'Ines Gharbi'),
    ('d2000000-0002-4000-8000-000000000073', '12000000-0001-0000-0000-000000000015',
     'Déjeuner Poisson Frais', 'Déjeuner au port de pêche. Poissons grillés et salade mechouia.',
     '12:30', '14:00', true, true, 90, 0, null, null, null),
    -- Day 2 (Pêche Charfia) - already 2 items
    ('d2000000-0002-4000-8000-000000000074', '12000000-0001-0000-0000-000000000018',
     'Initiation Pêche Charfia', 'Découverte de la technique de pêche traditionnelle aux charfias. Participation active.',
     '08:00', '11:00', true, true, 180, 3, '🛶 Barque', v_guide_ines, 'Ines Gharbi'),
    -- Day 3 (Coucher Soleil) - already 2 items, need 1 more
    ('d2000000-0002-4000-8000-000000000075', '12000000-0001-0000-0000-000000000019',
     'Promenade Coucher de Soleil', 'Promenade digestive sur la plage d''El Alia au coucher du soleil.',
     '17:00', '18:30', true, true, 90, 2, '🥾 À pied', null, null)
  ON CONFLICT (id) DO NOTHING;

  -- ==========================================
  -- Circuit Oasis et Chott el Jerid (déjà project owner)
  -- Day 1 (Tozeur) - 2 items, need 1 more
  -- ==========================================
  INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, duration_minutes, distance_km, transport_mode, guide_id, guide_name)
  VALUES
    ('d2000000-0002-4000-8000-000000000081', '12000000-0001-0000-0000-000000000011',
     'Piscine Naturelle Oasis', 'Baignade dans les bassins naturels de l''oasis. Détente à l''ombre des palmiers.',
     '15:00', '16:30', true, false, 90, 0, null, null, null),
    -- Day 2 (Chott el Jerid) - 0 items. id=12000000-0001-0000-0000-000000000012
    ('d2000000-0002-4000-8000-000000000082', '12000000-0001-0000-0000-000000000012',
     'Traversée du Chott el Jerid', 'Marche sur les grandes plaines de sel. Illusions d''optique et mirages.',
     '08:00', '10:00', true, true, 120, 0, '🚐 Van', v_guide_kari, 'Karim Bouazizi'),
    ('d2000000-0002-4000-8000-000000000083', '12000000-0001-0000-0000-000000000012',
     'Oasis de Tamerza', 'Découverte de Tamerza, plus grande oasis de montagne. Cascades et palmeraie.',
     '10:30', '12:30', true, true, 120, 0, '🥾 À pied', v_guide_bibe, 'Biber'),
    ('d2000000-0002-4000-8000-000000000084', '12000000-0001-0000-0000-000000000012',
     'Déjeuner Oasis', 'Déjeuner dans une oasis traditionnelle. Spécialités locales.',
     '12:30', '14:00', true, true, 90, 0, null, null, null)
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- 5. METTRE À JOUR LES JOURS MANQUANTS (duration_days)
  -- ============================================================================
  UPDATE circuits SET duration_days = 3, duration_nights = 2
  WHERE duration_days IS NULL OR duration_days < 3;

  -- ============================================================================
  -- 6. AJOUTER DES IMAGES AUX CIRCUITS QUI EN ONT BESOIN
  -- ============================================================================
  UPDATE circuits SET images = 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80,https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80,https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80'
  WHERE id = v_cir_aventure_cycliste AND images IS NULL;

  UPDATE circuits SET images = 'https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=800&q=80,https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80,https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80'
  WHERE id = v_cir_vtt AND images IS NULL;

  UPDATE circuits SET images = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80,https://images.unsplash.com/photo-1590595906931-81f04f0ccebb?w=800&q=80,https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80'
  WHERE id = v_cir_tresors AND images IS NULL;

  -- ============================================================================
  -- 7. METTRE À JOUR LES IMAGES DES PLACES QUI ONT UN FORMAT INCORRECT
  -- ============================================================================
  -- Les images des places ont déjà été corrigées plus haut (suppression des guillemets)
  -- Maintenant on remplace les anciennes images Unsplash par des plus pertinentes
  UPDATE publications SET images = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80,https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80'
  WHERE id = 'f0000000-0001-4000-8000-000000000020';  -- Source Thermale

  UPDATE publications SET images = 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80,https://images.unsplash.com/photo-1504457047772-27faf1c00561?w=800&q=80'
  WHERE id = 'f0000000-0001-4000-8000-000000000021';  -- Ksar Gharb

  UPDATE publications SET images = 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80,https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80,https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80'
  WHERE id = 'f0000000-0001-4000-8000-000000000022';  -- Éco-Lodge Kroumirie

END $$;

COMMIT;
