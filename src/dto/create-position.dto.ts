import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
