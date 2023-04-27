import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

// service
import { CommentsService } from './comments.service';

@ApiTags('게시물 댓글')
@Controller('/api/v1/comments')
export class CommentsController {
  constructor(private readonly service: CommentsService) { }
}
