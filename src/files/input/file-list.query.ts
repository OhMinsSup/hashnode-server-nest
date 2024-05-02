import { ApiProperty } from '@nestjs/swagger';
import { PaginationInput } from '../../integrations/dto/pagination.input';
import { IsOptionalString } from '../../decorators/Is-optional-string.decorator';
import { IsIn } from 'class-validator';
import { MediaType, UploadType } from '@prisma/client';

export class FileListQuery extends PaginationInput {
  @IsOptionalString()
  @ApiProperty({
    name: 'keyword',
    type: 'string',
    required: false,
    description: '검색어',
  })
  keyword?: string;

  @IsIn(Object.values(MediaType))
  @ApiProperty({
    description: '미디어 타입',
    type: 'string',
    enum: MediaType,
    required: true,
  })
  mediaType: MediaType;

  @IsIn(Object.values(UploadType))
  @ApiProperty({
    description: '업로드 타입',
    type: 'string',
    enum: UploadType,
    required: true,
  })
  uploadType: UploadType;
}
