import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto';
import { CreateUserDto } from '../user/dto';
import { AuthRO } from './auth.interface';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @HttpCode(200)
  login(@Body() loginUserDto: LoginUserDto): Promise<AuthRO> {
    return this.authService.login(loginUserDto);
  }

  @Post('/signup')
  register(@Body() createUserDto: CreateUserDto): Promise<AuthRO> {
    return this.authService.register(createUserDto);
  }
}
