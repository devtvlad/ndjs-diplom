import { IsNotEmpty, IsBoolean } from 'class-validator';

export class SearchSupportRequestsParamsDto {
  @IsNotEmpty()
  limit: number;

  @IsNotEmpty()
  offset: number;

  @IsNotEmpty()
  // TODO: check why isBoolean not working
  // @IsBoolean()
  isActive: boolean;
}
