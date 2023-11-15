import { Module } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, NotificationsService, TokenService],
})
export class AuthModule {}
