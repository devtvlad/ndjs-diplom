import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseInterceptors,
  UseGuards,
  UsePipes,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoggingInterceptor } from '../app.logging.interceptor';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto';
import { CreateUserDto, RegisterClientDto } from '../user/dto';
import { CreateUserRO, RegisterClientRO, LoginUserRO } from './auth.interface';
import { ValidationPipe } from '../common/validation.pipe';
import { User } from '../user/user.decorator';
import { Role } from '../user/user.interface';

@UseInterceptors(LoggingInterceptor)
@Controller('api')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 2.3.1. Вход
  // Стартует сессию пользователя и выставляет Cookies.
  @Post('/auth/login')
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  login(
    @Body(new ValidationPipe()) loginUserDto: LoginUserDto,
  ): Promise<LoginUserRO> {
    return this.authService.login(loginUserDto);
  }

  // 2.3.3. Регистрация
  // Позволяет создать пользователя с ролью client в системе.
  @Post('/client/register')
  @UsePipes(new ValidationPipe())
  registerClient(
    @Body(new ValidationPipe()) registerClientDto: RegisterClientDto,
  ): Promise<RegisterClientRO> {
    return this.authService.registerClient(registerClientDto);
  }

  // 2.4.1. Создание пользователя
  // Позволяет пользователю с ролью admin создать пользователя в системе.
  @Post('/admin/users')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  createUser(
    @User() user,
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
  ): Promise<CreateUserRO> {
    console.log(user);
    if (user.role !== Role.Admin) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN); // TODO: fix forbidden msg
    }
    return this.authService.createUser(createUserDto);
  }
}
