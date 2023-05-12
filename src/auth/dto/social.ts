import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SocialQuery {
  @IsString()
  @ApiProperty({
    name: 'code',
    type: 'string',
    required: false,
    description: 'social code',
  })
  code: string;
}
