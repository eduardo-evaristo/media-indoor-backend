import {
  DeleteObjectCommand,
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
      throw new Error('Could not upload file', { cause: err });
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
      throw new Error('Could not sign url', { cause: err });
    }
  }

  async delete(fileKey: string) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: 'test-bucket',
        Key: fileKey,
      });
      return await this.s3Client.send(command);
    } catch (err) {
      throw new Error('Could not delete media', { cause: err });
    }
  }
}
