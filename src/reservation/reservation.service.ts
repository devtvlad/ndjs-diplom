import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { CreateReservationDto } from './dto';
import { Reservation, ReservationDocument } from './reservation.schema';
import { ObjectId } from 'mongodb';
import { HotelRoom, HotelRoomDocument } from '../hotel/hotel.schema';

@Injectable()
export class ReservationService {
  constructor(
    @InjectModel(Reservation.name)
    private reservationRepository: Model<ReservationDocument>,
    @InjectModel(HotelRoom.name)
    private hotelRoomRepository: Model<HotelRoomDocument>,
    @InjectConnection() private connection: Connection,
  ) {}

  public async createReservation(
    createReservationDto: CreateReservationDto,
    userId: ObjectId,
  ): Promise<Reservation> {
    const { hotelRoom, dateStart, dateEnd } = createReservationDto;

    // Check for existing hotelRoom
    const existingHotelRoom = await this.hotelRoomRepository.findById({
      _id: hotelRoom,
    });
    if (!existingHotelRoom) {
      throw new NotFoundException(
        `The room with id=${hotelRoom} does not exist`,
      );
    }
    // Check that existing hotelRoom isEnabled
    if (existingHotelRoom.isEnabled === false) {
      throw new ConflictException(`The room with id=${hotelRoom} is disabled`);
    }
    // TODO: add negative case for starDate > endDate

    // TODO: add validation for date (for previous dates)

    // Check for intersecting reservations
    // TODO: fix it, not working
    // [
    //   {
    //       "_id": "66eadd6c5abfc5e5b2f36173",
    //       "userId": "66cdd9f9b49de9b6b8a67bd2",
    //       "hotel": "66c611e08813595ca9a3cf9b",
    //       "roomId": "66cb46dcf3c88e12f039fa73",
    //       "dateStart": "2024-09-15T00:00:00.000Z",
    //       "dateEnd": "2024-09-16T00:00:00.000Z",
    //       "__v": 0
    //   },
    //   {
    //       "_id": "66eaddba5abfc5e5b2f36185",
    //       "userId": "66cdd9f9b49de9b6b8a67bd2",
    //       "hotel": "66c611e08813595ca9a3cf9b",
    //       "roomId": "66cb46dcf3c88e12f039fa73",
    //       "dateStart": "2024-09-15T00:00:00.000Z",
    //       "dateEnd": "2024-09-16T00:00:00.000Z",
    //       "__v": 0
    //   }
    // ]
    const intersectingReservations = await this.reservationRepository
      .findOne({
        roomId: hotelRoom,
        $or: [
          { dateStart: { $lte: dateEnd }, endDate: { $gte: dateStart } }, // Existing reservation starts before new end date and ends after new start date
        ],
      })
      .exec();
    if (intersectingReservations) {
      throw new ConflictException(
        `The room with id=${hotelRoom} is already reserved for the selected dates`,
      );
    }

    // Create new reservation
    const newReservation = new this.reservationRepository({
      userId: userId,
      hotel: existingHotelRoom.hotel,
      roomId: hotelRoom,
      dateStart: new Date(dateStart),
      dateEnd: new Date(dateEnd),
    });
    const savedReservation = await newReservation.save();
    // TODO: change resp fields
    return savedReservation;
  }

  public async getReservations(userId: ObjectId): Promise<Reservation[]> {
    // Check for intersecting reservations
    const reservations = await this.reservationRepository
      .find({ userId: userId })
      .exec();

    // TODO: change resp fields
    return reservations;
  }

  public async deleteReservationByIdForClient(
    reservationId: ObjectId,
    userId: ObjectId,
  ): Promise<string> {
    const reservation = await this.reservationRepository
      .findOne({ _id: reservationId })
      .exec();

    if (!reservation) {
      throw new NotFoundException(
        `Reservation with the id=${reservationId} does not exist`,
      );
    }

    if (reservation.userId.toString() !== userId.toString()) {
      throw new ForbiddenException(
        'You do not have permission to delete this reservation',
      );
    }

    await this.reservationRepository.deleteOne({ _id: reservationId });

    return 'Reservation deleted successfully';
  }

  public async getClientReservations(
    clientId: ObjectId,
  ): Promise<Reservation[]> {
    // Check for intersecting reservations
    const reservations = await this.reservationRepository
      .find({ userId: clientId })
      .exec();

    // TODO: change resp fields
    return reservations;
  }

  public async deleteReservationByIdForManager(
    reservationId: ObjectId,
  ): Promise<string> {
    const reservation = await this.reservationRepository
      .findOne({ _id: reservationId })
      .exec();

    if (!reservation) {
      throw new NotFoundException(
        `Reservation with the id=${reservationId} does not exist`,
      );
    }

    await this.reservationRepository.deleteOne({ _id: reservationId });

    return 'Reservation deleted successfully';
  }
}
