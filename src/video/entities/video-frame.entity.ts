import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { VideoStream } from './video-stream.entity';

@Entity()
export class VideoFrame {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => VideoStream, stream => stream.frames)
  @JoinColumn({ name: 'streamId' })
  stream: VideoStream;

  @Column('uuid')
  streamId: string;

  @Column()
  frameNumber: number;

  @Column()
  timestamp: Date;

  @Column()
  storagePath: string;

  @Column({ type: 'jsonb', nullable: true })
  detections: {
    objects: Array<{
      label: string;
      confidence: number;
      bbox: [number, number, number, number];
    }>;
    anomalies: Array<{
      type: string;
      confidence: number;
      description: string;
    }>;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
} 