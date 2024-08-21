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
  Headers,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoggingInterceptor } from '../app.logging.interceptor';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto';
import { CreateUserDto, RegisterClientDto } from '../user/dto';
import { CreateUserRO, RegisterClientRO, LoginUserRO } from './auth.interface';
import { ValidationPipe } from '../common/validation.pipe';
import { GetUser } from '../user/user.decorator';
import { Role } from '../user/user.interface';

@UseInterceptors(LoggingInterceptor)
@Controller('api')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/auth/login')
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  login(
    @Body(new ValidationPipe()) loginUserDto: LoginUserDto,
  ): Promise<LoginUserRO> {
    return this.authService.login(loginUserDto);
  }

  @Post('/auth/logout')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  async logout(@Headers('authorization') authorizationHeader): Promise<void> {
    const token = authorizationHeader.split(' ')[1];
    await this.authService.logout(token);
  }

  @Post('/client/register')
  @UsePipes(new ValidationPipe())
  registerClient(
    @Body(new ValidationPipe()) registerClientDto: RegisterClientDto,
  ): Promise<RegisterClientRO> {
    return this.authService.registerClient(registerClientDto);
  }

  @Post('/admin/users')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  createUser(
    @GetUser() user,
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
  ): Promise<CreateUserRO> {
    if (user.role !== Role.Admin) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN); // TODO: fix forbidden msg
    }
    return this.authService.createUser(createUserDto);
  }
}
