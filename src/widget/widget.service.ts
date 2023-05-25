import { Injectable } from '@nestjs/common';

// constants
import { EXCEPTION_CODE } from '../constants/exception.code';

// service
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../modules/database/prisma.service';

// dto
import { GetArticleCirclesQuery } from './dto/article-circles';

// select
import { USER_POSTS_BOOKMARKS_SELECT } from '../modules/database/select/post.select';
import { WidgetArticleCirclesRawQuery } from '../modules/database/ts/widget';

// types
import type { UserWithInfo } from '../modules/database/select/user.select';

@Injectable()
export class WidgetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * @description 북마크 리스트
   * @param {UserWithInfo?} user
   */
  async getWidgetBookmarks(user?: UserWithInfo) {
    if (!user) {
      return {
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        error: null,
        result: [],
      };
    }

    const posts = await this.prisma.postLike.findMany({
      where: {
        userId: user.id,
        post: {
          isDeleted: false,
          publishingDate: {
            lte: new Date(),
          },
        },
      },
      select: USER_POSTS_BOOKMARKS_SELECT,
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: posts.map((post) => post.post),
    };
  }

  /**
   * @description 회원 목록 리스트
   * @param {GetArticleCirclesQuery} query
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getArticleCircles(query: GetArticleCirclesQuery) {
    // hows the user who created the most posts and received the most likes from among the users.
    const users: WidgetArticleCirclesRawQuery[] = await this.prisma.$queryRaw`
        SELECT
    u.id,
    u.username,
    u.email,
    up.name,
    up.bio,
    up.avatarUrl,
    up.location,
    up.availableText,
    COUNT( p.id ) AS post_count,
    SUM( pl.likes ) AS total_likes,
    mp.id AS latest_post_id,
    mp.title AS latest_post_title,
    mp.createdAt AS latest_post_date
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
    WHERE
      isDeleted = false
      AND publishingDate <= datetime('now')
    GROUP BY
      userId 
    ) lp ON u.id = lp.userId
    JOIN Post mp ON lp.userId = mp.userId 
    AND lp.latest_post_date = mp.createdAt
    AND mp.isDeleted = false
    AND mp.publishingDate <= datetime('now')
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
        circles: users.map((user) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          profile: {
            name: user.name,
            bio: user.bio,
            avatarUrl: user.avatarUrl,
            tagline: user.tagline,
          },
          count: {
            postLike: user.post_count,
          },
          lastPost: {
            id: user.latest_post_id,
            title: user.latest_post_title,
            createdAt: user.latest_post_date,
          },
        })),
      },
    };
  }
}
