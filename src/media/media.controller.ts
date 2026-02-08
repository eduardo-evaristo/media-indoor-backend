import {
  Body,
  Controller,
  ParseUUIDPipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import MediaService from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizePipe } from 'src/common/pipes/FileSizePipe.pipe';
import { PlaylistMediaService } from 'src/playlist-media/playlist-media.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Controller('media')
@UseGuards(AuthGuard('jwt'))
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly playlistMediaService: PlaylistMediaService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile(FileSizePipe) file: Express.Multer.File,
    @Req() request: Request,
    @Body('playlistId', ParseUUIDPipe) playlistId: string,
  ) {
    const user = request.user as { userId: string; email: string };
    return this.playlistMediaService.createMediaAndAttachToPlaylist(
      file,
      playlistId,
      user.userId,
    );
  }
}
