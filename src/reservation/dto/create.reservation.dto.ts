import { IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateReservationDto {
  @IsNotEmpty()
  hotelRoom: ObjectId;

  // TODO: add validation for date
  dateStart: Date;

  // TODO: add validation for date
  dateEnd: Date;
}
