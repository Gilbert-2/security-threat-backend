import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert, LocationType } from './entities/alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    private analyticsService: AnalyticsService
  ) {}

  findAll(): Promise<Alert[]> {
    return this.alertRepository.find();
  }

  findOne(id: string): Promise<Alert> {
    return this.alertRepository.findOneBy({ id });
  }

  async create(createAlertDto: CreateAlertDto): Promise<Alert> {
    const alert = this.alertRepository.create(createAlertDto);
    await this.alertRepository.save(alert);

    // Record analytics event for alert creation (no userId available)
    if (this.analyticsService) {
      await this.analyticsService.recordEvent(
        'alert_created',
        { count: 1 },
        undefined,
        { alertId: alert.id, severity: alert.severity }
      );
    }

    return alert;
  }

  async update(id: string, alert: Partial<Alert>): Promise<Alert> {
    await this.alertRepository.update(id, alert);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.alertRepository.delete(id);
  }

  // New methods for location-based queries
  async findByLocation(locationType: LocationType, locationName: string): Promise<Alert[]> {
    return this.alertRepository.find({
      where: {
        locationType,
        locationName
      }
    });
  }

  async findByBuilding(building: string): Promise<Alert[]> {
    return this.alertRepository.find({
      where: {
        locationDetails: {
          building
        }
      }
    });
  }

  async findByFloor(building: string, floor: string): Promise<Alert[]> {
    return this.alertRepository.find({
      where: {
        locationDetails: {
          building,
          floor
        }
      }
    });
  }

  async findByRoom(building: string, floor: string, room: string): Promise<Alert[]> {
    return this.alertRepository.find({
      where: {
        locationDetails: {
          building,
          floor,
          room
        }
      }
    });
  }

  async findByZone(zone: string): Promise<Alert[]> {
    return this.alertRepository.find({
      where: {
        locationDetails: {
          zone
        }
      }
    });
  }

  async findByCoordinates(latitude: number, longitude: number, radius: number): Promise<Alert[]> {
    // This is a simplified version. In a real application, you would use PostGIS
    // or a similar spatial database extension for proper geospatial queries
    return this.alertRepository.find({
      where: {
        locationDetails: {
          coordinates: {
            latitude,
            longitude
          }
        }
      }
    });
  }
} 