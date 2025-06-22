import { Controller, Get } from '@nestjs/common';
import { 
  HealthCheckService, 
  HttpHealthIndicator, 
  TypeOrmHealthIndicator,
  HealthCheck,
  MicroserviceHealthIndicator 
} from '@nestjs/terminus';
import { ApiTags } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private microservice: MicroserviceHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.microservice.pingCheck('rabbitmq', {
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
        },
      }),
    ]);
  }
}