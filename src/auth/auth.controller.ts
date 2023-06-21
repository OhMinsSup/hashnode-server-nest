import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

// interceptor
import { CookiInterceptor } from '../interceptors/cookie.interceptor';

// service
import { AuthService } from './auth.service';

// dto
import { SignupBody } from './dto/signup';
import { SigninBody } from './dto/signin';
import { SocialQuery } from './dto/social';

@ApiTags('인증')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({
    required: true,
    description: '회원가입 API',
    type: SignupBody,
  })
  @UseInterceptors(CookiInterceptor)
  signup(@Body() input: SignupBody) {
    return this.service.signup(input);
  }

  @Post('signin')
  @ApiOperation({ summary: '로그인' })
  @ApiBody({
    required: true,
    description: '로그인 API',
    type: SigninBody,
  })
  @UseInterceptors(CookiInterceptor)
  signin(@Body() input: SigninBody) {
    return this.service.signin(input);
  }

  @Get('social/callback/github')
  @ApiOperation({ summary: '깃허브 로그인 콜백' })
  @ApiQuery({
    name: 'query',
    type: SocialQuery,
    required: true,
    description: '깃허브 로그인 콜백 쿼리',
  })
  githubCallback(
    @Query() query: SocialQuery,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.service.githubCallback(query, res);
  }

  @Get('social/callback/google')
  @ApiOperation({ summary: '구글 로그인 콜백' })
  googleCallback() {
    return null;
  }
}
