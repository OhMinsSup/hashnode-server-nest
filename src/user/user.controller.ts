import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, type AuthUserSchema } from '../libs/get-user.decorator';
import { LoggedInGuard } from '../modules/auth/logged-in.guard';

// service
import { UserService } from './user.service';

@ApiTags('사용자')
@Controller('api/v1/users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  @ApiOperation({ summary: '내 정보' })
  @ApiOkResponse({
    type: 'object',
  })
  @UseGuards(LoggedInGuard)
  me(@AuthUser() user: AuthUserSchema) {
    return this.service.getUserInfo(user);
  }
}
