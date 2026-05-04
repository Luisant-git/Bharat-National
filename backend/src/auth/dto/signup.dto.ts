import { IsString, Length } from 'class-validator';

export class SignupDto {
  @IsString()
  name: string;

  @IsString()
  @Length(10, 10)
  mobilenumber: string;

  @IsString()
  @Length(6, 20)
  password: string;
}