import {
  Body,
  Controller,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import MediaService from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizePipe } from 'src/common/pipes/FileSizePipe.pipe';
import { PlaylistMediaService } from 'src/playlist-media/playlist-media.service';

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly playlistMediaService: PlaylistMediaService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile(FileSizePipe) file: Express.Multer.File,
    @Body('playlistId', ParseUUIDPipe) playlistId: string,
  ) {
    return this.playlistMediaService.createMediaAndAttachToPlaylist(
      file,
      playlistId,
    );
  }
}
