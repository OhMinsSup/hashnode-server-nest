import { Injectable } from '@nestjs/common';
import axios from 'axios';

// constants
import { EXCEPTION_CODE } from '../constants/exception.code';

// service
import { PrismaService } from '../modules/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { R2Service } from '../modules/r2/r2.service';

import { type AuthUserSchema } from 'src/libs/get-user.decorator';
import { ListRequestDto } from 'src/libs/list.request.dto';
import {
  UploadRequestDto,
  SignedUrlUploadResponseDto,
} from './dto/upload.request.dto';
import { isString } from '../libs/assertion';

@Injectable()
export class FileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly r2: R2Service,
  ) {}

  private _generateKey(user: AuthUserSchema, body: UploadRequestDto) {
    return `${
      user.id
    }/${body.uploadType.toLowerCase()}/${body.mediaType.toLowerCase()}/${
      body.filename
    }`;
  }

  /**
   * @description 파일 리스트
   * @param {ListRequestDto} listRequestDto
   */
  private async _getRecentItems({ cursor, limit }: ListRequestDto) {
    if (isString(cursor)) {
      cursor = Number(cursor);
    }

    if (isString(limit)) {
      limit = Number(limit);
    }

    const [totalCount, list] = await Promise.all([
      this.prisma.file.count(),
      this.prisma.file.findMany({
        orderBy: {
          id: 'desc',
        },
        where: {
          id: cursor
            ? {
                lt: cursor,
              }
            : undefined,
        },
        select: {
          id: true,
          name: true,
          url: true,
          uploadType: true,
          mediaType: true,
          createdAt: true,
          updatedAt: true,
        },
        take: limit,
      }),
    ]);

    const endCursor = list.at(-1)?.id ?? null;
    const hasNextPage = endCursor
      ? (await this.prisma.file.count({
          where: {
            id: {
              lt: endCursor,
            },
          },
          orderBy: {
            id: 'desc',
          },
        })) > 0
      : false;

    return { totalCount, list, endCursor, hasNextPage };
  }

  /**
   * @description 파일 r2 업로드 생성
   * @param {AuthUserSchema} user
   * @param {SignedUrlUploadResponseDto} body
   */
  async upload(
    user: AuthUserSchema,
    body: SignedUrlUploadResponseDto,
    file: Express.Multer.File,
  ) {
    const signed_url = await this.r2.getSignedUrl(
      this._generateKey(user, body),
    );

    // birnay 업로드
    await axios.put(signed_url, file.buffer, {
      headers: {
        'Content-Type': file.mimetype,
      },
    });

    const publicUrl = this.config.get('CF_R2_PUBLIC_URL');

    const data = await this.prisma.file.create({
      data: {
        name: body.filename,
        url: `${publicUrl}/${this._generateKey(user, body)}`,
        uploadType: body.uploadType,
        mediaType: body.mediaType,
      },
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        id: data.id,
        name: data.name,
        url: data.url,
        uploadType: data.uploadType,
        mediaType: data.mediaType,
      },
    };
  }

  /**
   * @description 파일 목록 리스트
   * @param {ListRequestDto} query
   */
  async list(query: ListRequestDto) {
    const result = await this._getRecentItems(query);

    const { list, totalCount, endCursor, hasNextPage } = result;

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        list,
        totalCount,
        pageInfo: {
          endCursor: hasNextPage ? endCursor : null,
          hasNextPage,
        },
      },
    };
  }
}
