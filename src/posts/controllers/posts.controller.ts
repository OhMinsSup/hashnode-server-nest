import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

// services
import { PostsService } from '../services/posts.service';

// input
import { PostCreateInput } from '../input/post-create.input';
import { PostDraftInput } from '../input/post-draft.input';

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
  @UseInterceptors(LoggedInGuard)
  create(@Body() input: PostCreateInput, @AuthUser() user: SerializeUser) {
    return this.service.create(user, input);
  }

  @Post('draft')
  @ApiOperation({ summary: '게시글 임시 저장' })
  @ApiBody({
    required: true,
    description: '게시글 임시 저장 API',
    type: PostDraftInput,
  })
  @UseInterceptors(LoggedInGuard)
  createDraft(@Body() input: PostDraftInput, @AuthUser() user: SerializeUser) {
    return this.service.createDraft(user, input);
  }

  @Get(':id')
  @ApiOperation({ summary: '게시글 조회' })
  @UseInterceptors(NotLoggedInGuard)
  byId(@Param() id: string, @AuthUser() user: SerializeUser) {
    return this.service.byId(user, id);
  }

  @Get('by-owner/:id')
  @ApiOperation({ summary: '게시글 조회 (작성자)' })
  @UseInterceptors(LoggedInGuard)
  byOwner(@Param() id: string, @AuthUser() user: SerializeUser) {
    return this.service.byOwner(user, id);
  }
}
