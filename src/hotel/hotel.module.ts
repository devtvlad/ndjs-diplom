import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelService } from './hotel.service';
import { HotelController } from './hotel.controller';
import { HotelSchema, Hotel, HotelRoomSchema, HotelRoom } from './hotel.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Hotel.name, schema: HotelSchema },
      { name: HotelRoom.name, schema: HotelRoomSchema },
    ]),
  ],
  providers: [HotelService],
  controllers: [HotelController],
  exports: [HotelService],
})
export class HotelModule {}
