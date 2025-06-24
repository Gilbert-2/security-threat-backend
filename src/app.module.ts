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
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL', 'postgresql://neondb_owner:npg_Hm5cbAEjWCl2@ep-purple-recipe-a8u60js9-pooler.eastus2.azure.neon.tech/neondb?sslmode=require'),
        ssl: { rejectUnauthorized: false },
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: true,
      }),
      inject: [ConfigService],
    }),
    MulterModule.register({ dest: './uploads' }),
    VideoModule,
    AlertModule,
    AuthModule,
    AnalyticsModule,
    IntegrationModule,
    NotificationsModule,
    UsersModule,
  ],
  controllers: [UploadController],
})
export class AppModule {}