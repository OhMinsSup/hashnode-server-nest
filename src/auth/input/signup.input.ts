import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { SigninInput } from './signin.input';
import { IsOptionalString } from '../../decorators/Is-optional-string.decorator';

export class SignupInput extends SigninInput {
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @ApiProperty({
    description: '유저명',
    maxLength: 10,
    minLength: 2,
    type: 'string',
    required: true,
  })
  username: string;

  @IsOptionalString()
  @MaxLength(40)
  @ApiProperty({
    description: '이름',
    maxLength: 40,
    type: 'string',
    required: false,
  })
  nickname?: string;
}
