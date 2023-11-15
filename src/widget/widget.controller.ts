import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

// decorator
import { AuthUser } from '../decorators/get-user.decorator';

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
  @ApiOperation({ summary: '회원 리스트', deprecated: true })
  @ApiQuery({
    name: 'query',
    type: GetArticleCirclesQuery,
    required: false,
  })
  getArticleCircles(@Query() query: GetArticleCirclesQuery) {
    console.log(query);
    return this.service.getArticleCircles();
  }

  @Get('/bookmarks')
  @ApiOperation({ summary: '북마크 리스트', deprecated: true })
  getWidgetBookmarks(@AuthUser() user?: UserWithInfo) {
    return this.service.getWidgetBookmarks(user);
  }
}
