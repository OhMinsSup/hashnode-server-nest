import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CommonResponseDto } from 'src/libs/http-response.dto';

export class CreateRequestDto {
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

// signup DTO

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

export class CreateOkResponseDto extends CommonResponseDto {
  @ApiProperty({
    type: OkResponseDto,
  })
  result: OkResponseDto;
}

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
