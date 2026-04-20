import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import multer from 'multer';
import { TransactionClient } from 'src/generated/prisma/internal/prismaNamespace';

@Injectable()
export class PlaylistsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createPlaylistDto: CreatePlaylistDto) {
    return await this.prisma.playlist.create({
      omit: { isActive: true },
      data: {
        ...createPlaylistDto,
        userId,
      },
    });
  }

  async getAll(userId: string, page?: number) {
    if (page) {
      const limit = 5;
      const offset = (page - 1) * limit;
      const [data, total] = await Promise.all([
        this.prisma.playlist.findMany({
          omit: { isActive: true },
          where: { userId, isActive: true },
          skip: offset,
          take: limit,
        }),
        this.prisma.playlist.count({
          where: { userId, isActive: true },
        }),
      ]);

      return {
        data,
        page,
        limit,
        total,
      };
    }

    return await this.prisma.playlist.findMany({
      omit: { isActive: true },
      where: { userId, isActive: true },
    });
  }

  // TODO: Take a look at this later
  // TODO: Type this accordingly later
  async getOne(id: string, userId: string) {
    return this.prisma.playlist.findUnique({
      omit: {
        isActive: true,
      },
      where: { id, userId }, // Ensure user owns the playlist
      include: {
        medias: {
          omit: { playlistId: true },
          include: {
            media: { select: { path: true } },
          },
        },
      },
    });
  }

  async attachMediaToPlaylist(
    mediaId: string,
    playlistId: string,
    transaction: TransactionClient,
  ) {
    const playlist = await this.prisma.playlist.findFirst({
      where: { id: playlistId },
    });

    if (playlist === null)
      throw new BadRequestException('Playlist does not exist');

    const coolName = await transaction.playlistMedia.create({
      data: { mediaId, playlistId, position: 2 },
    });
    return coolName;
  }
}
