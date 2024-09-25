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
import { ReservationRO } from './reservation.interface';

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
  ): Promise<ReservationRO> {
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

    const populatedReservation = await this.reservationRepository
      .findById(savedReservation._id)
      .populate({
        path: 'roomId',
        populate: {
          path: 'hotel',
          model: 'Hotel',
        },
      })
      .exec();

    return {
      startDate: populatedReservation.dateStart.toISOString(),
      endDate: populatedReservation.dateEnd.toISOString(),
      hotelRoom: {
        description: populatedReservation.roomId.description,
        images: populatedReservation.roomId.images,
      },
      hotel: {
        title: populatedReservation.roomId.hotel.title,
        description: populatedReservation.roomId.hotel.description,
      },
    };
  }

  public async getReservations(userId: ObjectId): Promise<ReservationRO[]> {
    const populatedReservations = await this.reservationRepository
      .find({ userId: userId })
      .populate({
        path: 'roomId',
        populate: {
          path: 'hotel',
          model: 'Hotel',
        },
      })
      .exec();

    return populatedReservations.map((reservation) => ({
      startDate: reservation.dateStart.toISOString(),
      endDate: reservation.dateEnd.toISOString(),
      hotelRoom: {
        description: reservation.roomId.description,
        images: reservation.roomId.images,
      },
      hotel: {
        title: reservation.roomId.hotel.title,
        description: reservation.roomId.hotel.description,
      },
    }));
  }

  public async deleteReservationByIdForClient(
    reservationId: ObjectId,
    userId: ObjectId,
  ): Promise<null> {
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

    // TODO: create negative case for unavailable deleting old reservation

    await this.reservationRepository.deleteOne({ _id: reservationId });

    return null;
  }

  public async getClientReservations(
    clientId: ObjectId,
  ): Promise<ReservationRO[]> {
    const populatedReservations = await this.reservationRepository
      .find({ userId: clientId })
      .populate({
        path: 'roomId',
        populate: {
          path: 'hotel',
          model: 'Hotel',
        },
      })
      .exec();

    return populatedReservations.map((reservation) => ({
      startDate: reservation.dateStart.toISOString(),
      endDate: reservation.dateEnd.toISOString(),
      hotelRoom: {
        description: reservation.roomId.description,
        images: reservation.roomId.images,
      },
      hotel: {
        title: reservation.roomId.hotel.title,
        description: reservation.roomId.hotel.description,
      },
    }));
  }

  public async deleteReservationByIdForManager(
    reservationId: ObjectId,
  ): Promise<null> {
    const reservation = await this.reservationRepository
      .findOne({ _id: reservationId })
      .exec();

    if (!reservation) {
      throw new NotFoundException(
        `Reservation with the id=${reservationId} does not exist`,
      );
    }

    await this.reservationRepository.deleteOne({ _id: reservationId });

    return null;
  }
}
