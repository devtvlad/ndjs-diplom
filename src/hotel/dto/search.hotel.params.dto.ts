import {
  IsString,
  IsNotEmpty,
  MaxLength,
  // IsNumber,
  IsOptional,
} from 'class-validator';

export class SearchHotelParamsDto {
  // @IsNumber()
  @IsNotEmpty()
  limit: number;

  // @IsNumber()
  @IsNotEmpty()
  offset: number;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  title: string;
}
