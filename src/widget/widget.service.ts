import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User, UserProfile } from '@prisma/client';
import { AuthUserSchema } from 'src/libs/get-user.decorator';
import { EXCEPTION_CODE } from '../constants/exception.code';
import { PrismaService } from '../modules/database/prisma.service';
import { GetArticleCirclesRequestDto } from './dto/article-circles.request.dto';

export interface ArticleCirclesSchema {
  id: User['id'];
  username: User['username'];
  email: User['email'];
  name: UserProfile['name'];
  bio: UserProfile['bio'];
  avatarUrl: UserProfile['avatarUrl'];
  location: UserProfile['location'];
  website: UserProfile['website'];
  availableText: UserProfile['availableText'];
  post_count: number;
  total_likes: number;
  latest_post_id: number;
  latest_post_title: string;
  latest_post_date: Date;
}

@Injectable()
export class WidgetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * @description 북마크 리스트
   * @param {AuthUserSchema} user
   */
  async getWidgetBookmarks(user: AuthUserSchema) {
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
      select: {
        post: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: posts.map((post) => ({
        ...post.post,
      })),
    };
  }

  /**
   * @description 회원 목록 리스트
   * @param {GetArticleCirclesRequestDto} query
   */
  async getArticleCircles(_: GetArticleCirclesRequestDto) {
    // hows the user who created the most posts and received the most likes from among the users.
    const users: ArticleCirclesSchema[] = await this.prisma.$queryRaw`
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
            location: user.location,
            website: user.website,
            availableText: user.availableText,
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
