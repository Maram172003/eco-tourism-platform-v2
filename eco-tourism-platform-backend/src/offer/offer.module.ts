import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { OfferCategory } from './entities/offer-category.entity';
import { OfferItem } from './entities/offer-item.entity';
import { OfferItemPrice } from './entities/offer-item-price.entity';
import { OfferItemAvailabilityRule } from './entities/offer-item-availability-rule.entity';
import { OfferItemCapacity } from './entities/offer-item-capacity.entity';
import { OfferItemSession } from './entities/offer-item-session.entity';
import { Venue } from '../project-owner/entities/project.entity';
import { ProjectOwner } from '../project-owner/entities/project-owner.entity';
import { Organization } from '../organization/entities/organization.entity';
import { ProviderActivity } from '../provider-activity/entities/provider-activity.entity';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { ProjectOwnerModule } from '../project-owner/project-owner.module';

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
      ProjectOwner,
      Organization,
      ProviderActivity,
    ]),
    ProjectOwnerModule,
  ],
  providers: [OfferService],
  controllers: [OfferController],
  exports: [OfferService],
})
export class OfferModule {}
