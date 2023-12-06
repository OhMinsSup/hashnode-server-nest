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
import { EXCEPTION_CODE } from '../constants/exception.code';

export interface Data<T> {
  result: T;
  resultCode: number;
  message: string | string[] | null;
  error: string | null;
}

@Injectable()
export class CookieClearInterceptor<T>
  implements NestInterceptor<T, Promise<Data<T>>>
{
  constructor(private readonly env: EnvironmentService) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Promise<Data<T>>> {
    const ctx = context.switchToHttp();
    const res = ctx.getResponse<Response>();
    const cookieData = this.env.generateCookie();
    return next.handle().pipe(
      map(async (data) => {
        const isOk = data?.resultCode === EXCEPTION_CODE.OK;
        if (isOk) res.clearCookie(cookieData.name);
        return data;
      }),
    );
  }
}
