import { ParseEnumPipe, ParseUUIDPipe } from '@nestjs/common';
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

enum ControlDeviceAction {
  NEXT_MEDIA = 'nextMedia',
  PREVIOUS_MEDIA = 'previousMedia',
  PAUSE = 'pause',
  PLAY = 'play',
}

type ControlDeviceDto = {
  deviceId: string;
  action: ControlDeviceAction;
};

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

  @SubscribeMessage('controlDevice')
  async controlDevice(
    @MessageBody() controlDeviceDto: ControlDeviceDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.data.userId) {
      client.disconnect();
      return;
    }

    // Check ownership (optional)
    const deviceId = controlDeviceDto.deviceId;
    const userId = client.data.userId;

    const isDeviceOwnedByUser = await this.devicesService.isOwnedBy(
      deviceId,
      userId,
    );

    if (!isDeviceOwnedByUser) {
      client.emit('controlDeviceError', {
        deviceId,
        message: 'Device not authorized',
      });
      return;
    }

    // Check if action is valid
    if (!Object.values(ControlDeviceAction).includes(controlDeviceDto.action)) {
      client.emit('controlDeviceError', {
        deviceId,
        message: 'Action is invalid',
      });
      return;
    }

    // Emit action
    // client
    //   .to(`device:${deviceId}`)
    //   .emit('controlDevice', { action: controlDeviceDto.action });

    const socketsInServer = await this.server
      .in(`device:${deviceId}`)
      .fetchSockets();
    const deviceSocket = socketsInServer.find(
      (socket) => socket.data.deviceId === deviceId,
    );

    if (!deviceSocket) {
      client.emit('controlDeviceError', {
        deviceId,
        message: 'Device is offline',
      });
      return;
    }

    try {
      const responses = (await client
        .to(deviceSocket?.id)
        .timeout(5000)
        .emitWithAck('controlDevice', { action: controlDeviceDto.action })) as {
        status: 'ok' | 'error';
      }[];

      //  This is valid for the business logic I have right now
      const response = responses[0];
      if (!response.status || response.status === 'error') {
        client.emit('controlDeviceError', {
          deviceId,
          message: 'Device could not execute action',
        });
        return;
      }

      client.emit('controlDeviceSuccess', {
        deviceId,
        action: controlDeviceDto.action,
      });
    } catch {
      client.emit('controlDeviceError', {
        deviceId,
        message: 'Device has timed out',
      });
      return;
    }
  }
}
