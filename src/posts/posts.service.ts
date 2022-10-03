import { Injectable } from '@nestjs/common';

// service
import { PrismaService } from '../modules/database/prisma.service';

// utils
import { isEmpty } from '../libs/assertion';
import { escapeForUrl } from '../libs/utils';

// constants
import { EXCEPTION_CODE } from 'src/constants/exception.code';

// types
import { CreateRequestDto } from './dto/create.request.dto';
import type { Tag } from '@prisma/client';
import type { AuthUserSchema } from '../libs/get-user.decorator';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description 게시글 생성
   * @param {AuthUserSchema} user
   * @param {CreateRequestDto} input
   */
  async create(user: AuthUserSchema, input: CreateRequestDto) {
    return this.prisma.$transaction(async (tx) => {
      let createdTags: Tag[] = [];
      // 태크 체크
      if (!isEmpty(input.tags) && input.tags) {
        const tags = await Promise.all(
          input.tags.map(async (tag) => {
            const name = escapeForUrl(tag);
            const tagData = await tx.tag.findFirst({
              where: {
                name,
              },
            });
            if (!tagData) {
              return tx.tag.create({
                data: {
                  name,
                },
              });
            }
            return tagData;
          }),
        );
        createdTags = tags;
      }

      const post = await tx.post.create({
        data: {
          userId: user.id,
          title: input.title,
          subTitle: input.subTitle ?? null,
          content: input.content,
          description: input.description,
          thumbnail: input.thumbnail ?? null,
        },
      });

      await Promise.all(
        createdTags.map((tag) =>
          tx.postsTags.create({
            data: {
              post: {
                connect: {
                  id: post.id,
                },
              },
              tag: {
                connect: {
                  id: tag.id,
                },
              },
            },
          }),
        ),
      );

      return {
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        error: null,
        result: {
          dataId: post.id,
        },
      };
    });
  }
}
