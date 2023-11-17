import { Injectable } from '@nestjs/common';

// constants
import { EXCEPTION_CODE } from '../../constants/exception.code';

// service
import { PrismaService } from '../../modules/database/prisma.service';

// utils
import { isString } from '../../libs/assertion';

// types
import { PaginationQuery } from '../../libs/pagination.query';
import { UserWithInfo } from '../../modules/database/prisma.interface';
import { CreateInput } from '../input/create.input';

@Injectable()
export class FileService {
  constructor(private readonly prisma: PrismaService) {}

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
        fk_user_id: user.id,
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
   * @param {UserWithInfo} user 유저 정보
   * @param {PaginationQuery} query 리스트 파라미터 */
  async list(user: UserWithInfo, query: PaginationQuery) {
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
   * @description 파일 리스트
   * @param {UserWithInfo} user 유저 정보
   * @param {PaginationQuery} input 리스트 파라미터 */
  private async _getRecentItems(user, { cursor, limit }: PaginationQuery) {
    if (isString(limit)) {
      limit = Number(limit);
    }

    const [totalCount, list] = await Promise.all([
      this.prisma.file.count({
        where: {
          fk_user_id: user.id,
        },
      }),
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
          fk_user_id: user.id,
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
              userProfile: {
                select: {
                  username: true,
                },
              },
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
