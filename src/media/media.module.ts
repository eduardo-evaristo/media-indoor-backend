import { forwardRef, Module } from '@nestjs/common';
import MediaService from './media.service';
import { MediaController } from './media.controller';
import { PrismaService } from 'src/prisma.service';
import { PlaylistMediaModule } from 'src/playlist-media/playlist-media.module';
import StorageService from 'src/storage/storage.service';

@Module({
  imports: [forwardRef(() => PlaylistMediaModule)],
  controllers: [MediaController],
  providers: [MediaService, PrismaService, StorageService],
  exports: [MediaService],
})
export class MediaModule {}
