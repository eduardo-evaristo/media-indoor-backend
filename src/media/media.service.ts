import { Injectable } from '@nestjs/common';
import { TransactionClient } from 'src/generated/prisma/internal/prismaNamespace';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export default class MediaService {
  constructor(private readonly prisma: PrismaService) {
  }

  async create(
    media: { name: string, path: string; mimeType: string; size: number; userId: string },
    transaction: TransactionClient,
  ) {
    const createdMedia = await transaction.media.create({ data: media });
    return createdMedia;
  }

  async getAll(userId: string) {
    const allMedia = await this.prisma.media.findMany({where: {userId, AND: { isActive: true }}, omit: {description: true, updatedAt: true, userId: true, isActive: true}});
    return allMedia;
  }
}
