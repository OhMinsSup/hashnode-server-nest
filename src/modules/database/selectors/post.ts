import { Prisma } from '@prisma/client';
import { getBaseTagSelector } from './tag';
import { getSimpleUserSelector } from './user';

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

export const getPostBookmarkSelector = () =>
  Prisma.validator<Prisma.PostBookmarkSelect>()({
    fk_user_id: true,
    fk_post_id: true,
  });

export const getBasePostSelector = () =>
  Prisma.validator<Prisma.PostSelect>()({
    id: true,
    urlSlug: true,
    title: true,
    subTitle: true,
    content: true,
    meta: false,
    image: true,
    createdAt: true,
    updatedAt: true,
    User: {
      select: getSimpleUserSelector(),
    },
  });

export const getPostCountSelector = () =>
  Prisma.validator<Prisma.PostCountOutputTypeSelect>()({
    PostTags: true,
    PostLike: true,
    PostRead: true,
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
    PostBookmark: {
      select: getPostBookmarkSelector(),
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
