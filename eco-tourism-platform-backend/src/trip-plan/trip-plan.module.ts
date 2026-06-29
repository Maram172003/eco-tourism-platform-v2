import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripPlan } from './entities/trip-plan.entity';
import { TripPlanItem } from './entities/trip-plan-item.entity';
import { Booking } from '../booking/entities/booking.entity';
import { BookingParticipant } from '../booking/entities/booking-participant.entity';
import { OfferItemSession } from '../offer/entities/offer-item-session.entity';
import { TripPlanService } from './trip-plan.service';
import { TripPlanController } from './trip-plan.controller';
import { NotificationModule } from '../notification/notification.module';
import { EcoTravelerModule } from '../eco-traveler/eco-traveler.module';
import { Offer } from '../offer/entities/offer.entity';
import { Circuit } from '../circuit/entities/circuit.entity';
import { CircuitReservation } from '../circuit/entities/circuit-reservation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TripPlan, TripPlanItem, Booking, BookingParticipant, OfferItemSession, Offer, Circuit, CircuitReservation]),
    NotificationModule,
    EcoTravelerModule,
  ],
  providers: [TripPlanService],
  controllers: [TripPlanController],
  exports: [TripPlanService],
})
export class TripPlanModule {}
