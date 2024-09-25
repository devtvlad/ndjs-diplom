import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UsePipes,
  Body,
  Param,
  UseGuards,
  Query,
  Put,
  UploadedFiles,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { HotelService } from './hotel.service';
import {
  CreateHotelDto,
  UpdateHotelDto,
  CreateHotelRoomDto,
  UpdateHotelRoomDto,
  SearchHotelParamsDto,
  SearchHotelRoomParamsDto,
} from './dto';
import { LoggingInterceptor } from './../app.logging.interceptor';
import { ValidationPipe } from '../common/validation.pipe';
import { FileValidationPipe } from '../common/file.validation.pipe';
import { ParseObjectIdPipe } from '../common/parse.objectid.pipe';
import { ObjectId } from 'mongoose';
import { GetUser } from '../user/user.decorator';
import { UserDocument } from '../user/user.schema';
import { Res } from '@nestjs/common';
import { Response } from 'express';
import { checkUserAdminRole } from '../common/utils';
import { CurrentUserInspectorGuard } from '../auth/current.user.inspector.guard';
import {
  HotelRoomRO,
  HotelRoomDetailRO,
  HotelRO,
  CreateOrUpdateHotelRoomRO,
} from './hotel.interface';

@UseInterceptors(LoggingInterceptor)
@Controller('api')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Get('/common/hotel-rooms/')
  @UseGuards(CurrentUserInspectorGuard)
  async getAll(
    @GetUser() user: UserDocument,
    @Query(new ValidationPipe())
    searchHotelRoomParamsDto: SearchHotelRoomParamsDto,
  ): Promise<HotelRoomRO[]> {
    return await this.hotelService.getAll(searchHotelRoomParamsDto, user?.role);
  }

  @Get('/common/hotel-rooms/:id')
  async findById(
    @Param('id', ParseObjectIdPipe) id: ObjectId,
  ): Promise<HotelRoomDetailRO> {
    return await this.hotelService.findById(id);
  }

  @Post('/admin/hotels/')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async createHotelByAdmin(
    @GetUser() user: UserDocument,
    @Body(new ValidationPipe()) createHotelDto: CreateHotelDto,
  ): Promise<HotelRO> {
    checkUserAdminRole(user);
    return await this.hotelService.createHotel(createHotelDto);
  }

  @Get('/admin/hotels/')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  // TODO: add query params
  async getHotelsByAdmin(
    @GetUser() user: UserDocument,
    @Query(new ValidationPipe()) searchHotelParamsDto: SearchHotelParamsDto,
  ): Promise<HotelRO[]> {
    checkUserAdminRole(user);
    return await this.hotelService.getHotels(searchHotelParamsDto);
  }

  @Put('/admin/hotels/:id')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async updateHotelByAdmin(
    @GetUser() user: UserDocument,
    @Param('id', ParseObjectIdPipe) id: ObjectId,
    @Body(new ValidationPipe()) updateHotelDto: UpdateHotelDto,
  ): Promise<HotelRO> {
    checkUserAdminRole(user);
    return await this.hotelService.updateHotel(id, updateHotelDto);
  }

  @Post('/admin/hotel-rooms/')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FilesInterceptor('files'))
  async createHotelRoomByAdmin(
    @GetUser() user: UserDocument,
    @Body(new ValidationPipe()) createHotelRoomDto: CreateHotelRoomDto,
    @UploadedFiles(new FileValidationPipe()) files: Array<any>, // TODO: fix type
  ): Promise<CreateOrUpdateHotelRoomRO> {
    checkUserAdminRole(user);
    return await this.hotelService.createHotelRoom(createHotelRoomDto, files);
  }

  // For testing purpose only
  @Get(':filename')
  async serveImage(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    const fileData = await this.hotelService.getFile(filename);
    if (fileData !== false) {
      res.set({
        // 'Content-Type': 'image/png', // TODO: fix type
        'Content-Length': fileData.length,
      });
      res.send(fileData);
    } else {
      res.status(404).send();
    }
  }

  @Put('/admin/hotel-rooms/:id')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FilesInterceptor('files'))
  async updateHotelRoomByAdmin(
    @GetUser() user: UserDocument,
    @Param('id', ParseObjectIdPipe) id: ObjectId,
    @Body(new ValidationPipe()) updateHotelRoomDto: UpdateHotelRoomDto,
    @UploadedFiles(new FileValidationPipe()) files: Array<any>, // TODO: fix type
  ): Promise<CreateOrUpdateHotelRoomRO> {
    checkUserAdminRole(user);
    return await this.hotelService.updateHotelRoom(
      id,
      updateHotelRoomDto,
      files,
    );
  }
}
