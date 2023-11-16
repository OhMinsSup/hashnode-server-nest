import { Module } from '@nestjs/common';
import { NotificationsService } from '../notifications/services/notifications.service';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';

@Module({
  controllers: [TagsController],
  providers: [TagsService, NotificationsService],
})
export class TagsModule {}
