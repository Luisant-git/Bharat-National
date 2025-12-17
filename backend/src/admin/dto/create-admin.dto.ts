
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'Unique email address of the admin',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPass123',
    description: 'Password for the admin (minimum 6 characters)',
    minLength: 6,
  })
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: true,
    description: 'Whether the admin account is active',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


export class LoginAdminDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'Registered admin email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPass123',
    description: 'Admin password (minimum 6 characters)',
    minLength: 6,
  })
  @MinLength(6)
  password: string;
}
