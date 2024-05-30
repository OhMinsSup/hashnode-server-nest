import { Injectable } from '@nestjs/common';
import { pick } from 'lodash';
import { PrismaService } from '../../modules/database/prisma.service';
import { SerializeUser } from '../../integrations/serialize/serialize.interface';
import { EXCEPTION_CODE } from '../../constants/exception.code';
import { DraftsService } from '../../drafts/services/drafts.service';
import { PostsService } from '../../posts/services/posts.service';
import { TagsService } from '../../tags/services/tags.service';

@Injectable()
export class WidgetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly draft: DraftsService,
    private readonly post: PostsService,
    private readonly tags: TagsService,
  ) {}

  /**
   * @description 작성 페이지에서 왼쪽에 노출될 위젯에 대한 카운트 조회
   * @param {SerializeUser} user 사용자 정보
   */
  async getLeftSidePostCount(user: SerializeUser) {
    const now = new Date();

    const [submitted, draft, published] = await Promise.all([
      this.prisma.post.count({
        where: {
          fk_user_id: user.id,
          deletedAt: {
            equals: null,
          },
          OR: [
            {
              PostConfig: {
                publishedAt: {
                  not: null,
                  gte: now,
                },
                isDraft: false,
              },
            },
            {
              PostConfig: {
                publishedAt: {
                  equals: null,
                  gte: now,
                },
                isDraft: false,
              },
            },
            {
              PostConfig: {
                publishedAt: {
                  not: null,
                  gte: now,
                },
                isDraft: true,
              },
            },
          ],
        },
      }),
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
    ]);

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        submitted,
        draft,
        published,
      },
    };
  }

  /**
   * @description 메인 레이아웃 위젯 데이터 조회
   * @param {SerializeUser?} user 사용자 정보
   */
  async getMainLayoutWidgets(user?: SerializeUser) {
    if (user) {
      const [trending, draft, bookmark] = await Promise.all([
        this.post.getTrendingArticles({
          duration: 7,
          pageNo: 1,
          limit: 6,
        }),
        this.draft.list(user, {
          pageNo: 1,
          limit: 5,
        }),
        this.post.getBookmarks(user, {
          pageNo: 1,
          limit: 2,
        }),
      ]);

      return {
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        error: null,
        result: {
          draft: pick(draft.result, ['totalCount', 'list']),
          trending: pick(trending.result, ['totalCount', 'list']),
          bookmark: pick(bookmark.result, ['totalCount', 'list']),
        },
      };
    }

    const trending = await this.post.getTrendingArticles({
      duration: 7,
      pageNo: 1,
      limit: 6,
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        draft: {
          totalCount: 0,
          list: [],
        },
        trending: pick(trending.result, ['totalCount', 'list']),
        bookmark: {
          totalCount: 0,
          list: [],
        },
      },
    };
  }
}
