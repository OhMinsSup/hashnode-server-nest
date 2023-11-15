import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

// service
import { PrismaService } from '../../modules/database/prisma.service';
import { TokenService } from './token.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { EnvironmentService } from '../../integrations/environment/environment.service';

// constants
import { EXCEPTION_CODE } from '../../constants/exception.code';
import { assertUserExists } from '../../errors/user-exists.error';
import { assertUserNotFound } from '../../errors/user-notfound.error';
import { assertIncorrectPassword } from '../../errors/user-exists.error copy';

// dto
import { SignupInput } from '../input/signup.input';
import { SigninInput } from '../input/signin.input';

// types
import type { UserAuthentication } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly token: TokenService,
    private readonly env: EnvironmentService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * @description 유저 인증 정보를 생성합니다.
   * @param {string} userId 유저 아이디
   */
  private async _makeUserAuthtiencation(userId: string) {
    const expiresAt = this.env.getAuthTokenExpiresIn();
    return this.prisma.userAuthentication.create({
      data: {
        fk_user_id: userId,
        lastValidatedAt: new Date(),
        expiresAt: expiresAt,
      },
    });
  }

  /**
   * @description 유저 로그인 및 회원가입시 인증 토큰을 발급하는 코드
   * @param {string} userId  유저 아이디
   * @param {UserAuthentication?} authentication 유저 인증 정보
   */
  private async _generateToken(
    userId: string,
    authentication?: UserAuthentication | null,
  ) {
    const auth = authentication ?? (await this._makeUserAuthtiencation(userId));

    const token = this.token.getJwtToken(userId, {
      authId: auth.id,
    });

    return {
      authToken: token,
    };
  }

  /**
   * @description 로그인
   * @param {SigninBody} input 로그인 정보
   */
  async signin(input: SigninInput) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: input.email,
      },
      select: {
        id: true,
        email: true,
        userPassword: {
          select: {
            passwordHash: true,
          },
        },
      },
    });

    assertUserNotFound(!user, {
      resultCode: EXCEPTION_CODE.NOT_EXIST,
      message: '가입되지 않은 이메일입니다.',
      error: 'email',
      result: null,
    });

    const passwordMatch = await bcrypt.compare(
      input.password,
      user.userPassword.passwordHash,
    );

    assertIncorrectPassword(!passwordMatch, {
      resultCode: EXCEPTION_CODE.INCORRECT_PASSWORD,
      message: '비밀번호가 일치하지 않습니다.',
      error: 'password',
      result: null,
    });

    const auth = await this._makeUserAuthtiencation(user.id);

    const authToken = this.token.getJwtToken(user.id, {
      authId: auth.id,
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        userId: user.id,
        authToken,
      },
    };
  }

  /**
   * @description 회원가입
   * @param {SignupBody} input 회원가입 정보
   */
  async signup(input: SignupInput) {
    return await this.prisma.$transaction(async (tx) => {
      const exists = await tx.user.findFirst({
        where: {
          OR: [
            {
              email: input.email,
            },
            {
              userProfile: {
                username: input.username,
              },
            },
          ],
        },
        include: {
          userProfile: {
            select: {
              username: true,
            },
          },
        },
      });

      // 이미 가입한 이메일이 존재하는 경우
      assertUserExists(!exists, {
        resultCode: EXCEPTION_CODE.ALREADY_EXIST,
        message:
          exists.email === input.email
            ? '이미 가입된 이메일입니다.'
            : '이미 사용중인 아이디입니다.',
        error: exists.email === input.email ? 'email' : 'username',
        result: null,
      });

      const salt = await bcrypt.genSalt(this.env.getSaltRounds());
      const hash = await bcrypt.hash(input.password, salt);

      // add user to database
      const user = await tx.user.create({
        data: {
          email: input.email,
          userPassword: {
            create: {
              passwordHash: hash,
              salt,
            },
          },
          userProfile: {
            create: {
              username: input.username,
              nickname: input.username,
            },
          },
          userSocial: {
            create: {
              github: null,
              twitter: null,
              facebook: null,
              instagram: null,
              website: null,
            },
          },
        },
      });

      const expiresAt = this.env.getAuthTokenExpiresIn();

      const auth = await tx.userAuthentication.create({
        data: {
          fk_user_id: user.id,
          lastValidatedAt: new Date(),
          expiresAt: expiresAt,
        },
      });

      const authToken = this.token.getJwtToken(user.id, {
        authId: auth.id,
      });

      this.notifications.createWelcome(user.id).catch((e) => {
        console.error(e.message, e.stack, 'NotificationsService');
      });

      return {
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        error: null,
        result: {
          userId: user.id,
          authToken,
        },
      };
    });
  }
}
