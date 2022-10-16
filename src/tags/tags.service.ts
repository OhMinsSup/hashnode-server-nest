import { Injectable } from '@nestjs/common';
import { isString } from '../libs/assertion';
import { EXCEPTION_CODE } from '../constants/exception.code';
import { PrismaService } from '../modules/database/prisma.service';
import { TagListRequestDto } from './dto/list.request.dto';

// types
import type { Tag } from '@prisma/client';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  private _serializeTag(
    tags: (Tag & {
      _count: {
        postsTags: number;
      };
    })[],
  ) {
    return tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
      postsCount: tag._count.postsTags,
    }));
  }

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
      this.prisma.tag.count({
        where: {
          name: name ? { contains: name } : undefined,
        },
      }),
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
        include: {
          _count: {
            select: {
              postsTags: true,
            },
          },
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
   * @description 인기 태그 리스트
   * @param {TagListRequestDto} params
   */
  private async _getTrandingItems({ cursor, limit, name }: TagListRequestDto) {
    if (isString(cursor)) {
      cursor = Number(cursor);
    }

    if (isString(limit)) {
      limit = Number(limit);
    }

    const [totalCount, list] = await Promise.all([
      this.prisma.tag.count({
        where: {
          name: name ? { contains: name } : undefined,
        },
      }),
      this.prisma.tag.findMany({
        orderBy: [
          {
            postsTags: {
              _count: 'desc',
            },
          },
          {
            id: 'desc',
          },
        ],
        where: {
          id: cursor
            ? {
                lt: cursor,
              }
            : undefined,
          name: name ? { contains: name } : undefined,
        },
        include: {
          _count: {
            select: {
              postsTags: true,
            },
          },
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
          orderBy: [
            {
              postsTags: {
                _count: 'desc',
              },
            },
            {
              id: 'desc',
            },
          ],
        })) > 0
      : false;

    return { totalCount, list, endCursor, hasNextPage };
  }

  /**
   * @description 태그 목록 리스트
   * @param {TagListRequestDto} query
   */
  async list(query: TagListRequestDto) {
    let result = undefined;
    switch (query.type) {
      case 'popular':
        result = await this._getTrandingItems(query);
        break;
      default:
        result = await this._getRecentItems(query);
        break;
    }

    const { list, totalCount, endCursor, hasNextPage } = result;

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        list: this._serializeTag(list),
        totalCount,
        pageInfo: {
          endCursor: hasNextPage ? endCursor : null,
          hasNextPage,
        },
      },
    };
  }
}
