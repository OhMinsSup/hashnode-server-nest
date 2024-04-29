import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsOptionalArray } from '../../decorators/is-optional-array.decorator';
import { UserProfileInput } from './user-profile.input';
import { UserSocialsInput } from './user-social.input';
import { SigninInput } from '../../auth/input/signin.input';

export class UserUpdateInput extends PickType(SigninInput, ['email']) {
  @IsOptionalArray()
  @ApiProperty({
    description: '기술스택',
    type: 'array',
    items: {
      type: 'string',
    },
    required: false,
  })
  skills?: string[];

  @ApiProperty({
    description: '유저 프로필',
    type: UserProfileInput,
    required: true,
  })
  profile: UserProfileInput;

  @ApiProperty({
    description: '유저 소셜',
    type: UserSocialsInput,
    required: true,
  })
  social: UserSocialsInput;
}
