import { IsNotEmpty, IsDate, MinDate } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateReservationDto {
  @IsNotEmpty()
  hotelRoom: ObjectId;

  // TODO: add validation for date
  // @MinDate(new Date())
  dateStart: Date;

  // TODO: add validation for date
  // @IsDate()
  dateEnd: Date;
}
