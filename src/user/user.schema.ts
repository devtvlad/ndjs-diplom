import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from './user.interface';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  contactPhone: string;

  @Prop({ required: true, default: Role.Client })
  role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);
