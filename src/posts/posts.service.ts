import { BadRequestException, Injectable } from '@nestjs/common';

// service
import { PrismaService } from '../modules/database/prisma.service';

// utils
import { isEmpty, isString } from '../libs/assertion';
import { escapeForUrl } from '../libs/utils';

// constants
import { EXCEPTION_CODE } from 'src/constants/exception.code';

// types
import { CreateRequestDto } from './dto/create.request.dto';
import {
  PostListRequestDto,
  SimpleTrendingRequestDto,
} from './dto/list.request.dto';

// types
import type { Post, Tag, User, UserProfile } from '@prisma/client';
import type { AuthUserSchema } from '../libs/get-user.decorator';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description 게시글 생성
   * @param {AuthUserSchema} user
   * @param {CreateRequestDto} input
   */
  async create(user: AuthUserSchema, input: CreateRequestDto) {
    return this.prisma.$transaction(async (tx) => {
      let createdTags: Tag[] = [];
      // 태크 체크
      if (!isEmpty(input.tags) && input.tags) {
        const tags = await Promise.all(
          input.tags.map(async (tag) => {
            const name = escapeForUrl(tag);
            const tagData = await tx.tag.findFirst({
              where: {
                name,
              },
            });
            if (!tagData) {
              return tx.tag.create({
                data: {
                  name,
                },
              });
            }
            return tagData;
          }),
        );
        createdTags = tags;
      }

      const post = await tx.post.create({
        data: {
          userId: user.id,
          title: input.title,
          subTitle: input.subTitle ?? null,
          content: input.content,
          description: input.description,
          thumbnail: input.thumbnail ?? null,
        },
      });

      await Promise.all(
        createdTags.map((tag) =>
          tx.postsTags.create({
            data: {
              post: {
                connect: {
                  id: post.id,
                },
              },
              tag: {
                connect: {
                  id: tag.id,
                },
              },
            },
          }),
        ),
      );

      return {
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        error: null,
        result: {
          dataId: post.id,
        },
      };
    });
  }

  /**
   * @description 게시물 목록 리스트
   * @param {PostListRequestDto} query
   */
  async list(query: PostListRequestDto) {
    let result = undefined;
    switch (query.type) {
      case 'past':
        result = await this._getPastItems(query);
        break;
      default:
        result = await this._getPastItems(query);
        break;
    }

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

  async trending(query: SimpleTrendingRequestDto) {
    const { startDate, endDate } = this._getSimpleTrendingTimes(query.dataType);

    const result = await this._getSimpleTrendingItems(startDate, endDate);

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        list: this._serialize(result.list),
        hasNextPage: result.hasNextPage,
      },
    };
  }

  private async _getSimpleTrendingItems(startDate: Date, endDate: Date) {
    const list = await this.prisma.post.findMany({
      orderBy: [
        {
          id: 'desc',
        },
      ],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      take: 6,
    });

    const endCursor = list.at(-1)?.id ?? null;
    const hasNextPage = endCursor
      ? (await this.prisma.post.count({
          where: {
            id: {
              lt: endCursor,
            },
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: [
            {
              id: 'desc',
            },
          ],
        })) > 0
      : false;

    return {
      list,
      hasNextPage,
    };
  }

  /**
   * @private
   * @description 과거 게시물 리스트
   * @param {PostListRequestDto} params
   */
  private async _getPastItems({
    cursor,
    limit,
    endDate,
    startDate,
  }: PostListRequestDto) {
    if (isString(cursor)) {
      cursor = Number(cursor);
    }

    if (isString(limit)) {
      limit = Number(limit);
    }

    // throw error if not yyyy-mm-dd format
    if (
      [startDate, endDate].some((date) => !/^\d{4}-\d{2}-\d{2}$/.test(date))
    ) {
      throw new BadRequestException({
        resultCode: EXCEPTION_CODE.INVALID,
        message: ['startDate or endDate is not yyyy-mm-dd format'],
        error: 'datetime',
      });
    }

    const d1 = new Date(`${startDate} 00:00:00`);
    const d2 = new Date(`${endDate} 23:59:59`);

    const [totalCount, list] = await Promise.all([
      this.prisma.post.count({
        where: {
          createdAt: {
            gte: d1,
            lte: d2,
          },
        },
      }),
      this.prisma.post.findMany({
        orderBy: [
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
          createdAt: {
            gte: d1,
            lte: d2,
          },
        },
        include: {
          user: true,
        },
        take: limit,
      }),
    ]);

    const endCursor = list.at(-1)?.id ?? null;
    const hasNextPage = endCursor
      ? (await this.prisma.post.count({
          where: {
            id: {
              lt: endCursor,
            },
            createdAt: {
              gte: d1,
              lte: d2,
            },
          },
          orderBy: [
            {
              id: 'desc',
            },
          ],
        })) > 0
      : false;

    return {
      totalCount,
      list,
      endCursor,
      hasNextPage,
    };
  }

  /**
   *  @description 심플 트렌딩 리스트 타임
   */
  private _getSimpleTrendingTimes(type: '1W' | '1M' | '3M' | '6M') {
    //  1week 인데 첫날은 0시 0분 0초로 시작해서 7일이 아니라 6일 23시 59분 59초로 끝남
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    // 1months
    const startDate2 = new Date();
    startDate2.setMonth(startDate2.getMonth() - 1);
    startDate2.setHours(0, 0, 0, 0);

    const endDate2 = new Date();
    endDate2.setHours(23, 59, 59, 999);

    // 3months
    const startDate3 = new Date();
    startDate3.setMonth(startDate3.getMonth() - 3);
    startDate3.setHours(0, 0, 0, 0);

    const endDate3 = new Date();
    endDate3.setHours(23, 59, 59, 999);

    // 6months
    const startDate4 = new Date();
    startDate4.setMonth(startDate4.getMonth() - 6);

    const endDate4 = new Date();
    endDate4.setHours(23, 59, 59, 999);

    const time = {
      '1W': {
        startDate,
        endDate,
      },
      '1M': {
        startDate: startDate2,
        endDate: endDate2,
      },
      '3M': {
        startDate: startDate3,
        endDate: endDate3,
      },
      '6M': {
        startDate: startDate4,
        endDate: endDate4,
      },
    };

    return time[type];
  }

  private _serialize(
    list: (Post & {
      user: User & {
        profile: UserProfile;
      };
    })[],
  ) {
    return list.map((item) => ({
      id: item.id,
      title: item.title,
      subTitle: item.subTitle,
      content: item.content,
      description: item.description,
      thumbnail: item.thumbnail,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      user: {
        id: item.user.id,
        username: item.user.username,
        email: item.user.email,
        profile: {
          name: item.user.profile.name,
          bio: item.user.profile.bio,
          avatarUrl: item.user.profile.avatarUrl,
          availableText: item.user.profile.availableText,
          location: item.user.profile.location,
          website: item.user.profile.website,
        },
      },
    }));
  }
}
