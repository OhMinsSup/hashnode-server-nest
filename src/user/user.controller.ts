import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

// decorator
import { AuthUser } from '../libs/get-user.decorator';
import { LoggedInGuard } from '../modules/guard/logged-in.guard';

// service
import { UserService } from './user.service';

// dto
import { UpdateBody } from './dto/update';
import { MyPostListQuery } from './dto/list';

// types
import type { Response } from 'express';
import type { UserWithInfo } from '../modules/database/select/user.select';

@ApiTags('사용자')
@Controller('api/v1/users')
export class UserController {
  constructor(private readonly service: UserService) {}

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

  @Delete()
  @ApiOperation({ summary: '회원 탈퇴' })
  @UseGuards(LoggedInGuard)
  delete(
    @AuthUser() user: UserWithInfo,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.service.delete(user, res);
  }

  @Post('logout')
  @ApiOperation({ summary: '로그아웃' })
  logout(@Res({ passthrough: true }) res: Response) {
    return this.service.logout(res);
  }

  @Get('my-posts')
  @ApiOperation({ summary: '내가 쓴 글' })
  @ApiQuery({
    name: 'query',
    type: MyPostListQuery,
    required: true,
    description: '페이지네이션',
  })
  @UseGuards(LoggedInGuard)
  myPosts(@AuthUser() user: UserWithInfo, @Query() query: MyPostListQuery) {
    return this.service.myPosts(user, query);
  }

  @Get('follow-tags')
  @ApiOperation({ summary: '내가 팔로우한 태그' })
  @UseGuards(LoggedInGuard)
  getFollowTags(@AuthUser() user: UserWithInfo) {
    return this.service.getFollowTags(user);
  }

  @Get('treanding-users')
  @ApiOperation({ summary: '트렌딩 사용자' })
  getTrendingUsers() {
    return this.service.getTrendingUsers();
  }

  @Get(':username')
  @ApiOperation({ summary: '사용자 정보' })
  getUserInfo(@Query('username') username: string) {
    return this.service.getUserInfoByUsername(username);
  }

  @Get(':username/posts')
  @ApiOperation({ summary: '사용자가 쓴 글' })
  @ApiQuery({
    name: 'query',
    type: MyPostListQuery,
    required: true,
    description: '페이지네이션',
  })
  getUserPosts(
    @Query('username') username: string,
    @Query() query: MyPostListQuery,
  ) {
    return this.service.getUserPosts(username, query);
  }
}
