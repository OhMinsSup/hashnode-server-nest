import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

// service
import { PostsService } from './posts.service';

// dto
import { CreateRequestDto } from './dto/create.request.dto';
import {
  PostListRequestDto,
  SimpleTrendingRequestDto,
} from './dto/list.request.dto';

// guard
import { LoggedInGuard } from '../modules/auth/logged-in.guard';
import { AuthUser, type AuthUserSchema } from '../libs/get-user.decorator';

@ApiTags('게시물')
@Controller('api/v1/posts')
export class PostsController {
  constructor(private readonly service: PostsService) {}

  @Get()
  @ApiOperation({ summary: '게시물 리스트' })
  @ApiQuery({
    name: 'query',
    type: PostListRequestDto,
    required: false,
    description: '페이지네이션',
  })
  list(@Query() query: PostListRequestDto) {
    return this.service.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '게시물 상세 조회' })
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.service.detail(id);
  }

  @Get('trending/simple')
  @ApiOperation({ summary: '게시물 인기 리스트' })
  @ApiQuery({
    name: 'query',
    type: SimpleTrendingRequestDto,
    required: true,
    description: '페이지네이션',
  })
  simpleTrending(@Query() query: SimpleTrendingRequestDto) {
    return this.service.simpleTrending(query);
  }

  @Post()
  @ApiOperation({ summary: '게시글 작성' })
  @ApiBody({
    required: true,
    description: '게시글 작성 API',
    type: 'object',
  })
  @UseGuards(LoggedInGuard)
  create(@AuthUser() user: AuthUserSchema, @Body() input: CreateRequestDto) {
    return this.service.create(user, input);
  }
}
