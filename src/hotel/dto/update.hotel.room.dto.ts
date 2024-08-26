import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ObjectId } from 'mongodb';

export class UpdateHotelRoomDto {
  @IsNotEmpty()
  hotel: ObjectId;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(256)
  description: string;

  @IsOptional()
  @IsBoolean()
  isEnabled: boolean;

  @IsOptional()
  images?: Array<string>;
}
