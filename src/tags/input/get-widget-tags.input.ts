import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetWidgetTagsInput {
  @IsString()
  @IsOptional()
  @ApiProperty({
    name: 'keyword',
    type: 'string',
    required: false,
    description: '검색어',
  })
  keyword?: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    name: 'limit',
    type: 'number',
    required: false,
    description: '페이지 크기',
    default: 5,
  })
  limit?: number;
}
