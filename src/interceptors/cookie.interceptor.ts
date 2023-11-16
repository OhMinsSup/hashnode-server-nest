import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { EnvironmentService } from '../integrations/environment/environment.service';
import { TokenService } from '../auth/services/token.service';
import { JwtPayload } from 'jsonwebtoken';

export interface Data<T> {
  result: T;
  resultCode: number;
  message: string | string[] | null;
  error: string | null;
}

@Injectable()
export class CookiInterceptor<T>
  implements NestInterceptor<T, Promise<Data<T>>>
{
  constructor(
    private readonly env: EnvironmentService,
    private readonly token: TokenService,
  ) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Promise<Data<T>>> {
    const ctx = context.switchToHttp();
    const res = ctx.getResponse<Response>();
    const cookieData = this.env.generateCookie();
    return next.handle().pipe(
      map(async (data) => {
        const authToken = data?.result?.authToken ?? null;
        if (authToken) {
          let payload: JwtPayload | null = null;
          try {
            payload = await this.token.verifyJwt(authToken);
          } catch (error) {
            payload = null;
          }

          if (!payload) {
            return data;
          }

          const { exp } = payload;

          res.cookie(cookieData.name, authToken, {
            httpOnly: cookieData.httpOnly,
            domain: cookieData.domain,
            path: cookieData.path,
            expires: new Date(exp * 1000),
            sameSite: cookieData.sameSite,
          });
        }
        return data;
      }),
    );
  }
}
