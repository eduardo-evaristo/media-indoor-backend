import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: ['.env', '.env.development',], isGlobal: true })],
  controllers: [],
  providers: [],
})
export class AppModule { }
