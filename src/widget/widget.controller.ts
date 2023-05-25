import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

// decorator
import { AuthUser } from '../libs/get-user.decorator';

// service
import { WidgetService } from './widget.service';

// dto
import { GetArticleCirclesQuery } from './dto/article-circles';
import type { UserWithInfo } from '../modules/database/select/user.select';

@ApiTags('위젯')
@Controller('api/v1/widget')
export class WidgetController {
  constructor(private readonly service: WidgetService) {}

  @Get('/article-circles')
  @ApiOperation({ summary: '회원 리스트' })
  @ApiQuery({
    name: 'query',
    type: GetArticleCirclesQuery,
    required: false,
  })
  getArticleCircles(@Query() query: GetArticleCirclesQuery) {
    return this.service.getArticleCircles(query);
  }

  @Get('/bookmarks')
  @ApiOperation({ summary: '북마크 리스트' })
  getWidgetBookmarks(@AuthUser() user?: UserWithInfo) {
    return this.service.getWidgetBookmarks(user);
  }
}
