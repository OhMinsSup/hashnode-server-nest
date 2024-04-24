import { Injectable } from '@nestjs/common';

// services
import { SerializeService } from '../../integrations/serialize/serialize.service';
import { PrismaService } from '../../modules/database/prisma.service';
import { PostsService } from '../../posts/services/posts.service';
import { getPostSelector } from '../../modules/database/selectors/post';

// input
import { PostDraftInput } from '../input/post-draft.input';
import { PostDraftListQuery } from '../input/post-draft-list.query';

// types
import type { SerializeUser } from '../../integrations/serialize/serialize.interface';

@Injectable()
export class DraftsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly posts: PostsService,
    private readonly serialize: SerializeService,
  ) {}

  /**
   * @description 임시 저장된 게시글 목록
   * @param {SerializeUser} user
   * @param {PostDraftListQuery} query
   */
  async list(user: SerializeUser, query: PostDraftListQuery) {
    const [totalCount, list] = await Promise.all([
      this.prisma.post.count({
        where: {
          fk_user_id: user.id,
          deletedAt: {
            equals: null,
          },
          PostConfig: {
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
            isDraft: true,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: query.limit ?? 20,
        select: getPostSelector(),
      }),
    ]);

    const endCursor = list.at(-1)?.id ?? null;
    const hasNextPage = endCursor
      ? (await this.prisma.post.count({
          where: {
            id: {
              lt: endCursor,
            },
            fk_user_id: user.id,
            deletedAt: {
              equals: null,
            },
            PostConfig: {
              isDraft: true,
            },
          },
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
   * @description 임시 게시물 생성
   * @param {SerializeUser} user
   * @param {PostDraftInput} input
   */
  async createDraft(user: SerializeUser, input: PostDraftInput) {
    return await this.posts.createDraft(user, input);
  }

  /**
   * @param user
   * @param input
   * @returns
   */
  async getSyncDraft(user: SerializeUser, input: PostDraftInput) {
    return await this.posts.getSyncDraft(user, input);
  }
}
