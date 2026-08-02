import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripPlan } from './entities/trip-plan.entity';
import { TripPlanItem } from './entities/trip-plan-item.entity';
import { Reservation } from '../reservation/entities/reservation.entity';
import { ReservationParticipant } from '../reservation/entities/reservation-participant.entity';
import { OfferItemSession } from '../offer/entities/offer-item-session.entity';
import { GuideOffering } from '../guide/entities/guide-offering.entity';
import { GuideOfferingSession } from '../guide/entities/guide-offering-session.entity';
import { TripPlanService } from './trip-plan.service';
import { TripPlanController } from './trip-plan.controller';
import { NotificationModule } from '../notification/notification.module';
import { EcoTravelerModule } from '../eco-traveler/eco-traveler.module';
import { Offer } from '../offer/entities/offer.entity';
import { Circuit } from '../circuit/entities/circuit.entity';
import { CircuitReservation } from '../circuit/entities/circuit-reservation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TripPlan,
      TripPlanItem,
      Reservation,
      ReservationParticipant,
      OfferItemSession,
      GuideOffering,
      GuideOfferingSession,
      Offer,
      Circuit,
      CircuitReservation,
    ]),
    NotificationModule,
    EcoTravelerModule,
  ],
  providers: [TripPlanService],
  controllers: [TripPlanController],
  exports: [TripPlanService],
})
export class TripPlanModule {}
