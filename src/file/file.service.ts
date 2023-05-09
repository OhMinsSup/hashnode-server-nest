import { Injectable } from '@nestjs/common';
import axios from 'axios';

// constants
import { EXCEPTION_CODE } from '../constants/exception.code';

// service
import { PrismaService } from '../modules/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { R2Service } from '../modules/r2/r2.service';

// utils
import { isString } from '../libs/assertion';

// types
import { ListRequestDto } from '../libs/list.query';
import { UploadBody, SignedUrlUploadBody } from './dto/upload';
import { UserWithInfo } from '../modules/database/select/user.select';

@Injectable()
export class FileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly r2: R2Service,
  ) {}

  /**
   * @description 파일 r2 업로드 생성
   * @param {UserWithInfo} user 사용자 정보
   * @param {SignedUrlUploadBody} body 업로드 정보
   * @param {Express.Multer.File} file 파일 정보
   */
  async upload(
    user: UserWithInfo,
    body: SignedUrlUploadBody,
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
   * @param {UserWithInfo} user 사용자 정보
   * @param {ListRequestDto} query 리스트 파라미터
   */
  async list(user: UserWithInfo, query: ListRequestDto) {
    const result = await this._getRecentItems(user, query);

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

  /**
   * @description 파일 고유한 키 생성
   * @param {UserWithInfo} user 사용자 정보
   * @param {UploadBody} input 업로드 정보
   */
  private _generateKey(user: UserWithInfo, input: UploadBody) {
    return `${
      user.id
    }/${input.uploadType.toLowerCase()}/${input.mediaType.toLowerCase()}/${
      input.filename
    }`;
  }

  /**
   * @description 파일 리스트
   * @param {UserWithInfo} user 사용자 정보
   * @param {ListRequestDto} input 리스트 파라미터
   */
  private async _getRecentItems(
    user: UserWithInfo,
    { cursor, limit }: ListRequestDto,
  ) {
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
}
