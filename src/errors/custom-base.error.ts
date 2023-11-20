import { HttpException, HttpExceptionOptions } from '@nestjs/common';
import type { BaseErrorData } from './error.type';

export class CustomBaseError<D = any> extends HttpException {
  private readonly _input: BaseErrorData<D>;

  constructor(
    input: BaseErrorData<D>,
    response: string | Record<string, any>,
    status: number,
    options?: HttpExceptionOptions,
  ) {
    super(response, status, options);

    this._input = input;
  }

  isCustomError(): this is CustomBaseError<D> {
    return (
      this._input !== undefined &&
      Object.prototype.hasOwnProperty.call(this, 'getData')
    );
  }

  getData() {
    return this._input;
  }
}

export const assertCustomError = <D = any>(
  condition: boolean,
  input: BaseErrorData<D>,
  response: string | Record<string, any>,
  status: number,
  options?: HttpExceptionOptions,
) => {
  if (condition) {
    throw new CustomBaseError(input, response, status, options);
  }
  return;
};
