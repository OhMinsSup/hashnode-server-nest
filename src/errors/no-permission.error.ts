import { HttpExceptionOptions } from '@nestjs/common';
import { CustomBaseError } from './custom-base.error';
import type { BaseErrorData } from './error.type';

export class NoPermissionError<D = any> extends CustomBaseError<D> {
  constructor(
    input: BaseErrorData<D>,
    objectOrError?: string | object | any,
    descriptionOrOptions: string | HttpExceptionOptions = 'No permission',
  ) {
    super(input, objectOrError, descriptionOrOptions);
  }
}

export const assertNoPermission = <D = any>(
  condition: boolean,
  input: BaseErrorData<D>,
  objectOrError?: string | object | any,
  descriptionOrOptions: string | HttpExceptionOptions = 'No permission',
) => {
  if (condition) {
    throw new NoPermissionError(input, objectOrError, descriptionOrOptions);
  }
  return;
};
