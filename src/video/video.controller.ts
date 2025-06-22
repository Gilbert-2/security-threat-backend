import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { VideoService } from './video.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('video')
@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get('streams')
  @ApiOperation({ summary: 'Get all video streams' })
  findAll() {
    return this.videoService.findAll();
  }

  @Get('streams/:id')
  @ApiOperation({ summary: 'Get video stream by id' })
  findOne(@Param('id') id: string) {
    return this.videoService.findOne(id);
  }

  @Post('streams')
  @ApiOperation({ summary: 'Create new video stream' })
  create(@Body() stream: any) {
    return this.videoService.create(stream);
  }

  @Put('streams/:id')
  @ApiOperation({ summary: 'Update video stream' })
  update(@Param('id') id: string, @Body() stream: any) {
    return this.videoService.update(id, stream);
  }

  @Delete('streams/:id')
  @ApiOperation({ summary: 'Delete video stream' })
  remove(@Param('id') id: string) {
    return this.videoService.remove(id);
  }
} 