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

export const DEFAULT_POSTS_SELECT = Prisma.validator<Prisma.PostSelect>()({
  id: true,
  title: true,
  subTitle: true,
  content: true,
  thumbnail: true,
  disabledComment: true,
  publishingDate: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      username: true,
      email: true,
      profile: {
        select: {
          name: true,
          avatarUrl: true,
          bio: true,
          availableText: true,
        },
      },
    },
  },
  seo: {
    select: {
      title: true,
      desc: true,
      image: true,
    },
  },
  postsTags: {
    select: {
      tag: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  _count: {
    select: {
      postLike: true,
    },
  },
});

export const POSTS_LIKES_SELECT = Prisma.validator<Prisma.PostLikeSelect>()({
  id: true,
  post: {
    select: DEFAULT_POSTS_SELECT,
  },
});

export const POSTS_STATUS_SELECT = Prisma.validator<Prisma.PostSelect>()({
  ...DEFAULT_POSTS_SELECT,
  postStats: {
    select: {
      score: true,
      likes: true,
      clicks: true,
    },
  },
});
