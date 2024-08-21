import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class RegisterClientDto {
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
}
