import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginUserDto } from './dto';
import { CreateUserDto } from '../user/dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  // TODO: add typeRO
  async login(loginUserDto: LoginUserDto): Promise<any> {
    const { email, password } = loginUserDto;

    const user = await this.userService.findByEmail(loginUserDto.email);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const validatePassword = await bcrypt.compare(password, user.passwordHash);
    if (!validatePassword) {
      throw new UnauthorizedException('invalid password');
    }
    delete user.passwordHash;
    return {
      token: this.jwtService.sign({
        email,
      }),
      _id: user._id,
      email: user.email,
      name: user.name,
      contactPhone: user.contactPhone,
    };
  }

  // TODO: add typeRO
  async register(createUserDto: CreateUserDto): Promise<any> {
    const user = await this.userService.create(createUserDto);
    return {
      token: this.jwtService.sign({ email: user.email }),
      _id: user._id,
      email: user.email,
      name: user.name,
      contactPhone: user.contactPhone,
    };
  }
}
