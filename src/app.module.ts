import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PlaylistsModule } from './playlists/playlists.module';

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: ['.env', '.env.development',], isGlobal: true }), UsersModule, AuthModule, PlaylistsModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
