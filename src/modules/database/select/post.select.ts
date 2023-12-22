import { Prisma } from '@prisma/client';

export const POSTS_SELECT = Prisma.validator<Prisma.PostSelect>()({
  id: true,
  title: true,
  subTitle: true,
  content: true,
  disabledComment: true,
  publishingDate: true,
  isDraft: true,
  createdAt: true,
  updatedAt: true,
  user: {
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
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  },
  postImage: {
    select: {
      file: {
        select: {
          id: true,
          publicUrl: true,
        },
      },
    },
  },
  postSeo: {
    select: {
      title: true,
      desc: true,
      file: {
        select: {
          id: true,
          publicUrl: true,
        },
      },
    },
  },
  postTags: {
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

export const POSTS_SELECT_SIMPLE = Prisma.validator<Prisma.PostSelect>()({
  id: true,
  title: true,
  subTitle: true,
  content: true,
  disabledComment: true,
  publishingDate: true,
  isDraft: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
    },
  },
  postImage: {
    select: {
      id: true,
      fk_file_id: true,
      fk_post_id: true,
    },
  },
  postSeo: {
    select: {
      id: true,
      title: true,
      desc: true,
      fk_file_id: true,
      fk_post_id: true,
    },
  },
  postTags: {
    select: {
      tag: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
});

export const POSTS_STATUS_SELECT = Prisma.validator<Prisma.PostSelect>()({
  ...POSTS_SELECT,
  postStats: {
    select: {
      score: true,
      likes: true,
      clicks: true,
    },
  },
});
