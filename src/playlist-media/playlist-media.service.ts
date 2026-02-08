import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import StorageService from 'src/storage/storage.service';
import MediaService from 'src/media/media.service';

@Injectable()
export class PlaylistMediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly mediaService: MediaService,
  ) {}

  async createMediaAndAttachToPlaylist(
    file: Express.Multer.File,
    playlistId: string,
  ) {
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
          },
          transaction,
        );

        // Attach it to a playlist
        // TODO: Maybe transform this into its own method
        const mediaToPlaylist = await transaction.playlistMedia.create({
          data: { mediaId: createdMedia.id, playlistId, position: 1 },
        });

        return mediaToPlaylist;
      });

      // TODO: Review this
      return this.storageService.signUrl(fileKey);
    } catch (err: unknown) {
      // TODO: Remove from bucket etc
      throw err;
    }
  }
}
