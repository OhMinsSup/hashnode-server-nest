import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import {
  BlogLayoutType,
  BlogMemberRole,
  BlogMemberVisibility,
  NotificationType,
} from '@prisma/client';

// service
import { PrismaService } from '../../modules/database/prisma.service';
import { TokenService } from './token.service';
import { EnvironmentService } from '../../integrations/environment/environment.service';
import { PasswordService } from './password.service';

// constants
import { EXCEPTION_CODE } from '../../constants/exception.code';
import { assertUserExists } from '../../errors/user-exists.error';
import { assertUserNotFound } from '../../errors/user-not-found.error';
import { assertIncorrectPassword } from '../../errors/incorrect-password.error';
import { isNullOrUndefined } from '../../libs/assertion';

// dto
import { SignupInput } from '../input/signup.input';
import { SigninInput } from '../input/signin.input';
import type { Request } from 'express';

@Injectable({
  scope: Scope.REQUEST,
})
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly token: TokenService,
    private readonly env: EnvironmentService,
    private readonly password: PasswordService,
    @Inject(REQUEST) private request: Request,
  ) {}

  /**
   * @description 로그인
   * @param {SigninBody} input 로그인 정보 */
  async signin(input: SigninInput) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: input.email,
      },
      select: {
        id: true,
        email: true,
        UserPassword: {
          select: {
            hash: true,
            salt: true,
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

    const passwordMatch = await this.password.verifyPassword(
      input.password,
      user.UserPassword.salt,
      user.UserPassword.hash,
    );

    assertIncorrectPassword(!passwordMatch, {
      resultCode: EXCEPTION_CODE.INCORRECT_PASSWORD,
      message: '비밀번호가 일치하지 않습니다.',
      error: 'password',
      result: null,
    });

    const expiresAt = this.env.getAuthTokenExpiresAt();

    const now = new Date();

    const auth = await this.prisma.userAuthentication.create({
      data: {
        fk_user_id: user.id,
        lastValidatedAt: now,
        expiresAt: expiresAt,
      },
    });

    const authToken = this.token.getJwtToken(user.id, {
      authId: auth.id,
    });

    const ipHash = this.password.hash(this.request.ip);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastSignInAt: now,
        lastSignInIpHash: ipHash,
      },
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
   * @param {SignupBody} input 회원가입 정보 */
  async signup(input: SignupInput) {
    return await this.prisma.$transaction(async (tx) => {
      const exists = await tx.user.findFirst({
        where: {
          OR: [
            {
              email: input.email,
            },
            {
              UserProfile: {
                username: input.username,
              },
            },
          ],
        },
        select: {
          id: true,
          email: true,
          UserProfile: {
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

      const { hashedPassword, salt } = await this.password.hashPassword(
        input.password,
      );

      // add user to database
      const user = await tx.user.create({
        data: {
          email: input.email,
          UserPassword: {
            create: {
              hash: hashedPassword,
              salt,
            },
          },
          UserProfile: {
            create: {
              username: input.username,
              nickname: input.nickname,
            },
          },
          UserNotifications: {
            create: {
              Notification: {
                create: {
                  type: NotificationType.WELCOME,
                  title: 'Welcome to Hashnode!',
                  body: 'Welcome to Hashnode! Click here to understand Hashnode better',
                },
              },
            },
          },
          UserSocial: {
            create: {},
          },
          UserEmail: {
            create: {},
          },
          Blog: {
            create: {
              title: `${input.username}'s team blog`,
              BlogSocial: {
                create: {},
              },
              BlogSeo: {
                create: {},
              },
              BlogAppearance: {
                create: {
                  layoutType: BlogLayoutType.MAGAZINE,
                  headerColor: '#2962FF',
                  subscribeNewsletter: true,
                },
              },
            },
          },
        },
        select: {
          id: true,
          Blog: {
            select: {
              id: true,
            },
          },
        },
      });

      await tx.blogMembers.create({
        data: {
          fk_blog_id: user.Blog.id,
          fk_user_id: user.id,
          role: BlogMemberRole.OWNER,
          visibility: BlogMemberVisibility.PUBLIC,
        },
      });

      const expiresAt = this.env.getAuthTokenExpiresAt();

      const now = new Date();

      const auth = await tx.userAuthentication.create({
        data: {
          fk_user_id: user.id,
          lastValidatedAt: now,
          expiresAt: expiresAt,
        },
      });

      const authToken = this.token.getJwtToken(user.id, {
        authId: auth.id,
      });

      const ipHash = this.password.hash(this.request.ip);

      await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          lastSignInAt: now,
          lastSignInIpHash: ipHash,
        },
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
