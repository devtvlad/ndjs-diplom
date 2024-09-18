import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export type ReservationDocument = Reservation & Document;

@Schema()
export class Reservation {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true })
  hotel: ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HotelRoom',
    required: true,
  })
  roomId: ObjectId;

  @Prop({ required: true })
  dateStart: Date;

  @Prop({ required: true })
  dateEnd: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
