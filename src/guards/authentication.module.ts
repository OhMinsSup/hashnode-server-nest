import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TokenService } from '../auth/services/token.service';
import { AuthenticationGuard } from './authentication.guard';
import { PasswordService } from '../auth/services/password.service';

@Module({
  imports: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    TokenService,
    PasswordService,
  ],
})
export class AuthenticationGuardModule {}
