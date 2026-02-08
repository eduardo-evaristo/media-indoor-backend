import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { MediaModule } from './media/media.module';
import StorageModule from './storage/storage.module';
import { MulterModule } from '@nestjs/platform-express';
import { PlaylistMediaModule } from './playlist-media/playlist-media.module';
import multer from 'multer';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.development'],
      isGlobal: true,
    }),
    MulterModule.register({ storage: multer.memoryStorage() }),
    UsersModule,
    AuthModule,
    PlaylistsModule,
    StorageModule,
    MediaModule,
    PlaylistMediaModule,
  ],
  controllers: [],
})
export class AppModule {}
