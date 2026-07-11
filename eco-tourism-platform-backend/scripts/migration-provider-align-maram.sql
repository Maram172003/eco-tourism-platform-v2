-- Migration: Align providers table with Maram's entity exactly
-- Run: docker exec -i tourisme-db-1 psql -U marammejri -d tourism_db < backend/scripts/migration-provider-align-maram.sql

BEGIN;

-- 1. Rename gps_lat → lat, gps_lng → lng
ALTER TABLE providers RENAME COLUMN gps_lat TO lat;
ALTER TABLE providers RENAME COLUMN gps_lng TO lng;

-- 1b. Fix languages_spoken type: Maram uses simple-array (TEXT), we have JSONB
ALTER TABLE providers ALTER COLUMN languages_spoken TYPE TEXT;

-- 2. Add missing columns from Maram's entity
ALTER TABLE providers ADD COLUMN IF NOT EXISTS personal_bio TEXT;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS personal_certifications JSONB;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS provider_type VARCHAR;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS zone VARCHAR;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS activity_types TEXT[];
ALTER TABLE providers ADD COLUMN IF NOT EXISTS secondary_activity_types TEXT[];
ALTER TABLE providers ADD COLUMN IF NOT EXISTS specialties TEXT[];
ALTER TABLE providers ADD COLUMN IF NOT EXISTS services TEXT[];
ALTER TABLE providers ADD COLUMN IF NOT EXISTS photos TEXT[];
ALTER TABLE providers ADD COLUMN IF NOT EXISTS videos TEXT[];
ALTER TABLE providers ADD COLUMN IF NOT EXISTS eco_labels TEXT[];
ALTER TABLE providers ADD COLUMN IF NOT EXISTS history TEXT;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS opening_hours VARCHAR;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 3. Drop columns that exist in our DB but NOT in Maram's entity
ALTER TABLE providers DROP COLUMN IF EXISTS tiktok;
ALTER TABLE providers DROP COLUMN IF EXISTS city;
ALTER TABLE providers DROP COLUMN IF EXISTS profile_completion;
ALTER TABLE providers DROP COLUMN IF EXISTS is_onboarded;

COMMIT;
