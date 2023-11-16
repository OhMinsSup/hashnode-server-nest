import { Module } from '@nestjs/common';
import { NotificationsService } from '../notifications/services/notifications.service';
import { TagsService } from '../tags/tags.service';
import { PostsService } from '../posts/services/posts.service';
import { UserController } from './controllers/user.controller';

// service
import { UserService } from './services/user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, TagsService, PostsService, NotificationsService],
})
export class UserModule {}
