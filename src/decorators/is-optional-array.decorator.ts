import { ValidationOptions, ValidateBy, buildMessage } from 'class-validator';

export const IS_OPTIONAL_ARRAY = 'isOptionalArray';

/**
 * Checks if value is missing and if not, checks if the value is an array.
 */
export function isOptionalArray(value: unknown): boolean {
  return Array.isArray(value) || value === undefined;
}

/**
 * Checks if value is missing and if not, checks if the value is an array.
 */
export function IsOptionalArray(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: IS_OPTIONAL_ARRAY,
      validator: {
        validate: (value): boolean => isOptionalArray(value),
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + '$property must be an empty value or an array',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
