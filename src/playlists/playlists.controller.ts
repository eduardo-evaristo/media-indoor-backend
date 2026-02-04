import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Controller('playlists')
@UseGuards(AuthGuard('jwt'))
export class PlaylistsController {
    constructor(private readonly playlistsService: PlaylistsService) { }

    @Post()
    create(@Req() req: Request, @Body() createPlaylistDto: CreatePlaylistDto) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const userId = req.user.userId;
        return this.playlistsService.create(userId, createPlaylistDto);
    }

    @Get()
    getAll(@Req() req: Request) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const userId = req.user.userId;
        return this.playlistsService.getAll(userId);
    }

    @Get(':id')
    getOne(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const userId = req.user.userId;
        return this.playlistsService.getOne(id, userId);
    }
}
