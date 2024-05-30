import { Inject, Injectable } from '@nestjs/common';
import { Post } from '@prisma/client';
import { difference, toFinite, isEqual } from 'lodash';
import { REQUEST } from '@nestjs/core';

// services
import { PrismaService } from '../../modules/database/prisma.service';
import { TagsService } from '../../tags/services/tags.service';
import { SerializeService } from '../../integrations/serialize/serialize.service';
import { PasswordService } from '../../auth/services/password.service';

// inputs
import { PostCreateInput } from '../input/post-create.input';
import { PostDraftInput } from '../../drafts/input/post-draft.input';
import { PostPublishedListQuery } from '../input/post-published-list.query';
import { PostUpdateInput } from '../input/post-update.input';
import { PostListQuery } from '../input/post-list.query';
import { PostTrendingListQuery } from '../input/post-trending-list.query';
import { PostBookmarkListQuery } from '../input/post-bookmark-list.query';
import { PostLikeListQuery } from '../input/post-like-list.query';

// utils
import { isEmpty } from '../../libs/assertion';
import { EXCEPTION_CODE } from '../../constants/exception.code';
import { assertNotFound } from '../../errors/not-found.error';
import { assertNoPermission } from '../../errors/no-permission.error';
import { getPostSelector } from '../../modules/database/selectors/post';
import { calculateRankingScore } from '../../libs/utils';

// types
import type { SerializeUser } from '../../integrations/serialize/serialize.interface';
import type { Request } from 'express';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tags: TagsService,
    private readonly serialize: SerializeService,
    private readonly password: PasswordService,
    @Inject(REQUEST) private request: Request,
  ) {}

  /**
   * @description 게시물 삭제
   * @param {SerializeUser} user
   * @param {string} id
   */
  async delete(user: SerializeUser, id: string) {
    const post = await this.byOwner(user, id);

    await this.prisma.post.update({
      where: {
        id: post.result.id,
      },
      data: {
        deletedAt: new Date(),
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
   * @description 내가 작성한 게시글 목록 (발행 완료된 게시글)
   * @param {SerializeUser} user
   * @param {PostPublishedListQuery} query
   */
  async getPublished(user: SerializeUser, query: PostPublishedListQuery) {
    const limit = query.limit ? toFinite(query.limit) : 20;

    const pageNo = toFinite(query.pageNo);

    const now = new Date();

    const [totalCount, list] = await Promise.all([
      this.prisma.post.count({
        where: {
          fk_user_id: user.id,
          deletedAt: {
            equals: null,
          },
          PostConfig: {
            publishedAt: {
              not: null,
              lt: now,
            },
            isDraft: false,
          },
        },
      }),
      this.prisma.post.findMany({
        where: {
          fk_user_id: user.id,
          deletedAt: {
            equals: null,
          },
          PostConfig: {
            publishedAt: {
              not: null,
              lt: now,
            },
            isDraft: false,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (pageNo - 1) * limit,
        take: limit,
        select: getPostSelector(),
      }),
    ]);

    const hasNextPage = totalCount > pageNo * limit;

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        totalCount,
        list: list.map((item) =>
          this.serialize.getPost(item, {
            includeTagStats: false,
          }),
        ),
        pageInfo: {
          currentPage: pageNo,
          hasNextPage,
          nextPage: hasNextPage ? pageNo + 1 : null,
        },
      },
    };
  }

  /**
   * @description 게시물 조회
   * @param {SerializeUser} _
   * @param {string} id
   */
  async byId(_: SerializeUser, id: string) {
    const data = await this.prisma.post.findUnique({
      where: {
        id,
        deletedAt: {
          equals: null,
        },
        PostConfig: {
          isDraft: false,
        },
      },
      select: getPostSelector(),
    });

    assertNotFound(!data, {
      resultCode: EXCEPTION_CODE.NOT_EXIST,
      message: '게시물이 존재하지 않습니다.',
      error: null,
      result: null,
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: this.serialize.getPost(data, {
        includeTagStats: false,
      }),
    };
  }

  /**
   * @description 게시물 조회 (작성자)
   * @param {SerializeUser} user
   * @param {string} id
   */
  async byOwner(user: SerializeUser, id: string) {
    const data = await this.prisma.post.findUnique({
      where: {
        id,
        deletedAt: {
          equals: null,
        },
      },
      select: {
        fk_user_id: true,
        ...getPostSelector(),
      },
    });

    assertNotFound(!data, {
      resultCode: EXCEPTION_CODE.NOT_EXIST,
      message: '게시물이 존재하지 않습니다.',
      error: null,
      result: null,
    });

    assertNoPermission(data.fk_user_id !== user.id, {
      resultCode: EXCEPTION_CODE.NO_PERMISSION,
      message: '게시물 작성자만 조회할 수 있습니다.',
      error: null,
      result: null,
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: this.serialize.getPost(data, {
        includeTagStats: false,
      }),
    };
  }

  /**
   * @description 게시물 수정
   * @param {SerializeUser} user
   * @param {string} id
   * @param {PostUpdateInput} input
   */
  async update(user: SerializeUser, id: string, input: PostUpdateInput) {
    const post = await this.prisma.post.findFirst({
      where: {
        id: id,
        fk_user_id: user.id,
      },
      select: getPostSelector(),
    });

    assertNotFound(!post, {
      resultCode: EXCEPTION_CODE.NOT_EXIST,
      message: '게시물이 존재하지 않습니다.',
      error: null,
      result: null,
    });

    const newData = {} as Parameters<
      typeof this.prisma.post.update
    >['0']['data'];

    if (input.title && !isEqual(post.title, input.title)) {
      newData.title = input.title;
    }

    if (input.subTitle && !isEqual(post.subTitle, input.subTitle)) {
      newData.subTitle = input.subTitle;
    }

    if (input.urlSlug && !isEqual(post.urlSlug, input.urlSlug)) {
      newData.urlSlug = input.urlSlug;
    }

    if (input.content && !isEqual(post.content, input.content)) {
      newData.content = input.content;
    }

    if (input.meta) {
      newData.meta = input.meta;
    }

    if (input.image && !isEqual(post.image, input.image)) {
      newData.image = input.image;
    }

    const postConfigUpdate = {} as Parameters<
      typeof this.prisma.post.update
    >['0']['data']['PostConfig']['update'];

    if (
      typeof input.config.disabledComment === 'boolean' &&
      post.PostConfig.disabledComment !== input.config.disabledComment
    ) {
      postConfigUpdate.disabledComment = input.config.disabledComment;
    }

    if (
      typeof input.config.hiddenArticle === 'boolean' &&
      post.PostConfig.hiddenArticle !== input.config.hiddenArticle
    ) {
      postConfigUpdate.hiddenArticle = input.config.hiddenArticle;
    }

    if (
      typeof input.config.hasTableOfContents === 'boolean' &&
      post.PostConfig.hasTableOfContents !== input.config.hasTableOfContents
    ) {
      postConfigUpdate.hasTableOfContents = input.config.hasTableOfContents;
    }

    if (
      typeof input.config.isDraft === 'boolean' &&
      post.PostConfig.isDraft !== input.config.isDraft
    ) {
      postConfigUpdate.isDraft = input.config.isDraft;
    }

    if (
      typeof input.config.isMarkdown === 'boolean' &&
      post.PostConfig.isMarkdown !== input.config.isMarkdown
    ) {
      postConfigUpdate.isMarkdown = input.config.isMarkdown;
    }

    if (
      input.config.publishedAt &&
      !isEqual(post.PostConfig.publishedAt, input.config.publishedAt)
    ) {
      postConfigUpdate.publishedAt = input.config.publishedAt;
    }

    if (!isEmpty(postConfigUpdate)) {
      newData.PostConfig = {
        update: postConfigUpdate,
      };
    }

    const postSeoUpdate = {} as Parameters<
      typeof this.prisma.post.update
    >['0']['data']['PostSeo']['update'];

    if (input.seo.title && !isEqual(post.PostSeo.title, input.seo.title)) {
      postSeoUpdate.title = input.seo.title;
    }

    if (
      input.seo.description &&
      !isEqual(post.PostSeo.description, input.seo.description)
    ) {
      postSeoUpdate.description = input.seo.description;
    }

    if (input.seo.image && !isEqual(post.PostSeo.image, input.seo.image)) {
      postSeoUpdate.image = input.seo.image;
    }

    if (!isEmpty(postSeoUpdate)) {
      newData.PostSeo = {
        update: postSeoUpdate,
      };
    }

    if (input.tags) {
      const prevTags = post.PostTags.map((item) => item.Tag);

      const newTags = input.tags.filter(
        (tag) => !prevTags.find((t) => t.name === tag),
      );
      const deleteTags = prevTags.filter(
        (tag) => !input.tags.find((t) => t === tag.name),
      );

      const ids = await this.tags.findOrCreateByMany(newTags);

      newData.PostTags = {
        deleteMany: {
          fk_post_id: post.id,
          fk_tag_id: {
            in: deleteTags.map((tag) => tag.id),
          },
        },
        create: ids.map((id) => ({
          fk_tag_id: id,
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
   * @description 게시물 생성
   * @param {SerializeUser} user
   * @param {PostCreateInput} input
   */
  async create(user: SerializeUser, input: PostCreateInput) {
    const tagsIds =
      input.tags && !isEmpty(input.tags)
        ? await this.tags.findOrCreateByMany(input.tags)
        : [];

    const publishedAt = input.config.publishedAt
      ? new Date(input.config.publishedAt)
      : null;

    const meta: Post['meta'] = input.meta
      ? JSON.parse(input.meta)
      : JSON.parse('{}');

    const data = await this.prisma.post.create({
      data: {
        urlSlug: input.urlSlug,
        title: input.title,
        subTitle: input.subTitle ?? null,
        content: input.content ?? null,
        meta,
        image: input.image ?? null,
        fk_user_id: user.id,
        PostSeo: {
          create: {},
        },
        PostConfig: {
          create: {
            disabledComment: input.config.disabledComment,
            hiddenArticle: input.config.hiddenArticle,
            hasTableOfContents: input.config.hasTableOfContents,
            isDraft: input.config.isDraft,
            isMarkdown: input.config.isMarkdown,
            publishedAt,
          },
        },
        PostStats: {
          create: {
            likes: 0,
            clicks: 0,
            comments: 0,
            score: 0,
          },
        },
        ...(!isEmpty(tagsIds) && {
          PostTags: {
            create: tagsIds.map((id) => ({
              fk_tag_id: id,
            })),
          },
        }),
      },
      select: {
        id: true,
      },
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        dataId: data.id,
      },
    };
  }

  /**
   * @description 임시 게시물 생성
   * @param {SerializeUser} user
   * @param {PostDraftInput} input
   */
  async createDraft(user: SerializeUser, input: PostDraftInput) {
    const tagsIds =
      input.tags && !isEmpty(input.tags)
        ? await this.tags.findOrCreateByMany(input.tags)
        : [];

    const data = await this.prisma.post.create({
      data: {
        urlSlug: '',
        title: input.title || 'Untitled',
        subTitle: null,
        content: '',
        meta: JSON.parse('{}'),
        image: null,
        fk_user_id: user.id,
        PostSeo: {
          create: {},
        },
        PostConfig: {
          create: {
            disabledComment: false,
            hiddenArticle: false,
            hasTableOfContents: false,
            isDraft: true,
            isMarkdown: false,
            publishedAt: null,
          },
        },
        PostStats: {
          create: {
            likes: 0,
            clicks: 0,
            comments: 0,
            score: 0,
          },
        },
        ...(!isEmpty(tagsIds) && {
          PostTags: {
            create: tagsIds.map((id) => ({
              fk_tag_id: id,
            })),
          },
        }),
      },
      select: {
        id: true,
      },
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        dataId: data.id,
      },
    };
  }

  /**
   * @description 임시 게시물 조회 또는 생성
   * @param {SerializeUser} user
   * @param {PostDraftInput} input
   */
  async getSyncDraft(user: SerializeUser, input: PostDraftInput) {
    if (input.isNewDraft) {
      return await this.createDraft(user, input);
    }

    const now = new Date();

    // 현재시간으로 부터 7일 이내에 작성한 임시 게시물이 있는지 확인
    const data = await this.prisma.post.findFirst({
      where: {
        fk_user_id: user.id,
        deletedAt: {
          equals: null,
        },
        PostConfig: {
          isDraft: true,
        },
        createdAt: {
          gte: new Date(now.setDate(now.getDate() - 7)),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        PostTags: {
          select: {
            Tag: true,
          },
        },
      },
    });

    if (data) {
      const currentTags = data.PostTags.map((tag) => tag.Tag.name);
      const newTags = input.tags ?? [];

      const diff = difference(currentTags, newTags);

      if (!diff.length) {
        return {
          resultCode: EXCEPTION_CODE.OK,
          message: null,
          error: null,
          result: {
            dataId: data.id,
          },
        };
      }
    }

    return await this.createDraft(user, input);
  }

  /**
   * @description 게시물 좋아요
   * @param {SerializeUser} user
   * @param {string} id
   */
  async like(user: SerializeUser, postId: string) {
    const result = await this._like(user.id, postId);
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
   * @param {SerializeUser} user
   * @param {string} postId
   */
  async unlike(user: SerializeUser, postId: string) {
    const result = await this._unlike(user.id, postId);
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
   * @description 게시물 좋아요
   * @param {string} userId
   * @param {string} postId
   */
  private async _like(userId: string, postId: string) {
    const alreadyLiked = await this.prisma.postLike.findFirst({
      where: {
        fk_post_id: postId,
        fk_user_id: userId,
      },
    });

    if (!alreadyLiked) {
      try {
        await this.prisma.postLike.create({
          data: {
            fk_post_id: postId,
            fk_user_id: userId,
          },
        });
      } catch (e) {}
    }
    const likes = await this._countLikes(postId);
    const itemStats = await this._updatePostLikes(postId, likes);
    this._recalculateRanking(postId, likes).catch(console.error);
    return itemStats;
  }

  /**
   * @description 게시물 좋아요 취소
   * @param {string} userId
   * @param {string} postId
   */
  private async _unlike(userId: string, postId: string) {
    const alreadyLiked = await this.prisma.postLike.findFirst({
      where: {
        fk_post_id: postId,
        fk_user_id: userId,
      },
    });

    if (alreadyLiked) {
      try {
        await this.prisma.postLike.delete({
          where: {
            id: alreadyLiked.id,
          },
        });
      } catch (e) {}
    }

    const likes = await this._countLikes(postId);
    const itemStats = await this._updatePostLikes(postId, likes);
    this._recalculateRanking(postId, likes).catch(console.error);
    return itemStats;
  }

  /**
   * @description 게시물의 좋아요 통계값 업데이트
   * @param {string} postId
   * @param {number} likes
   */
  private async _updatePostLikes(postId: string, likes: number) {
    return this.prisma.postStats.update({
      data: {
        likes,
      },
      where: {
        fk_post_id: postId,
      },
    });
  }

  /**
   * @description  좋아요 카운트
   * @param {string} postId
   */
  private async _countLikes(postId: string) {
    return await this.prisma.postLike.count({
      where: {
        fk_post_id: postId,
      },
    });
  }

  /**
   * @description 게시물 통계 - score 업데이트
   * @param {string} postId 게시물 ID
   * @param {number?} likesCount 좋아요 수
   */
  private async _recalculateRanking(postId: string, likesCount?: number) {
    const item = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!item) return;
    const likes = likesCount ?? (await this._countLikes(postId));
    const age =
      (Date.now() - new Date(item.createdAt).getTime()) / 1000 / 60 / 60;
    const score = calculateRankingScore(likes, age);
    return this.prisma.postStats.update({
      where: {
        fk_post_id: postId,
      },
      data: {
        score,
      },
    });
  }

  /**
   * @description 게시글 목록
   * @param {SerializeUser} user
   * @param {PostListQuery} query
   */
  async list(user: SerializeUser, query: PostListQuery) {
    const limit = query.limit ? toFinite(query.limit) : 20;

    const pageNo = toFinite(query.pageNo);

    const now = new Date();

    const [totalCount, list] = await Promise.all([
      this.prisma.post.count({
        where: {
          deletedAt: {
            equals: null,
          },
          PostConfig: {
            publishedAt: {
              not: null,
              lt: now,
            },
            isDraft: false,
          },
        },
      }),
      this.prisma.post.findMany({
        where: {
          deletedAt: {
            equals: null,
          },
          PostConfig: {
            publishedAt: {
              not: null,
              lt: now,
            },
            isDraft: false,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (pageNo - 1) * limit,
        take: limit,
        select: getPostSelector(),
      }),
    ]);

    const hasNextPage = totalCount > pageNo * limit;

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        totalCount,
        list: list.map((item) =>
          this.serialize.getPost(item, {
            includeTagStats: false,
          }),
        ),
        pageInfo: {
          currentPage: pageNo,
          hasNextPage,
          nextPage: hasNextPage ? pageNo + 1 : null,
        },
      },
    };
  }

  /**
   * @description 트렌딩 게시물 조회
   * @param {PostTrendingListQuery} query - 기간 (1week = 7, 1month = 30, 3month = 90, 6month = 180, 1year = 365)
   */
  async getTrendingArticles(query: PostTrendingListQuery) {
    const limit = query.limit ? toFinite(query.limit) : 20;
    const pageNo = toFinite(query.pageNo);

    const now = new Date();
    const time = new Date();

    switch (query.duration) {
      case 7:
        time.setDate(time.getDate() - 7);
        break;
      case 30:
        time.setDate(time.getDate() - 30);
        break;
      case 90:
        time.setDate(time.getDate() - 90);
        break;
      case 180:
        time.setDate(time.getDate() - 180);
        break;
      case 365:
        time.setDate(time.getDate() - 365);
        break;
      default:
        time.setDate(time.getDate() - 7);
        break;
    }

    const [totalCount, list] = await Promise.all([
      this.prisma.post.count({
        where: {
          deletedAt: {
            equals: null,
          },
          PostConfig: {
            publishedAt: {
              not: null,
              lt: now,
            },
            isDraft: false,
          },
          PostStats: {
            score: {
              gt: 0,
            },
            updatedAt: {
              gte: time,
            },
          },
        },
        orderBy: {
          PostStats: {
            score: 'desc',
          },
        },
      }),
      this.prisma.post.findMany({
        where: {
          deletedAt: {
            equals: null,
          },
          PostConfig: {
            publishedAt: {
              not: null,
              lt: now,
            },
            isDraft: false,
          },
          PostStats: {
            score: {
              gt: 0,
            },
            updatedAt: {
              gte: time,
            },
          },
        },
        orderBy: {
          PostStats: {
            score: 'desc',
          },
        },
        skip: (pageNo - 1) * limit,
        take: limit,
        select: getPostSelector(),
      }),
    ]);

    const hasNextPage = totalCount > pageNo * limit;

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        totalCount,
        list: list.map((item) =>
          this.serialize.getPost(item, {
            includeTagStats: false,
          }),
        ),
        pageInfo: {
          currentPage: pageNo,
          hasNextPage,
          nextPage: hasNextPage ? pageNo + 1 : null,
        },
      },
    };
  }

  /**
   * @description 북마크 게시물 조회
   * @param {SerializeUser} user
   * @param {PostBookmarkListQuery} query
   */
  async getBookmarks(user: SerializeUser, query: PostBookmarkListQuery) {
    const limit = query.limit ? toFinite(query.limit) : 20;

    const pageNo = toFinite(query.pageNo);

    const now = new Date();

    const [totalCount, list] = await Promise.all([
      this.prisma.post.count({
        where: {
          deletedAt: {
            equals: null,
          },
          PostConfig: {
            publishedAt: {
              not: null,
              lt: now,
            },
            isDraft: false,
          },
          PostBookmark: {
            some: {
              fk_user_id: user.id,
            },
          },
        },
      }),
      this.prisma.post.findMany({
        where: {
          deletedAt: {
            equals: null,
          },
          PostConfig: {
            publishedAt: {
              not: null,
              lt: now,
            },
            isDraft: false,
          },
          PostBookmark: {
            some: {
              fk_user_id: user.id,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (pageNo - 1) * limit,
        take: limit,
        select: getPostSelector(),
      }),
    ]);

    const hasNextPage = totalCount > pageNo * limit;

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        totalCount,
        list: list.map((item) =>
          this.serialize.getPost(item, {
            includeTagStats: false,
          }),
        ),
        pageInfo: {
          currentPage: pageNo,
          hasNextPage,
          nextPage: hasNextPage ? pageNo + 1 : null,
        },
      },
    };
  }

  /**
   * @description 좋아요 게시물 조회
   * @param {SerializeUser} user
   * @param {PostLikeListQuery} query
   */
  async getLikes(user: SerializeUser, query: PostLikeListQuery) {
    const limit = query.limit ? toFinite(query.limit) : 20;

    const pageNo = toFinite(query.pageNo);

    const now = new Date();

    const [totalCount, list] = await Promise.all([
      this.prisma.post.count({
        where: {
          deletedAt: {
            equals: null,
          },
          PostConfig: {
            publishedAt: {
              not: null,
              lt: now,
            },
            isDraft: false,
          },
          PostLike: {
            some: {
              fk_user_id: user.id,
            },
          },
        },
      }),
      this.prisma.post.findMany({
        where: {
          deletedAt: {
            equals: null,
          },
          PostConfig: {
            publishedAt: {
              not: null,
              lt: now,
            },
            isDraft: false,
          },
          PostLike: {
            some: {
              fk_user_id: user.id,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (pageNo - 1) * limit,
        take: limit,
        select: getPostSelector(),
      }),
    ]);

    const hasNextPage = totalCount > pageNo * limit;

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        totalCount,
        list: list.map((item) =>
          this.serialize.getPost(item, {
            includeTagStats: false,
          }),
        ),
        pageInfo: {
          currentPage: pageNo,
          hasNextPage,
          nextPage: hasNextPage ? pageNo + 1 : null,
        },
      },
    };
  }

  /**
   * @description 게시물 조회수
   * @param {string} id
   */
  async read(id: string) {
    const ipHash = this.password.hash(this.request.ip);

    const data = await this.prisma.postRead.findFirst({
      where: {
        fk_post_id: id,
        ipHash,
      },
    });

    if (!data) {
      await this.prisma.postRead.create({
        data: {
          ipHash,
          fk_post_id: id,
        },
      });
    }

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: null,
    };
  }
}
