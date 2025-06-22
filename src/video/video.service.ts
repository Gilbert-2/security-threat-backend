import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoStream } from './entities/video-stream.entity';
import { VideoFrame } from './entities/video-frame.entity';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(VideoStream)
    private videoStreamRepository: Repository<VideoStream>,
    @InjectRepository(VideoFrame)
    private videoFrameRepository: Repository<VideoFrame>,
  ) {}

  findAll() {
    return this.videoStreamRepository.find();
  }

  findOne(id: string) {
    return this.videoStreamRepository.findOneBy({ id });
  }

  create(stream: Partial<VideoStream>) {
    const videoStream = this.videoStreamRepository.create(stream);
    return this.videoStreamRepository.save(videoStream);
  }

  async update(id: string, stream: Partial<VideoStream>) {
    await this.videoStreamRepository.update(id, stream);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.videoStreamRepository.delete(id);
  }

  async getFrames(streamId: string) {
    return this.videoFrameRepository.find({
      where: { streamId },
      order: { timestamp: 'DESC' },
    });
  }
} 