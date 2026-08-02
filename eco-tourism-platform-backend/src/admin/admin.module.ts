import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publication } from '../publication/entities/publication.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Circuit } from '../circuit/entities/circuit.entity';
import { Venue } from '../provider/entities/venue.entity';
import { User } from '../users/entities/user.entity';
import { EcoTraveler } from '../eco-traveler/entities/eco-traveler.entity';
import { Guide } from '../guide/entities/guide.entity';
import { Provider } from '../provider/entities/provider.entity';
import { GuideOffering } from '../guide/entities/guide-offering.entity';
import { Reservation } from '../reservation/entities/reservation.entity';
import { Review } from '../review/entities/review.entity';
import { ModerationLog } from './entities/moderation-log.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ReportsModule } from '../reports/reports.module';
import { MailModule } from '../mail/mail.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Publication,
      Offer,
      Circuit,
      GuideOffering,
      Venue,
      User,
      EcoTraveler,
      Guide,
      Provider,
      Reservation,
      Review,
      ModerationLog,
    ]),
    ReportsModule,
    MailModule,
    NotificationModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
