import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TagFollowBody {
  @IsString()
  @ApiProperty({
    description: '태그 아이디',
    type: 'string',
    required: true,
  })
  slug: string;
}
