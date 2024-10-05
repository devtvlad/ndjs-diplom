import {
  Controller,
  Get,
  // NotFoundException,
  // Param,
  UseInterceptors,
  UsePipes,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { UserDocument } from './user.schema';
import { LoggingInterceptor } from '../app.logging.interceptor';
import { ValidationPipe } from '../common/validation.pipe';
// import { ParseObjectIdPipe } from '../common/parse.objectid.pipe';
// import { ObjectId } from 'mongodb';
import { SearchUserParamsDto } from './dto';
import { GetUser } from '../user/user.decorator';
import { checkUserAdminRole, checkUserManagerRole } from '../common/utils';
import { UserRO } from './user.interface';

@UseInterceptors(LoggingInterceptor)
@Controller('/')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/admin/users/')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async findAllByAdmin(
    @GetUser() user: UserDocument,
    @Query(new ValidationPipe()) searchUserParamsDto: SearchUserParamsDto,
  ): Promise<UserRO[]> {
    checkUserAdminRole(user);
    return await this.userService.findAll(searchUserParamsDto);
  }

  @Get('/manager/users/')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async findAllByManager(
    @GetUser() user: UserDocument,
    @Query(new ValidationPipe()) searchUserParamsDto: SearchUserParamsDto,
  ): Promise<UserRO[]> {
    checkUserManagerRole(user);
    return await this.userService.findAll(searchUserParamsDto);
  }

  // @Get('/email/:email')
  // async findByEmail(@Param('email') email: string): Promise<User> {
  //   const user = await this.userService.findByEmail(email);
  //   if (!user) {
  //     throw new NotFoundException(`User with email=${email} not found`);
  //   }
  //   return user;
  // }
}
