import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('integrations')
@Controller('integrations')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all integrations' })
  findAll() {
    return this.integrationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get integration by id' })
  findOne(@Param('id') id: string) {
    return this.integrationService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new integration' })
  create(@Body() config: any) {
    return this.integrationService.create(config);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update integration' })
  update(@Param('id') id: string, @Body() config: any) {
    return this.integrationService.update(id, config);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete integration' })
  remove(@Param('id') id: string) {
    return this.integrationService.remove(id);
  }
} 