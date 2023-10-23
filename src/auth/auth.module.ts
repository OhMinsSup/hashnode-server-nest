import { Logger, Module } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, NotificationsService, Logger],
})
export class AuthModule {}
