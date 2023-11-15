import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

// service
import { PostsService } from '../services/posts.service';

// dto
import { CreateInput } from '../dto/create.input';
import { CreateBody as CreateCommentBody } from '../../comments/dto/create';
import { UpdateBody as UpdateCommentBody } from '../../comments/dto/update';
import { UpdateBody } from '../dto/update.input';
import { PostListQuery, GetTopPostsQuery } from '../dto/list.query';

// guard
import { LoggedInGuard } from '../../decorators/logged-in.decorator';
import { AuthUser } from '../../decorators/get-user.decorator';
import type { UserWithInfo } from '../../modules/database/select/user.select';

@ApiTags('게시물')
@Controller('api/v1/posts')
export class PostsController {
  constructor(private readonly service: PostsService) {}

  @Post()
  @ApiOperation({ summary: '게시글 작성' })
  @ApiBody({
    required: true,
    description: '게시글 작성 API',
    type: CreateInput,
  })
  @UseGuards(LoggedInGuard)
  create(@AuthUser() user: UserWithInfo, @Body() input: CreateInput) {
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
    return this.service.getDraftPosts(user, query);
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
    type: UpdateBody,
  })
  @UseGuards(LoggedInGuard)
  update(
    @AuthUser() user: UserWithInfo,
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateBody,
  ) {
    return this.service.update(user, id, input);
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

  @Get(':id')
  @ApiOperation({ summary: '게시물 상세 조회' })
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.service.detail(id);
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

  @Post(':id/comment')
  @ApiOperation({ summary: '댓글 작성' })
  @UseGuards(LoggedInGuard)
  createComment(
    @AuthUser() user: UserWithInfo,
    @Param('id', ParseIntPipe) id: number,
    @Body() input: CreateCommentBody,
  ) {
    return this.service.createComment(user, id, input);
  }

  @Put(':id/comment/:commentId')
  @ApiOperation({ summary: '댓글 수정' })
  @UseGuards(LoggedInGuard)
  updateComment(
    @AuthUser() user: UserWithInfo,
    @Param('id', ParseIntPipe) id: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() input: UpdateCommentBody,
  ) {
    return this.service.updateComment(user, commentId, input);
  }

  @Delete(':id/comment/:commentId')
  @ApiOperation({ summary: '댓글 삭제' })
  @UseGuards(LoggedInGuard)
  deleteComment(
    @AuthUser() user: UserWithInfo,
    @Param('id', ParseIntPipe) id: number,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return this.service.deleteComment(user, id, commentId);
  }
}
