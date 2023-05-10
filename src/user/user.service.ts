import { Injectable } from '@nestjs/common';
import { PrismaService } from '../modules/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PostsService } from '../posts/posts.service';

// constants
import { EXCEPTION_CODE } from '../constants/exception.code';

// utils
import { isEmpty, isString } from '../libs/assertion';
import { escapeForUrl } from '../libs/utils';
import { MyPostListQuery } from './dto/list';
import { DEFAULT_POSTS_SELECT } from '../modules/database/select/post.select';

import type { Response } from 'express';
import type { UpdateBody } from './dto/update';
import type { Prisma } from '@prisma/client';
import {
  DEFAULT_USER_SELECT,
  UserWithInfo,
} from '../modules/database/select/user.select';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly posts: PostsService,
  ) {}

  async getUserPosts(username: string, { cursor, limit }: MyPostListQuery) {
    const { result } = await this.getUserInfoByUsername(username);
    return this.myPosts(result, { cursor, limit });
  }

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

      if (input.username && input.username !== user.username) {
        newData.username = input.username;
      }

      if (input.email && input.email !== user.email) {
        newData.email = input.email;
      }

      if (input.name && input.name !== user.profile.name) {
        newData.profile.update.name = input.name;
      }

      if (input.tagline && input.tagline !== user.profile.tagline) {
        newData.profile.update.tagline = input.tagline;
      }

      if (input.avatarUrl && input.avatarUrl !== user.profile.avatarUrl) {
        newData.profile.update.avatarUrl = input.avatarUrl;
      }

      if (input.location && input.location !== user.profile.location) {
        newData.profile.update.location = input.location;
      }

      if (input.bio && input.bio !== user.profile.bio) {
        newData.profile.update.bio = input.bio;
      }

      if (
        input.availableText &&
        input.availableText !== user.profile.availableText
      ) {
        newData.profile.update.availableText = input.availableText;
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
            newData.socials.update[key] = value;
          }
        }
      }

      await tx.user.update({
        where: {
          id: user.id,
        },
        data: newData,
      });

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
      await tx.user.delete({
        where: {
          id: user.id,
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

  private clearCookies(res: Response) {
    res.clearCookie(this.config.get('COOKIE_TOKEN_NAME'), {
      httpOnly: true,
      domain: this.config.get('COOKIE_DOMAIN'),
      path: this.config.get('COOKIE_PATH'),
      sameSite: this.config.get('COOKIE_SAMESITE'),
    });
  }
}
