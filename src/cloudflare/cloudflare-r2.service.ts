import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import crypto from 'node:crypto';
import { EnvironmentService } from '../integrations/environment/environment.service';
import {
  S3Client,
  CreateBucketCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class CloudflareR2Service {
  constructor(private readonly env: EnvironmentService) {}

  private readonly R2 = new S3Client({
    region: 'auto',
    endpoint: `https://${this.env.getCloudflareAccountId()}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: this.env.getCloudflareR2AccessKey(),
      secretAccessKey: this.env.getCloudflareR2SecretAccessKey(),
    },
  });

  async createBucket(bucketName?: string) {
    if (!bucketName) {
      bucketName = this.env.getCloudflareR2BucketName();
    }

    const response = await this.R2.send(
      new CreateBucketCommand({
        Bucket: bucketName,
      }),
    );

    return response;
  }

  async listBuckets() {
    const response = await this.R2.send(new ListBucketsCommand());

    return response;
  }

  async putObject(
    buffer: Buffer,
    contentType: string,
    key?: AWS.S3.ObjectKey,
    bucketName?: string,
  ) {
    if (!bucketName) {
      bucketName = this.env.getCloudflareR2BucketName();
    }

    if (!key) {
      key = crypto.randomUUID();
    }

    const response = await this.R2.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    return response;
  }

  async listObjects(bucketName?: string) {
    if (!bucketName) {
      bucketName = this.env.getCloudflareR2BucketName();
    }

    const response = await this.R2.send(
      new ListObjectsV2Command({ Bucket: bucketName }),
    );

    return response;
  }
}
