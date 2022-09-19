import { Injectable } from '@nestjs/common';
import { PrismaService } from '../modules/database/prisma.service';

// constants
import { EXCEPTION_CODE } from '../constants/exception.code';

import { type AuthUserSchema } from '../libs/get-user.decorator';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description 유저 정보를 가져온다.
   * @param {AuthUserSchema} user
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
}
