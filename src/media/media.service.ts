import { Injectable } from '@nestjs/common';
import { TransactionClient } from 'src/generated/prisma/internal/prismaNamespace';

@Injectable()
export default class MediaService {
  async create(
    media: { name: string, path: string; mimeType: string; size: number; userId: string },
    transaction: TransactionClient,
  ) {
    const createdMedia = await transaction.media.create({ data: media });
    return createdMedia;
  }
}
