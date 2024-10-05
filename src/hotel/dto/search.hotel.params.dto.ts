import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class SearchHotelParamsDto {
  @IsNotEmpty()
  limit: number;

  @IsNotEmpty()
  offset: number;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  title: string;
}
