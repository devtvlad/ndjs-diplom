import {
  Controller,
  Get,
  // NotFoundException,
  // Param,
  UseInterceptors,
  UsePipes,
  UseGuards,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { User } from './user.schema';
import { LoggingInterceptor } from '../app.logging.interceptor';
import { ValidationPipe } from '../common/validation.pipe';
// import { ParseObjectIdPipe } from '../common/parse.objectid.pipe';
// import { ObjectId } from 'mongodb';
import { SearchUserParamsDto } from './dto';
import { GetUser } from '../user/user.decorator';
import { Role } from '../user/user.interface';
import { checkUserAdminRole } from '../common/utils';

@UseInterceptors(LoggingInterceptor)
@Controller('api')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/admin/users/')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async findAllByAdmin(
    @GetUser() user: User,
    @Query(new ValidationPipe()) searchUserParamsDto: SearchUserParamsDto,
  ): Promise<User[]> {
    checkUserAdminRole(user);
    return await this.userService.findAll(searchUserParamsDto);
  }

  @Get('/manager/users/')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async findAllByManager(
    @GetUser() user: User,
    @Query(new ValidationPipe()) searchUserParamsDto: SearchUserParamsDto,
  ): Promise<User[]> {
    // TODO: think maybe I should add this role check in utils too
    if (user.role !== Role.Manager) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN); // TODO: fix forbidden msg
    }
    return await this.userService.findAll(searchUserParamsDto);
  }

  // @Get(':id')
  // async findById(@Param('id', ParseObjectIdPipe) id: ObjectId): Promise<User> {
  //   const user = await this.userService.findById(id);
  //   if (!user) {
  //     throw new NotFoundException(`User with id=${id} not found`);
  //   }
  //   return user;
  // }

  // @Get('/email/:email')
  // // TODO: add validation pipe
  // async findByEmail(@Param('email') email: string): Promise<User> {
  //   const user = await this.userService.findByEmail(email);
  //   if (!user) {
  //     throw new NotFoundException(`User with email=${email} not found`);
  //   }
  //   return user;
  // }
}
