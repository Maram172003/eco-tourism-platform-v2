import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Circuit } from './entities/circuit.entity';
import { CircuitDay } from './entities/circuit-day.entity';
import { CircuitProgramItem } from './entities/circuit-program-item.entity';
import { CircuitOption } from './entities/circuit-option.entity';
import { CircuitReservation } from './entities/circuit-reservation.entity';
import { CircuitReservationOption } from './entities/circuit-reservation-option.entity';
import { CircuitReservationSnapshot } from './entities/circuit-reservation-snapshot.entity';
import { CircuitService } from './circuit.service';
import { CircuitController } from './circuit.controller';
import { NotificationModule } from '../notification/notification.module';
import { EcoTravelerModule } from '../eco-traveler/eco-traveler.module';
import { OfferItem } from '../offer/entities/offer-item.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Collaboration } from '../collaboration/entities/collaboration.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Circuit,
      CircuitDay,
      CircuitProgramItem,
      CircuitOption,
      CircuitReservation,
      CircuitReservationOption,
      CircuitReservationSnapshot,
      OfferItem,
      Offer,
      Collaboration,
    ]),
    NotificationModule,
    EcoTravelerModule,
  ],
  providers: [CircuitService],
  controllers: [CircuitController],
  exports: [CircuitService],
})
export class CircuitModule {}
