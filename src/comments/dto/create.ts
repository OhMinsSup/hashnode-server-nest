import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MaxLength,
  IsNotEmpty,
  IsOptional,
  IsNumber,
} from 'class-validator';

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

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    description: '부모 댓글 ID',
    type: 'number',
    required: false,
  })
  parentCommentId?: number;
}
