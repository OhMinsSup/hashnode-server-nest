import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  constructor(
    private readonly config: ConfigService, // private readonly logger: Logger,
    private readonly logger: Logger,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof HttpException) {
          const statusCode = error.getStatus();
          const resp = error.getResponse() as string | Record<string, any>;
          console.log('error', error);
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
          return throwError(() => {
            const exception = new HttpException(resp, statusCode);
            if ([401, 403, 404].includes(statusCode)) {
              // somting...
            } else {
              this.logger.error(
                exception.message,
                exception.stack,
                'ExceptionInterceptor',
              );
            }
            return exception;
          });
        } else if (error instanceof Error) {
          return throwError(() => {
            const exception = new HttpException(
              {
                message: error.message,
                error: error.name,
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
            this.logger.error(
              exception.message,
              exception.stack,
              'ExceptionInterceptor',
            );
            return exception;
          });
        }
        return throwError(() => {
          const exception = new HttpException(
            'Exception interceptor message',
            HttpStatus.BAD_GATEWAY,
          );
          this.logger.error(
            exception.message,
            exception.stack,
            'ExceptionInterceptor',
          );
          return exception;
        });
      }),
    );
  }
}
