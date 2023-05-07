import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  constructor(
    private readonly config: ConfigService, // private readonly logger: Logger,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        console.log('error', error);
        if (error instanceof HttpException) {
          const statusCode = error.getStatus();
          const resp = error.getResponse() as string | Record<string, any>;
          if (statusCode === HttpStatus.UNAUTHORIZED) {
            context
              .switchToHttp()
              .getResponse()
              .clearCookie(this.config.get('COOKIE_TOKEN_NAME'), {
                httpOnly: true,
                domain: this.config.get('COOKIE_DOMAIN'),
                path: this.config.get('COOKIE_PATH'),
                sameSite: this.config.get('COOKIE_SAMESITE'),
              });
          }
          return throwError(() => new HttpException(resp, statusCode));
        }
        return throwError(() => {
          return new HttpException(
            'Exception interceptor message',
            HttpStatus.BAD_GATEWAY,
          );
        });
      }),
    );
  }
}
