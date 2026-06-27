import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceContribution } from './entities/place-contribution.entity';
import { ContributionVote } from './entities/contribution-vote.entity';
import { Publication } from '../publication/entities/publication.entity';
import { EcoTraveler } from '../eco-traveler/entities/eco-traveler.entity';
import { Guide } from '../guide/entities/guide.entity';
import { ProjectOwner } from '../project-owner/entities/project-owner.entity';
import { PlaceContributionService } from './place-contribution.service';
import { PlaceContributionController } from './place-contribution.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PlaceContribution, ContributionVote, Publication, EcoTraveler, Guide, ProjectOwner])],
  controllers: [PlaceContributionController],
  providers: [PlaceContributionService],
})
export class PlaceContributionModule {}
