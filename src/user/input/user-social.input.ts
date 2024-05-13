import { ApiProperty } from '@nestjs/swagger';
import { IsOptionalUrl } from '../../decorators/Is-optional-url.decorator';

export class UserSocialsInput {
  @IsOptionalUrl()
  @ApiProperty({
    description: '깃허브',
    type: 'string',
    required: false,
  })
  github?: string;

  @IsOptionalUrl()
  @ApiProperty({
    description: '페이스북',
    type: 'string',
    required: false,
  })
  facebook?: string;

  @IsOptionalUrl()
  @ApiProperty({
    description: '트위터',
    type: 'string',
    required: false,
  })
  twitter?: string;

  @IsOptionalUrl()
  @ApiProperty({
    description: '인스타그램',
    type: 'string',
    required: false,
  })
  instagram?: string;

  @IsOptionalUrl()
  @ApiProperty({
    description: 'Stack Overflow',
    type: 'string',
    required: false,
  })
  stackoverflow?: string;

  @IsOptionalUrl()
  @ApiProperty({
    description: '유튜브',
    type: 'string',
    required: false,
  })
  youtube?: string;

  @IsOptionalUrl()
  @ApiProperty({
    description: '링크드인',
    type: 'string',
    required: false,
  })
  linkedin?: string;

  @IsOptionalUrl()
  @ApiProperty({
    description: '웹사이트',
    type: 'string',
    required: false,
  })
  website?: string;
}
