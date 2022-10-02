import {
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Response } from 'express';
import { AuthUser, type AuthUserSchema } from '../libs/get-user.decorator';
import { LoggedInGuard } from '../modules/auth/logged-in.guard';
import { MeOkResponseDto } from './dto/me.dto';

// service
import { UserService } from './user.service';

@ApiTags('사용자')
@Controller('api/v1/users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  @ApiOperation({ summary: '내 정보' })
  @ApiOkResponse({
    description: '내정보 성공',
    type: MeOkResponseDto,
  })
  @UseGuards(LoggedInGuard)
  me(@AuthUser() user: AuthUserSchema) {
    return this.service.getUserInfo(user);
  }

  @Post('logout')
  @ApiOperation({ summary: '로그아웃' })
  logout(@Res() res: Response) {
    return res.status(HttpStatus.OK).json(this.service.logout(res));
  }
}
