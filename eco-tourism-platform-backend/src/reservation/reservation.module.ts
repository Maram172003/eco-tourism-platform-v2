import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationParticipant } from './entities/reservation-participant.entity';
import { OfferItemSession } from '../offer/entities/offer-item-session.entity';
import { Offer } from '../offer/entities/offer.entity';
import { OfferItem } from '../offer/entities/offer-item.entity';
import { OfferItemCapacity } from '../offer/entities/offer-item-capacity.entity';
import { GuideOffering } from '../guide/entities/guide-offering.entity';
import { GuideOfferingSession } from '../guide/entities/guide-offering-session.entity';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { NotificationModule } from '../notification/notification.module';
import { EcoTravelerModule } from '../eco-traveler/eco-traveler.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reservation,
      ReservationParticipant,
      OfferItemSession,
      Offer,
      OfferItem,
      OfferItemCapacity,
      GuideOffering,
      GuideOfferingSession,
    ]),
    NotificationModule,
    EcoTravelerModule,
  ],
  providers: [ReservationService],
  controllers: [ReservationController],
  exports: [ReservationService],
})
export class ReservationModule {}
