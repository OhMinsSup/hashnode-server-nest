import {
  Body,
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import { FileService } from './file.service';

import { LoggedInGuard } from '../modules/auth/logged-in.guard';
import {
  UploadRequestDto,
  SignedUrlUploadResponseDto,
} from './dto/upload.request.dto';
import { AuthUser, type AuthUserSchema } from 'src/libs/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('파일')
@Controller('api/v1/files')
export class FileController {
  constructor(private readonly service: FileService) {}

  @Post('upload_url')
  @ApiOperation({ summary: '파일 업로드 URL API' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    required: true,
    description: '파일 업로드 URL API',
    type: SignedUrlUploadResponseDto,
  })
  @UseGuards(LoggedInGuard)
  createSignedUrl(
    @AuthUser() user: AuthUserSchema,
    @Body() body: SignedUrlUploadResponseDto,
    @UploadedFile(
      new ParseFilePipeBuilder().build({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.service.createSignedUrl(user, body, file);
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
