import * as fs from 'fs';
import * as path from 'path';
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Connection, Model, ObjectId } from 'mongoose';
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
import { Role } from '../user/user.interface';
import {
  HotelRoomRO,
  HotelRoomDetailRO,
  HotelRO,
  CreateOrUpdateHotelRoomRO,
} from './hotel.interface';

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
    role: Role | undefined,
  ): Promise<HotelRoomRO[]> {
    const { limit, offset, hotel } = searchHotelRoomParamsDto;

    let hotelRooms = undefined;

    // show only enabled (isEnabled=true) for non auth users and clients
    if (role === Role.Client || role === undefined) {
      hotelRooms = await this.hotelRoomRepository
        .find({ hotel: hotel, isEnabled: true })
        .skip(offset)
        .limit(limit)
        .populate('hotel', 'id title') // load only id & title from Hotel
        .exec();
    } // show any enabled (isEnabled=true) or disabled (isEnabled=false) for admins and managers
    else if (role === Role.Admin || role === Role.Manager) {
      hotelRooms = await this.hotelRoomRepository
        .find({ hotel: hotel })
        .skip(offset)
        .limit(limit)
        .populate('hotel', 'id title') // load only id & title from Hotel
        .exec();
    }

    return hotelRooms.map((hotelRoom) => ({
      id: hotelRoom._id,
      description: hotelRoom.description,
      images: hotelRoom.images,
      hotel: {
        id: hotelRoom.hotel._id,
        title: hotelRoom.hotel.title,
      },
    }));
  }

  public async findById(id: ObjectId): Promise<HotelRoomDetailRO> {
    const hotelRoom = await this.hotelRoomRepository
      .findOne({ _id: id })
      .populate('hotel', 'id title description')
      .exec();

    // Workaround (cast the type of hotelRoom.hotel so that TypeScript recognizes the existence of _id)
    const hotel = hotelRoom.hotel as Hotel & { _id: ObjectId };

    return {
      id: hotelRoom._id,
      description: hotelRoom.description,
      images: hotelRoom.images,
      hotel: {
        id: hotel._id,
        title: hotel.title,
        description: hotel.description,
      },
    };
  }

  public async createHotel(createHotelDto: CreateHotelDto): Promise<HotelRO> {
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

    return {
      id: savedHotel._id,
      title: savedHotel.title,
      description: savedHotel.description,
    };
  }

  public async getHotels(
    searchHotelRoomParamsDto: SearchHotelParamsDto,
  ): Promise<HotelRO[]> {
    const query: any = {};

    // search by <param> with case sensitive
    if (searchHotelRoomParamsDto.title) {
      query.title = { $regex: searchHotelRoomParamsDto.title, $options: 'i' };
    }

    const hotels = await this.hotelRepository
      .find({ title: query.title })
      .skip(searchHotelRoomParamsDto.offset)
      .limit(searchHotelRoomParamsDto.limit)
      .exec();

    return hotels.map((hotel) => ({
      id: hotel._id,
      title: hotel.title,
      description: hotel.description,
    }));
  }

  public async updateHotel(
    id: ObjectId,
    updateHotelDto: UpdateHotelDto,
  ): Promise<HotelRO> {
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

    return {
      id: updatedHotel._id,
      title: updatedHotel.title,
      description: updatedHotel.description,
    };
  }

  public async createHotelRoom(
    createHotelRoomDto: CreateHotelRoomDto,
    files: Array<any>, // TODO: fix type
  ): Promise<CreateOrUpdateHotelRoomRO> {
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

    return {
      id: savedHotelRoom._id,
      description: savedHotelRoom.description,
      images: savedHotelRoom.images,
      isEnabled: savedHotelRoom.isEnabled,
      hotel: {
        id: existing._id,
        title: existing.title,
        description: existing.description,
      },
    };
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
  ): Promise<CreateOrUpdateHotelRoomRO> {
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

    return {
      id: updatedHotelRoom._id,
      description: updatedHotelRoom.description,
      images: updatedHotelRoom.images,
      isEnabled: updatedHotelRoom.isEnabled,
      hotel: {
        id: existing._id,
        title: existing.title,
        description: existing.description,
      },
    };
  }
}
