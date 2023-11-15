import { Injectable } from '@nestjs/common';
// import axios from 'axios';

// constants
import { EXCEPTION_CODE } from '../../constants/exception.code';

// service
import { PrismaService } from '../../modules/database/prisma.service';
import { ConfigService } from '@nestjs/config';

// utils
import { isString } from '../../libs/assertion';

// types
import { ListRequestDto } from '../../libs/list.query';
import { UserWithInfo } from '../../modules/database/select/user.select';
import { CreateInput } from '../dto/create.input';

@Injectable()
export class FileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * @description 파일 생성
   * @param {UserWithInfo} user
   * @param {CreateInput} input
   */
  async create(user: UserWithInfo, input: CreateInput) {
    const data = await this.prisma.file.create({
      data: {
        cfId: input.cfId,
        filename: input.filename,
        publicUrl: input.publicUrl,
        mimeType: input.mimeType,
        uploadType: input.uploadType,
        mediaType: input.mediaType,
        userId: user.id,
      },
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        id: data.id,
        publicUrl: data.publicUrl,
      },
    };
  }

  /**
   * @description 파일 목록 리스트
   * @param {ListRequestDto} query 리스트 파라미터
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

  /**
   * @description 파일 리스트
   * @param {ListRequestDto} input 리스트 파라미터
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
          filename: true,
          publicUrl: true,
          uploadType: true,
          mediaType: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              username: true,
            },
          },
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
        })) > 0
      : false;

    return { totalCount, list, endCursor, hasNextPage };
  }
}
