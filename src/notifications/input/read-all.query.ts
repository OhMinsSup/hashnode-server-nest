import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class NotificationReadAllQuery {
  @IsOptional()
  @IsString()
  @IsEnum(['comments', 'likes', 'articles'])
  @ApiProperty({
    name: 'type',
    type: 'string',
    enum: ['comments', 'likes', 'articles'],
    required: false,
    description: '알림 리스트 타입',
  })
  type?: string;
}
