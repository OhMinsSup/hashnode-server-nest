import { BadRequestException, Injectable } from '@nestjs/common';

// service
import { PrismaService } from '../modules/database/prisma.service';

// constants
import { EXCEPTION_CODE } from 'src/constants/exception.code';

// dto
import {
  DraftCreateRequestDto,
  DraftRequestDto,
} from './dto/draft.request.dto';

// types
import type { AuthUserSchema } from '../libs/get-user.decorator';

@Injectable()
export class DraftsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description '최초 초안 게시물 상세 API
   * @param {AuthUserSchema} user
   * @param {number} draftId
   */
  async detail(user: AuthUserSchema, draftId: number) {
    const draft = await this.prisma.postDraft.findUnique({
      where: {
        id: draftId,
      },
    });

    if (!draft) {
      throw new BadRequestException({
        resultCode: EXCEPTION_CODE.NOT_EXIST,
        message: '초안 게시물을 찾을 수 없습니다.',
        error: null,
        result: null,
      });
    }

    // 게시물이 존재하는 경우
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: draft,
    };
  }

  /**
   * @description '최초 초안 게시물 생성 API
   * @param {AuthUserSchema} user
   * @param {DraftCreateRequestDto} input
   */
  async create(user: AuthUserSchema, input: DraftCreateRequestDto) {
    const draft = await this.prisma.postDraft.create({
      data: {
        title: input.title ?? 'Temp Title',
        subTitle: input.subTitle ?? null,
        content: input.content ?? null,
        description: input.description ?? null,
        thumbnail: input.thumbnail ?? null,
        disabledComment: input.disabledComment ?? true,
        isPublic: input.isPublic ?? false,
        publishingDate: input.publishingDate
          ? new Date(input.publishingDate)
          : null,
        tags: input.tags ? JSON.stringify(input.tags) : null,
        draftUserId: user.id,
      },
    });

    // 게시물이 존재하지 않는 경우 (생성)
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        dataId: draft.id,
      },
    };
  }

  /**
   * @description 게시물 저장하기
   * @param {AuthUserSchema} user
   * @param {DraftRequestDto} input
   */
  async saveData(user: AuthUserSchema, input: DraftRequestDto) {
    // 게시물이 존재하지 않는 경우 (생성)
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {},
    };
  }
}
