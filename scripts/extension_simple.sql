-- ============================================================================
-- EcoVoyage — Script d'extension simple sans variables
-- ============================================================================
-- Exécution :
--   PGPASSWORD=Hermosa psql -h localhost -p 5433 -U marammejri -d tourism_db -f extension_simple.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. NOUVEAU PROJET (kayak à Korba)
-- ============================================================================
INSERT INTO projects (id, owner_id, name, project_type, description, region, address, lat, lng, opening_hours, status, sustainability_score, services, eco_labels, phone) VALUES
  ('55000000-0001-0000-0000-000000000008', '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'Centre Kayak Éco Korba', 'activite,eco_tourisme', 'Centre de kayak écoresponsable à Korba. Location de kayaks biodegradables, initiation au snorkeling, observation des tortues marines.', 'Korba', 'Avenue de la Plage, Korba 8050', 36.7570, 10.7250, '08:00 - 18:00', 'active', 88, 'kayak,snorkeling,observation_marine,location_equipment', 'blue_flag,eco_equipment', '+216 71 234 567')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. NOUVELLE OFFRE (kayak de mer)
-- ============================================================================
INSERT INTO offers (id, author_id, author_type, project_id, category_id, title, description, price, duration, offer_type, images, inclusions, region, address, latitude, longitude, meeting_point, meeting_lat, meeting_lng, min_group_size, max_group_size, min_age, cancellation_policy, sustainability_score, confirmation_mode, status) VALUES
  ('55000000-0001-0000-0000-000000000012', '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'project_owner', '55000000-0001-0000-0000-000000000008', 'f8509a3c-747f-475b-b4a0-40a32c765bfb', 'Kayak de Mer Korba', 'Excursion en kayak de mer le long de la côte de Korba. Observation dauphins et tortues marines. Snorkeling dans les zones protégées.', 45.00, '3h', 'activite', NULL, 'Kayak, gilet, pagaie, guide, équipement snorkeling', 'Korba', 'Avenue de la Plage, Korba', 36.7570, 10.7250, 'Plage de Korba', 36.7570, 10.7250, 2, 12, 8, 'Annulation gratuite 48h avant', 88, 'automatic', 'approved')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. NOUVEAU CIRCUIT (cyclotourisme Hammamet)
-- ============================================================================
INSERT INTO circuits (id, author_id, author_type, project_id, title, description, start_date, end_date, duration_days, duration_nights, region, base_price, currency, max_participants, confirmation_mode, inclusions, exclusions, lat, lng, address, status, images) VALUES
  ('55000000-0001-0000-0000-000000000020', '87a38946-9a54-4bb4-be4a-887be312af15', 'guide', NULL, 'Aventure Cycliste Hammamet - Nabeul', 'Circuit de 3 jours à vélo électrique entre Hammamet et Nabeul. Plages, forêts, médina et dégustations de citrons bio.', '2026-07-20', '2026-07-22', 3, 2, 'Nabeul', 380.00, 'TND', 12, 'automatic', 'Vélos électriques, hébergement, repas, guide, transfert bagages', 'Repas personnels, assurance', 36.4020, 10.6300, 'Hammamet', 'approved', NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. NOUVEAU TRIP PLAN (aventure verte)
-- ============================================================================
INSERT INTO trip_plans (id, eco_traveler_id, title, description, start_date, end_date, status) VALUES
  ('55000000-0001-0000-0000-000000000023', '90b4c5bf-4a47-4737-b033-f7385e22a2e6', 'Aventure Verte : Hammamet, Korba et Cap Bon', 'Circuit de 8 jours à vélo et kayak. Découverte des côtes tunisiennes, forêts et plages. Écotourisme et gastronomie locale.', '2026-07-15', '2026-07-22', 'draft')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. MISE À JOUR DES IMAGES POUR LES NOUVELLES OFFRES
-- ============================================================================
UPDATE offers SET images = '{"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80","https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800&q=80"}' WHERE id = '55000000-0001-0000-0000-000000000012';
UPDATE circuits SET images = '{"https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80","https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"}' WHERE id = '55000000-0001-0000-0000-000000000020';

COMMIT;