import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';

import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ✅ SIGNUP
  @Post('signup')
  @ApiBody({ type: SignupDto })
  signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }

  // ✅ LOGIN
  @Post('login')
  @ApiBody({ type: LoginDto })
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
}