import { forwardRef, Module } from '@nestjs/common';
import { PlaylistMediaService } from './playlist-media.service';
import { MediaModule } from 'src/media/media.module';
import { PrismaService } from 'src/prisma.service';
import StorageModule from 'src/storage/storage.module';

@Module({
  // This or have the method be inside playlistsController
  imports: [forwardRef(() => MediaModule), StorageModule],
  providers: [PlaylistMediaService, PrismaService],
  exports: [PlaylistMediaService],
})
export class PlaylistMediaModule {}
