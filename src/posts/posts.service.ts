import { Injectable } from '@nestjs/common';

// service
import { PrismaService } from '../modules/database/prisma.service';

// types
import { type AuthUserSchema } from '../libs/get-user.decorator';
import { CreateRequestDto } from './dto/create.request.dto';
import { EXCEPTION_CODE } from 'src/constants/exception.code';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description 게시글 생성
   * @param {AuthUserSchema} user
   * @param {CreateRequestDto} input
   */
  async create(user: AuthUserSchema, input: CreateRequestDto) {
    const post = await this.prisma.post.create({
      data: {
        userId: user.id,
        title: input.title,
        subTitle: input.subTitle ?? null,
        content: input.content,
        description: input.description,
        thumbnail: input.thumbnail ?? null,
        tags: {
          connectOrCreate: (input.tags ?? []).map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        dataId: post.id,
      },
    };
  }
}
