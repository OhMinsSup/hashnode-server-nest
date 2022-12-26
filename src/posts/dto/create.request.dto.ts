import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

// body

export class CreateRequestDto {
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

  @IsString()
  @MinLength(10)
  @MaxLength(255)
  @ApiProperty({
    description: '간단한 설명',
    minLength: 10,
    maxLength: 255,
    type: 'string',
    required: true,
  })
  description: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  @ApiProperty({
    description: '썸네일 이미지',
    type: 'string',
    nullable: true,
    required: false,
  })
  thumbnail?: string | null;

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

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: '공개 여부',
    type: 'boolean',
    nullable: true,
    required: false,
  })
  isPublic?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: '초안 작성 여부',
    type: 'boolean',
    nullable: true,
    required: false,
  })
  isDraft?: boolean;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: '발행일',
    type: 'number',
    nullable: true,
    required: false,
  })
  publishingDate?: number;
}
