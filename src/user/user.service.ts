import { Injectable } from '@nestjs/common';
import { PrismaService } from '../modules/database/prisma.service';
import { ConfigService } from '@nestjs/config';

// constants
import { EXCEPTION_CODE } from '../constants/exception.code';

import type { AuthUserSchema } from '../libs/get-user.decorator';
import type { Response } from 'express';
import type { UpdateBody } from './dto/update';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * @description 유저 정보를 가져온다.
   * @param {AuthUserSchema} user 유저 정보
   * @returns {Promise<{ resultCode: number; message: string[]; error: string; result: AuthUserSchema; }>}
   */
  getUserInfo(user: AuthUserSchema) {
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        ...user,
      },
    };
  }

  /**
   * @description 유저 정보를 업데이트한다.
   * @param {AuthUserSchema} user 유저 정보
   * @param {UpdateBody} input 업데이트 정보
   * @returns {Promise<{ resultCode: number; message: string[]; error: string; result: null; }>}
   */
  update(user: AuthUserSchema, input: UpdateBody) {
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: null,
    };
  }

  /**
   * @description 로그아웃
   * @param {Response} res 응답 객체
   * @returns {Promise<{ resultCode: number; message: string[]; error: string; result: null; }>}
   */
  async logout(res: Response) {
    res.clearCookie(this.config.get('COOKIE_TOKEN_NAME'), {
      httpOnly: true,
      domain: this.config.get('COOKIE_DOMAIN'),
      path: this.config.get('COOKIE_PATH'),
      sameSite: this.config.get('COOKIE_SAMESITE'),
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: null,
    };
  }
}
