-- ============================================================================
-- Migration Sprint 5 — v2.2
-- Nouveaux champs pour les offres et circuits
-- ============================================================================

-- Phase 2: Nouveaux champs Offer
ALTER TABLE offers ADD COLUMN IF NOT EXISTS deposit_percentage INTEGER DEFAULT 0;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS production_delay_days INTEGER;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS fulfillment_mode VARCHAR;

-- Phase 3: cover_image pour les circuits
ALTER TABLE circuits ADD COLUMN IF NOT EXISTS cover_image VARCHAR;

-- Index pour la recherche publique d'offres par catégorie
CREATE INDEX IF NOT EXISTS idx_offers_offer_type_status ON offers(offer_type, status);
