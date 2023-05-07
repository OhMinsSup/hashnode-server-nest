import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaService } from '../modules/database/prisma.service';

@Module({
  providers: [NotificationsService, PrismaService],
  controllers: [NotificationsController],
})
export class NotificationsModule {}