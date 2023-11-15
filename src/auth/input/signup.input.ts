import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { SigninInput } from './signin.input';

export class SignupInput extends SigninInput {
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @ApiProperty({
    description: '유저명',
    maxLength: 20,
    minLength: 2,
    type: 'string',
    required: true,
  })
  username: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '이름',
    type: 'string',
    required: false,
  })
  nickname: string;
}
