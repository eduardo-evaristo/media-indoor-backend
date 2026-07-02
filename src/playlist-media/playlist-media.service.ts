import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import StorageService from 'src/storage/storage.service';
import MediaService from 'src/media/media.service';
import { PlaylistsService } from 'src/playlists/playlists.service';
import { ReorderMediaDTO } from 'src/playlists/dto/reorder-media.dto';

@Injectable()
export class PlaylistMediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly mediaService: MediaService,
    private readonly playlistsService: PlaylistsService,
  ) {}

  async createMediaAndAttachToPlaylist(
    file: Express.Multer.File,
    playlistId: string,
    duration: number,
    userId: string,
  ) {
    const playlist = await this.playlistsService.getOne(playlistId, userId);

    if (!playlist) {
      throw new BadRequestException('Playlist not found');
    }

    const fileKey = await this.storageService.upload(file);

    try {
      // Begin transaction
      await this.prisma.$transaction(async (transaction) => {
        // Create media
        const createdMedia = await this.mediaService.create(
          {
            path: fileKey,
            mimeType: file.mimetype,
            size: file.size,
            userId,
          },
          transaction,
        );

        // TODO: Maybe transform this into its own method
        // Attach it to a playlist

        // Get what position ot should take
        // I believe this is faster than a count, I'm getting ONE value only for this one
        const lastItem = await transaction.playlistMedia.findFirst({
          where: { playlistId },
          orderBy: { position: 'desc' },
        });

        // Using a 1-index here, no particular reason not to use 0 tho
        const position = lastItem ? lastItem.position + 1 : 1;

        const mediaToPlaylist = await transaction.playlistMedia.create({
          data: {
            mediaId: createdMedia.id,
            playlistId,
            position,
            duration,
          },
        });

        return mediaToPlaylist;
      });

      // TODO: Review this
      return this.storageService.signUrl(fileKey);
    } catch (err: unknown) {
      await this.storageService.delete(fileKey);
      throw new Error('Something went wrong while creating media', {
        cause: err,
      });
    }
  }

  async getPlaylistMedia(playlistId: string) {
    const mediaResult = await this.prisma.playlistMedia.findMany({
      where: { playlistId },
      omit: { playlistId: true, mediaId: true },
      include: { media: { select: { path: true, id: true, size: true, mimeType: true } } },
      orderBy: { position: 'asc' },
    });
    // Maybe use an interceptor for this
    // for (const media of mediaResult) {
    //   media.media.path = await this.storageService.signUrl(media.media.path);
    // }
    return mediaResult;
  }

  // This reorder is SHIFT BASED. not swapping
  async reorderMedia(playlistId: string, reorderMediaDto: ReorderMediaDTO) {
    const { mediaId, oldPosition, newPosition } = reorderMediaDto;

    if (oldPosition === newPosition)
      throw new BadRequestException('Positions are the same');

    // Transaction cuz two updates are needed
    return this.prisma.$transaction(async (transaction) => {
      if (oldPosition > newPosition) {
        //MOVING UP POSITIONS
        // All item's positions >= newPos < oldPos add one (+1 to their position)
        await transaction.playlistMedia.updateMany({
          where: {
            playlistId,
            position: { gte: newPosition },
            AND: { position: { lt: oldPosition } },
          },
          data: { position: { increment: 1 } },
        });
        // Should this be an else if or an else, I need another guardrail to make sure cancelled events never reach this or dont go any further
      } else {
        //MOVING DOWN POSITIONS
        await transaction.playlistMedia.updateMany({
          where: {
            playlistId,
            position: { lte: newPosition },
            AND: { position: { gt: oldPosition } },
          },
          data: { position: { decrement: 1 } },
        });
      }

      // ITEM moved become newPos
      await transaction.playlistMedia.update({
        where: { playlistId_mediaId: { mediaId, playlistId } },
        data: { position: newPosition },
      });
    });
  }
}
