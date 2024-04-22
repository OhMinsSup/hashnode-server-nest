import { Prisma } from '@prisma/client';

export const getNotificationSelector = () =>
  Prisma.validator<Prisma.NotificationSelect>()({
    id: true,
    type: true,
    title: true,
    body: true,
    image: true,
    createdAt: true,
  });
