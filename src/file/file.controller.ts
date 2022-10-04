import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { FileService } from './file.service';

import { LoggedInGuard } from '../modules/auth/logged-in.guard';
import { UploadRequestDto } from './dto/upload.request.dto';
import { AuthUser, type AuthUserSchema } from 'src/libs/get-user.decorator';

@ApiTags('파일')
@Controller('api/v1/files')
export class FileController {
  constructor(private readonly service: FileService) {}

  @Post('signed_url')
  @ApiOperation({ summary: '파일 업로드 URL 생성 API' })
  @ApiBody({
    required: true,
    description: '파일 업로드 URL 생성 API',
    type: UploadRequestDto,
  })
  @UseGuards(LoggedInGuard)
  createSignedUrl(
    @AuthUser() user: AuthUserSchema,
    @Body() body: UploadRequestDto,
  ) {
    return this.service.createSignedUrl(user, body);
  }

  @Post('upload')
  @ApiOperation({ summary: '파일 업로드 API' })
  @ApiBody({
    required: true,
    description: '파일 업로드 API',
    type: UploadRequestDto,
  })
  @UseGuards(LoggedInGuard)
  upload(@AuthUser() user: AuthUserSchema, @Body() body: UploadRequestDto) {
    return this.service.upload(user, body);
  }
}
