import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';
import { Alert } from './entities/alert.entity';
import { AlertRule } from './entities/alert-rule.entity';
import { VideoModule } from '../video/video.module';
import { ResponseRule } from './entities/response-rule.entity';
import { ResponseRuleService } from './response-rule.service';
import { ResponseRuleController } from './response-rule.controller';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alert, AlertRule, ResponseRule]),
    VideoModule,
    forwardRef(() => AnalyticsModule),
  ],
  controllers: [AlertController, ResponseRuleController],
  providers: [AlertService, ResponseRuleService],
  exports: [AlertService, ResponseRuleService],
})
export class AlertModule {} 