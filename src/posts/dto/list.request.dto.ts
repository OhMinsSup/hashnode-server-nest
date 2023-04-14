import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { PaginationQuery } from '../../libs/pagination.request.dto';

export class PostListRequestDto extends PaginationQuery {
  @IsString()
  @IsOptional()
  @ApiProperty({
    name: 'name',
    type: 'string',
    required: false,
    description: '검색어',
  })
  keyword?: string;

  @IsString()
  @IsEnum(['recent', 'featured', 'past', 'personalized'])
  @IsOptional()
  @ApiProperty({
    name: 'type',
    type: 'string',
    enum: ['recent', 'featured', 'past', 'personalized'],
    required: false,
    description: '게시물 리스트 타입',
  })
  type?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    name: 'startDate',
    type: 'string',
    required: false,
    description: '시작일',
  })
  startDate?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    name: 'endDate',
    type: 'string',
    required: false,
    description: '종료일',
  })
  endDate?: string;
}

export class GetTopPostsRequestDto {
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
