import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateBody {
  @IsNotEmpty()
  @IsString()
  @MaxLength(300)
  @ApiProperty({
    description: '제목',
    maxLength: 300,
    type: 'string',
    required: true,
  })
  text: string;
}
