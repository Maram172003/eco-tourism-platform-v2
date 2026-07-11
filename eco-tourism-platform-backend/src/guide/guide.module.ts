import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';

import { Guide } from './entities/guide.entity';
import { GuideOffering } from './entities/guide-offering.entity';
import { Booking } from '../booking/entities/booking.entity';
import { GuideOfferingAvailabilityRule } from './entities/guide-offering-availability-rule.entity';
import { GuideOfferingSession } from './entities/guide-offering-session.entity';
import { GuideOfferingBlock } from './entities/guide-offering-block.entity';
import { GuideOfferingPrice } from './entities/guide-offering-price.entity';
import { GuideService } from './guide.service';
import { GuideOfferingService } from './guide-offering.service';
import { GuideSearchService } from './guide-search.service';
import { GuideController } from './guide.controller';
import { GuideOfferingController } from './guide-offering.controller';
import { GuideMongoService } from './guide-mongo.service';
import { GuideSkills, GuideSkillsSchema } from './schemas/guide-skills.schema';
import {
  GuideEngagement,
  GuideEngagementSchema,
} from './schemas/guide-engagement.schema';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Guide,
      GuideOffering,
      GuideOfferingAvailabilityRule,
      GuideOfferingSession,
      GuideOfferingBlock,
      GuideOfferingPrice,
      Booking,
    ]),
    MongooseModule.forFeature([
      { name: GuideSkills.name, schema: GuideSkillsSchema },
      { name: GuideEngagement.name, schema: GuideEngagementSchema },
    ]),
    forwardRef(() => BookingModule),
  ],
  providers: [
    GuideService,
    GuideOfferingService,
    GuideSearchService,
    GuideMongoService,
  ],
  controllers: [GuideController, GuideOfferingController],
  exports: [
    GuideService,
    GuideOfferingService,
    GuideSearchService,
    GuideMongoService,
  ],
})
export class GuideModule {}
