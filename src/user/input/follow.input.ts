import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UserFollowBody {
  @IsUUID('4')
  @ApiProperty({
    description: '유저 아이디',
    type: 'string',
    required: true,
  })
  userId: string;
}
