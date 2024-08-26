import {
  IsString,
  IsNotEmpty,
  MaxLength,
  // IsNumber,
  IsOptional,
} from 'class-validator';
import { ObjectId } from 'mongodb';

export class SearchHotelRoomParamsDto {
  // @IsNumber()
  @IsNotEmpty()
  limit: number;

  // @IsNumber()
  @IsNotEmpty()
  offset: number;

  @IsNotEmpty()
  hotel: ObjectId;
}
