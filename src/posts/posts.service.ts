import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

// service
import { PrismaService } from '../modules/database/prisma.service';
import { TagsService } from '../tags/tags.service';

// utils
import { isEmpty, isString } from '../libs/assertion';
import { calculateRankingScore } from '../libs/utils';

// constants
import { EXCEPTION_CODE } from 'src/constants/exception.code';

// types
import { CreateRequestDto } from './dto/create.request.dto';
import { GetTopPostsQuery, PostListQuery } from './dto/list';

// types
import type {
  Post,
  PostsTags,
  Tag,
  User,
  UserProfile,
  Prisma,
} from '@prisma/client';
import type { UserWithInfo } from '../modules/database/select/user.select';

interface UpdatePostLikesParams {
  postId: number;
  likes: number;
}

interface PostActionParams extends Pick<UpdatePostLikesParams, 'postId'> {
  userId: number;
}

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tags: TagsService,
  ) {}

  /**
   * @description 게시물 좋아요
   * @param {UserWithInfo} user
   * @param {number} id
   */
  async like(user: UserWithInfo, id: number) {
    const result = await this._likeItem({ userId: user.id, postId: id });
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        likes: result.likes,
        isLiked: true,
      },
    };
  }

  /**
   * @description 게시물 안좋아요
   * @param {UserWithInfo} user
   * @param {number} id
   */
  async unlike(user: UserWithInfo, id: number) {
    const result = await this._unlikeItem({ userId: user.id, postId: id });
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        likes: result.likes,
        isLiked: false,
      },
    };
  }

  /**
   * @description 게시물 상세 조회
   * @param {number} id
   */
  async detail(id: number) {
    const now = new Date();
    const post = await this.prisma.post.findFirst({
      where: {
        id,
        isDeleted: false,
        publishingDate: {
          lte: now,
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
   * @description 게시물 삭제
   * @param {UserWithInfo} user
   * @param {number} id
   */
  async delete(user: UserWithInfo, id: number) {
    await this.prisma.post.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: null,
    };
  }

  /**
   * @description 게시글 수정
   * @param {UserWithInfo} user
   * @param {any} input
   */
  async update(user: UserWithInfo, input: any) {
    return this.prisma.$transaction(async (tx) => {
      const post = await tx.post.findFirst({
        where: {
          id: input.id,
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

      if (post.user.id !== user.id) {
        throw new ForbiddenException({
          resultCode: EXCEPTION_CODE.NO_PERMISSION,
          message: '권한이 없습니다.',
          error: null,
          result: null,
        });
      }

      const newData = {} as Prisma.XOR<
        Prisma.PostUpdateInput,
        Prisma.PostUncheckedUpdateInput
      >;
    });
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {},
    };
  }

  /**
   * @description 게시글 생성
   * @param {UserWithInfo} user
   * @param {CreateRequestDto} input
   */
  async create(user: UserWithInfo, input: CreateRequestDto) {
    return this.prisma.$transaction(async (tx) => {
      let createdTags: Tag[] = [];
      // 태크 체크
      if (!isEmpty(input.tags) && input.tags) {
        const tags = await Promise.all(
          input.tags.map((tag) => this.tags.findOrCreate(tag)),
        );
        createdTags = tags;
      }

      const post = await tx.post.create({
        data: {
          userId: user.id,
          title: input.title,
          subTitle: input.subTitle ?? null,
          content: input.content,
          thumbnail: input.thumbnail ? input.thumbnail.url : null,
          disabledComment: input.disabledComment ?? true,
          publishingDate: input.publishingDate
            ? new Date(input.publishingDate)
            : null,
        },
      });

      await tx.postSeo.create({
        data: {
          postId: post.id,
          title: input.seo?.title ?? null,
          desc: input.seo?.desc ?? null,
          image: input.seo?.image ?? null,
        },
      });

      await this._connectTagsToPost(post.id, createdTags, tx);

      // 태그 통계 생성
      this.tags
        .createTagStats(createdTags.map((tag) => tag.id))
        .catch((e) => console.error(e));

      // 포스트 통계 생성
      this.createPostStats(post.id).catch((e) => console.error(e));

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
   * @description 게시물 통계 추가
   * @param {number} postId
   */
  private createPostStats(postId: number) {
    return this.prisma.postStats.create({
      data: {
        postId,
      },
    });
  }

  /**
   * @description 게시물 목록 리스트
   * @param {PostListQuery} query
   * @param {UserWithInfo?} user
   */
  async list(query: PostListQuery, user?: UserWithInfo) {
    let result = undefined;
    switch (query.type) {
      case 'past':
        result = await this._getPastItems(query);
        break;
      case 'personalized':
        result = await this._getItems(query);
        break;
      case 'featured':
        result = await this._getFeaturedItems(query, user);
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

  async getLikes(user: UserWithInfo, query: PostListQuery) {
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
   * @param {GetTopPostsQuery} query
   * @returns
   */
  async getTopPosts(query: GetTopPostsQuery) {
    const { duration } = query;

    const now = new Date();
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
        AND: [
          {
            isDeleted: false,
          },
          {
            publishingDate: {
              lte: now,
            },
          },
          {
            createdAt: {
              gte: date,
            },
          },
        ],
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

  /**
   * @description 게시물 리스트
   * @param {PostListQuery} query
   * @returns
   */
  private async _getItems({ cursor, limit, tag }: PostListQuery) {
    if (isString(cursor)) {
      cursor = Number(cursor);
    }

    if (isString(limit)) {
      limit = Number(limit);
    }

    const now = new Date();

    let tagId: number | null = null;
    if (tag) {
      const data = await this.prisma.tag.findFirst({
        where: {
          name: tag,
        },
      });
      if (!data) {
        throw new NotFoundException({
          resultCode: EXCEPTION_CODE.NOT_EXIST,
          message: ['tag not found'],
          error: 'tag',
        });
      }
      tagId = data.id;
    }

    const [totalCount, list] = await Promise.all([
      this.prisma.post.count({
        where: {
          isDeleted: false,
          publishingDate: {
            lte: now,
          },
          ...(tagId && {
            postsTags: {
              some: {
                tagId: tagId,
              },
            },
          }),
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
          isDeleted: false,
          publishingDate: {
            lte: now,
          },
          ...(tagId && {
            postsTags: {
              some: {
                tagId: tagId,
              },
            },
          }),
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
            isDeleted: false,
            publishingDate: {
              lte: now,
            },
            ...(tagId && {
              postsTags: {
                some: {
                  tagId: tagId,
                },
              },
            }),
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
   * @description 좋아요한 게시물 리스트
   * @param {UserWithInfo} user
   * @param {PostListQuery} query
   * @returns
   */
  private async _getLikeItems(
    user: UserWithInfo,
    { cursor, limit }: PostListQuery,
  ) {
    if (isString(cursor)) {
      cursor = Number(cursor);
    }

    if (isString(limit)) {
      limit = Number(limit);
    }

    const now = new Date();

    // 내가 좋아요한 게시물 목록
    const [totalCount, list] = await Promise.all([
      this.prisma.postLike.count({
        where: {
          userId: user.id,
          post: {
            isDeleted: false,
            publishingDate: {
              lte: now,
            },
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
            isDeleted: false,
            publishingDate: {
              lte: now,
            },
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
              isDeleted: false,
              publishingDate: {
                lte: now,
              },
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
   * @param {PostListQuery} params
   */
  private async _getPastItems({
    cursor,
    limit,
    endDate,
    startDate,
  }: PostListQuery) {
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

    const now = new Date();
    const d1 = new Date(`${startDate} 00:00:00`);
    const d2 = new Date(`${endDate} 23:59:59`);

    const [totalCount, list] = await Promise.all([
      this.prisma.post.count({
        where: {
          createdAt: {
            gte: d1,
            lte: d2,
          },
          isDeleted: false,
          publishingDate: {
            lte: now,
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
          id: cursor ? { lt: cursor } : undefined,
          createdAt: {
            gte: d1,
            lte: d2,
          },
          isDeleted: false,
          publishingDate: {
            lte: now,
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
            isDeleted: false,
            publishingDate: {
              lte: now,
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
   * @description 추천 게시물 리스트
   * @param {PostListQuery} query
   * @param {UserWithInfo?} user
   */
  private async _getFeaturedItems(
    { cursor, limit, tag }: PostListQuery,
    user?: UserWithInfo,
  ) {
    if (isString(cursor)) {
      cursor = Number(cursor);
    }

    if (isString(limit)) {
      limit = Number(limit);
    }

    let tagId: number | null = null;
    if (tag) {
      const data = await this.prisma.tag.findFirst({
        where: {
          name: tag,
        },
      });
      if (!data) {
        throw new NotFoundException({
          resultCode: EXCEPTION_CODE.NOT_EXIST,
          message: ['tag not found'],
          error: 'tag',
        });
      }
      tagId = data.id;
    }

    const now = new Date();

    const totalCount = await this.prisma.postStats.count({
      where: {
        score: {
          gte: 0.001,
        },
        post: {
          isDeleted: false,
          publishingDate: {
            lte: now,
          },
          ...(tagId && {
            postsTags: {
              some: {
                tagId: tagId,
              },
            },
          }),
        },
      },
    });

    const cursorItem = cursor
      ? await this.prisma.post.findFirst({
          where: {
            id: cursor,
            isDeleted: false,
            publishingDate: {
              lte: now,
            },
            ...(tagId && {
              postsTags: {
                some: {
                  tagId: tagId,
                },
              },
            }),
          },
          include: {
            postStats: true,
          },
        })
      : null;

    const list = await this.prisma.post.findMany({
      where: {
        ...(cursor
          ? {
              id: {
                lt: cursor,
              },
              isDeleted: false,
              publishingDate: {
                lte: now,
              },
            }
          : {
              isDeleted: false,
              publishingDate: {
                lte: now,
              },
            }),
        postStats: {
          score: {
            gte: 0.001,
            ...(cursorItem
              ? {
                  lte: cursorItem.postStats?.score,
                }
              : {}),
          },
        },
        ...(tagId && {
          postsTags: {
            some: {
              tagId: tagId,
            },
          },
        }),
      },
      orderBy: [
        {
          postStats: {
            score: 'desc',
          },
        },
        {
          postStats: {
            postId: 'desc',
          },
        },
      ],
      include: {
        postStats: true,
        postLike: user ? { where: { userId: user.id } } : false,
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
    });

    const endCursor = list.at(-1)?.id ?? null;

    const hasNextPage = endCursor
      ? (await this.prisma.post.count({
          where: {
            postStats: {
              postId: {
                lt: endCursor,
              },
              score: {
                gte: 0.001,
                lte: list.at(-1)?.postStats?.score,
              },
            },
            isDeleted: false,
            publishingDate: {
              lte: now,
            },
            ...(tagId && {
              postsTags: {
                some: {
                  tagId: tagId,
                },
              },
            }),
          },
          orderBy: [
            {
              postStats: {
                score: 'desc',
              },
            },
            {
              postStats: {
                postId: 'desc',
              },
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
        },
      },
      count: {
        postLike: item._count.postLike,
      },
      ...(item.cursorId && { cursorId: item.cursorId }),
    };
  }

  /**
   * @description 게시물 통계 - score 업데이트
   * @param {number} postId 게시물 ID
   * @param {number?} likesCount 좋아요 수
   */
  private async _recalculateRanking(postId: number, likesCount?: number) {
    const item = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!item) return;
    const likes = likesCount ?? (await this._countLikes(postId));
    const age =
      (Date.now() - new Date(item.createdAt).getTime()) / 1000 / 60 / 60;
    const score = calculateRankingScore(likes, age);
    return this.prisma.postStats.update({
      where: {
        postId,
      },
      data: {
        score,
      },
    });
  }

  /**
   * @description  좋아요 카운트
   * @param {number} postId
   */
  private async _countLikes(postId: number) {
    const count = await this.prisma.postLike.count({
      where: {
        postId,
      },
    });
    return count;
  }

  /**
   * @description 게시물의 좋아요 통계값 업데이트
   * @param {UpdatePostLikesParams} params
   */
  private async _updatePostLikes({ postId, likes }: UpdatePostLikesParams) {
    return this.prisma.postStats.update({
      data: {
        likes,
      },
      where: {
        postId,
      },
    });
  }

  /**
   * @description 게시물 좋아요
   * @param {PostActionParams} params``
   */
  private async _likeItem({ userId, postId }: PostActionParams) {
    const alreadyLiked = await this.prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (!alreadyLiked) {
      try {
        await this.prisma.postLike.create({
          data: {
            postId,
            userId,
          },
        });
      } catch (e) {}
    }
    const likes = await this._countLikes(postId);
    const itemStats = await this._updatePostLikes({ postId, likes });
    this._recalculateRanking(postId, likes).catch(console.error);
    return itemStats;
  }

  /**
   * @description 게시물 좋아요 취소
   * @param {PostActionParams} params
   */
  private async _unlikeItem({ userId, postId }: PostActionParams) {
    try {
      await this.prisma.postLike.delete({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });
    } catch (e) {}

    const likes = await this._countLikes(postId);
    const itemStats = await this._updatePostLikes({ postId, likes });
    this._recalculateRanking(postId, likes).catch(console.error);
    return itemStats;
  }

  /**
   * @description 태그 연결
   * @param {number} postId
   * @param {Tag[]} tags
   * @param {Omit<PrismaService, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>?}tx
   */
  private async _connectTagsToPost(
    postId: number,
    tags: Tag[],
    tx?: Omit<
      PrismaService,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    >,
  ) {
    const prisma = tx ?? this.prisma;
    const tagIds = tags.map((tag) => tag.id);
    for (const tagId of tagIds) {
      try {
        await prisma.postsTags.create({
          data: {
            post: {
              connect: {
                id: postId,
              },
            },
            tag: {
              connect: {
                id: tagId,
              },
            },
          },
        });
      } catch (e) {
        console.error(e);
      }
    }
  }
}
