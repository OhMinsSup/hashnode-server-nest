import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

// service
import { UserService } from '../services/user.service';
import { LoggedInGuard } from '../../decorators/logged-in.decorator';
import { AuthUser } from '../../decorators/get-user.decorator';
import { UserUpdateInput } from '../input/user-update.input';
import type { SerializeUser } from '../../integrations/serialize/serialize.interface';
import { GetWidgetUserQuery } from '../input/get-widget-users.query';

@ApiTags('사용자')
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  @ApiOperation({ summary: '내 정보' })
  @UseGuards(LoggedInGuard)
  getMyInfo(@AuthUser() user: SerializeUser) {
    return this.service.getMyInfo(user);
  }

  @Put()
  @ApiOperation({ summary: '내 정보 수정' })
  @ApiBody({
    required: true,
    description: '내 정보 수정 API',
    type: UserUpdateInput,
  })
  @UseGuards(LoggedInGuard)
  updateMyInfo(
    @Body() input: UserUpdateInput,
    @AuthUser() user: SerializeUser,
  ) {
    return this.service.update(user, input);
  }

  @Get('widget')
  @ApiOperation({
    summary: '게시물 작성시 태그 선택 목록에서 노출될 태그 목록',
  })
  @ApiQuery({
    name: 'query',
    type: GetWidgetUserQuery,
    required: false,
    description: 'widget 목록에서 검색시 필요한 쿼리',
  })
  @UseGuards(LoggedInGuard)
  getWidgetUsers(
    @AuthUser() user: SerializeUser,
    @Query() input: GetWidgetUserQuery,
  ) {
    return this.service.getWidgetUsers(user, input);
  }
}
