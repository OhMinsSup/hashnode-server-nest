import { HttpExceptionOptions } from '@nestjs/common';
import { CustomBaseError } from './custom-base.error';
import type { BaseErrorData } from './error.type';

export class UsernameExistsError<D = any> extends CustomBaseError<D> {
  constructor(
    input: BaseErrorData<D>,
    objectOrError?: string | object | any,
    descriptionOrOptions:
      | string
      | HttpExceptionOptions = 'Username already exists',
  ) {
    super(input, objectOrError, descriptionOrOptions);
  }
}

export const assertUsernameExists = <D = any>(
  condition: boolean,
  input: BaseErrorData<D>,
  objectOrError?: string | object | any,
  descriptionOrOptions:
    | string
    | HttpExceptionOptions = 'Username already exists',
) => {
  if (condition) {
    throw new UsernameExistsError(input, objectOrError, descriptionOrOptions);
  }
  return;
};
