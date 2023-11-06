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
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DraftService } from './draft.service';
import { DraftBody } from './dto/draft';
import { LoggedInGuard } from '../modules/guard/logged-in.guard';
import { AuthUser } from '../libs/get-user.decorator';
import { UserWithInfo } from '../modules/database/select/user.select';
import { DraftListQuery } from './dto/list';

@ApiTags('임시 게시글')
@Controller('api/v1/draft')
export class DraftController {
  constructor(private readonly service: DraftService) {}

  @Get()
  @ApiOperation({ summary: '임시 게시물 리스트', deprecated: true })
  @ApiQuery({
    name: 'query',
    type: DraftListQuery,
    required: false,
    description: '페이지네이션',
  })
  @UseGuards(LoggedInGuard)
  list(@AuthUser() user: UserWithInfo, @Query() query: DraftListQuery) {
    return this.service.list(user, query);
  }

  @Post()
  @ApiOperation({ summary: '임시 게시글 작성', deprecated: true })
  @ApiBody({
    required: true,
    description: '임시 게시글 작성 API',
    type: DraftBody,
  })
  @UseGuards(LoggedInGuard)
  create(@AuthUser() user: UserWithInfo, @Body() input: DraftBody) {
    return this.service.create(user, input);
  }

  @Get(':id')
  @ApiOperation({ summary: '임시 게시물 상세 조회', deprecated: true })
  @UseGuards(LoggedInGuard)
  detail(
    @AuthUser() user: UserWithInfo,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.detail(user, id);
  }

  @Put(':id')
  @ApiOperation({ summary: '임시 게시글 수정', deprecated: true })
  @ApiBody({
    required: true,
    description: '게시글 수정 API',
    type: DraftBody,
  })
  @UseGuards(LoggedInGuard)
  update(
    @AuthUser() user: UserWithInfo,
    @Param('id', ParseIntPipe) id: number,
    @Body() input: DraftBody,
  ) {
    return this.service.update(user, id, input);
  }

  @Delete(':id')
  @ApiOperation({ summary: '임시 게시물 삭제', deprecated: true })
  @UseGuards(LoggedInGuard)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
