import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';

import { EcoTraveler } from './entities/eco-traveler.entity';
import { Friendship } from './entities/friendship.entity';
import { Publication } from '../publication/entities/publication.entity';
import { TripPlan } from '../trip-plan/entities/trip-plan.entity';
import { Booking } from '../booking/entities/booking.entity';
import { CircuitReservation } from '../circuit/entities/circuit-reservation.entity';
import { EcoTravelerService } from './eco-traveler.service';
import { EcoTravelerController } from './eco-traveler.controller';
import { EcoTravelerMongoService } from './eco-traveler-mongo.service';

import {
  TravelerPreferences,
  TravelerPreferencesSchema,
} from './schemas/traveler-preferences.schema';
import {
  TravelerEngagement,
  TravelerEngagementSchema,
} from './schemas/traveler-engagement.schema';

@Module({
  imports: [
    // PostgreSQL
    TypeOrmModule.forFeature([
      EcoTraveler,
      Publication,
      Friendship,
      TripPlan,
      Booking,
      CircuitReservation,
    ]),

    // MongoDB
    MongooseModule.forFeature([
      { name: TravelerPreferences.name, schema: TravelerPreferencesSchema },
      { name: TravelerEngagement.name, schema: TravelerEngagementSchema },
    ]),
  ],
  providers: [EcoTravelerService, EcoTravelerMongoService],
  controllers: [EcoTravelerController],
  exports: [EcoTravelerService, EcoTravelerMongoService],
})
export class EcoTravelerModule {}
