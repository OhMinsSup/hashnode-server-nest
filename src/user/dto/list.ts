import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationQuery } from '../../libs/pagination.request.dto';

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
