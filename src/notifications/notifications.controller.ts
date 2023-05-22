import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { query } from 'express';
import { AuthUser } from '../libs/get-user.decorator';
import { UserWithInfo } from '../modules/database/select/user.select';
import { LoggedInGuard } from '../modules/guard/logged-in.guard';
import { NotificationListQuery } from './dto/list';
import { NotificationsService } from './notifications.service';

@ApiTags('알림')
@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: '화면 위에 보이는 포스트 정보' })
  @ApiQuery({
    name: 'query',
    type: NotificationListQuery,
    required: true,
    description: '쿼리',
  })
  @UseGuards(LoggedInGuard)
  list(@AuthUser() user: UserWithInfo, @Query() query) {
    return this.service.list(user, query);
  }
}
