import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

// service
import { PostsService } from '../services/posts.service';

// guard
import { LoggedInGuard } from '../../decorators/logged-in.decorator';
import { AuthUser } from '../../decorators/get-user.decorator';

// types
import { CreatePostInput } from '../input/create.input';
import { UpdatePostInput } from '../input/update.input';
import { PostListQuery, GetTopPostsQuery } from '../input/list.query';
import type { UserWithInfo } from '../../modules/database/prisma.interface';

@ApiTags('게시물')
@Controller('posts')
export class PostsController {
  constructor(private readonly service: PostsService) {}

  @Post()
  @ApiOperation({ summary: '게시글 작성' })
  @ApiBody({
    required: true,
    description: '게시글 작성 API',
    type: CreatePostInput,
  })
  @UseGuards(LoggedInGuard)
  create(@AuthUser() user: UserWithInfo, @Body() input: CreatePostInput) {
    return this.service.create(user, input);
  }

  @Get()
  @ApiOperation({ summary: '게시물 리스트' })
  @ApiQuery({
    name: 'query',
    type: PostListQuery,
    required: false,
    description: '페이지네이션',
  })
  list(@Query() query: PostListQuery) {
    return this.service.list(query);
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

  @Get('get-draft-posts')
  @ApiOperation({ summary: '작성중인 게시물 리스트' })
  @ApiQuery({
    name: 'query',
    type: PostListQuery,
    required: false,
    description: '페이지네이션',
  })
  @UseGuards(LoggedInGuard)
  getDraftPosts(@AuthUser() user: UserWithInfo, @Query() query: PostListQuery) {
    return this.service.getDrafts(user, query);
  }

  @Get('get-deleted-posts')
  @ApiOperation({ summary: '삭제된 게시물 리스트' })
  @ApiQuery({
    name: 'query',
    type: PostListQuery,
    required: false,
    description: '페이지네이션',
  })
  @UseGuards(LoggedInGuard)
  getDeletedPosts(
    @AuthUser() user: UserWithInfo,
    @Query() query: PostListQuery,
  ) {
    return this.service.getDeletedPosts(user, query);
  }

  @Put(':id')
  @ApiOperation({ summary: '게시글 수정' })
  @ApiBody({
    required: true,
    description: '게시글 수정 API',
    type: UpdatePostInput,
  })
  @UseGuards(LoggedInGuard)
  update(
    @AuthUser() user: UserWithInfo,
    @Param('id') id: string,
    @Body() input: UpdatePostInput,
  ) {
    return this.service.update(user, id, input);
  }

  @Delete(':id')
  @ApiOperation({ summary: '게시물 삭제' })
  @UseGuards(LoggedInGuard)
  delete(@AuthUser() user: UserWithInfo, @Param('id') id: string) {
    return this.service.delete(user, id);
  }

  @Get(':id')
  @ApiOperation({ summary: '게시물 상세 조회' })
  detail(@Param('id') id: string) {
    return this.service.detail(id);
  }

  @Post(':id/like')
  @ApiOperation({ summary: '게시글 좋아요' })
  @UseGuards(LoggedInGuard)
  like(@AuthUser() user: UserWithInfo, @Param('id') id: string) {
    return this.service.like(user, id);
  }

  @Delete(':id/like')
  @ApiOperation({ summary: '게시글 싫어요' })
  @UseGuards(LoggedInGuard)
  unlike(@AuthUser() user: UserWithInfo, @Param('id') id: string) {
    return this.service.unlike(user, id);
  }
}
