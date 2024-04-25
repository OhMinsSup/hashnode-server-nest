import { ApiProperty } from '@nestjs/swagger';
import { IsOptionalArray } from '../../decorators/is-optional-array.decorator';
import { IsBoolean, IsOptional, MaxLength } from 'class-validator';
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

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: '새로운 임시 저장 여부',
    type: 'boolean',
    required: false,
  })
  isNewDraft?: boolean;
}
