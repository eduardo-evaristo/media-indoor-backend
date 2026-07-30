import { ParseUUIDPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { isString } from 'class-validator';
import { parseCookie } from 'cookie';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { DevicesService } from 'src/devices/devices.service';

@WebSocketGateway({
  namespace: 'visualizer',
  cors: { origin: 'http://localhost:5173', credentials: true },
})
export default class VisualizerGateway implements OnGatewayConnection {
  constructor(
    private readonly devicesService: DevicesService,
    private readonly authServioe: AuthService,
  ) {}
  @WebSocketServer() server!: Server;
  async handleConnection(client: Socket, ...args: any[]) {
    // Get type of connection
    const connectionType: 'device' | 'dashboard' = client.handshake.auth.type;

    switch (connectionType) {
      case 'device':
        {
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
        break;
      case 'dashboard':
        {
          // Get cookies and token from them
          const cookies = parseCookie(client.handshake.headers.cookie ?? '');
          const token = cookies['access_token'];

          if (!token) {
            client.disconnect();
            return;
          }

          // verify its validity and get payload
          try {
            const payload = this.authServioe.verifyToken(token);

            // Save its userId to client so I can keep track of who this is in subsequent/later events
            client.data.userId = payload.sub;

            await client.join(`user:${payload.sub}`);
          } catch {
            client.disconnect();
            return;
          }
        }
        break;
      default:
        client.disconnect();
        return;
    }
  }

  @SubscribeMessage('joinDevice')
  async joinDevice(
    @MessageBody('deviceId', ParseUUIDPipe) deviceId: string,
    @ConnectedSocket() client: Socket,
  ) {
    // Check ownership
    if (!client.data.userId) {
      client.disconnect();
      return;
    }

    const userId = client.data.userId;

    const isDeviceOwnedByUser = await this.devicesService.isOwnedBy(
      deviceId,
      userId,
    );

    if (!isDeviceOwnedByUser) {
      client.emit('joinDeviceError', {
        deviceId,
        message: 'Device not authorized',
      });
      return;
    }

    // If user owns said device, join client to device:id room
    try {
      await client.join(`device:${deviceId}`);
      client.emit('joinDeviceSuccess', { deviceId });
    } catch {
      client.emit('joinDeviceError', {
        deviceId,
        message: 'Failed to join device room',
      });
    }
  }
}
