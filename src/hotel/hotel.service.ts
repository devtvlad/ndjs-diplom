import * as fs from 'fs';
import * as path from 'path';
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import {
  CreateHotelDto,
  UpdateHotelDto,
  CreateHotelRoomDto,
  UpdateHotelRoomDto,
  SearchHotelParamsDto,
  SearchHotelRoomParamsDto,
} from './dto';
import {
  Hotel,
  HotelDocument,
  HotelRoom,
  HotelRoomDocument,
} from './hotel.schema';
import { ObjectId } from 'mongodb';

@Injectable()
export class HotelService {
  constructor(
    @InjectModel(Hotel.name) private hotelRepository: Model<HotelDocument>,
    @InjectModel(HotelRoom.name)
    private hotelRoomRepository: Model<HotelRoomDocument>,
    @InjectConnection() private connection: Connection,
  ) {}

  public async getAll(
    searchHotelRoomParamsDto: SearchHotelRoomParamsDto,
  ): Promise<HotelRoom[]> {
    const { limit, offset, hotel } = searchHotelRoomParamsDto;

    const hotelRooms = await this.hotelRoomRepository
      .find({ hotel: hotel })
      .skip(offset)
      .limit(limit)
      .exec();

    return hotelRooms as unknown as HotelRoom[];
  }

  public async findById(id: ObjectId): Promise<HotelRoom> {
    const hotelRoom = await this.hotelRoomRepository
      .findOne({ _id: id })
      .exec();
    return hotelRoom;
  }

  public async createHotel(createHotelDto: CreateHotelDto): Promise<Hotel> {
    const existing = await this.hotelRepository
      .findOne({ title: createHotelDto.title })
      .exec();
    if (existing) {
      throw new ConflictException('Hotel with this title already exists');
    }
    const newHotel = new this.hotelRepository({
      title: createHotelDto.title,
      description: createHotelDto.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const savedHotel = await newHotel.save();

    return savedHotel;
  }

  public async getHotels(
    searchHotelRoomParamsDto: SearchHotelParamsDto,
  ): Promise<Hotel[]> {
    const query: any = {};

    // search by <param> with case sensitive
    if (searchHotelRoomParamsDto.title) {
      query.title = { $regex: searchHotelRoomParamsDto.title, $options: 'i' };
    }

    const hotelRooms = await this.hotelRepository
      .find({ title: query.title })
      .skip(searchHotelRoomParamsDto.offset)
      .limit(searchHotelRoomParamsDto.limit)
      .exec();

    return hotelRooms as unknown as Hotel[];
  }

  public async updateHotel(
    id: ObjectId,
    updateHotelDto: UpdateHotelDto,
  ): Promise<Hotel> {
    const updatedHotel = await this.hotelRepository
      .findByIdAndUpdate(
        { _id: id },
        { ...updateHotelDto, updatedAt: new Date() },
        { new: true },
      )
      .exec();
    if (!updatedHotel) {
      throw new NotFoundException(`Hotel with id=${id} is not exists`);
    }
    // TODO: change resp fields
    return updatedHotel.toJSON() as unknown as Hotel;
  }

  public async createHotelRoom(
    createHotelRoomDto: CreateHotelRoomDto,
    files: Array<any>, // TODO: fix type
  ): Promise<HotelRoom> {
    const existing = await this.hotelRepository
      .findById({ _id: createHotelRoomDto.hotel })
      .exec();
    if (!existing) {
      throw new NotFoundException(
        `Hotel with this hotelId=${createHotelRoomDto.hotel} not exists`,
      );
    }

    const processedFiles: { fileName: string; path: string }[] = [];

    // Save each file individually
    for (const file of files) {
      // Replace spaces with underscores
      const sanitizedOriginalName = file.originalname.replace(/ /g, '_');
      // Generate a unique filename combining date-time and the original filename
      const finalFilename = `${Date.now()}.${sanitizedOriginalName}`;

      // Define destination folder and full path
      const destFolder = './dist/uploads/';
      const filePath = path.join(destFolder, finalFilename);

      // TODO: fix creation of folder
      // Ensure the destination folder exists
      if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder);
      }

      try {
        await fs.promises.writeFile(filePath, file.buffer);
      } catch (err) {
        console.error(err);
      }

      processedFiles.push({
        fileName: finalFilename,
        path: filePath,
      });
    }

    // Store the processed files info in the 'images' property
    const images = processedFiles.map((fileInfo) => fileInfo.fileName);

    const newHotelRoom = new this.hotelRoomRepository({
      hotel: createHotelRoomDto.hotel,
      description: createHotelRoomDto.description,
      images: images,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedHotelRoom = await newHotelRoom.save();

    return savedHotelRoom;
  }

  // For testing purpose only
  public async getFile(filename: string): Promise<any | false> {
    const filePath = path.join(__dirname, '..', 'uploads', `${filename}`);
    console.log('\x1b[33m%s\x1b[0m', filePath);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath);
    } else {
      return false;
    }
  }

  // TODO: add case if image not exists
  // TODO: add case if images were deleted from images array
  public async updateHotelRoom(
    id: ObjectId,
    updateHotelRoomDto: UpdateHotelRoomDto,
    files: Array<any>, // TODO: fix type
  ): Promise<HotelRoom> {
    const existing = await this.hotelRepository
      .findById({ _id: updateHotelRoomDto.hotel })
      .exec();
    if (!existing) {
      throw new NotFoundException(
        `Hotel with this hotelId=${updateHotelRoomDto.hotel} not exists`,
      );
    }

    const processedFiles: { fileName: string; path: string }[] = [];

    // Save each file individually
    for (const file of files) {
      // Replace spaces with underscores
      const sanitizedOriginalName = file.originalname.replace(/ /g, '_');
      // Generate a unique filename combining date-time and the original filename
      const finalFilename = `${Date.now()}.${sanitizedOriginalName}`;

      // Define destination folder and full path
      const destFolder = './dist/uploads/';
      const filePath = path.join(destFolder, finalFilename);

      // Ensure the destination folder exists
      if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder);
      }

      try {
        await fs.promises.writeFile(filePath, file.buffer);
      } catch (err) {
        console.error(err);
      }

      processedFiles.push({
        fileName: finalFilename,
        path: filePath,
      });
    }

    // Store the processed files info in the 'images' property
    const images = processedFiles.map((fileInfo) => fileInfo.fileName);

    const updatedHotelRoom = await this.hotelRoomRepository
      .findByIdAndUpdate(
        { _id: id },
        {
          ...updateHotelRoomDto,
          updatedAt: new Date(),
          images: [
            ...(typeof updateHotelRoomDto.images === 'string'
              ? [updateHotelRoomDto.images]
              : updateHotelRoomDto.images || []),
            ...images,
          ].filter((item) => item !== null && item !== undefined),
        },
        { new: true },
      )
      .exec();

    return updatedHotelRoom.toJSON() as unknown as HotelRoom;
  }
}
