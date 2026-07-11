import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { Guide } from '../guide/entities/guide.entity';
import { ProjectOwner } from '../project-owner/entities/project-owner.entity';
import { EcoTraveler } from '../eco-traveler/entities/eco-traveler.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Follow, Guide, ProjectOwner, EcoTraveler]),
  ],
  providers: [FollowService],
  controllers: [FollowController],
  exports: [FollowService],
})
export class FollowModule {}
