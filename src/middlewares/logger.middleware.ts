import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent');

    res.on('finish', () => {
      const { statusCode } = res;

      if (statusCode >= 400 && statusCode < 500) {
        if ([403, 404, 401].includes(statusCode)) {
          // somting...
        } else {
          this.logger.warn(
            `[${method}]${originalUrl}(${statusCode}) ${ip} ${userAgent}`,
          );
        }
      } else if (statusCode >= 500) {
        this.logger.error(
          `[${method}]${originalUrl}(${statusCode}) ${ip} ${userAgent}`,
        );
      }
    });

    next();
  }
}
