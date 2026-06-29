import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingParticipant } from './entities/booking-participant.entity';
import { OfferItemSession } from '../offer/entities/offer-item-session.entity';
import { Offer } from '../offer/entities/offer.entity';
import { OfferItem } from '../offer/entities/offer-item.entity';
import { OfferItemCapacity } from '../offer/entities/offer-item-capacity.entity';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, BookingParticipant, OfferItemSession, Offer, OfferItem, OfferItemCapacity]), NotificationModule],
  providers: [BookingService],
  controllers: [BookingController],
  exports: [BookingService],
})
export class BookingModule {}
