import { Prisma } from '@prisma/client';

export const TAGS_LIST_SELECT = Prisma.validator<Prisma.TagSelect>()({
  id: true,
  name: true,
  _count: {
    select: {
      postsTags: true,
    },
  },
});
