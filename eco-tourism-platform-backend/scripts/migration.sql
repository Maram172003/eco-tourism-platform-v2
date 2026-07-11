-- ================================================================
-- DATA MIGRATION SCRIPT
-- Run this on your production database after schema sync
-- Some queries may fail gracefully — this is expected for cleanup
-- ================================================================

-- 1. Delete offers created by guides (they should use GuideOfferings now)
DELETE FROM offers WHERE author_type = 'guide';

-- 2. Delete orphan offers (no author)  
DELETE FROM offers WHERE author_id IS NULL;

-- 3. Assign offers with no project_id to the author's first active project
--    (only for project_owner offers)
UPDATE offers o
SET project_id = (
  SELECT p.id FROM projects p
  WHERE p.user_id = o.author_id
    AND p.status = 'active'
  ORDER BY p.created_at ASC
  LIMIT 1
)
WHERE o.project_id IS NULL
  AND o.author_type = 'project_owner'
  AND EXISTS (
    SELECT 1 FROM projects p
    WHERE p.user_id = o.author_id
      AND p.status = 'active'
  );

-- 4. Delete remaining offers with no project_id (orphan project_owner offers
--    whose author has no active project)
DELETE FROM offers
WHERE project_id IS NULL
  AND author_type = 'project_owner';

-- 5. Set location_type for all offers that have lat/lng but no location_type
UPDATE offers
SET location_type = 'fixed'
WHERE location_type IS NULL AND latitude IS NOT NULL;

UPDATE offers
SET location_type = 'mobile'
WHERE location_type IS NULL AND latitude IS NULL;

-- 6. Delete duplicate GuideGuideOfferings with same title + guide_id
DELETE FROM guide_offerings
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY guide_id, title ORDER BY created_at ASC
    ) AS rn
    FROM guide_offerings
  ) t WHERE t.rn > 1
);

-- 7. Delete GuideOfferings referencing non-existent guides
DELETE FROM guide_offerings
WHERE guide_id NOT IN (SELECT user_id FROM guides);

-- 8. Set default radius_km for GuideOfferings that have none
UPDATE guide_offerings
SET radius_km = 10.0
WHERE radius_km IS NULL AND service_zone_type = 'radius';
