import { Module } from '@nestjs/common';
import { CommentsService } from 'src/comments/comments.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { TagsService } from '../tags/tags.service';
import { PostsService } from '../posts/posts.service';
import { UserController } from './user.controller';

// service
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    TagsService,
    PostsService,
    CommentsService,
    NotificationsService,
  ],
})
export class UserModule {}
