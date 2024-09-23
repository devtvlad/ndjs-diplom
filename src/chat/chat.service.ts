import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import {
  CreateMessageDto,
  SearchSupportRequestsParamsDto,
  ReadMessagesDto,
} from './dto';
import {
  SupportRequest,
  SupportRequestDocument,
  Message,
  MessageDocument,
} from './chat.schema';
import { ObjectId } from 'mongodb';
import {
  SupportRequestForClientRO,
  SupportRequestForManagerRO,
  MessageRO,
  ReadMessagesRO,
} from './chat.interface';
import { User, UserDocument } from '../user/user.schema';
import { Role } from '../user/user.interface';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(SupportRequest.name)
    private supportRequestRepository: Model<SupportRequestDocument>,
    @InjectModel(Message.name)
    private messageRepository: Model<MessageDocument>,
    @InjectModel(User.name) private userRepository: Model<UserDocument>,
    @InjectConnection() private connection: Connection,
  ) {}

  public async createSupportRequest(
    createMessageDto: CreateMessageDto,
    userId: ObjectId,
  ): Promise<SupportRequestForClientRO[]> {
    const newSupportRequest = new this.supportRequestRepository({
      user: userId,
    });

    const savedSupportRequest = await newSupportRequest.save();

    const newMessage = new this.messageRepository({
      author: userId,
      text: createMessageDto.text,
    });

    const savedMessage = await newMessage.save();

    savedSupportRequest.messages.push(savedMessage._id);

    await savedSupportRequest.save();

    // TODO: add logic for hasNewMessages
    const response: SupportRequestForClientRO[] = [
      {
        id: savedSupportRequest._id.toString(),
        createdAt: savedSupportRequest.createdAt.toISOString(),
        isActive: savedSupportRequest.isActive,
        hasNewMessages: true,
      },
    ];

    return response;
  }

  public async getSupportRequestsByClient(
    searchSupportRequestsParamsDto: SearchSupportRequestsParamsDto,
    userId: ObjectId,
  ): Promise<SupportRequestForClientRO[]> {
    const { limit, offset, isActive } = searchSupportRequestsParamsDto;

    const supportRequests = await this.supportRequestRepository
      .find({ user: userId, isActive: isActive })
      .skip(offset)
      .limit(limit)
      .exec();

    // TODO: add logic for hasNewMessages
    const response: SupportRequestForClientRO[] = supportRequests.map(
      (supportRequest) => ({
        id: supportRequest._id.toString(),
        createdAt: supportRequest.createdAt.toISOString(),
        isActive: supportRequest.isActive,
        hasNewMessages: true,
      }),
    );

    return response;
  }

  public async getSupportRequestsByManager(
    searchSupportRequestsParamsDto: SearchSupportRequestsParamsDto,
  ): Promise<SupportRequestForManagerRO[]> {
    const { limit, offset, isActive } = searchSupportRequestsParamsDto;

    const supportRequests = await this.supportRequestRepository
      .find({ isActive: isActive })
      .skip(offset)
      .limit(limit)
      .exec();

    // TODO: add logic for hasNewMessages
    const response: SupportRequestForManagerRO[] = await Promise.all(
      supportRequests.map(async (supportRequest) => {
        const client = await this.userRepository
          .findById(supportRequest.user)
          .exec();

        return {
          id: supportRequest._id.toString(),
          createdAt: supportRequest.createdAt.toISOString(),
          isActive: supportRequest.isActive,
          hasNewMessages: true,
          client: {
            id: client._id.toString(),
            name: client.name,
            email: client.email,
            contactPhone: client.contactPhone,
          },
        };
      }),
    );

    return response;
  }

  public async getMessages(
    supportRequestId: ObjectId,
    user: UserDocument,
  ): Promise<MessageRO[]> {
    const supportRequest = await this.supportRequestRepository
      .findById(supportRequestId)
      .populate('messages')
      .exec();

    if (!supportRequest) {
      throw new NotFoundException(
        `Support request with id=${supportRequestId} not exists`,
      );
    }

    if (
      user.role === Role.Client &&
      supportRequest.user.toString() !== user._id.toString()
    ) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN); // TODO: fix forbidden msg
    }

    const messages = await this.messageRepository
      .find({ _id: { $in: supportRequest.messages } })
      .exec();

    const authorIds = [...new Set(messages.map((message) => message.author))];

    const authors = await this.userRepository
      .find({ _id: { $in: authorIds } })
      .exec();

    const authorsMap = authors.reduce((acc, author) => {
      acc[author._id.toString()] = author;
      return acc;
    }, {});

    const response: MessageRO[] = messages.map((message) => {
      const author = authorsMap[message.author.toString()];

      return {
        id: message._id.toString(),
        createdAt: message.sentAt.toISOString(),
        text: message.text,
        readAt: message.readAt ? message.readAt.toISOString() : null,
        author: {
          id: author._id.toString(),
          name: author.name,
        },
      };
    });

    return response;
  }

  public async sendMessage(
    supportRequestId: ObjectId,
    createMessageDto: CreateMessageDto,
    user: UserDocument,
  ): Promise<MessageRO[]> {
    const supportRequest = await this.supportRequestRepository
      .findById(supportRequestId)
      .exec();

    if (!supportRequest) {
      throw new NotFoundException(
        `Support request with id=${supportRequestId} not exists`,
      );
    }

    if (
      user.role === Role.Client &&
      supportRequest.user.toString() !== user._id.toString()
    ) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN); // TODO: fix forbidden msg
    }

    const newMessage = new this.messageRepository({
      text: createMessageDto.text,
      author: user._id,
    });

    await newMessage.save();

    supportRequest.messages.push(newMessage._id);
    await supportRequest.save();

    const author = await this.userRepository.findById(newMessage.author).exec();

    const response: MessageRO[] = [
      {
        id: newMessage._id.toString(),
        createdAt: newMessage.sentAt.toISOString(),
        text: newMessage.text,
        readAt: newMessage.readAt ? newMessage.readAt.toISOString() : null,
        author: {
          id: author._id.toString(),
          name: author.name,
        },
      },
    ];

    return response;
  }

  public async readMessages(
    supportRequestId: ObjectId,
    readMessagesDto: ReadMessagesDto,
    user: UserDocument,
  ): Promise<ReadMessagesRO> {
    const createdBeforeTimestamp = new Date(
      readMessagesDto.createdBefore,
    ).getTime(); // convert ISO_DATE to timestamp

    if (createdBeforeTimestamp > Date.now()) {
      throw new HttpException(
        'Date can not be in the future',
        HttpStatus.FORBIDDEN,
      ); // TODO: fix forbidden msg
    }

    const test = Date.now();
    console.log(readMessagesDto.createdBefore);
    console.log(test);

    const supportRequest = await this.supportRequestRepository
      .findById(supportRequestId)
      .exec();

    if (!supportRequest) {
      throw new NotFoundException(
        `Support request with id=${supportRequestId} not exists`,
      );
    }

    if (
      user.role === Role.Client &&
      supportRequest.user.toString() !== user._id.toString()
    ) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN); // TODO: fix forbidden msg
    }

    const notReadedMessages = await this.messageRepository
      .find({ _id: { $in: supportRequest.messages }, readAt: null })
      .exec();

    if (notReadedMessages.length === 0) {
      return { success: true };
    }

    const earliestMessage = notReadedMessages.reduce((earliest, message) =>
      earliest.sentAt < message.sentAt ? earliest : message,
    );

    const earliestMessageTimestamp = new Date(earliestMessage.sentAt).getTime();

    if (createdBeforeTimestamp < earliestMessageTimestamp) {
      throw new HttpException(
        'Date can not be earlier than the creation date of the earliest unread message',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.messageRepository.updateMany(
      { _id: { $in: notReadedMessages.map((message) => message._id) } },
      { $set: { readAt: readMessagesDto.createdBefore } },
    );

    // TODO: add case for unsuccessful update

    return { success: true };
  }
}
