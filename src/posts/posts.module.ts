import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';

// service
import { PostsService } from './posts.service';
import { PrismaService } from '../modules/database/prisma.service';
import { TagsService } from '../tags/tags.service';
import { CommentsService } from '../comments/comments.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService, PrismaService, TagsService, CommentsService],
})
export class PostsModule {}
