-- Migration: Add new columns to providers table
-- This migration adds columns that exist in our merged Provider entity
-- but not in Maram's original entity.

-- Add tiktok column (social media)
ALTER TABLE providers ADD COLUMN IF NOT EXISTS tiktok VARCHAR;

-- Add city column (location)
ALTER TABLE providers ADD COLUMN IF NOT EXISTS city VARCHAR;

-- Add profile_completion column (onboarding)
ALTER TABLE providers ADD COLUMN IF NOT EXISTS profile_completion INT DEFAULT 0;

-- Add is_onboarded column (onboarding)
ALTER TABLE providers ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT false;

-- Add rejection_reason column (moderation)
ALTER TABLE providers ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Note: The following columns already exist in Maram's entity:
-- - personal_bio (TEXT)
-- - personal_certifications (JSONB)
-- - provider_type (VARCHAR)
-- - activity_types (SIMPLE-ARRAY)
-- - secondary_activity_types (SIMPLE-ARRAY)
-- - specialties (SIMPLE-ARRAY)
-- - services (SIMPLE-ARRAY)
-- - photos (SIMPLE-ARRAY)
-- - videos (SIMPLE-ARRAY)
-- - eco_labels (SIMPLE-ARRAY)
-- - history (TEXT)
-- - opening_hours (VARCHAR)
-- - zone (VARCHAR)
-- - lat/lng (DECIMAL)
