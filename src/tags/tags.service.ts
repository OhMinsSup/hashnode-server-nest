import { Injectable } from '@nestjs/common';

// utils
import { isString } from '../libs/assertion';

// constants
import { EXCEPTION_CODE } from '../constants/exception.code';

// service
import { PrismaService } from '../modules/database/prisma.service';

// types
import { TagListQuery } from './dto/list';
import type { Tag, TagStats } from '@prisma/client';
import type { AuthUserSchema } from '../libs/get-user.decorator';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description 태그 팔로우 생성
   * @param {AuthUserSchema} user
   * @param {number} tagId
   */
  async following(user: AuthUserSchema, tagId: number) {
    const following = await this.prisma.tagFollowing.create({
      data: {
        tagId,
        userId: user.id,
      },
    });

    const count = await this.countFollowings(tagId);

    await this._updateTagStatsFollowings(tagId, count);

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        dataId: following.id,
        count: count,
      },
    };
  }

  /**
   * @description 태그 팔로우 삭제
   * @param {AuthUserSchema} user
   * @param {number} tagId
   */
  async unfollowing(user: AuthUserSchema, tagId: number) {
    const following = await this.prisma.tagFollowing.delete({
      where: {
        tagId_userId: {
          tagId,
          userId: user.id,
        },
      },
    });

    const count = await this.countFollowings(tagId);

    await this._updateTagStatsFollowings(tagId, count);

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        dataId: following.id,
        count: count,
      },
    };
  }

  /**
   * @description 태그 상태값 - (following, score, clicks) 에 대한 정보를 생성
   * @param {number} tagId
   */
  async createTagStats(tagId: number | number[]) {
    const tagIds = Array.isArray(tagId) ? tagId : [tagId];

    const tagStatsList: TagStats[] = [];
    for (const id of tagIds) {
      const tagStats = await this.prisma.tagStats.create({
        data: {
          tagId: id,
        },
      });
      tagStatsList.push(tagStats);
    }

    return tagStatsList;
  }

  /**
   * @description 태그에 대해서 following 한 카운터 값을 가져온다.
   * @param {number} tagId
   */
  async countFollowings(tagId: number) {
    const count = await this.prisma.tagFollowing.count({
      where: {
        tagId,
      },
    });

    return count;
  }

  /**
   * @description 태그 통계 - following 카운트 업데이트
   * @param {number} tagId
   * @param {number} count
   * @returns
   */
  private async _updateTagStatsFollowings(tagId: number, count: number) {
    return await this.prisma.tagStats.update({
      where: {
        tagId,
      },
      data: {
        followings: count,
      },
    });
  }

  /**
   * @description 태그 목록 리스트
   * @param {TagListQuery} query 태그 리스트 쿼리
   * @returns {Promise<{resultCode: number; message: string; error: string; result: {list: {id: number; name: string; createdAt: Date; updatedAt: Date; postsCount: number}[]; totalCount: number; pageInfo: {endCursor: string; hasNextPage: boolean}}}>}
   */
  async list(query: TagListQuery) {
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

  /**
   * @description 태그 리스트
   * @param {TagListQuery} params 태그 리스트 쿼리
   * @returns {Promise<{list: {id: number; name: string; createdAt: Date; updatedAt: Date; postsCount: number}[]; totalCount: number; endCursor: string; hasNextPage: boolean}>}
   */
  private async _getRecentItems({ cursor, limit, name }: TagListQuery) {
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
   * @param {TagListQuery} params 태그 리스트 쿼리
   * @returns {Promise<{list: {id: number; name: string; createdAt: Date; updatedAt: Date; postsCount: number}[]; totalCount: number; endCursor: string; hasNextPage: boolean}>}
   */
  private async _getTrandingItems({ cursor, limit, name }: TagListQuery) {
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
   * @description 태그 데이터를 필요한 값만 정리해서 가져온다.
   * @param {Tag[] & { _count: { postsTags: number; }; }[]} tags
   * @returns {Promise<{id: number; name: string; createdAt: Date; updatedAt: Date; postsCount: number}[]>}
   */
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
}
