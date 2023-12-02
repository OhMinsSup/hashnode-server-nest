import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { CustomBaseError } from '../errors/custom-base.error';
import { EXCEPTION_CODE } from '../constants/exception.code';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException | CustomBaseError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    console.log('exception ======================');
    console.log(exception.message);
    console.log(exception.stack);
    console.log(exception.cause);
    console.log('exception ======================');

    if (exception instanceof CustomBaseError) {
      const data = exception.getData();
      return response.status(status).json(data);
    }

    const errorJSON = {
      resultCode: EXCEPTION_CODE.FAIL,
      message: null,
      error: null,
      result: null,
    };

    response.status(status).json(errorJSON);
  }
}
