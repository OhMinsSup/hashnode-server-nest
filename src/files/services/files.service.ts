import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/database/prisma.service';
import type { SerializeUser } from '../../integrations/serialize/serialize.interface';
import { EXCEPTION_CODE } from '../../constants/exception.code';
import { FileCreateInput } from '../input/file-create.input';

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

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
}
