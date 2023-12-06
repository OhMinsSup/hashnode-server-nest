import { Module } from '@nestjs/common';
import { PostsController } from './controllers/posts.controller';

// service
import { PostsService } from './services/posts.service';
import { TagsService } from '../tags/services/tags.service';
import { NotificationsService } from '../notifications/services/notifications.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService, TagsService, NotificationsService],
})
export class PostsModule {}
