import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { Provider } from './entities/provider.entity';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import { Venue } from '../project-owner/entities/project.entity';
import { Offer } from '../offer/entities/offer.entity';
import {
  ProjectEngagement,
  ProjectEngagementSchema,
} from '../project-owner/schemas/project-engagement.schema';
import { ProviderMongoService } from './provider-mongo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Provider, Venue, Offer]),
    MongooseModule.forFeature([
      { name: ProjectEngagement.name, schema: ProjectEngagementSchema },
    ]),
  ],
  providers: [ProviderService, ProviderMongoService],
  controllers: [ProviderController],
  exports: [ProviderService, ProviderMongoService],
})
export class ProviderModule {}
