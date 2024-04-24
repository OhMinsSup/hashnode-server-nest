import { ValidationOptions, ValidateBy, buildMessage } from 'class-validator';

export const IS_OPTIONAL_JSON_STRINGIFY = 'isOptionalJsonStringify';

function isJsonStringify(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Checks if value is missing and if not, checks if the string is a JSON string.
 */
export function isOptionalJsonStringify(value: unknown): boolean {
  return typeof value === 'string'
    ? value === '' || isJsonStringify(value)
    : value === undefined || value === null;
}

/**
 * Checks if value is missing and if not, checks if the string is a JSON string.
 */
export function IsOptionalJsonStringify(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: IS_OPTIONAL_JSON_STRINGIFY,
      validator: {
        validate: (value): boolean => isOptionalJsonStringify(value),
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + '$property must be an empty value or a JSON string',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
