import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AlertRule } from './alert-rule.entity';
import { VideoFrame } from '../../video/entities/video-frame.entity';
import { AlertSeverity } from '../enums/alert-severity.enum';

export enum AlertStatus {
  NEW = 'new',
  ACKNOWLEDGED = 'acknowledged',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  FALSE_ALARM = 'false_alarm'
}

export enum LocationType {
  BUILDING = 'building',
  FLOOR = 'floor',
  ROOM = 'room',
  ZONE = 'zone',
  EXTERIOR = 'exterior'
}

@Entity()
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: AlertSeverity,
    default: AlertSeverity.MEDIUM
  })
  severity: AlertSeverity;

  @Column({
    type: 'enum',
    enum: AlertStatus,
    default: AlertStatus.NEW
  })
  status: AlertStatus;

  @Column({
    type: 'enum',
    enum: LocationType,
    default: LocationType.BUILDING
  })
  locationType: LocationType;

  @Column()
  locationName: string;

  @Column({ type: 'jsonb', nullable: true })
  locationDetails: {
    building?: string;
    floor?: string;
    room?: string;
    zone?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    address?: string;
    accessPoint?: string;
  };

  @ManyToOne(() => AlertRule, { nullable: true })
  @JoinColumn({ name: 'ruleId' })
  rule: AlertRule;

  @Column({ nullable: true })
  ruleId: string;

  @ManyToOne(() => VideoFrame, { nullable: true })
  @JoinColumn({ name: 'frameId' })
  frame: VideoFrame;

  @Column({ nullable: true })
  frameId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 