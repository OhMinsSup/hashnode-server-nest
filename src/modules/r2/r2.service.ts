import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface UploadParams {
  filename: string;
}

@Injectable()
export class R2Service {
  private _r2Client: S3Client | undefined;

  constructor(private readonly config: ConfigService) {
    this._initR2Client();
  }

  get r2Client() {
    if (!this._r2Client) {
      this._initR2Client();
    }
    return this._r2Client;
  }

  private _initR2Client() {
    const endpoint = this.config.get('CF_R2_URL');
    const accessKeyId = this.config.get('CF_R2_ACCESS_KEY');
    const secretAccessKey = this.config.get('CF_R2_SECRET_ACCESS_KEY');

    if (!this._r2Client) {
      this._r2Client = new S3Client({
        region: 'auto',
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }

    return this._r2Client;
  }

  async getSignedUrl(key: string) {
    if (!this._r2Client) {
      throw new Error('R2 client is not initialized');
    }

    const bucket = this.config.get('CF_R2_BUCKET');
    // The number of seconds before the presigned URL expires => 2 minutes
    const expiresIn = 60 * 2;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: 'application/octet-stream',
    });

    const signedUrl = await getSignedUrl(this._r2Client, command, {
      expiresIn,
    });

    return signedUrl;
  }
}
