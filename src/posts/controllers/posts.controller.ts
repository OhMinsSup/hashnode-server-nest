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
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

// services
import { PostsService } from '../services/posts.service';

// input
import { PostCreateInput } from '../input/post-create.input';
import { PostPublishedListQuery } from '../input/post-published-list.query';
import { PostUpdateInput } from '../input/post-update.input';
import { PostListQuery } from '../input/post-list.query';

// decorators
import { LoggedInGuard } from '../../decorators/logged-in.decorator';
import { AuthUser } from '../../decorators/get-user.decorator';
import { NotLoggedInGuard } from '../../decorators/not-logged-in.decorator';

// types
import type { SerializeUser } from '../../integrations/serialize/serialize.interface';
import { Throttle } from '@nestjs/throttler';

@ApiTags('게시글')
@Controller('posts')
export class PostsController {
  constructor(private readonly service: PostsService) {}

  @Get()
  @ApiOperation({ summary: '게시글 목록' })
  @ApiBody({
    required: true,
    description: '게시글 생성 API',
    type: PostListQuery,
  })
  list(@AuthUser() user: SerializeUser, @Query() query: PostListQuery) {
    return this.service.list(user, query);
  }

  @Throttle({ default: { limit: 10, ttl: 60 } })
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

  @Get('published')
  @ApiOperation({ summary: '내가 작성한 게시글 목록 (공개)' })
  @ApiQuery({
    name: 'query',
    type: PostPublishedListQuery,
    required: false,
    description: '내가 작성한 게시글 목록 (공개)',
  })
  @UseGuards(LoggedInGuard)
  published(
    @AuthUser() user: SerializeUser,
    @Query() query: PostPublishedListQuery,
  ) {
    return this.service.published(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '게시글 조회' })
  @UseGuards(NotLoggedInGuard)
  byId(@Param('id') id: string, @AuthUser() user: SerializeUser) {
    return this.service.byId(user, id);
  }

  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Put(':id')
  @ApiOperation({ summary: '게시글 수정' })
  @ApiBody({
    required: true,
    description: '게시글 수정 API',
    type: PostUpdateInput,
  })
  @UseGuards(LoggedInGuard)
  update(
    @Param('id') id: string,
    @Body() input: PostUpdateInput,
    @AuthUser() user: SerializeUser,
  ) {
    return this.service.update(user, id, input);
  }

  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Delete(':id')
  @ApiOperation({ summary: '게시글 삭제' })
  @UseGuards(LoggedInGuard)
  delete(@Param('id') id: string, @AuthUser() user: SerializeUser) {
    return this.service.delete(user, id);
  }

  @Get(':id/by-owner')
  @ApiOperation({ summary: '게시글 조회 (작성자)' })
  @UseGuards(LoggedInGuard)
  byOwner(@Param('id') id: string, @AuthUser() user: SerializeUser) {
    return this.service.byOwner(user, id);
  }

  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Post(':id/like')
  @ApiOperation({ summary: '게시글 좋아요' })
  @UseGuards(LoggedInGuard)
  like(@Param('id') id: string, @AuthUser() user: SerializeUser) {
    return this.service.like(user, id);
  }

  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Delete(':id/like')
  @ApiOperation({ summary: '게시글 싫어요' })
  @UseGuards(LoggedInGuard)
  unlike(@Param('id') id: string, @AuthUser() user: SerializeUser) {
    return this.service.unlike(user, id);
  }
}
