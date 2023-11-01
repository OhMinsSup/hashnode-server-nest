import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, IsUrl } from 'class-validator';

const UPLOAD_TYPE = {
  PROFILE: 'PROFILE',
  IMAGE: 'IMAGE',
  POST_THUMBNAIL: 'POST_THUMBNAIL',
};

export type UploadType = keyof typeof UPLOAD_TYPE;

const MEDIA_TYPE = {
  IMAGE: 'IMAGE',
};

export type MediaType = keyof typeof MEDIA_TYPE;

export class CreateBody {
  @IsString()
  @ApiProperty({
    description: 'cloudfare id',
    type: 'string',
    required: true,
  })
  cfId: string;

  @IsUrl()
  @ApiProperty({
    description: '파일 URL',
    type: 'string',
    required: true,
  })
  publicUrl: string;

  @IsIn(Object.values(MEDIA_TYPE))
  @ApiProperty({
    description: '미디어 타입',
    type: 'string',
    enum: MEDIA_TYPE,
    required: true,
  })
  mediaType: MediaType;

  @IsIn(Object.values(UPLOAD_TYPE))
  @ApiProperty({
    description: '업로드 타입',
    type: 'string',
    enum: UPLOAD_TYPE,
    required: true,
  })
  uploadType: UploadType;

  @IsString()
  @ApiProperty({
    description: '파일 이름',
    type: 'string',
    required: true,
  })
  filename: string;
}
