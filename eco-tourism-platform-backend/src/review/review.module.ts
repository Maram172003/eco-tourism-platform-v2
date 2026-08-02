import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { EcoTravelerModule } from '../eco-traveler/eco-traveler.module';

@Module({
  imports: [TypeOrmModule.forFeature([Review]), EcoTravelerModule],
  providers: [ReviewService],
  controllers: [ReviewController],
  exports: [ReviewService],
})
export class ReviewModule {}
