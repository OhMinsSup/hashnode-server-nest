import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EXCEPTION_CODE } from '../constants/exception.code';
import { PrismaService } from '../modules/database/prisma.service';
import { GetArticleCirclesRequestDto } from './dto/article-circles.request.dto';

@Injectable()
export class WidgetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * @description 회원 목록 리스트
   * @param {GetArticleCirclesRequestDto} query
   */
  async getArticleCircles(query: GetArticleCirclesRequestDto) {
    // 일단 구현은 간단하게 유저 리스트를 넘겨주는걸로 하고 나중에 구체적으로 구현
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        circles: users,
      },
    };
  }
}
