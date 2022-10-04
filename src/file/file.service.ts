import { Injectable } from '@nestjs/common';

// constants
import { EXCEPTION_CODE } from '../constants/exception.code';

// service
import { PrismaService } from '../modules/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { R2Service } from '../modules/r2/r2.service';

import { type AuthUserSchema } from 'src/libs/get-user.decorator';
import { UploadRequestDto } from './dto/upload.request.dto';

@Injectable()
export class FileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly r2: R2Service,
  ) {}

  /**
   * @description 파일 업로드 URL 생성
   * @param {string} filename
   */
  async createSignedUrl(filename: string) {
    const signed_url = await this.r2.getSignedUrl(filename);
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        uploadUrl: signed_url,
      },
    };
  }

  /**
   * @description 파일 업로드
   * @param {AuthUserSchema} user
   * @param {UploadRequestDto} body
   */
  async upload(user: AuthUserSchema, body: UploadRequestDto) {
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {},
    };
  }
}
