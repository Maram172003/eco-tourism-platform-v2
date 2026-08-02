import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { OfferCategory } from './entities/offer-category.entity';
import { OfferItem } from './entities/offer-item.entity';
import { OfferItemPrice } from './entities/offer-item-price.entity';
import { OfferItemAvailabilityRule } from './entities/offer-item-availability-rule.entity';
import { OfferItemCapacity } from './entities/offer-item-capacity.entity';
import { OfferItemSession } from './entities/offer-item-session.entity';
import { Venue } from '../provider/entities/venue.entity';
import { Provider } from '../provider/entities/provider.entity';
import { Organization } from '../organization/entities/organization.entity';
import { ProviderActivity } from '../provider-activity/entities/provider-activity.entity';
import { Collaboration } from '../collaboration/entities/collaboration.entity';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { ProviderModule } from '../provider/provider.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Offer,
      OfferCategory,
      OfferItem,
      OfferItemPrice,
      OfferItemAvailabilityRule,
      OfferItemCapacity,
      OfferItemSession,
      Venue,
      Provider,
      Organization,
      ProviderActivity,
      Collaboration,
    ]),
    ProviderModule,
    NotificationModule,
  ],
  providers: [OfferService],
  controllers: [OfferController],
  exports: [OfferService],
})
export class OfferModule {}
