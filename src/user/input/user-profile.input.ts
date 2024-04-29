import { ApiProperty, PickType } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';
import { SignupInput } from '../../auth/input/signup.input';
import { IsOptionalString } from '../../decorators/Is-optional-string.decorator';
import { IsOptionalUrl } from '../../decorators/Is-optional-url.decorator';

export class UserProfileInput extends PickType(SignupInput, [
  'nickname',
  'username',
]) {
  @IsOptionalUrl()
  @ApiProperty({
    description: '유저 프로필 이미지',
    maxLength: 255,
    type: 'string',
    required: false,
  })
  image?: string;

  @IsOptionalString()
  @MaxLength(255)
  @ApiProperty({
    description: '한줄소개',
    maxLength: 255,
    type: 'string',
    required: false,
  })
  tagline?: string;

  @IsOptionalString()
  @MaxLength(255)
  @ApiProperty({
    description: '위치',
    maxLength: 255,
    type: 'string',
    required: false,
  })
  location?: string;

  @IsOptionalString()
  @MaxLength(255)
  @ApiProperty({
    description: '소개',
    maxLength: 255,
    type: 'string',
    required: false,
  })
  bio?: string;

  @IsOptionalString()
  @MaxLength(140)
  @ApiProperty({
    description: '사용가능한 시간',
    maxLength: 140,
    type: 'string',
    required: false,
  })
  availableText?: string;
}
