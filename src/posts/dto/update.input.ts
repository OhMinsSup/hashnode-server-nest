import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { SeoBody, ThumbnailBody } from './create.input';

export class UpdateBody {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    description: '제목',
    maxLength: 255,
    type: 'string',
    required: false,
  })
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    description: '소제목',
    maxLength: 255,
    type: 'string',
    nullable: true,
    required: false,
  })
  subTitle?: string | null;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'html content',
    type: 'string',
    required: true,
  })
  content?: string;

  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: '썸네일 이미지',
    type: ThumbnailBody,
    nullable: true,
    required: false,
  })
  thumbnail?: ThumbnailBody | null;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: '태그',
    type: 'array',
    items: {
      type: 'string',
    },
    nullable: true,
    required: false,
  })
  tags?: string[] | null;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: '댓글 작성 가능 여부',
    type: 'boolean',
    nullable: true,
    required: false,
  })
  disabledComment?: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '발행일',
    type: 'string',
    nullable: true,
    required: false,
  })
  publishingDate?: string;

  @IsOptional()
  @ApiProperty({
    description: 'SEO',
    type: SeoBody,
    nullable: true,
    required: false,
  })
  seo?: SeoBody | null;
}
