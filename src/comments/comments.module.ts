import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';

// service
import { CommentsService } from './comments.service';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
