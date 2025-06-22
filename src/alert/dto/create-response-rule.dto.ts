import { IsString, IsEnum, IsArray, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AlertSeverity } from '../enums/alert-severity.enum';
import { ResponseActionType } from '../entities/response-rule.entity';

class TriggerConditionDto {
  @ApiProperty({ example: 'failed_login_attempts' })
  @IsString()
  type: string;

  @ApiProperty({ example: { threshold: 5, timeWindow: 300 } })
  @IsOptional()
  parameters: Record<string, any>;
}

class ActionDto {
  @ApiProperty({ enum: ResponseActionType, example: ResponseActionType.NOTIFY })
  @IsEnum(ResponseActionType)
  type: ResponseActionType;

  @ApiProperty({ example: { recipients: ['admin@example.com'], message: 'Alert triggered' } })
  @IsOptional()
  parameters: Record<string, any>;

  @ApiProperty({ required: false, example: 60 })
  @IsOptional()
  delay?: number;
}

export class CreateResponseRuleDto {
  @ApiProperty({ example: 'Failed Login Response' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Automated response for failed login attempts' })
  @IsString()
  description: string;

  @ApiProperty({ enum: AlertSeverity, example: AlertSeverity.HIGH })
  @IsEnum(AlertSeverity)
  severity: AlertSeverity;

  @ApiProperty({ type: [TriggerConditionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TriggerConditionDto)
  triggerConditions: TriggerConditionDto[];

  @ApiProperty({ type: [ActionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionDto)
  actions: ActionDto[];

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  requiresApproval: boolean;

  @ApiProperty({ example: ['admin', 'supervisor'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  approvalRoles?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, any>;
} 