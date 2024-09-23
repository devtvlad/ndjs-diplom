import { IsNotEmpty, IsString } from 'class-validator';

export class ReadMessagesDto {
  // TODO: validate as Date?
  @IsNotEmpty()
  @IsString()
  createdBefore: string;
}
