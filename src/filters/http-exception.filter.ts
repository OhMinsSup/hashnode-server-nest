import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { CustomBaseError } from '../errors/custom-base.error';
import { EXCEPTION_CODE } from '../constants/exception.code';
import { HttpAdapterHost } from '@nestjs/core';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private _contextName = 'http-exception-filter - api';

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: Logger,
  ) {}

  // constructor(private readonly logger: LOgger) {}
  catch(exception: HttpException | CustomBaseError, host: ArgumentsHost) {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    if (exception instanceof CustomBaseError) {
      const body = Object.assign({}, responseBody, exception.getData());
      this.logger.error(body.message, exception.stack, this._contextName);
      httpAdapter.reply(ctx.getResponse(), body, status);
      return;
    }

    if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse() as any;
      const error = errorResponse.message || errorResponse.error;
      const message = errorResponse.message || errorResponse.message;
      const result = errorResponse.result || null;
      this.logger.error(error, exception.stack, this._contextName);
      const body = Object.assign({}, responseBody, {
        resultCode: EXCEPTION_CODE.FAIL,
        message,
        error,
        result,
      });
      httpAdapter.reply(ctx.getResponse(), body, status);
      return;
    }

    this.logger.error(
      '알 수 없는 오류가 발생했습니다.',
      undefined,
      this._contextName,
    );
    const body = Object.assign({}, responseBody, {
      resultCode: EXCEPTION_CODE.FAIL,
      message: '알 수 없는 오류가 발생했습니다.',
      error: null,
      result: null,
    });
    httpAdapter.reply(ctx.getResponse(), body, status);
  }
}
