import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';

// service
import { PrismaService } from '../modules/database/prisma.service';
import { CommentsService } from './comments.service';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, PrismaService]
})
export class CommentsModule { }
