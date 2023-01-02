import { BadRequestException, Injectable } from '@nestjs/common';

// service
import { PrismaService } from '../modules/database/prisma.service';
import { TagsService } from '../tags/tags.service';

// utils
import { isEmpty, isString } from '../libs/assertion';
import { escapeForUrl } from '../libs/utils';

// constants
import { EXCEPTION_CODE } from 'src/constants/exception.code';

// types
import { CreateRequestDto } from './dto/create.request.dto';
import {
  GetTopPostsRequestDto,
  PostListRequestDto,
} from './dto/list.request.dto';

// types
import type { Post, PostsTags, Tag, User, UserProfile } from '@prisma/client';
import type { AuthUserSchema } from '../libs/get-user.decorator';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tags: TagsService,
  ) {}

  /**
   * @description  좋아요 카운트
   * @param {number} postId
   * @returns
   */
  async countLikes(postId: number) {
    const count = await this.prisma.postLike.count({
      where: {
        postId,
      },
    });
    return count;
  }

  /**
   * @description 게시물 좋아요
   * @param {AuthUserSchema} user
   * @param {number} id
   */
  async like(user: AuthUserSchema, id: number) {
    const alreadyLiked = await this.prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId: user.id,
        },
      },
    });

    if (!alreadyLiked) {
      try {
        await this.prisma.postLike.create({
          data: {
            postId: id,
            userId: user.id,
          },
        });
      } catch (e) {
        console.error(e);
      }
    }

    const likes = await this.countLikes(id);

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        likes,
        isLiked: true,
      },
    };
  }

  /**
   * @description 게시물 안좋아요
   * @param {AuthUserSchema} user
   * @param {number} id
   */
  async unlike(user: AuthUserSchema, id: number) {
    try {
      await this.prisma.postLike.delete({
        where: {
          postId_userId: {
            postId: id,
            userId: user.id,
          },
        },
      });
    } catch (e) {
      console.error(e);
    }

    const likes = await this.countLikes(id);
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        likes,
        isLiked: false,
      },
    };
  }

  /**
   * @description 게시물 상세 조회
   * @param {number} id
   */
  async detail(id: number) {
    const post = await this.prisma.post.findFirst({
      where: {
        id,
        isPublic: true,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        postsTags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            postLike: true,
          },
        },
      },
    });

    if (!post) {
      throw new BadRequestException({
        resultCode: EXCEPTION_CODE.NOT_EXIST,
        message: '게시물을 찾을 수 없습니다.',
        error: null,
        result: null,
      });
    }

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: this._serialize(post),
    };
  }

  /**
   * @description 게시글 수정
   * @param {AuthUserSchema} user
   * @param {any} input
   */
  async update(user: AuthUserSchema, input: any) {
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {},
    };
  }

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
          disabledComment: input.disabledComment ?? true,
          isPublic: input.isPublic ?? false,
          publishingDate: input.publishingDate
            ? new Date(input.publishingDate)
            : null,
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

      // 태그 통계 생성
      this.tags
        .createTagStats(createdTags.map((tag) => tag.id))
        .catch((e) => console.error(e));

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
        result = await this._getItems(query);
        break;
    }

    const { list, totalCount, endCursor, hasNextPage } = result;

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        list: this._serializes(list),
        totalCount,
        pageInfo: {
          endCursor: hasNextPage ? endCursor : null,
          hasNextPage,
        },
      },
    };
  }

  async getLikes(user: AuthUserSchema, query: PostListRequestDto) {
    const result = await this._getLikeItems(user, query);

    const { list, totalCount, endCursor, hasNextPage } = result;

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        list: this._serializes(list),
        totalCount,
        pageInfo: {
          endCursor: hasNextPage ? endCursor : null,
          hasNextPage,
        },
      },
    };
  }

  /**
   * @description 날짜 별 인기 게시물 목록
   * @param {GetTopPostsRequestDto} query
   * @returns
   */
  async getTopPosts(query: GetTopPostsRequestDto) {
    const { duration } = query;

    const date = new Date();
    date.setDate(date.getDate() - duration);
    date.setHours(0, 0, 0, 0);

    const posts = await this.prisma.post.findMany({
      orderBy: [
        {
          id: 'desc',
        },
      ],
      where: {
        isPublic: true,
        createdAt: {
          gte: date,
        },
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        postsTags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            postLike: true,
          },
        },
      },
      take: 6,
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        posts: this._serializes(posts),
      },
    };
  }

  private async _getItems({ cursor, limit }: PostListRequestDto) {
    if (isString(cursor)) {
      cursor = Number(cursor);
    }

    if (isString(limit)) {
      limit = Number(limit);
    }

    const [totalCount, list] = await Promise.all([
      this.prisma.post.count({
        where: {
          isPublic: true,
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
          isPublic: true,
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          postsTags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              postLike: true,
            },
          },
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
            isPublic: true,
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

  private async _getLikeItems(
    user: AuthUserSchema,
    { cursor, limit }: PostListRequestDto,
  ) {
    if (isString(cursor)) {
      cursor = Number(cursor);
    }

    if (isString(limit)) {
      limit = Number(limit);
    }

    // 내가 좋아요한 게시물 목록
    const [totalCount, list] = await Promise.all([
      this.prisma.postLike.count({
        where: {
          userId: user.id,
          post: {
            isPublic: true,
          },
        },
      }),
      this.prisma.postLike.findMany({
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
          userId: user.id,
          post: {
            isPublic: true,
          },
        },
        include: {
          post: {
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
              postsTags: {
                include: {
                  tag: true,
                },
              },
              _count: {
                select: {
                  postLike: true,
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
      ? (await this.prisma.postLike.count({
          where: {
            id: {
              lt: endCursor,
            },
            userId: user.id,
            post: {
              isPublic: true,
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
      list: list.flatMap((item) => ({
        ...item.post,
        cursorId: item.id,
      })),
      endCursor,
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
          isPublic: true,
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
          isPublic: true,
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          postsTags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              postLike: true,
            },
          },
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
            isPublic: true,
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
   * @description 리스트 데이터 serialize
   * @param list
   */
  private _serializes(
    list: (Post & {
      user: User & {
        profile: UserProfile;
      };
      postsTags: (PostsTags & {
        tag: Tag;
      })[];
      _count: {
        postLike: number;
      };
    })[],
  ) {
    return list.map(this._serialize);
  }

  /**
   * @description 리스트 데이터 serialize
   * @param list
   */
  private _serialize(
    item: Post & {
      user: User & {
        profile: UserProfile;
      };
      postsTags: (PostsTags & {
        tag: Tag;
      })[];
      _count: {
        postLike: number;
      };
      cursorId?: number;
    },
  ) {
    return {
      id: item.id,
      title: item.title,
      subTitle: item.subTitle,
      content: item.content,
      description: item.description,
      thumbnail: item.thumbnail,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      tags: item.postsTags.flatMap((item) => ({
        id: item.tag.id,
        name: item.tag.name,
      })),
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
      count: {
        postLike: item._count.postLike,
      },
      ...(item.cursorId && { cursorId: item.cursorId }),
    };
  }
}
