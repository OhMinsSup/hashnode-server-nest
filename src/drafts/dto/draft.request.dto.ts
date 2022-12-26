import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { CreateRequestDto } from '../../posts/dto/create.request.dto';
// body

// partial class validateor class
export class DraftCreateRequestDto extends PartialType(CreateRequestDto) {}

export class DraftRequestDto extends CreateRequestDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: '초안 정보 아이디',
    type: 'number',
    nullable: true,
    required: false,
  })
  draftId?: number;

  @ApiProperty({
    type: PartialType<CreateRequestDto>,
    required: true,
    description: '수정한 데이터 정보',
  })
  updateData: Partial<CreateRequestDto>;
}
