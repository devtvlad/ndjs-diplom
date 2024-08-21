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
import { ObjectId } from 'mongodb';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userRepository: Model<UserDocument>,
    @InjectConnection() private connection: Connection,
  ) {}

  public async registerClient(data: RegisterClientDto): Promise<UserDocument> {
    const existing = await this.userRepository
      .findOne({ email: data.email })
      .exec();
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = new this.userRepository({
      email: data.email,
      passwordHash: hashedPassword,
      name: data.name,
      contactPhone: data.contactPhone,
    });
    const savedUser = await newUser.save();

    delete savedUser.passwordHash;
    return savedUser.toJSON() as unknown as UserDocument;
  }

  public async createUser(data: CreateUserDto): Promise<UserDocument> {
    const existing = await this.userRepository
      .findOne({ email: data.email })
      .exec();
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = new this.userRepository({
      email: data.email,
      passwordHash: hashedPassword,
      name: data.name,
      contactPhone: data.contactPhone,
      role: data.role,
    });
    const savedUser = await newUser.save();

    delete savedUser.passwordHash;
    return savedUser.toJSON() as unknown as UserDocument;
  }

  public async findByEmail(email: string): Promise<UserDocument> {
    const user = await this.userRepository.findOne({ email: email }).exec();
    if (!user) {
      throw new NotFoundException(`User with this email is not exists`);
    }
    // TODO: cant login if I delete password here
    // user.passwordHash = undefined;
    return user.toJSON() as unknown as UserDocument;
  }

  public async findById(id: ObjectId): Promise<UserDocument> {
    const user = await this.userRepository.findById({ _id: id }).exec();
    if (!user) {
      throw new NotFoundException(`User with this id is not exists`);
    }
    user.passwordHash = undefined; // TODO: think about better way to remove passwordHash
    return user.toJSON() as unknown as UserDocument;
  }

  // TODO: add limit & offset
  public async findAll(params: SearchUserParamsDto): Promise<UserDocument[]> {
    const query: any = {};

    // search by <param> with case sensitive

    if (params.email) {
      query.email = { $regex: params.email, $options: 'i' };
    }

    if (params.name) {
      query.name = { $regex: params.name, $options: 'i' };
    }

    if (params.contactPhone) {
      query.contactPhone = { $regex: params.contactPhone, $options: 'i' };
    }

    // const users = await this.userRepository.find(query).exec();
    // return users.map((user) => user.toJSON() as unknown as UserDocument);
    const users = await this.userRepository.find(query).exec();
    // TODO: change resp fields
    return users.map((user) => {
      user = user.toJSON();
      delete user.passwordHash;
      return user as UserDocument;
    });
  }
}
