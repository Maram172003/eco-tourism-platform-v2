import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collaboration } from './entities/collaboration.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Guide } from '../guide/entities/guide.entity';
import { Provider } from '../provider/entities/provider.entity';
import { Organization } from '../organization/entities/organization.entity';
import { GuideAvailabilitySlot } from '../guide/entities/guide-availability.entity';
import { CollaborationService } from './collaboration.service';
import { CollaborationController } from './collaboration.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Collaboration,
      Offer,
      Guide,
      Provider,
      Organization,
      GuideAvailabilitySlot,
    ]),
    NotificationModule,
  ],
  providers: [CollaborationService],
  controllers: [CollaborationController],
  exports: [CollaborationService],
})
export class CollaborationModule {}
