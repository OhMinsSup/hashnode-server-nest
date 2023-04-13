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
import { LoggedInGuard } from '../modules/auth/logged-in.guard';
import { AuthUser } from '../libs/get-user.decorator';

// interceptor
import { FileInterceptor } from '@nestjs/platform-express';

// type
import { SignedUrlUploadBody } from './dto/upload';
import { ListRequestDto } from '../libs/list.request.dto';
import type { AuthUserSchema } from '../libs/get-user.decorator';

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
  list(@AuthUser() user: AuthUserSchema, @Query() query: ListRequestDto) {
    return this.service.list(user, query);
  }

  @Post('upload')
  @ApiOperation({ summary: '파일 업로드 URL API' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    required: true,
    description: '파일 업로드 URL API',
    type: SignedUrlUploadBody,
  })
  @UseGuards(LoggedInGuard)
  upload(
    @AuthUser() user: AuthUserSchema,
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
