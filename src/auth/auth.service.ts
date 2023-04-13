import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { addDays } from 'date-fns';
import * as bcrypt from 'bcrypt';

// service
import { PrismaService } from '../modules/database/prisma.service';
import { JwtService } from 'src/modules/jwt/jwt.service';

// constants
import { EXCEPTION_CODE } from '../constants/exception.code';

// dto
import { SignupBody } from './dto/signup';
import { SigninBody } from './dto/signin';

// types
import type { UserAuthentication } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * @description 유저 로그인 및 회원가입시 인증 토큰을 발급하는 코드
   * @param {number} userId  유저 아이디
   * @param {UserAuthentication?} authentication 유저 인증 정보
   * @returns {Promise<{ accessToken: string }>}
   */
  private async _generateToken(
    userId: number,
    authentication?: UserAuthentication | null,
  ) {
    const auth =
      authentication ??
      (await (async () => {
        // 7일  후 만료
        const expiresAt = addDays(new Date(), 7);
        return this.prisma.userAuthentication.create({
          data: {
            userId,
            lastValidatedAt: new Date(),
            expiresAt: expiresAt,
          },
        });
      })());

    const token = await this.jwt.sign({
      authId: auth.id,
      userId,
    });

    return {
      accessToken: token,
    };
  }

  /**
   * @description 로그인
   * @param {SigninBody} input 로그인 정보
   * @returns {Promise<{ resultCode: number; message: string[]; error: string; result: { userId: number; accessToken: string; }; }>}
   */
  async signin(input: SigninBody) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: input.email,
      },
    });

    if (!user) {
      throw new NotFoundException({
        status: EXCEPTION_CODE.ALREADY_EXIST,
        message: ['가입되지 않은 이메일입니다.'],
        error: 'email',
      });
    }

    const passwordMatch = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatch) {
      throw new BadRequestException({
        status: EXCEPTION_CODE.INCORRECT_PASSWORD,
        message: ['비밀번호가 일치하지 않습니다.'],
        error: 'password',
      });
    }

    const { accessToken } = await this._generateToken(user.id);

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        userId: user.id,
        accessToken,
      },
    };
  }

  /**
   * @description 회원가입
   * @param {SignupBody} input 회원가입 정보
   * @returns {Promise<{ resultCode: number; message: string[]; error: string; result: { userId: number; accessToken: string; }; }>}
   */
  async signup(input: SignupBody) {
    const exists = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email: input.email,
          },
          {
            username: input.username,
          },
        ],
      },
    });

    // 이미 가입한 이메일이 존재하는 경우
    if (exists) {
      const message =
        exists.email === input.email
          ? '이미 가입된 이메일입니다.'
          : '이미 사용중인 아이디입니다.';

      throw new BadRequestException({
        status: EXCEPTION_CODE.ALREADY_EXIST,
        message: [message],
        error: exists.email === input.email ? 'email' : 'username',
      });
    }

    const salt = await bcrypt.genSalt(this.config.get('SALT_ROUNDS'));
    const hash = await bcrypt.hash(input.password, salt);

    // add user to database
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash: hash,
      },
    });

    // add user profile to database
    await this.prisma.userProfile.create({
      data: {
        userId: user.id,
        name: input.name,
      },
    });

    const { accessToken } = await this._generateToken(user.id);

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        userId: user.id,
        accessToken,
      },
    };
  }
}
