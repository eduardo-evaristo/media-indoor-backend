import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'node:stream';

@Injectable()
export default class StorageService {
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${this.configService.getOrThrow<string>('S3_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('ACCESS_KEY_ID'),
        secretAccessKey:
          this.configService.getOrThrow<string>('SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true,
    });
  }

  async upload(file: Express.Multer.File) {
    try {
      const fileStream = Readable.from(file.buffer);

      const uuid = crypto.randomUUID();
      const fileKey = `${uuid}.${file.originalname.split('.')[1]}`;

      const command = new PutObjectCommand({
        Bucket: 'test-bucket',
        Key: fileKey,
        Body: fileStream,
        ContentLength: file.size,
      });

      await this.s3Client.send(command);

      return fileKey;
    } catch (err: unknown) {
      // TODO: Enchance error handling here
      if (err instanceof Error) {
        throw new Error(err.message);
      }
      throw new Error('Something went wrong');
    }
  }

  async signUrl(fileKey: string) {
    try {
      const url = await getSignedUrl(
        this.s3Client,
        new GetObjectCommand({ Bucket: 'test-bucket', Key: fileKey }),
        { expiresIn: 36000 },
      );
      return url;
    } catch (err) {
      // TODO: Enchance error handling here
      if (err instanceof Error) {
        throw new Error(err.message);
      }
      throw new Error('Something went wrong');
    }
  }
}
