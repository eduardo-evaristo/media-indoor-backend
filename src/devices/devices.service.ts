import crypto from 'node:crypto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}
  async create() {
    const activationToken = this.generateActivationCode();
    const tokenExpiresAt = new Date(new Date().getTime() + 10 * 60 * 1000);

    //HASH Activationtoken
    const hashedActivationToken = this.hashToken(activationToken);
    const device = await this.prisma.device.create({
      data: {
        // TODO: Create better way of generating random names
        name: '1',
        activationToken: hashedActivationToken,
        tokenExpiresAt,
      },
    });

    return {
      activationToken,
      deviceId: device.id,
      tokenExpiresAt: device.tokenExpiresAt,
    };
  }

  async activate(activationToken: string, userId: string) {
    // Try and find a playlist with given token
    const hashedActivationToken = this.hashToken(activationToken);
    const device = await this.prisma.device.findFirst({
      where: { activationToken: hashedActivationToken, AND: { userId: null } },
    });

    if (!device)
      throw new HttpException(
        'No device found or device already activated',
        HttpStatus.NOT_FOUND,
      );

    // If, date is expired
    if (new Date().getTime() > device.tokenExpiresAt!.getTime())
      throw new HttpException('Activation token has expired', HttpStatus.GONE);

    return await this.prisma.device.update({
      where: { id: device.id },
      omit: {
        activationToken: true,
        tokenExpiresAt: true,
        userId: true,
        isActive: true,
      },
      data: {
        userId: userId,
        activationToken: null,
        tokenExpiresAt: null,
      },
    });
  }

  async findOne(deviceId: string) {
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId, AND: { NOT: { userId: null } } },
      omit: {
        activationToken: true,
        tokenExpiresAt: true,
        userId: true,
        isActive: true,
      },
    });

    if (!device)
      throw new HttpException(
        'No device found or not activated yet',
        HttpStatus.NOT_FOUND,
      );

    return device;
  }

  async regenerateActivationToken(deviceId: string) {
    // Checks if there IS a device with said id that belongs to no user (in other words, is indeed unactivated)
    const device = await this.prisma.device.findFirst({
      where: { id: deviceId, AND: { userId: null } },
    });

    // One check for each?
    if (!device)
      throw new HttpException(
        'No device found or already activated',
        HttpStatus.BAD_REQUEST,
      );

    // Generate new token and expiration time
    const activationToken = this.generateActivationCode();
    const hashedActivationToken = this.hashToken(activationToken);
    const tokenExpiresAt = new Date(new Date().getTime() + 10 * 60 * 1000);

    // Update token and expiresAt
    const updatedDevice = await this.prisma.device.update({
      where: { id: deviceId },
      data: {
        activationToken: hashedActivationToken,
        tokenExpiresAt,
      },
    });

    // Return new device data (with new token)
    return {
      activationToken,
      deviceId: updatedDevice.id,
      tokenExpiresAt: updatedDevice.tokenExpiresAt,
    };
  }

  // TODO: Make this more robust
  private generateActivationCode(length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusing chars (O, 0, I, 1)
    let result = '';

    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result;
  }

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
