import { NotFoundException, HttpExceptionOptions } from '@nestjs/common';
import type { BaseErrorData } from './error.type';

export class UserNotFoundError<D = any> extends NotFoundException {
  private readonly _input: BaseErrorData<D>;

  constructor(
    input: BaseErrorData<D>,
    objectOrError?: string | object | any,
    descriptionOrOptions: string | HttpExceptionOptions = 'User not found',
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

export const assertUserNotFound = <D = any>(
  condition: boolean,
  input: BaseErrorData<D>,
  objectOrError?: string | object | any,
  descriptionOrOptions: string | HttpExceptionOptions = 'User not found',
) => {
  if (!condition) {
    throw new UserNotFoundError(input, objectOrError, descriptionOrOptions);
  }
  return;
};
