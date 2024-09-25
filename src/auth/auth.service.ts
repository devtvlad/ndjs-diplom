import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginUserDto } from './dto';
import { CreateUserDto, RegisterClientDto } from '../user/dto';
import { CreateUserRO, RegisterClientRO, LoginUserRO } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async login(loginUserDto: LoginUserDto): Promise<LoginUserRO> {
    const { email, password } = loginUserDto;

    const user = await this.userService.findByEmail(loginUserDto.email);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const validatePassword = await bcrypt.compare(password, user.passwordHash);
    if (!validatePassword) {
      throw new UnauthorizedException('invalid password');
    }
    return {
      token: this.jwtService.sign({
        email,
      }),
      email: user.email,
      name: user.name,
      contactPhone: user.contactPhone,
    };
  }

  async registerClient(
    registerClientDto: RegisterClientDto,
  ): Promise<RegisterClientRO> {
    const user = await this.userService.registerClient(registerClientDto);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async createUser(createUserDto: CreateUserDto): Promise<CreateUserRO> {
    const user = await this.userService.createUser(createUserDto);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      contactPhone: user.contactPhone,
      role: user.role,
    };
  }

  async logout(token: string) {
    try {
      // TODO: just check if token is valid and delete it from cookie on frontend
      await this.jwtService.verify(token);
      return { message: 'Logout successful' };
    } catch (error) {
      throw new UnauthorizedException('Invalid Token');
    }
  }
}
