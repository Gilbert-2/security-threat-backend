import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AlertSeverity } from '../enums/alert-severity.enum';

export enum ResponseActionType {
  NOTIFY = 'notify',
  LOCK_ACCOUNT = 'lock_account',
  BLOCK_IP = 'block_ip',
  ENABLE_2FA = 'enable_2fa',
  RESTRICT_ACCESS = 'restrict_access',
  LOG_ACTIVITY = 'log_activity',
  EXECUTE_SCRIPT = 'execute_script',
  CREATE_TICKET = 'create_ticket'
}

@Entity()
export class ResponseRule {
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
  triggerConditions: {
    type: string;
    parameters: Record<string, any>;
  }[];

  @Column({ type: 'jsonb' })
  actions: {
    type: ResponseActionType;
    parameters: Record<string, any>;
    delay?: number; // Delay in seconds before executing the action
  }[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  requiresApproval: boolean;

  @Column({ type: 'jsonb', nullable: true })
  approvalRoles: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 