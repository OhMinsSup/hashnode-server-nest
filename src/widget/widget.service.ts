import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EXCEPTION_CODE } from '../constants/exception.code';
import { PrismaService } from '../modules/database/prisma.service';
import { GetArticleCirclesRequestDto } from './dto/article-circles.request.dto';

@Injectable()
export class WidgetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * @description 회원 목록 리스트
   * @param {GetArticleCirclesRequestDto} query
   */
  async getArticleCircles(_: GetArticleCirclesRequestDto) {
    // hows the user who created the most posts and received the most likes from among the users.
    const users = await this.prisma.$queryRaw`
        SELECT
    u.id,
    u.username,
    u.email,
    up.name,
    up.bio,
    up.avatarUrl,
    up.location,
    up.website,
    up.availableText,
    COUNT( p.id ) AS post_count,
    SUM( pl.likes ) AS total_likes,
    mp.id AS latest_post_id,
    mp.title AS latest_post_title,
    mp.subtitle AS latest_post_subtitle,
    mp.description AS latest_post_description 
  FROM
    User u
    JOIN UserProfile up ON u.id = up.userId
    JOIN Post p ON u.id = p.userId
    LEFT JOIN (
    SELECT
      postId,
      COUNT( * ) AS likes 
    FROM
      PostLike 
    GROUP BY
      postId 
    ) pl ON p.id = pl.postId
    JOIN (
    SELECT
      userId,
      MAX( createdAt ) AS latest_post_date 
    FROM
      Post 
    GROUP BY
      userId 
    ) lp ON u.id = lp.userId
    JOIN Post mp ON lp.userId = mp.userId 
    AND lp.latest_post_date = mp.createdAt 
  GROUP BY
    u.id
  ORDER BY
    post_count DESC,
    total_likes DESC
  LIMIT 30;
`;

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        circles: users,
      },
    };
  }
}
