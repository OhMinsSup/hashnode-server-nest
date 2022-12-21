import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { CreateRequestDto } from './create.request.dto';
// body

export class TempRequestDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: '임시 저장 아이디',
    type: 'number',
    required: false,
    nullable: true,
  })
  tempId?: number;

  @IsNumber()
  @ApiProperty({
    description: '게시물 아이디',
    type: 'number',
    required: true,
  })
  postId: number;

  @ApiProperty({
    type: CreateRequestDto,
    required: true,
    description: '게시물 수정 내용',
  })
  updateData: Partial<CreateRequestDto>;
}
