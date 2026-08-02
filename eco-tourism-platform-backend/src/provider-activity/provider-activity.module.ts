import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderActivity } from './entities/provider-activity.entity';
import { ProviderActivityService } from './provider-activity.service';
import { ProviderActivityController } from './provider-activity.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderActivity])],
  providers: [ProviderActivityService],
  controllers: [ProviderActivityController],
  exports: [ProviderActivityService],
})
export class ProviderActivityModule {}
