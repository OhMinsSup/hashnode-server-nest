import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

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

export class UploadBody {
  @IsIn(Object.values(UPLOAD_TYPE))
  @ApiProperty({
    type: 'string',
    enum: UPLOAD_TYPE,
    required: true,
  })
  uploadType: UploadType;

  @IsIn(Object.values(MEDIA_TYPE))
  @ApiProperty({
    type: 'string',
    enum: MEDIA_TYPE,
    required: true,
  })
  mediaType: MediaType;

  @IsString()
  @ApiProperty({
    type: 'string',
    required: true,
  })
  filename: string;
}

export class SignedUrlUploadBody extends UploadBody {
  @ApiProperty({
    description: '업로드 파일',
    required: true,
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File;
}
