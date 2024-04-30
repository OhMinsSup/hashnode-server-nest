import { ApiProperty } from '@nestjs/swagger';
import { UploadType, MediaType } from '@prisma/client';
import { IsIn, IsString, IsUrl } from 'class-validator';

export class FileCreateInput {
  @IsString()
  @ApiProperty({
    description: 'cloudfare id',
    type: 'string',
    required: true,
  })
  cfId: string;

  @IsString()
  @ApiProperty({
    description: '파일 이름',
    type: 'string',
    required: true,
  })
  filename: string;

  @IsString()
  @ApiProperty({
    description: '파일 확장자',
    type: 'string',
    required: true,
  })
  mimeType: string;

  @IsUrl()
  @ApiProperty({
    description: '파일 URL',
    type: 'string',
    required: true,
  })
  publicUrl: string;

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
