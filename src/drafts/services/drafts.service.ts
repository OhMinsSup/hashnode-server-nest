import { Injectable } from '@nestjs/common';

// services
import { SerializeService } from '../../integrations/serialize/serialize.service';
import { PrismaService } from '../../modules/database/prisma.service';
import { PostsService } from '../../posts/services/posts.service';
import { getPostSelector } from '../../modules/database/selectors/post';

// input
import { PostDraftInput } from '../input/post-draft.input';
import { PostDraftListQuery } from '../input/post-draft-list.query';
import { EXCEPTION_CODE } from '../../constants/exception.code';

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
    const limit =
      typeof query.limit === 'number'
        ? query.limit
        : query.limit
          ? parseInt(query.limit, 10)
          : 20;

    const pageNo =
      typeof query.pageNo === 'number'
        ? query.pageNo
        : parseInt(query.pageNo, 10);

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
        list,
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
   * @param user
   * @param input
   * @returns
   */
  async getSyncDraft(user: SerializeUser, input: PostDraftInput) {
    return await this.posts.getSyncDraft(user, input);
  }
}
