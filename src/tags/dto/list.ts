import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQuery } from '../../libs/pagination.request.dto';

export class TagListQuery extends PaginationQuery {
  @IsString()
  @IsOptional()
  @ApiProperty({
    name: 'name',
    type: 'string',
    required: false,
    description: '검색어',
  })
  name?: string;

  @IsString()
  @IsEnum(['recent', 'popular'])
  @IsOptional()
  @ApiProperty({
    name: 'type',
    type: 'string',
    enum: ['recent', 'popular'],
    required: false,
    description: '태그 리스트 타입',
  })
  type?: string;
}

export class TrendingTagsQuery extends PaginationQuery {
  @IsIn(['week', 'all', 'month', 'year'])
  @ApiProperty({
    name: 'category',
    type: 'string',
    required: true,
    enum: ['week', 'all', 'month', 'year'],
    description: '주간, 전체',
  })
  category: 'week' | 'all' | 'month' | 'year';
}