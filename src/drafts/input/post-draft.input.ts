import { ApiProperty } from '@nestjs/swagger';
import { IsOptionalArray } from '../../decorators/is-optional-array.decorator';
import { MaxLength } from 'class-validator';
import { IsOptionalString } from '../../decorators/Is-optional-string.decorator';

export class PostDraftInput {
  @IsOptionalString()
  @MaxLength(200)
  @ApiProperty({
    description: '제목',
    maxLength: 200,
    type: 'string',
    nullable: true,
    required: false,
  })
  title?: string;

  @IsOptionalArray()
  @ApiProperty({
    description: '태그',
    type: 'array',
    items: {
      type: 'string',
    },
    nullable: true,
    required: false,
  })
  tags?: string[];
}
