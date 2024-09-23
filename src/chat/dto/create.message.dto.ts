import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  text: ObjectId;
}
