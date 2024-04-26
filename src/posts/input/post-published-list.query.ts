import { ApiProperty } from '@nestjs/swagger';
import { PaginationInput } from '../../integrations/dto/pagination.input';
import { IsOptionalString } from '../../decorators/Is-optional-string.decorator';

export class PostPublishedListQuery extends PaginationInput {
  @IsOptionalString()
  @ApiProperty({
    name: 'keyword',
    type: 'string',
    required: false,
    description: '검색어',
  })
  keyword?: string;
}
