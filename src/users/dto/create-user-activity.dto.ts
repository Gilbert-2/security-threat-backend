import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ActivityType } from '../entities/user-activity.entity';

export class CreateUserActivityDto {
  @ApiProperty({ description: 'User ID (optional - will be set from authenticated user if not provided)' })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({ description: 'Activity type', enum: ActivityType })
  @IsEnum(ActivityType)
  @IsNotEmpty()
  type: ActivityType;

  @ApiProperty({ description: 'Activity description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'IP address', required: false })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiProperty({ description: 'User agent', required: false })
  @IsString()
  @IsOptional()
  userAgent?: string;
} 