import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

// service
import { TagsService } from '../services/tags.service';

// decorator
import { AuthUser } from '../../decorators/get-user.decorator';
import { LoggedInGuard } from '../../decorators/logged-in.decorator';

// types
import { TagListQuery } from '../input/list.query';
import { TagFollowBody } from '../input/follow.input';
import type { UserWithInfo } from '../../modules/database/prisma.interface';

@ApiTags('태그')
@Controller('tags')
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
  list(@Query() query: TagListQuery, @AuthUser() user?: UserWithInfo) {
    return this.service.list(query, user);
  }

  @Get(':tagId')
  @ApiOperation({ summary: '태그 상세' })
  detail(@Param('tagId') tagId: string, @AuthUser() user?: UserWithInfo) {
    return this.service.detail(tagId, user);
  }

  @Post('follow')
  @ApiOperation({ summary: '태그 팔로우 및 팔로우 해제' })
  @ApiBody({
    required: true,
    description: '태그 팔로우 API',
    type: TagFollowBody,
  })
  @UseGuards(LoggedInGuard)
  follow(@AuthUser() user: UserWithInfo, @Body() input: TagFollowBody) {
    return this.service.follow(user, input);
  }
}
