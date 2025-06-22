import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ResponseRule } from './entities/response-rule.entity';
import { CreateResponseRuleDto } from './dto/create-response-rule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { ResponseRuleService } from './response-rule.service';

@ApiTags('response-rules')
@Controller('response-rules')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ResponseRuleController {
  constructor(private readonly responseRuleService: ResponseRuleService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new response rule' })
  create(@Body() createResponseRuleDto: CreateResponseRuleDto): Promise<ResponseRule> {
    return this.responseRuleService.create(createResponseRuleDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Get all response rules' })
  findAll(@Query('isActive') isActive?: boolean): Promise<ResponseRule[]> {
    return this.responseRuleService.findAll(isActive);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get response rule statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns response rule statistics',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        active: { type: 'number' },
        inactive: { type: 'number' },
        bySeverity: {
          type: 'object',
          properties: {
            low: { type: 'number' },
            medium: { type: 'number' },
            high: { type: 'number' },
            critical: { type: 'number' }
          }
        },
        requiresApproval: { type: 'number' },
        activePercentage: { type: 'number' }
      }
    }
  })
  async getStats() {
    try {
      return await this.responseRuleService.getStats();
    } catch (error) {
      console.error('Error in getStats controller:', error);
      throw error;
    }
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Get response rule by ID' })
  findOne(@Param('id') id: string): Promise<ResponseRule> {
    return this.responseRuleService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update response rule' })
  update(
    @Param('id') id: string,
    @Body() updateResponseRuleDto: Partial<CreateResponseRuleDto>,
  ): Promise<ResponseRule> {
    return this.responseRuleService.update(id, updateResponseRuleDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete response rule' })
  remove(@Param('id') id: string): Promise<void> {
    return this.responseRuleService.remove(id);
  }

  @Post(':id/activate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activate response rule' })
  activate(@Param('id') id: string): Promise<ResponseRule> {
    return this.responseRuleService.setActive(id, true);
  }

  @Post(':id/deactivate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate response rule' })
  deactivate(@Param('id') id: string): Promise<ResponseRule> {
    return this.responseRuleService.setActive(id, false);
  }
} 