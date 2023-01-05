import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateRequestDto } from '../../posts/dto/create.request.dto';
// body

// partial class validateor class
export class DraftCreateRequestDto extends PartialType(CreateRequestDto) {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '간단한 설명',
    type: 'string',
    required: true,
  })
  description?: string;
}

export class DraftRequestDto extends DraftCreateRequestDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: '초안 정보 아이디',
    type: 'number',
    nullable: true,
    required: false,
  })
  draftId?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '간단한 설명',
    type: 'string',
    required: true,
  })
  description?: string;
}
