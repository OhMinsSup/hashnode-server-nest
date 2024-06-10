import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

// service
import { UserService } from '../services/user.service';
import { LoggedInGuard } from '../../decorators/logged-in.decorator';
import { AuthUser } from '../../decorators/get-user.decorator';
import { UserUpdateInput } from '../input/user-update.input';
import type { SerializeUser } from '../../integrations/serialize/serialize.interface';
import { GetWidgetUserQuery } from '../input/get-widget-users.query';
import { UserEmailUpdateInput } from '../input/user-email-update.input';

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

  @Throttle({ default: { limit: 10, ttl: 60 } })
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

  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Delete()
  @ApiOperation({ summary: '내 정보 삭제' })
  @UseGuards(LoggedInGuard)
  deleteMyInfo(@AuthUser() user: SerializeUser) {
    return this.service.delete(user);
  }

  @Get(':username')
  @ApiOperation({ summary: '사용자 정보' })
  getUserInfo(@Param('username') username: string) {
    return this.service.getUserInfo(username);
  }

  @Get('widget')
  @ApiOperation({
    summary: '게시물 작성시 태그 선택 목록에서 노출될 태그 목록',
    deprecated: true,
  })
  @ApiQuery({
    name: 'query',
    type: GetWidgetUserQuery,
    required: false,
    deprecated: true,
    description: 'widget 목록에서 검색시 필요한 쿼리',
  })
  @UseGuards(LoggedInGuard)
  getWidgetUsers(
    @AuthUser() user: SerializeUser,
    @Query() input: GetWidgetUserQuery,
  ) {
    return this.service.getWidgetUsers(user, input);
  }

  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Put('email-preferences')
  @ApiOperation({ summary: '내 정보에서 이메일 설정' })
  @ApiBody({
    required: true,
    description: '내 정보에서 이메일 설정 API',
    type: UserUpdateInput,
  })
  @UseGuards(LoggedInGuard)
  updateByEmailPreferences(
    @Body() input: UserEmailUpdateInput,
    @AuthUser() user: SerializeUser,
  ) {
    return this.service.updateByEmailPreferences(user, input);
  }
}
