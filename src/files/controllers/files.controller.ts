import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesService } from '../services/files.service';
import { FileCreateInput } from '../input/file-create.input';
import { LoggedInGuard } from '../../decorators/logged-in.decorator';
import { AuthUser } from '../../decorators/get-user.decorator';
import { SerializeUser } from '../../integrations/serialize/serialize.interface';

@ApiTags('파일')
@Controller('files')
export class FilesController {
  constructor(private readonly service: FilesService) {}

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
}
