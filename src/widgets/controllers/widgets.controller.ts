import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WidgetsService } from '../services/widgets.service';
import { SerializeUser } from '../../integrations/serialize/serialize.interface';
import { LoggedInGuard } from '../../decorators/logged-in.decorator';
import { AuthUser } from '../../decorators/get-user.decorator';

@ApiTags('위젯')
@Controller('widgets')
export class WidgetsController {
  constructor(private readonly service: WidgetsService) {}

  @Get('get-leftside-post-count')
  @ApiOperation({
    summary: '작성 페이지에서 왼쪽에 노출될 위젯에 대한 카운트 조회',
  })
  @UseGuards(LoggedInGuard)
  getLeftSidePostCount(@AuthUser() user: SerializeUser) {
    return this.service.getLeftSidePostCount(user);
  }

  @Get('get-main-layout')
  @ApiOperation({ summary: '메인 레이아웃 위젯 데이터 조회' })
  getMainLayoutWidgets(@AuthUser() user?: SerializeUser) {
    return this.service.getMainLayoutWidgets(user);
  }
}
