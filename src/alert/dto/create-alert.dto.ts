import { IsString, IsEnum, IsOptional, IsObject, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AlertSeverity } from '../enums/alert-severity.enum';
import { LocationType } from '../entities/alert.entity';

class CoordinatesDto {
  @ApiProperty({ example: 40.7128 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -74.0060 })
  @IsNumber()
  longitude: number;
}

class LocationDetailsDto {
  @ApiProperty({ required: false, example: 'Main Building' })
  @IsString()
  @IsOptional()
  building?: string;

  @ApiProperty({ required: false, example: '3rd Floor' })
  @IsString()
  @IsOptional()
  floor?: string;

  @ApiProperty({ required: false, example: 'Room 301' })
  @IsString()
  @IsOptional()
  room?: string;

  @ApiProperty({ required: false, example: 'Restricted Area A' })
  @IsString()
  @IsOptional()
  zone?: string;

  @ApiProperty({ required: false, type: CoordinatesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;

  @ApiProperty({ required: false, example: '123 Security St, City, Country' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false, example: 'Main Entrance' })
  @IsString()
  @IsOptional()
  accessPoint?: string;
}

export class CreateAlertDto {
  @ApiProperty({ example: 'Unauthorized Access Attempt' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Multiple failed login attempts detected' })
  @IsString()
  description: string;

  @ApiProperty({ enum: AlertSeverity, example: AlertSeverity.HIGH })
  @IsEnum(AlertSeverity)
  severity: AlertSeverity;

  @ApiProperty({ enum: LocationType, example: LocationType.BUILDING })
  @IsEnum(LocationType)
  locationType: LocationType;

  @ApiProperty({ example: 'Main Building' })
  @IsString()
  locationName: string;

  @ApiProperty({ type: LocationDetailsDto })
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDetailsDto)
  locationDetails: LocationDetailsDto;

  @ApiProperty({ example: 'rule-uuid', required: false })
  @IsString()
  @IsOptional()
  ruleId?: string;

  @ApiProperty({ example: 'frame-uuid', required: false })
  @IsString()
  @IsOptional()
  frameId?: string;

  @ApiProperty({ required: false, example: { ipAddress: '192.168.1.100', attemptCount: 5 } })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
} 