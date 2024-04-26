import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class PaginationInput {
  @ApiProperty({
    name: 'limit',
    type: 'number',
    required: false,
    description: '페이지 크기',
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly limit?: number;

  @ApiProperty({
    name: 'pageNo',
    type: 'number',
    required: true,
    description: '페이지 번호',
  })
  @Type(() => Number)
  @IsNumber()
  readonly pageNo: number;
}
