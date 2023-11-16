import { HttpExceptionOptions } from '@nestjs/common';
import { CustomBaseError } from './custom-base.error';
import type { BaseErrorData } from './error.type';

export class UserExistsError<D = any> extends CustomBaseError<D> {
  constructor(
    input: BaseErrorData<D>,
    objectOrError?: string | object | any,
    descriptionOrOptions: string | HttpExceptionOptions = 'User already exists',
  ) {
    super(input, objectOrError, descriptionOrOptions);
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
