import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TokenService } from '../auth/services/token.service';
import { AuthenticationGuard } from './authentication.guard';

@Module({
  imports: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    TokenService,
  ],
})
export class AuthenticationGuardModule {}
