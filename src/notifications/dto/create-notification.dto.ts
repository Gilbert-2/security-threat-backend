import { IsString, IsEnum, IsOptional, IsUUID, IsArray, IsObject, IsBoolean, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ example: 'Security Alert' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Unauthorized access detected in Building A' })
  @IsString()
  description: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.SECURITY })
  @IsEnum(['security', 'system', 'hardware', 'user'])
  type: 'security' | 'system' | 'hardware' | 'user';

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({ example: 'Unauthorized access detected in Building A', required: false })
  @IsString()
  @IsOptional()
  details?: string;

  @ApiProperty({ required: false, example: { location: 'Building A', severity: 'high' } })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class CreateBulkNotificationDto {
  @ApiProperty({ 
    type: [String], 
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    description: 'Array of user IDs to send notifications to. Required if "all" is false or not provided.',
    required: false
  })
  @ValidateIf(o => !o.all)
  @IsArray()
  @IsUUID('4', { each: true })
  userIds?: string[];

  @ApiProperty({ 
    type: Boolean, 
    example: false,
    description: 'If true, sends notification to all users in the system. If true, userIds array is ignored.',
    required: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  all?: boolean;

  @ApiProperty({ type: CreateNotificationDto })
  notification: CreateNotificationDto;
} 