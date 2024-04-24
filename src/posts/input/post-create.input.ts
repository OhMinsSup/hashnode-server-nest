import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { IsOptionalUrl } from '../../decorators/Is-optional-url.decorator';
import { IsOptionalString } from '../../decorators/Is-optional-string.decorator';
import { IsOptionalJsonStringify } from '../../decorators/is-optional-json-stringify.decorator';
import { IsOptionalArray } from '../../decorators/is-optional-array.decorator';
import { PostSeoInput } from './post-seo.input';
import { PostConfigInput } from './post-config.input';
import { IsKebabCase } from '../../decorators/is-kebabcase.decorator';

export class PostCreateInput {
  @IsKebabCase()
  @MaxLength(255)
  @ApiProperty({
    description: 'urlSlug',
    maxLength: 255,
    type: 'string',
    required: true,
  })
  urlSlug: string;

  @IsString()
  @MaxLength(200)
  @ApiProperty({
    description: '제목',
    maxLength: 200,
    type: 'string',
    required: true,
  })
  title: string;

  @IsOptionalString()
  @MaxLength(120)
  @ApiProperty({
    description: '소제목',
    maxLength: 120,
    type: 'string',
    nullable: true,
    required: false,
  })
  subTitle?: string;

  @IsString()
  @ApiProperty({
    description: 'html content',
    type: 'string',
    nullable: true,
    required: false,
  })
  content: string;

  @IsOptionalJsonStringify()
  @ApiProperty({
    description: '게시물 content의 JSON 데이터 (lexical)',
    type: 'string',
    nullable: true,
    required: false,
  })
  meta?: string;

  @IsOptionalUrl()
  @ApiProperty({
    description: '게시물 이미지 URL',
    type: 'string',
    nullable: true,
    required: false,
  })
  image?: string;

  @IsOptionalArray()
  @ApiProperty({
    description: '태그',
    type: 'array',
    items: {
      type: 'string',
    },
    nullable: true,
    required: false,
  })
  tags?: string[];

  @ApiProperty({
    description: 'SEO 정보',
    type: PostSeoInput,

    required: true,
  })
  seo: PostSeoInput;

  @ApiProperty({
    description: '게시물 설정',
    type: PostConfigInput,
    required: true,
  })
  config: PostConfigInput;
}
