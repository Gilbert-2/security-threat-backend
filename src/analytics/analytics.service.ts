import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsData } from './entities/analytics-data.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsData)
    private analyticsRepository: Repository<AnalyticsData>,
  ) {}

  async getMetrics(type: string) {
    return this.analyticsRepository.find({
      where: { type },
      order: { timestamp: 'DESC' },
      take: 100,
    });
  }

  async getTrends(period: string) {
    // Implement trend analysis based on period
    return this.analyticsRepository.find({
      order: { timestamp: 'DESC' },
      take: 100,
    });
  }

  async getOverview(startDate?: string, endDate?: string) {
    try {
      const qb = this.analyticsRepository.createQueryBuilder('analytics');
      if (startDate) {
        qb.andWhere('analytics.timestamp >= :startDate', { startDate: new Date(startDate) });
      }
      if (endDate) {
        qb.andWhere('analytics.timestamp <= :endDate', { endDate: new Date(endDate) });
      }
      qb.orderBy('analytics.timestamp', 'DESC').limit(100);
      const [data, count] = await qb.getManyAndCount();
      return {
        count,
        data: data || []
      };
    } catch (error) {
      console.error('Error in getOverview:', error);
      return {
        count: 0,
        data: []
      };
    }
  }

  async recordEvent(
    type: string,
    metrics: Record<string, number>,
    userId?: string,
    metadata?: any
  ) {
    const analytics = this.analyticsRepository.create({
      type,
      metrics,
      timestamp: new Date(),
      metadata: { ...metadata, userId }
    });
    await this.analyticsRepository.save(analytics);
  }

  // Helper to format date as YYYY-MM-DD
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Aggregate daily analytics
  async getDailyAnalytics(startDate?: string, endDate?: string, userId?: string) {
    const qb = this.analyticsRepository.createQueryBuilder('analytics');
    // Use only the date part for filtering
    if (startDate) {
      qb.andWhere(`DATE(analytics.timestamp) >= :startDate`, { startDate });
    }
    if (endDate) {
      qb.andWhere(`DATE(analytics.timestamp) <= :endDate`, { endDate });
    }
    // Only apply userId filter if it is defined and not empty
    if (typeof userId === 'string' && userId.length > 0) {
      qb.andWhere('(analytics.metadata->>\'userId\') = :userId', { userId });
    }
    qb.orderBy('analytics.timestamp', 'ASC');
    const data = await qb.getMany();
    console.log('[getDailyAnalytics] startDate:', startDate, 'endDate:', endDate, 'userId:', userId, 'results:', data.length);
    // If no data, return empty array
    if (!data || data.length === 0) return [];
    // Group by date (date part only)
    const daily: Record<string, { alerts: number; responses: number; responseTimes: number[] }> = {};
    for (const entry of data) {
      const date = entry.timestamp.toISOString().split('T')[0];
      if (!daily[date]) {
        daily[date] = { alerts: 0, responses: 0, responseTimes: [] };
      }
      if (entry.type === 'alert_created') {
        daily[date].alerts += entry.metrics?.count || 1;
      }
      if (entry.type === 'response_triggered') {
        daily[date].responses += entry.metrics?.count || 1;
        if (entry.metrics?.responseTime) {
          daily[date].responseTimes.push(entry.metrics.responseTime);
        }
      }
    }
    // Build result array
    const result = Object.entries(daily).map(([date, values]) => ({
      date,
      alerts: values.alerts,
      responses: values.responses,
      averageResponseTime: values.responseTimes.length > 0 ?
        Number((values.responseTimes.reduce((a, b) => a + b, 0) / values.responseTimes.length).toFixed(2)) : 0
    }));
    return result;
  }

  // Analytics summary
  async getAnalyticsSummary(startDate?: string, endDate?: string, userId?: string) {
    const daily = await this.getDailyAnalytics(startDate, endDate, userId);
    let totalAlerts = 0;
    let totalResponses = 0;
    let allResponseTimes: number[] = [];
    for (const day of daily) {
      totalAlerts += day.alerts;
      totalResponses += day.responses;
      if (day.averageResponseTime > 0) {
        allResponseTimes.push(day.averageResponseTime);
      }
    }
    const avgResponseTime = allResponseTimes.length > 0 ?
      Number((allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length).toFixed(2)) : 0;
    return {
      totalAlerts,
      totalResponses,
      averageResponseTime: avgResponseTime,
      daily
    };
  }

  // Metric-specific data
  async getMetricData(metric: string, startDate?: string, endDate?: string, userId?: string) {
    const daily = await this.getDailyAnalytics(startDate, endDate, userId);
    let data: { date: string, value: number }[] = [];
    if (metric === 'alerts') {
      data = daily.map(d => ({ date: d.date, value: d.alerts }));
    } else if (metric === 'responses') {
      data = daily.map(d => ({ date: d.date, value: d.responses }));
    } else if (metric === 'responseTime') {
      data = daily.map(d => ({ date: d.date, value: d.averageResponseTime }));
    }
    return { data };
  }
} 