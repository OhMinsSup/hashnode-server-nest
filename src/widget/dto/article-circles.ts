import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';

export class GetArticleCirclesQuery {
  @IsOptional()
  @IsNumberString()
  @ApiProperty({
    name: 'userId',
    type: 'string',
    required: false,
    description: '유저 아이디',
  })
  userId?: string;
}