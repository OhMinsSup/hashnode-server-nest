import { Module } from '@nestjs/common';

// controllers
import { PostsController } from './controllers/posts.controller';

// services
import { PostsService } from './services/posts.service';
import { TagsService } from '../tags/services/tags.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService, TagsService],
})
export class PostsModule {}
