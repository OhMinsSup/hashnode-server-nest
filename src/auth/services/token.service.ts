import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EnvironmentService } from '../../integrations/environment/environment.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly env: EnvironmentService,
  ) {}

  /**
   * @description API 요청에 사용되어 저장된 세션 토큰을 반환합니다. 클라이언트 브라우저 쿠키에서 로그인 상태를 유지.
   * @param {string} id
   * @param {Record<string, any>?} payload
   */
  getJwtToken(id: string, payload?: Record<string, any>) {
    const expiresIn = this.env.getAuthTokenExpiresIn();
    const jwtSecret = this.env.getJwtSecret();
    const issuer = this.env.getJwtIssuer();
    return this.jwt.sign(
      {
        id,
        type: 'session',
        ...payload,
      },
      {
        expiresIn,
        issuer,
        secret: jwtSecret,
      },
    );
  }

  /**
   * @description 토큰 검증
   * @param {string} token
   */
  async verifyJwt(token: string) {
    try {
      const jwtSecret = this.env.getJwtSecret();
      return this.jwt.verifyAsync(
        token,
        jwtSecret ? { secret: jwtSecret } : undefined,
      );
    } catch (error) {
      throw error;
    }
  }
}
