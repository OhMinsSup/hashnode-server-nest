import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

// service
import { TagsService } from './tags.service';

// decorator
import { AuthUser } from '../decorators/get-user.decorator';
import { LoggedInGuard } from '../modules/guard/logged-in.guard';

// types
import { TagListQuery } from './dto/list';
import type { UserWithInfo } from '../modules/database/select/user.select';

@ApiTags('태그')
@Controller('api/v1/tags')
export class TagsController {
  constructor(private readonly service: TagsService) {}

  @Get()
  @ApiOperation({ summary: '태그 리스트' })
  @ApiQuery({
    name: 'query',
    type: TagListQuery,
    required: false,
    description: '쿼리',
  })
  list(@Query() query: TagListQuery) {
    return this.service.list(query);
  }

  @Get(':tag')
  @ApiOperation({ summary: '태그 상세' })
  detail(@Param('tag') tag: string, @AuthUser() user?: UserWithInfo) {
    return this.service.detail(tag, user);
  }

  @Post(':tag/follow')
  @ApiOperation({ summary: '태그 팔로우' })
  @UseGuards(LoggedInGuard)
  follow(@Param('tag') tag: string, @AuthUser() user: UserWithInfo) {
    return this.service.following(user, tag);
  }

  @Delete(':tag/follow')
  @ApiOperation({ summary: '태그 언팔로우' })
  @UseGuards(LoggedInGuard)
  unfollow(@Param('tag') tag: string, @AuthUser() user: UserWithInfo) {
    return this.service.unfollowing(user, tag);
  }
}
