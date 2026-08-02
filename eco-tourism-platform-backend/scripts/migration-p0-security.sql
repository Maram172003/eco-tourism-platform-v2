-- ============================================================
-- Migration P0: CHECK constraints + FK sur offer_item_id
-- À exécuter APRÈS avoir désactivé synchronize:true
-- ============================================================

-- 1. Contraintes CHECK sur offer_item_prices
ALTER TABLE offer_item_prices
  ADD CONSTRAINT chk_price_positive CHECK (price >= 0);

-- 2. Contraintes CHECK sur offer_item_capacity
ALTER TABLE offer_item_capacity
  ADD CONSTRAINT chk_total_quantity_positive CHECK (total_quantity IS NULL OR total_quantity >= 0),
  ADD CONSTRAINT chk_remaining_quantity_positive CHECK (remaining_quantity IS NULL OR remaining_quantity >= 0),
  ADD CONSTRAINT chk_remaining_lte_total CHECK (
    total_quantity IS NULL OR remaining_quantity IS NULL OR remaining_quantity <= total_quantity
  );

-- 3. Contraintes CHECK sur offer_item_sessions
ALTER TABLE offer_item_sessions
  ADD CONSTRAINT chk_session_total_capacity CHECK (total_capacity IS NULL OR total_capacity >= 0),
  ADD CONSTRAINT chk_session_remaining_capacity CHECK (remaining_capacity IS NULL OR remaining_capacity >= 0),
  ADD CONSTRAINT chk_session_remaining_lte_total CHECK (
    total_capacity IS NULL OR remaining_capacity IS NULL OR remaining_capacity <= total_capacity
  );

-- 4. FK CircuitOption → OfferItem (si pas déjà présente en DB)
-- Note: createForeignKeyConstraints: false empêche TypeORM de créer la FK
-- Il faut donc l'ajouter manuellement si on veut l'intégrité référentielle
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_circuit_option_offer_item'
  ) THEN
    ALTER TABLE circuit_options
      ADD CONSTRAINT fk_circuit_option_offer_item
      FOREIGN KEY (offer_item_id) REFERENCES offer_items(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 5. Vérification des contraintes existantes
SELECT conname, contype, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid IN (
  'offer_item_prices'::regclass,
  'offer_item_capacity'::regclass,
  'offer_item_sessions'::regclass,
  'circuit_options'::regclass
)
ORDER BY conrelid, conname;
