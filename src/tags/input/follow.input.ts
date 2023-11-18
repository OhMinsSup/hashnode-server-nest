import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class TagFollowBody {
  @IsUUID('4')
  @ApiProperty({
    description: '태그 아이디',
    type: 'string',
    required: true,
  })
  tagId: string;
}
