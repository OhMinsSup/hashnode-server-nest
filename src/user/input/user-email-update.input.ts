import { ApiProperty } from '@nestjs/swagger';
import { IsOptionalUrl } from '../../decorators/Is-optional-url.decorator';
import { IsBoolean } from 'class-validator';

export class UserEmailUpdateInput {
  @IsBoolean()
  @ApiProperty({
    description: '해쉬노드 주간 소식',
    type: 'boolean',
    required: true,
  })
  hashnodeWeekly: boolean;

  @IsBoolean()
  @ApiProperty({
    description: '활동 알림',
    type: 'boolean',
    required: true,
  })
  activityNotifications: boolean;

  @IsBoolean()
  @ApiProperty({
    description: '일반 공지사항',
    type: 'boolean',
    required: true,
  })
  generalAnnouncements: boolean;

  @IsBoolean()
  @ApiProperty({
    description: '월간 블로그 통계',
    type: 'boolean',
    required: true,
  })
  monthlyBlogStats: boolean;

  @IsBoolean()
  @ApiProperty({
    description: '월간 블로그 소식',
    type: 'boolean',
    required: true,
  })
  referralNotifications: boolean;

  @IsBoolean()
  @ApiProperty({
    description: '신규 팔로워 주간 소식',
    type: 'boolean',
    required: true,
  })
  newFollowersWeekly: boolean;
}
