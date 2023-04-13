import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

// body

export class SigninBody {
  @IsEmail()
  @MaxLength(255)
  @ApiProperty({
    example: 'email',
    description: '이메일',
    maxLength: 255,
    type: 'string',
    required: true,
  })
  email: string;

  @IsString()
  @MaxLength(10)
  @ApiProperty({
    description: 'password',
    maxLength: 10,
    type: 'string',
    required: true,
  })
  password: string;
}
