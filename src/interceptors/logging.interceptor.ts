import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const now = Date.now();
    const message = `${req.method} : ${req.url} -  ${JSON.stringify(req.body)}`;
    this.logger.log('Before...', message);
    return next.handle().pipe(
      tap((value) => {
        const res = ctx.getResponse();
        const message = `${req.method} : ${req.url} - ${
          res.statusCode
        } ${JSON.stringify(value)}`;
        return this.logger.log(`After... ${Date.now() - now}ms`, message);
      }),
    );
  }
}
