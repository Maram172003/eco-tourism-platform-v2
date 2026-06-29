import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Circuit } from './entities/circuit.entity';
import { CircuitDay } from './entities/circuit-day.entity';
import { CircuitProgramItem } from './entities/circuit-program-item.entity';
import { CircuitOption } from './entities/circuit-option.entity';
import { CircuitReservation } from './entities/circuit-reservation.entity';
import { CircuitReservationOption } from './entities/circuit-reservation-option.entity';
import { CircuitService } from './circuit.service';
import { CircuitController } from './circuit.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Circuit,
      CircuitDay,
      CircuitProgramItem,
      CircuitOption,
      CircuitReservation,
      CircuitReservationOption,
    ]),
    NotificationModule,
  ],
  providers: [CircuitService],
  controllers: [CircuitController],
  exports: [CircuitService],
})
export class CircuitModule {}
