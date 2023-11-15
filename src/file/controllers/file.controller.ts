import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

// service
import { FileService } from '../services/file.service';

// decorator
import { LoggedInGuard } from '../../modules/guard/logged-in.guard';
import { AuthUser } from '../../decorators/get-user.decorator';

// interceptor

// type
import { ListRequestDto } from '../../libs/list.query';
import { UserWithInfo } from '../../modules/database/select/user.select';
import { CreateInput } from '../dto/create.input';

@ApiTags('파일')
@Controller('api/v1/files')
export class FileController {
  constructor(private readonly service: FileService) {}

  @Get()
  @ApiOperation({ summary: '파일 목록 API' })
  @ApiQuery({
    name: 'query',
    type: ListRequestDto,
    required: false,
    description: '페이지네이션',
  })
  @UseGuards(LoggedInGuard)
  list(@Query() query: ListRequestDto) {
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
