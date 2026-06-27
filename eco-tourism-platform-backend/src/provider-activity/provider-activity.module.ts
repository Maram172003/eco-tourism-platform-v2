import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';

import { ProviderActivity } from './entities/provider-activity.entity';
import { ActivityDetails, ActivityDetailsSchema } from './schemas/activity-details.schema';
import { ProviderActivityService } from './provider-activity.service';
import { ProviderActivityController } from './provider-activity.controller';

@Module({
  imports: [
    // PostgreSQL — données relationnelles
    TypeOrmModule.forFeature([ProviderActivity]),
    // MongoDB — données flexibles
    MongooseModule.forFeature([
      { name: ActivityDetails.name, schema: ActivityDetailsSchema },
    ]),
  ],
  providers: [ProviderActivityService],
  controllers: [ProviderActivityController],
  exports: [ProviderActivityService],
})
export class ProviderActivityModule {}
