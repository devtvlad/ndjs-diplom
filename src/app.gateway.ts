import {
  SubscribeMessage,
  OnGatewayConnection,
  MessageBody,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat/chat.service';
import { UserService } from './user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ObjectId } from 'mongodb';
import { UserDocument } from './user/user.schema';
import { Role } from './user/user.interface';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  public user?: UserDocument;
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('subscribeToChat')
  async handleGetMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatId: ObjectId,
  ): Promise<void> {
    if (this.user.role !== Role.Client && this.user.role !== Role.Manager) {
      client.disconnect();
      return;
    }
    const messages = await this.chatService.getMessages(chatId, this.user);
    client.emit('response_message', messages);
  }

  afterInit(server: Server) {
    this.logger.log(server);
    //TODO
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    //TODO
  }

  async handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    try {
      const payload = this.jwtService.verify(
        client.handshake.headers.authorization,
      );
      const user = await this.userService.findByEmail(payload.email);
      !user && client.disconnect();
      this.user = user;
    } catch (error) {
      await this.server.emit('response_message', { message: `${error}` });
      client.disconnect();
    }
  }
}
