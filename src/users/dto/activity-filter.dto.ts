import { ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType } from '../entities/user-activity.entity';

export interface ActivityFilter {
  userId?: string;
  type?: ActivityType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export class ActivityFilterDto {
  @ApiPropertyOptional({ description: 'Start date for filtering activities' })
  startDate?: Date;

  @ApiPropertyOptional({ description: 'End date for filtering activities' })
  endDate?: Date;

  @ApiPropertyOptional({ 
    description: 'Type of activity to filter by',
    enum: ActivityType 
  })
  type?: ActivityType;

  @ApiPropertyOptional({ description: 'User ID to filter activities by' })
  userId?: string;
} 