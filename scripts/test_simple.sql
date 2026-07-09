-- ============================================================================
-- EcoVoyage — Script de test simple
-- ============================================================================
-- Exécution :
--   PGPASSWORD=Hermosa psql -h localhost -p 5433 -U marammejri -d tourism_db -f test_simple.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- Test simple avec un seul projet
-- ============================================================================
DO $$
DECLARE
  -- UUIDs réels des utilisateurs existants
  v_owner3_id      UUID := '7b83e87d-276d-4d89-bb00-ab8ea1243a14'; -- f.akerbennoomen@gmail.com
  v_proj7_id       UUID := '55000000-0001-0000-0000-000000000008';
  v_cat_activity   UUID := 'c0000000-0001-0000-0000-000000000003';

BEGIN
  -- Insertion d'un projet simple
  INSERT INTO projects (id, owner_id, name, project_type, description, region, address, lat, lng, opening_hours, status, sustainability_score, services, eco_labels, phone) 
  VALUES (
    v_proj7_id, 
    v_owner3_id, 
    'Centre Kayak Éco Korba',          
    'activite,eco_tourisme', 
    'Centre de kayak écoresponsable à Korba. Location de kayaks biodegradables, initiation au snorkeling, observation des tortues marines.', 
    'Korba',           
    'Avenue de la Plage, Korba 8050',           
    36.7570, 10.7250, 
    '08:00 - 18:00', 
    'active',  
    88, 
    'kayak,snorkeling,observation_marine,location_equipment', 
    'blue_flag,eco_equipment', 
    '+216 71 234 567'
  ) ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Projet inséré avec succès: %', v_proj7_id;
END $$;

COMMIT;