import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UsePipes,
  Body,
  Param,
  UseGuards,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto';
import { LoggingInterceptor } from '../app.logging.interceptor';
import { ObjectId } from 'mongodb';
import { ParseObjectIdPipe } from '../common/parse.objectid.pipe';
import { Reservation } from './reservation.schema';
import { UserDocument } from '../user/user.schema';
import { GetUser } from '../user/user.decorator';
import { ValidationPipe } from '../common/validation.pipe';
import { checkUserClientRole, checkUserManagerRole } from '../common/utils';
import { ReservationRO } from './reservation.interface';

@UseInterceptors(LoggingInterceptor)
@Controller('api')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post('/client/reservations/')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async createReservation(
    @GetUser() user: UserDocument,
    @Body(new ValidationPipe()) createReservationDto: CreateReservationDto,
  ): Promise<ReservationRO> {
    checkUserClientRole(user);
    const userId: ObjectId = user._id;
    return await this.reservationService.createReservation(
      createReservationDto,
      userId,
    );
  }

  @Get('/client/reservations/')
  @UseGuards(AuthGuard('jwt'))
  async getReservations(
    @GetUser() user: UserDocument,
  ): Promise<ReservationRO[]> {
    checkUserClientRole(user);
    const userId: ObjectId = user._id;
    return await this.reservationService.getReservations(userId);
  }

  @Delete('/client/reservations/:id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(204) // for no content response
  async deleteReservationByIdForClient(
    @GetUser() user: UserDocument,
    @Param('id', ParseObjectIdPipe) reservationId: ObjectId,
  ): Promise<null> {
    checkUserClientRole(user);
    const userId: ObjectId = user._id;
    return await this.reservationService.deleteReservationByIdForClient(
      reservationId,
      userId,
    );
  }

  @Get('/manager/reservations/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getClientReservations(
    @GetUser() user: UserDocument,
    @Param('userId', ParseObjectIdPipe) clientId: ObjectId,
  ): Promise<ReservationRO[]> {
    checkUserManagerRole(user);
    return await this.reservationService.getClientReservations(clientId);
  }

  @Delete('/manager/reservations/:id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(204) // for no content response
  async deleteReservationByIdForManager(
    @GetUser() user: UserDocument,
    @Param('id', ParseObjectIdPipe) reservationId: ObjectId,
  ): Promise<null> {
    checkUserManagerRole(user);
    return await this.reservationService.deleteReservationByIdForManager(
      reservationId,
    );
  }
}
