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
import { FileService } from './file.service';

// decorator
import { LoggedInGuard } from '../modules/guard/logged-in.guard';
import { AuthUser } from '../libs/get-user.decorator';

// interceptor
import { FileInterceptor } from '@nestjs/platform-express';

// type
import { SignedUrlUploadBody } from './dto/upload';
import { ListRequestDto } from '../libs/list.query';
import { UserWithInfo } from '../modules/database/select/user.select';

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

  @Post('upload')
  @ApiOperation({ summary: '파일 업로드 URL API', deprecated: true })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    required: true,
    description: '파일 업로드 URL API',
    type: SignedUrlUploadBody,
  })
  @UseGuards(LoggedInGuard)
  upload(
    @AuthUser() user: UserWithInfo,
    @Body() body: SignedUrlUploadBody,
    @UploadedFile(
      new ParseFilePipeBuilder().build({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.service.upload(user, body, file);
  }
}
