import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCollaborationCircuitPricing1722000000001
  implements MigrationInterface
{
  name = 'AddCollaborationCircuitPricing1722000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. offer_categories : ajouter requires_guide
    await queryRunner.query(
      `ALTER TABLE "offer_categories" ADD COLUMN "requires_guide" boolean NOT NULL DEFAULT false`,
    );

    // 2. offers : renommer requires_guide → requires_guide_override (nullable)
    //    D'abord ajouter la nouvelle colonne
    await queryRunner.query(
      `ALTER TABLE "offers" ADD COLUMN "requires_guide_override" boolean DEFAULT NULL`,
    );
    //    Copier les données
    await queryRunner.query(
      `UPDATE "offers" SET "requires_guide_override" = "requires_guide" WHERE "requires_guide" = true`,
    );
    //    Supprimer l'ancienne colonne
    await queryRunner.query(
      `ALTER TABLE "offers" DROP COLUMN "requires_guide"`,
    );
    //    Ajouter final_price
    await queryRunner.query(
      `ALTER TABLE "offers" ADD COLUMN "final_price" decimal(10,2) DEFAULT NULL`,
    );

    // 3. circuit_program_items : ajouter offer_id, collaboration_id, guide prices, final_price
    await queryRunner.query(
      `ALTER TABLE "circuit_program_items" ADD COLUMN "offer_id" uuid DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "circuit_program_items" ADD COLUMN "collaboration_id" uuid DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "circuit_program_items" ADD COLUMN "guide_suggested_price" decimal(10,2) DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "circuit_program_items" ADD COLUMN "guide_applied_price" decimal(10,2) DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "circuit_program_items" ADD COLUMN "final_price" decimal(10,2) DEFAULT NULL`,
    );

    // 4. collaborations : rendre offer_id nullable + ajouter circuit_program_item_id + prix
    await queryRunner.query(
      `ALTER TABLE "collaborations" ALTER COLUMN "offer_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "collaborations" ADD COLUMN "circuit_program_item_id" uuid DEFAULT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 4. collaborations : supprimer colonnes ajoutées
    await queryRunner.query(
      `ALTER TABLE "collaborations" DROP COLUMN "circuit_program_item_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collaborations" ALTER COLUMN "offer_id" SET NOT NULL`,
    );

    // 3. circuit_program_items : supprimer colonnes ajoutées
    await queryRunner.query(
      `ALTER TABLE "circuit_program_items" DROP COLUMN "final_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "circuit_program_items" DROP COLUMN "guide_applied_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "circuit_program_items" DROP COLUMN "guide_suggested_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "circuit_program_items" DROP COLUMN "collaboration_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "circuit_program_items" DROP COLUMN "offer_id"`,
    );

    // 2. offers : restaurer requires_guide
    await queryRunner.query(
      `ALTER TABLE "offers" DROP COLUMN "final_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" ADD COLUMN "requires_guide" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `UPDATE "offers" SET "requires_guide" = "requires_guide_override" WHERE "requires_guide_override" = true`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" DROP COLUMN "requires_guide_override"`,
    );

    // 1. offer_categories : supprimer requires_guide
    await queryRunner.query(
      `ALTER TABLE "offer_categories" DROP COLUMN "requires_guide"`,
    );
  }
}
