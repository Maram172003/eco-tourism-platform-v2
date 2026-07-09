import { Module, Global, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfferItemSession } from '../offer/entities/offer-item-session.entity';
import { OfferItemCapacity } from '../offer/entities/offer-item-capacity.entity';
import { PricingDomainService } from './pricing-domain.service';
import { CapacityDomainService } from './capacity-domain.service';
import { ReservationDomainService } from './reservation-domain.service';
import { ReservationApplicationService } from './reservation-application.service';
import { NotificationModule } from '../notification/notification.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([OfferItemSession, OfferItemCapacity]),
    forwardRef(() => NotificationModule),
  ],
  providers: [
    PricingDomainService,
    CapacityDomainService,
    ReservationDomainService,
    ReservationApplicationService,
  ],
  exports: [
    PricingDomainService,
    CapacityDomainService,
    ReservationDomainService,
    ReservationApplicationService,
  ],
})
export class DomainModule {}
