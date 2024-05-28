import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/database/prisma.service';
import type { SerializeUser } from '../../integrations/serialize/serialize.interface';
import { EXCEPTION_CODE } from '../../constants/exception.code';
import { type FileCreateInput } from '../input/file-create.input';
import { toFinite } from 'lodash';
import { getFileSelector } from '../../modules/database/selectors/file';
import { type FileListQuery } from '../input/file-list.query';
import { SerializeService } from '../../integrations/serialize/serialize.service';
import { type FileUploadInput } from '../input/file-upload.input';

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly serialize: SerializeService,
  ) {}

  /**
   * @description 파일 업로드
   * @param {SerializeUser} user
   * @param {FileUploadInput} input
   * @param {Express.Multer.File} file
   */
  async upload(
    user: SerializeUser,
    input: FileUploadInput,
    file: Express.Multer.File,
  ) {
    console.log('user', user, 'input', input, 'file', file);
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {},
    };
  }

  /**
   * @description 파일 생성
   * @param {SerializeUser} user
   * @param {FileCreateInput} input
   */
  async create(user: SerializeUser, input: FileCreateInput) {
    const data = await this.prisma.file.create({
      data: {
        cfId: input.cfId,
        filename: input.filename,
        publicUrl: input.publicUrl,
        mimeType: input.mimeType,
        uploadType: input.uploadType,
        mediaType: input.mediaType,
        fk_user_id: user.id,
      },
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        id: data.id,
        publicUrl: data.publicUrl,
      },
    };
  }

  /**
   * @description 내가 등록한 파일 리스트
   * @param {SerializeUser} user
   * @param {FileListQuery} query
   */
  async list(user: SerializeUser, query: FileListQuery) {
    const limit = query.limit ? toFinite(query.limit) : 20;

    const pageNo = toFinite(query.pageNo);

    const [totalCount, list] = await Promise.all([
      this.prisma.file.count({
        where: {
          fk_user_id: user.id,
          mediaType: {
            equals: query.mediaType,
          },
          uploadType: {
            equals: query.uploadType,
          },
        },
      }),
      this.prisma.file.findMany({
        where: {
          fk_user_id: user.id,
          mediaType: {
            equals: query.mediaType,
          },
          uploadType: {
            equals: query.uploadType,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (pageNo - 1) * limit,
        take: limit,
        select: getFileSelector(),
      }),
    ]);

    const hasNextPage = totalCount > pageNo * limit;

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        totalCount,
        list: list.map((item) => this.serialize.getFile(item)),
        pageInfo: {
          currentPage: pageNo,
          hasNextPage,
          nextPage: hasNextPage ? pageNo + 1 : null,
        },
      },
    };
  }
}
