import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private prisma = new PrismaClient();

  constructor(private jwtService: JwtService) {}

  // ✅ SIGNUP
  async signup(data: SignupDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { mobilenumber: data.mobilenumber },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        mobilenumber: data.mobilenumber,
        password: hashedPassword,
      },
    });

    return {
      message: 'Signup successful',
      user: {
        id: user.id,
        name: user.name,
        mobilenumber: user.mobilenumber,
      },
    };
  }

  // ✅ LOGIN
 async login(data: LoginDto) {
  const user = await this.prisma.user.findUnique({
    where: { mobilenumber: data.mobilenumber },
  });

  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  // ✅ FIX: handle nullable password
  if (!user.password) {
    throw new UnauthorizedException('Password not set for this user');
  }

  const isPasswordValid = await bcrypt.compare(
    data.password,
    user.password, // now guaranteed string
  );

  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid password');
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