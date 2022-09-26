import { ApiProperty } from '@nestjs/swagger';
import { CommonResponseDto } from 'src/libs/http-response.dto';
import { MeEntity } from './common.response.dto';

// 200 response

export class MeOkResponseDto extends CommonResponseDto {
  @ApiProperty({
    type: MeEntity,
  })
  result: MeEntity;
}
