import { Module } from '@nestjs/common';
import { PostsController } from './controllers/posts.controller';

// service
import { PostsService } from './services/posts.service';
import { TagsService } from '../tags/tags.service';
import { NotificationsService } from '../notifications/services/notifications.service';

@Module({
  imports: [],
  controllers: [PostsController],
  providers: [PostsService, TagsService, NotificationsService],
})
export class PostsModule {}
