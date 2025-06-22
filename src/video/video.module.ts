import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { VideoStream } from './entities/video-stream.entity';
import { VideoFrame } from './entities/video-frame.entity';
import { VideoProcessor } from './video.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoStream, VideoFrame]),
  ],
  controllers: [VideoController],
  providers: [VideoService, VideoProcessor],
  exports: [VideoService],
})
export class VideoModule {} 