import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

// decorator
import { AuthUser } from '../../decorators/get-user.decorator';
import { LoggedInGuard } from '../../decorators/logged-in.decorator';
import { CookieClearInterceptor } from '../../interceptors/cookie-clear.interceptor';

// service
import { UserService } from '../services/user.service';

// dto
import { UpdateUserBody } from '../input/update.input';
import { UserFollowBody } from '../input/follow.input';
import { MyPostListQuery, UserListQuery } from '../input/list.query';

// types
import type { UserWithInfo } from '../../modules/database/prisma.interface';

@ApiTags('사용자')
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  @ApiOperation({ summary: '유저 리스트' })
  @ApiQuery({
    name: 'query',
    type: UserListQuery,
    required: true,
    description: '페이지네이션',
  })
  list(@Query() query: UserListQuery, @AuthUser() user?: UserWithInfo) {
    return this.service.list(query, user);
  }

  @Put()
  @ApiOperation({ summary: '내 정보 수정' })
  @ApiBody({
    required: true,
    description: '내 정보 수정',
    type: UpdateUserBody,
  })
  @UseGuards(LoggedInGuard)
  update(@AuthUser() user: UserWithInfo, @Body() input: UpdateUserBody) {
    return this.service.update(user, input);
  }

  @Delete()
  @ApiOperation({ summary: '회원 탈퇴' })
  @UseGuards(LoggedInGuard)
  @UseInterceptors(CookieClearInterceptor)
  delete(@AuthUser() user: UserWithInfo) {
    return this.service.softDelete(user);
  }

  @Get('me')
  @ApiOperation({ summary: '내 정보' })
  @UseGuards(LoggedInGuard)
  me(@AuthUser() user: UserWithInfo) {
    return this.service.getUserInfo(user);
  }

  @Post('follow')
  @ApiOperation({ summary: '사용자 팔로우 및 팔로우 해제' })
  @ApiBody({
    required: true,
    description: '사용자 팔로우 API',
    type: UserFollowBody,
  })
  @UseGuards(LoggedInGuard)
  follow(@AuthUser() user: UserWithInfo, @Body() input: UserFollowBody) {
    return this.service.follow(user, input);
  }

  @Get('follow-tags')
  @ApiOperation({ summary: '내가 팔로우한 태그' })
  @UseGuards(LoggedInGuard)
  getFollowTags(@AuthUser() user: UserWithInfo) {
    return this.service.getFollowTags(user);
  }

  @Get(':username')
  @ApiOperation({ summary: '사용자 정보' })
  getUserInfo(@Param('username') username: string) {
    return this.service.getUserInfoByUsername(username);
  }

  @Get(':username/histories')
  @ApiOperation({ summary: '사용자의 기록' })
  getUserHistories(@Param('username') username: string) {
    return this.service.getUserHistories(username);
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
    @Param('username') username: string,
    @Query() query: MyPostListQuery,
  ) {
    return this.service.getUserPosts(username, query);
  }
}
