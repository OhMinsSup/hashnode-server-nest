import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../libs/get-user.decorator';
import { UserWithInfo } from '../modules/database/select/user.select';
import { LoggedInGuard } from '../modules/guard/logged-in.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('알림')
@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @UseGuards(LoggedInGuard)
  list(@AuthUser() user: UserWithInfo) {
    return {
      resultCode: 0,
      message: null,
      error: null,
      result: true,
    };
  }
}
