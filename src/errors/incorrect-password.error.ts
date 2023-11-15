import { BadRequestException, HttpExceptionOptions } from '@nestjs/common';
import type { BaseErrorData } from './error.type';

export class IncorrectPasswordError<D = any> extends BadRequestException {
  private readonly _input: BaseErrorData<D>;

  constructor(
    input: BaseErrorData<D>,
    objectOrError?: string | object | any,
    descriptionOrOptions:
      | string
      | HttpExceptionOptions = 'Password is incorrect',
  ) {
    super(objectOrError, descriptionOrOptions);

    this._input = input;
  }

  isCustomError(): this is { _input: BaseErrorData<D> } {
    return this._input !== undefined;
  }

  getData() {
    return this._input;
  }
}

export const assertIncorrectPassword = <D = any>(
  condition: boolean,
  input: BaseErrorData<D>,
  objectOrError?: string | object | any,
  descriptionOrOptions: string | HttpExceptionOptions = 'Password is incorrect',
) => {
  if (!condition) {
    throw new IncorrectPasswordError(
      input,
      objectOrError,
      descriptionOrOptions,
    );
  }
  return;
};
