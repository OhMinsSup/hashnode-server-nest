import { ApiProperty } from '@nestjs/swagger';
import { IsOptionalString } from '../../decorators/Is-optional-string.decorator';

export class PaginationInput {
  @IsOptionalString()
  @ApiProperty({
    name: 'limit',
    type: 'string',
    required: false,
    description: '페이지 크기',
    default: 20,
  })
  limit?: number;

  @IsOptionalString()
  @ApiProperty({
    name: 'cursor',
    type: 'string',
    required: false,
    description: '페이지 커서',
  })
  cursor?: string;
}
