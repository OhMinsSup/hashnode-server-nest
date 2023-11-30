import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQuery } from '../../libs/pagination.query';

export class MyPostListQuery extends PaginationQuery {
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
  @IsBoolean()
  @ApiProperty({
    name: 'isDeleted',
    type: 'boolean',
    required: false,
    description: '삭제된 게시물 포함 여부',
  })
  isDeleted?: boolean;
}

export class UserListQuery extends PaginationQuery {
  @IsString()
  @IsIn(['default', 'trending'])
  @IsOptional()
  @ApiProperty({
    name: 'type',
    type: 'string',
    enum: ['default', 'trending'],
    required: false,
    description: '유저 리스트 타입',
  })
  type?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    name: 'name',
    type: 'string',
    required: false,
    description: '검색어',
  })
  name?: string;

  @IsOptional()
  @IsIn(['week', 'all', 'month', 'year'])
  @ApiProperty({
    name: 'category',
    type: 'string',
    required: false,
    enum: ['week', 'all', 'month', 'year'],
    description: '주간, 전체',
  })
  category?: 'week' | 'all' | 'month' | 'year';
}
