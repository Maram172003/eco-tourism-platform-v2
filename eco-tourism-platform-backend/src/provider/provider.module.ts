import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { Provider } from './entities/provider.entity';
import { Venue } from './entities/venue.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Reservation } from '../reservation/entities/reservation.entity';
import { CircuitReservation } from '../circuit/entities/circuit-reservation.entity';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import {
  OwnerEngagement,
  OwnerEngagementSchema,
} from './schemas/owner-engagement.schema';
import { ProviderMongoService } from './provider-mongo.service';
import { OwnerMongoService } from './owner-mongo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Provider, Venue, Offer, Reservation, CircuitReservation]),
    MongooseModule.forFeature([
      { name: OwnerEngagement.name, schema: OwnerEngagementSchema },
    ]),
  ],
  providers: [ProviderService, ProviderMongoService, OwnerMongoService],
  controllers: [ProviderController],
  exports: [ProviderService, ProviderMongoService, OwnerMongoService],
})
export class ProviderModule {}
