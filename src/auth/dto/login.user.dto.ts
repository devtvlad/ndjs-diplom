import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(128)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(64)
  password: string;
}
