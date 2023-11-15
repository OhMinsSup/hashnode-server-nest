import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';

@Injectable()
export class EnvironmentService {
  constructor(private configService: ConfigService) {}

  // -----------------------------------------------------------------------------
  // app
  // -----------------------------------------------------------------------------
  getPort(): number {
    const port = this.configService.get<string>('PORT');
    return Number(port);
  }

  getDataBaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL');
  }

  // -----------------------------------------------------------------------------
  // password
  // -----------------------------------------------------------------------------
  getSaltRounds(): number {
    const saltRounds = this.configService.get<string>('SALT_ROUNDS');
    return Number(saltRounds);
  }

  // -----------------------------------------------------------------------------
  // env
  // -----------------------------------------------------------------------------
  getEnv() {
    return this.configService.get<
      'development' | 'production' | 'test' | 'local'
    >('NODE_ENV');
  }

  getDeployGroup() {
    return this.configService.get<
      'development' | 'production' | 'test' | 'local'
    >('DEPLOY_GROUP');
  }

  // -----------------------------------------------------------------------------
  // Cookie
  // -----------------------------------------------------------------------------
  getCookieName(): string {
    return this.configService.get<string>('COOKIE_TOKEN_NAME');
  }

  getCookieSecret(): string {
    return this.configService.get<string>('COOKIE_SECRET');
  }

  getCookiePath(): string {
    return this.configService.get<string>('COOKIE_PATH');
  }

  getCookieSameSite() {
    return this.configService.get<'lax' | 'none' | 'strict'>('COOKIE_SAMESITE');
  }

  getCookieDomain(): string {
    return this.configService.get<string>('COOKIE_DOMAIN');
  }

  generateCookie() {
    return {
      httpOnly: true,
      path: this.getCookiePath(),
      domain: this.getCookieDomain(),
      sameSite: this.getCookieSameSite(),
      expires: this.getAuthTokenExpiresIn(),
    };
  }

  // -----------------------------------------------------------------------------
  // Jwt
  // -----------------------------------------------------------------------------
  getJwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET');
  }

  getJwtIssuer(): string {
    return this.configService.get<string>('JWT_ISSUER');
  }

  // -----------------------------------------------------------------------------
  // token
  // -----------------------------------------------------------------------------
  getAuthTokenExpiresIn(): string {
    return this.configService.get<string>('AUTH_TOKEN_EXPIRES_IN');
  }

  getAuthTokenExpiresAt() {
    const expiresIn = this.getAuthTokenExpiresIn();
    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));
    return expiresAt;
  }
}
