import { Controller, Post, UploadedFile, UseInterceptors, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { File as MulterFile } from 'multer';
import { Request } from 'express';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  @Post('profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  uploadProfilePicture(@UploadedFile() file: MulterFile, @Req() req: Request) {
    // The filename returned by Multer always includes the extension.
    // The frontend should use this exact filename (with extension) for all profile picture URLs.
    const host = req.get('host');
    const protocol = req.protocol;
    const url = `${protocol}://${host}/uploads/${file.filename}`;
    return { filename: file.filename, url };
  }
} 