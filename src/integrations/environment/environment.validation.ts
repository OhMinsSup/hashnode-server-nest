import { plainToClass } from 'class-transformer';
import {
  IsEnum,
  IsNumberString,
  IsString,
  validateSync,
} from 'class-validator';
import { assert } from '../../libs/assertion';
import { IsDuration } from '../../decorators/is-duration.decorator';

export class EnvironmentVariables {
  // -----------------------------------------------------------------------------
  // app
  // -----------------------------------------------------------------------------
  @IsNumberString()
  PORT: string;

  @IsString()
  DATABASE_URL: string;

  // -----------------------------------------------------------------------------
  // password
  // -----------------------------------------------------------------------------
  @IsNumberString()
  SALT_ROUNDS: string;

  // -----------------------------------------------------------------------------
  // env
  // -----------------------------------------------------------------------------
  @IsString()
  @IsEnum(['development', 'production', 'test', 'local'])
  NODE_ENV: string;

  @IsString()
  @IsEnum(['development', 'production', 'test', 'local'])
  DEPLOY_GROUP: string;

  // -----------------------------------------------------------------------------
  // Cookie
  // -----------------------------------------------------------------------------
  @IsString()
  COOKIE_TOKEN_NAME: string;

  @IsString()
  COOKIE_PATH: string;

  @IsString()
  @IsEnum(['lax', 'none', 'strict'])
  COOKIE_SAMESITE: string;

  @IsString()
  COOKIE_DOMAIN: string;

  @IsString()
  COOKIE_SECRET: string;

  // -----------------------------------------------------------------------------
  // token
  // -----------------------------------------------------------------------------
  @IsDuration()
  AUTH_TOKEN_EXPIRES_IN: string;

  // -----------------------------------------------------------------------------
  // Jwt
  // -----------------------------------------------------------------------------
  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_ISSUER: string;

  // -----------------------------------------------------------------------------
  // Hash
  // -----------------------------------------------------------------------------
  @IsString()
  HASH_SECRET: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config);

  const errors = validateSync(validatedConfig);
  assert(!errors.length, errors.toString());

  return validatedConfig;
}
