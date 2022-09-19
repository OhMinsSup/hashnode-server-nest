import { ApiProperty } from '@nestjs/swagger';
import { CommonResponseDto } from '../../libs/http-response.dto';

// response ok

export class OkResponseDto {
  @ApiProperty({
    type: 'number',
  })
  userId: number;

  @ApiProperty({
    type: 'string',
  })
  accessToken: string | null;
}

// 200 response

export class CreateOkResponseDto extends CommonResponseDto {
  @ApiProperty({
    type: OkResponseDto,
  })
  result: OkResponseDto;
}

export class SigninOkResponseDto extends CommonResponseDto {
  @ApiProperty({
    type: OkResponseDto,
  })
  result: OkResponseDto;
}

// 400 response

export class CreateBadRequestResponseDto extends CommonResponseDto {
  @ApiProperty({
    type: 'string',
  })
  message: string;

  @ApiProperty({
    type: 'string',
  })
  error: string;

  @ApiProperty({
    type: 'object',
    nullable: true,
  })
  result: Record<string, any> | null;
}

export class SigninBadRequestResponseDto {
  @ApiProperty({
    type: 'number',
  })
  resultCode: number;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
    },
  })
  message: string[];

  @ApiProperty({
    type: 'string',
    enum: ['pasword', 'email'],
  })
  error: 'password' | 'email';

  @ApiProperty({
    type: 'object',
    nullable: true,
  })
  result: Record<string, any> | null;
}
