import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { VideoFrame } from './video-frame.entity';

@Entity()
export class VideoStream {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => VideoFrame, frame => frame.stream)
  frames: VideoFrame[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 