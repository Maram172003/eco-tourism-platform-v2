import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

import { AppModule } from '../../app.module';
import { GuideOffering } from '../../guide/entities/guide-offering.entity';
import { GuideOfferingAvailabilityRule } from '../../guide/entities/guide-offering-availability-rule.entity';
import { Offer } from '../../offer/entities/offer.entity';
import { OfferItem } from '../../offer/entities/offer-item.entity';
import { OfferItemPrice } from '../../offer/entities/offer-item-price.entity';
import { TripPlan } from '../../trip-plan/entities/trip-plan.entity';
import { TripPlanItem } from '../../trip-plan/entities/trip-plan-item.entity';
import { Review } from '../../review/entities/review.entity';
import { Notification } from '../../notification/entities/notification.entity';
import { RealisticUserDataSeed } from './005-realistic-user-data.seed';

config({ path: join(__dirname, '../../../.env') });

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const seed = new RealisticUserDataSeed(
    dataSource.getRepository(GuideOffering),
    dataSource.getRepository(GuideOfferingAvailabilityRule),
    dataSource.getRepository(Offer),
    dataSource.getRepository(OfferItem),
    dataSource.getRepository(OfferItemPrice),
    dataSource.getRepository(TripPlan),
    dataSource.getRepository(TripPlanItem),
    dataSource.getRepository(Review),
    dataSource.getRepository(Notification),
  );

  await seed.seed();
  await app.close();
  console.log('Runner done.');
}

run().catch((err) => {
  console.error('Runner failed:', err.message);
  process.exit(1);
});
