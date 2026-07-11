import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(__dirname, '../../../.env') });

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME,
  password: String(process.env.DB_PASSWORD),
  database: process.env.DB_NAME,
});

async function seed() {
  if (!process.env.DB_HOST || !process.env.DB_PASSWORD) {
    console.error('Variables .env manquantes.');
    process.exit(1);
  }

  await dataSource.initialize();
  console.log('Database connected');

  const result = await dataSource.query(`
    UPDATE offer_items
    SET details_json = '{}'::jsonb
    WHERE details_json IS NULL
  `);

  console.log(
    `Backfill terminé : ${result[1] ?? 0} offer_items mis à jour (details_json NULL → {}).`,
  );
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
