import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/database/prisma.service';
import { PostsService } from '../../posts/services/posts.service';
import { SerializeService } from '../../integrations/serialize/serialize.service';
import { isEqual } from 'lodash';

// constants
import { EXCEPTION_CODE } from '../../constants/exception.code';
import { POSTS_SELECT } from '../../modules/database/select/post.select';
import { USER_SELECT } from '../../auth/select/user.select';

// utils
import { isEmpty, isString } from '../../libs/assertion';
import { MyPostListQuery, UserListQuery } from '../input/list.query';
import { assertUsernameExists } from '../../errors/username-exists.error';
import { getSlug } from '../../libs/utils';
import { assertNotFound } from '../../errors/not-found.error';

import type { Response } from 'express';
import type { UpdateUserBody } from '../input/update.input';
import type { Prisma } from '@prisma/client';
import type { UserWithInfo } from '../../modules/database/prisma.interface';
import type { UserFollowBody } from '../input/follow.input';
import type { EnvironmentService } from 'src/integrations/environment/environment.service';

@Injectable()
export class UserService {
  constructor(
    private readonly env: EnvironmentService,
    private readonly prisma: PrismaService,
    private readonly posts: PostsService,
    private readonly serialize: SerializeService,
  ) {}

  /**
   * @description 포스트를 작성한 유저만 조회 가능한 포스트 상세 정보
   * @param {UserWithInfo} user
   * @param {string} postId */
  async getOwnerPostById(user: UserWithInfo, postId: string) {
    return this.posts.getOwnerPostById(user, postId);
  }

  /**
   * @description 유저가 작성한 포스트 리스트
   * @param {UserWithInfo} userId 유저 정보
   * @param {MyPostListQuery} param 쿼리 */
  async getUserPosts(userId: string, { cursor, limit }: MyPostListQuery) {
    const { result } = await this.getUserInfoById(userId);
    // @ts-ignore - result가 UserWithInfo 타입이 아닌 경우
    return this.getMyPosts(result, { cursor, limit });
  }

  /**
   * @description 유저명으로 유저 정보를 가져온다.
   * @param {string} userId 유저명 */
  async getUserInfoById(userId: string) {
    const data = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        userProfile: {
          select: {
            nickname: true,
            tagline: true,
            username: true,
            location: true,
            bio: true,
            availableText: true,
          },
        },
        userSocial: {
          select: {
            github: true,
            twitter: true,
            facebook: true,
            instagram: true,
            website: true,
          },
        },
        userImage: {
          select: {
            avatarUrl: true,
          },
        },
        userTags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: this.serialize.getUser(data),
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
      result: this.serialize.getUser(user),
    };
  }

  /**
   * @description 유저 정보를 업데이트한다.
   * @param {UserWithInfo} user 유저 정보
   * @param {UpdateBody} input 업데이트 정보
   */
  async update(user: UserWithInfo, input: UpdateUserBody) {
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
        Prisma.UserSocialUpdateInput,
        Prisma.UserSocialUncheckedUpdateInput
      >;

      const newImage = {} as Prisma.XOR<
        Prisma.UserImageUpdateInput,
        Prisma.UserImageUncheckedUpdateInput
      >;

      if (
        input.username &&
        !isEqual(input.username, user.userProfile.username)
      ) {
        const exists = await tx.userProfile.findUnique({
          where: {
            username: input.username,
          },
        });

        assertUsernameExists(!!exists, {
          resultCode: EXCEPTION_CODE.NOT_EXIST,
          message: '이미 사용중인 아이디입니다.',
          error: 'username',
          result: null,
        });

        newProfileData.username = input.username;
      }

      if (
        input.nickname &&
        !isEqual(input.nickname, user.userProfile.nickname)
      ) {
        newProfileData.nickname = input.nickname;
      }

      if (input.tagline && !isEqual(input.tagline, user.userProfile.tagline)) {
        newProfileData.tagline = input.tagline;
      }

      if (
        input.location &&
        !isEqual(input.location, user.userProfile.location)
      ) {
        newProfileData.location = input.location;
      }

      if (input.bio && !isEqual(input.bio, user.userProfile.bio)) {
        newProfileData.bio = input.bio;
      }

      if (
        input.availableText &&
        !isEqual(input.availableText, user.userProfile.availableText)
      ) {
        newProfileData.availableText = input.availableText;
      }

      if (input.socials && Object.keys(input.socials).length > 0) {
        for (const [key, value] of Object.entries(input.socials)) {
          if (value !== user.userSocial[key]) {
            newSocialData[key] = value;
          }
        }
      }

      if (!isEmpty(input.skills) && input.skills) {
        const tags = input.skills ?? [];
        const currents = user.userTags?.map((skill) => skill.tag) ?? [];

        // 기존 태그와 새로운 태그를 비교하여 삭제할 태그와 추가할 태그를 구분
        const deleteds = currents.filter((tag) => !tags.includes(tag.name));
        const addeds = tags.filter(
          (tag) => !currents.map((tag) => tag.name).includes(tag),
        );

        // 삭제할 태그가 존재하는 경우
        if (!isEmpty(deleteds)) {
          await tx.userTags.deleteMany({
            where: {
              fk_user_id: user.id,
              fk_tag_id: {
                in: deleteds.map((tag) => tag.id),
              },
            },
          });
        }

        // 추가할 태그가 존재하는 경우
        if (!isEmpty(addeds)) {
          const fn1 = () => {
            return addeds.map(async (tag) => {
              const newTag = getSlug(tag);
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
                    tagStats: {
                      create: {},
                    },
                  },
                });
              }
              return tagData;
            });
          };

          const tags = await Promise.all(fn1());

          const fn2 = () => {
            return tags.map((tag) =>
              tx.userTags.create({
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
            );
          };

          await Promise.all(fn2());
        }
      }

      if (input.image && input.image.id && input.image.url) {
        const file = await tx.file.findUnique({
          where: {
            id: input.image.id,
          },
        });

        if (file) {
          if (user.userImage && user.userImage.avatarUrl) {
            if (!isEqual(input.image.url, user.userImage.avatarUrl)) {
              newImage.cfId = file.cfId;
              newImage.filename = file.filename;
              newImage.mimeType = file.mimeType;
              newImage.avatarUrl = input.image.url;
            }
          } else {
            newImage.cfId = file.cfId;
            newImage.filename = file.filename;
            newImage.mimeType = file.mimeType;
            newImage.avatarUrl = input.image.url;
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
            fk_user_id: user.id,
          },
          data: newProfileData,
        });
      }

      if (!isEmpty(newSocialData)) {
        await tx.userSocial.update({
          where: {
            fk_user_id: user.id,
          },
          data: newSocialData,
        });
      }

      if (!isEmpty(newImage)) {
        const image = await tx.userImage.findFirst({
          where: {
            fk_user_id: user.id,
          },
        });

        if (image) {
          await tx.userImage.update({
            where: {
              fk_user_id: user.id,
            },
            data: newImage,
          });
        } else {
          await tx.userImage.create({
            data: {
              ...(newImage as Prisma.UserImageUncheckedCreateInput),
              fk_user_id: user.id,
            },
          });
        }
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
   * @description 유저를 팔로우 및 팔로우 해제한다.
   * @param {UserWithInfo} user 유저 정보
   * @param {UserFollowBody} input 쿼리 파라미터
   */
  async follow(user: UserWithInfo, input: UserFollowBody) {
    const userInfo = await this.prisma.user.findUnique({
      where: {
        id: input.userId,
      },
    });

    assertNotFound(!userInfo, {
      resultCode: EXCEPTION_CODE.NOT_EXIST,
      message: '존재하지 않는 사용자입니다.',
      error: 'userId',
      result: null,
    });

    const followData = await this.prisma.followUser.findFirst({
      where: {
        fk_follower_user_id: user.id,
        fk_following_user_id: input.userId,
      },
    });

    const isFollow = !isEmpty(followData);

    if (isFollow) {
      await this.prisma.followUser.delete({
        where: {
          id: followData.id,
        },
      });

      return {
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        error: null,
        result: this.serialize.getFollow({
          type: 'unfollow',
          dataId: input.userId,
        }),
      };
    }

    await this.prisma.followUser.create({
      data: {
        follower: {
          connect: {
            id: user.id,
          },
        },
        following: {
          connect: {
            id: input.userId,
          },
        },
      },
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: this.serialize.getFollow({
        type: 'follow',
        dataId: input.userId,
      }),
    };
  }

  /**
   * @description 유저를 삭제한다.
   * @param {UserWithInfo} user 유저 정보
   */
  async softDelete(user: UserWithInfo, res: Response) {
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
   * @param {MyPostListQuery} params 쿼리 파라미터 */
  async getMyPosts(
    user: UserWithInfo,
    { cursor, limit, keyword, isDeleted }: MyPostListQuery,
  ) {
    if (isString(limit)) {
      limit = Number(limit);
    }

    const [totalCount, list] = await Promise.all([
      this.prisma.post.count({
        where: {
          isDeleted: isDeleted ?? undefined,
          fk_user_id: user.id,
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
          fk_user_id: user.id,
          ...(keyword &&
            !isEmpty(keyword) && {
              title: {
                contains: keyword,
              },
            }),
        },
        select: POSTS_SELECT,
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
            fk_user_id: user.id,
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
    const tags = await this.prisma.tagFollow.findMany({
      where: {
        fk_user_id: user.id,
      },
      select: {
        tag: {
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
            _count: {
              select: {
                postTags: true,
              },
            },
          },
        },
      },
    });
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: this.serialize.getFollowTags(tags),
    };
  }

  /**
   * @description 유저 리스트 조회
   * @param {UserListQuery} query
   * @param {UserWithInfo?} user
   */
  async list(query: UserListQuery, user?: UserWithInfo) {
    let result = undefined;
    switch (query.type) {
      // case 'trending':
      // result = await this._getTrendingItems(query);
      // break;
      default:
        result = await this._getItems(query, user);
        break;
    }

    const { list, totalCount, endCursor, hasNextPage } = result;

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        list,
        totalCount,
        pageInfo: {
          endCursor: hasNextPage ? endCursor : null,
          hasNextPage,
        },
      },
    };
  }

  /**
   * @description 유저 리스트 조회 (기본)
   * @param {UserListQuery} query
   * @param {UserWithInfo?} user
   */
  private async _getItems(
    { limit, category, cursor, name }: UserListQuery,
    user?: UserWithInfo,
  ) {
    const { time } = this._getCategoryTime(category);

    if (isString(limit)) {
      limit = Number(limit);
    }

    // 내가 좋아요한 게시물 목록
    const [totalCount, list] = await Promise.all([
      this.prisma.user.count({
        where: {
          createdAt: time
            ? {
                gte: time,
              }
            : undefined,
          ...(name && {
            username: {
              contains: name,
            },
          }),
          ...(user && {
            id: {
              not: user.id,
            },
          }),
        },
      }),
      this.prisma.user.findMany({
        orderBy: [
          {
            id: 'desc',
          },
        ],
        where: {
          createdAt: time
            ? {
                gte: time,
              }
            : undefined,
          ...(name && {
            username: {
              contains: name,
            },
          }),
          id: cursor
            ? {
                lt: cursor,
                not: user?.id ?? undefined,
              }
            : {
                not: user?.id ?? undefined,
              },
        },
        select: {
          ...USER_SELECT,
          following: {
            select: {
              id: true,
            },
            where: {
              fk_follower_user_id: user?.id ?? undefined,
            },
            take: 1,
          },
        },
        take: limit,
      }),
    ]);

    const endCursor = list.at(-1)?.id ?? null;
    const hasNextPage = endCursor
      ? (await this.prisma.user.count({
          where: {
            id: {
              not: user?.id ?? undefined,
              lt: endCursor,
            },
            createdAt: time
              ? {
                  gte: time,
                }
              : undefined,
            ...(name && {
              username: {
                contains: name,
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
      totalCount,
      list: this.serialize.getUsers(list),
      endCursor,
      hasNextPage,
    };
  }

  // private async _getTrendingItems({
  //   limit,
  //   // category,
  //   cursor
  //   // name,
  // }: UserListQuery) {
  //   // const { time } = this._getCategoryTime(category);

  //   if (isString(limit)) {
  //     limit = Number(limit);
  //   }

  //   // 포스트 랭킹 점수가 높은 포스트를 가진 상위 3명의 유저
  //   const rawData = await this.prisma.$queryRaw`
  //   SELECT
  //       users.id AS user_id,
  //       users.email,
  //       posts.id AS post_id,
  //       posts.title,
  //       posts.content,
  //       post_stats.score
  //     FROM
  //       users
  //       INNER JOIN posts ON users.id = posts.fk_user_id
  //       INNER JOIN post_stats ON posts.id = post_stats.fk_post_id
  //     WHERE
  //       posts.isDeleted = false
  //       -- AND posts.createdAt >= DATE_SUB(NOW(), INTERVAL 1 WEEK) -- 일주일 기준
  //       -- AND posts.createdAt >= DATE_SUB(NOW(), INTERVAL 1 MONTH) -- 한달 기준
  //       -- AND posts.createdAt >= DATE_SUB(NOW(), INTERVAL 1 YEAR) -- 1년 기준
  //     ORDER BY
  //       post_stats.score DESC;
  //     -- LIMIT
  //     --   ${limit};
  //     -- OFFSET
  //     --   ${cursor ?? 0};
  //   `;

  //   console.log(rawData);

  //   return {
  //     totalCount: 0,
  //     list: [],
  //     endCursor: null,
  //     hasNextPage: false,
  //   };
  // }

  private _getCategoryTime(category: string) {
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
    return {
      time,
      category,
    };
  }

  // /**
  //  * @description 포스트 랭킹 점수가 높은 포스트를 가진 상위 3명의 유저
  //  */
  // async getUserTrendings({ category }: any) {
  //   let time: Date | null;
  //   switch (category) {
  //     case 'week':
  //       time = new Date();
  //       time.setDate(time.getDate() - 7);
  //       break;
  //     case 'month':
  //       time = new Date();
  //       time.setMonth(time.getMonth() - 1);
  //       break;
  //     case 'year':
  //       time = new Date();
  //       time.setFullYear(time.getFullYear() - 1);
  //       break;
  //     default:
  //       time = null;
  //       break;
  //   }

  //   const rawData: Awaited<any[]> = await this.prisma.$queryRaw`
  //   SELECT u.id, u.email, u.username, up.createdAt, up.avatarUrl, GROUP_CONCAT(p.id || '|' || p.title || '|' || p.createdAt) AS posts
  //   FROM User u
  //   INNER JOIN (
  //     SELECT p1.userId, p1.id AS fk_post_id
  //     FROM (
  //       SELECT p.userId, p.id, ps.score,
  //         ROW_NUMBER() OVER (PARTITION BY p.userId ORDER BY ps.score DESC) AS rank
  //       FROM Post p
  //       INNER JOIN post_stats ps ON p.id = ps.fk_post_id
  //       WHERE ps.score >= 0 -- 원하는 랭킹 점수로 변경해주세요
  //     ) p1
  //     WHERE p1.rank <= 3 -- 원하는 상위 랭킹 개수로 변경해주세요
  //   ) topPosts ON u.id = topPosts.userId
  //   INNER JOIN Post p ON p.id = topPosts.postId
  //   LEFT JOIN UserProfile up ON up.userId = u.id
  //   WHERE u.createdAt >= ${time ? time.getTime() : 0}
  //   GROUP BY u.id, up.id
  //   ORDER BY u.createdAt DESC -- 원하는 정렬 기준으로 변경해주세요
  //   LIMIT 50;
  //   `;

  //   const users: any[] = [];
  //   for (const user of rawData) {
  //     const posts = user.posts.split(',');
  //     const serializedPosts: any['posts'][0][] = [];
  //     for (const post of posts) {
  //       const [id, title, createdAt] = post.split('|');
  //       serializedPosts.push({
  //         id: id,
  //         title,
  //         createdAt: Number(createdAt),
  //       });
  //     }
  //     users.push({
  //       id: user.id,
  //       email: user.email,
  //       username: user.username,
  //       avatarUrl: user.avatarUrl,
  //       posts: serializedPosts,
  //     });
  //   }

  //   // 작성한 포스트의 ranking이 높은 유저 50명에 대한 정보를 가져온다.
  //   return {
  //     resultCode: EXCEPTION_CODE.OK,
  //     message: null,
  //     error: null,
  //     result: users,
  //   };
  // }

  /**
   * @description 쿠키 제거
   * @param {Response} res 응답 객체
   */
  private clearCookies(res: Response) {
    const { name } = this.env.generateCookie();
    res.clearCookie(name);
  }
}
