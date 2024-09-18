import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { ReservationSchema, Reservation } from './reservation.schema';
import { UserService } from '../user/user.service';
import { User, UserSchema } from '../user/user.schema';
import { HotelRoom, HotelRoomSchema } from '../hotel/hotel.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: HotelRoom.name, schema: HotelRoomSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [ReservationService, UserService],
  controllers: [ReservationController],
  exports: [ReservationService],
})
export class ReservationModule {}
