import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { PaginationQuery } from '../../libs/pagination.request.dto';

export class PostListQuery extends PaginationQuery {
  @IsOptional()
  @IsString()
  @ApiProperty({
    name: 'keyword',
    type: 'string',
    required: false,
    description: '검색어',
  })
  keyword?: string;

  @IsOptional()
  @IsEnum(['recent', 'featured', 'past', 'personalized'])
  @ApiProperty({
    name: 'type',
    type: 'string',
    enum: ['recent', 'featured', 'past', 'personalized'],
    required: false,
    description: '게시물 리스트 타입',
  })
  type?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    name: 'startDate',
    type: 'string',
    required: false,
    description: '시작일',
  })
  startDate?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    name: 'endDate',
    type: 'string',
    required: false,
    description: '종료일',
  })
  endDate?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    name: 'tag',
    type: 'string',
    required: false,
    description: '태그',
  })
  tag?: string;
}

export class GetTopPostsQuery {
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    name: 'duration',
    type: 'number',
    required: true,
    description: '조회 기간',
  })
  duration: number;
}
