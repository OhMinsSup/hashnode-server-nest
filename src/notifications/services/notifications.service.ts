import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/database/prisma.service';
import { EXCEPTION_CODE } from '../../constants/exception.code';
import { isEmpty, isString } from '../../libs/assertion';
import { NotificationListQuery } from '../input/list.query';
import type { UserWithInfo } from '../../modules/database/prisma.interface';
import { NotificationReadAllQuery } from '../input/read-all.query';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description 게시글이 생성되었을 때 알림을 생성하는 코드
   * @param {string} postId 게시글 아이디 */
  async createArticles(postId: string) {
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
          postTags: {
            some: {
              fk_post_id: postId,
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
          tagFollow: {
            some: {
              fk_tag_id: {
                in: usedTags.map((tag) => tag.id),
              },
            },
          },
        },
        select: {
          id: true,
          userProfile: {
            select: {
              username: true,
            },
          },
        },
      });

      // 사용자들에게 알림을 생성한다.
      for (const user of users) {
        // 이미 생성된 알림이 있는지 확인한다.
        const notification = await this.prisma.notification.findFirst({
          where: {
            fk_post_id: postId,
            fk_user_id: user.id,
            type: 'ARTICLE',
          },
        });

        if (notification) {
          continue;
        }

        await this.prisma.notification.create({
          data: {
            fk_user_id: user.id,
            type: 'ARTICLE',
            message: `${user.userProfile.username}님이 ${post.title} 글에 관심을 보이고 있습니다.`,
            fk_post_id: postId,
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
   * @param {string} tagId */
  async createTags(tagId: string) {
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
        tagFollow: {
          some: {
            fk_tag_id: tagId,
          },
        },
      },
      select: {
        id: true,
        userProfile: {
          select: {
            username: true,
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
          fk_tag_id: tagId,
          fk_user_id: user.id,
          type: 'TAG',
        },
      });

      if (notification) {
        continue;
      }

      await this.prisma.notification.create({
        data: {
          fk_tag_id: tagId,
          fk_user_id: user.id,
          type: 'TAG',
          message: `${user.userProfile.username}님이 ${tag.name} 태그를 팔로우 하고 있습니다.`,
        },
      });
    }
  }

  /**
   * @description 알림 리스트
   * @param {UserWithInfo} user
   * @param {NotificationListQuery} query */
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
   * @param {string} id */
  async read(user: UserWithInfo, id: string) {
    await this.prisma.notification.update({
      where: {
        fk_user_id: user.id,
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
   * @param {NotificationReadAllQuery} query */
  async readAll(user: UserWithInfo, query: NotificationReadAllQuery) {
    const { type } = query;
    await this.prisma.notification.updateMany({
      where: {
        fk_user_id: user.id,
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
    if (isString(limit)) {
      limit = Number(limit);
    }

    const [totalCount, list] = await Promise.all([
      this.prisma.notification.count({
        where: {
          type,
          fk_user_id: user.id,
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
          fk_user_id: user.id,
        },
        take: limit,
        select: {
          id: true,
          type: true,
          message: true,
          read: true,
          createdAt: true,
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
            fk_user_id: user.id,
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
