import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQuery } from '../../libs/pagination';

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
  @IsEnum(['recent', 'popular', 'new', 'trending'])
  @IsOptional()
  @ApiProperty({
    name: 'type',
    type: 'string',
    enum: ['recent', 'popular', 'new'],
    required: false,
    description: '태그 리스트 타입',
  })
  type?: string;

  @IsOptional()
  @IsIn(['week', 'all', 'month', 'year'])
  @ApiProperty({
    name: 'category',
    type: 'string',
    required: true,
    enum: ['week', 'all', 'month', 'year'],
    description: '주간, 전체',
  })
  category?: 'week' | 'all' | 'month' | 'year';
}
