import { Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../../decorators/get-user.decorator';
import { UserWithInfo } from '../../modules/database/prisma.interface';
import { LoggedInGuard } from '../../decorators/logged-in.decorator';
import { NotificationListQuery } from '../input/list.query';
import { NotificationsService } from '../services/notifications.service';
import { NotificationReadAllQuery } from '../input/read-all.query';

@ApiTags('알림')
@Controller('notifications')
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
  list(@AuthUser() user: UserWithInfo, @Query() query: NotificationListQuery) {
    return this.service.list(user, query);
  }

  // 유저의 알림 카운트 값을 가져온다.
  @Get('count')
  @ApiOperation({ summary: '알림 카운트' })
  @UseGuards(LoggedInGuard)
  count(@AuthUser() user: UserWithInfo) {
    return this.service.count(user);
  }

  @Put('read-all')
  @ApiOperation({ summary: '모든 알림 읽음 처리' })
  @ApiQuery({
    name: 'query',
    type: NotificationReadAllQuery,
    required: true,
    description: '쿼리',
  })
  @UseGuards(LoggedInGuard)
  readAll(
    @AuthUser() user: UserWithInfo,
    @Query() query: NotificationReadAllQuery,
  ) {
    return this.service.readAll(user, query);
  }

  @Put(':id/read')
  @ApiOperation({ summary: '알림 읽음 처리' })
  @UseGuards(LoggedInGuard)
  read(@AuthUser() user: UserWithInfo, @Param('id') id: string) {
    return this.service.read(user, id);
  }
}
