import { Prisma } from '@prisma/client';

export const getFileSelector = () =>
  Prisma.validator<Prisma.FileSelect>()({
    id: true,
    cfId: true,
    publicUrl: true,
    filename: true,
    mimeType: true,
    uploadType: true,
    mediaType: true,
  });
