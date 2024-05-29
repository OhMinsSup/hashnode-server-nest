import { ApiProperty } from '@nestjs/swagger';
import { PostPublishedListQuery } from './post-published-list.query';
import { IsOptionalNumber } from '../../decorators/Is-optional-number.decorator';

export class PostTrendingListQuery extends PostPublishedListQuery {
  @IsOptionalNumber()
  @ApiProperty({
    name: 'duration',
    required: false,
    description: '이전 N일간의 트렌딩 게시물을 조회합니다.',
    default: 7,
  })
  duration?: number;
}
