import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthUser, type AuthUserSchema } from '../libs/get-user.decorator';
import { LoggedInGuard } from '../modules/auth/logged-in.guard';
import { TagListRequestDto } from './dto/list.request.dto';
import { TagsService } from './tags.service';

@ApiTags('태그')
@Controller('api/v1/tags')
export class TagsController {
  constructor(private readonly service: TagsService) {}

  @Get()
  @ApiOperation({ summary: '태그 리스트' })
  @ApiQuery({
    name: 'query',
    type: TagListRequestDto,
    required: false,
    description: '페이지네이션',
  })
  @UseGuards(LoggedInGuard)
  list(@AuthUser() user: AuthUserSchema, @Query() query: TagListRequestDto) {
    return this.service.list(query);
  }
}
