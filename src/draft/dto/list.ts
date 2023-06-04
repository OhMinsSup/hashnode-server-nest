import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQuery } from '../../libs/pagination';

export class DraftListQuery extends PaginationQuery {
  @IsOptional()
  @IsString()
  @ApiProperty({
    name: 'keyword',
    type: 'string',
    required: false,
    description: '검색어',
  })
  keyword?: string;
}
