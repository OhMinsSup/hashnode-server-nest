import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

// servies
import { DraftsService } from '../services/drafts.service';

// decorators
import { PostDraftInput } from '../input/post-draft.input';
import { LoggedInGuard } from '../../decorators/logged-in.decorator';
import { AuthUser } from '../../decorators/get-user.decorator';
import { PostDraftListQuery } from '../input/post-draft-list.query';
import { PostDraftSyncInput } from '../input/post-draft-sync.input';

// types
import type { SerializeUser } from '../../integrations/serialize/serialize.interface';

@ApiTags('임시 저장')
@Controller('drafts')
export class DraftsController {
  constructor(private readonly service: DraftsService) {}

  @Get()
  @ApiOperation({ summary: '임시 저장된 게시글 목록' })
  @ApiQuery({
    name: 'query',
    type: PostDraftListQuery,
    required: false,
    description: '임시 저장된 게시글 목록 API',
  })
  @UseGuards(LoggedInGuard)
  list(@AuthUser() user: SerializeUser, @Query() query: PostDraftListQuery) {
    return this.service.list(user, query);
  }

  @Get('submitted')
  @ApiOperation({ summary: '발행 날짜가 입력된 게시글 목록' })
  @ApiQuery({
    name: 'query',
    type: PostDraftListQuery,
    required: false,
    description: '발행 날짜가 입력된 게시글 목록 API',
  })
  @UseGuards(LoggedInGuard)
  submitted(
    @AuthUser() user: SerializeUser,
    @Query() query: PostDraftListQuery,
  ) {
    return this.service.submitted(user, query);
  }

  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Post()
  @ApiOperation({ summary: '게시글 임시 저장' })
  @ApiBody({
    required: true,
    description: '게시글 임시 저장 API',
    type: PostDraftInput,
  })
  @UseGuards(LoggedInGuard)
  createDraft(@AuthUser() user: SerializeUser, @Body() input: PostDraftInput) {
    return this.service.createDraft(user, input);
  }

  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Post('sync')
  @ApiOperation({ summary: '게시글 임시 저장 or 조회' })
  @ApiBody({
    required: true,
    description: '게시글 임시 저장 or 조회 API',
    type: PostDraftInput,
  })
  @UseGuards(LoggedInGuard)
  getSyncDraft(@AuthUser() user: SerializeUser, @Body() input: PostDraftInput) {
    return this.service.getSyncDraft(user, input);
  }

  @Put(':id/sync')
  @ApiOperation({
    summary: '글을 작성하면서 작성된 글이 자동으로 저장되는 API',
  })
  @ApiBody({
    required: true,
    description: '게시글 임시 저장 or 조회 API (수정)',
    type: PostDraftSyncInput,
  })
  @UseGuards(LoggedInGuard)
  updateSyncDraft(
    @Param('id') id: string,
    @AuthUser() user: SerializeUser,
    @Body() input: PostDraftSyncInput,
  ) {
    return this.service.updateSyncDraft(user, id, input);
  }
}
