import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { Offer } from './entities/offer.entity';
import { OfferSession } from './entities/offer-session.entity';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { ProviderActivity } from '../provider-activity/entities/provider-activity.entity';
import { ActivityDetails, ActivityDetailsSchema } from '../provider-activity/schemas/activity-details.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([Offer, OfferSession, ProviderActivity]),
    MongooseModule.forFeature([
      { name: ActivityDetails.name, schema: ActivityDetailsSchema },
    ]),
  ],
  providers: [OfferService],
  controllers: [OfferController],
  exports: [OfferService],
})
export class OfferModule {}
