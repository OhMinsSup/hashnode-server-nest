import { Logger, Module } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, NotificationsService, Logger],
})
export class AuthModule {}
