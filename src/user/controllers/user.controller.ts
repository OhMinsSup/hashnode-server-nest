import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

// service
import { UserService } from '../services/user.service';
import { LoggedInGuard } from '../../decorators/logged-in.decorator';
import { AuthUser } from '../../decorators/get-user.decorator';
import { UserUpdateInput } from '../input/user-update.input';
import type { SerializeUser } from '../../integrations/serialize/serialize.interface';

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
}
