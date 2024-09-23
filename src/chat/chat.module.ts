import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import {
  SupportRequestSchema,
  SupportRequest,
  MessageSchema,
  Message,
} from './chat.schema';
import { UserService } from '../user/user.service';
import { UserSchema, User } from '../user/user.schema';
// import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupportRequest.name, schema: SupportRequestSchema },
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema },
    ]),
    // JwtModule.register({
    //   secret: process.env.JWT_SECRET,
    //   signOptions: {
    //     expiresIn: process.env.JWT_EXPIRATION,
    //   },
    // }),
  ],
  providers: [ChatService, UserService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
