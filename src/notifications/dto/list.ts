import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQuery } from '../../libs/pagination';

export class NotificationListQuery extends PaginationQuery {
  @IsString()
  @IsEnum(['comments', 'likes', 'articles'])
  @IsOptional()
  @ApiProperty({
    name: 'type',
    type: 'string',
    enum: ['comments', 'likes', 'articles'],
    required: false,
    description: '알림 리스트 타입',
  })
  type?: string;
}
