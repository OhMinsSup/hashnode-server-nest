import { Prisma } from '@prisma/client';
import type { Tag, User, UserProfile, UserSocials } from '@prisma/client';

export const DEFAULT_USER_SELECT = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  email: true,
  username: true,
  profile: {
    select: {
      name: true,
      tagline: true,
      avatarUrl: true,
      location: true,
      bio: true,
      availableText: true,
    },
  },
  socials: {
    select: {
      github: true,
      twitter: true,
      facebook: true,
      instagram: true,
      website: true,
    },
  },
  skills: {
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

export type UserWithInfo = Pick<User, 'id' | 'email' | 'username'> & {
  profile: Omit<
    UserProfile,
    'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'
  >;
  skills: Array<{
    tag: Pick<Tag, 'id' | 'name'>;
  }>;
  socials: Pick<
    UserSocials,
    'github' | 'facebook' | 'instagram' | 'twitter' | 'website'
  >;
};
