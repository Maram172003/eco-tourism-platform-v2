-- ============================================================================
-- Seed: 10+ guides with mdp 17092001
-- Emails based on amirbennoomen@gmail.com with dot variations (Gmail ignores dots)
-- bcrypt hash for "17092001": $2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC
-- ============================================================================
BEGIN;

INSERT INTO users (id, email, password, auth_method, role, status, email_verified_at)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'amir.bennoomen@gmail.com', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'guide', 'active', NOW()),
  ('a0000000-0000-0000-0000-000000000002', 'a.mir.bennoomen@gmail.com', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'guide', 'active', NOW()),
  ('a0000000-0000-0000-0000-000000000003', 'am.ir.bennoomen@gmail.com', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'guide', 'active', NOW()),
  ('a0000000-0000-0000-0000-000000000004', 'ami.r.bennoomen@gmail.com', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'guide', 'active', NOW()),
  ('a0000000-0000-0000-0000-000000000005', 'a.m.i.r.bennoomen@gmail.com', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'guide', 'active', NOW()),
  ('a0000000-0000-0000-0000-000000000006', 'amirbennoomen.guide1@gmail.com', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'guide', 'active', NOW()),
  ('a0000000-0000-0000-0000-000000000007', 'amirbennoomen.guide2@gmail.com', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'guide', 'active', NOW()),
  ('a0000000-0000-0000-0000-000000000008', 'amirbennoomen.guide3@gmail.com', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'guide', 'active', NOW()),
  ('a0000000-0000-0000-0000-000000000009', 'amirbennoomen.guide4@gmail.com', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'guide', 'active', NOW()),
  ('a0000000-0000-0000-0000-00000000000a', 'amirbennoomen.guide5@gmail.com', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'guide', 'active', NOW()),
  ('a0000000-0000-0000-0000-00000000000b', 'amir.bennoomen.guide@gmail.com', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'guide', 'active', NOW()),
  ('a0000000-0000-0000-0000-00000000000c', 'amir.bennoom.en@gmail.com', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'guide', 'active', NOW()),
  ('a0000000-0000-0000-0000-00000000000d', 'a.m.i.r.b.e.n.n.o.o.m.e.n@gmail.com', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'guide', 'active', NOW()),
  ('a0000000-0000-0000-0000-00000000000e', 'amirben.noomen.guide@gmail.com', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'guide', 'active', NOW()),
  ('a0000000-0000-0000-0000-00000000000f', 'amir.ben.noomen.guide@gmail.com', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'guide', 'active', NOW())
ON CONFLICT (email) DO NOTHING;

-- Guide profiles
INSERT INTO guides (user_id, full_name, guide_type, bio, country, zone, language, specialties, languages_spoken, years_experience, status, profile_completion, is_onboarded, sustainability_score)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Amir Bennoomen', 'professionnel',
   'Guide professionnel spécialisé en randonnées et circuits culturels. Plus de 10 ans d''expérience dans le tourisme durable en Tunisie.',
   'Tunisie', 'Nabeul, Hammamet', 'Français, Anglais, Arabe',
   ARRAY['rando_pedestre', 'circuit_culturel', 'degustation'], ARRAY['Français', 'Anglais', 'Arabe', 'Italien'],
   12, 'active', 100, true, 88),

  ('a0000000-0000-0000-0000-000000000002', 'Sarah Ben Ali', 'professionnel',
   'Guide spécialisée en éco-tourisme et observation de la faune. Diplômée en biologie marine.',
   'Tunisie', 'Djerba, Zarzis', 'Français, Anglais, Arabe',
   ARRAY['observation_faune', 'eco_tourisme', 'kayak'], ARRAY['Français', 'Anglais', 'Arabe'],
   8, 'active', 100, true, 95),

  ('a0000000-0000-0000-0000-000000000003', 'Mohamed Trabelsi', 'professionnel',
   'Guide de montagne certifié. Spécialiste des randonnées dans le nord-ouest tunisien et les forêts de Kroumirie.',
   'Tunisie', 'Aïn Draham, Tabarka', 'Français, Arabe',
   ARRAY['randonnee_montagne', 'vtt', 'escalade'], ARRAY['Français', 'Arabe'],
   15, 'active', 100, true, 85),

  ('a0000000-0000-0000-0000-000000000004', 'Leila Mansouri', 'local',
   'Guide locale à Douz, passionnée par la culture saharienne et les traditions bédouines. Circuits à dos de chameau.',
   'Tunisie', 'Douz, Tozeur, Kébili', 'Français, Anglais, Arabe',
   ARRAY['safari_desert', 'circuit_oasis', 'artisanat'], ARRAY['Français', 'Anglais', 'Arabe', 'Allemand'],
   20, 'active', 100, true, 90),

  ('a0000000-0000-0000-0000-000000000005', 'Karim Jebali', 'professionnel',
   'Guide vélo et VTT certifié. Propose des circuits éco-responsables à travers les oliveraies et les villages berbères.',
   'Tunisie', 'Sousse, Monastir, Mahdia', 'Français, Anglais, Arabe',
   ARRAY['velo_vtt', 'circuit_nature', 'degustation'], ARRAY['Français', 'Anglais', 'Arabe', 'Espagnol'],
   7, 'active', 100, true, 92),

  ('a0000000-0000-0000-0000-000000000006', 'Nadia Ben Salem', 'local',
   'Artisane et guide culturelle. Fait découvrir la poterie traditionnelle, la mosaïque et l''artisanat local à Nabeul.',
   'Tunisie', 'Nabeul, Hammamet', 'Français, Arabe',
   ARRAY['artisanat', 'visite_culturelle', 'atelier_cuisine'], ARRAY['Français', 'Arabe', 'Italien'],
   18, 'active', 100, true, 95),

  ('a0000000-0000-0000-0000-000000000007', 'Hassen Bouaziz', 'professionnel',
   'Guide ornithologue spécialisé dans l''observation des oiseaux migrateurs. Connaît parfaitement les zones humides d''Ichkeul.',
   'Tunisie', 'Bizerte, Ichkeul', 'Français, Anglais, Arabe',
   ARRAY['observation_oiseaux', 'rando_pedestre', 'photo_nature'], ARRAY['Français', 'Anglais', 'Arabe'],
   14, 'active', 100, true, 96),

  ('a0000000-0000-0000-0000-000000000008', 'Amel Khedher', 'local',
   'Guide gastronomique et culturelle à Tunis. Propose des ateliers de cuisine traditionnelle et des visites des souks.',
   'Tunisie', 'Tunis, Sidi Bou Said, Carthage', 'Français, Anglais, Arabe, Japonais',
   ARRAY['atelier_cuisine', 'visite_souks', 'degustation'], ARRAY['Français', 'Anglais', 'Arabe', 'Japonais'],
   10, 'active', 100, true, 87),

  ('a0000000-0000-0000-0000-000000000009', 'Riadh Ferchichi', 'professionnel',
   'Guide de plongée et activités nautiques. Moniteur certifié PADI, spécialiste des côtes de Mahdia et Monastir.',
   'Tunisie', 'Mahdia, Monastir, Sfax', 'Français, Anglais, Arabe',
   ARRAY['plongee', 'kayak_mer', 'snorkeling'], ARRAY['Français', 'Anglais', 'Arabe'],
   11, 'active', 100, true, 84),

  ('a0000000-0000-0000-0000-00000000000a', 'Fatma Gharbi', 'local',
   'Guide à Kairouan, spécialiste de l''architecture islamique et des traditions artisanales. Visite des mosquées et ateliers de tapis.',
   'Tunisie', 'Kairouan, Sousse', 'Français, Anglais, Arabe',
   ARRAY['visite_culturelle', 'artisanat_tapis', 'circuit_historique'], ARRAY['Français', 'Anglais', 'Arabe'],
   16, 'active', 100, true, 89),

  ('a0000000-0000-0000-0000-00000000000b', 'Mehdi Bouzid', 'professionnel',
   'Guide pour circuits aventure et activités extrêmes. Escalade, spéléologie, canyoning dans les montagnes tunisiennes.',
   'Tunisie', 'Kef, Siliana, Béja', 'Français, Anglais, Arabe',
   ARRAY['escalade', 'speleologie', 'canyoning', 'trekking'], ARRAY['Français', 'Anglais', 'Arabe'],
   9, 'active', 100, true, 80),

  ('a0000000-0000-0000-0000-00000000000c', 'Inès Kacem', 'professionnel',
   'Guide de yoga et bien-être. Retraites de yoga dans le désert et les montagnes. Méditation et relaxation en pleine nature.',
   'Tunisie', 'Tozeur, Djerba, Sidi Bou Said', 'Français, Anglais, Arabe',
   ARRAY['yoga', 'meditation', 'bien_etre'], ARRAY['Français', 'Anglais', 'Arabe', 'Hindi'],
   6, 'active', 100, true, 82),

  ('a0000000-0000-0000-0000-00000000000d', 'Sami Chaouch', 'local',
   'Guide photographe professionnel. Circuits photo dans les plus beaux spots de Tunisie. Matériel photo inclus.',
   'Tunisie', 'Toutes régions', 'Français, Anglais, Arabe',
   ARRAY['photo_nature', 'photo_culturelle', 'circuit_paysage'], ARRAY['Français', 'Anglais', 'Arabe'],
   13, 'active', 100, true, 75),

  ('a0000000-0000-0000-0000-00000000000e', 'Dorra Ben Mansour', 'professionnel',
   'Guide équestre certifiée. Balades à cheval dans les oliveraies, la forêt et les plages sauvages.',
   'Tunisie', 'Hammamet, Nabeul, Cap Bon', 'Français, Anglais, Arabe',
   ARRAY['equitation', 'balade_equestre', 'randonnee_cheval'], ARRAY['Français', 'Anglais', 'Arabe', 'Russe'],
   8, 'active', 100, true, 86),

  ('a0000000-0000-0000-0000-00000000000f', 'Wassim Haddad', 'professionnel',
   'Guide de kayak et sports nautiques. Excursions en kayak de mer le long des côtes tunisiennes et dans les grottes marines.',
   'Tunisie', 'Tabarka, Bizerte, Mahdia', 'Français, Anglais, Arabe',
   ARRAY['kayak_mer', 'plongee', 'snorkeling', 'peche_traditionnelle'], ARRAY['Français', 'Anglais', 'Arabe'],
   7, 'active', 100, true, 88)
ON CONFLICT (user_id) DO NOTHING;

COMMIT;
