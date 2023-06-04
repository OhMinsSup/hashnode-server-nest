import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../modules/database/prisma.service';
import { UserWithInfo } from '../modules/database/select/user.select';
import { DraftBody } from './dto/draft';
import { EXCEPTION_CODE } from '../constants/exception.code';
import { DraftListQuery } from './dto/list';
import { isString } from '../libs/assertion';

@Injectable()
export class DraftService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description 임시 게시물 상세 조회
   * @param {UserWithInfo?} user
   * @param {number} id
   */
  async detail(user: UserWithInfo, id: number) {
    const draft = await this.prisma.postDraft.findFirst({
      where: {
        id,
        userId: user.id,
      },
      select: {
        id: true,
        title: true,
        json: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    if (!draft) {
      throw new BadRequestException({
        resultCode: EXCEPTION_CODE.NOT_EXIST,
        message: '게시물을 찾을 수 없습니다.',
        error: null,
        result: null,
      });
    }

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: draft,
    };
  }

  /**
   * @description 임시 게시물 목록 리스트
   * @param {UserWithInfo?} user
   * @param {DraftListQuery} query
   */
  async list(user: UserWithInfo, query: DraftListQuery) {
    const { list, totalCount, endCursor, hasNextPage } = await this._getItems(
      user.id,
      query,
    );
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        list,
        totalCount,
        pageInfo: {
          endCursor: hasNextPage ? endCursor : null,
          hasNextPage,
        },
      },
    };
  }
  async delete(id: number) {
    await this.prisma.postDraft.delete({
      where: {
        id,
      },
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: null,
    };
  }

  /**
   * @description 임시 게시글 생성
   * @param {UserWithInfo} user
   * @param {CreateRequestDto} input
   */
  async create(user: UserWithInfo, input: DraftBody) {
    return this.prisma.$transaction(async (tx) => {
      const json = JSON.stringify(input);
      const draft = await tx.postDraft.create({
        data: {
          title: input.title || '제목 없음',
          json,
          userId: user.id,
        },
      });
      return {
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        error: null,
        result: {
          dataId: draft.id,
        },
      };
    });
  }

  /**
   * @description 임시 게시글 수정
   * @param {UserWithInfo} user
   * @param {number} draftId
   * @param {CreateRequestDto} input
   */
  async update(user: UserWithInfo, draftId: number, input: DraftBody) {
    return this.prisma.$transaction(async (tx) => {
      const json = JSON.stringify(input);
      const draft = await tx.postDraft.update({
        where: {
          id: draftId,
        },
        data: {
          title: input.title || '제목 없음',
          json,
        },
      });
      return {
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        error: null,
        result: {
          dataId: draft.id,
        },
      };
    });
  }

  /**
   * @description 게시물 리스트
   * @param {number} userId
   * @param {DraftListQuery} query
   * @returns
   */
  private async _getItems(
    userId: number,
    { cursor, limit, keyword }: DraftListQuery,
  ) {
    if (isString(cursor)) {
      cursor = Number(cursor);
    }

    if (isString(limit)) {
      limit = Number(limit);
    }

    const [totalCount, list] = await Promise.all([
      this.prisma.postDraft.count({
        where: {
          userId,
          ...(keyword && {
            title: {
              contains: keyword,
            },
          }),
        },
      }),
      this.prisma.postDraft.findMany({
        orderBy: [
          {
            id: 'desc',
          },
        ],
        where: {
          id: cursor
            ? {
                lt: cursor,
              }
            : undefined,
          userId,
          ...(keyword && {
            title: {
              contains: keyword,
            },
          }),
        },
        select: {
          id: true,
          title: true,
          json: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
        take: limit,
      }),
    ]);

    const endCursor = list.at(-1)?.id ?? null;
    const hasNextPage = endCursor
      ? (await this.prisma.postDraft.count({
          where: {
            id: {
              lt: endCursor,
            },
            userId,
            ...(keyword && {
              title: {
                contains: keyword,
              },
            }),
          },
          orderBy: [
            {
              id: 'desc',
            },
          ],
        })) > 0
      : false;

    return {
      totalCount,
      list,
      endCursor,
      hasNextPage,
    };
  }
}
