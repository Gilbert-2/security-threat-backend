import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoModule } from './video/video.module';
import { AlertModule } from './alert/alert.module';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { IntegrationModule } from './integration/integration.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USERNAME', 'postgres'),
        password: configService.get('DATABASE_PASSWORD', '12345'),
        database: configService.get('DATABASE_NAME', 'security'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: true,
      }),
      inject: [ConfigService],
    }),
    VideoModule,
    AlertModule,
    AuthModule,
    AnalyticsModule,
    IntegrationModule,
    NotificationsModule,
    UsersModule,
  ],
})
export class AppModule {}