import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');
    const endpoint = this.configService.get<string>('R2_ENDPOINT');
    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME') || 'innovpay-kyc';

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: accessKeyId || 'mock-key',
        secretAccessKey: secretAccessKey || 'mock-secret',
      },
    });
  }

  async uploadFile(fileBuffer: Buffer, key: string, contentType: string): Promise<string> {
    // If not configured, mock behavior in dev/sandbox
    if (!this.configService.get<string>('R2_ACCESS_KEY_ID')) {
      return `mock-storage-url/${key}`;
    }

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await this.s3Client.send(command);
    return key;
  }

  async getPresignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    if (key.startsWith('mock-storage-url/')) {
      return `https://dummyimage.com/600x400/000/fff&text=Mock+KYC+Document+${encodeURIComponent(key)}`;
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
  }

  async deleteFile(key: string): Promise<void> {
    if (key.startsWith('mock-storage-url/')) {
      return;
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }
}
