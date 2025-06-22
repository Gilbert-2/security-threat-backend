import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../auth/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserActivity } from './entities/user-activity.entity';
import { UserActivityService } from './user-activity.service';
import { UserActivityController } from './user-activity.controller';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserActivity]),
    NotificationsModule,
    AnalyticsModule
  ],
  providers: [UsersService, UserActivityService],
  controllers: [UsersController, UserActivityController],
  exports: [UsersService, UserActivityService],
})
export class UsersModule {} 