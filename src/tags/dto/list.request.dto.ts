import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
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
}
