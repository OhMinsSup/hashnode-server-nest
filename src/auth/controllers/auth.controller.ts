import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

// service
import { AuthService } from '../services/auth.service';

// dto
import { SignupInput } from '../input/signup.input';
import { SigninInput } from '../input/signin.input';

@ApiTags('인증')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({
    required: true,
    description: '회원가입 API',
    type: SignupInput,
  })
  signup(@Body() input: SignupInput) {
    console.log(input);
    return this.service.signup(input);
  }

  @Post('signin')
  @ApiOperation({ summary: '로그인' })
  @ApiBody({
    required: true,
    description: '로그인 API',
    type: SigninInput,
  })
  signin(@Body() input: SigninInput) {
    return this.service.signin(input);
  }
}
