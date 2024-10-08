import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { Role } from '../user.interface';

export class CreateUserDto {
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

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(64)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(64)
  contactPhone: string;

  @IsString()
  @MinLength(5)
  @MaxLength(7)
  role: Role;
}
