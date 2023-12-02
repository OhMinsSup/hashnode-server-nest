import { Prisma } from '@prisma/client';

export const USER_SELECT = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  email: true,
  userProfile: {
    select: {
      username: true,
      nickname: true,
      tagline: true,
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
  followers: {
    select: {
      id: true,
    },
    // where: {
    //   fk_follower_user_id: user?.id ?? undefined,
    // },
    // take: 1,
  },
});
