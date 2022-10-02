import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';

// service
import { PostsService } from './posts.service';

// dto
import { CreateRequestDto } from './dto/create.request.dto';

// guard
import { LoggedInGuard } from '../modules/auth/logged-in.guard';
import { AuthUser, type AuthUserSchema } from '../libs/get-user.decorator';

@ApiTags('게시물')
@Controller('api/v1/posts')
export class PostsController {
  constructor(private readonly service: PostsService) {}

  @Post()
  @ApiOperation({ summary: '게시글 작성' })
  @ApiBody({
    required: true,
    description: '게시글 작성 API',
    type: 'object',
  })
  @UseGuards(LoggedInGuard)
  create(@AuthUser() user: AuthUserSchema, @Body() input: CreateRequestDto) {
    return this.service.create(user, input);
  }
}
