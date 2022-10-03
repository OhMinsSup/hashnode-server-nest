import { ForbiddenException, Injectable } from '@nestjs/common';
import axios from 'axios';

// constants
import { EXCEPTION_CODE } from '../constants/exception.code';

// service
import { PrismaService } from '../modules/database/prisma.service';
import { ConfigService } from '@nestjs/config';

interface VerifyTokenResponse {
  id: string;
  status: string; // active
  not_before: Date;
  expires_on: Date;
}

interface DrirectUploadResponse {
  uploadURL: string;
  id: string;
}

interface CloudflareRespSchema<R = any> {
  result: R;
  result_info?: Record<string, any> | null;
  success: boolean;
  errors: any[];
  messages: any[];
}

@Injectable()
export class FileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async _verifyTokens() {
    const cloudflareUrl = this.config.get('CLOUDFLARE_URL');
    const url = `${cloudflareUrl}/user/tokens/verify`;
    const resp = await axios.get<CloudflareRespSchema<VerifyTokenResponse>>(
      url,
      {
        headers: {
          Authorization: `Bearer ${this.config.get('CLOUDFLARE_API_TOKEN')}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!resp.data.success) {
      return false;
    }
    return resp.data.result.status === 'active';
  }

  /**
   * @description cloudflare images file upload
   */
  async directUpload() {
    const active = await this._verifyTokens();
    if (!active) {
      throw new ForbiddenException({
        status: EXCEPTION_CODE.NO_PERMISSION,
        message: '업로드 권한이 없습니다.',
        error: 'cloudflare token is not active',
      });
    }

    // cloudflare images file upload
    const cfUrl = this.config.get('CLOUDFLARE_URL');
    const accountIdentifier = this.config.get('ACCOUNT_IDENTIFIER');
    const apiToken = this.config.get('CLOUDFLARE_API_TOKEN');

    const url = `${cfUrl}/accounts/${accountIdentifier}/images/v1/direct_upload`;

    //expiry - The date after which the upload will not be accepted. Minimum: Now + 2 minutes. Maximum: Now + 6 hours.
    // "2021-01-02T02:20:00Z"
    const date = new Date();
    date.setMinutes(date.getMinutes() + 5);
    const expiry = date.toISOString();

    const resp = await axios.post<CloudflareRespSchema<DrirectUploadResponse>>(
      url,
      {
        expiry,
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: resp.data.result as unknown as Record<string, string>,
    };
  }
}
