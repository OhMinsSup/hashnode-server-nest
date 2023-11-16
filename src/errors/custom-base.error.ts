import { BadRequestException, HttpExceptionOptions } from '@nestjs/common';
import type { BaseErrorData } from './error.type';

export class CustomBaseError<D = any> extends BadRequestException {
  private readonly _input: BaseErrorData<D>;

  constructor(
    input: BaseErrorData<D>,
    objectOrError?: string | object | any,
    descriptionOrOptions?: string | HttpExceptionOptions | undefined,
  ) {
    super(objectOrError, descriptionOrOptions);

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
  objectOrError?: string | object | any,
  descriptionOrOptions?: string | HttpExceptionOptions | undefined,
) => {
  if (condition) {
    throw new CustomBaseError(input, objectOrError, descriptionOrOptions);
  }
  return;
};
