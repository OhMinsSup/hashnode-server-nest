import { ValidationOptions, ValidateBy, buildMessage } from 'class-validator';
import { isDateString } from './is-date-string.decorator';

export const IS_DATE_RANGE = 'isDateRange';

/**
 * Checks if the value is a valid date range.
 */

export function isDateRange(value: unknown): boolean {
  const now = new Date();
  if (isDateString(value)) {
    const date = new Date(value as string);
    return date <= now;
  }
  return false;
}

/**
 * Checks if the value is a valid date range.
 */
export function IsDateRange(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: IS_DATE_RANGE,
      validator: {
        validate: (value): boolean => isDateRange(value),
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + '$property must be a valid date range',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
