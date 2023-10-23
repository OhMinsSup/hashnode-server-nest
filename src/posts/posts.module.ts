import { Module } from '@nestjs/common';
import { PostsController } from './controllers/posts.controller';

// service
import { PostsService } from './services/posts.service';
import { TagsService } from '../tags/tags.service';
import { CommentsService } from '../comments/comments.service';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  imports: [],
  controllers: [PostsController],
  providers: [PostsService, TagsService, CommentsService, NotificationsService],
})
export class PostsModule {}
