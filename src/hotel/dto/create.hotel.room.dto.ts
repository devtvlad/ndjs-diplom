import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ObjectId } from 'mongodb';

export class CreateHotelRoomDto {
  @IsNotEmpty()
  hotel: ObjectId;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(256)
  description: string;
}
