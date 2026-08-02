-- Migration: Add new columns to organizations table
-- This migration adds columns that exist in our merged Organization entity
-- but not in Maram's original entity.

-- Add city column (location)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS city VARCHAR;

-- Add approval_status column (moderation)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS approval_status VARCHAR;

-- Add approved_at column (moderation)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

-- Note: The following columns already exist in Maram's entity:
-- - region (VARCHAR)
-- - address (VARCHAR)
-- - zone (VARCHAR)
-- - country (VARCHAR)
-- - lat/lng (DECIMAL)
-- - photos (JSONB)
-- - videos (JSONB)
-- - eco_labels (JSONB)
-- - certifications (JSONB)
-- - sustainability_score (INT)
-- - status (VARCHAR)
-- - opening_hours (VARCHAR)
