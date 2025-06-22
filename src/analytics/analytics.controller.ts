import { Controller, Get, Query, Param, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @ApiOperation({ summary: 'Get daily analytics data' })
  async getAnalytics(@Req() req, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    const user = req.user;
    // Only admins can see all data
    const userId = user.role === UserRole.ADMIN ? undefined : user.id;
    return await this.analyticsService.getDailyAnalytics(startDate, endDate, userId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get analytics summary' })
  async getSummary(@Req() req, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    const user = req.user;
    const userId = user.role === UserRole.ADMIN ? undefined : user.id;
    return await this.analyticsService.getAnalyticsSummary(startDate, endDate, userId);
  }

  @Get('metrics/:metric')
  @ApiOperation({ summary: 'Get data for a specific metric' })
  async getMetric(@Req() req, @Param('metric') metric: string, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    const user = req.user;
    const userId = user.role === UserRole.ADMIN ? undefined : user.id;
    return await this.analyticsService.getMetricData(metric, startDate, endDate, userId);
  }
} 