import { Injectable } from '@nestjs/common';
import { TransactionClient } from 'src/generated/prisma/internal/prismaNamespace';

@Injectable()
export default class MediaService {
  async create(
    media: { path: string; mimeType: string; size: number },
    transaction: TransactionClient,
  ) {
    const createdMedia = await transaction.media.create({ data: media });
    return createdMedia;
  }
}
