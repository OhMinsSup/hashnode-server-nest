import { Injectable } from '@nestjs/common';
import { PrismaService } from '../modules/database/prisma.service';
import { EXCEPTION_CODE } from '../constants/exception.code';
import { isEmpty } from '../libs/assertion';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

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
}
