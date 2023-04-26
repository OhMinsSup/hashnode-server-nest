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

  @IsString()
  @ApiProperty({
    description: '이미지 url',
    type: 'string',
  })
  url: string;
}

export class CreateBody {
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    description: '제목',
    maxLength: 255,
    type: 'string',
    required: true,
  })
  title: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '소제목',
    maxLength: 255,
    type: 'string',
    nullable: true,
    required: false,
  })
  subTitle?: string | null;

  @IsString()
  @ApiProperty({
    description: 'html content',
    type: 'string',
    required: true,
  })
  content: string;

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
