import { BadRequestException, HttpExceptionOptions } from '@nestjs/common';
import type { BaseErrorData } from './error.type';

export class UserExistsError<D = any> extends BadRequestException {
  private readonly _input: BaseErrorData<D>;

  constructor(
    input: BaseErrorData<D>,
    objectOrError?: string | object | any,
    descriptionOrOptions: string | HttpExceptionOptions = 'User already exists',
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

export const assertUserExists = <D = any>(
  condition: boolean,
  input: BaseErrorData<D>,
  objectOrError?: string | object | any,
  descriptionOrOptions: string | HttpExceptionOptions = 'User already exists',
) => {
  if (condition) {
    throw new UserExistsError(input, objectOrError, descriptionOrOptions);
  }
  return;
};
