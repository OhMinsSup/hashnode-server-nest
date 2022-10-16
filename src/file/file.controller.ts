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

import { FileService } from './file.service';

import { LoggedInGuard } from '../modules/auth/logged-in.guard';
import { SignedUrlUploadResponseDto } from './dto/upload.request.dto';
import { AuthUser, type AuthUserSchema } from 'src/libs/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ListRequestDto } from 'src/libs/list.request.dto';

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
    return this.service.list(query);
  }

  @Post('upload')
  @ApiOperation({ summary: '파일 업로드 URL API' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    required: true,
    description: '파일 업로드 URL API',
    type: SignedUrlUploadResponseDto,
  })
  @UseGuards(LoggedInGuard)
  upload(
    @AuthUser() user: AuthUserSchema,
    @Body() body: SignedUrlUploadResponseDto,
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
