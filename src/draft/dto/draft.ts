import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

// body

export class SeoBody {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiProperty({
    description: 'SEO title',
    maxLength: 50,
    type: 'string',
  })
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(156)
  @ApiProperty({
    description: 'SEO description',
    maxLength: 156,
    type: 'string',
  })
  desc?: string;

  @IsOptional()
  @IsUrl()
  @ApiProperty({
    description: 'SEO image',
    type: 'string',
  })
  image?: string;
}

export class ThumbnailBody {
  @IsOptional()
  @IsNumber()
  @ApiProperty({
    description: '이미지 아이디',
    type: 'number',
  })
  idx?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '이미지 url',
    type: 'string',
  })
  url?: string;
}

export class DraftBody {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    description: '제목',
    maxLength: 255,
    type: 'string',
    required: true,
  })
  title?: string;

  @IsOptional()
  @IsString()
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

  @IsOptional()
  @IsObject()
  @ApiProperty({
    description: '썸네일 이미지',
    type: ThumbnailBody,
    nullable: true,
    required: false,
  })
  thumbnail?: ThumbnailBody | null;

  @IsOptional()
  @IsArray()
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

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: '댓글 작성 가능 여부',
    type: 'boolean',
    nullable: true,
    required: false,
  })
  disabledComment?: boolean;

  @IsOptional()
  @IsString()
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
