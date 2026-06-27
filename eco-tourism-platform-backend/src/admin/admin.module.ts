import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publication } from '../publication/entities/publication.entity';
import { Offer } from '../offer/entities/offer.entity';
import { User } from '../users/entities/user.entity';
import { EcoTraveler } from '../eco-traveler/entities/eco-traveler.entity';
import { Provider } from '../provider/entities/provider.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ReportsModule } from '../reports/reports.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Publication, Offer, User, EcoTraveler, Provider]),
    ReportsModule,
    MailModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
