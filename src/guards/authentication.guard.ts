import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

// date-fns
import { differenceInMilliseconds, subMinutes } from 'date-fns';

// service
import { EnvironmentService } from '../integrations/environment/environment.service';
import { TokenService } from '../auth/services/token.service';
import { PrismaService } from '../modules/database/prisma.service';

// constants
import { USER_SELECT } from '../auth/select/user.select';

// types
import { JwtPayload, TokenExpiredError } from 'jsonwebtoken';

interface Payload {
  id: string;
  authId: string;
  type: string;
}

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly token: TokenService,
    private readonly env: EnvironmentService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    let token: string | null = null;

    const { authorization } = request.headers;

    // 토큰은 존재하지 않지만 헤더값에 authorization가 존재하는 경우
    // authorization에서 토큰이 존재하는 체크
    if (authorization) {
      const parts = authorization.split(' ');
      if (parts.length === 2) {
        const scheme = parts[0];
        const credentials = parts[1];

        if (/^Bearer$/i.test(scheme)) {
          token = credentials;
        }
      } else {
        throw new ForbiddenException(
          `Bad Authorization header format. Format is "Authorization: Bearer <token>"`,
        );
      }
    } else {
      token = request.cookies[this.env.getCookieName()];
    }

    if (!token) {
      return true;
    }

    let payload: (JwtPayload & Payload) | null = null;
    try {
      payload = await this.token.verifyJwt(token);
    } catch (error) {
      payload = null;
      if (error instanceof TokenExpiredError) {
        request.isExpiredToken = true;
      }
    }

    if (!payload) {
      return true;
    }

    if (payload.type !== 'session') {
      request.isExpiredToken = true;
      return true;
    }

    const { authId, id, exp } = payload;

    const diff = differenceInMilliseconds(new Date(exp * 1000), new Date());
    console.log('diff ====>', diff);
    if (diff > 0) {
      const validated = await this.prisma.userAuthentication.findUnique({
        where: {
          id: authId,
        },
      });

      if (!validated) {
        request.isExpiredToken = true;
        return true;
      }

      if (validated.expiresAt.getTime() - Date.now() < 0) {
        request.isExpiredToken = true;
        return true;
      }

      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
        select: USER_SELECT,
      });

      if (
        validated.lastValidatedAt.getTime() >
        subMinutes(Date.now(), 5).getTime()
      ) {
        try {
          await this.prisma.userAuthentication.update({
            where: {
              id: authId,
            },
            data: {
              lastValidatedAt: new Date(),
            },
          });
        } catch (error) {
          console.log('error', error);
        }
      }

      request.user = user;
    } else {
      request.isExpiredToken = true;
    }
    return true;
  }
}
