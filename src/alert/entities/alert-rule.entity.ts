import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { AlertSeverity } from '../enums/alert-severity.enum';

@Entity()
export class AlertRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: AlertSeverity,
    default: AlertSeverity.MEDIUM
  })
  severity: AlertSeverity;

  @Column({ type: 'jsonb' })
  conditions: {
    type: string;
    parameters: Record<string, any>;
  }[];

  @Column({ type: 'jsonb' })
  actions: {
    type: string;
    parameters: Record<string, any>;
  }[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 