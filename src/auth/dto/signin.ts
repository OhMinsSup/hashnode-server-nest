import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

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
  @MinLength(6)
  @ApiProperty({
    description: 'password',
    minLength: 6,
    type: 'string',
    required: true,
  })
  password: string;
}
