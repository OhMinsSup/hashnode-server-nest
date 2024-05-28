import { ApiProperty } from '@nestjs/swagger';
import { UploadType, MediaType } from '@prisma/client';
import { IsIn } from 'class-validator';

export class FileUploadInput {
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
