import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOfferCollabFields1722000000000 implements MigrationInterface {
  name = 'AddOfferCollabFields1722000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "offers" ADD COLUMN "requires_guide" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" ADD COLUMN "publish_ready" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "publish_ready"`);
    await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "requires_guide"`);
  }
}
