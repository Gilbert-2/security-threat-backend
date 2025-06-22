import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AnalyticsData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column({ type: 'jsonb' })
  metrics: Record<string, number>;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
} 