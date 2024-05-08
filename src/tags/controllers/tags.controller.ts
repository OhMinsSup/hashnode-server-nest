import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

// service
import { TagsService } from '../services/tags.service';
import { GetTagsInput } from '../input/get-tags.input';
import { GetWidgetTagsQuery } from '../input/get-widget-tags.query';
import { LoggedInGuard } from '../../decorators/logged-in.decorator';
import { SerializeUser } from '../../integrations/serialize/serialize.interface';
import { AuthUser } from '../../decorators/get-user.decorator';

@ApiTags('태그')
@Controller('tags')
export class TagsController {
  constructor(private readonly service: TagsService) {}

  @Get()
  @ApiOperation({ summary: '태그 목록' })
  @ApiQuery({
    name: 'query',
    type: GetTagsInput,
    required: false,
    description: '태그 목록 조회시 필요한 쿼리',
  })
  getTags(@Query() query: GetTagsInput) {}

  @Get('widget')
  @ApiOperation({
    summary: '게시물 작성시 태그 선택 목록에서 노출될 태그 목록',
  })
  @ApiQuery({
    name: 'query',
    type: GetWidgetTagsQuery,
    required: false,
    description: 'widget 목록에서 검색시 필요한 쿼리',
  })
  @UseGuards(LoggedInGuard)
  getWidgetTags(
    @AuthUser() user: SerializeUser,
    @Query() input: GetWidgetTagsQuery,
  ) {
    return this.service.getWidgetTags(input, user);
  }
}
