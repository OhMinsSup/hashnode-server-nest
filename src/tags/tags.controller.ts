import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

// service
import { TagsService } from './tags.service';

// types
import { TagListQuery } from './dto/list';

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
    description: '페이지네이션',
  })
  list(@Query() query: TagListQuery) {
    return this.service.list(query);
  }
}
