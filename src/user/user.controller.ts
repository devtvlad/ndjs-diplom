import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseInterceptors,
  UsePipes,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';
import { LoggingInterceptor } from '../app.logging.interceptor';
import { ValidationPipe } from '../common/validation.pipe';
import { ParseObjectIdPipe } from '../common/parse.objectid.pipe';
import { ObjectId } from 'mongodb';
import { SearchUserParamsDto } from './dto';

@UseInterceptors(LoggingInterceptor)
@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UsePipes(new ValidationPipe())
  async findAll(
    @Query(new ValidationPipe()) params: SearchUserParamsDto,
  ): Promise<User[]> {
    return await this.userService.findAll(params);
  }

  @Get(':id')
  async findById(@Param('id', ParseObjectIdPipe) id: ObjectId): Promise<User> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id=${id} not found`);
    }
    return user;
  }

  @Get('/email/:email')
  // TODO: add validation pipe
  async findByEmail(@Param('email') email: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email=${email} not found`);
    }
    return user;
  }
}
