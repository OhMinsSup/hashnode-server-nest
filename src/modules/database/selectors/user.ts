import { Prisma } from '@prisma/client';
import { getNotificationSelector } from './notification';
import { getBaseTagSelector } from './tag';
import { getBlogSelector } from './blog';

export const getUserProfileSelector = () =>
  Prisma.validator<Prisma.UserProfileSelect>()({
    id: true,
    username: true,
    image: true,
    nickname: true,
    tagline: true,
    location: true,
    bio: true,
    availableText: true,
  });

export const getUserPasswordSelector = () =>
  Prisma.validator<Prisma.UserPasswordSelect>()({
    id: true,
    hash: true,
    salt: true,
  });

export const getUserSocialSelector = () =>
  Prisma.validator<Prisma.UserSocialSelect>()({
    id: true,
    github: true,
    twitter: true,
    facebook: true,
    instagram: true,
    stackoverflow: true,
    youtube: true,
    linkedin: true,
    website: true,
  });

export const getUserTagsSelector = () =>
  Prisma.validator<Prisma.PostTagsSelect>()({
    Tag: {
      select: getBaseTagSelector(),
    },
  });

export const getUserAuthenticationsSelector = () =>
  Prisma.validator<Prisma.UserAuthenticationSelect>()({
    id: true,
    lastValidatedAt: true,
    expiresAt: true,
  });

export const getUserNotificationsSelector = () =>
  Prisma.validator<Prisma.UserNotificationSelect>()({
    id: true,
    readAt: true,
    User: {
      select: getUserSelector(),
    },
    Notification: {
      select: getNotificationSelector(),
    },
  });

export const getUserEmailSelector = () =>
  Prisma.validator<Prisma.UserEmailSelect>()({
    id: true,
    hashnodeWeekly: true,
    activityNotifications: true,
    generalAnnouncements: true,
    monthlyBlogStats: true,
    referralNotifications: true,
    newFollowersWeekly: true,
  });

export const getUserSelector = () =>
  Prisma.validator<Prisma.UserSelect>()({
    id: true,
    email: true,
    createdAt: true,
    updatedAt: true,
  });

export const getSimpleUserSelector = () =>
  Prisma.validator<Prisma.UserSelect>()({
    ...getUserSelector(),
    UserProfile: {
      select: {
        username: true,
        image: true,
      },
    },
  });

export const getUserExternalFullSelector = () =>
  Prisma.validator<Prisma.UserSelect>()({
    ...getUserSelector(),
    UserProfile: {
      select: getUserProfileSelector(),
    },
    UserSocial: {
      select: getUserSocialSelector(),
    },
    UserTags: {
      select: getUserTagsSelector(),
    },
    UserEmail: {
      select: getUserEmailSelector(),
    },
    Blog: {
      select: getBlogSelector(),
    },
  });

export const getUserFullSelector = () =>
  Prisma.validator<Prisma.UserSelect>()({
    ...getUserExternalFullSelector(),
    UserPassword: {
      select: getUserPasswordSelector(),
    },
  });
