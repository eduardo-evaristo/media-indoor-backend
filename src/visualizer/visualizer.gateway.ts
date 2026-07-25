import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { isString } from 'class-validator';
import { Server, Socket } from 'socket.io';
import { DevicesService } from 'src/devices/devices.service';

@WebSocketGateway({ namespace: 'visualizer', cors: '*' })
export default class VisualizerGateway implements OnGatewayConnection {
  constructor(private readonly devicesService: DevicesService) {}
  @WebSocketServer() server!: Server;
  async handleConnection(client: Socket, ...args: any[]) {
    // Validate device using deviceId and token
    // const { deviceId, deviceToken } = client.handshake.auth;
    const deviceId = client.handshake.auth.deviceId;
    const deviceToken = client.handshake.auth.deviceToken;

    if (
      !deviceId ||
      !deviceToken ||
      !isString(deviceId) ||
      !isString(deviceToken)
    ) {
      client.disconnect();
      return;
    }

    const device = await this.devicesService.validateAndGet(
      deviceId,
      deviceToken,
    );

    if (!device) {
      client.disconnect();
      return;
    }

    client.data.deviceId = device.id;
    client.data.userId = device.userId;

    await client.join(`device:${device.id}`);
  }
}
