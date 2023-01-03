import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';

// guard
import { LoggedInGuard } from '../modules/auth/logged-in.guard';
import { AuthUser, type AuthUserSchema } from '../libs/get-user.decorator';

// dto
import {
  DraftCreateRequestDto,
  DraftRequestDto,
} from './dto/draft.request.dto';

// services
import { DraftsService } from './drafts.service';

@ApiTags('초안 작성')
@Controller('api/v1/drafts')
export class DraftsController {
  constructor(private readonly service: DraftsService) {}

  @Get(':id')
  @ApiOperation({ summary: '초안 게시물 상세' })
  @UseGuards(LoggedInGuard)
  detail(
    @AuthUser() user: AuthUserSchema,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.detail(user, id);
  }

  @Post('new')
  @ApiOperation({ summary: '최초 초안 게시물 생성' })
  @ApiBody({
    required: true,
    description: '최초 초안 게시물 생성 API',
    type: DraftCreateRequestDto,
  })
  @UseGuards(LoggedInGuard)
  create(
    @AuthUser() user: AuthUserSchema,
    @Body() input: DraftCreateRequestDto,
  ) {
    return this.service.create(user, input);
  }

  @Post('save-data')
  @ApiOperation({ summary: '임시 게시글 작성' })
  @ApiBody({
    required: true,
    description: '게시글 작성 API',
    type: DraftRequestDto,
  })
  @UseGuards(LoggedInGuard)
  saveData(@AuthUser() user: AuthUserSchema, @Body() input: DraftRequestDto) {
    return this.service.saveData(user, input);
  }
}
