import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravelCart } from './entities/travel-cart.entity';
import { TravelCartItem } from './entities/travel-cart-item.entity';
import { OfferItem } from '../offer/entities/offer-item.entity';
import { Circuit } from '../circuit/entities/circuit.entity';
import { OfferItemSession } from '../offer/entities/offer-item-session.entity';
import { TripPlan } from '../trip-plan/entities/trip-plan.entity';
import { TripPlanItem } from '../trip-plan/entities/trip-plan-item.entity';
import { TravelCartService } from './travel-cart.service';
import { TravelCartController } from './travel-cart.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TravelCart,
      TravelCartItem,
      OfferItem,
      Circuit,
      OfferItemSession,
      TripPlan,
      TripPlanItem,
    ]),
  ],
  providers: [TravelCartService],
  controllers: [TravelCartController],
  exports: [TravelCartService],
})
export class TravelCartModule {}
