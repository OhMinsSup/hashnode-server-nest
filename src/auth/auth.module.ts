import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { PasswordService } from './services/password.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, TokenService, PasswordService],
})
export class AuthModule {}
