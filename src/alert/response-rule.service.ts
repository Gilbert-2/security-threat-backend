import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseRule } from './entities/response-rule.entity';
import { CreateResponseRuleDto } from './dto/create-response-rule.dto';

@Injectable()
export class ResponseRuleService {
  constructor(
    @InjectRepository(ResponseRule)
    private responseRuleRepository: Repository<ResponseRule>,
  ) {}

  async create(createResponseRuleDto: CreateResponseRuleDto): Promise<ResponseRule> {
    const rule = this.responseRuleRepository.create(createResponseRuleDto);
    return this.responseRuleRepository.save(rule);
  }

  async findAll(isActive?: boolean): Promise<ResponseRule[]> {
    const where = isActive !== undefined ? { isActive } : {};
    return this.responseRuleRepository.find({ where });
  }

  async findOne(id: string): Promise<ResponseRule> {
    const rule = await this.responseRuleRepository.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException(`Response rule with ID ${id} not found`);
    }
    return rule;
  }

  async update(id: string, updateResponseRuleDto: Partial<CreateResponseRuleDto>): Promise<ResponseRule> {
    const rule = await this.findOne(id);
    Object.assign(rule, updateResponseRuleDto);
    return this.responseRuleRepository.save(rule);
  }

  async remove(id: string): Promise<void> {
    const result = await this.responseRuleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Response rule with ID ${id} not found`);
    }
  }

  async setActive(id: string, isActive: boolean): Promise<ResponseRule> {
    const rule = await this.findOne(id);
    rule.isActive = isActive;
    return this.responseRuleRepository.save(rule);
  }

  async getStats() {
    try {
      console.log('Fetching response rules...');
      // Get all rules first
      const rules = await this.responseRuleRepository.find();
      console.log(`Found ${rules?.length || 0} rules`);
      
      if (!rules || rules.length === 0) {
        console.log('No rules found, returning default stats');
        return {
          total: 0,
          active: 0,
          inactive: 0,
          bySeverity: {
            low: 0,
            medium: 0,
            high: 0,
            critical: 0
          },
          requiresApproval: 0,
          activePercentage: 0
        };
      }
      
      try {
        // Calculate basic stats
        const total = rules.length;
        const active = rules.filter(rule => rule.isActive).length;
        console.log(`Total rules: ${total}, Active rules: ${active}`);
        
        // Initialize severity counts
        const bySeverity = {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0
        };

        // Count rules by severity
        rules.forEach(rule => {
          try {
            const severity = rule.severity?.toLowerCase() || 'medium';
            console.log(`Rule ${rule.id} severity: ${severity}`);
            if (severity in bySeverity) {
              bySeverity[severity]++;
            }
          } catch (severityError) {
            console.error(`Error processing severity for rule ${rule.id}:`, severityError);
          }
        });

        // Count rules requiring approval
        const requiresApproval = rules.filter(rule => rule.requiresApproval).length;
        console.log(`Rules requiring approval: ${requiresApproval}`);

        // Calculate active percentage
        const activePercentage = total > 0 ? Number(((active / total) * 100).toFixed(2)) : 0;
        console.log(`Active percentage: ${activePercentage}%`);

        const stats = {
          total,
          active,
          inactive: total - active,
          bySeverity,
          requiresApproval,
          activePercentage
        };

        console.log('Final stats:', stats);
        return stats;
      } catch (calculationError) {
        console.error('Error calculating stats:', calculationError);
        throw calculationError;
      }
    } catch (error) {
      console.error('Error in getStats:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      // Return a safe default response instead of throwing
      return {
        total: 0,
        active: 0,
        inactive: 0,
        bySeverity: {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0
        },
        requiresApproval: 0,
        activePercentage: 0
      };
    }
  }
} 