import { Injectable } from '@nestjs/common';
import { isString } from '../libs/assertion';
import { EXCEPTION_CODE } from '../constants/exception.code';
import { PrismaService } from '../modules/database/prisma.service';
import { TagListRequestDto } from './dto/list.request.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description 태그 리스트
   * @param {TagListRequestDto} params
   */
  private async _getRecentItems({ cursor, limit, name }: TagListRequestDto) {
    if (isString(cursor)) {
      cursor = Number(cursor);
    }

    if (isString(limit)) {
      limit = Number(limit);
    }

    const [totalCount, list] = await Promise.all([
      this.prisma.tag.count(),
      this.prisma.tag.findMany({
        orderBy: {
          id: 'desc',
        },
        where: {
          id: cursor
            ? {
                lt: cursor,
              }
            : undefined,
          name: name ? { contains: name } : undefined,
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
        take: limit,
      }),
    ]);

    const endCursor = list.at(-1)?.id ?? null;
    const hasNextPage = endCursor
      ? (await this.prisma.tag.count({
          where: {
            id: {
              lt: endCursor,
            },
            name: name ? { contains: name } : undefined,
          },
          orderBy: {
            id: 'desc',
          },
        })) > 0
      : false;

    return { totalCount, list, endCursor, hasNextPage };
  }

  /**
   * @description 태그 목록 리스트
   * @param {TagListRequestDto} query
   */
  async list(query: TagListRequestDto) {
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
