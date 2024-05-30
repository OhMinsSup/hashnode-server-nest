import { Module } from '@nestjs/common';

// controllers
import { PostsController } from './controllers/posts.controller';

// services
import { PostsService } from './services/posts.service';
import { TagsService } from '../tags/services/tags.service';
import { PasswordService } from '../auth/services/password.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService, TagsService, PasswordService],
})
export class PostsModule {}
