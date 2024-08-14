import { IsOptional } from 'class-validator';

export class UpdatePhotoDto {
  @IsOptional()
  photo: string;
}
