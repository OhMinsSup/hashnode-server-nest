import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../libs/get-user.decorator';
import { UserWithInfo } from '../modules/database/select/user.select';
import { LoggedInGuard } from '../modules/guard/logged-in.guard';
import { NotificationListQuery } from './dto/list';
import { NotificationsService } from './notifications.service';
import { NotificationReadAllQuery } from './dto/read.all';

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
  list(@AuthUser() user: UserWithInfo, @Query() query: NotificationListQuery) {
    return this.service.list(user, query);
  }

  @Put(':id/read')
  @ApiOperation({ summary: '알림 읽음 처리' })
  @UseGuards(LoggedInGuard)
  read(@AuthUser() user: UserWithInfo, @Param('id', ParseIntPipe) id: number) {
    return this.service.read(user, id);
  }

  @Put('all/read')
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
}
