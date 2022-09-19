import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

// interceptor
import { CookiInterceptor } from 'src/libs/cookie.interceptor';

// service
import { AuthService } from './auth.service';

// dto
import { CreateRequestDto } from './dto/create.request.dto';
import {
  CreateOkResponseDto,
  CreateBadRequestResponseDto,
  SigninOkResponseDto,
  SigninBadRequestResponseDto,
} from './dto/common.response.dto';
import { SigninRequestDto } from './dto/signin.request.dto';

@ApiTags('인증')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({
    required: true,
    description: '회원가입 API',
    type: CreateRequestDto,
  })
  @ApiOkResponse({
    description: '회원가입 성공',
    type: CreateOkResponseDto,
  })
  @ApiBadRequestResponse({
    description: '회원가입 실패',
    type: CreateBadRequestResponseDto,
  })
  @UseInterceptors(CookiInterceptor)
  signup(@Body() input: CreateRequestDto) {
    return this.service.signup(input);
  }

  @Post('signin')
  @ApiOperation({ summary: '로그인' })
  @ApiBody({
    required: true,
    description: '로그인 API',
    type: SigninRequestDto,
  })
  @ApiOkResponse({
    description: '로그인 성공',
    type: SigninOkResponseDto,
  })
  @ApiBadRequestResponse({
    description: '회원가입 실패',
    type: SigninBadRequestResponseDto,
  })
  @ApiNotFoundResponse({
    description: '회원가입 실패',
    type: SigninBadRequestResponseDto,
  })
  @UseInterceptors(CookiInterceptor)
  signin(@Body() input: SigninRequestDto) {
    return this.service.signin(input);
  }
}
