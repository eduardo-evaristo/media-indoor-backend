import { Module } from '@nestjs/common';
import VisualizerGateway from './visualizer.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { DevicesModule } from 'src/devices/devices.module';

@Module({
  imports: [AuthModule, DevicesModule],
  providers: [VisualizerGateway],
})
export default class VisualizerModule {}
