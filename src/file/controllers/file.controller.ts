import {
  Body,
  Controller,
  Get,
  ParseFilePipeBuilder,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

// service
import { FileService } from '../services/file.service';

// decorator
import { LoggedInGuard } from '../../modules/guard/logged-in.guard';
import { AuthUser } from '../../libs/get-user.decorator';

// interceptor
import { FileInterceptor } from '@nestjs/platform-express';

// type
import { SignedUrlUploadBody } from '../dto/upload';
import { ListRequestDto } from '../../libs/list.query';
import { UserWithInfo } from '../../modules/database/select/user.select';
import { CreateBody } from '../dto/create.input';

@ApiTags('파일')
@Controller('api/v1/files')
export class FileController {
  constructor(private readonly service: FileService) {}

  @Get()
  @ApiOperation({ summary: '파일 목록 API', deprecated: true })
  @ApiQuery({
    name: 'query',
    type: ListRequestDto,
    required: false,
    description: '페이지네이션',
  })
  @UseGuards(LoggedInGuard)
  list(@AuthUser() user: UserWithInfo, @Query() query: ListRequestDto) {
    return this.service.list(user, query);
  }

  @Post()
  @ApiOperation({ summary: '파일 생성 API' })
  @ApiBody({
    required: true,
    description: '파일 생성 API',
    type: CreateBody,
  })
  @UseGuards(LoggedInGuard)
  create(@AuthUser() user: UserWithInfo, @Body() input: CreateBody) {
    return this.service.create(user, input);
  }
}
