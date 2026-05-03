import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}


  @Post('signup')
  @ApiBody({ type: SignupDto })
  signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }


  @Post('send-otp')
  @ApiBody({ type: SendOtpDto })
  sendOtp(@Body() body: SendOtpDto) {
    return this.authService.sendOtp(body);
  }


  @Post('verify-otp')
  @ApiBody({ type: VerifyOtpDto })
  verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtp(body);
  }
}