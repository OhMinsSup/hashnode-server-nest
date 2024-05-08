import { ValidationOptions, ValidateIf } from 'class-validator';

/**
 * Checks if value is missing or is an number and if so, ignores all validators.
 */
export function IsOptionalNumber(validationOptions?: ValidationOptions) {
  return ValidateIf((obj, value) => {
    return (
      value !== null &&
      value !== undefined &&
      typeof value !== 'number' &&
      !isNaN(value)
    );
  }, validationOptions);
}
