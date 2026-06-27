import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationParticipant } from './entities/reservation-participant.entity';
import { Offer } from '../offer/entities/offer.entity';
import { OfferSession } from '../offer/entities/offer-session.entity';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, ReservationParticipant, Offer, OfferSession])],
  providers: [ReservationService],
  controllers: [ReservationController],
  exports: [ReservationService],
})
export class ReservationModule {}
