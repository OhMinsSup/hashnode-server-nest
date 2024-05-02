import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FilesService } from '../services/files.service';
import { FileCreateInput } from '../input/file-create.input';
import { LoggedInGuard } from '../../decorators/logged-in.decorator';
import { AuthUser } from '../../decorators/get-user.decorator';
import { SerializeUser } from '../../integrations/serialize/serialize.interface';
import { Throttle } from '@nestjs/throttler';
import { FileListQuery } from '../input/file-list.query';

@ApiTags('파일')
@Controller('files')
export class FilesController {
  constructor(private readonly service: FilesService) {}

  @Get()
  @ApiOperation({ summary: '내가 업로드한 파일 목록' })
  @ApiQuery({
    name: 'query',
    type: FileListQuery,
    required: false,
    description: '내가 업로드한 파일 목록 API',
  })
  @UseGuards(LoggedInGuard)
  list(@AuthUser() user: SerializeUser, @Query() query: FileListQuery) {
    return this.service.list(user, query);
  }

  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Post()
  @ApiOperation({ summary: '업로드한 파일 저장' })
  @ApiBody({
    required: true,
    description: '게시글 임시 저장 API',
    type: FileCreateInput,
  })
  @UseGuards(LoggedInGuard)
  createDraft(@AuthUser() user: SerializeUser, @Body() input: FileCreateInput) {
    return this.service.create(user, input);
  }
}
