import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceContribution } from './entities/place-contribution.entity';
import { ContributionVote } from './entities/contribution-vote.entity';
import { Publication } from '../publication/entities/publication.entity';
import { EcoTraveler } from '../eco-traveler/entities/eco-traveler.entity';
import { Guide } from '../guide/entities/guide.entity';
import { Provider } from '../provider/entities/provider.entity';
import { PlaceContributionService } from './place-contribution.service';
import { PlaceContributionController } from './place-contribution.controller';
import { PublicationModule } from '../publication/publication.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlaceContribution,
      ContributionVote,
      Publication,
      EcoTraveler,
      Guide,
      Provider,
    ]),
    PublicationModule,
  ],
  controllers: [PlaceContributionController],
  providers: [PlaceContributionService],
})
export class PlaceContributionModule {}
