import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

// decorator
import { AuthUser } from '../libs/get-user.decorator';
import { LoggedInGuard } from '../modules/guard/logged-in.guard';

// service
import { UserService } from './user.service';

// dto
import { UpdateBody } from './dto/update';

// types
import type { Response } from 'express';
import type { UserWithInfo } from '../modules/database/select/user.select';

@ApiTags('사용자')
@Controller('api/v1/users')
export class UserController {
  constructor(private readonly service: UserService) { }

  @Get()
  @ApiOperation({ summary: '내 정보' })
  @UseGuards(LoggedInGuard)
  me(@AuthUser() user: UserWithInfo) {
    return this.service.getUserInfo(user);
  }

  @Put()
  @ApiOperation({ summary: '내 정보 수정' })
  @ApiBody({
    required: true,
    description: '내 정보 수정',
    type: UpdateBody,
  })
  @UseGuards(LoggedInGuard)
  update(@AuthUser() user: UserWithInfo, @Body() input: UpdateBody) {
    return this.service.update(user, input);
  }

  @Post('logout')
  @ApiOperation({ summary: '로그아웃' })
  logout(@Res() res: Response) {
    return res.status(HttpStatus.OK).json(this.service.logout(res));
  }
}
