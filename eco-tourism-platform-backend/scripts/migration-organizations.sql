-- ============================================================
-- MIGRATION: Align organizations table with entity
-- synchronize=false → manual ALTER TABLE required
-- ============================================================

-- 1. Add provider_id (links organization to its creator provider)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS provider_id uuid;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_org_provider_id" ON organizations (provider_id);

-- 2. Add missing profile columns
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS provider_type varchar;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS history text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS opening_hours varchar;

-- 3. Add social/contact columns
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS whatsapp varchar;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS facebook varchar;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS instagram varchar;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS tiktok varchar;

-- 4. Add location columns
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS zone varchar;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS country varchar;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS lat numeric(10,7);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS lng numeric(10,7);

-- 5. Add media columns
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS photos jsonb;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS videos jsonb;

-- 6. Add sustainability columns
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS eco_labels jsonb;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS certifications jsonb;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS sustainability_score int;

-- 7. Add status column
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS status varchar DEFAULT 'pending';
