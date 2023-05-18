import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EXCEPTION_CODE } from 'src/constants/exception.code';
import { PrismaService } from '../modules/database/prisma.service';

@Injectable()
export class ExploreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * @description 탐색 페이지 - 블로그 탐색 (유저 탐색)
   */
  async explorBlogs() {
    const users = await this.prisma.$queryRaw`
    SELECT u.*, up.*, p.*
    FROM User u
    INNER JOIN (
    SELECT p1.userId, p1.id AS postId
    FROM (
        SELECT p.userId, p.id, ps.score,
        ROW_NUMBER() OVER (PARTITION BY p.userId ORDER BY ps.score DESC) AS rank
        FROM Post p
        INNER JOIN PostStats ps ON p.id = ps.postId
        WHERE ps.score >= 0 -- 원하는 랭킹 점수로 변경해주세요
    ) p1
    WHERE p1.rank <= 3 -- 원하는 상위 랭킹 개수로 변경해주세요
    ) topPosts ON u.id = topPosts.userId
    INNER JOIN Post p ON p.id = topPosts.postId
    LEFT JOIN UserProfile up ON up.userId = u.id
    ORDER BY u.createdAt DESC -- 원하는 정렬 기준으로 변경해주세요
    LIMIT 50;
    `;
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: users,
    };
  }
}
