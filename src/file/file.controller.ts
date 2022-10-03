import { Controller, Post, UseGuards } from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { FileService } from './file.service';

import { LoggedInGuard } from '../modules/auth/logged-in.guard';

@ApiTags('파일')
@Controller('api/v1/files')
export class FileController {
  constructor(private readonly service: FileService) {}

  @Post('direct_upload')
  @ApiOperation({ summary: '파일 업로드 URL 생성 API' })
  @UseGuards(LoggedInGuard)
  directUpload() {
    return this.service.directUpload();
  }
}
