import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

// service
import { PrismaService } from '../../modules/database/prisma.service';
import { TokenService } from './token.service';
import { EnvironmentService } from '../../integrations/environment/environment.service';

// constants
import { EXCEPTION_CODE } from '../../constants/exception.code';
import { assertUserExists } from '../../errors/user-exists.error';
import { assertUserNotFound } from '../../errors/user-not-found.error';
import { assertIncorrectPassword } from '../../errors/incorrect-password.error';
import { isNullOrUndefined } from '../../libs/assertion';

// dto
import { SignupInput } from '../input/signup.input';
import { SigninInput } from '../input/signin.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly token: TokenService,
    private readonly env: EnvironmentService,
  ) {}

  /**
   * @description 유저 인증 정보를 생성합니다.
   * @param {string} userId 유저 아이디
   */
  private async _makeUserAuthtiencation(userId: string) {
    const expiresAt = this.env.getAuthTokenExpiresAt();
    return this.prisma.userAuthentication.create({
      data: {
        fk_user_id: userId,
        lastValidatedAt: new Date(),
        expiresAt: expiresAt,
      },
    });
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
        select: {
          id: true,
          email: true,
          userProfile: {
            select: {
              username: true,
            },
          },
        },
      });

      // 이미 가입한 이메일이 존재하는 경우
      assertUserExists(!isNullOrUndefined(exists), {
        resultCode: EXCEPTION_CODE.ALREADY_EXIST,
        message: exists
          ? exists.email === input.email
            ? '이미 가입된 이메일입니다.'
            : '이미 사용중인 아이디입니다.'
          : null,
        error: exists
          ? exists.email === input.email
            ? 'email'
            : 'username'
          : null,
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
              nickname: input.nickname,
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
          notification: {
            create: {
              type: 'WELCOME',
              message: `${input.nickname}님 환영합니다.`,
            },
          },
        },
      });

      const expiresAt = this.env.getAuthTokenExpiresAt();

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
