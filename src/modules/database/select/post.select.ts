import { Prisma } from '@prisma/client';

export const USER_POSTS_BOOKMARKS_SELECT =
  Prisma.validator<Prisma.PostLikeSelect>()({
    post: {
      select: {
        id: true,
        title: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    },
  });
