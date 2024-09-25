import { Connection, Model } from 'mongoose';
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, SearchUserParamsDto, RegisterClientDto } from './dto';
import { User, UserDocument } from './user.schema';
// import { ObjectId } from 'mongodb';
import { RegisterClientRO, CreateUserRO } from '../auth/auth.interface';
import { UserRO } from './user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userRepository: Model<UserDocument>,
    @InjectConnection() private connection: Connection,
  ) {}

  public async registerClient(
    registerClientDto: RegisterClientDto,
  ): Promise<RegisterClientRO> {
    const existing = await this.userRepository
      .findOne({ email: registerClientDto.email })
      .exec();
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(registerClientDto.password, 10);

    const newUser = new this.userRepository({
      email: registerClientDto.email,
      passwordHash: hashedPassword,
      name: registerClientDto.name,
      contactPhone: registerClientDto.contactPhone,
    });
    const savedUser = await newUser.save();

    return {
      id: savedUser._id,
      email: savedUser.email,
      name: savedUser.name,
    };
  }

  public async createUser(createUserDto: CreateUserDto): Promise<CreateUserRO> {
    const existing = await this.userRepository
      .findOne({ email: createUserDto.email })
      .exec();
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = new this.userRepository({
      email: createUserDto.email,
      passwordHash: hashedPassword,
      name: createUserDto.name,
      contactPhone: createUserDto.contactPhone,
      role: createUserDto.role,
    });
    const savedUser = await newUser.save();

    return {
      id: savedUser._id,
      email: savedUser.email,
      name: savedUser.name,
      contactPhone: savedUser.contactPhone,
      role: savedUser.role,
    };
  }

  public async findByEmail(email: string): Promise<UserDocument> {
    const user = await this.userRepository.findOne({ email: email }).exec();
    if (!user) {
      throw new NotFoundException(`User with this email is not exists`);
    }
    return user;
  }

  public async findAll(
    searchUserParamsDto: SearchUserParamsDto,
  ): Promise<UserRO[]> {
    const query: any = {};

    // search by <param> with case sensitive
    if (searchUserParamsDto.email) {
      query.email = { $regex: searchUserParamsDto.email, $options: 'i' };
    }

    if (searchUserParamsDto.name) {
      query.name = { $regex: searchUserParamsDto.name, $options: 'i' };
    }

    if (searchUserParamsDto.contactPhone) {
      query.contactPhone = {
        $regex: searchUserParamsDto.contactPhone,
        $options: 'i',
      };
    }

    const users = await this.userRepository
      .find(query)
      .skip(searchUserParamsDto.offset)
      .limit(searchUserParamsDto.limit)
      .exec();

    return users.map((user) => ({
      id: user._id,
      email: user.email,
      name: user.name,
      contactPhone: user.contactPhone,
    }));
  }
}
