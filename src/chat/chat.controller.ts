import {
  Controller,
  Post,
  UseInterceptors,
  UseGuards,
  UsePipes,
  Body,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import {
  CreateMessageDto,
  SearchSupportRequestsParamsDto,
  ReadMessagesDto,
} from './dto';
import { LoggingInterceptor } from '../app.logging.interceptor';
import { ValidationPipe } from '../common/validation.pipe';
import { ParseObjectIdPipe } from '../common/parse.objectid.pipe';
import { ObjectId } from 'mongodb';
import { GetUser } from '../user/user.decorator';
import { UserDocument } from '../user/user.schema';
import {
  checkUserClientRole,
  checkUserManagerRole,
  checkUserClientOrManagerRole,
} from '../common/utils';
import {
  SupportRequestForClientRO,
  SupportRequestForManagerRO,
  MessageRO,
  ReadMessagesRO,
} from './chat.interface';

@UseInterceptors(LoggingInterceptor)
@Controller('/')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('/client/support-requests/')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async createSupportRequest(
    @GetUser() user: UserDocument,
    @Body(new ValidationPipe()) createMessageDto: CreateMessageDto,
  ): Promise<SupportRequestForClientRO[]> {
    checkUserClientRole(user);
    const userId: ObjectId = user._id;
    return await this.chatService.createSupportRequest(
      createMessageDto,
      userId,
    );
  }

  @Get('/client/support-requests/')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async getSupportRequestsByClient(
    @GetUser() user: UserDocument,
    @Query(new ValidationPipe())
    searchSupportRequestsParamsDto: SearchSupportRequestsParamsDto,
  ): Promise<SupportRequestForClientRO[]> {
    checkUserClientRole(user);
    const userId: ObjectId = user._id;
    return await this.chatService.getSupportRequestsByClient(
      searchSupportRequestsParamsDto,
      userId,
    );
  }

  @Get('/manager/support-requests/')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async getSupportRequestsByManager(
    @GetUser() user: UserDocument,
    @Query(new ValidationPipe())
    searchSupportRequestsParamsDto: SearchSupportRequestsParamsDto,
  ): Promise<SupportRequestForManagerRO[]> {
    checkUserManagerRole(user);
    return await this.chatService.getSupportRequestsByManager(
      searchSupportRequestsParamsDto,
    );
  }

  @Get('/common/support-requests/:id/messages')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async getMessages(
    @GetUser() user: UserDocument,
    @Param('id', ParseObjectIdPipe) supportRequestId: ObjectId,
  ): Promise<MessageRO[]> {
    checkUserClientOrManagerRole(user);
    return await this.chatService.getMessages(supportRequestId, user);
  }

  @Post('/common/support-requests/:id/messages')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async sendMessage(
    @GetUser() user: UserDocument,
    @Param('id', ParseObjectIdPipe) supportRequestId: ObjectId,
    @Body(new ValidationPipe()) createMessageDto: CreateMessageDto,
  ): Promise<MessageRO[]> {
    checkUserClientOrManagerRole(user);
    return await this.chatService.sendMessage(
      supportRequestId,
      createMessageDto,
      user,
    );
  }

  @Post('/common/support-requests/:id/messages/read')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async readMessages(
    @GetUser() user: UserDocument,
    @Param('id', ParseObjectIdPipe) supportRequestId: ObjectId,
    @Body(new ValidationPipe()) readMessagesDto: ReadMessagesDto,
  ): Promise<ReadMessagesRO> {
    checkUserClientOrManagerRole(user);
    return await this.chatService.readMessages(
      supportRequestId,
      readMessagesDto,
      user,
    );
  }
}
