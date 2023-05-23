import { Injectable } from '@nestjs/common';
import { PrismaService } from '../modules/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PostsService } from '../posts/posts.service';

// constants
import { EXCEPTION_CODE } from '../constants/exception.code';

// utils
import { isEmpty, isString } from '../libs/assertion';
import { escapeForUrl } from '../libs/utils';
import { MyPostListQuery, TrendingUsersQuery } from './dto/list';
import { DEFAULT_POSTS_SELECT } from '../modules/database/select/post.select';

import type { Response } from 'express';
import type { UpdateBody } from './dto/update';
import type { Post, Prisma } from '@prisma/client';
import {
  DEFAULT_USER_SELECT,
  UserWithInfo,
  USER_FOLLOW_TAGS_SELECT,
} from '../modules/database/select/user.select';

type RawTrendingUsers = {
  id: number;
  email: string;
  username: string;
  avatarUrl: string | null;
  posts: string;
};

type TransformedTrendingUsers = Omit<RawTrendingUsers, 'posts'> & {
  posts: Array<Pick<Post, 'id' | 'title'> & { createdAt: number }>;
};

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly posts: PostsService,
  ) {}

  /**
   * @description 유저가 작성한 포스트 리스트
   * @param {UserWithInfo} user 유저 정보
   * @param {MyPostListQuery} param 쿼리
   */
  async getUserPosts(username: string, { cursor, limit }: MyPostListQuery) {
    const { result } = await this.getUserInfoByUsername(username);
    return this.myPosts(result, { cursor, limit });
  }

  /**
   * @description 유저명으로 유저 정보를 가져온다.
   * @param {string} username 유저명
   */
  async getUserInfoByUsername(username: string) {
    const data = await this.prisma.user.findFirst({
      where: {
        username,
      },
      select: DEFAULT_USER_SELECT,
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: data,
    };
  }

  /**
   * @description 유저 정보를 가져온다.
   * @param {UserWithInfo} user 유저 정보
   */
  getUserInfo(user: UserWithInfo) {
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: user,
    };
  }

  /**
   * @description 유저 정보를 업데이트한다.
   * @param {UserWithInfo} user 유저 정보
   * @param {UpdateBody} input 업데이트 정보
   */
  async update(user: UserWithInfo, input: UpdateBody) {
    return this.prisma.$transaction(async (tx) => {
      const newData = {} as Prisma.XOR<
        Prisma.UserUpdateInput,
        Prisma.UserUncheckedUpdateInput
      >;

      const newProfileData = {} as Prisma.XOR<
        Prisma.UserProfileUpdateInput,
        Prisma.UserProfileUncheckedUpdateInput
      >;

      const newSocialData = {} as Prisma.XOR<
        Prisma.UserSocialsUpdateInput,
        Prisma.UserSocialsUncheckedUpdateInput
      >;

      if (input.username && input.username !== user.username) {
        newData.username = input.username;
      }

      if (input.email && input.email !== user.email) {
        newData.email = input.email;
      }

      if (input.name && input.name !== user.profile.name) {
        newProfileData.name = input.name;
      }

      if (input.tagline && input.tagline !== user.profile.tagline) {
        newProfileData.tagline = input.tagline;
      }

      if (input.avatarUrl && input.avatarUrl !== user.profile.avatarUrl) {
        newProfileData.avatarUrl = input.avatarUrl;
      }

      if (input.location && input.location !== user.profile.location) {
        newProfileData.location = input.location;
      }

      if (input.bio && input.bio !== user.profile.bio) {
        newProfileData.bio = input.bio;
      }

      if (
        input.availableText &&
        input.availableText !== user.profile.availableText
      ) {
        newProfileData.availableText = input.availableText;
      }

      if (!isEmpty(input.skills) && input.skills) {
        const next_tags = input.skills ?? [];
        const current_tags = user.skills?.map((skill) => skill.tag) ?? [];
        // 기존 태그와 새로운 태그를 비교하여 삭제할 태그와 추가할 태그를 구분
        const deleted_tags = current_tags.filter(
          (tag) => !next_tags.includes(tag.name),
        );
        const added_tags = next_tags.filter(
          (tag) => !current_tags.map((tag) => tag.name).includes(tag),
        );

        // 삭제할 태그가 존재하는 경우
        if (deleted_tags.length > 0) {
          await Promise.all(
            deleted_tags.map((tag) =>
              tx.usersTags.delete({
                where: {
                  userId_tagId: {
                    userId: user.id,
                    tagId: tag.id,
                  },
                },
              }),
            ),
          );
        }

        // 추가할 태그가 존재하는 경우
        if (added_tags.length > 0) {
          const tags = await Promise.all(
            added_tags.map(async (tag) => {
              const newTag = escapeForUrl(tag);
              // 태그 정보가 이미 존재하는지 체크
              const tagData = await tx.tag.findFirst({
                where: {
                  name: newTag,
                },
              });
              // 없으면 새롭게 생성하고 있으면 기존 데이터를 사용
              if (!tagData) {
                return tx.tag.create({
                  data: {
                    name: newTag,
                  },
                });
              }
              return tagData;
            }),
          );

          await Promise.all(
            tags.map((tag) =>
              tx.usersTags.create({
                data: {
                  user: {
                    connect: {
                      id: user.id,
                    },
                  },
                  tag: {
                    connect: {
                      id: tag.id,
                    },
                  },
                },
              }),
            ),
          );
        }
      }

      if (input.socials && Object.keys(input.socials).length > 0) {
        for (const [key, value] of Object.entries(input.socials)) {
          if (value !== user.socials[key]) {
            newSocialData[key] = value;
          }
        }
      }

      if (!isEmpty(newData)) {
        await tx.user.update({
          where: {
            id: user.id,
          },
          data: newData,
        });
      }

      if (!isEmpty(newProfileData)) {
        await tx.userProfile.update({
          where: {
            userId: user.id,
          },
          data: newProfileData,
        });
      }

      if (!isEmpty(newSocialData)) {
        await tx.userSocials.update({
          where: {
            userId: user.id,
          },
          data: newSocialData,
        });
      }

      return {
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        error: null,
        result: null,
      };
    });
  }

  /**
   * @description 유저를 삭제한다.
   * @param {UserWithInfo} user 유저 정보
   */
  async delete(user: UserWithInfo, res: Response) {
    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      this.clearCookies(res);

      return {
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        error: null,
        result: null,
      };
    });
  }

  /**
   * @description 유저의 포스트 리스트를 가져온다.
   * @param {UserWithInfo} user 유저 정보
   * @param {MyPostListQuery} params 쿼리 파라미터
   */
  async myPosts(
    user: UserWithInfo,
    { cursor, limit, keyword, isDeleted }: MyPostListQuery,
  ) {
    if (isString(cursor)) {
      cursor = Number(cursor);
    }

    if (isString(limit)) {
      limit = Number(limit);
    }

    const [totalCount, list] = await Promise.all([
      this.prisma.post.count({
        where: {
          isDeleted: isDeleted ?? undefined,
          userId: user.id,
          ...(keyword &&
            !isEmpty(keyword) && {
              title: {
                contains: keyword,
              },
            }),
        },
      }),
      this.prisma.post.findMany({
        orderBy: [
          {
            id: 'desc',
          },
        ],
        where: {
          id: cursor
            ? {
                lt: cursor,
              }
            : undefined,
          isDeleted: isDeleted ?? undefined,
          userId: user.id,
          ...(keyword &&
            !isEmpty(keyword) && {
              title: {
                contains: keyword,
              },
            }),
        },
        select: DEFAULT_POSTS_SELECT,
        take: limit,
      }),
    ]);

    const endCursor = list.at(-1)?.id ?? null;
    const hasNextPage = endCursor
      ? (await this.prisma.post.count({
          where: {
            id: {
              lt: endCursor,
            },
            isDeleted: isDeleted ?? undefined,
            userId: user.id,
            ...(keyword &&
              !isEmpty(keyword) && {
                title: {
                  contains: keyword,
                },
              }),
          },
          orderBy: [
            {
              id: 'desc',
            },
          ],
        })) > 0
      : false;

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        list: this.posts._serializes(list),
        totalCount,
        pageInfo: {
          endCursor: hasNextPage ? endCursor : null,
          hasNextPage,
        },
      },
    };
  }

  /**
   * @description 유저가 팔로우한 태그 리스트를 가져온다.
   * @param {UserWithInfo} user 유저 정보
   */
  async getFollowTags(user: UserWithInfo) {
    const tags = await this.prisma.tagFollowing.findMany({
      where: {
        userId: user.id,
      },
      select: USER_FOLLOW_TAGS_SELECT,
    });
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: tags.map(this._serializeFollowTag),
    };
  }

  /**
   * @description 포스트 랭킹 점수가 높은 포스트를 가진 상위 3명의 유저
   */
  async getUserTrendings({ category }: TrendingUsersQuery) {
    let time: Date | null;
    switch (category) {
      case 'week':
        time = new Date();
        time.setDate(time.getDate() - 7);
        break;
      case 'month':
        time = new Date();
        time.setMonth(time.getMonth() - 1);
        break;
      case 'year':
        time = new Date();
        time.setFullYear(time.getFullYear() - 1);
        break;
      default:
        time = null;
        break;
    }

    const rawData: Awaited<RawTrendingUsers[]> = await this.prisma.$queryRaw`
    SELECT u.id, u.email, u.username, up.createdAt, up.avatarUrl, GROUP_CONCAT(p.id || '|' || p.title || '|' || p.createdAt) AS posts
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
    WHERE u.createdAt >= ${time ? time.getTime() : 0}
    GROUP BY u.id, up.id
    ORDER BY u.createdAt DESC -- 원하는 정렬 기준으로 변경해주세요
    LIMIT 50;
    `;

    const users: TransformedTrendingUsers[] = [];
    for (const user of rawData) {
      const posts = user.posts.split(',');
      const serializedPosts: TransformedTrendingUsers['posts'][0][] = [];
      for (const post of posts) {
        const [id, title, createdAt] = post.split('|');
        serializedPosts.push({
          id: Number(id),
          title,
          createdAt: Number(createdAt),
        });
      }
      users.push({
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        posts: serializedPosts,
      });
    }

    // 작성한 포스트의 ranking이 높은 유저 50명에 대한 정보를 가져온다.
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: users,
    };
  }

  /**
   * @description 로그아웃
   * @param {Response} res 응답 객체
   */
  async logout(res: Response) {
    this.clearCookies(res);
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: null,
    };
  }

  /**
   * @description 쿠키 제거
   * @param {Response} res 응답 객체
   */
  private clearCookies(res: Response) {
    res.clearCookie(this.config.get('COOKIE_TOKEN_NAME'), {
      httpOnly: true,
      domain: this.config.get('COOKIE_DOMAIN'),
      path: this.config.get('COOKIE_PATH'),
      sameSite: this.config.get('COOKIE_SAMESITE'),
    });
  }

  private _serializeFollowTag(data: any) {
    return {
      id: data?.tag?.id,
      name: data?.tag?.name,
      description: data?.tag?.description,
      image: data?.tag?.image,
      count: {
        posts: data?.tag?._count?.postsTags ?? 0,
      },
      createdAt: data?.tag?.createdAt,
    };
  }
}
