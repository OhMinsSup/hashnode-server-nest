import { ValidationOptions, ValidateBy, buildMessage } from 'class-validator';

export const IS_DATE_STRING = 'isDateString';

/**
 * Checks if the string is a valid date string.
 */
export function isDateString(value: unknown): boolean {
  return typeof value === 'string' && !isNaN(Date.parse(value));
}

/**
 * Checks if the string is a valid date string.
 */
export function IsDateString(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: IS_DATE_STRING,
      validator: {
        validate: (value): boolean => isDateString(value),
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + '$property must be a valid date string',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
