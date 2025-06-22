import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { AlertService } from './alert.service';
import { Alert, LocationType } from './entities/alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('alerts')
@Controller('alerts')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Get()
  @ApiOperation({ summary: 'Get all alerts' })
  findAll(): Promise<Alert[]> {
    return this.alertService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get alert by id' })
  findOne(@Param('id') id: string): Promise<Alert> {
    return this.alertService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new alert' })
  create(@Body() createAlertDto: CreateAlertDto): Promise<Alert> {
    return this.alertService.create(createAlertDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update alert' })
  update(@Param('id') id: string, @Body() alert: Partial<Alert>): Promise<Alert> {
    return this.alertService.update(id, alert);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete alert' })
  remove(@Param('id') id: string): Promise<void> {
    return this.alertService.remove(id);
  }

  // New location-based endpoints
  @Get('location/:type/:name')
  @ApiOperation({ summary: 'Get alerts by location type and name' })
  @ApiQuery({ name: 'type', enum: LocationType })
  findByLocation(
    @Param('type') type: LocationType,
    @Param('name') name: string
  ): Promise<Alert[]> {
    return this.alertService.findByLocation(type, name);
  }

  @Get('building/:building')
  @ApiOperation({ summary: 'Get alerts by building' })
  findByBuilding(@Param('building') building: string): Promise<Alert[]> {
    return this.alertService.findByBuilding(building);
  }

  @Get('floor/:building/:floor')
  @ApiOperation({ summary: 'Get alerts by building and floor' })
  findByFloor(
    @Param('building') building: string,
    @Param('floor') floor: string
  ): Promise<Alert[]> {
    return this.alertService.findByFloor(building, floor);
  }

  @Get('room/:building/:floor/:room')
  @ApiOperation({ summary: 'Get alerts by building, floor, and room' })
  findByRoom(
    @Param('building') building: string,
    @Param('floor') floor: string,
    @Param('room') room: string
  ): Promise<Alert[]> {
    return this.alertService.findByRoom(building, floor, room);
  }

  @Get('zone/:zone')
  @ApiOperation({ summary: 'Get alerts by zone' })
  findByZone(@Param('zone') zone: string): Promise<Alert[]> {
    return this.alertService.findByZone(zone);
  }

  @Get('coordinates')
  @ApiOperation({ summary: 'Get alerts by coordinates' })
  @ApiQuery({ name: 'latitude', type: Number })
  @ApiQuery({ name: 'longitude', type: Number })
  @ApiQuery({ name: 'radius', type: Number, required: false })
  findByCoordinates(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius?: number
  ): Promise<Alert[]> {
    return this.alertService.findByCoordinates(latitude, longitude, radius);
  }
} 