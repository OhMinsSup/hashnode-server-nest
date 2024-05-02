import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

// service
import { AuthService } from '../services/auth.service';

// interceptor
import { CookiInterceptor } from '../../interceptors/cookie.interceptor';

// input
import { SignupInput } from '../input/signup.input';
import { SigninInput } from '../input/signin.input';
import { Throttle } from '@nestjs/throttler';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Post('signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({
    required: true,
    description: '회원가입 API',
    type: SignupInput,
  })
  @UseInterceptors(CookiInterceptor)
  signup(@Body() input: SignupInput) {
    return this.service.signup(input);
  }

  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Post('signin')
  @ApiOperation({ summary: '로그인' })
  @ApiBody({
    required: true,
    description: '로그인 API',
    type: SigninInput,
  })
  @UseInterceptors(CookiInterceptor)
  signin(@Body() input: SigninInput) {
    return this.service.signin(input);
  }
}
