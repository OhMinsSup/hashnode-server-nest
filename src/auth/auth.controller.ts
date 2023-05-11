import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

// interceptor
import { CookiInterceptor } from 'src/interceptors/cookie.interceptor';

// service
import { AuthService } from './auth.service';

// dto
import { SignupBody } from './dto/signup';
import { SigninBody } from './dto/signin';

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
  githubCallback() {
    return null;
  }

  @Get('social/callback/google')
  @ApiOperation({ summary: '구글 로그인 콜백' })
  googleCallback() {
    return null;
  }
}
