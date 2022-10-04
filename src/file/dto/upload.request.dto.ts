import { ApiProperty } from '@nestjs/swagger';

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

export class UploadRequestDto {
  @ApiProperty({
    type: 'string',
    enum: UPLOAD_TYPE,
    required: true,
  })
  uploadType: UploadType;

  @ApiProperty({
    type: 'string',
    enum: MEDIA_TYPE,
    required: true,
  })
  mediaType: MediaType;

  @ApiProperty({
    type: 'string',
    required: true,
  })
  filename: string;
}
