import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/database/prisma.service';
import { SerializeService } from '../../integrations/serialize/serialize.service';
import { SerializeUser } from '../../integrations/serialize/serialize.interface';
import { EXCEPTION_CODE } from '../../constants/exception.code';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly serialize: SerializeService,
  ) {}

  /**
   * @description 사용자 정보 조회
   * @param {SerializeUser} myInfo 사용자 정보 */
  getMyInfo(myInfo: SerializeUser) {
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: myInfo,
    };
  }
}
