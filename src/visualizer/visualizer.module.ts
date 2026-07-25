import { Module } from '@nestjs/common';
import VisualizerGateway from './visualizer.gateway';
import { DevicesService } from 'src/devices/devices.service';
import { PrismaService } from 'src/prisma.service';

@Module({ providers: [VisualizerGateway, DevicesService, PrismaService] })
export default class VisualizerModule {}
