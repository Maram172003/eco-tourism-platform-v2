-- PARTIE 3b : Fix circuit days and contributions

-- 8. Jours de circuit avec programme (fixed time casting)
DO $$
DECLARE
  circ RECORD;
  day_id UUID;
  i INT;
BEGIN
  FOR circ IN SELECT id, title, duration_days, start_date FROM circuits WHERE status = 'approved' AND duration_days IS NOT NULL LOOP
    FOR i IN 1..circ.duration_days LOOP
      INSERT INTO circuit_days (id, circuit_id, day_number, date, title, description, lat, lng, location_name, created_at)
      VALUES (
        gen_random_uuid(), circ.id, i,
        CASE WHEN circ.start_date IS NOT NULL THEN circ.start_date + (i - 1) ELSE NULL END,
        CASE i
          WHEN 1 THEN 'Jour 1 : Arrivée et découverte'
          WHEN circ.duration_days THEN 'Jour ' || i || ' : Dernier jour et départ'
          ELSE 'Jour ' || i || ' : Exploration'
        END,
        CASE
          WHEN circ.title ILIKE '%sahara%' THEN
            CASE i
              WHEN 1 THEN 'Accueil et briefing. Première exploration des environs du désert.'
              WHEN 2 THEN 'Départ matinal pour une journée d''aventure dans les étendues désertiques.'
              WHEN 3 THEN 'Excursion aux oasis et sites remarquables. Déjeuner typique.'
              WHEN 4 THEN 'Randonnée dans le désert. Nuit en campement berbère sous les étoiles.'
              ELSE 'Retour et fin du circuit. Transfert vers l''aéroport.'
            END
          WHEN circ.title ILIKE '%djerba%' THEN
            CASE i
              WHEN 1 THEN 'Arrivée sur l''île. Installation et découverte d''Houmt Souk.'
              WHEN 2 THEN 'Visite des ateliers de poterie de Guellala et plages.'
              WHEN 3 THEN 'Journée plage et sports nautiques ou shopping.'
              ELSE 'Dernière journée et départ.'
            END
          WHEN circ.title ILIKE '%kroumirie%' OR circ.title ILIKE '%ain draham%' THEN
            CASE i
              WHEN 1 THEN 'Arrivée à Ain Draham. Installation en chalet et balade en forêt.'
              WHEN 2 THEN 'Randonnée guidée en forêt de Kroumirie. Cascade et pique-nique.'
              WHEN 3 THEN 'Visite des villages et artisanat local. Départ.'
              ELSE 'Activités libres et départ.'
            END
          WHEN circ.title ILIKE '%vtt%' OR circ.title ILIKE '%cycliste%' OR circ.title ILIKE '%vélo%' OR circ.title ILIKE '%hammamet%' THEN
            CASE i
              WHEN 1 THEN 'Accueil et préparation. Première sortie d''échauffement.'
              WHEN 2 THEN 'Étape principale à travers sentiers côtiers et forêts.'
              WHEN 3 THEN 'Dernière étape et retour. Partage des souvenirs.'
              ELSE 'Fin du circuit.'
            END
          WHEN circ.title ILIKE '%kairouan%' OR circ.title ILIKE '%sousse%' THEN
            CASE i
              WHEN 1 THEN 'Arrivée à Kairouan. Visite de la Grande Mosquée.'
              WHEN 2 THEN 'Excursion à Sousse. Médina et ribat classés UNESCO.'
              WHEN 3 THEN 'Visite du port El Kantaoui et départ.'
              ELSE 'Fin du circuit.'
            END
          WHEN circ.title ILIKE '%artisan%' OR circ.title ILIKE '%tunis%' THEN
            CASE i
              WHEN 1 THEN 'Arrivée à Tunis. Visite du Musée du Bardo.'
              WHEN 2 THEN 'Médina de Tunis et souks artisanaux.'
              WHEN 3 THEN 'Ateliers d''artisans et départ.'
              ELSE 'Fin du circuit.'
            END
          ELSE
            CASE i
              WHEN 1 THEN 'Début du circuit. Accueil et présentation du programme.'
              WHEN circ.duration_days THEN 'Dernier jour : clôture et départ.'
              ELSE 'Suite des explorations et activités prévues.'
            END
        END,
        36.0 + (random() * 2.0),
        10.0 + (random() * 1.5),
        CASE
          WHEN i = 1 THEN 'Point de départ'
          WHEN i = circ.duration_days THEN 'Point de fin'
          ELSE 'Étape du jour'
        END,
        NOW()
      ) RETURNING id INTO day_id;

      INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, created_at)
      VALUES
        (gen_random_uuid(), day_id,
         CASE i WHEN 1 THEN 'Accueil et briefing' WHEN circ.duration_days THEN 'Petit-déjeuner et départ' ELSE 'Petit-déjeuner' END,
         CASE i WHEN 1 THEN 'Présentation du circuit et rencontre avec le guide.' WHEN circ.duration_days THEN 'Dernier petit-déjeuner, échange des contacts.' ELSE 'Buffet petit-déjeuner avec produits locaux.' END,
         (CASE i WHEN 1 THEN '09:00' WHEN circ.duration_days THEN '08:00' ELSE '08:00' END)::time,
         (CASE i WHEN 1 THEN '10:00' WHEN circ.duration_days THEN '09:30' ELSE '09:00' END)::time,
         true, true, NOW());

      INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, created_at)
      VALUES
        (gen_random_uuid(), day_id,
         CASE WHEN i = circ.duration_days THEN 'Temps libre' ELSE 'Activité principale' END,
         CASE WHEN i = circ.duration_days THEN 'Derniers achats et promenade avant le départ.' ELSE 'Activité phare de la journée avec guide local.' END,
         '10:00'::time, '12:30'::time, true, false, NOW());

      INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, created_at)
      VALUES
        (gen_random_uuid(), day_id,
         CASE WHEN i = circ.duration_days THEN 'Cérémonie de clôture' ELSE 'Déjeuner' END,
         CASE WHEN i = circ.duration_days THEN 'Remise des souvenirs et verre de l''amitié.' ELSE 'Déjeuner typique dans un restaurant local.' END,
         '12:30'::time, '14:00'::time, true, false, NOW());
    END LOOP;
  END LOOP;
END $$;

-- 9. Circuit options (skip if already inserted)
INSERT INTO circuit_options (id, circuit_id, offer_item_id, option_group, option_type, is_required, is_included, extra_price, selection_mode, status, created_at)
SELECT gen_random_uuid(), c.id,
  (SELECT id FROM offer_items ORDER BY random() LIMIT 1),
  (ARRAY['transport', 'accommodation', 'equipment', 'activity', 'food'])[floor(random() * 5 + 1)::int],
  (ARRAY['single_choice', 'multiple_choice', 'quantity'])[floor(random() * 3 + 1)::int],
  random() < 0.2, random() < 0.15,
  (floor(random() * 200) + 20)::decimal(10,2),
  'optional', 'active', NOW()
FROM circuits c
WHERE c.status = 'approved'
AND NOT EXISTS (SELECT 1 FROM circuit_options co WHERE co.circuit_id = c.id)
LIMIT 20;

-- 10. Contributions (fixed enum casting)
INSERT INTO place_contributions (id, publication_id, user_id, user_role, type, content, vote_count, created_at)
SELECT gen_random_uuid(), p.id::uuid, u.user_id::uuid, u.role,
  (CASE floor(random() * 3)::int
    WHEN 0 THEN 'description'::place_contributions_type_enum
    WHEN 1 THEN 'description'::place_contributions_type_enum
    ELSE 'images'::place_contributions_type_enum
  END),
  (ARRAY[
    'Ce lieu est magnifique en automne quand les feuilles changent de couleur.',
    'Le coucher du soleil depuis ce point de vue est à couper le souffle. Arrivez vers 17h.',
    'Petit conseil : apportez de l''eau et des chaussures confortables.',
    'Accès gratuit et facile. Parking à proximité.',
    'Idéal pour les photographes, surtout au lever du jour.',
    'Prévoir une demi-journée pour bien profiter du site.'
  ])[floor(random() * 6 + 1)::int],
  floor(random() * 12)::int, NOW() - (random() * interval '15 days')
FROM (VALUES
  ('a1000001-0001-0000-0000-000000000001'::uuid),
  ('a1000001-0001-0000-0000-000000000002'::uuid),
  ('a1000001-0001-0000-0000-000000000003'::uuid),
  ('a1000001-0001-0000-0000-000000000004'::uuid),
  ('a1000001-0001-0000-0000-000000000005'::uuid),
  ('a1000001-0001-0000-0000-000000000006'::uuid)
) AS p(id)
CROSS JOIN (VALUES
  ('7b83e87d-276d-4d89-bb00-ab8ea1243a14'::uuid, 'eco_traveler'),
  ('a602737a-b07d-4a41-b9c3-cdf1be17036a'::uuid, 'eco_traveler'),
  ('b09808ee-30a9-4089-bbf7-698e73004ef4'::uuid, 'eco_traveler')
) AS u(user_id, role)
LIMIT 12;

-- Votes sur les contributions
INSERT INTO contribution_votes (id, contribution_id, user_id, created_at)
SELECT gen_random_uuid(), pc.id, u.user_id::uuid, NOW() - (random() * interval '10 days')
FROM place_contributions pc
CROSS JOIN (VALUES
  ('7b83e87d-276d-4d89-bb00-ab8ea1243a14'::uuid),
  ('a602737a-b07d-4a41-b9c3-cdf1be17036a'::uuid),
  ('90b4c5bf-4a47-4737-b033-f7385e22a2e6'::uuid),
  ('87a38946-9a54-4bb4-be4a-887be312af15'::uuid)
) AS u(user_id)
WHERE random() < 0.4
LIMIT 20;

-- Recalculate popularity scores
UPDATE publications p SET popularity_score = (
  SELECT COALESCE(COUNT(DISTINCT pl.id), 0)
    + COALESCE(COUNT(DISTINCT pc.id), 0) * 2
    + COALESCE(COUNT(DISTINCT pcc.id), 0) * 3
  FROM publications p2
  LEFT JOIN publication_likes pl ON pl.publication_id = p2.id
  LEFT JOIN publication_comments pc ON pc.publication_id = p2.id
  LEFT JOIN place_contributions pcc ON pcc.publication_id = p2.id
  WHERE p2.id = p.id
  GROUP BY p2.id
)
WHERE p.type = 'place' AND p.status = 'approved';
