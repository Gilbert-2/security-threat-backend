import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum ActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  PROFILE_UPDATE = 'profile_update',
  PASSWORD_CHANGE = 'password_change',
  ALERT_VIEW = 'alert_view',
  ALERT_ACKNOWLEDGE = 'alert_acknowledge',
  ALERT_RESOLVE = 'alert_resolve',
  SYSTEM_ACCESS = 'system_access',
  DATA_ACCESS = 'data_access',
  SETTINGS_CHANGE = 'settings_change'
}

@Entity()
export class UserActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: ActivityType
  })
  type: ActivityType;

  @Column('text')
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  timestamp: Date;
} 