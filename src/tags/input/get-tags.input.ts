import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { PaginationInput } from '../../integrations/dto/pagination.input';
import { IsOptionalString } from '../../decorators/Is-optional-string.decorator';

export class GetTagsInput extends PaginationInput {
  @IsOptionalString()
  @ApiProperty({
    name: 'name',
    type: 'string',
    required: false,
    description: '검색어',
  })
  name?: string;

  @IsOptional()
  @IsEnum(['recent', 'popular', 'new', 'trending'])
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
    required: false,
    enum: ['week', 'all', 'month', 'year'],
    description: '주간, 전체',
  })
  category?: 'week' | 'all' | 'month' | 'year';
}
