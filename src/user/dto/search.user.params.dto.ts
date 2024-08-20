import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  // IsNumber,
  IsOptional,
} from 'class-validator';

export class SearchUserParamsDto {
  // @IsNumber()
  @IsNotEmpty()
  limit: number;

  // @IsNumber()
  @IsNotEmpty()
  offset: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(128)
  email: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(64)
  name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(11)
  @MaxLength(15)
  contactPhone: string;
}
