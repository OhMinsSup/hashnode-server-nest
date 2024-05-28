import {
  Body,
  Controller,
  Get,
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
import { FilesService } from '../services/files.service';
import { FileCreateInput } from '../input/file-create.input';
import { LoggedInGuard } from '../../decorators/logged-in.decorator';
import { AuthUser } from '../../decorators/get-user.decorator';
import { SerializeUser } from '../../integrations/serialize/serialize.interface';
import { Throttle } from '@nestjs/throttler';
import { FileListQuery } from '../input/file-list.query';
import { ApiFile } from '../../decorators/api-file.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadInput } from '../input/file-upload.input';

@ApiTags('파일')
@Controller('files')
export class FilesController {
  constructor(private readonly service: FilesService) {}

  @Get()
  @ApiOperation({ summary: '내가 업로드한 파일 목록' })
  @ApiQuery({
    name: 'query',
    type: FileListQuery,
    required: false,
    description: '내가 업로드한 파일 목록 API',
  })
  @UseGuards(LoggedInGuard)
  list(@AuthUser() user: SerializeUser, @Query() query: FileListQuery) {
    return this.service.list(user, query);
  }

  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Post()
  @ApiOperation({ summary: '업로드한 파일 저장' })
  @ApiBody({
    required: true,
    description: '게시글 임시 저장 API',
    type: FileCreateInput,
  })
  @UseGuards(LoggedInGuard)
  createDraft(@AuthUser() user: SerializeUser, @Body() input: FileCreateInput) {
    return this.service.create(user, input);
  }

  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiFile('file')
  @ApiBody({
    required: true,
    description: '파일 업로드 API',
    type: FileUploadInput,
  })
  @ApiOperation({ summary: '파일 업로드' })
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(LoggedInGuard)
  upload(
    @AuthUser() user: SerializeUser,
    @Body() input: FileUploadInput,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.upload(user, input, file);
  }
}
