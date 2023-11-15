import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SigninInput {
  @IsEmail()
  @MaxLength(255)
  @ApiProperty({
    description: '이메일',
    maxLength: 255,
    type: 'string',
    required: true,
  })
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(10)
  @ApiProperty({
    description: '비밀번호',
    maxLength: 10,
    minLength: 6,
    type: 'string',
    required: true,
  })
  password: string;
}
