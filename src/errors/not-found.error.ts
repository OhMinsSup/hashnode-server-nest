import { HttpExceptionOptions } from '@nestjs/common';
import { CustomBaseError } from './custom-base.error';
import type { BaseErrorData } from './error.type';

export class NotFoundError<D = any> extends CustomBaseError<D> {
  constructor(
    input: BaseErrorData<D>,
    objectOrError?: string | object | any,
    descriptionOrOptions: string | HttpExceptionOptions = 'Not found',
  ) {
    super(input, objectOrError, descriptionOrOptions);
  }
}

export const assertNotFound = <D = any>(
  condition: boolean,
  input: BaseErrorData<D>,
  objectOrError?: string | object | any,
  descriptionOrOptions: string | HttpExceptionOptions = 'Not found',
) => {
  if (condition) {
    throw new NotFoundError(input, objectOrError, descriptionOrOptions);
  }
  return;
};
