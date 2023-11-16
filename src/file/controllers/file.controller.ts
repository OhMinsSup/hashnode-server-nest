import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

// service
import { FileService } from '../services/file.service';

// decorator
import { LoggedInGuard } from '../../decorators/logged-in.decorator';
import { AuthUser } from '../../decorators/get-user.decorator';

// interceptor

// type
import { PaginationQuery } from '../../libs/pagination.query';
import { UserWithInfo } from '../../modules/database/select/user.select';
import { CreateInput } from '../input/create.input';

@ApiTags('파일')
@Controller('api/v1/files')
export class FileController {
  constructor(private readonly service: FileService) {}

  @Get()
  @ApiOperation({ summary: '파일 목록 API' })
  @ApiQuery({
    name: 'query',
    type: PaginationQuery,
    required: false,
    description: '페이지네이션',
  })
  @UseGuards(LoggedInGuard)
  list(@Query() query: PaginationQuery) {
    return this.service.list(query);
  }

  @Post()
  @ApiOperation({ summary: '파일 생성 API' })
  @ApiBody({
    required: true,
    description: '파일 생성 API',
    type: CreateInput,
  })
  @UseGuards(LoggedInGuard)
  create(@AuthUser() user: UserWithInfo, @Body() input: CreateInput) {
    return this.service.create(user, input);
  }
}
