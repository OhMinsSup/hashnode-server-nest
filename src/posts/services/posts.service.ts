import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

// service
import { PrismaService } from '../../modules/database/prisma.service';
import { TagsService } from '../../tags/tags.service';
import { CommentsService } from '../../comments/comments.service';
import { NotificationsService } from '../../notifications/notifications.service';

// utils
import { isEmpty, isString } from '../../libs/assertion';
import { calculateRankingScore } from '../../libs/utils';

// constants
import { EXCEPTION_CODE } from '../../constants/exception.code';

// types
import { CreateBody as CreateCommentBody } from '../../comments/dto/create';
import { UpdateBody as UpdateCommentBody } from '../../comments/dto/update';
import { CreateBody } from '../dto/create.input';
import { UpdateBody } from '../dto/update.input';
import { GetTopPostsQuery, PostListQuery } from '../dto/list.query';

import { isEqual } from 'lodash';

// types
import type { Tag, Prisma } from '@prisma/client';
import type { UserWithInfo } from '../../modules/database/select/user.select';

import {
  DEFAULT_POSTS_SELECT,
  POSTS_LIKES_SELECT,
  POSTS_STATUS_SELECT,
} from '../../modules/database/select/post.select';

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
    private readonly comments: CommentsService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * @description 댓글 작성
   * @param {UserWithInfo} user
   * @param {number} id
   * @param {CreateCommentBody} body
   */
  async createComment(user: UserWithInfo, id: number, body: CreateCommentBody) {
    const list = await this.comments.create(user, id, body);
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: list,
    };
  }

  /**
   * @description 댓글 수정
   * @param {UserWithInfo} user
   * @param {number} commentId
   * @param {UpdateCommentBody} body
   */
  async updateComment(
    user: UserWithInfo,
    commentId: number,
    body: UpdateCommentBody,
  ) {
    const list = await this.comments.update(user, commentId, body);
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: list,
    };
  }

  /**
   * @description 댓글 삭제
   * @param {UserWithInfo} user
   * @param {number} id
   * @param {number} commentId
   */
  async deleteComment(user: UserWithInfo, id: number, commentId: number) {
    await this.comments.delete({
      userId: user.id,
      commentId,
    });
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: null,
    };
  }

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
    const post = await this.prisma.post.findFirst({
      where: {
        id,
      },
      select: DEFAULT_POSTS_SELECT,
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
  async delete(_: UserWithInfo, id: number) {
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
  async update(user: UserWithInfo, id: number, input: UpdateBody) {
    const post = await this.prisma.post.findFirst({
      where: {
        id: id,
      },
      select: DEFAULT_POSTS_SELECT,
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

    if (input.title && !isEqual(post.title, input.title)) {
      newData.title = input.title;
    }

    if (input.subTitle && !isEqual(post.subTitle, input.subTitle)) {
      newData.subTitle = input.subTitle;
    }

    if (input.content && !isEqual(post.content, input.content)) {
      newData.content = input.content;
    }

    if (
      input.thumbnail &&
      input.thumbnail.url &&
      !isEqual(post.thumbnail, input.thumbnail.url)
    ) {
      newData.thumbnail = input.thumbnail.url;
    }

    if (
      typeof input.disabledComment === 'boolean' &&
      post.disabledComment !== input.disabledComment
    ) {
      newData.disabledComment = input.disabledComment;
    }

    if (
      input.publishingDate &&
      !isEqual(post.publishingDate, input.publishingDate)
    ) {
      newData.publishingDate = new Date(input.publishingDate);
    }

    if (input.seo) {
      if (input.seo.title && !isEqual(post.seo.title, input.seo.title)) {
        newData.seo.update.title = input.seo.title;
      }
      if (input.seo.desc && !isEqual(post.seo.desc, input.seo.desc)) {
        newData.seo.update.desc = input.seo.desc;
      }
      if (input.seo.image && !isEqual(post.seo.image, input.seo.image)) {
        newData.seo.update.image = input.seo.image;
      }
    }

    if (input.tags) {
      const prevTags = post.postsTags.map((postTag) => postTag.tag);

      const newTags = input.tags.filter(
        (tag) => !prevTags.find((t) => t.name === tag),
      );
      const deleteTags = prevTags.filter(
        (tag) => !input.tags.find((t) => t === tag.name),
      );

      const tags = await Promise.all(
        newTags.map((tag) => this.tags.findOrCreate(tag)),
      );

      newData.postsTags = {
        deleteMany: {
          postId: post.id,
          tagId: {
            in: deleteTags.map((tag) => tag.id),
          },
        },
        create: tags.map((tag) => ({
          tagId: tag.id,
        })),
      };
    }

    await this.prisma.post.update({
      where: {
        id: post.id,
      },
      data: newData,
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: null,
    };
  }

  /**
   * @description 게시글 생성
   * @param {UserWithInfo} user
   * @param {CreateRequestDto} input
   */
  async create(user: UserWithInfo, input: CreateBody) {
    let createdTags: Tag[] = [];
    // 태크 체크
    if (!isEmpty(input.tags) && input.tags) {
      const tags = await Promise.all(
        input.tags.map((tag) => this.tags.findOrCreate(tag)),
      );
      createdTags = tags;
    }

    const post = await this.prisma.post.create({
      data: {
        userId: user.id,
        title: input.title,
        subTitle: input.subTitle ?? null,
        content: input.content ?? null,
        thumbnail: input.thumbnail ? input.thumbnail.url ?? null : null,
        disabledComment: input.disabledComment ?? true,
        isDraft: input.isDraft ?? true,
        publishingDate: input.publishingDate
          ? new Date(input.publishingDate)
          : null,
      },
    });

    await this.prisma.postSeo.create({
      data: {
        postId: post.id,
        title: input.seo?.title ?? null,
        desc: input.seo?.desc ?? null,
        image: input.seo?.image ?? null,
      },
    });

    await this._connectTagsToPost(post.id, createdTags);

    // 태그 통계 생성
    this.tags
      .createTagStats(createdTags.map((tag) => tag.id))
      .catch((e) => console.error(e));

    // 포스트 통계 생성
    this.createPostStats(post.id).catch((e) => console.error(e));

    if (!input.isDraft) {
      // 알림 생성
      this.notifications.createArticles(post.id).catch((e) => console.error(e));
    }

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        dataId: post.id,
      },
    };
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

  async getDraftPosts(user: UserWithInfo, query: PostListQuery) {
    const result = await this._getDraftItems(query, user);

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
      select: DEFAULT_POSTS_SELECT,
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
        select: DEFAULT_POSTS_SELECT,
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
   * @description 초안 작성 게시물 리스트
   * @param {PostListQuery} query
   * @param {UserWithInfo?} user
   */
  private async _getDraftItems(
    { cursor, limit }: PostListQuery,
    user?: UserWithInfo,
  ) {
    if (isString(cursor)) {
      cursor = Number(cursor);
    }

    if (isString(limit)) {
      limit = Number(limit);
    }

    // 내가 좋아요한 게시물 목록
    const [totalCount, list] = await Promise.all([
      this.prisma.post.count({
        where: {
          userId: user.id,
          isDraft: true,
        },
      }),
      this.prisma.post.findMany({
        orderBy: [
          {
            id: 'desc',
          },
        ],
        where: {
          userId: user.id,
          isDraft: true,
          id: cursor
            ? {
                lt: cursor,
              }
            : undefined,
        },
        select: DEFAULT_POSTS_SELECT,
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
            isDraft: true,
            userId: user.id,
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
        select: POSTS_LIKES_SELECT,
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
        select: DEFAULT_POSTS_SELECT,
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
    console.log(user);
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
      select: POSTS_STATUS_SELECT,
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
  _serializes(list: any[]) {
    return list.map(this._serialize);
  }

  /**
   * @description 리스트 데이터 serialize
   * @param list
   */
  _serialize(item: any) {
    return {
      id: item.id,
      title: item.title,
      subTitle: item.subTitle,
      content: item.content,
      thumbnail: item.thumbnail,
      disabledComment: item.disabledComment,
      publishingDate: item.publishingDate,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      user: {
        id: item.user?.id,
        username: item.user?.username,
        email: item.user?.email,
        profile: {
          name: item.user?.profile?.name,
          avatarUrl: item.user?.profile?.avatarUrl,
          bio: item.user?.profile?.bio,
          availableText: item.user?.profile?.availableText,
        },
      },
      tags:
        item.postsTags?.flatMap((item) => ({
          id: item.tag.id,
          name: item.tag.name,
        })) ?? [],
      seo: item.seo,
      count: {
        postLike: item._count?.postLike ?? 0,
        comments: item._count?.comments ?? 0,
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
   */
  private async _connectTagsToPost(postId: number, tags: Tag[]) {
    const tagIds = tags.map((tag) => tag.id);
    for (const tagId of tagIds) {
      try {
        await this.prisma.postsTags.create({
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
