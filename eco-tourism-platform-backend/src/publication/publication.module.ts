import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publication } from './entities/publication.entity';
import { PublicationLike } from './entities/publication-like.entity';
import { PublicationComment } from './entities/publication-comment.entity';
import { CommentLike } from './entities/comment-like.entity';
import { PublicationService } from './publication.service';
import { PublicationController } from './publication.controller';
import { EcoTravelerModule } from '../eco-traveler/eco-traveler.module';
import { EcoTraveler } from '../eco-traveler/entities/eco-traveler.entity';
import { Provider } from '../provider/entities/provider.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Publication, PublicationLike, PublicationComment, CommentLike, EcoTraveler, Provider]),
    EcoTravelerModule,
  ],
  providers: [PublicationService],
  controllers: [PublicationController],
  exports: [PublicationService],
})
export class PublicationModule {}
