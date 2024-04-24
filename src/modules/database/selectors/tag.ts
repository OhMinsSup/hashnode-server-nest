import { Prisma } from '@prisma/client';

export const getTagStatsSelector = () =>
  Prisma.validator<Prisma.TagStatsSelect>()({
    follow: true,
    inUse: true,
    score: true,
  });

export const getTagCountSelector = () =>
  Prisma.validator<Prisma.TagCountOutputTypeSelect>()({
    UserTags: true,
    PostTags: true,
  });

export const getBaseTagSelector = () =>
  Prisma.validator<Prisma.TagSelect>()({
    id: true,
    name: true,
    description: true,
    image: true,
  });

export const getTagSelector = () =>
  Prisma.validator<Prisma.TagSelect>()({
    ...getBaseTagSelector(),
    _count: {
      select: getTagCountSelector(),
    },
  });

export const getTagWithStatsSelector = () =>
  Prisma.validator<Prisma.TagSelect>()({
    ...getBaseTagSelector(),
    TagStats: {
      select: getTagStatsSelector(),
    },
  });
