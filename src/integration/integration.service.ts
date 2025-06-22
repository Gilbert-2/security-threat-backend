import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntegrationConfig } from './entities/integration-config.entity';

@Injectable()
export class IntegrationService {
  constructor(
    @InjectRepository(IntegrationConfig)
    private integrationRepository: Repository<IntegrationConfig>,
  ) {}

  findAll() {
    return this.integrationRepository.find();
  }

  findOne(id: string) {
    return this.integrationRepository.findOneBy({ id });
  }

  create(config: Partial<IntegrationConfig>) {
    const integration = this.integrationRepository.create(config);
    return this.integrationRepository.save(integration);
  }

  async update(id: string, config: Partial<IntegrationConfig>) {
    await this.integrationRepository.update(id, config);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.integrationRepository.delete(id);
  }
} 