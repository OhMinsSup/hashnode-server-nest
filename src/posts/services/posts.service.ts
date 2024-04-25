import { Injectable } from '@nestjs/common';
import { Post } from '@prisma/client';
import { omit, difference } from 'lodash';

// services
import { PrismaService } from '../../modules/database/prisma.service';
import { TagsService } from '../../tags/services/tags.service';
import { SerializeService } from '../../integrations/serialize/serialize.service';

// inputs
import { PostCreateInput } from '../input/post-create.input';
import { PostDraftInput } from '../../drafts/input/post-draft.input';

// utils
import { isEmpty } from '../../libs/assertion';
import { EXCEPTION_CODE } from '../../constants/exception.code';
import { assertNotFound } from '../../errors/not-found.error';
import { assertNoPermission } from '../../errors/no-permission.error';
import { getPostSelector } from '../../modules/database/selectors/post';

// types
import type { SerializeUser } from '../../integrations/serialize/serialize.interface';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tags: TagsService,
    private readonly serialize: SerializeService,
  ) {}

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
      result: {
        dataId: data.id,
      },
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
      result: omit(data, ['fk_user_id']),
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
}
