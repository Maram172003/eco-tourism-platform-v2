import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerStorage } from '@nestjs/throttler';
import { FrenchThrottlerGuard } from './common/guards/throttler.guard';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';
import { MailModule } from './mail/mail.module';
import { GoogleStrategy } from './auth/strategies/google.strategy';
import { PassportModule } from '@nestjs/passport';
import { MongodbModule } from './database/mongodb.module';
import { EcoTravelerModule } from './eco-traveler/eco-traveler.module';
import { QuestionnaireModule } from './questionnaire/questionnaire.module';
import { GuideModule } from './guide/guide.module';
import { OfferModule } from './offer/offer.module';
import { PublicationModule } from './publication/publication.module';
import { UploadModule } from './upload/upload.module';
import { AdminModule } from './admin/admin.module';
import { FollowModule } from './follow/follow.module';
import { MessagesModule } from './messages/messages.module';
import { ReportsModule } from './reports/reports.module';
import { InteractionsModule } from './interactions/interactions.module';
import { PlaceContributionModule } from './place-contribution/place-contribution.module';
import { BookingModule } from './booking/booking.module';
import { CircuitModule } from './circuit/circuit.module';
import { EventModule } from './event/event.module';
import { NotificationModule } from './notification/notification.module';
import { TripPlanModule } from './trip-plan/trip-plan.module';
import { FavoriteModule } from './favorite/favorite.module';
import { ReviewModule } from './review/review.module';
import { TravelCartModule } from './travel-cart/travel-cart.module';
import { PhotoModule } from './photo/photo.module';
import { TimelineModule } from './timeline/timeline.module';
import { RedisModule } from './redis/redis.module';
import { DomainModule } from './domain/domain.module';
import { ProviderModule } from './provider/provider.module';
import { OrganizationModule } from './organization/organization.module';
import { ProviderActivityModule } from './provider-activity/provider-activity.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 300,
      },
    ]),
    ConfigModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    MailModule,
    PassportModule,
    MongodbModule,
    EcoTravelerModule,
    QuestionnaireModule,
    GuideModule,
    ProviderModule,
    OrganizationModule,
    ProviderActivityModule,
    OfferModule,
    PublicationModule,
    UploadModule,
    AdminModule,
    FollowModule,
    MessagesModule,
    ReportsModule,
    InteractionsModule,
    PlaceContributionModule,
    BookingModule,
    CircuitModule,
    EventModule,
    NotificationModule,
    TripPlanModule,
    FavoriteModule,
    ReviewModule,
    TravelCartModule,
    PhotoModule,
    TimelineModule,
    RedisModule,
    DomainModule,
  ],
  providers: [
    GoogleStrategy,
    {
      provide: APP_GUARD,
      useClass: FrenchThrottlerGuard,
    },
  ],
})
export class AppModule {}
