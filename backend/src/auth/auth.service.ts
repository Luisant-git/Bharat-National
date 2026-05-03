import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { SignupDto } from './dto/signup.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AuthService {

  private prisma = new PrismaClient();
  constructor(
  
    private jwtService: JwtService,
  ) {}

  // ✅ SIGNUP
  async signup(data: SignupDto) {
    const existing = await this.prisma.user.findUnique({
      where: { mobilenumber: data.mobilenumber },
    });

    if (existing) {
      throw new BadRequestException('User already exists');
    }

    const user = await this.prisma.user.create({
  data: {
    name: data.name,
    mobilenumber: data.mobilenumber,
    otp: '123456', // required
    otpExpiredAt: new Date(),
  },
});

    return {
      message: 'Signup successful',
      user,
    };
  }

  // ✅ SEND OTP (HARDCODED)
  async sendOtp(data: SendOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { mobilenumber: data.mobilenumber },
    });

    if (!user) {
      throw new BadRequestException('User not found. Please signup');
    }

    const otp = '123456'; 

    await this.prisma.user.update({
      where: { mobilenumber: data.mobilenumber },
      data: {
        otp,
        otpExpiredAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    console.log('OTP (use this):', otp);

    return { message: 'OTP sent (use 123456)' };
  }

  // ✅ VERIFY OTP (LOGIN)
  async verifyOtp(data: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { mobilenumber: data.mobilenumber },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (data.otp !== '123456') {
      throw new UnauthorizedException('Invalid OTP');
    }

    if (!user.otpExpiredAt || user.otpExpiredAt < new Date()) {
      throw new UnauthorizedException('OTP expired');
    }

    const payload = {
      sub: user.id,
      mobilenumber: user.mobilenumber,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        mobilenumber: user.mobilenumber,
      },
    };
  }
}