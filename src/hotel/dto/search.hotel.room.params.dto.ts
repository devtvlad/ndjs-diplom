import { IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongodb';

export class SearchHotelRoomParamsDto {
  @IsNotEmpty()
  limit: number;

  @IsNotEmpty()
  offset: number;

  @IsNotEmpty()
  hotel: ObjectId;
}
