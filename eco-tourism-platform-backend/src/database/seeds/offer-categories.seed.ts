import { DataSource } from 'typeorm';
import { OfferCategory } from '../../offer/entities/offer-category.entity';
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
  entities: [OfferCategory],
  synchronize: true,
});

const CATEGORIES = [
  { slug: 'eco_tour',       label: 'Éco-Tour',       icon: 'eco',     sort_order: 1 },
  { slug: 'accommodation',  label: 'Hébergement',     icon: 'house',   sort_order: 2 },
  { slug: 'activity',       label: 'Activité',        icon: 'target',  sort_order: 3 },
  { slug: 'restaurant',     label: 'Restauration',    icon: 'food',    sort_order: 4 },
  { slug: 'craft',          label: 'Artisanat',       icon: 'craft',   sort_order: 5 },
  { slug: 'workshop',       label: 'Atelier',         icon: 'tools',   sort_order: 6 },
  { slug: 'transfer',       label: 'Transfert',       icon: 'van',     sort_order: 7 },
  { slug: 'sejour',         label: 'Séjour',          icon: 'stay',    sort_order: 8 },
  { slug: 'circuit',        label: 'Circuit',         icon: 'route',   sort_order: 9 },
  { slug: 'other',          label: 'Autre',           icon: 'other',   sort_order: 10 },
];

async function seed() {
  if (!process.env.DB_HOST || !process.env.DB_PASSWORD) {
    console.error('Variables .env manquantes.');
    process.exit(1);
  }

  await dataSource.initialize();
  console.log('Database connected');

  const repo = dataSource.getRepository(OfferCategory);
  let created = 0;

  for (const cat of CATEGORIES) {
    const existing = await repo.findOne({ where: { slug: cat.slug } });
    if (existing) continue;

    await repo.save(repo.create(cat));
    created++;
  }

  console.log(`Seeded ${created} offer categories (${CATEGORIES.length - created} already existed).`);
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
