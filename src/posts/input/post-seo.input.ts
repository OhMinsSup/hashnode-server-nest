import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';
import { IsOptionalUrl } from '../../decorators/Is-optional-url.decorator';
import { IsOptionalString } from '../../decorators/Is-optional-string.decorator';

export class PostSeoInput {
  @IsOptionalString()
  @MaxLength(70)
  @ApiProperty({
    description: 'SEO 제목',
    maxLength: 70,
    type: 'string',
    required: false,
  })
  title?: string;

  @IsOptionalString()
  @MaxLength(156)
  @ApiProperty({
    description: 'SEO 설명',
    maxLength: 156,
    type: 'string',
    required: false,
  })
  description?: string;

  @IsOptionalUrl()
  @ApiProperty({
    description: 'OG 이미지 URL',
    type: 'string',
    nullable: true,
    required: false,
  })
  image?: string;
}
