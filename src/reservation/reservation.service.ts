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
    // Check for startDate > endDate
    if (new Date(dateStart) > new Date(dateEnd)) {
      throw new ConflictException('Start date cannot be later than end date');
    }

    // Check if the reservation dates are in the past
    const now = new Date();
    if (new Date(dateStart) < now || new Date(dateEnd) < now) {
      throw new ConflictException('Reservation dates cannot be in the past');
    }

    // Check for intersecting reservations
    const intersectingReservations = await this.reservationRepository
      .findOne({
        roomId: hotelRoom,
        $or: [
          {
            dateStart: { $lte: dateEnd },
            dateEnd: { $gte: dateStart },
          },
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
