import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsData } from './entities/analytics-data.entity';
import { VideoModule } from '../video/video.module';
import { AlertModule } from '../alert/alert.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnalyticsData]),
    VideoModule,
    forwardRef(() => AlertModule),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {} 