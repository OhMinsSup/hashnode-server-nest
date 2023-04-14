import { Injectable, NotFoundException } from '@nestjs/common';

// utils
import { isString } from '../libs/assertion';

// constants
import { EXCEPTION_CODE } from '../constants/exception.code';

// service
import { PrismaService } from '../modules/database/prisma.service';

// select
import { TAGS_LIST_SELECT } from '../modules/database/select/tag.select';

// types
import { TagListQuery, TrendingTagsQuery } from './dto/list';
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
   * @description 태그 상세 정보
   * @param {string} name
   * @returns {Promise<{resultCode: number; message: string; error: string; result: Tag}>}
   */
  async detail(name: string) {
    const tagInfo = await this.prisma.tag.findUnique({
      where: {
        name,
      },
    });

    if (!name) {
      throw new NotFoundException({
        resultCode: EXCEPTION_CODE.NOT_EXIST,
        message: '태그를 찾을 수 없습니다.',
        error: null,
        result: null,
      });
    }

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: tagInfo,
    };
  }

  /**
   * @description 트랜딩 태그 리스트 (주간, all time)
   * @param {TrendingTagsQuery} query 트랜딩 태그 리스트 쿼리
   * @returns {Promise<{resultCode: number; message: string; error: string; result: {list: {id: number; name: string; createdAt: Date; updatedAt: Date; postsCount: number}[]; totalCount: number; pageInfo: {endCursor: string; hasNextPage: boolean}}}>}
   */
  async trending(query: TrendingTagsQuery) {
    const result = undefined;

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        list: [],
        totalCount: 0,
        pageInfo: {
          endCursor: null,
          hasNextPage: false,
        },
      },
    };
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

  private async _getTrandingTimeItems({
    cursor,
    limit,
    category,
  }: TrendingTagsQuery) {
    let time: Date | null;
    switch (category) {
      case 'week':
        time = new Date();
        time.setDate(time.getDate() - 7);
        break;
      case 'month':
        time = new Date();
        time.setMonth(time.getMonth() - 1);
        break;
      case 'year':
        time = new Date();
        time.setFullYear(time.getFullYear() - 1);
        break;
      default:
        time = null;
        break;
    }

    if (isString(cursor)) {
      cursor = Number(cursor);
    }

    if (isString(limit)) {
      limit = Number(limit);
    }

    const totalCount = await this.prisma.tagStats.count({
      where: {
        score: {
          gte: 0.001,
        },
      },
    });
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
        select: TAGS_LIST_SELECT,
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
        select: TAGS_LIST_SELECT,
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
   * @returns {Promise<{id: number; name: string; postsCount: number}[]>}
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
      postsCount: tag._count.postsTags,
    }));
  }
}
