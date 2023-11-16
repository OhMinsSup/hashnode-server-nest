import { HttpExceptionOptions } from '@nestjs/common';
import { CustomBaseError } from './custom-base.error';
import type { BaseErrorData } from './error.type';

export class IncorrectPasswordError<D = any> extends CustomBaseError<D> {
  constructor(
    input: BaseErrorData<D>,
    objectOrError?: string | object | any,
    descriptionOrOptions:
      | string
      | HttpExceptionOptions = 'Password is incorrect',
  ) {
    super(input, objectOrError, descriptionOrOptions);
  }
}

export const assertIncorrectPassword = <D = any>(
  condition: boolean,
  input: BaseErrorData<D>,
  objectOrError?: string | object | any,
  descriptionOrOptions: string | HttpExceptionOptions = 'Password is incorrect',
) => {
  if (condition) {
    throw new IncorrectPasswordError(
      input,
      objectOrError,
      descriptionOrOptions,
    );
  }
  return;
};
