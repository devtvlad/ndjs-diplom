import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class UpdateHotelDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(128)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(256)
  description?: string;
}
