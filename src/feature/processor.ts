import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoFrame } from '../video/entities/video-frame.entity';

@Processor('video-processing')
export class VideoProcessor {
  private readonly logger = new Logger(VideoProcessor.name);

  constructor(
    @InjectRepository(VideoFrame)
    private videoFrameRepository: Repository<VideoFrame>,
  ) {}

  @Process('extract-frames')
  async handleFrameExtraction(job: Job<any>) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);
    this.logger.debug(`Extracting frames from stream: ${job.data.streamId}`);
    
    try {
      // Frame extraction logic
      // This would integrate with FFmpeg or similar video processing libraries
      
      // Store frame metadata in database
      const frame = new VideoFrame();
      frame.streamId = job.data.streamId;
      frame.timestamp = new Date();
      frame.frameNumber = 1; // This would be dynamic in real implementation
      frame.storagePath = '/storage/frames/12345.jpg'; // Example path
      await this.videoFrameRepository.save(frame);
      
      // Add job to frame analysis queue
      // job.moveToQueue('frame-analysis');
      
      return { success: true, frameId: frame.id };
    } catch (error) {
      this.logger.error(`Failed to process job ${job.id}`, error.stack);
      throw error;
    }
  }
}