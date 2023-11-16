import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateBody {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    description: '태그명',
    maxLength: 255,
    type: 'string',
    required: true,
    nullable: true,
  })
  name?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    description: '태그설명',
    maxLength: 255,
    type: 'string',
    nullable: true,
    required: false,
  })
  description?: string | null;

  @IsOptional()
  @IsString()
  @IsUrl()
  @ApiProperty({
    description: '태그이미지',
    type: 'string',
    nullable: true,
    required: false,
  })
  image?: string | null;
}
