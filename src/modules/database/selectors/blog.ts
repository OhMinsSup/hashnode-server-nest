import { Prisma } from '@prisma/client';

export const getBlogMemberSelector = () =>
  Prisma.validator<Prisma.BlogMembersSelect>()({
    role: true,
    visibility: true,
    createdAt: true,
  });

export const getBlogSeoSelector = () =>
  Prisma.validator<Prisma.BlogSeoSelect>()({
    title: true,
    description: true,
    image: true,
  });

export const getBlogAppearanceSelector = () =>
  Prisma.validator<Prisma.BlogAppearanceSelect>()({
    layoutType: true,
    logo: true,
    logoDark: true,
    favicon: true,
    headerColor: true,
    displayReadTime: true,
    displayPostViews: true,
    subscribeNewsletter: true,
  });

export const getBlogSocialSelector = () =>
  Prisma.validator<Prisma.BlogSocialSelect>()({
    github: true,
    twitter: true,
    instagram: true,
    mastodon: true,
    youtube: true,
    linkedin: true,
    dailydev: true,
  });

export const getBaseBlogSelector = () =>
  Prisma.validator<Prisma.BlogSelect>()({
    id: true,
    type: true,
    title: true,
    about: true,
    createdAt: true,
  });

export const getBlogSelector = () =>
  Prisma.validator<Prisma.BlogSelect>()({
    ...getBaseBlogSelector(),
    BlogMembers: {
      select: getBlogMemberSelector(),
    },
    BlogSeo: {
      select: getBlogSeoSelector(),
    },
    BlogAppearance: {
      select: getBlogAppearanceSelector(),
    },
    BlogSocial: {
      select: getBlogSocialSelector(),
    },
  });
