import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { paginationRequestDto } from '../../libs/pagination.request.dto';

export class TagListRequestDto extends paginationRequestDto {
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
