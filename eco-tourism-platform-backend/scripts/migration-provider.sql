-- ============================================
-- MIGRATION : Alignement Provider/Organization
-- Date : 10 Juillet 2026
-- Base : tourism_db (user: marammejri)
-- ============================================

-- ÉTAPE 1 : Ajouter l'enum (commit séparé requis par PostgreSQL)
ALTER TYPE users_role_enum ADD VALUE IF NOT EXISTS 'provider';

-- ÉTAPE 2 : Le reste de la migration
BEGIN;

-- ── 1. Sauvegarde ──────────────────────────────
CREATE TABLE IF NOT EXISTS _backup_project_owners AS SELECT * FROM project_owners;
CREATE TABLE IF NOT EXISTS _backup_projects AS SELECT * FROM projects;
CREATE TABLE IF NOT EXISTS _backup_offers_author AS SELECT id, author_type FROM offers;
CREATE TABLE IF NOT EXISTS _backup_circuits_author AS SELECT id, author_type FROM circuits;

-- ── 2. Créer organizations si absent ───────────
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo VARCHAR(500),
  website VARCHAR(500),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  region VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ── 3. Renommer tables ─────────────────────────
ALTER TABLE project_owners RENAME TO providers;
ALTER TABLE projects RENAME TO venues;

-- ── 4. Renommer colonnes FK ────────────────────
ALTER TABLE venues RENAME COLUMN owner_id TO provider_id;
ALTER TABLE venues RENAME COLUMN project_type TO venue_type;
ALTER TABLE offers RENAME COLUMN project_id TO venue_id;
ALTER TABLE circuits RENAME COLUMN project_id TO venue_id;

-- ── 5. Mettre à jour author_type ───────────────
UPDATE offers SET author_type = 'provider' WHERE author_type = 'project_owner';
UPDATE circuits SET author_type = 'provider' WHERE author_type = 'project_owner';

-- ── 6. Mettre à jour users.role ────────────────
UPDATE users SET role = 'provider' WHERE role = 'project';

-- ── 7. Ajouter organization_id sur venues ──────
ALTER TABLE venues ADD COLUMN IF NOT EXISTS organization_id UUID;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_venue_organization'
  ) THEN
    ALTER TABLE venues ADD CONSTRAINT fk_venue_organization
      FOREIGN KEY (organization_id) REFERENCES organizations(id);
  END IF;
END $$;

-- ── 8. Vérification ────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM offers WHERE author_type = 'project_owner') THEN
    RAISE WARNING 'Migration : des offers ont encore author_type = project_owner';
  END IF;
  IF EXISTS (SELECT 1 FROM users WHERE role = 'project') THEN
    RAISE WARNING 'Migration : des users ont encore role = project';
  END IF;
END $$;

COMMIT;
