import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PaginationInput {
  @IsString()
  @IsOptional()
  @ApiProperty({
    name: 'limit',
    type: 'string',
    required: false,
    description: '페이지 크기',
    default: 20,
  })
  limit?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    name: 'cursor',
    type: 'string',
    required: false,
    description: '페이지 커서',
  })
  cursor?: string;
}
