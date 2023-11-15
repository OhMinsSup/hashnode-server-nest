import { Injectable } from '@nestjs/common';
import { PrismaService } from '../modules/database/prisma.service';
import { EXCEPTION_CODE } from '../constants/exception.code';
import { isEmpty, isString } from '../libs/assertion';
import { NotificationListQuery } from './dto/list';
import type { UserWithInfo } from '../modules/database/select/user.select';
import { NotificationReadAllQuery } from './dto/read.all';
import { assertUserNotFound } from 'src/errors/user-notfound.error';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description 게시글이 생성되었을 때 알림을 생성하는 코드
   * @param {number} postId 게시글 아이디
   */
  async createArticles(postId: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
        title: true,
        publishingDate: true,
        isDeleted: true,
      },
    });

    if (!post || post.isDeleted) {
      return {
        resultCode: EXCEPTION_CODE.NOT_EXIST,
        message: '게시글을 찾을 수 없습니다.',
        error: null,
        result: false,
      };
    }

    // publishDate가 없으면 알림을 생성하지 않고 현재날짜가 publishDate보다 크면 알림을 생성
    if (
      post.publishingDate &&
      new Date().getTime() < post.publishingDate.getTime()
    ) {
      // 포스트와 연관된 태그들을 가져온다.
      const usedTags = await this.prisma.tag.findMany({
        where: {
          postsTags: {
            some: {
              postId,
            },
          },
        },
        select: {
          id: true,
          name: true,
        },
      });
      // 태그를 사용한 사용자들을 가져온다.
      const users = await this.prisma.user.findMany({
        where: {
          tagFollowing: {
            some: {
              tagId: {
                in: usedTags.map((tag) => tag.id),
              },
            },
          },
        },
      });

      // 사용자들에게 알림을 생성한다.
      for (const user of users) {
        // 이미 생성된 알림이 있는지 확인한다.
        const notification = await this.prisma.notification.findFirst({
          where: {
            postId,
            userId: user.id,
            type: 'ARTICLE',
          },
        });

        if (notification) {
          continue;
        }

        await this.prisma.notification.create({
          data: {
            userId: user.id,
            type: 'ARTICLE',
            message: `${user.username}님이 ${post.title} 글에 관심을 보이고 있습니다.`,
            postId,
          },
        });
      }
      return {
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        error: null,
        result: true,
      };
    }

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: false,
    };
  }

  /**
   * @description 태그를 사용한 사용자들에게 알림을 생성한다.
   * @param {number} tagId
   */
  async createTags(tagId: number) {
    const tag = await this.prisma.tag.findUnique({
      where: {
        id: tagId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!tag) {
      return {
        resultCode: EXCEPTION_CODE.NOT_EXIST,
        message: '태그를 찾을 수 없습니다.',
        error: null,
        result: false,
      };
    }

    // 태그를 사용한 사용자들을 가져온다.
    const usingTagUsers = await this.prisma.user.findMany({
      where: {
        tagFollowing: {
          some: {
            tagId,
          },
        },
      },
    });

    if (!usingTagUsers || isEmpty(usingTagUsers)) {
      return {
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        error: null,
        result: true,
      };
    }

    for (const user of usingTagUsers) {
      // 이미 생성된 알림이 있는지 확인한다.
      const notification = await this.prisma.notification.findFirst({
        where: {
          tagId,
          userId: user.id,
          type: 'TAG',
        },
      });

      if (notification) {
        continue;
      }

      await this.prisma.notification.create({
        data: {
          tagId,
          userId: user.id,
          type: 'TAG',
          message: `${user.username}님이 ${tag.name} 태그를 팔로우 하고 있습니다.`,
        },
      });
    }
  }

  /**
   * @description 사용자가 가입하면 환영 메시지를 생성한다.
   * @param {string} userId
   */
  async createWelcome(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        userProfile: {
          select: {
            username: true,
          },
        },
      },
    });

    assertUserNotFound(!user, {
      resultCode: EXCEPTION_CODE.NOT_EXIST,
      message: '사용자를 찾을 수 없습니다.',
      error: null,
      result: false,
    });

    await this.prisma.notification.create({
      data: {
        fk_user_id: user.id,
        type: 'WELCOME',
        message: `${user.userProfile.username}님 환영합니다.`,
      },
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: true,
    };
  }

  /**
   * @description 알림 리스트
   * @param {UserWithInfo} user
   * @param {NotificationListQuery} query
   */
  async list(user: UserWithInfo, query: NotificationListQuery) {
    const { list, totalCount, hasNextPage, endCursor } = await this._getItems(
      user,
      query,
    );
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
   * @description 알림 읽기
   * @param {UserWithInfo} user
   * @param {NotificationListQuery} query
   */
  async read(user: UserWithInfo, id: number) {
    await this.prisma.notification.updateMany({
      where: {
        userId: user.id,
        id,
      },
      data: {
        read: true,
      },
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: true,
    };
  }

  /**
   * @description 알림 모두 읽기
   * @param {UserWithInfo} user
   * @param {NotificationReadAllQuery} query
   */
  async readAll(user: UserWithInfo, query: NotificationReadAllQuery) {
    const { type } = query;
    await this.prisma.notification.updateMany({
      where: {
        userId: user.id,
        type,
      },
      data: {
        read: true,
      },
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: true,
    };
  }

  async _getItems(
    user: UserWithInfo,
    { cursor, limit, type }: NotificationListQuery,
  ) {
    if (isString(cursor)) {
      cursor = Number(cursor);
    }

    if (isString(limit)) {
      limit = Number(limit);
    }

    const [totalCount, list] = await Promise.all([
      this.prisma.notification.count({
        where: {
          type,
          userId: user.id,
        },
      }),
      this.prisma.notification.findMany({
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
          type,
          userId: user.id,
        },
        take: limit,
        select: {
          id: true,
          type: true,
          message: true,
          read: true,
          createdAt: true,
          ...(type === 'comments' && {
            comment: true,
          }),
          ...(type === 'likes' && {
            like: {
              select: {
                post: true,
              },
            },
          }),
          ...(type === 'articles' && {
            post: true,
          }),
        },
      }),
    ]);

    const endCursor = list.at(-1)?.id ?? null;
    const hasNextPage = endCursor
      ? (await this.prisma.notification.count({
          where: {
            id: {
              lt: endCursor,
            },
            type,
            userId: user.id,
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
      list,
      endCursor,
      hasNextPage,
    };
  }
}
