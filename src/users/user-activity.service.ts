import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActivity, ActivityType } from './entities/user-activity.entity';
import { CreateUserActivityDto } from './dto/create-user-activity.dto';
import { ActivityFilter } from './dto/activity-filter.dto';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class UserActivityService {
  constructor(
    @InjectRepository(UserActivity)
    private userActivityRepository: Repository<UserActivity>,
    private analyticsService: AnalyticsService
  ) {}

  async create(createUserActivityDto: CreateUserActivityDto): Promise<UserActivity> {
    try {
      // Validate required fields
      if (!createUserActivityDto.userId) {
        throw new BadRequestException('User ID is required');
      }

      if (!createUserActivityDto.type) {
        throw new BadRequestException('Activity type is required');
      }

      if (!createUserActivityDto.description) {
        throw new BadRequestException('Activity description is required');
      }

      // Create activity with timestamp
      const activity = this.userActivityRepository.create({
        ...createUserActivityDto,
        timestamp: new Date(),
        metadata: {
          ...createUserActivityDto.metadata,
          timestamp: new Date().toISOString()
        }
      });

      const savedActivity = await this.userActivityRepository.save(activity);

      // Record analytics event for user activity
      if (this.analyticsService) {
        await this.analyticsService.recordEvent(
          'user_activity',
          { count: 1 },
          createUserActivityDto.userId,
          { type: createUserActivityDto.type, description: createUserActivityDto.description }
        );
      }

      return savedActivity;
    } catch (error) {
      console.error('Error creating user activity:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create user activity: ' + error.message);
    }
  }

  async findAll(filter?: ActivityFilter): Promise<UserActivity[]> {
    try {
      const queryBuilder = this.userActivityRepository.createQueryBuilder('activity');

      if (filter) {
        if (filter.startDate) {
          queryBuilder.andWhere('activity.timestamp >= :startDate', { startDate: filter.startDate });
        }
        if (filter.endDate) {
          queryBuilder.andWhere('activity.timestamp <= :endDate', { endDate: filter.endDate });
        }
        if (filter.type) {
          queryBuilder.andWhere('activity.type = :type', { type: filter.type });
        }
        if (filter.userId) {
          queryBuilder.andWhere('activity.userId = :userId', { userId: filter.userId });
        }
      }

      queryBuilder.orderBy('activity.timestamp', 'DESC');
      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error finding user activities:', error);
      throw new BadRequestException('Failed to find user activities: ' + error.message);
    }
  }

  async findAllWithPagination(
    filter?: ActivityFilter,
    page: number = 1,
    limit: number = 5
  ): Promise<{
    activities: UserActivity[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      // Calculate offset
      const offset = (page - 1) * limit;

      // Build query for activities
      const queryBuilder = this.userActivityRepository.createQueryBuilder('activity');

      // Apply filters
      if (filter) {
        if (filter.startDate) {
          queryBuilder.andWhere('activity.timestamp >= :startDate', { startDate: filter.startDate });
        }
        if (filter.endDate) {
          queryBuilder.andWhere('activity.timestamp <= :endDate', { endDate: filter.endDate });
        }
        if (filter.type) {
          queryBuilder.andWhere('activity.type = :type', { type: filter.type });
        }
        if (filter.userId) {
          queryBuilder.andWhere('activity.userId = :userId', { userId: filter.userId });
        }
      }

      // Get total count for pagination
      const totalQueryBuilder = this.userActivityRepository.createQueryBuilder('activity');

      // Apply same filters to count query
      if (filter) {
        if (filter.startDate) {
          totalQueryBuilder.andWhere('activity.timestamp >= :startDate', { startDate: filter.startDate });
        }
        if (filter.endDate) {
          totalQueryBuilder.andWhere('activity.timestamp <= :endDate', { endDate: filter.endDate });
        }
        if (filter.type) {
          totalQueryBuilder.andWhere('activity.type = :type', { type: filter.type });
        }
        if (filter.userId) {
          totalQueryBuilder.andWhere('activity.userId = :userId', { userId: filter.userId });
        }
      }

      const total = await totalQueryBuilder.getCount();

      // Get paginated activities
      queryBuilder
        .orderBy('activity.timestamp', 'DESC')
        .skip(offset)
        .take(limit);

      const activities = await queryBuilder.getMany();

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      const pagination = {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      };

      return {
        activities,
        pagination
      };
    } catch (error) {
      console.error('Error finding all user activities with pagination:', error);
      throw new BadRequestException('Failed to find user activities: ' + error.message);
    }
  }

  async findByUser(userId: string, filter?: Omit<ActivityFilter, 'userId'>): Promise<UserActivity[]> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const queryBuilder = this.userActivityRepository.createQueryBuilder('activity')
        .where('activity.userId = :userId', { userId });

      if (filter) {
        if (filter.startDate) {
          queryBuilder.andWhere('activity.timestamp >= :startDate', { startDate: filter.startDate });
        }
        if (filter.endDate) {
          queryBuilder.andWhere('activity.timestamp <= :endDate', { endDate: filter.endDate });
        }
        if (filter.type) {
          queryBuilder.andWhere('activity.type = :type', { type: filter.type });
        }
      }

      queryBuilder.orderBy('activity.timestamp', 'DESC');
      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error finding user activities:', error);
      throw new BadRequestException('Failed to find user activities: ' + error.message);
    }
  }

  async findByUserWithPagination(
    userId: string, 
    filter?: Omit<ActivityFilter, 'userId'>,
    page: number = 1,
    limit: number = 5
  ): Promise<{
    activities: UserActivity[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      // Calculate offset
      const offset = (page - 1) * limit;

      // Build query for activities
      const queryBuilder = this.userActivityRepository.createQueryBuilder('activity')
        .where('activity.userId = :userId', { userId });

      // Apply filters
      if (filter) {
        if (filter.startDate) {
          queryBuilder.andWhere('activity.timestamp >= :startDate', { startDate: filter.startDate });
        }
        if (filter.endDate) {
          queryBuilder.andWhere('activity.timestamp <= :endDate', { endDate: filter.endDate });
        }
        if (filter.type) {
          queryBuilder.andWhere('activity.type = :type', { type: filter.type });
        }
      }

      // Get total count for pagination
      const totalQueryBuilder = this.userActivityRepository.createQueryBuilder('activity')
        .where('activity.userId = :userId', { userId });

      // Apply same filters to count query
      if (filter) {
        if (filter.startDate) {
          totalQueryBuilder.andWhere('activity.timestamp >= :startDate', { startDate: filter.startDate });
        }
        if (filter.endDate) {
          totalQueryBuilder.andWhere('activity.timestamp <= :endDate', { endDate: filter.endDate });
        }
        if (filter.type) {
          totalQueryBuilder.andWhere('activity.type = :type', { type: filter.type });
        }
      }

      const total = await totalQueryBuilder.getCount();

      // Get paginated activities
      queryBuilder
        .orderBy('activity.timestamp', 'DESC')
        .skip(offset)
        .take(limit);

      const activities = await queryBuilder.getMany();

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      const pagination = {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      };

      return {
        activities,
        pagination
      };
    } catch (error) {
      console.error('Error finding user activities with pagination:', error);
      throw new BadRequestException('Failed to find user activities: ' + error.message);
    }
  }

  async getSummary(filter?: Omit<ActivityFilter, 'userId'>): Promise<{
    total: number;
    byType: Record<ActivityType, number>;
    byDate: { date: string; count: number }[];
  }> {
    try {
      const activities = await this.findAll(filter);
      
      const byType = activities.reduce((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
      }, {} as Record<ActivityType, number>);

      const byDate = activities.reduce((acc, activity) => {
        const date = activity.timestamp.toISOString().split('T')[0];
        const existing = acc.find(item => item.date === date);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ date, count: 1 });
        }
        return acc;
      }, [] as { date: string; count: number }[]);

      return {
        total: activities.length,
        byType,
        byDate: byDate.sort((a, b) => b.date.localeCompare(a.date))
      };
    } catch (error) {
      console.error('Error getting activity summary:', error);
      throw new BadRequestException('Failed to get activity summary: ' + error.message);
    }
  }

  async getActivityTypes(filter?: Omit<ActivityFilter, 'userId'>): Promise<Record<ActivityType, number>> {
    try {
      const activities = await this.findAll(filter);
      return activities.reduce((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
      }, {} as Record<ActivityType, number>);
    } catch (error) {
      console.error('Error getting activity types:', error);
      throw new BadRequestException('Failed to get activity types: ' + error.message);
    }
  }

  async getTotalCountForUser(userId: string): Promise<number> {
    try {
      const count = await this.userActivityRepository.count({
        where: { userId }
      });
      return count;
    } catch (error) {
      console.error('Error getting total count for user:', error);
      return 0;
    }
  }
} 