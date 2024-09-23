import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export type SupportRequestDocument = SupportRequest & Document;

@Schema()
export class SupportRequest {
  @Prop({ required: true })
  user: ObjectId;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    required: false,
    default: [],
  })
  messages: Message[];

  @Prop({ required: false, default: true })
  isActive: boolean;
}

export const SupportRequestSchema =
  SchemaFactory.createForClass(SupportRequest);

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  @Prop({ required: true })
  author: ObjectId;

  @Prop({ required: true, default: Date.now })
  sentAt: Date;

  @Prop({ required: true })
  text: string;

  @Prop({ required: false, default: null })
  readAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
