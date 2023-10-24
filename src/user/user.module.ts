import { Module } from '@nestjs/common';
import { CommentsService } from '../comments/comments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TagsService } from '../tags/tags.service';
import { PostsService } from '../posts/services/posts.service';
import { UserController } from './controllers/user.controller';

// service
import { UserService } from './services/user.service';

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
