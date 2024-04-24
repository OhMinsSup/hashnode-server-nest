import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

// services
import { PostsService } from '../services/posts.service';

// input
import { PostCreateInput } from '../input/post-create.input';

// decorators
import { LoggedInGuard } from '../../decorators/logged-in.decorator';
import { AuthUser } from '../../decorators/get-user.decorator';
import { NotLoggedInGuard } from '../../decorators/not-logged-in.decorator';

// types
import type { SerializeUser } from '../../integrations/serialize/serialize.interface';

@ApiTags('게시글')
@Controller('posts')
export class PostsController {
  constructor(private readonly service: PostsService) {}

  @Post()
  @ApiOperation({ summary: '게시글 생성' })
  @ApiBody({
    required: true,
    description: '게시글 생성 API',
    type: PostCreateInput,
  })
  @UseGuards(LoggedInGuard)
  create(@Body() input: PostCreateInput, @AuthUser() user: SerializeUser) {
    return this.service.create(user, input);
  }

  @Get(':id')
  @ApiOperation({ summary: '게시글 조회' })
  @UseGuards(NotLoggedInGuard)
  byId(@Param('id') id: string, @AuthUser() user: SerializeUser) {
    return this.service.byId(user, id);
  }

  @Get('by-owner/:id')
  @ApiOperation({ summary: '게시글 조회 (작성자)' })
  @UseGuards(LoggedInGuard)
  byOwner(@Param('id') id: string, @AuthUser() user: SerializeUser) {
    return this.service.byOwner(user, id);
  }
}
