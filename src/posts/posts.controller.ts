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
import { PostListQuery, GetTopPostsQuery } from './dto/list';

// guard
import { LoggedInGuard } from '../modules/guard/logged-in.guard';
import { AuthUser } from '../libs/get-user.decorator';
import type { UserWithInfo } from '../modules/database/select/user.select';

@ApiTags('게시물')
@Controller('api/v1/posts')
export class PostsController {
  constructor(private readonly service: PostsService) {}

  @Get()
  @ApiOperation({ summary: '게시물 리스트' })
  @ApiQuery({
    name: 'query',
    type: PostListQuery,
    required: false,
    description: '페이지네이션',
  })
  list(@Query() query: PostListQuery, @AuthUser() user?: UserWithInfo) {
    return this.service.list(query, user);
  }

  @Get('get-likes')
  @ApiOperation({ summary: '좋아요한 게시물 리스트' })
  @ApiQuery({
    name: 'query',
    type: PostListQuery,
    required: false,
    description: '페이지네이션',
  })
  @UseGuards(LoggedInGuard)
  getLikes(@AuthUser() user: UserWithInfo, @Query() query: PostListQuery) {
    return this.service.getLikes(user, query);
  }

  @Get('get-top-posts')
  @ApiOperation({ summary: '화면 위에 보이는 포스트 정보' })
  @ApiQuery({
    name: 'query',
    type: GetTopPostsQuery,
    required: true,
    description: '조회 기간',
  })
  getTopPosts(@Query() query: GetTopPostsQuery) {
    return this.service.getTopPosts(query);
  }

  @Post()
  @ApiOperation({ summary: '게시글 작성' })
  @ApiBody({
    required: true,
    description: '게시글 작성 API',
    type: CreateRequestDto,
  })
  @UseGuards(LoggedInGuard)
  create(@AuthUser() user: UserWithInfo, @Body() input: CreateRequestDto) {
    return this.service.create(user, input);
  }

  @Get(':id')
  @ApiOperation({ summary: '게시물 상세 조회' })
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.service.detail(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '게시물 삭제' })
  @UseGuards(LoggedInGuard)
  delete(
    @AuthUser() user: UserWithInfo,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.delete(user, id);
  }

  @Post(':id/like')
  @ApiOperation({ summary: '게시글 좋아요' })
  @UseGuards(LoggedInGuard)
  like(@AuthUser() user: UserWithInfo, @Param('id', ParseIntPipe) id: number) {
    return this.service.like(user, id);
  }

  @Delete(':id/like')
  @ApiOperation({ summary: '게시글 싫어요' })
  @UseGuards(LoggedInGuard)
  unlike(
    @AuthUser() user: UserWithInfo,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.unlike(user, id);
  }
}
