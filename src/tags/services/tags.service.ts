import { Injectable, NotFoundException } from '@nestjs/common';

// utils
import { isEmpty, isString } from '../../libs/assertion';

// constants
import { EXCEPTION_CODE } from '../../constants/exception.code';

// service
import { PrismaService } from '../../modules/database/prisma.service';
import { NotificationsService } from '../../notifications/services/notifications.service';

// utils
import { calculateRankingScore, escapeForUrl } from '../../libs/utils';

// types
import { TagListQuery } from '../input/list.query';
import type { Tag, TagStats } from '@prisma/client';
import type { UserWithInfo } from '../../modules/database/select/user.select';

@Injectable()
export class TagsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * @description 태그가 존재하면 태그 정보를 반환하고, 존재하지 않으면 태그를 생성한다.
   * @param {string} text
   */
  async findOrCreate(text: string) {
    const name = escapeForUrl(text);
    const data = await this.prisma.tag.findUnique({
      where: {
        name,
      },
    });

    if (!data) {
      const tag = await this.prisma.tag.create({
        data: {
          name,
        },
      });
      return tag;
    }
  }

  /**
   * @description 태그 팔로우 생성
   * @param {UserWithInfo} user - 로그인한 유저
   * @param {string} name - 태그 이름
   */
  async following(user: UserWithInfo, name: string) {
    const tagInfo = await this.prisma.tag.findUnique({
      where: {
        name,
      },
      select: {
        id: true,
      },
    });

    if (!tagInfo) {
      throw new NotFoundException({
        resultCode: EXCEPTION_CODE.NOT_EXIST,
        message: '태그를 찾을 수 없습니다.',
        error: null,
      });
    }

    const following = await this.prisma.tagFollow.create({
      data: {
        fk_tag_id: tagInfo.id,
        fk_user_id: user.id,
      },
    });

    const count = await this._countFollowings(tagInfo.id);
    await this._updateTagStatsFollowings(tagInfo.id, count);
    this._recalculateRanking(tagInfo.id, count).catch(console.error);

    // 알림 생성
    this.notifications.createTags(tagInfo.id).catch((e) => console.error(e));

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
   * @param {UserWithInfo} user  - 로그인한 유저
   * @param {string} name - 태그 이름
   */
  async unfollowing(user: UserWithInfo, name: string) {
    const tagInfo = await this.prisma.tag.findUnique({
      where: {
        name,
      },
      select: {
        id: true,
      },
    });

    if (!tagInfo) {
      throw new NotFoundException({
        resultCode: EXCEPTION_CODE.NOT_EXIST,
        message: '태그를 찾을 수 없습니다.',
        error: null,
      });
    }

    const following = await this.prisma.tagFollow.delete({
      where: {
        fk_tag_id_fk_user_id: {
          fk_tag_id: tagInfo.id,
          fk_user_id: user.id,
        },
      },
    });

    const count = await this._countFollowings(tagInfo.id);
    await this._updateTagStatsFollowings(tagInfo.id, count);
    this._recalculateRanking(tagInfo.id, count).catch(console.error);

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
  async createTagStats(tagId: string | string[]) {
    const tagIds = Array.isArray(tagId) ? tagId : [tagId];

    const tagStatsList: TagStats[] = [];
    for (const id of tagIds) {
      const tagStats = await this.prisma.tagStats.create({
        data: {
          fk_tag_id: id,
        },
      });
      tagStatsList.push(tagStats);
    }

    return tagStatsList;
  }

  /**
   * @description 태그에 대해서 following 한 카운터 값을 가져온다.
   * @param {string} tagId 태그 아이디 */
  private async _countFollowings(tagId: string) {
    const count = await this.prisma.tagFollow.count({
      where: {
        fk_tag_id: tagId,
      },
    });

    return count;
  }

  /**
   * @description 태그 통계 - following 카운트 업데이트
   * @param {string} tagId 태그 아이디
   * @param {number} count 팔로잉 카운트
   * @returns
   */
  private async _updateTagStatsFollowings(tagId: string, count: number) {
    return await this.prisma.tagStats.update({
      where: {
        fk_tag_id: tagId,
      },
      data: {
        followings: count,
      },
    });
  }

  /**
   * @description 태그 통계 - score 업데이트
   * @param {string} tagId 태그 아이디
   * @param {number?} followCount 팔로잉 카운트
   * @returns
   */
  private async _recalculateRanking(tagId: string, followCount?: number) {
    const item = await this.prisma.tag.findUnique({ where: { id: tagId } });
    if (!item) return;
    const count = followCount ?? (await this._countFollowings(tagId));
    const age =
      (Date.now() - new Date(item.createdAt).getTime()) / 1000 / 60 / 60;
    const score = calculateRankingScore(count, age);
    return this.prisma.tagStats.update({
      where: {
        fk_tag_id: tagId,
      },
      data: {
        score,
      },
    });
  }

  /**
   * @description 태그 상세 정보
   * @param {string} name 태그 이름
   * @param {UserWithInfo} user 유저 정보
   */
  async detail(name: string, user?: UserWithInfo) {
    // 유저 정보가 존재하면 태그의 이름 및 팔로잉, 포스트 수를 가져오면서 유저가 팔로잉 했는지 여부를 가져온다.
    // 그리고 유저가 없으면 태그의 이름 및 팔로잉, 포스트 수만 가져온다.
    const tagInfo = await this.prisma.tag.findFirst({
      where: {
        name,
        postTags: {
          every: {
            post: {
              isDeleted: false,
              publishingDate: {
                lte: new Date(),
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            postTags: true,
            tagFollow: true,
          },
        },
        ...(user
          ? {
              tagFollow: {
                where: {
                  fk_user_id: user.id,
                },
                select: {
                  id: true,
                },
              },
            }
          : {}),
      },
    });

    if (!tagInfo) {
      throw new NotFoundException({
        resultCode: EXCEPTION_CODE.NOT_EXIST,
        message: '태그를 찾을 수 없습니다.',
        error: null,
        result: null,
      });
    }

    const isFollowing = !isEmpty(tagInfo.tagFollow?.at(0));

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        id: tagInfo.id,
        name: tagInfo.name,
        postCount: tagInfo._count.postTags ?? 0,
        followCount: tagInfo._count.tagFollow ?? 0,
        isFollowing,
      },
    };
  }

  /**
   * @description 태그 목록 리스트
   * @param {TagListQuery} query 태그 리스트 쿼리
   */
  async list(query: TagListQuery) {
    let result = undefined;
    switch (query.type) {
      case 'popular':
        result = await this._getTrandingItems(query);
        break;
      case 'new':
        result = await this._getNewItems(query);
        break;
      case 'trending':
        result = await this._getTrandingTimeItems(query);
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
   * @description 인기 태그 리스트 - 시간별 (주간, 월간, 연간)
   * @param {TagListQuery} params 태그 리스트 쿼리 */
  private async _getTrandingTimeItems({
    cursor,
    limit,
    category,
  }: TagListQuery) {
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

    if (isString(limit)) {
      limit = Number(limit);
    }

    const totalCount = await this.prisma.tagStats.count({
      where: {
        score: {
          gte: 0.001,
        },
        ...(time && {
          updatedAt: {
            gte: time,
          },
        }),
      },
    });

    const cursorItem = cursor
      ? await this.prisma.tag.findFirst({
          where: {
            id: cursor,
            ...(time && {
              updatedAt: {
                gte: time,
              },
            }),
          },
          include: {
            tagStats: true,
          },
        })
      : null;

    const list = await this.prisma.tag.findMany({
      where: {
        ...(cursor
          ? {
              id: {
                lt: cursor,
              },
              ...(time && {
                updatedAt: {
                  gte: time,
                },
              }),
            }
          : {
              ...(time && {
                updatedAt: {
                  gte: time,
                },
              }),
            }),
        tagStats: {
          score: {
            gte: 0.001,
            ...(cursorItem
              ? {
                  lte: cursorItem.tagStats?.score,
                }
              : {}),
          },
        },
      },
      orderBy: [
        {
          tagStats: {
            score: 'desc',
          },
        },
        {
          tagStats: {
            fk_tag_id: 'desc',
          },
        },
      ],
      include: {
        tagStats: true,
        _count: {
          select: {
            postTags: true,
          },
        },
      },
      take: limit,
    });

    const endCursor = list.at(-1)?.id ?? null;

    const hasNextPage = endCursor
      ? (await this.prisma.tag.count({
          where: {
            tagStats: {
              fk_tag_id: {
                lt: endCursor,
              },
              score: {
                gte: 0.001,
                lte: list.at(-1)?.tagStats?.score,
              },
            },
            ...(time && {
              updatedAt: {
                gte: time,
              },
            }),
          },
          orderBy: [
            {
              tagStats: {
                score: 'desc',
              },
            },
            {
              tagStats: {
                fk_tag_id: 'desc',
              },
            },
          ],
        })) > 0
      : false;

    return {
      totalCount,
      list: this._serializeTag(list),
      endCursor,
      hasNextPage,
    };
  }

  /**
   * @description 태그 리스트
   * @param {TagListQuery} params 태그 리스트 쿼리
   */
  private async _getRecentItems({ cursor, limit, name }: TagListQuery) {
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
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              postTags: true,
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
   * @description 최근 일주일 사이에 생성된 태그 리스트
   * @param {TagListQuery} params 태그 리스트 쿼리 */
  private async _getNewItems({ cursor, limit, name }: TagListQuery) {
    if (isString(limit)) {
      limit = Number(limit);
    }

    const [totalCount, list] = await Promise.all([
      this.prisma.tag.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
          },
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
          createdAt: {
            gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
          },
          name: name ? { contains: name } : undefined,
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              postTags: true,
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
            createdAt: {
              gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
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
   * @param {TagListQuery} params 태그 리스트 쿼리 */
  private async _getTrandingItems({ cursor, limit, name }: TagListQuery) {
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
            postTags: {
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
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              postTags: true,
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
              postTags: {
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
   * @param {Tag[] & { _count: { postTags: number; }; }[]} tags
   */
  private _serializeTag(
    tags: (Tag & {
      _count: {
        postTags: number;
      };
    })[],
  ) {
    return tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      postCount: tag._count.postTags,
    }));
  }
}
