import { ApiProperty } from '@nestjs/swagger';

export class CommonResponseDto {
  @ApiProperty({
    type: 'number',
  })
  resultCode: number;

  @ApiProperty({
    type: 'string',
  })
  message: string | null;

  @ApiProperty({
    type: 'string',
  })
  error: string | null;
}
