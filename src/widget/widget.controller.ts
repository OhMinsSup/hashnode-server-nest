import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthUser, AuthUserSchema } from 'src/libs/get-user.decorator';
import { LoggedInGuard } from 'src/modules/auth/logged-in.guard';
import { GetArticleCirclesRequestDto } from './dto/article-circles.request.dto';
import { WidgetService } from './widget.service';

@ApiTags('위젯')
@Controller('api/v1/widget')
export class WidgetController {
  constructor(private readonly service: WidgetService) {}

  @Get('/article-circles')
  @ApiOperation({ summary: '회원 리스트' })
  @ApiQuery({
    name: 'query',
    type: GetArticleCirclesRequestDto,
    required: false,
  })
  getArticleCircles(@Query() query: GetArticleCirclesRequestDto) {
    return this.service.getArticleCircles(query);
  }

  @Get('/bookmarks')
  @ApiOperation({ summary: '북마크 리스트' })
  @UseGuards(LoggedInGuard)
  getWidgetBookmarks(@AuthUser() user: AuthUserSchema) {
    return this.service.getWidgetBookmarks(user);
  }
}
