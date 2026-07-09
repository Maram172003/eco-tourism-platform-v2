-- ============================================================================
-- Seed: Project owners for Djerba/Fernana offers
-- ============================================================================

BEGIN;

-- Users for offers (project owners)
INSERT INTO users (id, email, password, auth_method, role, status, email_verified_at)
VALUES
  ('a0000000-0000-4000-8000-000000000020', 'djerba.hotel@ecovoyage.tn', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'project', 'active', NOW()),
  ('a0000000-0000-4000-8000-000000000021', 'guellala.poterie@ecovoyage.tn', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'project', 'active', NOW()),
  ('a0000000-0000-4000-8000-000000000022', 'midoun.nautisme@ecovoyage.tn', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'project', 'active', NOW()),
  ('a0000000-0000-4000-8000-000000000023', 'djerba.transport@ecovoyage.tn', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'project', 'active', NOW()),
  ('a0000000-0000-4000-8000-000000000024', 'le.dauphin@ecovoyage.tn', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'project', 'active', NOW()),
  ('a0000000-0000-4000-8000-000000000025', 'fernana.rando@ecovoyage.tn', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'project', 'active', NOW()),
  ('a0000000-0000-4000-8000-000000000026', 'fernana.gite@ecovoyage.tn', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'project', 'active', NOW()),
  ('a0000000-0000-4000-8000-000000000027', 'fernana.artisanat@ecovoyage.tn', '$2b$10$GuoyKhajkxAP7405mEcWpuhq8FYjCz3mty0LuNHIaO54yGtFBNPiC', 'email', 'project', 'active', NOW())
ON CONFLICT (email) DO NOTHING;

-- Project owner profiles
INSERT INTO project_owners (user_id, full_name, bio, country, language, organization, position, profile_completion, is_onboarded)
VALUES
  ('a0000000-0000-4000-8000-000000000020', 'Hôtel Éco-Plage', 'Gérant de l''hôtel écologique en bord de mer à Djerba. Spécialiste de l''hébergement durable avec énergie solaire et produits bio.', 'Tunisie', 'fr', 'Hôtel Éco-Plage Djerba', 'Gérant', 100, true),
  ('a0000000-0000-4000-8000-000000000021', 'Coop Poterie Guellala', 'Coopérative artisanale de poterie traditionnelle à Guellala, Djerba. Préservation des techniques ancestrales.', 'Tunisie', 'fr', 'Coopérative Poterie Guellala', 'Co-manager', 100, true),
  ('a0000000-0000-4000-8000-000000000022', 'Midoun Watersports', 'Club de sports nautiques écoresponsables à Djerba. Activités encadrées par des moniteurs certifiés.', 'Tunisie', 'fr', 'Midoun Watersports', 'Manager', 100, true),
  ('a0000000-0000-4000-8000-000000000023', 'Éco Navette Djerba', 'Service de navette électrique et hybride pour les touristes. Véhicules basse émission pour la planète.', 'Tunisie', 'fr', 'Éco Navette Djerba', 'Directeur', 100, true),
  ('a0000000-0000-4000-8000-000000000024', 'Le Dauphin', 'Restaurant de fruits de mer certifié pêche responsable. Cuisine traditionnelle avec produits locaux bio.', 'Tunisie', 'fr', 'Restaurant Le Dauphin', 'Manager', 100, true),
  ('a0000000-0000-4000-8000-000000000025', 'Fernana Rando', 'Guide et organisateur de randonnées dans la forêt de Fernana. Spécialiste de la biodiversité krouirienne.', 'Tunisie', 'fr', 'Fernana Rando', 'Fondateur', 100, true),
  ('a0000000-0000-4000-8000-000000000026', 'Éco-Gîte Fernana', 'Gîte rural écologique niché dans la forêt. Construction en matériaux locaux, accueil chaleureux.', 'Tunisie', 'fr', 'Éco-Gîte Fernana', 'Host', 100, true),
  ('a0000000-0000-4000-8000-000000000027', 'Artisanat Krouirien', 'Atelier familial d''artisanat traditionnel à Fernana. Tissage, vannerie et broderie fait maison.', 'Tunisie', 'fr', 'Artisanat Krouirien', 'Artisan', 100, true)
ON CONFLICT (user_id) DO NOTHING;

COMMIT;