import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

// body

export class SignupBody {
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
  @MinLength(2)
  @MaxLength(20)
  @ApiProperty({
    example: 'username',
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
    example: 'name',
    description: '이름',
    type: 'string',
    required: false,
  })
  name: string;

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
