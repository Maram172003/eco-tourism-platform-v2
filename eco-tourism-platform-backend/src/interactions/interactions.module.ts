import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemLike } from './entities/item-like.entity';
import { ItemComment } from './entities/item-comment.entity';
import { ItemCommentLike } from './entities/item-comment-like.entity';
import { InteractionsService } from './interactions.service';
import { InteractionsController } from './interactions.controller';
import { EcoTraveler } from '../eco-traveler/entities/eco-traveler.entity';
import { Guide } from '../guide/entities/guide.entity';
import { ProjectOwner } from '../project-owner/entities/project-owner.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Venue } from '../project-owner/entities/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ItemLike,
      ItemComment,
      ItemCommentLike,
      EcoTraveler,
      Guide,
      ProjectOwner,
      Offer,
      Venue,
    ]),
  ],
  providers: [InteractionsService],
  controllers: [InteractionsController],
  exports: [InteractionsService],
})
export class InteractionsModule {}
