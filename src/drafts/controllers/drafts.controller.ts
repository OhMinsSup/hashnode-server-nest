import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

// servies
import { DraftsService } from '../services/drafts.service';

// decorators
import { PostDraftInput } from '../input/post-draft.input';
import { LoggedInGuard } from '../../decorators/logged-in.decorator';
import { AuthUser } from '../../decorators/get-user.decorator';
import { PostDraftListQuery } from '../input/post-draft-list.query';

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
}
