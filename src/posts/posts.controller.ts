import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

// service
import { PostsService } from './posts.service';

// dto
import { CreateRequestDto } from './dto/create.request.dto';
import {
  PostListRequestDto,
  GetTopPostsRequestDto,
} from './dto/list.request.dto';

// guard
import { LoggedInGuard } from '../modules/auth/logged-in.guard';
import { AuthUser, type AuthUserSchema } from '../libs/get-user.decorator';

@ApiTags('게시물')
@Controller('api/v1/posts')
export class PostsController {
  constructor(private readonly service: PostsService) {}

  @Get()
  @ApiOperation({ summary: '게시물 리스트' })
  @ApiQuery({
    name: 'query',
    type: PostListRequestDto,
    required: false,
    description: '페이지네이션',
  })
  list(@Query() query: PostListRequestDto) {
    return this.service.list(query);
  }

  @Get('get-top-posts')
  @ApiOperation({ summary: '화면 위에 보이는 포스트 정보' })
  @ApiQuery({
    name: 'query',
    type: GetTopPostsRequestDto,
    required: true,
    description: '조회 기간',
  })
  getTopPosts(@Query() query: GetTopPostsRequestDto) {
    return this.service.getTopPosts(query);
  }

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

  @Get(':id')
  @ApiOperation({ summary: '게시물 상세 조회' })
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.service.detail(id);
  }

  @Post(':id/like')
  @ApiOperation({ summary: '게시글 좋아요' })
  @UseGuards(LoggedInGuard)
  like(
    @AuthUser() user: AuthUserSchema,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.like(user, id);
  }

  @Delete(':id/like')
  @ApiOperation({ summary: '게시글 싫어요' })
  @UseGuards(LoggedInGuard)
  unlike(
    @AuthUser() user: AuthUserSchema,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.unlike(user, id);
  }
}
