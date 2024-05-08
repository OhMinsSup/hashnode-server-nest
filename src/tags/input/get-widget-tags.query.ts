import { ApiProperty } from '@nestjs/swagger';
import { IsOptionalString } from '../../decorators/Is-optional-string.decorator';
import { IsOptionalNumber } from '../../decorators/Is-optional-number.decorator';

export class GetWidgetTagsQuery {
  @IsOptionalString()
  @ApiProperty({
    name: 'keyword',
    type: 'string',
    required: false,
    description: '검색어',
  })
  keyword?: string;

  @IsOptionalNumber()
  @ApiProperty({
    name: 'limit',
    type: 'number',
    required: false,
    description: '페이지 크기',
    default: 5,
  })
  limit?: number;
}
