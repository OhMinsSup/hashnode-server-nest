import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/database/prisma.service';
import { SerializeUser } from '../../integrations/serialize/serialize.interface';
import { EXCEPTION_CODE } from '../../constants/exception.code';

@Injectable()
export class WidgetsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description 작성 페이지에서 왼쪽에 노출될 위젯에 대한 카운트 조회
   * @param {SerializeUser} user 사용자 정보
   */
  async getLeftSidePostCount(user: SerializeUser) {
    const [submitted, draft, published] = await Promise.all([
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
}
