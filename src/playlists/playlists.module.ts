import { forwardRef, Module } from '@nestjs/common';
import { PlaylistsController } from './playlists.controller';
import { PlaylistsService } from './playlists.service';
import { PrismaService } from '../prisma.service';
import { PlaylistMediaModule } from 'src/playlist-media/playlist-media.module';
import StorageService from 'src/storage/storage.service';

@Module({
  imports: [forwardRef(() => PlaylistMediaModule)],
  controllers: [PlaylistsController],
  providers: [PlaylistsService, PrismaService, StorageService],
  exports: [PlaylistsService],
})
export class PlaylistsModule {}
