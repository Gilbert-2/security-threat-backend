import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationController } from './integration.controller';
import { IntegrationService } from './integration.service';
import { IntegrationConfig } from './entities/integration-config.entity';
import { AlertModule } from '../alert/alert.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IntegrationConfig]),
    AlertModule,
  ],
  controllers: [IntegrationController],
  providers: [IntegrationService],
  exports: [IntegrationService],
})
export class IntegrationModule {} 