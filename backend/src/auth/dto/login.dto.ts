import { IsString, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  @Length(10, 10)
  mobilenumber: string;

  @IsString()
  password: string;
}