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
import { LoggedInGuard } from '../modules/auth/logged-in.guard';

// service
import { UserService } from './user.service';

// types
import type { AuthUserSchema } from '../libs/get-user.decorator';
import type { Response } from 'express';
import { UpdateBody } from './dto/update';

@ApiTags('사용자')
@Controller('api/v1/users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  @ApiOperation({ summary: '내 정보' })
  @UseGuards(LoggedInGuard)
  me(@AuthUser() user: AuthUserSchema) {
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
  update(@AuthUser() user: AuthUserSchema, @Body() input: UpdateBody) {
    return this.service.update(user, input);
  }

  @Post('logout')
  @ApiOperation({ summary: '로그아웃' })
  logout(@Res() res: Response) {
    return res.status(HttpStatus.OK).json(this.service.logout(res));
  }
}
