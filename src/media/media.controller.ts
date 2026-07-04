import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
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
import ObjectSignerInterceptor from 'src/common/interceptors/ObjectSignerInterceptor.interceptor';

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
    @Body('name') name: string,
    @Body('playlistId', ParseUUIDPipe) playlistId: string,
    @Body('duration', ParseIntPipe) duration: number,
  ) {
    const user = request.user as { userId: string; email: string };
    return this.playlistMediaService.createMediaAndAttachToPlaylist(
      name,
      file,
      playlistId,
      duration,
      user.userId,
    );
  }

  @Get()
  @UseInterceptors(ObjectSignerInterceptor)
  async getAll(@Req() request: Request) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = request?.user.userId;
    return this.mediaService.getAll(userId)
  }
}
