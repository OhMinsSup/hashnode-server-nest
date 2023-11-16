import { HttpExceptionOptions } from '@nestjs/common';
import { CustomBaseError } from './custom-base.error';
import type { BaseErrorData } from './error.type';

export class UserNotFoundError<D = any> extends CustomBaseError<D> {
  constructor(
    input: BaseErrorData<D>,
    objectOrError?: string | object | any,
    descriptionOrOptions: string | HttpExceptionOptions = 'User not found',
  ) {
    super(input, objectOrError, descriptionOrOptions);
  }
}

export const assertUserNotFound = <D = any>(
  condition: boolean,
  input: BaseErrorData<D>,
  objectOrError?: string | object | any,
  descriptionOrOptions: string | HttpExceptionOptions = 'User not found',
) => {
  if (condition) {
    throw new UserNotFoundError(input, objectOrError, descriptionOrOptions);
  }
  return;
};
