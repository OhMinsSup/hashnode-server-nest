import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { UploadType, MediaType } from '@prisma/client';
import { IsIn } from 'class-validator';

export class FileInput {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
    description: '업로드 파일',
  })
  file: Express.Multer.File;
}

export class FileInfoInput {
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

export class FileUploadInput extends IntersectionType(
  FileInfoInput,
  FileInput,
) {}
