import { Injectable } from '@nestjs/common';
import { isEqual, toFinite } from 'lodash';

// services
import { SerializeService } from '../../integrations/serialize/serialize.service';
import { PrismaService } from '../../modules/database/prisma.service';
import { PostsService } from '../../posts/services/posts.service';
import { getPostSelector } from '../../modules/database/selectors/post';

// input
import { PostDraftInput } from '../input/post-draft.input';
import { PostDraftListQuery } from '../input/post-draft-list.query';
import { EXCEPTION_CODE } from '../../constants/exception.code';
import { PostDraftSyncInput } from '../input/post-draft-sync.input';
import { isEmpty } from '../../libs/assertion';
import { assertNotFound } from 'src/errors/not-found.error';

// types
import type { SerializeUser } from '../../integrations/serialize/serialize.interface';

@Injectable()
export class DraftsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly posts: PostsService,
    private readonly serialize: SerializeService,
  ) {}

  async updateSyncDraft(
    user: SerializeUser,
    id: string,
    input: PostDraftSyncInput,
  ) {
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
      typeof input.config.isMarkdown === 'boolean' &&
      post.PostConfig.isMarkdown !== input.config.isMarkdown
    ) {
      postConfigUpdate.isMarkdown = input.config.isMarkdown;
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
   * @description 임시 저장된 게시글 목록
   * @param {SerializeUser} user
   * @param {PostDraftListQuery} query
   */
  async list(user: SerializeUser, query: PostDraftListQuery) {
    const limit = query.limit ? toFinite(query.limit) : 20;

    const pageNo = toFinite(query.pageNo);

    const [totalCount, list] = await Promise.all([
      this.prisma.post.count({
        where: {
          fk_user_id: user.id,
          deletedAt: {
            equals: null,
          },
          PostConfig: {
            publishedAt: {
              equals: null,
            },
            isDraft: true,
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
              equals: null,
            },
            isDraft: true,
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
        list: list.map((post) =>
          this.serialize.getPost(post, {
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
   * @description 발행 날짜가 입력된 게시글이면서 임시 저장된 게시글 목록
   * @param {SerializeUser} user
   * @param {PostDraftListQuery} query
   */
  async submitted(user: SerializeUser, query: PostDraftListQuery) {
    const limit = query.limit ? toFinite(query.limit) : 20;

    const pageNo = toFinite(query.pageNo);

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
            },
            isDraft: true,
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
            },
            isDraft: true,
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
        list: list.map((post) =>
          this.serialize.getPost(post, {
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
   * @description 임시 게시물 생성
   * @param {SerializeUser} user
   * @param {PostDraftInput} input
   */
  async createDraft(user: SerializeUser, input: PostDraftInput) {
    return await this.posts.createDraft(user, input);
  }

  /**
   * @description 임시 게시물 생성 or 조회
   * @param {SerializeUser} user
   * @param {PostDraftInput} input
   */
  async getSyncDraft(user: SerializeUser, input: PostDraftInput) {
    return await this.posts.getSyncDraft(user, input);
  }
}
