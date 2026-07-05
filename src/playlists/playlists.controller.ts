import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Inject,
  forwardRef,
  Patch,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizePipe } from 'src/common/pipes/FileSizePipe.pipe';
import StorageService from 'src/storage/storage.service';
import MediaService from 'src/media/media.service';
import { PlaylistMediaService } from 'src/playlist-media/playlist-media.service';
import { ReorderMediaDTO } from './dto/reorder-media.dto';
import ObjectSignerInterceptor from 'src/common/interceptors/ObjectSignerInterceptor.interceptor';
import { AttachMediaDto } from './dto/attach-media.dto';

@Controller('playlists')
@UseGuards(AuthGuard('jwt'))
export class PlaylistsController {
  constructor(
    private readonly playlistsService: PlaylistsService,
    private readonly playlistMediaService: PlaylistMediaService,
  ) {}

  @Post()
  create(@Req() req: Request, @Body() createPlaylistDto: CreatePlaylistDto) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = req.user.userId;
    return this.playlistsService.create(userId, createPlaylistDto);
  }

  @Get()
  getAll(@Req() req: Request, @Query('page', ParseIntPipe) page: number) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = req.user.userId;
    console.log(req.user);
    return this.playlistsService.getAll(userId, page);
  }

  @Get(':id')
  async getOne(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = req.user.userId;
    const playlist = await this.playlistsService.getOne(id, userId);
    console.log(playlist);
    return playlist;
  }

  @Get(':id/media')
  @UseInterceptors(ObjectSignerInterceptor)
  async getMedia(@Param('id', ParseUUIDPipe) playlistId: string) {
    return this.playlistMediaService.getPlaylistMedia(playlistId);
  }

  @Patch(':id/media/reorder')
  async reorderMedia(
    @Param('id', ParseUUIDPipe) playlistId: string,
    @Body() reorderMediaDto: ReorderMediaDTO,
  ) {
    return this.playlistMediaService.reorderMedia(playlistId, reorderMediaDto);
  }

  @Post(':id/media')
  async attachMedia(
    @Param('id', ParseUUIDPipe) playlistId: string,
    @Body() attachMediaDto: AttachMediaDto
  ) {
    const mediaIds = attachMediaDto.mediaIds;

    return this.playlistMediaService.attachMediaToPlaylist(
      mediaIds,
      playlistId
    );
  }
}
