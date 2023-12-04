import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateSocialsBody {
  @IsOptional()
  @IsString()
  @IsUrl()
  @ApiProperty({
    description: '깃허브',
    type: 'string',
    required: false,
  })
  github?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  @ApiProperty({
    description: '페이스북',
    type: 'string',
    required: false,
  })
  facebook?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  @ApiProperty({
    description: '트위터',
    type: 'string',
    required: false,
  })
  twitter?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  @ApiProperty({
    description: '인스타그램',
    type: 'string',
    required: false,
  })
  instagram?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  @ApiProperty({
    description: '웹사이트',
    type: 'string',
    required: false,
  })
  website?: string;
}

export class UpdateUserImageBody {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '이미지 아이디',
    type: 'string',
  })
  id?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '이미지 url',
    type: 'string',
  })
  url?: string;
}

export class UpdateUserBody {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @ApiProperty({
    description: '유저네임',
    maxLength: 20,
    type: 'string',
    required: true,
  })
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  @ApiProperty({
    description: '이름',
    maxLength: 20,
    minLength: 1,
    type: 'string',
    required: true,
  })
  nickname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    description: '한줄소개',
    maxLength: 255,
    type: 'string',
    required: false,
  })
  tagline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    description: '위치',
    maxLength: 255,
    type: 'string',
    required: false,
  })
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    description: '소개',
    maxLength: 255,
    type: 'string',
    required: false,
  })
  bio?: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    description: '기술스택',
    type: 'array',
    items: {
      type: 'string',
    },
    required: false,
  })
  skills?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(140)
  @ApiProperty({
    description: '사용 가능한 텍스트',
    maxLength: 140,
    type: 'string',
    required: false,
  })
  availableText?: string;

  @IsOptional()
  @IsObject()
  @ApiProperty({
    description: '소셜 정보',
    type: UpdateSocialsBody,
    required: false,
  })
  socials?: UpdateSocialsBody;

  @IsOptional()
  @IsObject()
  @ApiProperty({
    description: '이미지 정보',
    type: UpdateUserImageBody,
    required: false,
  })
  image?: UpdateUserImageBody;
}
