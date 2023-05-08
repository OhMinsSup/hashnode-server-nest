import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';

// service
import { PostsService } from './posts.service';
import { TagsService } from '../tags/tags.service';
import { CommentsService } from '../comments/comments.service';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService, TagsService, CommentsService, NotificationsService],
})
export class PostsModule {}
