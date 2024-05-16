import { Prisma } from '@prisma/client';
import { getBaseTagSelector } from './tag';

export const getPostConfigSelector = () =>
  Prisma.validator<Prisma.PostConfigSelect>()({
    disabledComment: true,
    hiddenArticle: true,
    hasTableOfContents: true,
    isDraft: true,
    isMarkdown: true,
    publishedAt: true,
  });

export const getPostTagsSelector = () =>
  Prisma.validator<Prisma.PostTagsSelect>()({
    Tag: {
      select: getBaseTagSelector(),
    },
  });

export const getPostSeoSelector = () =>
  Prisma.validator<Prisma.PostSeoSelect>()({
    title: true,
    description: true,
    image: true,
  });

export const getPostStatsSelector = () =>
  Prisma.validator<Prisma.PostStatsSelect>()({
    likes: true,
    clicks: true,
    comments: true,
    score: true,
  });

export const getBasePostSelector = () =>
  Prisma.validator<Prisma.PostSelect>()({
    id: true,
    urlSlug: true,
    title: true,
    subTitle: true,
    content: true,
    meta: true,
    image: true,
    createdAt: true,
    updatedAt: true,
  });

export const getPostCountSelector = () =>
  Prisma.validator<Prisma.PostCountOutputTypeSelect>()({
    PostTags: true,
    PostLike: true,
  });

export const getPostSelector = () =>
  Prisma.validator<Prisma.PostSelect>()({
    ...getBasePostSelector(),
    PostConfig: {
      select: getPostConfigSelector(),
    },
    PostTags: {
      select: getPostTagsSelector(),
    },
    PostSeo: {
      select: getPostSeoSelector(),
    },
    _count: {
      select: getPostCountSelector(),
    },
  });

export const getPostWithStatsSelector = () =>
  Prisma.validator<Prisma.PostSelect>()({
    ...getPostSelector(),
    PostStats: {
      select: getPostStatsSelector(),
    },
  });
