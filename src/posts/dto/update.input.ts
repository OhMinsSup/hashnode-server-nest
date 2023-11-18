import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { SeoInput, ThumbnailInput } from './create.input';

export class UpdatePostInput {
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
    type: ThumbnailInput,
    nullable: true,
    required: false,
  })
  thumbnail?: ThumbnailInput | null;

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
    type: SeoInput,
    nullable: true,
    required: false,
  })
  seo?: SeoInput | null;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: '초안작성 여부',
    type: 'boolean',
    required: false,
    nullable: true,
  })
  isDraft?: boolean;
}
