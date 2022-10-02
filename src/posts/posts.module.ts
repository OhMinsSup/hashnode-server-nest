import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';

// service
import { PostsService } from './posts.service';
import { PrismaService } from '../modules/database/prisma.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService, PrismaService],
})
export class PostsModule {}
